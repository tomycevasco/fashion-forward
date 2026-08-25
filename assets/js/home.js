/* ============================================================
   FASHION FORWARD — HOME
   Version simplificada: sin librerias de animacion. Solo lo minimo
   para que la nav reaccione al scroll y el badge del carrito sume
   las 3 marcas. El unico efecto visual vive en el CSS (hover de
   los bloques de marca).
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF, CFG = window.FF_CONFIG;

  function nav() {
    var navEl = document.getElementById('nav');
    if (!navEl) return;
    var onScroll = function () { navEl.classList.toggle('is-solid', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function cartBadge() {
    var badge = document.getElementById('nav-badge');
    if (!badge) return;
    function refresh() {
      var n = Object.keys(CFG.MARCAS).reduce(function (a, s) { return a + FF.Cart.count(s); }, 0);
      badge.textContent = n;
      badge.classList.toggle('is-empty', n === 0);
    }
    refresh();
    document.addEventListener('ff:cart', refresh);
    window.addEventListener('storage', refresh);
  }

  document.addEventListener('DOMContentLoaded', function () {
    nav();
    cartBadge();
    FF.mountFab();
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  });
})();
