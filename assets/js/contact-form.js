/* ============================================================
   FASHION FORWARD — FORMULARIO DE CONTACTO
   Sin backend: valida en el cliente y muestra confirmacion.
   Si en config.js cargas CONTACT_FORM_ENDPOINT (Formspree, EmailJS,
   Netlify Forms, lo que sea que acepte un POST), pasa a enviarlo
   de verdad sin tocar una linea mas de codigo.
   ============================================================ */
(function () {
  'use strict';

  var FF = window.FF = window.FF || {};
  var CFG = window.FF_CONFIG;

  function error(field, msg) {
    var wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.add('has-error');
    var e = wrap.querySelector('.field__error');
    if (e) e.textContent = msg;
  }

  function clearErrors(form) {
    FF.qsa('.field', form).forEach(function (w) {
      w.classList.remove('has-error');
      var e = w.querySelector('.field__error');
      if (e) e.textContent = '';
    });
  }

  function validate(form) {
    clearErrors(form);
    var ok = true;
    var nombre = form.nombre, email = form.email, mensaje = form.mensaje;

    if (!nombre.value.trim() || nombre.value.trim().length < 2) { error(nombre, 'Contanos tu nombre.'); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { error(email, 'Revisá el email, no parece válido.'); ok = false; }
    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) { error(mensaje, 'Escribinos un poco más (mínimo 10 caracteres).'); ok = false; }

    if (!ok) {
      var first = FF.qs('.field.has-error input, .field.has-error textarea, .field.has-error select', form);
      if (first) first.focus();
    }
    return ok;
  }

  function success(form) {
    var box = FF.qs('.form__done', form.parentNode) || FF.el('div', { class: 'form__done' });
    box.innerHTML = FF.icon('check', 22) +
      '<div><strong>¡Mensaje enviado!</strong>' +
      '<span>Te respondemos dentro de las próximas 24 horas hábiles. ' +
      'Si es urgente, escribinos por WhatsApp.</span></div>';
    if (!box.parentNode) form.parentNode.insertBefore(box, form);
    box.classList.add('is-visible');
    form.reset();
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function init() {
    FF.qsa('form.js-contact').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;

        var btn = FF.qs('[type="submit"]', form);
        var label = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Enviando…'; }

        var restore = function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } };

        if (CFG.CONTACT_FORM_ENDPOINT) {
          // ---- envio real ----
          fetch(CFG.CONTACT_FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form)
          }).then(function (r) {
            restore();
            if (r.ok) success(form);
            else FF.toast('No pudimos enviar el mensaje. Probá por WhatsApp.', 'error');
          }).catch(function () {
            restore();
            FF.toast('No pudimos enviar el mensaje. Probá por WhatsApp.', 'error');
          });
        } else {
          // ---- demo sin backend ----
          setTimeout(function () { restore(); success(form); }, 700);
        }
      });

      // limpia el error apenas el usuario corrige
      FF.qsa('input, textarea, select', form).forEach(function (f) {
        f.addEventListener('input', function () {
          var w = f.closest('.field');
          if (w) { w.classList.remove('has-error'); var e = w.querySelector('.field__error'); if (e) e.textContent = ''; }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
