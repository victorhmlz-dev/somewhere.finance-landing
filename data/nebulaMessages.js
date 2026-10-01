// Burbujas de "chat" ambiental de la Nebula (capítulo 03,
// components/dom/NebulaMessages.jsx) — insinúan un futuro social-fi para
// NFTs, sin funcionalidad real detrás. Jerga de comunidad ficticia, a
// propósito sin cifras, montos ni afirmaciones verificables (reglas de
// cumplimiento de CLAUDE.md: nunca dato financiero).
//
// - `top`/`left`: posición en pantalla (centro de la burbuja). Mantener
//   `left` entre ~10% y ~90% para que no se corte en móvil, `top` por
//   debajo de ~16% (la navegación ocupa la franja superior en móvil) y
//   evitar la franja inferior central (70-90% top), donde vive el lettering.
// - `appearAt`: progreso del capítulo (0-1) en el que empieza a aparecer.
// - `holdFor`: cuánto progreso se mantiene visible antes de apagarse.
//   `persist: true` la ignora: la burbuja se queda hasta el cambio de
//   escena y se apaga al entrar en la siguiente.
export const NEBULA_MESSAGES = [
  { id: "m1", text: "to the moon!", top: "22%", left: "14%", appearAt: 0.34, persist: true },
  { id: "m2", text: "zero fud today", top: "64%", left: "18%", appearAt: 0.42, holdFor: 0.3 },
  { id: "m3", text: "loool", top: "30%", left: "80%", appearAt: 0.5, holdFor: 0.3 },
  { id: "m4", text: "farming aura", top: "66%", left: "80%", appearAt: 0.58, persist: true },
  { id: "m5", text: "gm", top: "44%", left: "10%", appearAt: 0.12, holdFor: 0.28 },
  { id: "m6", text: "wagmi", top: "20%", left: "64%", appearAt: 0.2, persist: true },
  { id: "m7", text: "new pfp, who dis", top: "48%", left: "86%", appearAt: 0.28, holdFor: 0.3 },
  { id: "m8", text: "ser, this is art", top: "17%", left: "32%", appearAt: 0.46, persist: true },
  { id: "m9", text: "just joined the guild", top: "56%", left: "30%", appearAt: 0.66, holdFor: 0.1 },
  { id: "m10", text: "iykyk", top: "40%", left: "70%", appearAt: 0.74, persist: true },
];
