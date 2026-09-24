// Datos mock de los NFFC (NonFungible Financial Collectibles) del Acto II
// (capítulos 07-10). Metáfora de producto únicamente: un NFFC es una
// colección concebida como una estructura tipo índice — una composición de
// activos subyacentes — visualizada como sistema orbital (ver
// docs/SCROLLYTELLING_BRIEF.md, "Concepto NFFC"). Nunca presentar esto como
// un fondo indexado real, asesoramiento financiero, ni inventar
// rendimientos/APY: son datos ilustrativos, marcados como tales en toda la
// UI que los muestre ("Illustrative data").
//
// `featured: true` marca el NFFC #0421 que protagoniza los capítulos 08-10
// (y quedará disponible para la Fase 5). Los pesos de `composition` suman
// 100 en cada entrada.
export const NFFC = [
  {
    id: "0421",
    name: "Somewhere Index #0421",
    collection: "Somewhere Index",
    rarity: "Rare",
    chain: "Ethereum",
    status: "ACTIVE",
    owner: "0x7bA3...F19c",
    featured: true,
    composition: [
      { asset: "BTC", weight: 32, color: "#af50e5" },
      { asset: "ETH", weight: 24, color: "#5142fc" },
      { asset: "SOL", weight: 18, color: "#8a92b2" },
      { asset: "TOKENIZED EQUITIES", weight: 16, color: "#bdbdbd" },
      { asset: "STABLE ASSETS", weight: 10, color: "#ffffff" },
    ],
    history: [
      { date: "2025-11-02", event: "Minted" },
      { date: "2026-01-14", event: "Composition rebalanced" },
      { date: "2026-04-30", event: "Transferred" },
    ],
  },
  {
    id: "0188",
    name: "Somewhere Index #0188",
    collection: "Somewhere Index",
    rarity: "Common",
    chain: "Solana",
    status: "ACTIVE",
    owner: "8xQm...4kRp",
    featured: false,
    composition: [
      { asset: "SOL", weight: 40, color: "#8a92b2" },
      { asset: "BTC", weight: 22, color: "#af50e5" },
      { asset: "STABLE ASSETS", weight: 20, color: "#ffffff" },
      { asset: "ETH", weight: 18, color: "#5142fc" },
    ],
    history: [
      { date: "2025-08-19", event: "Minted" },
      { date: "2026-02-03", event: "Transferred" },
    ],
  },
  {
    id: "0937",
    name: "Somewhere Index #0937",
    collection: "Somewhere Index",
    rarity: "Epic",
    chain: "BSC",
    status: "LOCKED",
    owner: "0x1Fd8...9aE2",
    featured: false,
    composition: [
      { asset: "BTC", weight: 28, color: "#af50e5" },
      { asset: "TOKENIZED EQUITIES", weight: 26, color: "#bdbdbd" },
      { asset: "ETH", weight: 22, color: "#5142fc" },
      { asset: "SOL", weight: 14, color: "#8a92b2" },
      { asset: "STABLE ASSETS", weight: 10, color: "#ffffff" },
    ],
    history: [
      { date: "2025-05-27", event: "Minted" },
      { date: "2025-12-11", event: "Composition rebalanced" },
      { date: "2026-03-08", event: "Locked" },
    ],
  },
  {
    id: "0056",
    name: "Somewhere Index #0056",
    collection: "Somewhere Index",
    rarity: "Legendary",
    chain: "Ethereum",
    status: "ACTIVE",
    owner: "0x4Ec1...0bD7",
    featured: false,
    composition: [
      { asset: "ETH", weight: 34, color: "#5142fc" },
      { asset: "BTC", weight: 30, color: "#af50e5" },
      { asset: "TOKENIZED EQUITIES", weight: 20, color: "#bdbdbd" },
      { asset: "STABLE ASSETS", weight: 16, color: "#ffffff" },
    ],
    history: [
      { date: "2025-02-14", event: "Minted" },
      { date: "2025-09-30", event: "Transferred" },
      { date: "2026-05-19", event: "Composition rebalanced" },
    ],
  },
  {
    id: "0763",
    name: "Somewhere Index #0763",
    collection: "Somewhere Index",
    rarity: "Rare",
    chain: "Robinhood",
    status: "ACTIVE",
    owner: "0x2A90...C64f",
    featured: false,
    composition: [
      { asset: "TOKENIZED EQUITIES", weight: 38, color: "#bdbdbd" },
      { asset: "STABLE ASSETS", weight: 24, color: "#ffffff" },
      { asset: "BTC", weight: 20, color: "#af50e5" },
      { asset: "ETH", weight: 18, color: "#5142fc" },
    ],
    history: [
      { date: "2025-10-06", event: "Minted" },
      { date: "2026-06-21", event: "Transferred" },
    ],
  },
];

export const FEATURED_NFFC = NFFC.find((n) => n.featured) ?? NFFC[0];
