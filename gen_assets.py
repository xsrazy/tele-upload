"""Generate favicon + OG assets for Tele Upload (PIL only)."""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "public")
os.makedirs(OUT, exist_ok=True)

TEAL = (15, 118, 110, 255)
TEAL_DARK = (13, 92, 86, 255)
WHITE = (255, 255, 255, 255)
LIGHT = (204, 251, 241, 255)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()


def rounded_bg(size, radius):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=TEAL)
    return img


def draw_upload(d, cx, top, scale, color):
    """White upload symbol: arrow up + tray, centered at cx."""
    w = 10 * scale  # half width of tray
    d.line([(cx, top + 2 * scale), (cx, top + 26 * scale)], fill=color, width=5 * scale)
    d.line([(cx - 11 * scale, top + 13 * scale), (cx, top + 2 * scale)], fill=color, width=5 * scale)
    d.line([(cx + 11 * scale, top + 13 * scale), (cx, top + 2 * scale)], fill=color, width=5 * scale)
    d.line([(cx - w, top + 34 * scale), (cx - w, top + 42 * scale)], fill=color, width=5 * scale)
    d.line([(cx + w, top + 34 * scale), (cx + w, top + 42 * scale)], fill=color, width=5 * scale)
    d.line([(cx - w, top + 42 * scale), (cx + w, top + 42 * scale)], fill=color, width=5 * scale)


def icon(size):
    img = rounded_bg(size, radius=int(size * 0.22))
    d = ImageDraw.Draw(img)
    scale = size / 64.0
    draw_upload(d, size // 2, int(size * 0.22), max(1, int(round(scale))), WHITE)
    return img


# favicon.png 512, apple-touch-icon.png 180, favicon.ico (48+32)
icon(512).save(os.path.join(OUT, "favicon.png"))
icon(180).save(os.path.join(OUT, "apple-touch-icon.png"))
ico = icon(64)
ico.save(
    os.path.join(OUT, "favicon.ico"),
    format="ICO",
    sizes=[(48, 48), (32, 32), (16, 16)],
)

# og.png 1200x630
W, H = 1200, 630
og = Image.new("RGB", (W, H), TEAL_DARK)
d = ImageDraw.Draw(og)
badge = icon(200)
og.paste(badge, (100, 215), badge)
f_title = font(FONT_BOLD, 92)
f_sub = font(FONT_REG, 40)
d.text((340, 250), "Tele Upload", font=f_title, fill=WHITE)
d.text((340, 370), "Upload file, tersimpan di Telegram.", font=f_sub, fill=LIGHT)
d.text((340, 430), "Maks 20 MB per file.", font=f_sub, fill=LIGHT)
og.save(os.path.join(OUT, "og.png"))

for f in ["favicon.png", "apple-touch-icon.png", "favicon.ico", "og.png"]:
    p = os.path.join(OUT, f)
    print(f, os.path.getsize(p), "bytes")
print("OK")
