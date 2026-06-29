/* Chuyitas Prime — UI: render de la carta, modal por categoría, drawer del carrito.
   Mobile-first. Sin frameworks JS: DOM directo, patrón módulo. */
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

  let lastFocus = null; // para devolver el foco al cerrar modal/drawer
  let scrollY = 0;      // posición guardada para el bloqueo de scroll

  // Bloqueo real del fondo: fija el body en su posición actual.
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

  /* ---------- 1 · Render de la carta (bandas por categoría) ---------- */
  function renderCarta() {
    const cont = $('#carta');
    if (!cont) return;
    cont.innerHTML = '';

    Chuyitas.MENU.forEach((cat) => {
      const tarjeta = el('button', {
        class: 'plato', 'data-abrir': cat.id, type: 'button',
        'aria-label': 'Pedir ' + cat.nombre,
      });

      tarjeta.innerHTML =
        '<img class="plato__img" src="' + cat.img + '" alt="' + cat.nombre + '" loading="lazy" ' +
          'onerror="this.style.display=\'none\';this.parentElement.classList.add(\'sin-img\');" />' +
        '<span class="plato__info">' +
          '<span class="plato__nombre">' + cat.nombre + '</span>' +
          '<span class="plato__rango">desde ' + cat.rango.split('–')[0].trim() + '</span>' +
        '</span>';

      cont.appendChild(tarjeta);
    });

    // La foto ES el botón.
    cont.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-abrir]');
      if (btn) abrirModal(btn.getAttribute('data-abrir'));
    });
  }

  /* ---------- 1b · Bebidas / Extras (items simples, sin variante) ---------- */
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
          '<button class="xitem__add" type="button" data-add="' + it.id + '" ' +
            'aria-label="Agregar ' + it.nombre + '">+</button>' +
        '</div>' +
      '</article>'
    ).join('');

    cont.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const it = items.find((x) => x.id === b.getAttribute('data-add'));
      if (!it) return;
      Chuyitas.cart.add({
        categoriaId: contId, categoriaNombre: etiqueta,
        varianteId: it.id, nombre: it.nombre, precio: it.precio, cantidad: 1, nota: '',
      });
      // feedback breve en el botón
      b.classList.add('xitem__add--ok'); b.textContent = '✓';
      setTimeout(() => { b.classList.remove('xitem__add--ok'); b.textContent = '+'; }, 700);
      pulsoCarrito();
    });
  }

  /* ---------- 1c · Wizard de pasos ---------- */
  function initPasos() {
    const TOTAL = 3;
    let paso = 1;
    const indItems = document.querySelectorAll('.pasos__item');
    const btnAtras = $('#paso-atras');
    const btnSig = $('#paso-siguiente');
    const btnFin = $('#paso-finalizar');

    function mostrar(n) {
      paso = Math.min(TOTAL, Math.max(1, n));
      for (let i = 1; i <= TOTAL; i++) {
        const panel = $('#paso-' + i);
        if (panel) panel.hidden = i !== paso;
      }
      indItems.forEach((li) => {
        const p = +li.getAttribute('data-paso');
        li.classList.toggle('is-active', p === paso);
        li.classList.toggle('is-done', p < paso);
      });
      btnAtras.hidden = paso === 1;
      btnSig.hidden = paso === TOTAL;
      btnFin.hidden = paso !== TOTAL;
      // llevar la vista al inicio de la sección de pasos
      document.querySelector('#carta-sec').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    btnSig.addEventListener('click', () => mostrar(paso + 1));
    btnAtras.addEventListener('click', () => mostrar(paso - 1));
    // permitir tocar el indicador para saltar a un paso ya visto o siguiente
    indItems.forEach((li) =>
      li.addEventListener('click', () => mostrar(+li.getAttribute('data-paso')))
    );

    mostrar(1);
  }

  /* ---------- 2 · Modal por categoría ---------- */
  function abrirModal(catId) {
    const cat = Chuyitas.MENU.find((c) => c.id === catId);
    if (!cat) return;
    lastFocus = document.activeElement;

    const overlay = $('#modal');
    const variante0 = cat.variantes[0];

    overlay.innerHTML =
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">' +
        '<button class="modal__close" type="button" aria-label="Cerrar">×</button>' +
        '<p class="modal__eyebrow">' + cat.rango + '</p>' +
        '<h2 class="modal__title" id="modal-title">' + cat.nombre + '</h2>' +
        '<p class="modal__desc">' + cat.desc + '</p>' +

        '<label class="campo"><span>Tipo</span>' +
          '<select id="m-variante">' +
            cat.variantes.map((v) =>
              '<option value="' + v.id + '">' + v.nombre + ' · ' + peso(v.precio) + '</option>'
            ).join('') +
          '</select>' +
        '</label>' +
        '<p class="modal__vdesc" id="m-vdesc">' + variante0.desc + '</p>' +

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

        '<button class="btn-brasa modal__add" type="button" id="m-add">' +
          'Agregar — <span id="m-total">' + peso(variante0.precio) + '</span></button>' +
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
    const refrescaTotal = () => {
      const n = Math.max(1, parseInt(inpC.value, 10) || 1);
      total.textContent = peso(precioActual() * n);
    };
    const refrescaVdesc = () => { vdesc.textContent = cat.variantes.find((v) => v.id === selV.value).desc; };

    selV.addEventListener('change', () => { refrescaVdesc(); refrescaTotal(); });
    inpC.addEventListener('input', refrescaTotal);

    card.addEventListener('click', (e) => {
      const step = e.target.closest('[data-step]');
      if (step) {
        const n = Math.max(1, (parseInt(inpC.value, 10) || 1) + parseInt(step.getAttribute('data-step'), 10));
        inpC.value = n; refrescaTotal();
      }
    });

    $('.modal__close', overlay).addEventListener('click', cerrarModal);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) cerrarModal(); });

    $('#m-add', overlay).addEventListener('click', () => {
      const v = cat.variantes.find((x) => x.id === selV.value);
      const n = Math.max(1, parseInt(inpC.value, 10) || 1);
      Chuyitas.cart.add({
        categoriaId: cat.id, categoriaNombre: cat.nombre,
        varianteId: v.id, nombre: cat.nombre + ' ' + v.nombre,
        precio: v.precio, cantidad: n, nota: ($('#m-nota', overlay).value || '').trim(),
      });
      cerrarModal();
      pulsoCarrito();
    });

    trapFocus(card);
    card.focus();
  }

  function cerrarModal() {
    const overlay = $('#modal');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '';
    if (!$('#drawer').classList.contains('is-open')) unlockScroll();
    if (lastFocus) lastFocus.focus();
  }

  /* ---------- 2b · Modal "¿a nombre de quién?" ---------- */
  function pedirNombre(onConfirm) {
    lastFocus = document.activeElement;
    const overlay = $('#modal');

    overlay.innerHTML =
      '<div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="nombre-title" tabindex="-1">' +
        '<button class="modal__close" type="button" aria-label="Cerrar">×</button>' +
        '<p class="modal__eyebrow">Último paso</p>' +
        '<h2 class="modal__title" id="nombre-title">¿A nombre de quién?</h2>' +
        '<p class="modal__desc">Para que tu pedido salga bien identificado en el WhatsApp.</p>' +
        '<label class="campo"><span>Tu nombre</span>' +
          '<input id="m-nombre" type="text" placeholder="Ej: Javier" autocomplete="name" />' +
        '</label>' +
        '<button class="btn-brasa modal__add" type="button" id="m-confirma-nombre">' +
          'Enviar pedido por WhatsApp</button>' +
      '</div>';

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();

    const card = $('.modal__card', overlay);
    const inp = $('#m-nombre', overlay);

    function confirmar() {
      const nombre = (inp.value || '').trim();
      if (!nombre) {
        inp.focus();
        inp.classList.add('shake');
        setTimeout(() => inp.classList.remove('shake'), 500);
        return;
      }
      cerrarModal();
      onConfirm(nombre);
    }

    $('#m-confirma-nombre', overlay).addEventListener('click', confirmar);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmar(); });
    $('.modal__close', overlay).addEventListener('click', cerrarModal);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) cerrarModal(); });

    trapFocus(card);
    inp.focus();
  }

  /* ---------- 3 · Drawer del carrito ---------- */
  function renderDrawer(snap) {
    const cuerpo = $('#drawer-cuerpo');
    const pie = $('#drawer-pie');
    const badge = $('#cart-count');
    if (badge) {
      badge.textContent = snap.count;
      badge.classList.toggle('is-empty', snap.count === 0);
    }
    if (!cuerpo) return;

    if (!snap.lineas.length) {
      cuerpo.innerHTML = '<p class="drawer__vacio">Tu pedido está vacío.<br>Pásale a la carta y arma lo tuyo.</p>';
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
      ? '<p class="promo-nudge">Te faltan <b>' + peso(falta) + '</b> para ganarte un <b>taco de frijol gratis</b> 🔥</p>'
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
      '<div class="drawer__total"><span>Total</span><b>' + peso(snap.total) + '</b></div>' +
      '<button class="btn-brasa btn-enviar" id="d-enviar" type="button">Enviar pedido por WhatsApp</button>';
  }

  function bindDrawerEventos() {
    const drawer = $('#drawer');

    drawer.addEventListener('click', (e) => {
      const step = e.target.closest('[data-d-step]');
      if (step) {
        const idx = +step.getAttribute('data-idx');
        const dir = +step.getAttribute('data-d-step');
        const actual = Chuyitas.cart.lineas[idx];
        if (actual) Chuyitas.cart.updateCantidad(idx, actual.cantidad + dir);
        return;
      }
      const quitar = e.target.closest('[data-quitar]');
      if (quitar) { Chuyitas.cart.remove(+quitar.getAttribute('data-quitar')); return; }

      if (e.target.id === 'd-enviar') {
        const tipo = (drawer.querySelector('input[name="entrega"]:checked') || {}).value || 'recoger';
        const direccion = (($('#d-direccion', drawer) || {}).value || '').trim();
        if (tipo === 'domicilio' && !direccion) {
          $('#d-direccion', drawer).focus();
          $('#d-direccion', drawer).classList.add('shake');
          setTimeout(() => $('#d-direccion', drawer).classList.remove('shake'), 500);
          return;
        }
        // Antes de mandar, preguntamos a nombre de quién va el pedido.
        pedirNombre((nombre) => Chuyitas.whatsapp.enviarPedido({ tipo, direccion, nombre }));
      }
    });

    drawer.addEventListener('change', (e) => {
      if (e.target.name === 'entrega') {
        const dir = $('#d-direccion', drawer);
        if (dir) { dir.hidden = e.target.value !== 'domicilio'; if (!dir.hidden) dir.focus(); }
      }
    });
  }

  function abrirDrawer() {
    lastFocus = document.activeElement;
    const d = $('#drawer');
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('is-open');
    lockScroll();
    const close = $('.drawer__close', d);
    if (close) close.focus();
    trapFocus(d);
  }
  function cerrarDrawer() {
    const d = $('#drawer');
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    $('#scrim').classList.remove('is-open');
    if (!$('#modal').classList.contains('is-open')) unlockScroll();
    if (lastFocus) lastFocus.focus();
  }

  function pulsoCarrito() {
    const fab = $('#cart-fab');
    if (!fab) return;
    fab.classList.remove('pulse');
    void fab.offsetWidth; // reinicia animación
    fab.classList.add('pulse');
  }

  /* ---------- 4 · Catering ---------- */
  function renderCatering() {
    const cont = $('#catering-grid');
    if (!cont) return;
    cont.innerHTML = Chuyitas.CATERING.map((p) =>
      '<article class="paquete">' +
        '<p class="paquete__personas">Hasta ' + p.personas + ' personas</p>' +
        '<p class="paquete__precio">' + peso(p.precio) + '<small> + IVA</small></p>' +
        '<ul class="paquete__incluye">' +
          p.incluye.map((x) => '<li>' + x + '</li>').join('') +
        '</ul>' +
        '<button class="link-cta" type="button" data-catering="' + p.personas + '">' +
          'Cotizar <span aria-hidden="true">→</span></button>' +
      '</article>'
    ).join('');

    cont.addEventListener('click', (e) => {
      const b = e.target.closest('[data-catering]');
      if (b) Chuyitas.whatsapp.cotizarCatering(b.getAttribute('data-catering'));
    });
  }

  /* ---------- 5 · Focus trap + teclado ---------- */
  function trapFocus(container) {
    container.onkeydown = (e) => {
      if (e.key !== 'Tab') return;
      const foc = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!foc.length) return;
      const first = foc[0], last = foc[foc.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  }

  /* ---------- init ---------- */
  function init() {
    renderCarta();
    renderItemsSimples('bebidas-grid', Chuyitas.BEBIDAS, 'Bebidas');
    renderItemsSimples('extras-grid', Chuyitas.EXTRAS, 'Extras');
    initPasos();
    renderCatering();
    bindDrawerEventos();
    Chuyitas.cart.onChange(renderDrawer);

    $('#cart-fab').addEventListener('click', abrirDrawer);
    document.querySelectorAll('[data-open-drawer]').forEach((b) => b.addEventListener('click', abrirDrawer));
    $('#scrim').addEventListener('click', cerrarDrawer);
    const dClose = document.querySelector('.drawer__close');
    if (dClose) dClose.addEventListener('click', cerrarDrawer);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if ($('#modal').classList.contains('is-open')) cerrarModal();
        else if ($('#drawer').classList.contains('is-open')) cerrarDrawer();
      }
    });

    // CTA "ir a la carta" del hero
    document.querySelectorAll('[data-scroll]').forEach((a) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('data-scroll'));
        if (t) t.scrollIntoView({ behavior: 'smooth' });
      })
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return { abrirModal, abrirDrawer, cerrarDrawer };
})();
