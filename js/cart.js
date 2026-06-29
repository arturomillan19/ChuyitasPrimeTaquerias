/* Chuyitas Prime — estado del carrito (JSON en memoria).
   Una sola fuente de verdad; la UI se re-renderiza desde aquí vía onChange. */
window.Chuyitas = window.Chuyitas || {};

Chuyitas.cart = (function () {
  'use strict';

  /** @type {Array<{categoriaId,categoriaNombre,varianteId,nombre,precio,cantidad,nota,regalo?}>} */
  let lineas = [];
  const suscriptores = [];

  function emit() {
    aplicaPromoFrijol();
    const snapshot = { lineas: lineas.slice(), subtotal: subtotal(), total: total(), count: count() };
    suscriptores.forEach((fn) => fn(snapshot));
  }

  function onChange(fn) { suscriptores.push(fn); fn({ lineas: lineas.slice(), subtotal: subtotal(), total: total(), count: count() }); }

  // Misma variante + misma nota = se suma cantidad en vez de duplicar línea.
  function mismaLinea(a, b) {
    return a.categoriaId === b.categoriaId && a.varianteId === b.varianteId &&
           (a.nota || '') === (b.nota || '') && !a.regalo;
  }

  function add(linea) {
    const existente = lineas.find((l) => mismaLinea(l, linea));
    if (existente) existente.cantidad += linea.cantidad;
    else lineas.push(Object.assign({ nota: '' }, linea));
    emit();
  }

  function updateCantidad(idx, cantidad) {
    if (!lineas[idx]) return;
    if (cantidad <= 0) return remove(idx);
    lineas[idx].cantidad = cantidad;
    emit();
  }

  function remove(idx) {
    if (lineas[idx] && lineas[idx].regalo) return; // el regalo se gestiona solo
    lineas.splice(idx, 1);
    emit();
  }

  function clear() { lineas = []; emit(); }

  // Subtotal cuenta solo lo pagado (excluye el regalo).
  function subtotal() {
    return lineas.reduce((s, l) => s + (l.regalo ? 0 : l.precio * l.cantidad), 0);
  }
  function total() { return subtotal(); } // el regalo es $0, total = subtotal
  function count() { return lineas.reduce((s, l) => s + (l.regalo ? 0 : l.cantidad), 0); }

  // Promo: al cruzar el umbral se agrega un taco de frijol de cortesía; si se baja, se quita.
  function aplicaPromoFrijol() {
    const { umbral, regalo } = Chuyitas.config.promo;
    const idx = lineas.findIndex((l) => l.regalo);
    const califica = subtotal() >= umbral;
    if (califica && idx === -1) {
      lineas.push({ categoriaId: 'promo', categoriaNombre: 'Cortesía', varianteId: 'frijol',
        nombre: regalo.nombre, precio: 0, cantidad: 1, nota: '', regalo: true });
    } else if (!califica && idx !== -1) {
      lineas.splice(idx, 1);
    }
  }

  // Cuánto falta para la promo (0 si ya califica). Lo usa el drawer para el nudge.
  function faltaParaPromo() {
    const falta = Chuyitas.config.promo.umbral - subtotal();
    return falta > 0 ? falta : 0;
  }

  return { onChange, add, updateCantidad, remove, clear, subtotal, total, count, faltaParaPromo,
           get lineas() { return lineas.slice(); } };
})();
