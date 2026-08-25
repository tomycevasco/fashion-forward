/* ============================================================
   FASHION FORWARD — CORE
   Helpers compartidos: iconos, formato de precios, carga del
   catalogo y armado del header/footer de las paginas de marca.
   Se carga SIEMPRE despues de config.js y antes del resto.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.FF_CONFIG;
  var FF = window.FF = window.FF || {};

  /* ---------------- utilidades DOM ---------------- */
  FF.qs = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  FF.qsa = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  FF.el = function (tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'dataset') for (var d in attrs[k]) n.dataset[d] = attrs[k][d];
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  FF.escape = function (s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  /* ---------------- precios ---------------- */
  FF.money = function (n) {
    return '$' + Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  };

  /* ---------------- iconos SVG inline ----------------
     Hechos a mano para no depender de Font Awesome. */
  var I = {
    whatsapp: '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z"/>',
    cart: '<path d="M6 6h15l-1.6 8.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.66L5.3 3.9A1 1 0 0 0 4.3 3H2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="20" r="1.5"/><circle cx="17.5" cy="20" r="1.5"/>',
    search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16.5 16.5 4 4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    close: '<path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    arrow: '<path d="M4 12h15m0 0-6-6m6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M20 12H5m0 0 6-6m-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-.8 12a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.2" cy="6.8" r="1.2"/>',
    facebook: '<path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.29-.04-1.27-.12-2.4-.12-2.38 0-4 1.45-4 4.11V9.9H7.6V13h2.7v8h3.2Z"/>',
    tiktok: '<path d="M16.6 2h-3.1v13.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.5a5.9 5.9 0 0 0-.78-.05 5.75 5.75 0 1 0 5.75 5.75V8.9a6.7 6.7 0 0 0 3.9 1.25V7.05A3.9 3.9 0 0 1 16.6 2Z"/>',
    check: '<path d="m5 13 4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  FF.icon = function (name, size) {
    return '<svg class="ic ic-' + name + '" viewBox="0 0 24 24" width="' + (size || 20) + '" height="' +
      (size || 20) + '" fill="currentColor" aria-hidden="true" focusable="false">' + (I[name] || '') + '</svg>';
  };

  /* ---------------- catalogo ---------------- */
  var _dataPromise = null;

  FF.loadData = function () {
    if (!_dataPromise) {
      _dataPromise = fetch(CFG.DATA_URL, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .catch(function (err) {
          console.error('[FF] No se pudo cargar products.json.', err);
          console.warn('[FF] Recorda servir el sitio con un servidor local (python3 -m http.server), no abriendo el archivo con file://');
          throw err;
        });
    }
    return _dataPromise;
  };

  // Devuelve { nombre, categorias[], productos[] } de una marca
  FF.getBrand = function (slug) {
    return FF.loadData().then(function (data) {
      var b = data[slug];
      if (!b) throw new Error('Marca desconocida: ' + slug);
      return b;
    });
  };

  FF.getProduct = function (slug, id) {
    return FF.getBrand(slug).then(function (b) {
      return b.productos.filter(function (p) { return p.id === id; })[0] || null;
    });
  };

  FF.getCategory = function (brand, catId) {
    return (brand.categorias || []).filter(function (c) { return c.id === catId; })[0] || null;
  };

  // Agrupa las categorias por seccion, respetando el orden del JSON
  FF.groupCategories = function (brand) {
    var out = [], map = {};
    (brand.categorias || []).forEach(function (c) {
      if (!map[c.seccion]) { map[c.seccion] = { nombre: c.seccion, categorias: [] }; out.push(map[c.seccion]); }
      map[c.seccion].categorias.push(c);
    });
    return out;
  };

  /* ---------------- contexto de pagina ----------------
     Cada pagina de marca declara <body data-marca="furla" data-cat="bolsos"> */
  FF.ctx = function () {
    var b = document.body;
    return {
      marca: b.dataset.marca || null,
      categoria: b.dataset.cat || null,
      page: b.dataset.page || null
    };
  };

  FF.param = function (name) {
    return new URLSearchParams(window.location.search).get(name);
  };

  // Recordamos la ultima marca visitada para que /carrito/ sepa cual abrir
  FF.rememberBrand = function (slug) {
    try { localStorage.setItem('ff_last_brand', slug); } catch (e) {}
  };
  FF.lastBrand = function () {
    try { return localStorage.getItem('ff_last_brand') || 'furla'; } catch (e) { return 'furla'; }
  };

  /* ---------------- header + footer de marca ----------------
     Se inyectan por JS para no repetir el markup en las ~25 paginas
     generadas. Si algun dia se quiere HTML estatico puro, este es
     el unico lugar a cambiar. */
  FF.mountBrandChrome = function (slug) {
    var meta = CFG.MARCAS[slug];
    if (!meta) return Promise.resolve();
    FF.rememberBrand(slug);

    return FF.getBrand(slug).then(function (brand) {
      var grupos = FF.groupCategories(brand);
      var ctx = FF.ctx();

      /* ---- HEADER ---- */
      var navItems = grupos.map(function (g) {
        var links = g.categorias.map(function (c) {
          var on = ctx.categoria === c.id ? ' is-active' : '';
          return '<a class="bnav__link' + on + '" href="/' + slug + '/' + c.id + '/">' +
            FF.escape(c.nombre) + '<span class="bnav__count">' + c.cantidad + '</span></a>';
        }).join('');
        return '<div class="bnav__group"><p class="bnav__group-title">' + FF.escape(g.nombre) + '</p>' +
          '<div class="bnav__links">' + links + '</div></div>';
      }).join('');

      var header = FF.el('header', { class: 'bheader', id: 'bheader' });
      header.innerHTML =
        '<a class="bheader__back" href="/">' + FF.icon('back', 16) + '<span>Fashion Forward</span></a>' +
        '<div class="bheader__bar">' +
          '<button class="bheader__burger" type="button" aria-label="Abrir menú" aria-expanded="false">' +
            FF.icon('menu', 22) + '</button>' +
          '<a class="bheader__logo" href="/' + slug + '/">' + FF.escape(meta.nombre) + '</a>' +
          '<nav class="bheader__nav" aria-label="Categorías">' + navItems + '</nav>' +
          '<div class="bheader__actions">' +
            '<button class="bheader__icon js-search-open" type="button" aria-label="Buscar">' + FF.icon('search', 20) + '</button>' +
            '<a class="bheader__icon bheader__cart" href="/carrito/?marca=' + slug + '" aria-label="Ver carrito">' +
              FF.icon('cart', 20) + '<span class="bheader__badge" data-cart-badge="' + slug + '">0</span></a>' +
          '</div>' +
        '</div>' +
        '<div class="bdrawer" hidden>' +
          '<div class="bdrawer__panel">' +
            '<div class="bdrawer__top"><span>' + FF.escape(meta.nombre) + '</span>' +
              '<button class="bdrawer__close" type="button" aria-label="Cerrar menú">' + FF.icon('close', 22) + '</button></div>' +
            '<nav class="bdrawer__nav" aria-label="Categorías">' + navItems + '</nav>' +
            '<a class="bdrawer__back" href="/">' + FF.icon('back', 16) + ' Volver a Fashion Forward</a>' +
          '</div>' +
        '</div>';
      document.body.insertBefore(header, document.body.firstChild);

      /* El drawer se saca del header: si queda adentro hereda su stacking
         context (z-index 60) y termina por debajo del boton flotante. */
      var drawer = FF.qs('.bdrawer', header);
      document.body.appendChild(drawer);
      var burger = FF.qs('.bheader__burger', header);
      function toggle(open) {
        drawer.hidden = !open;
        document.body.classList.toggle('is-locked', open);
        burger.setAttribute('aria-expanded', String(open));
      }
      burger.addEventListener('click', function () { toggle(drawer.hidden); });
      FF.qs('.bdrawer__close', drawer).addEventListener('click', function () { toggle(false); });
      FF.qsa('a', drawer).forEach(function (a) { a.addEventListener('click', function () { toggle(false); }); });
      drawer.addEventListener('click', function (e) { if (e.target === drawer) toggle(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) toggle(false); });

      /* sombra al scrollear */
      var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      /* ---- FOOTER ---- */
      var catLinks = (brand.categorias || []).map(function (c) {
        return '<a href="/' + slug + '/' + c.id + '/">' + FF.escape(c.nombre) + '</a>';
      }).join('');

      var footer = FF.el('footer', { class: 'bfooter' });
      footer.innerHTML =
        '<div class="bfooter__inner">' +
          '<div class="bfooter__col bfooter__brand">' +
            '<p class="bfooter__logo">' + FF.escape(meta.nombre) + '</p>' +
            '<p class="bfooter__claim">' + FF.escape(meta.claim) + '</p>' +
            '<p class="bfooter__desc">' + FF.escape(meta.descripcion) + '</p>' +
          '</div>' +
          '<div class="bfooter__col"><p class="bfooter__title">Categorías</p><div class="bfooter__links">' + catLinks + '</div></div>' +
          '<div class="bfooter__col"><p class="bfooter__title">Contacto</p><div class="bfooter__links">' +
            '<a href="mailto:' + CFG.CONTACTO.email + '">' + CFG.CONTACTO.email + '</a>' +
            '<a href="/contacto/">Formulario de contacto</a>' +
            '<span>' + FF.escape(CFG.CONTACTO.horario) + '</span>' +
            '<span>' + FF.escape(CFG.CONTACTO.direccion) + '</span>' +
          '</div></div>' +
          '<div class="bfooter__col"><p class="bfooter__title">Fashion Forward</p><div class="bfooter__links">' +
            '<a href="/">Home multimarca</a><a href="/furla/">Furla</a><a href="/bally/">Bally</a><a href="/liujo/">Liu Jo</a>' +
          '</div></div>' +
        '</div>' +
        '<div class="bfooter__bottom">' +
          '<span>© ' + new Date().getFullYear() + ' Fashion Forward · Todas las marcas son propiedad de sus respectivos titulares.</span>' +
          '<a class="bfooter__home" href="/">' + FF.icon('back', 14) + ' Volver a Fashion Forward</a>' +
        '</div>';
      document.body.appendChild(footer);

      return brand;
    });
  };

  /* ---------------- toast ---------------- */
  var toastTimer = null;
  FF.toast = function (msg, kind) {
    var t = FF.qs('#ff-toast');
    if (!t) {
      t = FF.el('div', { id: 'ff-toast', class: 'ff-toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(t);
    }
    t.className = 'ff-toast is-visible' + (kind ? ' is-' + kind : '');
    t.innerHTML = FF.icon('check', 18) + '<span>' + FF.escape(msg) + '</span>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2600);
  };

  /* ---------------- reveal on scroll (paginas de marca) ----------------
     Animacion discreta, sin librerias, respetando prefers-reduced-motion. */
  FF.reveal = function (root) {
    var nodes = FF.qsa('[data-reveal]', root || document);
    if (!nodes.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(function (n) { io.observe(n); });
  };

  /* Lazy: marca las imagenes cargadas para el fade-in */
  FF.watchImages = function (root) {
    FF.qsa('img[loading="lazy"]', root || document).forEach(function (img) {
      if (img.complete) img.classList.add('is-loaded');
      else img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
    });
  };

})();
