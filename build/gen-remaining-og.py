#!/usr/bin/env python3
"""Generate OG images for remaining template pages (hubs, utility, chess)."""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

WIDTH, HEIGHT = 1200, 630
BG = (10, 13, 42)
GLOW_BLUE = (111, 181, 255)
GREEN = (58, 153, 40)
BLUE = (12, 79, 141)


def load_font(size, bold=False):
    paths = [
        '/System/Library/Fonts/Supplemental/Helvetica Neue.ttc',
        '/System/Library/Fonts/Helvetica.ttc',
    ]
    for p in paths:
        try:
            idx = 4 if bold else 0
            return ImageFont.truetype(p, size, index=idx)
        except (OSError, IndexError):
            try:
                return ImageFont.truetype(p, size, index=0)
            except OSError:
                continue
    return ImageFont.load_default()


def base_image(accent_color=GLOW_BLUE, glow_x=850, glow_y=300):
    img = Image.new('RGBA', (WIDTH, HEIGHT), (*BG, 255))
    # Glow
    glow = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [glow_x - 300, glow_y - 300, glow_x + 300, glow_y + 300],
        fill=(*accent_color, 45)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=100))
    img = Image.alpha_composite(img, glow)
    # Logo
    logo_src = Image.open('img/moddable-logo-white.png').convert('RGBA')
    lh = 28
    lw = int(logo_src.width * lh / logo_src.height)
    logo = logo_src.resize((lw, lh), Image.LANCZOS)
    img.paste(logo, (80, 40), logo)
    return img


def add_text(img, eyebrow, title, subtitle='', accent=GLOW_BLUE):
    draw = ImageDraw.Draw(img)
    if eyebrow:
        draw.text((80, 220), eyebrow, fill=(*accent, 255), font=load_font(14, True))
    draw.text((80, 248), title, fill=(255, 255, 255, 255), font=load_font(52, True))
    if subtitle:
        draw.text((80, 320), subtitle, fill=(180, 185, 200, 255), font=load_font(20))
    # Bottom accent line
    draw.line([(80, 560), (240, 560)], fill=(*accent, 200), width=4)
    return img


def save(img, path):
    img.convert('RGB').save(path, 'PNG', optimize=True)
    print(f'  → {path} ({os.path.getsize(path)//1024}KB)')


def gen_about():
    img = base_image()
    # 4 team photos — BIG breakout style
    photos = ['assets/team/mark.png', 'assets/team/kevin.png',
              'assets/team/akmal.png', 'assets/team/iqbal.png']
    x_start = 580
    for i, p in enumerate(photos):
        if not os.path.exists(p):
            continue
        photo = Image.open(p).convert('RGBA')
        pw = 200
        ph = int(photo.height * pw / photo.width)
        photo = photo.resize((pw, ph), Image.LANCZOS)
        visible = int(ph * 0.65)
        photo = photo.crop((0, 0, pw, visible))
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        y_pos = HEIGHT - 50 - visible
        layer.paste(photo, (x_start + i * 160, y_pos), photo)
        img = Image.alpha_composite(img, layer)
    add_text(img, 'MODDABLE.GAMES', 'About', 'The workshop behind the mods')
    save(img, 'img/og/about.png')


def gen_roadmap():
    img = base_image()
    draw = ImageDraw.Draw(img)
    # Bold vertical timeline on right side
    tx = 900
    y_start = 140
    y_end = 520
    # Main vertical line
    draw.line([(tx, y_start), (tx, y_end)], fill=(*GLOW_BLUE, 80), width=3)
    # Milestones
    milestones = [
        ('Q1 2026', 'Site Launch', True),
        ('Q2 2026', 'Online Engine', True),
        ('Q3 2026', 'Public API', False),
        ('Q4 2026', 'Mobile App', False),
    ]
    spacing = (y_end - y_start) // (len(milestones) - 1)
    for i, (date, label, done) in enumerate(milestones):
        my = y_start + i * spacing
        # Dot
        r = 10
        if done:
            draw.ellipse([tx - r, my - r, tx + r, my + r], fill=(*GLOW_BLUE, 220))
        else:
            draw.ellipse([tx - r, my - r, tx + r, my + r],
                         outline=(*GLOW_BLUE, 150), width=2)
        # Date left of line
        draw.text((tx - 120, my - 8), date,
                  fill=(*GLOW_BLUE, 180), font=load_font(12, True))
        # Label right of line
        draw.text((tx + 24, my - 8), label,
                  fill=(220, 225, 235, 220 if done else 120), font=load_font(15, done))
    add_text(img, 'MODDABLE.GAMES', 'Roadmap', 'Where we are headed')
    save(img, 'img/og/about-roadmap.png')


def gen_community():
    img = base_image()
    # Prominent hex grid covering right 60% with stronger opacity
    hex_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hex_layer)
    hex_size = 44
    for row in range(HEIGHT // hex_size + 2):
        for col in range(20):
            hx = 500 + col * hex_size + (hex_size // 2 if row % 2 else 0)
            hy = row * hex_size
            # Fade opacity from left to right
            t = min(1.0, (hx - 500) / 500)
            alpha = int(20 + 50 * t)
            hd.regular_polygon((hx, hy, hex_size // 3), 6,
                               fill=None, outline=(111, 181, 255, alpha))
    img = Image.alpha_composite(img, hex_layer)
    # Large "2.4K" stat on right
    draw = ImageDraw.Draw(img)
    draw.text((820, 260), '2.4K', fill=(111, 181, 255, 60), font=load_font(140, True))
    draw.text((820, 410), 'MEMBERS', fill=(111, 181, 255, 40), font=load_font(20, True))
    add_text(img, 'DISCORD', 'Join the Table', '2,400+ rule-tinkerers and designers')
    save(img, 'img/og/community.png')


def gen_news():
    img = base_image()
    # 3 news covers as stacked cards, vertically centred on right
    covers = ['img/news/beyond-the-box.jpg', 'img/news/the-ancients.jpg',
              'img/news/making-mods-matter.jpg']
    positions = [(700, 220, -4), (800, 260, 0), (900, 240, 4)]
    for i, (cx, cy, angle) in enumerate(positions):
        path = covers[i]
        if not os.path.exists(path):
            continue
        cover = Image.open(path).convert('RGBA')
        cw, ch = 240, 160
        cover = cover.resize((cw, ch), Image.LANCZOS)
        # Add rounded border
        bordered = Image.new('RGBA', (cw + 12, ch + 12), (255, 255, 255, 50))
        bordered.paste(cover, (6, 6), cover)
        bordered = bordered.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        layer.paste(bordered, (cx, cy), bordered)
        img = Image.alpha_composite(img, layer)
    add_text(img, 'NEWS', 'From the Table', '12 articles on modding, design and play')
    save(img, 'img/og/news.png')


def gen_games():
    img = base_image()
    # 3 game logos — centred in right half with equal margins
    logos = ['img/nukes-logo.png', 'img/endless-skies-logo.png', 'img/mongo-logo.png']
    logo_size = 140
    gap = 20
    total_w = logo_size * 3 + gap * 2
    # Right zone: from 560 to 1120 (equal 80px margin on right as left text has)
    zone_left = 560
    zone_right = WIDTH - 80
    zone_center = (zone_left + zone_right) // 2
    x_start = zone_center - total_w // 2
    for i, path in enumerate(logos):
        if not os.path.exists(path):
            continue
        logo = Image.open(path).convert('RGBA')
        lh = logo_size
        lw = int(logo.width * lh / logo.height)
        logo = logo.resize((lw, lh), Image.LANCZOS)
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        lx = x_start + i * (logo_size + gap) + (logo_size - lw) // 2
        ly = (HEIGHT - lh) // 2
        layer.paste(logo, (lx, ly), logo)
        img = Image.alpha_composite(img, layer)
    add_text(img, 'ORIGINALS', 'Our Games', '3 games designed to be modded')
    save(img, 'img/og/games.png')


def gen_press():
    img = base_image()
    # Large logo centred-right
    logo_src = Image.open('img/moddable-logo-white.png').convert('RGBA')
    lh = 80
    lw = int(logo_src.width * lh / logo_src.height)
    logo = logo_src.resize((lw, lh), Image.LANCZOS)
    layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    layer.paste(logo, (780, 275), logo)
    img = Image.alpha_composite(img, layer)
    add_text(img, 'RESOURCES', 'Press Kit', 'Logos · Screenshots · Brand guidelines')
    save(img, 'img/og/press.png')


def gen_submit():
    img = base_image(accent_color=GREEN)
    draw = ImageDraw.Draw(img)
    # 3 bold vertical steps on right side
    tx = 900
    y_start = 180
    y_end = 480
    spacing = (y_end - y_start) // 2
    # Vertical line
    draw.line([(tx, y_start), (tx, y_end)], fill=(*GREEN, 80), width=3)
    steps = [('1', 'Describe your mod'), ('2', 'Upload the rules'), ('3', 'Publish & share')]
    for i, (num, label) in enumerate(steps):
        sy = y_start + i * spacing
        r = 18
        draw.ellipse([tx - r, sy - r, tx + r, sy + r], fill=(*GREEN, 200))
        draw.text((tx - 6, sy - 10), num, fill=(255, 255, 255, 255), font=load_font(18, True))
        draw.text((tx + 32, sy - 9), label,
                  fill=(220, 225, 235, 220), font=load_font(16))
    add_text(img, 'COMMUNITY', 'Submit a Mod', 'Share your rules with the table', accent=GREEN)
    save(img, 'img/og/submit.png')


def gen_subscribe():
    img = base_image()
    draw = ImageDraw.Draw(img)
    # Envelope icon on right
    ex, ey = 920, 310
    # Envelope body
    draw.rounded_rectangle([ex - 60, ey - 35, ex + 60, ey + 35],
                           radius=6, outline=(*GLOW_BLUE, 180), width=2)
    # Flap
    draw.line([(ex - 60, ey - 35), (ex, ey + 5), (ex + 60, ey - 35)],
              fill=(*GLOW_BLUE, 150), width=2)
    add_text(img, 'NEWSLETTER', 'Stay in the Loop', 'Updates on mods, tools and releases')
    save(img, 'img/og/subscribe.png')


def gen_team():
    img = base_image()
    # 4 team photos — same as about but different title
    photos = ['assets/team/mark.png', 'assets/team/kevin.png',
              'assets/team/akmal.png', 'assets/team/iqbal.png']
    x_start = 640
    for i, p in enumerate(photos):
        if not os.path.exists(p):
            continue
        photo = Image.open(p).convert('RGBA')
        pw = 120
        ph = int(photo.height * pw / photo.width)
        photo = photo.resize((pw, ph), Image.LANCZOS)
        visible = int(ph * 0.65)
        photo = photo.crop((0, 0, pw, visible))
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        y_pos = HEIGHT - 50 - visible
        layer.paste(photo, (x_start + i * 135, y_pos), photo)
        img = Image.alpha_composite(img, layer)
    add_text(img, 'MODDABLE.GAMES', 'The Team', '4 humans making games moddable')
    save(img, 'img/og/team.png')


def gen_chess():
    img = base_image(accent_color=BLUE)
    draw = ImageDraw.Draw(img)
    # 8x8 chess board on right
    board_x, board_y = 750, 160
    sq = 40
    light = (45, 55, 90, 200)
    dark = (20, 28, 55, 200)
    board_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    bd = ImageDraw.Draw(board_layer)
    for row in range(8):
        for col in range(8):
            x1 = board_x + col * sq
            y1 = board_y + row * sq
            color = light if (row + col) % 2 == 0 else dark
            bd.rectangle([x1, y1, x1 + sq, y1 + sq], fill=color)
    # Round the board with mask
    mask = Image.new('L', (WIDTH, HEIGHT), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [board_x, board_y, board_x + 8*sq, board_y + 8*sq],
        radius=12, fill=255
    )
    board_layer.putalpha(mask)
    img = Image.alpha_composite(img, board_layer)
    add_text(img, 'PLAY ONLINE', 'Moddable Chess', '39 playable variants', accent=BLUE)
    save(img, 'img/og/games-moddable-chess.png')


# Generate all
print('Generating remaining OG images...')
gen_about()
gen_roadmap()
gen_community()
gen_news()
gen_games()
gen_press()
gen_submit()
gen_subscribe()
gen_team()
gen_chess()
print('Done.')
