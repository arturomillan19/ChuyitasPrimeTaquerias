/* Chuyitas Prime — UI: flujo de pedido tipo app (modal a pantalla completa).
   Mobile-first. Sin frameworks JS: DOM directo, patrón módulo.
   Estructura del modal #pedido: top fijo (pasos) · cuerpo scrolleable · bottom fijo (acciones). */
window.Chuyitas = window.Chuyitas || {};

Chuyitas.ui = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const el = (tag, attrs, html) => {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    if (html != null) n.innerHTML = html;
    return n;
  };

  let lastFocus = null;
  let scrollY = 0;
  let pasoActual = 1;
  const TOTAL_PASOS = 4;

  /* ---------- Bloqueo de scroll del fondo ---------- */
  function lockScroll() {
    if (document.body.classList.contains('no-scroll')) return;
    scrollY = window.scrollY;
    document.body.style.top = -scrollY + 'px';
    document.body.classList.add('no-scroll');
  }
  function unlockScroll() {
    if (!document.body.classList.contains('no-scroll')) return;
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  }

  /* ============================================================
     1 · MODAL PEDIDO (flujo a pantalla completa)
     ============================================================ */
  function abrirPedido() {
    lastFocus = document.activeElement;
    const p = $('#pedido');
    p.classList.add('is-open');
    p.setAttribute('aria-hidden', 'false');
    const bar = $('#cta-bar'); if (bar) bar.classList.add('is-hidden');
    lockScroll();
    irAPaso(1, { silencioso: true });
    $('#pedido-cerrar').focus();
    trapFocus(p);
  }
  function cerrarPedido() {
    const p = $('#pedido');
    p.classList.remove('is-open');
    p.setAttribute('aria-hidden', 'true');
    const bar = $('#cta-bar'); if (bar) bar.classList.remove('is-hidden');
    if (!$('#modal').classList.contains('is-open')) unlockScroll();
    if (lastFocus) lastFocus.focus();
  }

  function irAPaso(n, opts) {
    opts = opts || {};
    pasoActual = Math.min(TOTAL_PASOS, Math.max(1, n));
    for (let i = 1; i <= TOTAL_PASOS; i++) {
      const panel = $('#paso-' + i);
      if (panel) panel.hidden = i !== pasoActual;
    }
    document.querySelectorAll('.pasos__item').forEach((li) => {
      const pi = +li.getAttribute('data-paso');
      li.classList.toggle('is-active', pi === pasoActual);
      li.classList.toggle('is-done', pi < pasoActual);
    });
    if (pasoActual === 4) renderResumen(snapActual());
    renderBottom();
    // resetear scroll del cuerpo al cambiar de paso (sin animar la página)
    const cuerpo = $('#pedido-cuerpo');
    if (cuerpo && !opts.silencioso) cuerpo.scrollTo({ top: 0, behavior: 'smooth' });
    else if (cuerpo) cuerpo.scrollTop = 0;
  }

  // Acciones contextuales del bottom, según el paso.
  function renderBottom() {
    const bottom = $('#pedido-bottom');
    if (!bottom) return;
    const count = Chuyitas.cart.count();
    const labelSig = { 1: 'Elegir bebida', 2: 'Elegir extras', 3: 'Ir a pagar' };

    let html = '';
    // Izquierda: atrás (desde paso 2) o "Ir a pagar" como atajo secundario en pasos 1-2.
    if (pasoActual > 1 && pasoActual < 4) {
      html += '<button class="bnav bnav--ghost" type="button" data-paso-ir="' + (pasoActual - 1) + '" aria-label="Paso anterior"><span aria-hidden="true">←</span></button>';
    } else if (pasoActual === 4) {
      html += '<button class="bnav bnav--ghost" type="button" data-paso-ir="3" aria-label="Volver"><span aria-hidden="true">←</span> Volver</button>';
    } else {
      html += '<span class="bnav__spacer"></span>';
    }

    // Atajo "Ir a pagar" como secundario (solo si ya hay algo en el carrito y no estamos en pagar).
    if (pasoActual < 3 && count > 0) {
      html += '<button class="bnav bnav--sec" type="button" data-paso-ir="4">Ir a pagar · ' + peso(snapActual().total) + '</button>';
    }

    // Derecha: acción primaria.
    if (pasoActual < 4) {
      html += '<button class="bnav bnav--primary" type="button" data-paso-ir="' + (pasoActual + 1) + '">' +
                labelSig[pasoActual] + ' <span aria-hidden="true">→</span></button>';
    } else {
      const enabled = count > 0;
      html += '<button class="bnav bnav--primary bnav--wpp" type="button" id="b-enviar"' + (enabled ? '' : ' disabled') + '>' +
                'Enviar por WhatsApp</button>';
    }

    bottom.innerHTML = html;
  }

  /* ---------- 1a · Render de platillos (Paso 1) ---------- */
  function renderCarta() {
    const cont = $('#carta');
    if (!cont) return;
    cont.innerHTML = '';
    Chuyitas.MENU.forEach((cat) => {
      const tarjeta = el('button', { class: 'plato', 'data-abrir': cat.id, type: 'button', 'aria-label': 'Pedir ' + cat.nombre });
      tarjeta.innerHTML =
        '<img class="plato__img" src="' + cat.img + '" alt="' + cat.nombre + '" loading="lazy" ' +
          'onerror="this.style.display=\'none\';this.parentElement.classList.add(\'sin-img\');" />' +
        '<span class="plato__info">' +
          '<span class="plato__nombre">' + cat.nombre + '</span>' +
          '<span class="plato__rango">desde ' + cat.rango.split('–')[0].trim() + '</span>' +
        '</span>';
      cont.appendChild(tarjeta);
    });
    cont.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-abrir]');
      if (btn) abrirVariante(btn.getAttribute('data-abrir'));
    });
  }

  /* ---------- 1b · Bebidas / Extras (items simples) ---------- */
  function renderItemsSimples(contId, items, etiqueta) {
    const cont = $('#' + contId);
    if (!cont) return;
    cont.innerHTML = items.map((it) =>
      '<article class="xitem" data-id="' + it.id + '">' +
        '<div class="xitem__info">' +
          '<p class="xitem__nombre">' + it.nombre + '</p>' +
          '<p class="xitem__desc">' + it.desc + '</p>' +
        '</div>' +
        '<div class="xitem__accion">' +
          '<span class="xitem__precio">' + peso(it.precio) + '</span>' +
          '<button class="xitem__add" type="button" data-add="' + it.id + '" aria-label="Agregar ' + it.nombre + '">+</button>' +
        '</div>' +
      '</article>'
    ).join('');

    cont.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const it = items.find((x) => x.id === b.getAttribute('data-add'));
      if (!it) return;
      Chuyitas.cart.add({ categoriaId: contId, categoriaNombre: etiqueta, varianteId: it.id, nombre: it.nombre, precio: it.precio, cantidad: 1, nota: '' });
      b.classList.add('xitem__add--ok'); b.textContent = '✓';
      setTimeout(() => { b.classList.remove('xitem__add--ok'); b.textContent = '+'; }, 700);
    });
  }

  /* ============================================================
     2 · SHEET de variante (encima del modal pedido)
     ============================================================ */
  function abrirVariante(catId) {
    const cat = Chuyitas.MENU.find((c) => c.id === catId);
    if (!cat) return;
    lastFocus = document.activeElement;
    const overlay = $('#modal');
    const v0 = cat.variantes[0];

    overlay.innerHTML =
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">' +
        '<button class="modal__close" type="button" aria-label="Cerrar">×</button>' +
        '<p class="modal__eyebrow">' + cat.rango + '</p>' +
        '<h2 class="modal__title" id="modal-title">' + cat.nombre + '</h2>' +
        '<p class="modal__desc">' + cat.desc + '</p>' +
        '<label class="campo"><span>Tipo</span>' +
          '<select id="m-variante">' +
            cat.variantes.map((v) => '<option value="' + v.id + '">' + v.nombre + ' · ' + peso(v.precio) + '</option>').join('') +
          '</select>' +
        '</label>' +
        '<p class="modal__vdesc" id="m-vdesc">' + v0.desc + '</p>' +
        '<div class="campo campo--cantidad"><span>Cantidad</span>' +
          '<div class="stepper">' +
            '<button type="button" class="stepper__btn" data-step="-1" aria-label="Menos">−</button>' +
            '<input id="m-cantidad" type="number" inputmode="numeric" min="1" value="1" aria-label="Cantidad" />' +
            '<button type="button" class="stepper__btn" data-step="1" aria-label="Más">+</button>' +
          '</div>' +
        '</div>' +
        '<label class="campo"><span>Notas <small>(opcional)</small></span>' +
          '<input id="m-nota" type="text" placeholder="Ej: sin cebolla, con todo, bien dorado" />' +
        '</label>' +
        '<button class="btn-brasa modal__add" type="button" id="m-add">Agregar — <span id="m-total">' + peso(v0.precio) + '</span></button>' +
      '</div>';

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();

    const card = $('.modal__card', overlay);
    const selV = $('#m-variante', overlay);
    const inpC = $('#m-cantidad', overlay);
    const total = $('#m-total', overlay);
    const vdesc = $('#m-vdesc', overlay);
    const precioActual = () => cat.variantes.find((v) => v.id === selV.value).precio;
    const refrescaTotal = () => { total.textContent = peso(precioActual() * Math.max(1, parseInt(inpC.value, 10) || 1)); };
    const refrescaVdesc = () => { vdesc.textContent = cat.variantes.find((v) => v.id === selV.value).desc; };

    selV.addEventListener('change', () => { refrescaVdesc(); refrescaTotal(); });
    inpC.addEventListener('input', refrescaTotal);
    card.addEventListener('click', (e) => {
      const step = e.target.closest('[data-step]');
      if (step) { inpC.value = Math.max(1, (parseInt(inpC.value, 10) || 1) + parseInt(step.getAttribute('data-step'), 10)); refrescaTotal(); }
    });
    $('.modal__close', overlay).addEventListener('click', cerrarSheet);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) cerrarSheet(); });
    $('#m-add', overlay).addEventListener('click', () => {
      const v = cat.variantes.find((x) => x.id === selV.value);
      Chuyitas.cart.add({ categoriaId: cat.id, categoriaNombre: cat.nombre, varianteId: v.id, nombre: cat.nombre + ' ' + v.nombre, precio: v.precio, cantidad: Math.max(1, parseInt(inpC.value, 10) || 1), nota: ($('#m-nota', overlay).value || '').trim() });
      cerrarSheet();
    });

    trapFocus(card);
    card.focus();
  }

  /* ---------- 2b · Sheet "¿a nombre de quién?" ---------- */
  function pedirNombre(onConfirm) {
    lastFocus = document.activeElement;
    const overlay = $('#modal');
    overlay.innerHTML =
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="nombre-title" tabindex="-1">' +
        '<button class="modal__close" type="button" aria-label="Cerrar">×</button>' +
        '<p class="modal__eyebrow">Último paso</p>' +
        '<h2 class="modal__title" id="nombre-title">¿A nombre de quién?</h2>' +
        '<p class="modal__desc">Para que tu pedido salga bien identificado.</p>' +
        '<label class="campo"><span>Tu nombre</span>' +
          '<input id="m-nombre" type="text" placeholder="Ej: Javier" autocomplete="name" />' +
        '</label>' +
        '<button class="btn-brasa modal__add" type="button" id="m-confirma-nombre">Enviar pedido por WhatsApp</button>' +
      '</div>';
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();

    const card = $('.modal__card', overlay);
    const inp = $('#m-nombre', overlay);
    function confirmar() {
      const nombre = (inp.value || '').trim();
      if (!nombre) { inp.focus(); inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 500); return; }
      cerrarSheet();
      onConfirm(nombre);
    }
    $('#m-confirma-nombre', overlay).addEventListener('click', confirmar);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmar(); });
    $('.modal__close', overlay).addEventListener('click', cerrarSheet);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) cerrarSheet(); });
    trapFocus(card);
    inp.focus();
  }

  function cerrarSheet() {
    const overlay = $('#modal');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
    // si el modal de pedido sigue abierto, NO desbloqueamos el scroll del fondo.
    if (!$('#pedido').classList.contains('is-open')) unlockScroll();
    const pedido = $('#pedido');
    if (pedido.classList.contains('is-open')) pedido.focus();
    else if (lastFocus) lastFocus.focus();
  }

  /* ============================================================
     3 · Resumen / desglose (Paso 4)
     ============================================================ */
  function snapActual() {
    return { lineas: Chuyitas.cart.lineas, subtotal: Chuyitas.cart.subtotal(), total: Chuyitas.cart.total(), count: Chuyitas.cart.count() };
  }

  function renderResumen(snap) {
    const cuerpo = $('#resumen-cuerpo');
    const pie = $('#resumen-pie');
    if (!cuerpo) return;

    if (!snap.lineas.length) {
      cuerpo.innerHTML = '<p class="drawer__vacio">Aún no agregas nada.<br>Vuelve y elige tus platillos.</p>';
      pie.innerHTML = '';
      return;
    }

    cuerpo.innerHTML = snap.lineas.map((l, idx) => {
      const sub = l.regalo ? 'Gratis' : peso(l.precio * l.cantidad);
      return '<div class="ditem' + (l.regalo ? ' ditem--regalo' : '') + '">' +
        '<div class="ditem__info">' +
          '<p class="ditem__nombre">' + l.nombre + '</p>' +
          (l.nota ? '<p class="ditem__nota">' + l.nota + '</p>' : '') +
          '<p class="ditem__sub">' + sub + '</p>' +
        '</div>' +
        (l.regalo ? '<span class="ditem__regalo">cortesía</span>' :
          '<div class="ditem__ctrl">' +
            '<div class="stepper stepper--sm">' +
              '<button type="button" class="stepper__btn" data-d-step="-1" data-idx="' + idx + '" aria-label="Menos">−</button>' +
              '<span class="stepper__n">' + l.cantidad + '</span>' +
              '<button type="button" class="stepper__btn" data-d-step="1" data-idx="' + idx + '" aria-label="Más">+</button>' +
            '</div>' +
            '<button type="button" class="ditem__quitar" data-quitar="' + idx + '" aria-label="Quitar">Quitar</button>' +
          '</div>') +
      '</div>';
    }).join('');

    const falta = Chuyitas.cart.faltaParaPromo();
    const nudge = falta > 0
      ? '<p class="promo-nudge">Te faltan <b>' + peso(falta) + '</b> para un <b>taco de frijol gratis</b> 🔥</p>'
      : '<p class="promo-nudge promo-nudge--ok">¡Llevas tu <b>taco de frijol de cortesía</b>!</p>';

    pie.innerHTML =
      nudge +
      '<div class="drawer__entrega">' +
        '<div class="seg" role="radiogroup" aria-label="Tipo de entrega">' +
          '<label class="seg__op"><input type="radio" name="entrega" value="recoger" checked> Recojo</label>' +
          '<label class="seg__op"><input type="radio" name="entrega" value="domicilio"> A domicilio</label>' +
        '</div>' +
        '<input id="d-direccion" class="d-direccion" type="text" placeholder="Dirección de entrega" hidden />' +
      '</div>' +
      '<div class="drawer__total"><span>Total</span><b>' + peso(snap.total) + '</b></div>';
  }

  function bindResumenEventos() {
    const cuerpo = $('#pedido');
    cuerpo.addEventListener('click', (e) => {
      const step = e.target.closest('[data-d-step]');
      if (step) {
        const idx = +step.getAttribute('data-idx');
        const actual = Chuyitas.cart.lineas[idx];
        if (actual) Chuyitas.cart.updateCantidad(idx, actual.cantidad + (+step.getAttribute('data-d-step')));
        return;
      }
      const quitar = e.target.closest('[data-quitar]');
      if (quitar) { Chuyitas.cart.remove(+quitar.getAttribute('data-quitar')); return; }

      const ir = e.target.closest('[data-paso-ir]');
      if (ir) { irAPaso(+ir.getAttribute('data-paso-ir')); return; }

      if (e.target.id === 'b-enviar') {
        const tipo = (cuerpo.querySelector('input[name="entrega"]:checked') || {}).value || 'recoger';
        const direccion = (($('#d-direccion', cuerpo) || {}).value || '').trim();
        if (tipo === 'domicilio' && !direccion) {
          const d = $('#d-direccion', cuerpo);
          d.focus(); d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 500);
          return;
        }
        pedirNombre((nombre) => Chuyitas.whatsapp.enviarPedido({ tipo, direccion, nombre }));
      }
    });

    cuerpo.addEventListener('change', (e) => {
      if (e.target.name === 'entrega') {
        const dir = $('#d-direccion', cuerpo);
        if (dir) { dir.hidden = e.target.value !== 'domicilio'; if (!dir.hidden) dir.focus(); }
      }
    });
  }

  /* ============================================================
     4 · Catering (sección en la landing)
     ============================================================ */
  function renderCatering() {
    const cont = $('#catering-grid');
    if (!cont) return;
    cont.innerHTML = Chuyitas.CATERING.map((p) =>
      '<article class="paquete">' +
        '<p class="paquete__personas">Hasta ' + p.personas + ' personas</p>' +
        '<p class="paquete__precio">' + peso(p.precio) + '<small> + IVA</small></p>' +
        '<ul class="paquete__incluye">' + p.incluye.map((x) => '<li>' + x + '</li>').join('') + '</ul>' +
        '<button class="btn-brasa" type="button" data-catering="' + p.personas + '">Cotizar</button>' +
      '</article>'
    ).join('');

    cont.addEventListener('click', (e) => {
      const b = e.target.closest('[data-catering]');
      if (b) Chuyitas.whatsapp.cotizarCatering(b.getAttribute('data-catering'));
    });
  }

  /* ---------- 5 · Focus trap ---------- */
  function trapFocus(container) {
    container.onkeydown = (e) => {
      if (e.key !== 'Tab') return;
      const foc = container.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!foc.length) return;
      const first = foc[0], last = foc[foc.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }

  /* ---------- Barra CTA: visible al pasar el hero ---------- */
  function initCtaBar() {
    const bar = $('#cta-bar');
    const hero = document.querySelector('.hero');
    if (!bar || !hero) return;

    function update() {
      // mostrar cuando el usuario ya pasó la mayor parte del hero
      const mostrar = window.scrollY > (hero.offsetHeight * 0.6);
      // no mostrar si el modal de pedido está abierto
      const visible = mostrar && !$('#pedido').classList.contains('is-open');
      bar.classList.toggle('is-visible', visible);
      bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- init ---------- */
  function init() {
    renderCarta();
    renderItemsSimples('bebidas-grid', Chuyitas.BEBIDAS, 'Bebidas');
    renderItemsSimples('extras-grid', Chuyitas.EXTRAS, 'Extras');
    bindResumenEventos();
    initCtaBar();
    initBurger();

    // Al cambiar el carrito: si estamos en pagar, re-render; siempre refrescamos el bottom.
    Chuyitas.cart.onChange(() => {
      if ($('#pedido').classList.contains('is-open')) {
        if (pasoActual === 4) renderResumen(snapActual());
        renderBottom();
      }
    });

    // Aperturas
    document.querySelectorAll('[data-abrir-pedido]').forEach((b) => b.addEventListener('click', abrirPedido));
    $('#pedido-cerrar').addEventListener('click', cerrarPedido);

    // Indicador de pasos clickeable
    document.querySelectorAll('.pasos__item').forEach((li) =>
      li.addEventListener('click', () => irAPaso(+li.getAttribute('data-paso'))));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if ($('#modal').classList.contains('is-open')) cerrarSheet();
      else if ($('#pedido').classList.contains('is-open')) cerrarPedido();
      else if ($('#burger') && $('#burger').getAttribute('aria-expanded') === 'true') toggleBurger(false);
    });
  }

  /* ---------- Burger menu ---------- */
  function toggleBurger(abrir) {
    const b = $('#burger'); const menu = $('#nav-menu');
    if (!b || !menu) return;
    const open = abrir != null ? abrir : b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
  }
  function initBurger() {
    const b = $('#burger');
    if (!b) return;
    b.addEventListener('click', () => toggleBurger());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { abrirPedido, cerrarPedido, abrirVariante, renderCatering, irAPaso };
})();
