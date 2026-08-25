# PROMPT PARA CLAUDE CODE — Fashion Forward Multimarca

Copiá y pegá todo el bloque de abajo (desde "## CONTEXTO" hasta el final) como primer mensaje a Claude Code, dentro de la carpeta vacía del proyecto.

---

## CONTEXTO DEL PROYECTO

Quiero que construyas un sitio web estático (HTML/CSS/JS puro, sin frameworks pesados tipo React a menos que lo consideres necesario para mantenibilidad — si usás algo, que sea simple y justificable) llamado **Fashion Forward**: un sitio multimarca que funciona como paraguas de 3 marcas reales de moda: **Furla**, **Bally** y **Liu Jo**.

No tengo backend. El hosting será **Netlify**. Solo va a haber una integración simple a futuro con Mercado Pago (dejar la sección lista visualmente, sin lógica de backend real todavía). Todo lo demás es 100% frontend estático, catálogo + carrito con checkout vía WhatsApp.

Te voy a pasar (o ya te pasé, dejalo en la carpeta del proyecto) un **ZIP real con el JSON de productos + carpetas de imágenes** de las 3 marcas. Tu primer paso concreto de trabajo con datos es: **descomprimir ese ZIP, leer y analizar bien el JSON y las imágenes que contiene** (estructura real de campos, categorías reales por marca, cantidad de productos, formato de nombres de imágenes, etc.), y a partir de eso **armar las secciones/categorías reales de cada marca según lo que efectivamente venga en los datos** — no asumas de antemano qué categorías tiene cada marca, confirmalo leyendo el JSON. Adaptá la estructura de datos y el código a lo que el JSON real traiga (si el formato difiere del sugerido más abajo, adaptate vos mismo a la estructura real sin romper el resto del sitio; el formato de abajo es solo una referencia orientativa por si el JSON viene incompleto en algo).

**No busques nada peligroso en internet ni salgas de la carpeta del proyecto.** Podés buscar referencias visuales/de paleta de colores de Furla, Bally y Liu Jo en internet para inspirarte en su identidad de marca (colores, tipografías, estilo), sin copiar literal logos ni assets con derechos — usá interpretaciones propias inspiradas en la identidad real de cada marca.

---

## ARQUITECTURA GENERAL

### Páginas / rutas
```
/                          → Home de Fashion Forward (la marca paraguas)
/furla/                    → Home de Furla
/furla/[categoria]/        → Listado de productos de una categoría de Furla
/furla/producto/[slug]/    → (opcional, si tiene sentido) detalle de producto
/bally/                    → Home de Bally
/bally/[categoria]/        → ídem
/liujo/                    → Home de Liu Jo
/liujo/[categoria]/        → ídem
/carrito/                  → Carrito de la marca activa (uno por marca, no compartido)
```

Usá carpetas reales (no solo JS de rutas), para que Netlify sirva todo como sitio estático simple. Organizá el código por marca en carpetas separadas (`/furla`, `/bally`, `/liujo`) más una carpeta común (`/shared` o `/assets/common`) para lo que se reutiliza (carrito, WhatsApp flotante, formulario de contacto, lógica común de JS).

### Estructura de carpetas sugerida
```
/
├── index.html                    (Home Fashion Forward)
├── /assets
│   ├── /css
│   │   ├── main.css              (estilos globales + Fashion Forward home)
│   │   ├── furla.css
│   │   ├── bally.css
│   │   └── liujo.css
│   ├── /js
│   │   ├── cart.js               (lógica de carrito, genérica, parametrizada por marca)
│   │   ├── whatsapp.js           (botón flotante + generación de mensajes)
│   │   ├── contact-form.js
│   │   ├── product-loader.js     (lee el JSON y pinta productos)
│   │   ├── search.js
│   │   └── animations.js         (animaciones del main de Fashion Forward)
│   ├── /img
│   │   ├── /furla
│   │   ├── /bally
│   │   ├── /liujo
│   │   └── /common
│   └── /data
│       └── products.json         (placeholder hasta que yo te pase el real)
├── /furla
│   ├── index.html
│   ├── /vestidos/index.html
│   ├── /carteras/index.html
│   └── ... (categorías propias de Furla)
├── /bally
│   ├── index.html
│   └── /[categorias-propias]/
├── /liujo
│   ├── index.html
│   └── /[categorias-propias]/
└── /carrito
    └── index.html                (usa parámetro o localStorage para saber de qué marca es)
```

---

## FORMATO DE DATOS SUGERIDO (products.json)

Generá un JSON placeholder con esta estructura (algunos productos de ejemplo por marca, para poder maquetar ya) y documentá el formato en un comentario o README para que yo sepa cómo tiene que venir el real:

```json
{
  "furla": {
    "categorias": [
      { "id": "carteras", "nombre": "Carteras" },
      { "id": "vestidos", "nombre": "Vestidos" }
    ],
    "productos": [
      {
        "id": "furla-001",
        "titulo": "Cartera Furla 1927",
        "categoria": "carteras",
        "precio": 450000,
        "moneda": "ARS",
        "talles": ["Único"],
        "colores": ["Negro", "Beige"],
        "imagenes": ["/assets/img/furla/furla-001-1.jpg", "/assets/img/furla/furla-001-2.jpg"],
        "descripcion": "Descripción corta del producto.",
        "stock": true
      }
    ]
  },
  "bally": { "categorias": [], "productos": [] },
  "liujo": { "categorias": [], "productos": [] }
}
```

Notas:
- Precio siempre en ARS.
- No hay variantes que afecten stock — el stock es un booleano simple por producto.
- Cada categoría es distinta por marca (no asumas que las 3 tienen las mismas).
- Generá ~6-8 productos placeholder por marca con imágenes de placeholder (podés usar un servicio de placeholder de imágenes o generar SVGs simples de "imagen de producto") para poder ver el diseño funcionando antes de que yo pase el JSON real.

---

## IDENTIDAD VISUAL

### Fashion Forward (home principal)
Este es el sitio que más cuidado necesita. Buscá referencias de UI/UX de sitios de moda multimarca de lujo (piensa en editoriales de moda, landing pages de e-commerce premium) y diseñá algo con:
- Identidad propia, no la de ninguna de las 3 marcas.
- Estética editorial/moderna, tipografía elegante (podés usar Google Fonts vía `<link>`, ej. una serif editorial tipo "Playfair Display" o "Cormorant" combinada con una sans-serif limpia tipo "Inter" o "Manrope").
- Hero section con animación fuerte y llamativa (parallax, scroll reveal, transiciones suaves, microinteracciones en hover). **Para este main específicamente, tenés total libertad de usar todas las librerías de estética/animación vía CDN que consideres necesarias para que quede con un nivel súper profesional y moderno, al nivel de una landing premium de verdad.** Usá lo mejor que conozcas: **GSAP** (con sus plugins como ScrollTrigger, ScrollSmoother si suma), **AOS - Animate On Scroll**, **Swiper.js** (carruseles), **Locomotive Scroll** o **Lenis** (smooth scroll), **Three.js** si un detalle 3D sutil suma valor real, librerías de partículas o efectos de fondo, lo que haga falta. No te limites de antemano — priorizá que el resultado visual y de interacción sea excelente, fluido y moderno. Esta libertad de librerías es específica para el main de Fashion Forward; en las páginas de las 3 marcas mantené animaciones más discretas como se indica más abajo.
- Las 3 secciones/marcas deben presentarse como 3 bloques visuales grandes y atractivos (cards grandes, imágenes de cada marca, hover effects), cada uno llevando a su home de marca.
- Sé libre de agregar secciones extra que le den cuerpo a la home si sumás valor: por ejemplo, una sección "sobre Fashion Forward", alguna sección editorial/tendencias, footer completo con links, redes sociales (placeholder), newsletter (placeholder, sin funcionalidad real de envío).

### Furla
Investigá (buscando referencias online, sin copiar literal) la identidad de Furla: paleta de colores tierra/camel/marrones con acentos, tipografía elegante minimalista, mucho espacio en blanco, fotografía de producto protagonista. Animaciones sutiles, no tan cargadas como el main de Fashion Forward.

### Bally
Investigá la identidad de Bally: estética suiza, minimalista, sobria, con acentos de color (rojo es un color histórico de la marca), tipografía geométrica/sans-serif limpia. Diseño más "quiet luxury".

### Liu Jo
Investigá la identidad de Liu Jo: más femenino, glamouroso, con detalles dorados/negros, tipografía con un toque más fashion/trendy, fotografía con actitud más "joven".

Para las 3 marcas: diseño responsive prioritario, mobile-first, pero las animaciones pueden ser más discretas que en el main de Fashion Forward (transiciones simples, hover states, nada muy cargado que ralentice la navegación de categoría en categoría).

---

## NAVEGACIÓN

- En cada página de marca, el **logo/nombre de la marca en el header siempre lleva al home de esa marca**.
- Además, en el header (o en un lugar consistente) de cada página de marca debe haber un link/botón claro tipo **"Volver a Fashion Forward"** que lleve siempre al `/index.html` principal.
- En la home de Fashion Forward NO hace falta el botón "volver al principio" (ya estás ahí), pero sí navegación clara hacia las 3 marcas.
- Mantené el header simple y consistente en estructura entre las 3 marcas, pero con la piel visual (colores/tipografía) de cada una.

---

## CARRITO Y CHECKOUT

- **Un carrito por marca** (si el usuario tiene productos de Furla en el carrito y navega a Bally, son carritos independientes). Usá `localStorage` con keys separadas, ej. `cart_furla`, `cart_bally`, `cart_liujo`. Dura mientras dura la sesión del navegador (no hace falta expiración especial, localStorage ya persiste, pero no es un requisito crítico que sobreviva cierres de pestaña — priorizá que funcione bien durante la sesión).
- Botón **"Agregar al carrito"** en cada producto (talle + color seleccionable si aplica, cantidad).
- Página `/carrito/` muestra: lista de productos agregados (imagen, título, talle, color, cantidad editable, precio, subtotal), total general.
- Dentro del carrito, dos opciones de checkout, claramente diferenciadas:
  1. **"Enviar pedido por WhatsApp"**: genera un mensaje prellenado con el detalle completo del pedido (producto, talle, color, cantidad, precio, total) y abre WhatsApp (`https://wa.me/NUMERO?text=MENSAJE_ENCODEADO`) — dejá el número como variable fácil de reemplazar (ej. constante `WHATSAPP_NUMBER` al principio de `whatsapp.js`, con un valor placeholder tipo `5491100000000`).
  2. **"Pagar con Mercado Pago"**: por ahora, dejalo como un botón visualmente terminado (con el logo/estilo de Mercado Pago) que al clickear muestre un modal o alerta simple tipo "Próximamente disponible" o que redirija a una URL placeholder configurable (variable `MERCADOPAGO_LINK` fácil de reemplazar después). No implementes backend de Mercado Pago ahora.

---

## WHATSAPP FLOTANTE (global, en todas las páginas)

- Botón flotante fijo (esquina inferior derecha típicamente), ícono de WhatsApp, visible en todas las páginas del sitio (Fashion Forward home + las 3 marcas + carrito).
- Mismo número, mismo mensaje genérico predefinido en todos lados (ej. "Hola! Quería consultar sobre sus productos.") — EXCEPTO en el carrito, donde el flujo de WhatsApp arma el mensaje específico del pedido (ese es un botón/acción distinta dentro del carrito, no el flotante).
- Dejá el número y el mensaje genérico como constantes fáciles de editar.

---

## FORMULARIO DE CONTACTO

- Presente en la página general (podés ponerlo en la home de Fashion Forward, en una sección o página `/contacto/`, decidí vos la mejor ubicación — podría ser buena idea tenerlo en el footer de la home principal y/o una página dedicada).
- Campos: nombre, email, teléfono (opcional), marca de interés (select: Furla / Bally / Liu Jo / Consulta general), mensaje.
- Como todavía no hay backend, el formulario puede: (a) simular envío con un mensaje de confirmación en pantalla, o (b) dejar preparado el submit para conectar con un servicio tipo Formspree/EmailJS más adelante (dejalo bien comentado en el código dónde habría que poner el endpoint). Elegí la opción que te parezca más prolija para mostrar como demo funcional.

---

## BUSCADOR

- Buscador de productos, se puede implementar por marca (busca dentro de los productos de esa marca) y/o un buscador general en la home de Fashion Forward que redirija a resultados de la marca correspondiente — usá tu criterio de UX, priorizando simplicidad y que funcione bien.
- Búsqueda simple por texto sobre el título del producto (y opcionalmente categoría), sin necesidad de buscador con typo-tolerance ni nada complejo.

---

## RESPONSIVE

- **Es crítico** que absolutamente todas las páginas se vean perfectas en mobile (probá mentalmente en anchos de 320px, 375px, 414px, y luego tablet 768px, y desktop 1280px+).
- Mobile-first en el CSS.
- Menús de navegación con hamburger menu en mobile donde haga falta.
- El botón de WhatsApp flotante y el carrito deben ser cómodos de usar con el pulgar en mobile.

---

## LIBRERÍAS PERMITIDAS (vía CDN, sin instalación local)

- **GSAP** o **AOS** (Animate on Scroll) para animaciones — usalas libremente en el main de Fashion Forward, con moderación en las páginas de marca.
- **Swiper.js** si necesitás carruseles de producto/imágenes.
- **Google Fonts** vía link tag.
- **Font Awesome** o similar vía CDN para íconos (WhatsApp, carrito, buscador, etc.) si no querés hacer SVGs a mano.
- No uses frameworks de build (Webpack, Vite, npm install) — todo debe poder abrirse/servirse como sitio estático simple, deployable directo a Netlify sin build step (a menos que uses algo como un simple `netlify.toml` de configuración, lo cual está bien).

## SEGURIDAD Y ALCANCE DE HERRAMIENTAS

- **No instales herramientas, paquetes, ni dependencias nuevas** (no `npm install` de librerías para bundlear, no frameworks de testing, no herramientas de build, no nada que requiera instalación). Trabajá únicamente con lo que ya está disponible en el entorno (HTML/CSS/JS plano + librerías vía CDN como se indica más abajo). Si en algún punto sentís que necesitarías instalar algo, resolvelo con lo que tengas disponible en vez de instalar.
- **No ejecutes comandos que instalen software, descarguen paquetes, ni corran servidores/procesos de prueba persistentes.** Podés usar comandos simples de sistema de archivos (crear carpetas, mover/leer archivos, descomprimir el ZIP) dentro de esta carpeta del proyecto únicamente.
- **No salgas de la carpeta del proyecto bajo ninguna circunstancia.**
- Cuando necesites buscar información en internet (por ejemplo, para inspirarte en la identidad visual de Furla, Bally o Liu Jo, o para elegir qué librería de animación usar), **verificá que las fuentes/páginas que consultás sean seguras y confiables** — evitá sitios sospechosos, no descargues ni ejecutes código de fuentes no oficiales, y si vas a usar una librería vía CDN, confirmá que sea la fuente oficial de esa librería (ej. cdnjs.cloudflare.com, unpkg.com, jsdelivr.net, o el CDN oficial del proyecto) antes de incluirla.
- Priorizá siempre la opción más simple y segura disponible antes que sumar herramientas o dependencias nuevas.

---

## RITMO DE TRABAJO — MUY IMPORTANTE

**No te detengas a preguntarme nada mientras avanzás. Corré todo el proyecto de punta a punta sin pausas de confirmación**, salvo que te encuentres con un bloqueo real e insalvable (por ejemplo, el ZIP de productos no se puede leer o su estructura es totalmente incompatible). Tomá vos las decisiones de diseño, estructura y contenido placeholder que hagan falta usando tu propio criterio, siguiendo todo lo indicado en este documento. Preferí avanzar con una decisión razonable antes que detenerte a pedir aprobación. Anotá o comentá en el código cualquier supuesto que hayas tomado, pero seguí trabajando sin esperar mi respuesta.

---



Quiero que trabajes de forma autónoma sin pausar a preguntarme en cada paso (salvo que encuentres una ambigüedad que realmente bloquee el avance). Segui este orden:

1. Estructura de carpetas completa + `netlify.toml` básico.
2. `products.json` placeholder con productos de ejemplo para las 3 marcas (categorías distintas por marca, como se explicó).
3. Home de Fashion Forward completa (HTML + CSS + animaciones + responsive).
4. Home de Furla + sus categorías + listado de productos + detalle simple de producto.
5. Home de Bally + sus categorías (repetí el patrón, con su propia identidad).
6. Home de Liu Jo + sus categorías (ídem).
7. Lógica de carrito (JS compartido, parametrizado por marca) + página de carrito.
8. Checkout: botón WhatsApp (pedido) + botón Mercado Pago (placeholder).
9. WhatsApp flotante global.
10. Formulario de contacto.
11. Botón "Volver a Fashion Forward" en todas las páginas de marca.
12. Buscador.
13. Revisión final de responsive en todas las páginas.
14. README.md explicando cómo reemplazar el `products.json` real, cómo configurar el número de WhatsApp, el link de Mercado Pago, y cómo hacer deploy a Netlify.

Andá avisándome brevemente qué vas completando a medida que avanzás, pero sin detenerte a pedir confirmación salvo bloqueos reales. Priorizá que el sitio funcione de punta a punta (aunque sea con datos placeholder) antes que perfeccionar detalles menores.

Cuando termines, indicame claramente cómo probar el sitio localmente y qué archivos tengo que tocar para: (1) poner el products.json real, (2) poner el número de WhatsApp real, (3) poner el link/config de Mercado Pago.
