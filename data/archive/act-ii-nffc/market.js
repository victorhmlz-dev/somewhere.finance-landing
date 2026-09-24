// Datos mock de actividad de mercado para el capítulo 11 (The Market
// Moves). Todo ficticio — nunca cifras reales, nunca presentado como tal.
// Cualquier UI que muestre estos valores lleva la etiqueta "Illustrative
// data" (ver components/dom/MarketStats.jsx). Sin asesoramiento financiero,
// sin rendimientos/APY: son señales de actividad (volumen, ventas,
// holders, floor), no promesas de rentabilidad — mismas reglas de
// CLAUDE.md que rigen data/nffc.js.
export const MARKET = {
  volume24h: "482.3K",
  sales24h: "128",
  holders: "946",
  floorPrice: "0.42 ETH",
  // Reparto usado para las "órbitas" del capítulo 11 (reutiliza
  // buildOrbitalLayout, igual que la composición de un NFFC): cada métrica
  // es un anillo, su peso decide cuántos nodos/cuánta densidad tiene — no
  // representa una composición de activos real, solo un ritmo visual.
  activity: [
    { asset: "VOLUME", weight: 32, color: "#5142fc" },
    { asset: "SALES", weight: 26, color: "#af50e5" },
    { asset: "HOLDERS", weight: 24, color: "#8a92b2" },
    { asset: "FLOOR", weight: 18, color: "#ffffff" },
  ],
  // Instantes (fracción 0-1 del autoplay del capítulo) en los que la
  // órbita "pulsa" — particle bursts / light trails puntuales, no un
  // efecto permanente. Puramente cosmético, sin relación con datos reales.
  bursts: [0.12, 0.38, 0.64, 0.86],
};
