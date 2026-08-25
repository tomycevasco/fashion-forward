#!/usr/bin/env python3
"""
Fashion Forward — generador de catalogo.

Lee el catalogo crudo (CATALOGO_FINAL/catalogo.json + /imagenes) y produce:
  1. /assets/data/products.json   -> catalogo normalizado que consume el sitio
  2. /assets/img/{marca}/*.jpeg   -> imagenes copiadas y renombradas en minuscula
  3. /{marca}/{categoria}/index.html -> una carpeta real por categoria (Netlify friendly)

Uso:
    python3 _tools/build_catalog.py                    # busca el .zip mas nuevo de la carpeta
    python3 _tools/build_catalog.py CATALOGO_NUEVO.zip # o le pasas el zip
    python3 _tools/build_catalog.py carpeta/           # o una carpeta ya descomprimida

SUPUESTOS TOMADOS (documentados a proposito):
  - Las categorias crudas del JSON vienen sucias / con typos (SHOOSE, WALLET_GREY,
    T/SHIRT, WHITE HANDBAG). Se agrupan y traducen via CATEGORY_MAP.
  - Precio "$225.000" -> 225000 (ARS). El punto es separador de miles.
  - Talle "xs/s/m/l" -> ["XS","S","M","L"]; "43/43,5/44" -> ["43","43,5","44"].
  - Cada producto tiene 1 sola imagen y 1 solo color en el origen.
  - stock = true para todos (el origen no trae stock).
  - Productos con mismo codigo + misma imagen se deduplican (queda el primero).
"""
import glob, json, os, re, shutil, sys, tempfile, unicodedata, zipfile
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def resolver_fuente(arg):
    """Acepta un .zip, una carpeta, o nada (busca el zip mas nuevo del proyecto).
    Si es un zip lo descomprime en una carpeta temporal que se borra sola."""
    if not arg:
        zips = sorted(glob.glob(os.path.join(ROOT, "*.zip")), key=os.path.getmtime, reverse=True)
        if not zips:
            sys.exit("No encontre ningun .zip en la carpeta del proyecto. Pasame la ruta como argumento.")
        arg = zips[0]
        print("Usando el zip mas nuevo: %s" % os.path.basename(arg))

    arg = os.path.abspath(arg)
    if os.path.isdir(arg):
        return arg if os.path.isfile(os.path.join(arg, "catalogo.json")) else _buscar_catalogo(arg)

    if zipfile.is_zipfile(arg):
        tmp = tempfile.mkdtemp(prefix="ff_catalogo_")
        with zipfile.ZipFile(arg) as z:
            # proteccion basica contra rutas maliciosas dentro del zip
            for m in z.namelist():
                if m.startswith("/") or ".." in m.split("/"):
                    sys.exit("El zip tiene rutas sospechosas (%s). Abortado." % m)
            z.extractall(tmp)
        return _buscar_catalogo(tmp)

    sys.exit("No se que hacer con: %s" % arg)


def _buscar_catalogo(base):
    for root, _dirs, files in os.walk(base):
        if "catalogo.json" in files:
            return root
    sys.exit("No encontre catalogo.json dentro de %s" % base)


SRC = resolver_fuente(sys.argv[1] if len(sys.argv) > 1 else None)

# marca cruda -> (slug, nombre visible)
BRANDS = OrderedDict([
    ("FURLA",  ("furla",  "Furla")),
    ("BALLY",  ("bally",  "Bally")),
    ("LIU JO", ("liujo",  "Liu Jo")),
])

# seccion cruda -> nombre visible de la seccion (agrupador del nav)
SECTION_MAP = {
    "CARTERAS":  "Carteras y bolsos",
    "ROPA":      "Ropa",
    "ZAPATOS":   "Calzado",
    "ARTICULOS": "Accesorios",
}

# categoria cruda -> (slug, nombre plural, nombre singular)
CATEGORY_MAP = {
    # --- carteras / marroquineria ---
    "BAG":              ("bolsos",     "Bolsos",      "Bolso"),
    "LEATHER BAG":      ("bolsos",     "Bolsos",      "Bolso de cuero"),
    "LEATHE BAG":       ("bolsos",     "Bolsos",      "Bolso de cuero"),
    "HOBO BAG":         ("bolsos",     "Bolsos",      "Bolso hobo"),
    "HANDBAG":          ("carteras",   "Carteras",    "Cartera"),
    "WHITE HANDBAG":    ("carteras",   "Carteras",    "Cartera"),
    "SMALL HAND":       ("carteras",   "Carteras",    "Cartera de mano"),
    "CROSS OVER":       ("bandoleras", "Bandoleras",  "Bandolera"),
    "COSS OVER":        ("bandoleras", "Bandoleras",  "Bandolera"),
    "WAIST PACK":       ("bandoleras", "Bandoleras",  "Riñonera"),
    "WALLET":           ("billeteras", "Billeteras",  "Billetera"),
    "WALLET_GREY":      ("billeteras", "Billeteras",  "Billetera"),
    "WALLET_BLACK_50":  ("billeteras", "Billeteras",  "Billetera"),
    "PORTOFOLIO":       ("billeteras", "Billeteras",  "Portafolio"),
    "CASE":             ("billeteras", "Billeteras",  "Estuche"),
    "BACK PACK":        ("mochilas",   "Mochilas",    "Mochila"),
    # --- ropa ---
    "DRESS":            ("vestidos",   "Vestidos",    "Vestido"),
    "SWEATERDRESS":     ("vestidos",   "Vestidos",    "Vestido sweater"),
    "JACKET":           ("camperas",   "Camperas",    "Campera"),
    "PADDED JACKET":    ("camperas",   "Camperas",    "Campera acolchada"),
    "DOWN JACKET":      ("camperas",   "Camperas",    "Campera puffer"),
    "DRESS JACKET":     ("camperas",   "Camperas",    "Campera de vestir"),
    "SWEATER":          ("sweaters",   "Sweaters",    "Sweater"),
    "SWEATSHIRT":       ("sweaters",   "Sweaters",    "Buzo"),
    "SHIRT SWEATER":    ("sweaters",   "Sweaters",    "Sweater camisero"),
    "BLOUSE":           ("blusas",     "Blusas",      "Blusa"),
    "DRESS SHIRT":      ("blusas",     "Blusas",      "Camisa"),
    "T-SHIRT":          ("remeras",    "Remeras",     "Remera"),
    "T/SHIRT":          ("remeras",    "Remeras",     "Remera"),
    "PANTS":            ("pantalones", "Pantalones",  "Pantalón"),
    "WAISTCOAT":        ("chalecos",   "Chalecos",    "Chaleco"),
    # --- calzado ---
    "SHOOSE":           ("zapatos",    "Zapatos",     "Zapato"),
    "SHOES":            ("zapatos",    "Zapatos",     "Zapato"),
    "W SHOES":          ("zapatos",    "Zapatos",     "Zapato"),
    "LITTLE SHOE":      ("zapatos",    "Zapatos",     "Zapato"),
    "HEELS":            ("tacos",      "Tacos",       "Stiletto"),
    "VIKING HEEL":      ("tacos",      "Tacos",       "Taco"),
    "BOOTS":            ("botas",      "Botas",       "Bota"),
    "SANDALS W":        ("sandalias",  "Sandalias",   "Sandalia"),
    "FLIP FLOPS":       ("sandalias",  "Sandalias",   "Ojota"),
    # --- accesorios ---
    "KEY RING":         ("accesorios", "Accesorios",  "Llavero"),
    "KEYRING":          ("accesorios", "Accesorios",  "Llavero"),
    "HANDKERCHIEF":     ("accesorios", "Accesorios",  "Pañuelo"),
    "POCKET":           ("accesorios", "Accesorios",  "Monedero"),
}

# orden en que se muestran las categorias dentro de cada seccion
CATEGORY_ORDER = ["bolsos", "carteras", "bandoleras", "mochilas", "billeteras",
                  "vestidos", "camperas", "sweaters", "blusas", "remeras",
                  "pantalones", "chalecos",
                  "zapatos", "tacos", "botas", "sandalias",
                  "accesorios"]

SECTION_ORDER = ["CARTERAS", "ROPA", "ZAPATOS", "ARTICULOS"]

TALLE_ALPHA = ["XXS", "XS", "S", "M", "L", "XL", "XXL"]


def jpeg_size(path):
    """Alto/ancho de un JPEG sin dependencias externas (parsea el marker SOF)."""
    try:
        with open(path, "rb") as f:
            data = f.read()
    except Exception:
        return None
    i = 2
    n = len(data)
    while i < n - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        m = data[i + 1]
        if m in (0xD8, 0xD9) or 0xD0 <= m <= 0xD7 or m == 0x01:
            i += 2
            continue
        seglen = (data[i + 2] << 8) + data[i + 3]
        if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            h = (data[i + 5] << 8) + data[i + 6]
            w = (data[i + 7] << 8) + data[i + 8]
            return (w, h)
        i += 2 + seglen
    return None


# Las fotos muy verticales son las que traen quemado el texto de la slide
# original (codigo / tipo / color / precio). Se marcan con recorte "top" y el
# CSS las muestra recortadas desde arriba para que ese texto no se vea.
TALL_RATIO = 1.25


def parse_precio(raw):
    if not raw:
        return 0
    n = re.sub(r"[^\d]", "", str(raw))
    return int(n) if n else 0


def parse_talles(raw):
    if not raw or str(raw).strip().lower() in ("none", "null", "-"):
        return []
    parts = [p.strip() for p in re.split(r"[/|]", str(raw)) if p.strip()]
    out = []
    for p in parts:
        up = p.upper()
        if up in TALLE_ALPHA:
            out.append(up)
        else:
            out.append(p.replace(".", ","))  # 43.5 -> 43,5 (unifica numericos)
    # dedup preservando orden
    seen, clean = set(), []
    for t in out:
        if t not in seen:
            seen.add(t)
            clean.append(t)
    return clean


def title_case(s):
    if not s:
        return None
    small = {"de", "del", "y", "con"}
    words = str(s).strip().lower().split()
    return " ".join(w if w in small and i else w.capitalize() for i, w in enumerate(words))


def slugify(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s or "item"


def brand_of_image(name):
    u = name.upper()
    for raw, (slug, _) in BRANDS.items():
        if raw.replace(" ", "") in u:
            return slug
    return "common"


def main():
    src_json = os.path.join(SRC, "catalogo.json")
    src_img = os.path.join(SRC, "imagenes")
    if not os.path.isfile(src_json):
        sys.exit("No encuentro %s" % src_json)

    raw = json.load(open(src_json, encoding="utf-8"))

    # ---------- 1. copiar imagenes ----------
    copied = 0
    if os.path.isdir(src_img):
        for fn in sorted(os.listdir(src_img)):
            if not fn.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            dest_dir = os.path.join(ROOT, "assets", "img", brand_of_image(fn))
            os.makedirs(dest_dir, exist_ok=True)
            shutil.copy2(os.path.join(src_img, fn), os.path.join(dest_dir, fn.lower()))
            copied += 1

    # ---------- 2. normalizar productos ----------
    data = OrderedDict()
    for raw_brand, (slug, nombre) in BRANDS.items():
        data[slug] = {"nombre": nombre, "categorias": [], "productos": []}

    seen_keys = set()
    tall_count = [0]
    counters = {}
    skipped_dupes = 0
    unknown_cats = set()

    for item in raw:
        raw_brand = (item.get("marca") or "").strip().upper()
        if raw_brand not in BRANDS:
            continue
        bslug, bname = BRANDS[raw_brand]

        raw_cat = (item.get("categoria") or item.get("tipo") or "").strip().upper()
        if raw_cat not in CATEGORY_MAP:
            unknown_cats.add(raw_cat)
            cat_slug, cat_plural, cat_sing = slugify(raw_cat), title_case(raw_cat), title_case(raw_cat)
        else:
            cat_slug, cat_plural, cat_sing = CATEGORY_MAP[raw_cat]

        imagen = (item.get("imagen") or "").strip()
        codigo = (item.get("codigo") or "").strip() or None
        dupe_key = (raw_brand, codigo, imagen.lower())
        if codigo and dupe_key in seen_keys:
            skipped_dupes += 1
            continue
        seen_keys.add(dupe_key)

        color = title_case(item.get("color"))
        seccion_raw = (item.get("seccion") or "").strip().upper()

        counters.setdefault((bslug, cat_slug), 0)
        counters[(bslug, cat_slug)] += 1
        pid = "%s-%s-%03d" % (bslug, cat_slug, counters[(bslug, cat_slug)])

        titulo = "%s %s" % (cat_sing, bname)
        if color:
            titulo += " %s" % color

        img_dir = brand_of_image(imagen) if imagen else bslug
        img_path = "/assets/img/%s/%s" % (img_dir, imagen.lower()) if imagen else ""

        recorte = None
        if imagen:
            dims = jpeg_size(os.path.join(src_img, imagen))
            if dims and dims[0] and dims[1] / float(dims[0]) >= TALL_RATIO:
                recorte = "top"
                tall_count[0] += 1

        desc_bits = ["%s %s original." % (cat_sing, bname)]
        if color:
            desc_bits.append("Color %s." % color)
        desc_bits.append("Pieza importada, disponible en showroom. Consultanos por WhatsApp para coordinar entrega.")

        data[bslug]["productos"].append(OrderedDict([
            ("id", pid),
            ("titulo", titulo),
            ("categoria", cat_slug),
            ("seccion", seccion_raw),
            ("tipo", (item.get("tipo") or raw_cat).strip()),
            ("codigo", codigo),
            ("precio", parse_precio(item.get("precio"))),
            ("moneda", "ARS"),
            ("talles", parse_talles(item.get("talle"))),
            ("colores", [color] if color else []),
            ("imagenes", [img_path] if img_path else []),
            ("recorte", recorte),
            ("descripcion", " ".join(desc_bits)),
            ("stock", True),
        ]))

    # ---------- 3. armar categorias por marca ----------
    for bslug, blob in data.items():
        cats = OrderedDict()
        for p in blob["productos"]:
            key = p["categoria"]
            if key not in cats:
                plural = next((v[1] for v in CATEGORY_MAP.values() if v[0] == key), title_case(key))
                cats[key] = OrderedDict([
                    ("id", key),
                    ("nombre", plural),
                    ("seccion", SECTION_MAP.get(p["seccion"], "Productos")),
                    ("seccion_id", p["seccion"]),
                    ("cantidad", 0),
                    ("portada", p["imagenes"][0] if p["imagenes"] else ""),
                ])
            cats[key]["cantidad"] += 1
            # como portada preferimos una foto limpia (sin texto quemado)
            if not p.get("recorte") and p["imagenes"]:
                if cats[key].get("_portada_limpia") is not True:
                    cats[key]["portada"] = p["imagenes"][0]
                    cats[key]["_portada_limpia"] = True

        def sort_key(c):
            s = SECTION_ORDER.index(c["seccion_id"]) if c["seccion_id"] in SECTION_ORDER else 99
            k = CATEGORY_ORDER.index(c["id"]) if c["id"] in CATEGORY_ORDER else 99
            return (s, k)

        for c in cats.values():
            c.pop("_portada_limpia", None)
        blob["categorias"] = sorted(cats.values(), key=sort_key)
        blob["productos"].sort(key=lambda p: (sort_key({"seccion_id": p["seccion"], "id": p["categoria"]}), p["id"]))

    # ---------- 4. escribir products.json ----------
    out_dir = os.path.join(ROOT, "assets", "data")
    os.makedirs(out_dir, exist_ok=True)
    out = OrderedDict([("generado", "build_catalog.py"), ("moneda", "ARS")])
    out.update(data)
    with open(os.path.join(out_dir, "products.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    # ---------- 5. reporte ----------
    print("Imagenes copiadas: %d" % copied)
    print("Duplicados omitidos: %d" % skipped_dupes)
    print("Fotos con texto quemado (recorte top): %d" % tall_count[0])
    if unknown_cats:
        print("!! Categorias sin mapear (revisar CATEGORY_MAP): %s" % sorted(unknown_cats))
    for bslug, blob in data.items():
        print("\n%s -> %d productos" % (blob["nombre"], len(blob["productos"])))
        for c in blob["categorias"]:
            print("   [%s] %-12s %-14s %d" % (c["seccion_id"][:4], c["id"], c["nombre"], c["cantidad"]))
    return data


if __name__ == "__main__":
    main()
