#!/usr/bin/env python3
"""
build-preview.py
Regenerates moddable-preview.html from all source files.

Usage:
    python3 build-preview.py

Output:
    moddable-preview.html  — self-contained single-file preview with
                             client-side router and page-switcher chrome.
                             Open directly in any browser, no server needed.
"""

import re
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent

# ── Page registry ─────────────────────────────────────────────────────────────
# Order determines the sequence in the preview bar.
# (page_id, filename, nav_section, bar_label)
PAGES_CONFIG = [
    ("index",          "index.html",          "Mods",  "Home"),
    ("mods",           "mods.html",           "Mods",  "Mods index"),
    ("mod-detail",     "mod-detail.html",     "Mods",  "Mod detail"),
    ("game-detail",    "game-detail.html",    "Games", "Endless Skies"),
    ("game-mongo",     "game-mongo.html",     "Games", "Mongo"),
    ("game-nukes",     "game-nukes.html",     "Games", "Nukes"),
    ("news",           "news.html",           "News",  "News index"),
    ("news-post",      "news-post.html",      "News",  "News post"),
    ("tools",          "tools.html",          "Tools", "Tools"),
    ("tools-ti",       "tools-ti.html",       "Tools", "TI tools"),
    ("tools-talisman", "tools-talisman.html", "Tools", "Talisman tools"),
    ("tools-nukes",    "tools-nukes.html",    "Tools", "Nukes tools"),
    ("submit",         "submit.html",         "Mods",  "Submit a mod"),
    ("about",          "about.html",          "About", "About"),
    ("team",           "team.html",           "About", "Team"),
    ("community",      "community.html",      "About", "Community"),
]

NAV_GROUPS = {
    "Mods":  ["index", "mods", "mod-detail", "submit"],
    "Games": ["game-detail", "game-mongo", "game-nukes"],
    "News":  ["news", "news-post"],
    "Tools": ["tools", "tools-ti", "tools-talisman", "tools-nukes"],
    "About": ["about", "team", "community"],
}

PAGE_ORDER = [p[0] for p in PAGES_CONFIG]


# ── Helpers ───────────────────────────────────────────────────────────────────

def strip_shell_calls(js: str) -> str:
    """Remove lines the preview shell already handles (navbar + footer renders)."""
    out = []
    for line in js.split("\n"):
        s = line.strip()
        if re.search(r"getElementById\('nav-root'\)\.appendChild\(navbar\(", s):
            continue
        if re.search(r"getElementById\('footer-root'\)\.appendChild\(footer\(", s):
            continue
        out.append(line)
    return "\n".join(out)


def extract_page(fname: str, nav: str, label: str) -> dict:
    html = (ROOT / fname).read_text(encoding="utf-8")

    # Isolate <body> content
    body = re.search(r"<body>(.*)</body>", html, re.DOTALL).group(1).strip()

    # Strip boilerplate the shell provides
    body = re.sub(r'<div id="nav-root"></div>\s*', "", body)
    body = re.sub(r'<div id="footer-root"></div>\s*', "", body)
    body = re.sub(r'<script src="_mg\.js"></script>\s*', "", body)

    # Extract page-specific <style>
    style_match = re.search(r"<style>(.*?)</style>", html, re.DOTALL)
    page_style = style_match.group(1).strip() if style_match else ""

    # Split HTML from inline scripts
    scripts = re.findall(r"<script>(.*?)</script>", body, re.DOTALL)
    page_html = re.sub(r"<script>.*?</script>", "", body, flags=re.DOTALL).strip()
    page_js = strip_shell_calls("\n".join(scripts).strip())

    return {
        "label": label,
        "nav": nav,
        "style": page_style,
        "html": page_html,
        "js": page_js,
    }


def build_registry(pages: dict) -> str:
    lines = ["const PAGES = {"]
    for pid in PAGE_ORDER:
        p = pages[pid]
        # Escape characters that would break a JS template literal
        html_safe = (
            p["html"]
            .replace("\\", "\\\\")
            .replace("`", "\\`")
            .replace("${", "\\${")
        )
        lines += [
            f"  {json.dumps(pid)}: {{",
            f"    label: {json.dumps(p['label'])},",
            f"    nav:   {json.dumps(p['nav'])},",
            f"    style: {json.dumps(p['style'])},",
            f"    html: `{html_safe}`,",
            f"    init(container) {{",
            f"      {p['js']}",
            f"    }},",
            f"  }},",
        ]
    lines.append("};")
    return "\n".join(lines)


def build_html(mg_js: str, mg_css: str, registry_js: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moddable.Games — Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&family=Press+Start+2P&family=JetBrains+Mono:wght@400;500;600&display=swap">
<style>
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ height: 100%; overflow: hidden; background: #1a1a1a; font-family: system-ui, sans-serif; }}
#preview-shell {{ display: flex; flex-direction: column; height: 100vh; }}
#preview-bar {{ flex: none; height: 44px; background: #111; border-bottom: 1px solid #2a2a2a; display: flex; align-items: center; }}
#preview-bar-brand {{ display: flex; align-items: center; gap: 8px; padding: 0 14px; border-right: 1px solid #2a2a2a; height: 100%; flex: none; }}
#preview-bar-brand span {{ font-size: 11px; font-weight: 600; color: #666; letter-spacing: 0.5px; text-transform: uppercase; }}
#preview-bar-pages {{ display: flex; align-items: center; overflow-x: auto; flex: 1; scrollbar-width: none; padding: 0 6px; gap: 1px; }}
#preview-bar-pages::-webkit-scrollbar {{ display: none; }}
.pbtn {{ flex: none; height: 28px; padding: 0 10px; border-radius: 5px; border: none; background: transparent; color: #555; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 100ms; }}
.pbtn:hover {{ background: #222; color: #bbb; }}
.pbtn.active {{ background: #2a2a2a; color: #fff; }}
#preview-bar-back {{ flex: none; height: 28px; padding: 0 12px; margin-right: 8px; border-radius: 5px; border: 1px solid #333; background: transparent; color: #666; font-size: 12px; cursor: pointer; white-space: nowrap; display: none; }}
#preview-bar-back:hover {{ color: #fff; border-color: #555; }}
#preview-viewport {{ flex: 1; overflow: hidden; }}
#preview-frame {{ width: 100%; height: 100%; overflow-y: auto; overflow-x: hidden; background: #000; }}
#page-style {{}}
{mg_css}
</style>
</head>
<body>
<div id="preview-shell">
  <div id="preview-bar">
    <div id="preview-bar-brand"><div id="brand-cube"></div><span>Preview</span></div>
    <div id="preview-bar-pages"></div>
    <button id="preview-bar-back">↑ Back</button>
  </div>
  <div id="preview-viewport">
    <div id="preview-frame">
      <div id="nav-root"></div>
      <div id="page-root"></div>
      <div id="footer-root"></div>
    </div>
  </div>
</div>
<script>{mg_js}</script>
<script>
const NAV_GROUPS = {json.dumps(NAV_GROUPS)};
const PAGE_ORDER = {json.dumps(PAGE_ORDER)};
{registry_js}
</script>
<script>
(function() {{
  let history2 = ['index'];
  const barPages  = document.getElementById('preview-bar-pages');
  const backBtn   = document.getElementById('preview-bar-back');
  const frame     = document.getElementById('preview-frame');
  const navRoot   = document.getElementById('nav-root');
  const pageRoot  = document.getElementById('page-root');
  const footerRoot = document.getElementById('footer-root');

  document.getElementById('brand-cube').appendChild(MG.cubeSVG(20));

  let prevNav = null;
  PAGE_ORDER.forEach(pid => {{
    const p = PAGES[pid];
    const b = document.createElement('button');
    b.className = 'pbtn';
    if (prevNav && p.nav !== prevNav) b.style.marginLeft = '8px';
    b.setAttribute('data-pid', pid);
    b.textContent = p.label;
    b.addEventListener('click', () => navigateTo(pid));
    barPages.appendChild(b);
    prevNav = p.nav;
  }});

  backBtn.addEventListener('click', () => {{
    if (history2.length > 1) {{ history2.pop(); navigateTo(history2[history2.length - 1], true); }}
  }});

  function interceptLinks(root) {{
    root.querySelectorAll('a[href]').forEach(a => {{
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;
      const pid = href.replace('.html', '').replace(/^\\.\\//, '');
      if (PAGES[pid]) a.addEventListener('click', e => {{ e.preventDefault(); navigateTo(pid); }});
    }});
  }}

  function navigateTo(pid, isBack) {{
    if (!PAGES[pid]) return;
    if (!isBack) history2.push(pid);
    const p = PAGES[pid];

    let styleEl = document.getElementById('page-style');
    if (!styleEl) {{ styleEl = document.createElement('style'); styleEl.id = 'page-style'; document.head.appendChild(styleEl); }}
    styleEl.textContent = p.style || '';

    navRoot.innerHTML = '';
    navRoot.appendChild(MG.navbar(p.nav));

    pageRoot.innerHTML = p.html;

    footerRoot.innerHTML = '';
    footerRoot.appendChild(MG.footer());

    interceptLinks(navRoot);
    interceptLinks(pageRoot);
    interceptLinks(footerRoot);

    try {{
      p.init(pageRoot);
      setTimeout(() => {{
        interceptLinks(navRoot);
        interceptLinks(pageRoot);
        interceptLinks(footerRoot);
      }}, 60);
    }} catch (e) {{
      console.error('Page init error for', pid, ':', e);
    }}

    document.querySelectorAll('.pbtn').forEach(b =>
      b.classList.toggle('active', b.getAttribute('data-pid') === pid)
    );
    backBtn.style.display = history2.length > 1 ? 'block' : 'none';
    frame.scrollTop = 0;
  }}

  navigateTo('index');
}})();
</script>
</body>
</html>"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Building moddable-preview.html...")

    mg_js  = (ROOT / "_mg.js").read_text(encoding="utf-8")
    mg_css = (ROOT / "_mg.css").read_text(encoding="utf-8")

    pages = {}
    for pid, fname, nav, label in PAGES_CONFIG:
        path = ROOT / fname
        if not path.exists():
            print(f"  WARNING: {fname} not found, skipping")
            continue
        pages[pid] = extract_page(fname, nav, label)
        print(f"  ✓  {fname}")

    registry_js = build_registry(pages)
    output = build_html(mg_js, mg_css, registry_js)

    out_path = ROOT / "moddable-preview.html"
    out_path.write_text(output, encoding="utf-8")

    size_kb = len(output.encode()) // 1024
    print(f"\n✓  Written: moddable-preview.html ({size_kb} KB)")

    # Optional: syntax-check the router block if node is available
    try:
        router_start = output.rfind("<script>\n(function()")
        router_end   = output.rfind("</script>")
        router = output[router_start + 8 : router_end]
        r = subprocess.run(
            ["node", "--input-type=module", "-e", f"new Function({json.dumps(router)})"],
            capture_output=True, text=True, timeout=10,
        )
        if r.returncode == 0:
            print("✓  Router JS syntax: OK")
        else:
            print(f"✗  Router JS syntax error:\n{r.stderr[:400]}")
            sys.exit(1)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print("   (node not available — skipping syntax check)")


if __name__ == "__main__":
    main()
