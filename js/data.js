/* Chuyitas Prime — datos del menú y configuración del negocio.
   Editar precios/platillos aquí; el resto del sitio se construye solo desde esto. */
window.Chuyitas = window.Chuyitas || {};

Chuyitas.config = {
  nombre: 'Chuyitas Prime',
  whatsapp: '16232399551',            // número de pruebas del hermano (lada Arizona)
  tel: '+16232399551',
  direccion: 'Blvd. Luis Encinas Johnson 250, Villa de Miramar, 85455 Heroica Guaymas, Son.',
  horario: 'Mar–Dom · 6:30pm a 12:30am',
  // Promo: pedido a partir de este monto regala un taco de frijol.
  promo: { umbral: 200, regalo: { nombre: 'Taco de frijol — cortesía', precio: 0 } },
};

/* MENU: cada categoría es una "banda" de la carta; cada variante es un platillo pedible.
   id estables (se usan como llave en el carrito). img: imagen de la categoría. */
Chuyitas.MENU = [
  {
    id: 'tacos',
    nombre: 'Tacos',
    desc: 'Tortilla de harina, carne al carbón.',
    img: 'Media/tacoasada.png',
    rango: '$30 – $80',
    variantes: [
      { id: 'asada', nombre: 'Asada', precio: 80, desc: 'Diezmillo o Top Sirloin' },
      { id: 'adobada', nombre: 'Adobada', precio: 60, desc: 'Adobo sonorense' },
      { id: 'mixto', nombre: 'Mixto', precio: 70, desc: 'Asada + adobada' },
      { id: 'tripa', nombre: 'Tripa', precio: 70, desc: 'Tripa crujiente' },
      { id: 'burro-frijol', nombre: 'Burro de frijol', precio: 30, desc: 'Frijol, queso y rajas' },
    ],
  },
  {
    id: 'quesadillas',
    nombre: 'Quesadillas',
    desc: 'Tortilla de harina, queso derretido.',
    img: 'media/quesadilla.png',
    rango: '$80 – $150',
    variantes: [
      { id: 'asada', nombre: 'Asada', precio: 100, desc: 'Queso derretido, carne asada' },
      { id: 'adobada', nombre: 'Adobada', precio: 80, desc: 'Queso derretido, carne adobada' },
      { id: 'mixto', nombre: 'Mixto', precio: 90, desc: 'Asada + adobada' },
      { id: 'especial', nombre: 'Especial', precio: 150, desc: 'Queso extra, carne a elegir' },
    ],
  },
  {
    id: 'percherones',
    nombre: 'Burros Percherones',
    desc: 'Mayonesa, aguacate, tomate, queso y rajas. Se les puede agregar tripa, queso extra o tocino.',
    img: 'media/BurroMixto.jpg',
    rango: '$180 – $220',
    variantes: [
      { id: 'asada', nombre: 'Asada', precio: 220, desc: 'Carne asada' },
      { id: 'adobada', nombre: 'Adobada', precio: 200, desc: 'Carne adobada' },
      { id: 'mixto', nombre: 'Mixto', precio: 180, desc: 'Asada + adobada' },
    ],
  },
];

/* Paso 2 · Bebidas — PRECIOS PLACEHOLDER, ajustar con los reales. */
Chuyitas.BEBIDAS = [
  { id: 'coca', nombre: 'Coca Cola', precio: 35, desc: 'Refresco 355ml' },
  { id: 'jamaica', nombre: 'Jamaica', precio: 35, desc: 'Agua fresca natural' },
  { id: 'horchata', nombre: 'Horchata', precio: 35, desc: 'Agua fresca de arroz' },
  { id: 'te', nombre: 'Te', precio: 35, desc: 'Infusión de té' },
];

/* Paso 3 · Extras — PRECIOS PLACEHOLDER, ajustar con los reales. */
Chuyitas.EXTRAS = [
  { id: 'guacamole', nombre: 'Guacamole', precio: 30, desc: 'Porción' },
  { id: 'salsas', nombre: 'Salsas', precio: 15, desc: 'Roja y verde' },
];

/* Catering: paquetes para eventos (cotización por WhatsApp). */
Chuyitas.CATERING = [
  { personas: 30, precio: 2400, incluye: ['30 tacos de asada (80g)', 'Verdura fresca', 'Salsas roja y verde', 'Tortillas de harina', 'Desechables'] },
  { personas: 50, precio: 3750, incluye: ['50 tacos de asada (80g)', 'Verdura fresca', 'Salsas roja y verde', 'Tortillas de harina', 'Desechables', '10% de descuento'] },
  { personas: 100, precio: 6800, incluye: ['100 tacos de asada (80g)', 'Verdura fresca', 'Salsas roja y verde', 'Tortillas de harina', 'Desechables', '15% de descuento', 'Opción de burros de frijol'] },
];
