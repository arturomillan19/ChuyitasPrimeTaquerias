# Brand Profile — Chuyitas Prime

> Perfil de marca (Prism). Fuente única de verdad visual del sitio. Todo se diseña
> *desde* aquí. Construido en modo Forge (greenfield + extracción del index original).

## 1 · Esencia

- **Negocio:** Chuyitas Prime · Tacos & Burros. Taquería sonorense de noche, carne al carbón.
  Heroica Guaymas, Sonora.
- **Misión:** llevar el sabor de la carne asada sonorense de calidad a la mesa (o al WhatsApp)
  de cualquiera, sin perder el alma de puesto de barrio.
- **Arquetipo (Jung):** *Everyman* honesto con un filo de *Outlaw* nocturno — cercano, sin
  pretensión, pero con orgullo y carácter. No es un restaurante fino; es el mejor puesto.
- **Adjetivos (5):** brasa · sonorense · honesto · nocturno · sabroso.
- **El sentimiento que debe evocar:** hambre — y la confianza de "aquí saben lo que hacen".
- **Audiencia:** vecinos de Guaymas y alrededores pidiendo cena (mar–dom, 6:30pm–12:30am),
  la mayoría **desde el celular**. Quieren armar el pedido rápido y mandarlo por WhatsApp.

## 2 · Color (OKLCH · regla 60-30-10)

Derivado de la intención de la página original (negro + naranja + rojo) pero disciplinado.

| Rol | Token | OKLCH | ~Hex | Uso |
|---|---|---|---|---|
| Paper (60%) | `--color-paper` | `oklch(14% 0.012 60)` | `#0c0a09` | fondo carbón casi negro (noche/carbón) |
| Paper-2 | `--color-paper-2` | `oklch(18% 0.016 55)` | `#15110d` | superficies elevadas (bandas, modal, drawer) |
| Ink (30%) | `--color-ink` | `oklch(92% 0.02 70)` | `#f3e9da` | crema hueso — texto principal sobre carbón |
| Ink-muted | `--color-ink-muted` | `oklch(66% 0.02 65)` | `#9a8f81` | humo — meta, descripciones, captions |
| Accent (10%) | `--color-brasa` | `oklch(64% 0.17 47)` | `#e8631a` | naranja brasa — acento, precios, CTA |
| Accent-claro | `--color-brasa-2` | `oklch(72% 0.16 50)` | `#f7882e` | hover / brasa viva |
| Apoyo | `--color-rojo` | `oklch(45% 0.16 28)` | `#9e2b1e` | rojo profundo — promo, detalles |
| Línea | `--color-line` | `oklch(92% 0.02 70 / .13)` | — | hairlines editoriales |

- Accent reservado para lo que debe brillar (precio, CTA, número de carrito). Nunca como fondo
  de bloques grandes. Contraste de texto crema sobre carbón ≫ 4.5:1.

## 3 · Tipografía (Opción B — elegida por el usuario)

- **Display:** **Gloock** (serif contemporánea de alto carácter, peso sin perder refinamiento).
  Titulares, nombres de categoría, nombres de platillo. Romana siempre (sin itálica en headers).
- **Cuerpo / UI:** **DM Sans** (grotesca geométrica legible). Texto, labels, botones, formularios.
- 2 familias, tope. Contraste serif display + sans cuerpo = pairing editorial intencional.
- Escala modular 1.25 sobre 16px. Display con tracking ligeramente negativo; labels ALL-CAPS
  con tracking positivo.

## 4 · Composición (doctrina)

- **Macroestructura (Hallmark): Catalogue** — la página es un índice visual del inventario (la
  carta). Pero NO grid de cards uniformes: las 3 categorías son **bandas/registros editoriales
  apilados** (tipo carta de menú impresa), separadas por regla hairline y banda de categoría.
- **Mobile-first.** Diseñado a ~375px primero; en desktop las bandas ganan aire y columnas.
- Rejilla con asimetría editorial: número/etiqueta de categoría a un lado, contenido al otro.
- Negative space activo; el carbón respira. Restraint = se ve premium, no de plantilla.
- Nav: **N6 newspaper masthead** (gaceta de barrio). Footer: **Ft1 mast-headed**.

## 5 · Dirección estética (blend)

`55% editorial / 30% retro sonorense / 15% brasa-brutal`

- *Editorial* manda: rejilla fuerte, escala tipográfica dramática con Gloock, reglas y captions.
- *Retro sonorense* modifica: calidez de carbón, rojo profundo, aire de letrero de taquería.
- *Brasa-brutal* es la chispa: el naranja brasa que detiene el scroll en precios y CTA.

## 6 · Imágenes

- Video del asador (`media/AsadorFondo.MOV`) detrás del titular del hero, atenuado.
- Una imagen por categoría (taco / quesadilla / percherón). Placeholder o de internet hasta que
  el hermano mande fotos reales. Tratamiento: cálido, contrastado, sin filtros de moda.

## 7 · Guardrails ("nunca")

- Nunca el layout genérico AI (hero centrado → 3 features → grid de cards → footer 4 columnas).
- Nunca degradados sucios, glow, neón, sombras suaves de "card flotante" por todos lados.
- Nunca emoji como decoración (los íconos son funcionales).
- Nunca headers en itálica. Nunca centrar párrafos largos.
- Nunca accent naranja como fondo de áreas grandes.

## 8 · Voz verbal

Directa, de barrio, con orgullo. "Arma tu pedido", "Así sabe Sonora", "Pásale". Sin corporativo,
sin inventar métricas. El tono visual (cálido, honesto, con filo) calza con el verbal.
