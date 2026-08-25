/* ============================================================
   FASHION FORWARD — RENDER DE PRODUCTOS
   Lee /assets/data/products.json y pinta:
     · grillas de producto (home de marca, categorias, busqueda)
     · pagina de categoria (con orden y filtros simples)
     · detalle de producto (/[marca]/producto/?id=xxx)
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF = window.FF || {};
  var CFG = window.FF_CONFIG;

  /* ---------------- tarjeta de producto ---------------- */
  FF.productCard = function (p, slug) {
    var img = (p.imagenes && p.imagenes[0]) || '';
    var necesitaOpciones = (p.talles || []).length > 1;
    var href = '/' + slug + '/producto/?id=' + encodeURIComponent(p.id);
    var color = (p.colores || [])[0];

    var tall = p.recorte === 'top' ? ' is-tall' : '';

    var art = FF.el('article', { class: 'pcard', 'data-reveal': '', 'data-id': p.id });
    art.innerHTML =
      '<a class="pcard__media' + tall + '" href="' + href + '" aria-label="' + FF.escape(p.titulo) + '">' +
        (img ? '<img src="' + img + '" alt="' + FF.escape(p.titulo) + '" loading="lazy" decoding="async">'
             : '<span class="pcard__noimg">Sin imagen</span>') +
        (necesitaOpciones ? '<span class="pcard__chip">' + (p.talles || []).length + ' talles</span>' : '') +
      '</a>' +
      '<div class="pcard__body">' +
        '<a class="pcard__title" href="' + href + '">' + FF.escape(p.titulo) + '</a>' +
        '<p class="pcard__meta">' + FF.escape(color || p.tipo || '') +
          (p.codigo ? '<span class="pcard__code">' + FF.escape(p.codigo) + '</span>' : '') + '</p>' +
        '<div class="pcard__foot">' +
          '<span class="pcard__price">' + FF.money(p.precio) + '</span>' +
          (necesitaOpciones
            ? '<a class="pcard__btn" href="' + href + '">Elegir talle</a>'
            : '<button class="pcard__btn js-add" type="button">Agregar</button>') +
        '</div>' +
      '</div>';

    var addBtn = FF.qs('.js-add', art);
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var talle = (p.talles || [])[0] || null;
        FF.Cart.add(slug, FF.Cart.itemFrom(p, slug, talle, color, 1));
        FF.toast('Agregado al carrito de ' + (CFG.MARCAS[slug] || {}).nombre);
        addBtn.classList.add('is-done');
        addBtn.textContent = 'Agregado ✓';
        setTimeout(function () { addBtn.classList.remove('is-done'); addBtn.textContent = 'Agregar'; }, 1800);
      });
    }
    return art;
  };

  FF.renderGrid = function (container, productos, slug) {
    container.innerHTML = '';
    if (!productos.length) {
      container.innerHTML = '<p class="pgrid__empty">No encontramos productos con ese criterio.</p>';
      return;
    }
    var frag = document.createDocumentFragment();
    productos.forEach(function (p) { frag.appendChild(FF.productCard(p, slug)); });
    container.appendChild(frag);
    FF.reveal(container);
    FF.watchImages(container);
  };

  /* ---------------- orden ---------------- */
  var SORTS = {
    destacados: null,
    'precio-asc': function (a, b) { return a.precio - b.precio; },
    'precio-desc': function (a, b) { return b.precio - a.precio; },
    'nombre': function (a, b) { return a.titulo.localeCompare(b.titulo, 'es'); }
  };

  /* ---------------- pagina de categoria ---------------- */
  FF.initCategoryPage = function () {
    var ctx = FF.ctx();
    if (!ctx.marca || !ctx.categoria) return;

    FF.getBrand(ctx.marca).then(function (brand) {
      var cat = FF.getCategory(brand, ctx.categoria);
      var productos = brand.productos.filter(function (p) { return p.categoria === ctx.categoria; });
      var nombreCat = cat ? cat.nombre : ctx.categoria;
      var marcaNombre = (CFG.MARCAS[ctx.marca] || {}).nombre || ctx.marca;

      document.title = nombreCat + ' ' + marcaNombre + ' — Fashion Forward';

      var root = FF.qs('#cat-root');
      var colores = [];
      productos.forEach(function (p) {
        (p.colores || []).forEach(function (c) { if (c && colores.indexOf(c) < 0) colores.push(c); });
      });
      colores.sort(function (a, b) { return a.localeCompare(b, 'es'); });

      var talles = [];
      productos.forEach(function (p) {
        (p.talles || []).forEach(function (t) { if (t && talles.indexOf(t) < 0) talles.push(t); });
      });

      root.innerHTML =
        '<div class="cat-head" data-reveal>' +
          '<nav class="crumbs"><a href="/">Fashion Forward</a>' + FF.icon('chevron', 12) +
            '<a href="/' + ctx.marca + '/">' + FF.escape(marcaNombre) + '</a>' + FF.icon('chevron', 12) +
            '<span>' + FF.escape(nombreCat) + '</span></nav>' +
          '<h1 class="cat-title">' + FF.escape(nombreCat) + '</h1>' +
          (cat ? '<p class="cat-sub">' + FF.escape(cat.seccion) + ' · <span id="cat-count">' + productos.length + '</span> productos</p>' : '') +
        '</div>' +
        '<div class="cat-tools">' +
          '<div class="cat-filters">' +
            (talles.length ? '<label class="cat-select"><span>Talle</span><select id="f-talle"><option value="">Todos</option>' +
              talles.map(function (t) { return '<option>' + FF.escape(t) + '</option>'; }).join('') + '</select></label>' : '') +
            (colores.length > 1 ? '<label class="cat-select"><span>Color</span><select id="f-color"><option value="">Todos</option>' +
              colores.map(function (c) { return '<option>' + FF.escape(c) + '</option>'; }).join('') + '</select></label>' : '') +
          '</div>' +
          '<label class="cat-select"><span>Ordenar</span><select id="f-sort">' +
            '<option value="destacados">Destacados</option>' +
            '<option value="precio-asc">Precio: menor a mayor</option>' +
            '<option value="precio-desc">Precio: mayor a menor</option>' +
            '<option value="nombre">Nombre A-Z</option>' +
          '</select></label>' +
        '</div>' +
        '<div class="pgrid" id="cat-grid"></div>' +
        '<div class="cat-more" data-reveal><p>¿Buscabas otra cosa?</p><div class="cat-more__links" id="cat-more-links"></div></div>';

      var grid = FF.qs('#cat-grid');

      function apply() {
        var t = (FF.qs('#f-talle') || {}).value || '';
        var c = (FF.qs('#f-color') || {}).value || '';
        var s = (FF.qs('#f-sort') || {}).value || 'destacados';
        var list = productos.filter(function (p) {
          if (t && (p.talles || []).indexOf(t) < 0) return false;
          if (c && (p.colores || []).indexOf(c) < 0) return false;
          return true;
        });
        if (SORTS[s]) list = list.slice().sort(SORTS[s]);
        FF.renderGrid(grid, list, ctx.marca);
        var cc = FF.qs('#cat-count');
        if (cc) cc.textContent = list.length;
      }

      ['#f-talle', '#f-color', '#f-sort'].forEach(function (sel) {
        var n = FF.qs(sel);
        if (n) n.addEventListener('change', apply);
      });
      apply();

      FF.qs('#cat-more-links').innerHTML = (brand.categorias || [])
        .filter(function (c) { return c.id !== ctx.categoria; })
        .map(function (c) { return '<a href="/' + ctx.marca + '/' + c.id + '/">' + FF.escape(c.nombre) + '</a>'; })
        .join('');

      FF.reveal();
    });
  };

  /* ---------------- detalle de producto ---------------- */
  FF.initProductPage = function () {
    var ctx = FF.ctx();
    var id = FF.param('id');
    var root = FF.qs('#prod-root');
    if (!ctx.marca || !root) return;

    if (!id) { root.innerHTML = '<p class="pgrid__empty">Producto no especificado.</p>'; return; }

    FF.getBrand(ctx.marca).then(function (brand) {
      var p = brand.productos.filter(function (x) { return x.id === id; })[0];
      var marcaNombre = (CFG.MARCAS[ctx.marca] || {}).nombre || ctx.marca;

      if (!p) {
        root.innerHTML = '<div class="prod-404"><h1>No encontramos ese producto</h1>' +
          '<a class="btn" href="/' + ctx.marca + '/">Volver a ' + FF.escape(marcaNombre) + '</a></div>';
        return;
      }

      document.title = p.titulo + ' — ' + marcaNombre + ' | Fashion Forward';
      var cat = FF.getCategory(brand, p.categoria);
      var img = (p.imagenes && p.imagenes[0]) || '';
      var color = (p.colores || [])[0] || null;
      var talles = p.talles || [];

      root.innerHTML =
        '<nav class="crumbs" data-reveal><a href="/">Fashion Forward</a>' + FF.icon('chevron', 12) +
          '<a href="/' + ctx.marca + '/">' + FF.escape(marcaNombre) + '</a>' + FF.icon('chevron', 12) +
          (cat ? '<a href="/' + ctx.marca + '/' + cat.id + '/">' + FF.escape(cat.nombre) + '</a>' + FF.icon('chevron', 12) : '') +
          '<span>' + FF.escape(p.titulo) + '</span></nav>' +
        '<div class="prod" data-reveal>' +
          '<div class="prod__media' + (p.recorte === 'top' ? ' is-tall' : '') + '">' +
            (img ? '<img src="' + img + '" alt="' + FF.escape(p.titulo) + '" decoding="async">'
                 : '<span class="pcard__noimg">Sin imagen</span>') +
          '</div>' +
          '<div class="prod__info">' +
            '<p class="prod__brand">' + FF.escape(marcaNombre) + (cat ? ' · ' + FF.escape(cat.nombre) : '') + '</p>' +
            '<h1 class="prod__title">' + FF.escape(p.titulo) + '</h1>' +
            '<p class="prod__price">' + FF.money(p.precio) + '</p>' +
            '<p class="prod__stock">' + (p.stock ? FF.icon('check', 15) + ' Disponible' : 'Sin stock') + '</p>' +
            '<p class="prod__desc">' + FF.escape(p.descripcion || '') + '</p>' +
            (talles.length
              ? '<div class="prod__field"><p class="prod__label">Talle' +
                  (talles.length > 1 ? '' : ' único') + '</p><div class="chips" id="talles">' +
                  talles.map(function (t, i) {
                    return '<button class="chip' + (i === 0 ? ' is-on' : '') + '" type="button" data-talle="' +
                      FF.escape(t) + '">' + FF.escape(t) + '</button>';
                  }).join('') + '</div></div>'
              : '') +
            (color ? '<div class="prod__field"><p class="prod__label">Color</p><p class="prod__value">' + FF.escape(color) + '</p></div>' : '') +
            '<div class="prod__field"><p class="prod__label">Cantidad</p>' +
              '<div class="qty"><button type="button" class="qty__btn" data-step="-1" aria-label="Restar">−</button>' +
              '<input class="qty__input" id="qty" type="number" value="1" min="1" max="20" inputmode="numeric">' +
              '<button type="button" class="qty__btn" data-step="1" aria-label="Sumar">+</button></div></div>' +
            '<div class="prod__actions">' +
              '<button class="btn btn--solid" type="button" id="add">' + FF.icon('cart', 18) + ' Agregar al carrito</button>' +
              '<a class="btn btn--wa" id="wa" href="#" target="_blank" rel="noopener">' + FF.icon('whatsapp', 18) + ' Consultar</a>' +
            '</div>' +
            '<dl class="prod__specs">' +
              (p.codigo ? '<div><dt>Código</dt><dd>' + FF.escape(p.codigo) + '</dd></div>' : '') +
              (p.tipo ? '<div><dt>Tipo</dt><dd>' + FF.escape(p.tipo) + '</dd></div>' : '') +
              '<div><dt>Marca</dt><dd>' + FF.escape(marcaNombre) + '</dd></div>' +
              '<div><dt>Envíos</dt><dd>A todo el país. Retiro por showroom con cita previa.</dd></div>' +
            '</dl>' +
          '</div>' +
        '</div>' +
        '<section class="prod__related"><h2 class="sec-title" data-reveal>También te puede gustar</h2>' +
          '<div class="pgrid" id="related"></div></section>';

      /* talles */
      var talleSel = talles[0] || null;
      FF.qsa('#talles .chip').forEach(function (c) {
        c.addEventListener('click', function () {
          FF.qsa('#talles .chip').forEach(function (x) { x.classList.remove('is-on'); });
          c.classList.add('is-on');
          talleSel = c.dataset.talle;
        });
      });

      /* cantidad */
      var qty = FF.qs('#qty');
      FF.qsa('.qty__btn').forEach(function (b) {
        b.addEventListener('click', function () {
          var v = parseInt(qty.value, 10) || 1;
          qty.value = Math.max(1, Math.min(20, v + parseInt(b.dataset.step, 10)));
        });
      });

      /* agregar */
      FF.qs('#add').addEventListener('click', function () {
        var n = Math.max(1, Math.min(20, parseInt(qty.value, 10) || 1));
        FF.Cart.add(ctx.marca, FF.Cart.itemFrom(p, ctx.marca, talleSel, color, n));
        FF.toast('Agregado al carrito de ' + marcaNombre);
      });

      /* whatsapp */
      FF.qs('#wa').href = FF.waLink(FF.waProducto(p, marcaNombre));

      /* relacionados */
      var rel = brand.productos.filter(function (x) { return x.categoria === p.categoria && x.id !== p.id; });
      if (rel.length < 4) {
        rel = rel.concat(brand.productos.filter(function (x) {
          return x.categoria !== p.categoria && x.id !== p.id;
        }));
      }
      FF.renderGrid(FF.qs('#related'), rel.slice(0, 4), ctx.marca);
      FF.reveal();
      FF.watchImages();
    });
  };

})();

/* ============================================================
   HOME DE MARCA — rellena categorias, destacados y contadores
   ============================================================ */
(function () {
  'use strict';
  var FF = window.FF;

  FF.initBrandHome = function () {
    var ctx = FF.ctx();
    if (!ctx.marca) return;

    FF.getBrand(ctx.marca).then(function (brand) {
      /* contadores */
      var n = FF.qs('[data-brand-count]');
      if (n) n.textContent = brand.productos.length;
      var c = FF.qs('[data-brand-catcount]');
      if (c) c.textContent = brand.categorias.length;
      var s = FF.qs('[data-brand-seccount]');
      if (s) s.textContent = FF.groupCategories(brand).length;

      /* grilla de categorias, agrupada por seccion */
      var host = FF.qs('[data-brand-cats]');
      if (host) {
        host.innerHTML = FF.groupCategories(brand).map(function (g) {
          return '<div class="bsec__group" data-reveal>' +
            (FF.groupCategories(brand).length > 1
              ? '<p class="eyebrow" style="margin-bottom:1rem">' + FF.escape(g.nombre) + '</p>' : '') +
            '<div class="bcats">' + g.categorias.map(function (cat) {
              return '<a class="bcat" href="/' + ctx.marca + '/' + cat.id + '/">' +
                '<span class="bcat__img">' + (cat.portada
                  ? '<img src="' + cat.portada + '" alt="' + FF.escape(cat.nombre) + '" loading="lazy" decoding="async">' : '') + '</span>' +
                '<span class="bcat__b"><span class="bcat__n">' + FF.escape(cat.nombre) + '</span>' +
                '<span class="bcat__c">' + cat.cantidad + ' producto' + (cat.cantidad === 1 ? '' : 's') + '</span></span>' +
              '</a>';
            }).join('') + '</div></div>';
        }).join('');
        FF.watchImages(host);
      }

      /* destacados: uno por categoria hasta completar la grilla */
      var feat = FF.qs('[data-brand-featured]');
      if (feat) {
        var pick = [], porCat = {};
        brand.productos.forEach(function (p) {
          if (p.recorte === 'top') return;
          porCat[p.categoria] = porCat[p.categoria] || [];
          porCat[p.categoria].push(p);
        });
        var keys = Object.keys(porCat), i = 0;
        while (pick.length < 8 && i < 12) {
          keys.forEach(function (k) {
            if (pick.length < 8 && porCat[k][i]) pick.push(porCat[k][i]);
          });
          i++;
        }
        FF.renderGrid(feat, pick.slice(0, 8), ctx.marca);
      }

      /* imagen del hero: la portada de la categoria mas grande */
      var heroImg = FF.qs('[data-brand-hero]');
      if (heroImg && !heroImg.getAttribute('src')) {
        var top = brand.categorias.slice().sort(function (a, b) { return b.cantidad - a.cantidad; })[0];
        if (top && top.portada) heroImg.setAttribute('src', top.portada);
      }

      FF.reveal();
    });
  };
})();
