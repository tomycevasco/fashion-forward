/* ============================================================
   FASHION FORWARD — BUSCADOR
   Overlay unico, reutilizado en toda la web.
   · En una pagina de marca prioriza los resultados de esa marca.
   · En la home busca en las 3 marcas a la vez.
   Busqueda simple por titulo + tipo + codigo + color + categoria.
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF = window.FF || {};
  var CFG = window.FF_CONFIG;
  var overlay = null, input = null, results = null, index = null, timer = null;

  function norm(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function buildIndex() {
    if (index) return Promise.resolve(index);
    return FF.loadData().then(function (data) {
      index = [];
      Object.keys(CFG.MARCAS).forEach(function (slug) {
        var brand = data[slug];
        if (!brand) return;
        var catName = {};
        (brand.categorias || []).forEach(function (c) { catName[c.id] = c.nombre; });
        (brand.productos || []).forEach(function (p) {
          index.push({
            p: p,
            slug: slug,
            marca: brand.nombre,
            cat: catName[p.categoria] || p.categoria,
            hay: norm([p.titulo, p.tipo, p.codigo, (p.colores || []).join(' '), catName[p.categoria], brand.nombre].join(' '))
          });
        });
      });
      return index;
    });
  }

  function render(q) {
    var query = norm(q).trim();
    if (query.length < 2) {
      results.innerHTML = '<p class="srch__hint">Escribí al menos 2 letras. Probá con “vestido”, “bolso”, “stiletto”…</p>';
      return;
    }
    var terms = query.split(/\s+/);
    var hits = index.filter(function (r) {
      return terms.every(function (t) { return r.hay.indexOf(t) >= 0; });
    });

    var here = document.body.dataset.marca;
    if (here) {
      hits.sort(function (a, b) {
        return (a.slug === here ? 0 : 1) - (b.slug === here ? 0 : 1);
      });
    }

    if (!hits.length) {
      results.innerHTML = '<p class="srch__hint">Sin resultados para “' + FF.escape(q) + '”.<br>' +
        'Probá con otra palabra o mirá el catálogo completo de <a href="/furla/">Furla</a>, ' +
        '<a href="/bally/">Bally</a> o <a href="/liujo/">Liu Jo</a>.</p>';
      return;
    }

    var total = hits.length;
    var html = '<p class="srch__count">' + total + ' resultado' + (total === 1 ? '' : 's') + '</p><div class="srch__list">';
    hits.slice(0, 40).forEach(function (r) {
      var img = (r.p.imagenes || [])[0] || '';
      html +=
        '<a class="srch__item" href="/' + r.slug + '/producto/?id=' + encodeURIComponent(r.p.id) + '">' +
          '<span class="srch__thumb' + (r.p.recorte === 'top' ? ' is-tall' : '') + '">' +
            (img ? '<img src="' + img + '" alt="" loading="lazy">' : '') + '</span>' +
          '<span class="srch__meta">' +
            '<span class="srch__brand">' + FF.escape(r.marca) + ' · ' + FF.escape(r.cat) + '</span>' +
            '<span class="srch__title">' + FF.escape(r.p.titulo) + '</span>' +
            '<span class="srch__price">' + FF.money(r.p.precio) + '</span>' +
          '</span>' +
        '</a>';
    });
    html += '</div>';
    if (total > 40) html += '<p class="srch__hint">Mostrando los primeros 40 resultados.</p>';
    results.innerHTML = html;
  }

  function mount() {
    if (overlay) return;
    overlay = FF.el('div', { class: 'srch', hidden: 'hidden', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Buscar productos' });
    overlay.innerHTML =
      '<div class="srch__backdrop"></div>' +
      '<div class="srch__panel">' +
        '<div class="srch__bar">' + FF.icon('search', 20) +
          '<input class="srch__input" type="search" placeholder="Buscar productos, marcas, códigos…" autocomplete="off" aria-label="Buscar">' +
          '<button class="srch__close" type="button" aria-label="Cerrar buscador">' + FF.icon('close', 20) + '</button>' +
        '</div>' +
        '<div class="srch__results"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    input = FF.qs('.srch__input', overlay);
    results = FF.qs('.srch__results', overlay);

    FF.qs('.srch__close', overlay).addEventListener('click', close);
    FF.qs('.srch__backdrop', overlay).addEventListener('click', close);
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var v = input.value;
      timer = setTimeout(function () { render(v); }, 120);
    });
  }

  function open(prefill) {
    mount();
    buildIndex().then(function () {
      overlay.hidden = false;
      document.body.classList.add('is-locked');
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      if (prefill) input.value = prefill;
      render(input.value);
      setTimeout(function () { input.focus(); }, 60);
    });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () { overlay.hidden = true; }, 220);
  }

  FF.openSearch = open;

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.js-search-open');
    if (t) { e.preventDefault(); open(t.dataset.q || ''); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && !overlay.hidden) close();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) &&
        !/input|textarea|select/i.test((e.target.tagName || ''))) {
      e.preventDefault(); open();
    }
  });

  // Formulario de busqueda de la home (submit -> abre overlay con el texto)
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('.js-search-form');
    if (!f) return;
    e.preventDefault();
    open((FF.qs('input', f) || {}).value || '');
  });
})();
