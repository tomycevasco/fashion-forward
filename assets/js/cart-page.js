/* ============================================================
   FASHION FORWARD — PAGINA DE CARRITO
   Muestra el carrito de UNA marca por vez (son independientes).
   La marca sale de ?marca=xxx o, si no viene, de la ultima visitada.
   Las pestañas dejan saltar entre carritos sin mezclarlos.
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF;
  var CFG = window.FF_CONFIG;
  var actual = null;

  function marcaInicial() {
    var p = FF.param('marca');
    if (p && CFG.MARCAS[p]) return p;
    var conItems = FF.Cart.marcasConItems();
    if (conItems.length) return conItems[0];
    return FF.lastBrand();
  }

  function tabs() {
    var host = FF.qs('#ctabs');
    if (!host) return;
    host.innerHTML = Object.keys(CFG.MARCAS).map(function (slug) {
      var n = FF.Cart.count(slug);
      return '<button class="ctab' + (slug === actual ? ' is-on' : '') + '" type="button" data-marca="' + slug + '">' +
        FF.escape(CFG.MARCAS[slug].nombre) + (n ? '<b>' + n + '</b>' : '') + '</button>';
    }).join('');
    FF.qsa('.ctab', host).forEach(function (t) {
      t.addEventListener('click', function () {
        actual = t.dataset.marca;
        history.replaceState(null, '', '/carrito/?marca=' + actual);
        render();
      });
    });
  }

  function render() {
    var host = FF.qs('#cart-root');
    var items = FF.Cart.get(actual);
    var meta = CFG.MARCAS[actual] || { nombre: actual };
    var total = FF.Cart.total(actual);

    FF.rememberBrand(actual);
    tabs();

    var seguir = FF.qs('#seguir');
    if (seguir) {
      seguir.href = '/' + actual + '/';
      seguir.innerHTML = FF.icon('back', 15) + '<span>Seguir comprando en ' + FF.escape(meta.nombre) + '</span>';
    }
    var sub = FF.qs('#cart-sub');
    if (sub) sub.textContent = items.length
      ? meta.nombre + ' · ' + FF.Cart.count(actual) + ' artículo' + (FF.Cart.count(actual) === 1 ? '' : 's')
      : meta.nombre;

    /* ---- vacio ---- */
    if (!items.length) {
      host.innerHTML =
        '<div class="cempty">' +
          '<h2>Tu carrito de ' + FF.escape(meta.nombre) + ' está vacío</h2>' +
          '<p>Los carritos de cada marca son independientes: si agregaste algo en otra marca, ' +
             'cambiá de pestaña acá arriba.</p>' +
          '<div class="cempty__links">' +
            Object.keys(CFG.MARCAS).map(function (s) {
              return '<a class="btn btn--ghost" href="/' + s + '/">Ver ' + FF.escape(CFG.MARCAS[s].nombre) + '</a>';
            }).join('') +
          '</div>' +
        '</div>';
      return;
    }

    /* ---- lineas + resumen ---- */
    var lineas = items.map(function (i) {
      var key = FF.Cart.lineKey(i);
      var href = '/' + i.marca + '/producto/?id=' + encodeURIComponent(i.id);
      return '<article class="cline" data-key="' + FF.escape(key) + '">' +
        '<a class="cline__img' + (i.recorte === 'top' ? ' is-tall' : '') + '" href="' + href + '">' +
          (i.imagen ? '<img src="' + i.imagen + '" alt="' + FF.escape(i.titulo) + '" loading="lazy">' : '') + '</a>' +
        '<div class="cline__info">' +
          '<a class="cline__title" href="' + href + '">' + FF.escape(i.titulo) + '</a>' +
          '<p class="cline__meta">' +
            (i.color ? '<span>Color: ' + FF.escape(i.color) + '</span>' : '') +
            (i.talle ? '<span>Talle: ' + FF.escape(i.talle) + '</span>' : '') +
            (i.codigo ? '<span>' + FF.escape(i.codigo) + '</span>' : '') +
          '</p>' +
          '<p class="cline__unit">' + FF.money(i.precio) + ' c/u</p>' +
          '<div class="qty" style="margin-top:.5rem">' +
            '<button class="qty__btn" type="button" data-act="menos" aria-label="Restar">−</button>' +
            '<input class="qty__input" type="number" value="' + i.cantidad + '" min="1" max="20" inputmode="numeric" aria-label="Cantidad">' +
            '<button class="qty__btn" type="button" data-act="mas" aria-label="Sumar">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cline__ctrl">' +
          '<span class="cline__sub">' + FF.money(i.precio * i.cantidad) + '</span>' +
          '<button class="cline__del" type="button" data-act="borrar">' + FF.icon('trash', 15) + ' Quitar</button>' +
        '</div>' +
      '</article>';
    }).join('');

    host.innerHTML =
      '<div class="cart">' +
        '<div class="cart__list">' + lineas + '</div>' +
        '<aside class="csum">' +
          '<h2 class="csum__title">Resumen</h2>' +
          '<div class="csum__row"><span>Productos (' + FF.Cart.count(actual) + ')</span><span>' + FF.money(total) + '</span></div>' +
          '<div class="csum__row"><span>Envío</span><span>A coordinar</span></div>' +
          '<div class="csum__row csum__row--total"><span>Total</span><span>' + FF.money(total) + '</span></div>' +
          '<div class="csum__actions">' +
            '<button class="btn btn--wa btn--block js-wa-pedido" type="button">' + FF.icon('whatsapp', 18) + ' Enviar pedido por WhatsApp</button>' +
            '<button class="btn btn--mp btn--block" type="button" id="mp">' + mpLogo() + ' Pagar con Mercado Pago</button>' +
          '</div>' +
          '<p class="csum__note">Al enviar el pedido se abre WhatsApp con el detalle completo ya escrito. ' +
            'Confirmamos stock, forma de pago y envío por ese mismo chat.</p>' +
          '<button class="csum__clear" type="button" id="vaciar">Vaciar carrito de ' + FF.escape(meta.nombre) + '</button>' +
        '</aside>' +
      '</div>';

    FF.watchImages(host);

    /* ---- eventos de cada linea ---- */
    FF.qsa('.cline', host).forEach(function (line) {
      var key = line.dataset.key;
      var input = FF.qs('.qty__input', line);

      FF.qs('[data-act="mas"]', line).addEventListener('click', function () {
        FF.Cart.setQty(actual, key, (parseInt(input.value, 10) || 1) + 1); render();
      });
      FF.qs('[data-act="menos"]', line).addEventListener('click', function () {
        var v = parseInt(input.value, 10) || 1;
        if (v <= 1) { FF.Cart.remove(actual, key); FF.toast('Producto quitado'); }
        else FF.Cart.setQty(actual, key, v - 1);
        render();
      });
      input.addEventListener('change', function () {
        FF.Cart.setQty(actual, key, parseInt(input.value, 10) || 1); render();
      });
      FF.qs('[data-act="borrar"]', line).addEventListener('click', function () {
        FF.Cart.remove(actual, key); FF.toast('Producto quitado'); render();
      });
    });

    /* ---- checkout ---- */
    FF.qs('.js-wa-pedido', host).addEventListener('click', function () {
      var msg = FF.waPedido(actual, FF.Cart.get(actual), FF.Cart.total(actual));
      window.open(FF.waLink(msg), '_blank', 'noopener');
    });
    FF.qs('#mp', host).addEventListener('click', FF.mercadoPago);
    FF.qs('#vaciar', host).addEventListener('click', function () {
      FF.modal({
        titulo: '¿Vaciar el carrito?',
        html: '<p>Se van a quitar los ' + FF.Cart.count(actual) + ' artículos del carrito de ' +
              FF.escape(meta.nombre) + '. Los carritos de las otras marcas no se tocan.</p>' +
              '<button class="btn btn--solid btn--block" id="confirm-clear" style="margin-top:1rem">Sí, vaciar</button>'
      });
      FF.qs('#confirm-clear').addEventListener('click', function () {
        FF.Cart.clear(actual);
        FF.qs('.ff-modal').remove();
        document.body.classList.remove('is-locked');
        FF.toast('Carrito vaciado');
        render();
      });
    });
  }

  function mpLogo() {
    // Isotipo simplificado, dibujado a mano (no es el logo oficial de Mercado Pago)
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 4.2c-4.5 0-8.2 2.6-8.2 5.9 0 1.6.9 3 2.3 4.1l-.5 2.3a.5.5 0 0 0 .75.54l2.4-1.35c1 .28 2.1.43 3.25.43 4.5 0 8.2-2.6 8.2-5.9S16.5 4.2 12 4.2Zm-.1 3.3c1.3 0 2.2.5 2.7 1.2l-1.3.75c-.3-.4-.75-.65-1.4-.65-.9 0-1.6.55-1.6 1.35s.7 1.35 1.6 1.35c.65 0 1.1-.25 1.4-.65l1.3.75c-.5.7-1.4 1.2-2.7 1.2-1.85 0-3.2-1.1-3.2-2.65s1.35-2.65 3.2-2.65Z"/></svg>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    actual = marcaInicial();
    render();
    document.addEventListener('ff:cart', function () {
      var badge = FF.qs('#pg-badge');
      if (!badge) return;
      var n = Object.keys(CFG.MARCAS).reduce(function (a, s) { return a + FF.Cart.count(s); }, 0);
      badge.textContent = n;
      badge.classList.toggle('is-empty', n === 0);
    });
  });
})();
