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
    # 4 team photos in a row on right
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
    add_text(img, 'MODDABLE.GAMES', 'About', 'The workshop behind the mods')
    save(img, 'img/og/about.png')


def gen_roadmap():
    img = base_image()
    draw = ImageDraw.Draw(img)
    # Timeline: horizontal dots connected by line
    y = 380
    dots = [(700, y), (830, y), (960, y), (1090, y)]
    draw.line([(680, y), (1110, y)], fill=(*GLOW_BLUE, 120), width=2)
    for i, (dx, dy) in enumerate(dots):
        r = 10 if i < 3 else 8
        alpha = 220 if i < 3 else 100
        draw.ellipse([dx-r, dy-r, dx+r, dy+r], fill=(*GLOW_BLUE, alpha))
    # Labels
    labels = ['Launch', 'Engine', 'API', 'Future']
    for i, (dx, dy) in enumerate(dots):
        draw.text((dx - 15, dy + 20), labels[i],
                  fill=(180, 185, 200, 200), font=load_font(11))
    add_text(img, 'MODDABLE.GAMES', 'Roadmap', 'Where we are headed')
    save(img, 'img/og/about-roadmap.png')


def gen_community():
    img = base_image()
    # Hex grid overlay on right
    hex_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hex_layer)
    hex_size = 36
    for row in range(HEIGHT // hex_size + 2):
        for col in range(WIDTH // hex_size + 2):
            hx = 600 + col * hex_size + (hex_size // 2 if row % 2 else 0)
            hy = row * hex_size
            if hx < WIDTH + 50:
                hd.regular_polygon((hx, hy, hex_size // 3), 6,
                                   fill=None, outline=(111, 181, 255, 25))
    img = Image.alpha_composite(img, hex_layer)
    add_text(img, 'DISCORD', 'Join the Table', '2,400+ rule-tinkerers and designers')
    save(img, 'img/og/community.png')


def gen_news():
    img = base_image()
    # 3 news covers as angled cards
    covers = ['img/news/beyond-the-box.jpg', 'img/news/the-ancients.jpg',
              'img/news/making-mods-matter.jpg']
    positions = [(780, 140, -5), (850, 180, 0), (920, 150, 5)]
    for i, (cx, cy, angle) in enumerate(positions):
        path = covers[i]
        if not os.path.exists(path):
            continue
        cover = Image.open(path).convert('RGBA')
        cw, ch = 200, 130
        cover = cover.resize((cw, ch), Image.LANCZOS)
        # Add border
        bordered = Image.new('RGBA', (cw + 8, ch + 8), (255, 255, 255, 40))
        bordered.paste(cover, (4, 4), cover)
        bordered = bordered.rotate(angle, expand=True, fillcolor=(0, 0, 0, 0))
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        layer.paste(bordered, (cx, cy), bordered)
        img = Image.alpha_composite(img, layer)
    add_text(img, 'NEWS', 'From the Table', '12 articles on modding, design and play')
    save(img, 'img/og/news.png')


def gen_games():
    img = base_image()
    # 3 game logos side by side
    logos = ['img/nukes-logo.png', 'img/endless-skies-logo.png', 'img/mongo-logo.png']
    x_start = 680
    for i, path in enumerate(logos):
        if not os.path.exists(path):
            continue
        logo = Image.open(path).convert('RGBA')
        lh = 140
        lw = int(logo.width * lh / logo.height)
        logo = logo.resize((lw, lh), Image.LANCZOS)
        layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
        layer.paste(logo, (x_start + i * 170, 245), logo)
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
    # 3 numbered steps connected by line
    y = 340
    steps = [(780, y), (920, y), (1060, y)]
    draw.line([(780, y), (1060, y)], fill=(*GREEN, 120), width=2)
    for i, (sx, sy) in enumerate(steps):
        draw.ellipse([sx - 20, sy - 20, sx + 20, sy + 20],
                     outline=(*GREEN, 200), width=2)
        draw.text((sx - 5, sy - 8), str(i + 1),
                  fill=(*GREEN, 220), font=load_font(16, True))
    # Labels
    labels = ['Describe', 'Upload', 'Publish']
    for i, (sx, sy) in enumerate(steps):
        draw.text((sx - 20, sy + 30), labels[i],
                  fill=(180, 185, 200, 200), font=load_font(12))
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
