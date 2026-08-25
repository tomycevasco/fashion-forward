/* ============================================================
   FASHION FORWARD — CARRITO
   Un carrito INDEPENDIENTE por marca: localStorage cart_furla,
   cart_bally, cart_liujo. Logica generica parametrizada por slug.
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF = window.FF || {};
  var CFG = window.FF_CONFIG;
  var KEY = function (slug) { return 'cart_' + slug; };
  var MAX_QTY = 20;

  var Cart = FF.Cart = {

    /* --- lectura / escritura --- */
    get: function (slug) {
      try {
        var raw = localStorage.getItem(KEY(slug));
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    },

    save: function (slug, items) {
      try { localStorage.setItem(KEY(slug), JSON.stringify(items)); } catch (e) {}
      Cart.refreshBadges();
      document.dispatchEvent(new CustomEvent('ff:cart', { detail: { marca: slug, items: items } }));
    },

    /* Identidad de una linea: mismo producto + mismo talle + mismo color */
    lineKey: function (it) {
      return [it.id, it.talle || '-', it.color || '-'].join('::');
    },

    add: function (slug, item) {
      var items = Cart.get(slug);
      var k = Cart.lineKey(item);
      var found = items.filter(function (i) { return Cart.lineKey(i) === k; })[0];
      if (found) {
        found.cantidad = Math.min(MAX_QTY, (found.cantidad || 1) + (item.cantidad || 1));
      } else {
        item.cantidad = Math.min(MAX_QTY, item.cantidad || 1);
        items.push(item);
      }
      Cart.save(slug, items);
      return items;
    },

    setQty: function (slug, key, qty) {
      var items = Cart.get(slug).map(function (i) {
        if (Cart.lineKey(i) === key) i.cantidad = Math.max(1, Math.min(MAX_QTY, qty));
        return i;
      });
      Cart.save(slug, items);
      return items;
    },

    remove: function (slug, key) {
      var items = Cart.get(slug).filter(function (i) { return Cart.lineKey(i) !== key; });
      Cart.save(slug, items);
      return items;
    },

    clear: function (slug) { Cart.save(slug, []); },

    count: function (slug) {
      return Cart.get(slug).reduce(function (a, i) { return a + (i.cantidad || 1); }, 0);
    },

    total: function (slug) {
      return Cart.get(slug).reduce(function (a, i) { return a + (i.precio || 0) * (i.cantidad || 1); }, 0);
    },

    /* Marcas que hoy tienen algo adentro */
    marcasConItems: function () {
      return Object.keys(CFG.MARCAS).filter(function (s) { return Cart.count(s) > 0; });
    },

    refreshBadges: function () {
      FF.qsa('[data-cart-badge]').forEach(function (b) {
        var n = Cart.count(b.dataset.cartBadge);
        b.textContent = n;
        b.classList.toggle('is-empty', n === 0);
      });
    },

    /* Construye el item de carrito a partir de un producto del JSON */
    itemFrom: function (product, marca, talle, color, cantidad) {
      return {
        id: product.id,
        marca: marca,
        titulo: product.titulo,
        codigo: product.codigo || null,
        categoria: product.categoria,
        precio: product.precio,
        imagen: (product.imagenes && product.imagenes[0]) || '',
        recorte: product.recorte || null,
        talle: talle || null,
        color: color || null,
        cantidad: cantidad || 1
      };
    }
  };

  /* Sincroniza entre pestañas abiertas */
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('cart_') === 0) Cart.refreshBadges();
  });

  document.addEventListener('DOMContentLoaded', Cart.refreshBadges);
})();
