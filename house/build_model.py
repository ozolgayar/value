"""Rebuild geropharm-house.glb with consistent typography and light materials.

Does NOT overwrite public/house/sections.json (card copy lives in the app).
"""
from __future__ import annotations

import io
import json
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "public" / "house"
FONTS = ROOT / "fonts"
OUT.mkdir(parents=True, exist_ok=True)

FONT_REGULAR = FONTS / "Verdana.ttf"
FONT_BOLD = FONTS / "Verdana-Bold.ttf"
for path in (FONT_REGULAR, FONT_BOLD):
    if not path.is_file():
        raise SystemExit(
            f"Missing font: {path}\n"
            "Place Verdana.ttf and Verdana-Bold.ttf in house/fonts/."
        )

# World-space typography: px size = size_m * TEXELS_PER_M (stable across plaques).
TEXELS_PER_M = 320

TYPE = {
    "body": {
        "size_m": 0.078,
        "bold": False,
        "line": 1.28,
        "pad_m": 0.055,
        "align": "left",
    },
    "heading": {
        "size_m": 0.092,
        "bold": True,
        "line": 1.22,
        "pad_m": 0.05,
        "align": "center",
    },
    "metric": {
        "size_m": 0.088,
        "bold": True,
        "line": 1.3,
        "pad_m": 0.06,
        "align": "left",
    },
    "banner": {
        "size_m": 0.08,
        "bold": True,
        "line": 1.15,
        "pad_m": 0.04,
        "align": "center",
    },
    "brand": {
        "size_m": 0.22,
        "bold": True,
        "line": 1.1,
        "pad_m": 0.08,
        "align": "center",
    },
    "column": {
        "size_m": 0.072,
        "bold": False,
        "line": 1.05,
        "pad_m": 0.045,
        "align": "center",
    },
}

# Light materials aligned to reference (photo 2).
palette = {
    "cream": (0.945, 0.90, 0.82),
    "peach": (0.96, 0.74, 0.55),
    "glass": (0.18, 0.78, 0.72),
    "teal": (0.18, 0.62, 0.56),
    "green": (0.22, 0.52, 0.40),
    "metal": (0.72, 0.76, 0.77),
    "base": (0.80, 0.82, 0.86),
    "orange": (0.95, 0.62, 0.38),
}

PLAQUE_BG = "#dff0e8"
PLAQUE_FG = "#1a3540"
BANNER_BG = "#2a9b86"
BANNER_FG = "#ffffff"
CREAM_BG = "#f3ebdc"

sections = [
    {
        "id": "foundation",
        "title": "Фундамент — ценности",
        "items": [
            "Страсть — Мы увлечены работой",
            "Амбициозность — Мы устремлены в будущее",
            "Ответственность — Мы отвечаем за результат",
        ],
    },
    {
        "id": "floor1",
        "title": "1 этаж. Команда и лидерство",
        "items": [
            "Трансформация культуры",
            "Лидерство и карьера",
            "Эффективность и мотивация",
            "Мышление долголетия",
            "Сильный бренд работодателя",
            "СИ: ГЕРОФАРМ — лучший работодатель фармацевтического рынка России",
        ],
    },
    {
        "id": "floor2",
        "title": "2 этаж. Бизнес-процессы и производство",
        "items": [
            "СИ: Развитие биотехнологического производства для увеличения годовой мощности до 2000 кг в год",
            "СИ: Модернизация производства продуктов экстрактов сухих для увеличения годовой мощности производства",
            "СИ: Повышение мощности и эффективности производства ТЛФ до 1 миллиарда таблеток в год",
            "Производственная площадка в Пушкине",
            "Производственная площадка в Оболенске",
            "СИ: Модернизация производства продуктов в шприц-ручках, флаконированных и картриджных форм",
            "СИ: Модернизация производства биотехнологических субстанций",
            "Цель производственных площадок: Обеспечить бездефектурное производство препаратов",
            "СИ: Развитие интегрированного бизнес-планирования",
        ],
    },
    {
        "id": "floor3",
        "title": "3 этаж. Портфель и рынки",
        "items": [
            "СИ: Инновации",
            "СИ: Формирование портфеля продуктами с выручкой до 1 млрд*",
            "СИ: Развитие функции обеспечения доступа на рынок",
            "СИ: Наполнение портфеля биоаналогами, препаратами first-in-class, best-in-class через партнерство",
            "СИ: Лидерство в сегменте метаболическое здоровье",
            "СИ: Обеспечение эффективности продаж продуктов основного портфеля",
            "СИ: Развитие экспорта",
        ],
    },
    {
        "id": "floor4",
        "title": "4 этаж. Финансовые показатели",
        "items": [
            "EBITDA ≥ 35%",
            "Рентабельность по валовой прибыли ≥ 55%",
            "ROA** > 15% (эффективность активов)",
            "ROE*** > 25% (отдача на капитал)",
        ],
    },
    {
        "id": "mission",
        "title": "Миссия компании",
        "items": [
            "Создаем инновации для увеличения продолжительности жизни в России и мире"
        ],
    },
]

g = {
    "asset": {
        "version": "2.0",
        "generator": "Geropharm procedural reconstruction v2",
    },
    "scene": 0,
    "scenes": [{"nodes": [0]}],
    "nodes": [{"name": "House", "children": []}],
    "meshes": [],
    "materials": [],
    "accessors": [],
    "bufferViews": [],
    "images": [],
    "textures": [],
    "samplers": [
        {"magFilter": 9729, "minFilter": 9987, "wrapS": 33071, "wrapT": 33071}
    ],
}
binary = bytearray()
parents: dict[str, int] = {}

for s in sections + [{"id": "environment"}]:
    parents[s["id"]] = len(g["nodes"])
    g["nodes"][0]["children"].append(len(g["nodes"]))
    g["nodes"].append(
        {"name": s["id"], "extras": {"sectionId": s["id"]}, "children": []}
    )


def view(data: bytes, target=None) -> int:
    while len(binary) % 4:
        binary.append(0)
    v = {"buffer": 0, "byteOffset": len(binary), "byteLength": len(data)}
    if target:
        v["target"] = target
    binary.extend(data)
    g["bufferViews"].append(v)
    return len(g["bufferViews"]) - 1


def acc(values, typ: str) -> int:
    flat = [v for row in values for v in row]
    a = {
        "bufferView": view(struct.pack("<" + "f" * len(flat), *flat), 34962),
        "componentType": 5126,
        "count": len(values),
        "type": typ,
    }
    if typ == "VEC3":
        a.update(
            min=[min(r[i] for r in values) for i in range(3)],
            max=[max(r[i] for r in values) for i in range(3)],
        )
    g["accessors"].append(a)
    return len(g["accessors"]) - 1


cache: dict[tuple[str, str], int] = {}


def material(sec: str, kind: str) -> int:
    key = (sec, kind)
    if key in cache:
        return cache[key]
    c = palette[kind]
    m = {
        "name": f"{sec}_{kind}",
        "pbrMetallicRoughness": {
            "baseColorFactor": [*c, 1],
            "metallicFactor": 0.12 if kind == "metal" else 0,
            "roughnessFactor": 0.38 if kind == "glass" else 0.78,
        },
        "emissiveFactor": [0.02, 0.06, 0.05] if kind == "glass" else [0, 0, 0],
        "extras": {"sectionId": sec, "role": kind},
    }
    g["materials"].append(m)
    cache[key] = len(g["materials"]) - 1
    return cache[key]


def mesh(name: str, sec: str, p, n, uv, mat: int) -> None:
    prim = {
        "attributes": {"POSITION": acc(p, "VEC3"), "NORMAL": acc(n, "VEC3")},
        "material": mat,
    }
    if uv:
        prim["attributes"]["TEXCOORD_0"] = acc(uv, "VEC2")
    g["meshes"].append({"name": name, "primitives": [prim]})
    node = {
        "name": name,
        "mesh": len(g["meshes"]) - 1,
        "extras": {"sectionId": sec},
    }
    g["nodes"][parents[sec]]["children"].append(len(g["nodes"]))
    g["nodes"].append(node)


def box(name, sec, x, y, z, w, h, d, kind="cream"):
    corners = [
        (x + a * w / 2, y + b * h / 2, z + c * d / 2)
        for a, b, c in [
            (-1, -1, -1),
            (1, -1, -1),
            (1, 1, -1),
            (-1, 1, -1),
            (-1, -1, 1),
            (1, -1, 1),
            (1, 1, 1),
            (-1, 1, 1),
        ]
    ]
    faces = [
        ((0, 3, 2, 1), (0, 0, -1)),
        ((4, 5, 6, 7), (0, 0, 1)),
        ((0, 4, 7, 3), (-1, 0, 0)),
        ((1, 2, 6, 5), (1, 0, 0)),
        ((3, 7, 6, 2), (0, 1, 0)),
        ((0, 1, 5, 4), (0, -1, 0)),
    ]
    p, n = [], []
    for f, norm in faces:
        for i in [0, 1, 2, 0, 2, 3]:
            p.append(corners[f[i]])
            n.append(norm)
    mesh(name, sec, p, n, None, material(sec, kind))


def font_for(style: str, px: int) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if TYPE[style]["bold"] else FONT_REGULAR
    return ImageFont.truetype(str(path), px)


def wrap_words(draw: ImageDraw.ImageDraw, text: str, font, max_w: float) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        if not para.strip():
            lines.append("")
            continue
        row = ""
        for word in para.split():
            test = (row + " " + word).strip()
            if draw.textlength(test, font=font) > max_w and row:
                lines.append(row)
                row = word
            else:
                row = test
        lines.append(row)
    return lines


def render_horizontal(
    text: str, style: str, w_m: float, h_m: float, bg: str, fg: str
) -> tuple[Image.Image, float, float]:
    """Fixed type size. Grow plaque height if needed; never enlarge short copy."""
    spec = TYPE[style]
    size_px = max(10, int(round(spec["size_m"] * TEXELS_PER_M)))
    pad_px = max(8, int(round(spec["pad_m"] * TEXELS_PER_M)))
    line_h = max(size_px + 2, int(round(size_px * spec["line"])))

    W = max(64, int(round(w_m * TEXELS_PER_M)))
    H = max(48, int(round(h_m * TEXELS_PER_M)))
    font = font_for(style, size_px)
    probe = Image.new("RGB", (8, 8), bg)
    draw = ImageDraw.Draw(probe)
    lines = wrap_words(draw, text, font, W - 2 * pad_px)
    need_h = 2 * pad_px + max(line_h, len(lines) * line_h)
    if need_h > H:
        H = need_h
        h_m = H / TEXELS_PER_M

    im = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(im)
    # Short text stays top-padded / vertically centered within original intent,
    # but does not scale up to fill.
    content_h = len(lines) * line_h
    yy = pad_px if content_h + 2 * pad_px >= H else (H - content_h) / 2
    for line in lines:
        if spec["align"] == "center":
            tw = draw.textlength(line, font=font)
            x = (W - tw) / 2
        else:
            x = pad_px
        draw.text((x, yy), line, font=font, fill=fg)
        yy += line_h
    return im, w_m, h_m


def render_vertical(
    text: str, style: str, w_m: float, h_m: float, bg: str, fg: str
) -> tuple[Image.Image, float, float]:
    """Stack characters top→bottom for column faces (readable in card as normal)."""
    spec = TYPE[style]
    size_px = max(10, int(round(spec["size_m"] * TEXELS_PER_M)))
    pad_px = max(6, int(round(spec["pad_m"] * TEXELS_PER_M)))
    # Slightly tighter than horizontal body; still fixed.
    step = max(size_px, int(round(size_px * 1.08)))
    chars = [c for c in text if c != "\n"]
    # Keep spaces as blank steps for phrase rhythm.
    W = max(48, int(round(w_m * TEXELS_PER_M)))
    H = max(64, int(round(h_m * TEXELS_PER_M)))
    need_h = 2 * pad_px + len(chars) * step
    if need_h > H:
        H = need_h
        h_m = H / TEXELS_PER_M

    font = font_for(style, size_px)
    im = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(im)
    yy = pad_px
    for ch in chars:
        if ch == " ":
            yy += step * 0.55
            continue
        tw = draw.textlength(ch, font=font)
        draw.text(((W - tw) / 2, yy), ch, font=font, fill=fg)
        yy += step
    return im, w_m, h_m


def label(
    name: str,
    sec: str,
    text: str,
    x: float,
    y: float,
    z: float,
    w: float,
    h: float,
    bg: str = PLAQUE_BG,
    fg: str = PLAQUE_FG,
    side: bool = False,
    style: str = "body",
    vertical: bool = False,
):
    if vertical:
        im, w, h = render_vertical(text, style, w, h, bg, fg)
    else:
        im, w, h = render_horizontal(text, style, w, h, bg, fg)

    buf = io.BytesIO()
    im.save(buf, format="PNG")
    g["images"].append(
        {
            "bufferView": view(buf.getvalue()),
            "mimeType": "image/png",
            "name": name,
        }
    )
    g["textures"].append({"source": len(g["images"]) - 1, "sampler": 0})
    g["materials"].append(
        {
            "name": f"{sec}_text_{name}",
            "pbrMetallicRoughness": {
                "baseColorFactor": [1, 1, 1, 1],
                "baseColorTexture": {"index": len(g["textures"]) - 1},
                "metallicFactor": 0,
                "roughnessFactor": 1,
            },
            "doubleSided": True,
            "extras": {"sectionId": sec, "role": "text"},
        }
    )
    pts = [
        (x - w / 2, y - h / 2, z),
        (x + w / 2, y - h / 2, z),
        (x + w / 2, y + h / 2, z),
        (x - w / 2, y + h / 2, z),
    ]
    if side:
        pts = [
            (x, y - h / 2, z + w / 2),
            (x, y - h / 2, z - w / 2),
            (x, y + h / 2, z - w / 2),
            (x, y + h / 2, z + w / 2),
        ]
    uv = [(0, 1), (1, 1), (1, 0), (0, 0)]
    idx = [0, 1, 2, 0, 2, 3]
    mesh(
        name,
        sec,
        [pts[i] for i in idx],
        [(1, 0, 0) if side else (0, 0, 1)] * 6,
        [uv[i] for i in idx],
        len(g["materials"]) - 1,
    )


# Architecture
box("Plaza", "environment", 0, -0.25, 0, 19, 0.35, 11, "base")
box("Paving", "environment", 0, -0.05, 0, 18.8, 0.08, 10.8, "peach")
box("Values plinth", "foundation", 0, 0.45, 0, 15, 0.9, 7.5, "base")
for i, text in enumerate(sections[0]["items"]):
    label(
        f"Value_{i}",
        "foundation",
        text,
        -4.8 + i * 4.8,
        0.45,
        3.76,
        4.55,
        0.65,
        style="heading",
    )

for floor, w, d, cx in [(1, 14, 6.6, 0), (2, 14, 6.5, 0), (3, 10.3, 5.5, -0.5), (4, 7.5, 4.8, 0.2)]:
    sec = f"floor{floor}"
    bottom = 0.95 + (floor - 1) * 2.75
    top = bottom + 2.75
    front = d / 2
    box(f"Slab_{sec}", sec, cx, bottom, 0, w, 0.22, d, "peach")
    box(f"Rear_{sec}", sec, cx, bottom + 1.4, -d / 2 + 0.15, w - 0.3, 2.5, 0.2)
    for xx in [cx - w / 2 + 0.2, cx + w / 2 - 0.2]:
        box(f"Pillar_{sec}", sec, xx, bottom + 1.35, front - 0.2, 0.32, 2.55, 0.32)
    for i in range(max(3, int(w / 1.2))):
        xx = cx - w / 2 + 0.7 + i * 1.15
        if xx > cx + w / 2 - 0.4:
            break
        box(f"Window_{sec}", sec, xx, bottom + 1.35, front - 0.55, 1.05, 2.25, 0.1, "glass")
    for zz in [-1.4, 0, 1.4]:
        box(
            f"Side window_{sec}",
            sec,
            cx + w / 2 - 0.16,
            bottom + 1.35,
            zz,
            0.08,
            2.1,
            1.25,
            "glass",
        )
    box(f"Cornice_{sec}", sec, cx, top - 0.05, 0, w + 0.2, 0.25, d + 0.2, "peach")
    label(
        f"Floor title_{sec}",
        sec,
        sections[floor]["title"],
        cx,
        top - 0.06,
        front + 0.12,
        w - 0.3,
        0.28,
        bg=BANNER_BG,
        fg=BANNER_FG,
        style="banner",
    )
    label(
        f"Side title_{sec}",
        sec,
        sections[floor]["title"],
        cx + w / 2 + 0.115,
        top - 0.06,
        0,
        d - 0.2,
        0.28,
        bg=BANNER_BG,
        fg=BANNER_FG,
        side=True,
        style="banner",
    )

# Floor 1 columns — vertical glyphs on cream plaques
for i, txt in enumerate(sections[1]["items"][:5]):
    x = -1.6 + i * 1.75
    box(f"Column_{i + 1}", "floor1", x, 2.23, 3.42, 0.63, 2.4, 0.65)
    box("Column foot", "floor1", x, 1.15, 3.42, 0.9, 0.25, 0.9)
    label(
        f"Column text_{i + 1}",
        "floor1",
        txt,
        x,
        2.35,
        3.751,
        0.52,
        2.05,
        bg=CREAM_BG,
        style="column",
        vertical=True,
    )
box("Entry canopy", "floor1", -4.4, 3.15, 3.8, 2.6, 0.22, 1.5)
for x in [-5.45, -3.35]:
    box("Entrance pier", "floor1", x, 2, 4.1, 0.28, 2.1, 0.28)
label(
    "Employer",
    "floor1",
    sections[1]["items"][5],
    7.02,
    2.15,
    0,
    5.7,
    1.05,
    side=True,
    style="body",
)

p = sections[2]["items"]
label("Biotech extracts", "floor2", p[0] + "\n\n" + p[1], -5.05, 5.12, 3.29, 3.1, 2.04)
label("Tablets", "floor2", p[2], -1.5, 5.85, 3.3, 3.6, 0.67)
label(
    "Obolensk initiatives",
    "floor2",
    p[5] + "\n\n" + p[6],
    3.65,
    5.15,
    3.29,
    5.75,
    1.6,
)
label("Pushkino", "floor2", p[3], -3.4, 4.05, 3.35, 6.4, 0.36, bg=CREAM_BG, style="heading")
label("Obolensk", "floor2", p[4], 3.4, 4.05, 3.35, 6.4, 0.36, bg=CREAM_BG, style="heading")
label("Shared production goal", "floor2", p[7], 0, 3.79, 3.36, 13.5, 0.36, style="heading")
label("Planning", "floor2", p[8], 7.02, 5.55, 0, 5.5, 0.75, side=True)

box("Conveyor", "floor2", -1.4, 4.55, 2.72, 3, 0.3, 0.7, "teal")
for i in range(15):
    box("Conveyor roller", "floor2", -2.8 + i * 0.2, 4.73, 2.72, 0.09, 0.06, 0.64, "metal")
for i in range(4):
    box("Package", "floor2", -2.6 + i * 0.65, 4.91, 2.73, 0.3, 0.3, 0.3, "peach")
for z in [-1.3, 0, 1.3]:
    box("Process vessel", "floor2", 6.65, 4.75, z, 0.52, 1.2, 0.75, "metal")

texts = [
    sections[3]["items"][0],
    sections[3]["items"][1] + "\n\n" + sections[3]["items"][2],
    *sections[3]["items"][3:],
]
for i, text in enumerate(texts):
    label(f"Portfolio_{i}", "floor3", text, -4.68 + i * 1.68, 7.83, 2.8, 1.52, 2.13)

label(
    "Financial indicators",
    "floor4",
    "\n".join(sections[4]["items"]),
    1.3,
    10.5,
    2.46,
    4.8,
    2.1,
    style="metric",
)
box("Mission roof", "mission", 0.2, 12.06, 0, 8, 0.26, 5.2, "peach")
label(
    "Mission",
    "mission",
    "МИССИЯ КОМПАНИИ\n" + sections[5]["items"][0],
    0.2,
    12.12,
    2.65,
    7.9,
    0.75,
    bg=BANNER_BG,
    fg=BANNER_FG,
    style="heading",
)
for x in [-2.8, 2.7]:
    box("Sign support", "mission", x, 12.8, -0.4, 0.09, 1.2, 0.09, "metal")
box("Roof sign backing", "mission", 0.2, 13.25, -0.36, 7.8, 1.05, 0.18, "cream")
label(
    "Brand",
    "mission",
    "gPh  ГЕРОФАРМ",
    0.2,
    13.25,
    -0.255,
    7.65,
    0.96,
    bg=CREAM_BG,
    fg=PLAQUE_FG,
    style="brand",
)

for x in [-5.8, -3, 1, 3.2]:
    box("Planter", "environment", x, 0.98, 4.35, 0.6, 0.5, 0.6, "peach")
    box("Topiary", "environment", x, 1.7, 4.35, 0.43, 0.95, 0.43, "green")
for z in [-3, -2, -1, 0, 1, 2, 3]:
    box("Shrub", "environment", 8, 0.36, z, 0.75, 0.6, 0.7, "green")
for x in [-7.8, 7.8]:
    for z in [-4.6, 4.6]:
        box("Lamp pole", "environment", x, 1.5, z, 0.065, 3, 0.065, "metal")
        box("Lamp head", "environment", x, 3, z, 0.55, 0.1, 0.16, "metal")
for x in [-5, 4]:
    box("Bench seat", "environment", x, 0.44, 4.95, 1.3, 0.12, 0.35, "teal")
    for dx in [-0.48, 0.48]:
        box("Bench foot", "environment", x + dx, 0.23, 4.95, 0.12, 0.4, 0.3, "green")

g["buffers"] = [{"byteLength": len(binary)}]
raw = json.dumps(g, ensure_ascii=False, separators=(",", ":")).encode()
raw += b" " * ((-len(raw)) % 4)
binary += b"\0" * ((-len(binary)) % 4)
result = (
    b"glTF"
    + struct.pack("<II", 2, 12 + 8 + len(raw) + 8 + len(binary))
    + struct.pack("<II", len(raw), 0x4E4F534A)
    + raw
    + struct.pack("<II", len(binary), 0x004E4942)
    + binary
)
out_glb = OUT / "geropharm-house.glb"
out_glb.write_bytes(result)
print(
    f"Wrote {out_glb} ({len(result)} bytes; {len(g['meshes'])} meshes; "
    f"{len(g['images'])} text textures). sections.json left untouched."
)
