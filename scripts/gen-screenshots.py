import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))
os.makedirs(OUT, exist_ok=True)

BG = (15, 15, 17)
SURFACE = (30, 30, 34)
BORDER = (48, 48, 54)
BRAND = (24, 226, 153)
BRAND_DEEP = (15, 166, 110)
TEXT = (235, 235, 238)
MUTED = (150, 150, 158)
DANGER = (239, 68, 68)
WARN = (245, 158, 11)
BLUE = (59, 130, 246)
PURPLE = (167, 139, 250)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/SegoeUI%s.ttf" % ("-Bold" if bold else ""),
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def txt(draw, xy, s, size, fill, bold=False):
    draw.text(xy, s, font=font(size, bold), fill=fill)


def header(d, w, title):
    txt(d, (24, 22), "TaskFlow", 22, BRAND, True)
    txt(d, (w - 150, 28), title, 15, MUTED)


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_dashboard(w=1200, h=800):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    header(d, w, "Dashboard")
    metrics = [("Due Today", "3"), ("Overdue", "1"), ("Completed", "5"), ("Active", "9")]
    mx, my, mw, mh = 24, 70, 278, 90
    for i, (label, val) in enumerate(metrics):
        x = mx + i * (mw + 12)
        rounded_rect(d, (x, my, x + mw, my + mh), 12, fill=SURFACE, outline=BORDER)
        txt(d, (x + 18, my + 16), label, 13, MUTED)
        txt(d, (x + 18, my + 40), val, 30, TEXT, True)
    cx, cy, cw, ch = 24, 190, 560, 250
    rounded_rect(d, (cx, cy, cx + cw, cy + ch), 12, fill=SURFACE, outline=BORDER)
    txt(d, (cx + 18, cy + 14), "Completion Trend", 15, TEXT, True)
    pts = [(cx + 40 + i * 34, cy + 210 - (10 + (i * 7) % 60)) for i in range(15)]
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=BRAND, width=3)
    for p in pts:
        d.ellipse([p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3], fill=BRAND)
    cy2 = 460
    rounded_rect(d, (cx, cy2, cx + cw, cy2 + ch), 12, fill=SURFACE, outline=BORDER)
    txt(d, (cx + 18, cy2 + 14), "Weekly Velocity", 15, TEXT, True)
    bars = [20, 45, 30, 60, 35, 50, 40, 70]
    bw = 50
    base = cy2 + 215
    for i, b in enumerate(bars):
        x = cx + 30 + i * (bw + 12)
        rounded_rect(d, (x, base - b, x + bw, base), 6, fill=BLUE)
    rx, ry, rw, rh = 612, 190, 564, 250
    rounded_rect(d, (rx, ry, rx + rw, ry + rh), 12, fill=SURFACE, outline=BORDER)
    txt(d, (rx + 18, ry + 14), "Priority Distribution", 15, TEXT, True)
    d.ellipse([rx + 30, ry + 50, rx + 190, ry + 210], outline=BORDER)
    d.pieslice([rx + 30, ry + 50, rx + 190, ry + 210], 0, 120, fill=DANGER)
    d.pieslice([rx + 30, ry + 50, rx + 190, ry + 210], 120, 230, fill=WARN)
    d.pieslice([rx + 30, ry + 50, rx + 190, ry + 210], 230, 360, fill=BLUE)
    txt(d, (rx + 230, ry + 60), "High", 14, DANGER)
    txt(d, (rx + 230, ry + 90), "Medium", 14, WARN)
    txt(d, (rx + 230, ry + 120), "Low", 14, BLUE)
    rounded_rect(d, (rx, 460, rx + rw, 460 + 250), 12, fill=SURFACE, outline=BORDER)
    txt(d, (rx + 18, 474), "Category Breakdown", 15, TEXT, True)
    cats = [("Work", 6, BRAND), ("Personal", 4, BLUE), ("Urgent", 2, DANGER), ("Ideas", 1, WARN)]
    y = 510
    for name, cnt, col in cats:
        rounded_rect(d, (rx + 18, y, rx + 18 + 14, y + 14), 4, fill=col)
        txt(d, (rx + 42, y - 2), name, 14, TEXT)
        txt(d, (rx + rw - 50, y - 2), str(cnt), 14, MUTED, True)
        y += 42
    uy = 730
    rounded_rect(d, (24, uy, w - 24, uy + 60), 12, fill=SURFACE, outline=BORDER)
    txt(d, (44, uy + 20), "Upcoming: Finish Q3 report  ·  Call dentist  ·  Review PR", 15, TEXT)
    img.save(os.path.join(OUT, "dashboard-screenshot.png"))


def make_tasks(w=1200, h=800):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    header(d, w, "Tasks")
    cols = [("Checkbox", 24), ("Title", 120), ("Status", 600), ("Priority", 740), ("Due", 900)]
    hy = 80
    for name, x in cols:
        txt(d, (x, hy), name, 13, MUTED, True)
    rows = [
        ("Finish Q3 report", "Todo", "high", "Today", DANGER),
        ("Call dentist", "In Progress", "medium", "Tomorrow", WARN),
        ("Review pull request", "Todo", "low", "Fri", BLUE),
        ("Plan team offsite", "In Progress", "high", "Mon", DANGER),
        ("Buy groceries", "Todo", "medium", "Sun", WARN),
        ("Renew domain", "Done", "low", "-", MUTED),
    ]
    ry = 110
    for i, (title, status, prio, due, col) in enumerate(rows):
        y0, y1 = ry + i * 64, ry + i * 64 + 56
        rounded_rect(d, (24, y0, w - 24, y1), 10, fill=SURFACE, outline=BORDER)
        d.ellipse([36, y0 + 18, 52, y0 + 34], outline=col, width=2)
        txt(d, (120, y0 + 18), title, 16, TEXT)
        txt(d, (600, y0 + 18), status, 14, MUTED)
        rounded_rect(d, [740, y0 + 16, 810, y0 + 38], 10, fill=col)
        txt(d, (755, y0 + 19), prio, 13, (10, 10, 10), True)
        txt(d, (900, y0 + 18), due, 14, MUTED)
    img.save(os.path.join(OUT, "tasks-list.png"))


def make_categories(w=1200, h=800):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    header(d, w, "Categories")
    cats = [
        ("Work", "12 tasks", BRAND),
        ("Personal", "8 tasks", BLUE),
        ("Urgent", "3 tasks", DANGER),
        ("Health", "5 tasks", WARN),
        ("Ideas", "2 tasks", PURPLE),
        ("Finance", "4 tasks", BRAND_DEEP),
    ]
    ry = 90
    for i, (name, count, col) in enumerate(cats):
        y0, y1 = ry + i * 70, ry + i * 70 + 58
        rounded_rect(d, (24, y0, w - 24, y1), 10, fill=SURFACE, outline=BORDER)
        d.ellipse([40, y0 + 22, 56, y0 + 38], fill=col)
        txt(d, (76, y0 + 18), name, 17, TEXT, True)
        txt(d, (76, y0 + 40), count, 13, MUTED)
    img.save(os.path.join(OUT, "categories.png"))


def make_og(w=1200, h=630):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    d.ellipse([w - 500, -250, w + 100, 350], fill=(10, 40, 30))
    txt(d, (80, 180), "TaskFlow", 64, BRAND, True)
    txt(d, (80, 270), "Capture. Organize. Focus.", 34, TEXT, True)
    txt(d, (80, 330), "The task manager that gets out of your way.", 22, MUTED)
    rounded_rect(d, [80, 430, 300, 490], 14, fill=BRAND)
    txt(d, (120, 446), "Get started", 20, (10, 10, 10), True)
    img.save(os.path.join(OUT, "og-image.png"))


make_dashboard()
make_tasks()
make_categories()
make_og()
print("Generated: dashboard-screenshot.png, tasks-list.png, categories.png, og-image.png")
