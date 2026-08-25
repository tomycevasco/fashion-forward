#!/usr/bin/env python3
"""
Fashion Forward — generador de paginas de categoria y de detalle.

Lee /assets/data/products.json y crea una carpeta real por categoria
(/furla/bolsos/index.html, /liujo/vestidos/index.html, ...) mas la pagina
de detalle de producto de cada marca (/furla/producto/index.html).

Se ejecuta despues de build_catalog.py:
    python3 _tools/build_catalog.py && python3 _tools/build_pages.py

Las paginas son plantillas identicas por marca: el contenido lo pinta
product-loader.js leyendo el JSON, asi que agregar productos NO obliga a
regenerar nada (solo si aparecen categorias nuevas).
"""
import json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "assets", "data", "products.json")

BRANDS = {
    "furla": {
        "nombre": "Furla",
        "css": "furla.css",
        "theme": "#FCFAF7",
        "fonts": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@300;400;500;600&display=swap",
        "favicon": "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23A96B37'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='18' fill='%23FCFAF7' text-anchor='middle'%3EF%3C/text%3E%3C/svg%3E",
    },
    "bally": {
        "nombre": "Bally",
        "css": "bally.css",
        "theme": "#FFFFFF",
        "fonts": "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
        "favicon": "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23111213'/%3E%3Crect x='0' y='0' width='6' height='32' fill='%23C8102E'/%3E%3Ctext x='19' y='22' font-family='Helvetica,Arial' font-weight='bold' font-size='15' fill='%23fff' text-anchor='middle'%3EB%3C/text%3E%3C/svg%3E",
    },
    "liujo": {
        "nombre": "Liu Jo",
        "css": "liujo.css",
        "theme": "#161314",
        "fonts": "https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@300;400;500;600&display=swap",
        "favicon": "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23161314'/%3E%3Ctext x='16' y='22' font-family='Georgia,serif' font-size='15' fill='%23B08542' text-anchor='middle'%3ELJ%3C/text%3E%3C/svg%3E",
    },
}

TPL = """<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="{theme}">
<meta name="robots" content="{robots}">
<link rel="icon" href="data:image/svg+xml,{favicon}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{fonts}" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/main.css">
<link rel="stylesheet" href="/assets/css/brand-base.css">
<link rel="stylesheet" href="/assets/css/{css}">
</head>

<body class="brand brand--{slug}" data-marca="{slug}"{extra}>

<!-- Generado por _tools/build_pages.py — el contenido lo pinta product-loader.js -->
<main class="bmain" id="{root}">
  <p class="pgrid__empty">Cargando…</p>
</main>

<script src="/assets/js/config.js"></script>
<script src="/assets/js/core.js"></script>
<script src="/assets/js/cart.js"></script>
<script src="/assets/js/whatsapp.js"></script>
<script src="/assets/js/product-loader.js"></script>
<script src="/assets/js/search.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {{
    FF.mountBrandChrome('{slug}').then(function () {{
      {init}();
      FF.mountFab();
    }});
  }});
</script>
</body>
</html>
"""


def write(path, html):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    hechas = 0

    for slug, meta in BRANDS.items():
        brand = data.get(slug)
        if not brand:
            continue

        # --- limpiar categorias viejas que ya no existan en el JSON ---
        vigentes = set(c["id"] for c in brand["categorias"]) | {"producto"}
        brand_dir = os.path.join(ROOT, slug)
        if os.path.isdir(brand_dir):
            for entry in os.listdir(brand_dir):
                full = os.path.join(brand_dir, entry)
                if os.path.isdir(full) and entry not in vigentes:
                    shutil.rmtree(full)
                    print("   - borrada categoria obsoleta: /%s/%s/" % (slug, entry))

        # --- una carpeta por categoria ---
        for cat in brand["categorias"]:
            html = TPL.format(
                title="%s %s — Fashion Forward" % (cat["nombre"], meta["nombre"]),
                desc="%s %s en Fashion Forward: %d producto%s con precio en pesos, talles disponibles y compra por WhatsApp."
                     % (cat["nombre"], meta["nombre"], cat["cantidad"], "" if cat["cantidad"] == 1 else "s"),
                theme=meta["theme"], fonts=meta["fonts"], css=meta["css"],
                favicon=meta["favicon"], slug=slug, robots="index,follow",
                extra=' data-cat="%s" data-page="categoria"' % cat["id"],
                root="cat-root", init="FF.initCategoryPage",
            )
            write(os.path.join(ROOT, slug, cat["id"], "index.html"), html)
            hechas += 1

        # --- detalle de producto (una sola pagina por marca, ?id=) ---
        html = TPL.format(
            title="Producto — %s | Fashion Forward" % meta["nombre"],
            desc="Ficha de producto %s en Fashion Forward." % meta["nombre"],
            theme=meta["theme"], fonts=meta["fonts"], css=meta["css"],
            favicon=meta["favicon"], slug=slug,
            robots="noindex,follow",  # la ficha se arma por querystring
            extra=' data-page="producto"',
            root="prod-root", init="FF.initProductPage",
        )
        write(os.path.join(ROOT, slug, "producto", "index.html"), html)
        hechas += 1

        print("%s: %d categorias + 1 ficha" % (meta["nombre"], len(brand["categorias"])))

    print("\nTotal de paginas generadas: %d" % hechas)


if __name__ == "__main__":
    main()
