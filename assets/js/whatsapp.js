/* ============================================================
   FASHION FORWARD — WHATSAPP
   1. Boton flotante global (mensaje generico).
   2. Armado del mensaje de pedido desde el carrito.
   El numero y el mensaje se editan en /assets/js/config.js
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF = window.FF || {};
  var CFG = window.FF_CONFIG;

  FF.waLink = function (mensaje) {
    var num = String(CFG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(mensaje || CFG.WHATSAPP_MESSAGE);
  };

  /* ---------- mensaje de consulta por un producto ---------- */
  FF.waProducto = function (producto, marcaNombre) {
    var t = ['¡Hola! Me interesa este producto de ' + marcaNombre + ':', '', '• ' + producto.titulo];
    if (producto.codigo) t.push('• Código: ' + producto.codigo);
    t.push('• Precio: ' + FF.money(producto.precio));
    t.push('', '¿Está disponible?');
    return t.join('\n');
  };

  /* ---------- mensaje de pedido completo (carrito) ---------- */
  FF.waPedido = function (slug, items, total) {
    var marca = (CFG.MARCAS[slug] || {}).nombre || slug;
    var lineas = ['*Nuevo pedido — Fashion Forward*', 'Marca: *' + marca + '*', ''];

    items.forEach(function (i, n) {
      lineas.push((n + 1) + '. *' + i.titulo + '*');
      if (i.codigo) lineas.push('   Código: ' + i.codigo);
      if (i.color) lineas.push('   Color: ' + i.color);
      if (i.talle) lineas.push('   Talle: ' + i.talle);
      lineas.push('   Cantidad: ' + i.cantidad);
      lineas.push('   Precio unitario: ' + FF.money(i.precio));
      lineas.push('   Subtotal: ' + FF.money(i.precio * i.cantidad));
      lineas.push('');
    });

    lineas.push('*TOTAL: ' + FF.money(total) + '*');
    lineas.push('');
    lineas.push('Quedo a la espera para coordinar pago y envío. ¡Gracias!');
    return lineas.join('\n');
  };

  /* ---------- boton flotante global ---------- */
  function mountFab() {
    if (document.body.dataset.noFab === 'true') return;

    // Si ya existe (por ejemplo, se llamo antes de montar el footer de marca),
    // solo re-enganchamos el observer del footer.
    var existing = FF.qs('.wa-fab');
    if (existing) { watchFooter(existing); return; }

    var a = FF.el('a', {
      class: 'wa-fab',
      href: FF.waLink(CFG.WHATSAPP_MESSAGE),
      target: '_blank',
      rel: 'noopener',
      'aria-label': 'Escribinos por WhatsApp'
    });
    a.innerHTML = FF.icon('whatsapp', 28) + '<span class="wa-fab__label">Escribinos</span>';
    document.body.appendChild(a);

    watchFooter(a);
  }

  // Se esconde cuando el usuario llega al footer para no tapar contenido
  function watchFooter(a) {
    if (a._watching) return;
    var footer = FF.qs('.bfooter, .ff-footer, .pgfoot');
    if (!footer || !('IntersectionObserver' in window)) return;
    a._watching = true;
    new IntersectionObserver(function (es) {
      a.classList.toggle('is-tucked', es[0].isIntersecting);
    }, { threshold: 0.05 }).observe(footer);
  }

  /* ---------- modal generico (Mercado Pago / avisos) ---------- */
  FF.modal = function (opts) {
    var prev = FF.qs('.ff-modal');
    if (prev) prev.remove();

    var m = FF.el('div', { class: 'ff-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.titulo || 'Aviso' });
    m.innerHTML =
      '<div class="ff-modal__backdrop"></div>' +
      '<div class="ff-modal__box">' +
        '<button class="ff-modal__close" type="button" aria-label="Cerrar">' + FF.icon('close', 20) + '</button>' +
        (opts.eyebrow ? '<p class="ff-modal__eyebrow">' + FF.escape(opts.eyebrow) + '</p>' : '') +
        '<h3 class="ff-modal__title">' + FF.escape(opts.titulo || '') + '</h3>' +
        '<div class="ff-modal__body">' + (opts.html || '<p>' + FF.escape(opts.texto || '') + '</p>') + '</div>' +
        (opts.cta ? '<a class="ff-modal__cta" href="' + opts.cta.href + '"' +
          (opts.cta.blank ? ' target="_blank" rel="noopener"' : '') + '>' + FF.escape(opts.cta.label) + '</a>' : '') +
      '</div>';
    document.body.appendChild(m);
    document.body.classList.add('is-locked');

    function close() { m.remove(); document.body.classList.remove('is-locked'); }
    FF.qs('.ff-modal__close', m).addEventListener('click', close);
    FF.qs('.ff-modal__backdrop', m).addEventListener('click', close);
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    requestAnimationFrame(function () { m.classList.add('is-open'); });
    return m;
  };

  /* ---------- Mercado Pago (placeholder configurable) ---------- */
  FF.mercadoPago = function () {
    if (CFG.MERCADOPAGO_LINK) {
      window.open(CFG.MERCADOPAGO_LINK, '_blank', 'noopener');
      return;
    }
    FF.modal({
      eyebrow: 'Mercado Pago',
      titulo: 'Próximamente disponible',
      html: '<p>Todavía estamos terminando de integrar el pago online con Mercado Pago.</p>' +
            '<p>Mientras tanto podés cerrar tu compra por WhatsApp: te pasamos link de pago, ' +
            'transferencia o cuotas, y coordinamos el envío.</p>',
      cta: { label: 'Cerrar pedido por WhatsApp', href: '#wa-pedido' }
    });
    var cta = FF.qs('.ff-modal__cta');
    if (cta) cta.addEventListener('click', function (e) {
      e.preventDefault();
      var btn = FF.qs('.js-wa-pedido');
      if (btn) btn.click();
    });
  };

  document.addEventListener('DOMContentLoaded', mountFab);
  FF.mountFab = mountFab;
})();
