# Fashion Forward

Sitio estático multimarca (HTML + CSS + JS puro, sin build step) que funciona como paraguas de
**Furla**, **Bally** y **Liu Jo**. Catálogo real, carrito independiente por marca y checkout por
WhatsApp. Listo para publicar en Netlify tal cual está.

---

## 1. Probarlo localmente

El sitio lee el catálogo con `fetch`, así que **no funciona abriendo el `index.html` a mano**
(el protocolo `file://` bloquea esas lecturas). Hay que levantar un servidor local, que ya viene
con macOS:

```bash
cd "ruta/al/proyecto"
python3 -m http.server 8000
```

Después abrí **http://localhost:8000** en el navegador. Para cortarlo: `Ctrl + C`.

Rutas para probar:

| Ruta | Qué es |
|---|---|
| `/` | Home de Fashion Forward |
| `/furla/` `/bally/` `/liujo/` | Home de cada marca |
| `/liujo/vestidos/` | Ejemplo de categoría |
| `/furla/producto/?id=furla-bolsos-001` | Ficha de producto |
| `/carrito/?marca=furla` | Carrito de una marca |
| `/contacto/` | Formulario de contacto |

---

## 2. Los 3 archivos que vas a querer tocar

### a) El número de WhatsApp → `assets/js/config.js`

```js
WHATSAPP_NUMBER: '5491100000000',   // <-- acá
```

Formato: código de país + área **sin el 0** + número **sin el 15**, todo junto y sin símbolos.
Ejemplo, para un celular de Buenos Aires 11 5555-4444 → `5491155554444`.

Ese único valor alimenta **todo**: el botón flotante de todas las páginas, el botón "Consultar"
de cada producto y el "Enviar pedido por WhatsApp" del carrito.

El mensaje genérico del botón flotante también está ahí (`WHATSAPP_MESSAGE`).

### b) Mercado Pago → `assets/js/config.js`

```js
MERCADOPAGO_LINK: null,             // ej: 'https://mpago.la/xxxxxxx'
```

- Con `null` (como está ahora), el botón "Pagar con Mercado Pago" abre un modal de
  *"Próximamente disponible"* que ofrece cerrar el pedido por WhatsApp.
- Apenas pegues un link de pago ahí, el mismo botón pasa a abrirlo. No hay que tocar nada más.

No hay backend de Mercado Pago: el botón está terminado visualmente y listo para conectar.

### c) El catálogo real → `assets/data/products.json`

**No lo edites a mano.** Se genera desde el ZIP del catálogo con dos comandos:

```bash
python3 _tools/build_catalog.py CATALOGO_NUEVO.zip   # o sin argumento: toma el .zip más nuevo
python3 _tools/build_pages.py                        # crea/borra carpetas de categoría
```

El primero descomprime el ZIP en una carpeta temporal, copia las imágenes a
`assets/img/{marca}/`, normaliza los datos y escribe `assets/data/products.json`.
El segundo crea una carpeta real por categoría (`/liujo/vestidos/index.html`, etc.) y borra
las categorías que ya no existan.

Si agregás o sacás **productos** de una categoría que ya existe, con el primer comando alcanza.
Si aparecen **categorías nuevas**, corré los dos.

---

## 3. Cómo se estructura el `products.json`

```json
{
  "furla": {
    "nombre": "Furla",
    "categorias": [
      { "id": "bolsos", "nombre": "Bolsos", "seccion": "Carteras y bolsos",
        "seccion_id": "CARTERAS", "cantidad": 23, "portada": "/assets/img/furla/…jpeg" }
    ],
    "productos": [
      {
        "id": "furla-bolsos-001",
        "titulo": "Bolso Furla Teddy",
        "categoria": "bolsos",
        "seccion": "CARTERAS",
        "tipo": "BAG",
        "codigo": "WP0031303B00",
        "precio": 225000,
        "moneda": "ARS",
        "talles": ["XS", "S", "M"],
        "colores": ["Teddy"],
        "imagenes": ["/assets/img/furla/carteras_furla_2.jpeg"],
        "recorte": null,
        "descripcion": "…",
        "stock": true
      }
    ]
  },
  "bally": { … },
  "liujo": { … }
}
```

Notas:
- `precio` es un número entero en pesos (el ZIP trae `"$225.000"` y el script lo convierte).
- `stock` es un booleano simple por producto; no hay stock por talle.
- `recorte: "top"` marca las fotos que traen quemado el texto de la slide original; esas se
  muestran recortadas desde arriba para que no se vea el texto (ver punto 6).
- Las categorías son distintas en cada marca, salen del propio catálogo.

---

## 4. Publicar en Netlify

**Opción rápida (drag & drop):** entrá a Netlify → *Add new site* → *Deploy manually* y arrastrá
la carpeta completa del proyecto. Listo, no hay build step.

**Opción con Git:** subí la carpeta a un repo y conectalo. Netlify va a leer `netlify.toml`, que
ya está configurado:

```toml
[build]
  publish = "."
  command = ""
```

Antes de subir podés borrar, si querés, lo que no hace falta en producción:
`CATALOGO_FINAL.zip`, `_tools/` y `prompt-claude-code-fashion-forward.md`.
El sitio funciona igual sin eso (guardá el ZIP y `_tools/` en otro lado, los vas a necesitar la
próxima vez que actualices el catálogo).

---

## 5. Estructura del proyecto

```
/
├── index.html                  Home de Fashion Forward
├── netlify.toml                Config de deploy (sin build)
├── robots.txt · _headers
├── /assets
│   ├── /css
│   │   ├── main.css            Reset, tokens y componentes de TODO el sitio
│   │   ├── home.css            Solo la landing de Fashion Forward
│   │   ├── brand-base.css      Layout compartido de las páginas de marca
│   │   ├── furla.css           Piel de Furla (solo variables + detalles)
│   │   ├── bally.css           Piel de Bally
│   │   ├── liujo.css           Piel de Liu Jo
│   │   └── cart.css            Carrito y contacto
│   ├── /js
│   │   ├── config.js           ← TODO lo configurable vive acá
│   │   ├── core.js             Helpers, carga del JSON, header/footer de marca
│   │   ├── product-loader.js   Tarjetas, grilla, categoría, ficha, home de marca
│   │   ├── cart.js             Carrito genérico (uno por marca)
│   │   ├── cart-page.js        Pantalla del carrito
│   │   ├── whatsapp.js         Botón flotante, mensajes, modal, Mercado Pago
│   │   ├── search.js           Buscador global
│   │   ├── contact-form.js     Validación y envío del formulario
│   │   └── animations.js       GSAP/Lenis/Swiper — SOLO en la home
│   ├── /img/{furla,bally,liujo,common}
│   └── /data/products.json
├── /furla · /bally · /liujo    Home + una carpeta por categoría + /producto/
├── /carrito · /contacto
└── /_tools                     Scripts de generación del catálogo
```

---

## 6. Decisiones y supuestos que tomé

- **Categorías en español.** El catálogo original venía en inglés y con erratas
  (`SHOOSE`, `WALLET_GREY`, `T/SHIRT`, `LEATHE BAG`, `COSS OVER`). Se agrupan y traducen en
  `CATEGORY_MAP`, dentro de `_tools/build_catalog.py` — si querés cambiar un nombre, es ahí.
  El `tipo` y el `codigo` originales se conservan y se muestran en la ficha del producto.
- **182 productos, no 183.** Había un producto repetido (mismo código `WE005181704S` y misma
  foto, cargado como `HANDBAG` y como `WHITE HANDBAG`). Se deduplica automáticamente.
- **9 fotos traen texto quemado** (código, tipo, color y precio de la slide original). Como ese
  precio puede contradecir al del JSON, esas imágenes se detectan por su proporción y se
  muestran recortadas desde arriba. Si algún día conseguís las fotos limpias, se reemplazan y
  el recorte desaparece solo.
- **Solo se muestra lo que existe.** Bally tiene únicamente calzado (15 pares) y Furla no tiene
  ropa: las homes están escritas alrededor de eso, sin productos inventados ni placeholders.
- **Un carrito por marca**, en `localStorage` (`cart_furla`, `cart_bally`, `cart_liujo`).
  Nunca se mezclan; el carrito tiene pestañas para saltar entre ellos.
- **La ficha de producto usa querystring** (`/furla/producto/?id=…`) en vez de generar 182
  carpetas. Funciona igual en Netlify y mantiene el repo liviano.
- **El header y el footer de las marcas se inyectan por JS** (`FF.mountBrandChrome`) para no
  repetir el mismo markup en 24 páginas. Si algún día querés HTML plano, ese es el único
  lugar a cambiar.
- **Animaciones fuertes solo en la home.** GSAP + ScrollTrigger + Lenis + Swiper por CDN, y
  todo degrada solo: si una librería no carga, o el sistema pide menos movimiento, la página
  sigue funcionando con las transiciones CSS. Las páginas de marca usan revelados discretos
  con `IntersectionObserver`, sin librerías.
- **El formulario de contacto no envía nada todavía**: valida y muestra la confirmación en
  pantalla. Para conectarlo de verdad, cargá `CONTACT_FORM_ENDPOINT` en `config.js`
  (Formspree, EmailJS o lo que uses) y el POST ya está escrito.
- **El newsletter es un placeholder**: muestra un aviso y no guarda nada.

---

## 7. Lo que falta / próximos pasos

- Conectar Mercado Pago de verdad (hoy es un botón terminado sin backend).
- Conectar el formulario de contacto a un servicio de envío.
- Fotos limpias para las 9 imágenes con texto quemado.
- Datos reales de contacto y redes sociales (hoy son placeholders en `config.js`).
