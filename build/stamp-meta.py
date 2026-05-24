#!/usr/bin/env python3
"""Stamp Open Graph + Twitter Card meta tags into every HTML page."""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

SITE_NAME = "Moddable.Games"
BASE_URL = "https://moddable.games"
DEFAULT_IMAGE = "img/og/default.png"

STATIC_DESCRIPTIONS = {
    "": "Twelve community-built rulebook mods for existing board games, plus three original games designed to be modded from day one.",
    "mods": "Browse 13 community-built rulebook mods for board games you already own.",
    "tools": "Free tools for tabletop gaming — dice rollers, name generators, faction pickers, and more.",
    "games": "Five original games designed to be modded from day one — Nukes, Mongo, Endless Skies, Dungeon Chess, Moddable Chess.",
    "about": "Moddable.Games is an open-source board game modding workshop based in Kuala Lumpur.",
    "about/roadmap": "The 18-month product roadmap for Moddable.Games.",
    "team": "Meet the four-person team behind Moddable.Games.",
    "community": "Join 2,400+ rule-tinkerers, designers and PnP enthusiasts in the Moddable.Games Discord.",
    "submit": "Submit your board game mod to the Moddable.Games library.",
    "news": "News, essays, and updates from the Moddable.Games workshop.",
    "press": "Press kit and media assets for Moddable.Games.",
    "subscribe": "Subscribe to the Moddable.Games newsletter for crowdfunding updates and playtest invites.",
    "tools/ti": "Twilight Imperium tools — faction picker, objective tracker, agenda voter.",
    "tools/talisman": "Talisman: Hexed tools — character lottery, hex board generator, encounter quick-draw.",
    "tools/nukes": "Nukes tools — target picker, fallout tracker, resource converter.",
    "tools/decks": "Card deck builder — design, shuffle, and deal custom card decks for any tabletop game.",
    "tools/chess": "Chess variant loader — load and play from 2000+ documented chess variants.",
    "404": "Page not found — Moddable.Games",
}


def load_json(name):
    path = DATA / f"{name}.json"
    if path.exists():
        return json.loads(path.read_text())
    return []


def build_lookup():
    """Build slug → {description, title} lookup from data files."""
    lookup = {}

    for mod in load_json("mods"):
        slug = mod.get("path", "").strip("/").split("/")[-1]
        if slug:
            lookup[f"mods/{slug}"] = {
                "desc": mod.get("body", ""),
                "title": mod.get("title", ""),
            }

    for article in load_json("news"):
        slug = article.get("slug", "")
        if slug:
            lookup[f"news/{slug}"] = {
                "desc": article.get("excerpt", ""),
                "title": article.get("title", ""),
            }

    for game in load_json("games"):
        slug = game.get("path", "").strip("/").split("/")[-1]
        if slug:
            lookup[f"games/{slug}"] = {
                "desc": game.get("desc", ""),
                "title": game.get("title", ""),
            }

    return lookup


def get_page_key(html_path):
    """Convert file path to page key (e.g. 'mods/talisman-hexed')."""
    rel = html_path.relative_to(ROOT)
    parts = rel.parts

    if rel.name == "404.html":
        return "404"
    if rel.name == "index.html":
        return "/".join(parts[:-1])
    return str(rel).replace(".html", "")


def get_og_type(page_key):
    if page_key.startswith("news/") and page_key != "news":
        return "article"
    return "website"


def get_image_path(page_key):
    if not page_key:
        return DEFAULT_IMAGE
    slug = page_key.replace("/", "-")
    return f"img/og/{slug}.png"


def extract_title(html):
    m = re.search(r"<title>(.*?)</title>", html)
    if m:
        return m.group(1).replace(" — Moddable.Games", "").strip()
    return SITE_NAME


def strip_existing_meta(html):
    """Remove any existing OG/Twitter meta tags."""
    html = re.sub(r'<meta property="og:[^"]*"[^>]*>\n?', "", html)
    html = re.sub(r'<meta name="twitter:[^"]*"[^>]*>\n?', "", html)
    html = re.sub(r'<meta name="description"[^>]*>\n?', "", html)
    return html


def build_meta_block(title, description, url, og_type, image):
    lines = [
        f'<meta name="description" content="{description}">',
        f'<meta property="og:title" content="{title}">',
        f'<meta property="og:description" content="{description}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        f'<meta property="og:image" content="{BASE_URL}/{image}">',
        f'<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
        f'<meta name="twitter:description" content="{description}">',
        f'<meta name="twitter:image" content="{BASE_URL}/{image}">',
    ]
    return "\n".join(lines)


def stamp_file(html_path, lookup):
    html = html_path.read_text()
    page_key = get_page_key(html_path)

    entry = lookup.get(page_key)
    if entry:
        description = entry["desc"]
        title = entry["title"]
    else:
        description = STATIC_DESCRIPTIONS.get(page_key, "")
        title = extract_title(html)

    if not description:
        description = f"{title} — {SITE_NAME}"

    # Escape quotes in description
    description = description.replace('"', "&quot;")
    title = title.replace('"', "&quot;")
    og_type = get_og_type(page_key)
    image = get_image_path(page_key)
    url = f"{BASE_URL}/{page_key}/" if page_key else f"{BASE_URL}/"

    html = strip_existing_meta(html)
    meta_block = build_meta_block(title, description, url, og_type, image)

    # Insert after </title>
    html = html.replace("</title>\n", f"</title>\n{meta_block}\n", 1)

    html_path.write_text(html)
    print(f"  Stamped: {html_path.relative_to(ROOT)}")


def main():
    lookup = build_lookup()
    html_files = sorted(ROOT.glob("**/*.html"))
    skip_dirs = {"build", "data"}
    html_files = [f for f in html_files if not skip_dirs & set(f.relative_to(ROOT).parts)]

    print(f"Found {len(html_files)} HTML files")
    print(f"Data lookup: {len(lookup)} entries from JSON")
    print()

    for f in html_files:
        stamp_file(f, lookup)

    print(f"\nDone — {len(html_files)} files stamped.")


if __name__ == "__main__":
    main()
