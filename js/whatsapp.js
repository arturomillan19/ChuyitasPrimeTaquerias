/* Chuyitas Prime — checkout por WhatsApp.
   Construye el mensaje desde el ESTADO del carrito (no del DOM) y abre wa.me. */
window.Chuyitas = window.Chuyitas || {};

Chuyitas.whatsapp = (function () {
  'use strict';

  const peso = (n) => '$' + n.toLocaleString('es-MX');

  // entrega: { tipo:'recoger'|'domicilio', direccion?:string }
  function mensajePedido(entrega) {
    const lineas = Chuyitas.cart.lineas;
    if (!lineas.length) return null;

    const nombre = (entrega.nombre || '').trim();
    let msg = '¡Hola! Quiero hacer un pedido en *Chuyitas Prime*.\n';
    if (nombre) msg += '*A nombre de:* ' + nombre + '\n';
    msg += '\n';

    // Agrupar por categoría para que se lea como la carta.
    const porCategoria = {};
    lineas.forEach((l) => {
      (porCategoria[l.categoriaNombre] = porCategoria[l.categoriaNombre] || []).push(l);
    });

    Object.keys(porCategoria).forEach((cat) => {
      msg += '*' + cat.toUpperCase() + '*\n';
      porCategoria[cat].forEach((l) => {
        let linea = '  • ' + l.cantidad + '× ' + l.nombre;
        if (!l.regalo) linea += '  ' + peso(l.precio * l.cantidad);
        if (l.regalo) linea += '  (gratis)';
        if (l.nota) linea += '\n      ↳ ' + l.nota;
        msg += linea + '\n';
      });
      msg += '\n';
    });

    msg += '────────────\n';
    msg += '*Total:* ' + peso(Chuyitas.cart.total()) + '\n\n';

    if (entrega.tipo === 'domicilio') {
      msg += '*Entrega:* A domicilio\n';
      msg += '*Dirección:* ' + (entrega.direccion ? entrega.direccion : '(la envío por este chat)') + '\n';
    } else {
      msg += '*Entrega:* Paso a recoger al local\n';
    }

    msg += '\n¡Gracias!';
    return msg;
  }

  function enviarPedido(entrega) {
    const msg = mensajePedido(entrega);
    if (!msg) return false;
    abrir(msg);
    return true;
  }

  function cotizarCatering(personas) {
    const msg = '¡Hola! Quiero cotizar el *paquete de ' + personas +
      ' personas* para un evento de Chuyitas Prime.';
    abrir(msg);
  }

  function abrir(texto) {
    const url = 'https://wa.me/' + Chuyitas.config.whatsapp + '?text=' + encodeURIComponent(texto);
    window.open(url, '_blank');
  }

  return { enviarPedido, cotizarCatering, mensajePedido };
})();
