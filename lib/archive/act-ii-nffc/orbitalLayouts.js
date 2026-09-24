// Generadores de posiciones (JS, no GLSL) para el sistema orbital del NFFC
// (capítulos 07-10). A diferencia de galaxyAttributes.js (que genera
// atributos leídos por un shader), aquí las posiciones se calculan una vez
// por configuración y se escriben en un InstancedMesh vía instanceMatrix
// cada frame (mismo patrón que Fragments.jsx) — así una única instancia de
// OrbitalMaterial sirve para las cuatro coreografías (scatter de galaxia,
// dos reconfiguraciones orbitales, hélice) sin duplicar el shader.
//
// Todas las funciones devuelven `count` posiciones [x, y, z] más un
// `colorMix` (0-1, blanco→primary→accent) por instancia, para que el
// llamador solo tenga que blendear entre configuraciones e ir escribiendo
// la matriz de cada instancia.

// Estado de partida del capítulo 07: una galaxia en miniatura (mismo
// lenguaje visual que galaxyPosition/GALAXY_MORPH) de la que "salen" los
// nodos orbitales — así el ojo lee continuidad entre la galaxia que se
// aleja y el sistema que la sustituye.
export function buildGalaxyScatterLayout(count, { armCount = 3, tightness = 2.2, radius = 7 } = {}) {
  const positions = [];
  const colorMix = [];
  for (let i = 0; i < count; i += 1) {
    const radiusSeed = 0.12 + Math.pow(Math.random(), 2.2) * 0.88;
    const armIndex = Math.floor(Math.random() * armCount);
    const angleJitter = (Math.random() - 0.5) * 0.5;
    const heightSeed = Math.random() * 2 - 1;
    const r = radiusSeed * radius;
    const angle = armIndex * ((Math.PI * 2) / armCount) + radiusSeed * tightness + angleJitter;
    positions.push([Math.cos(angle) * r, Math.sin(angle) * r, heightSeed * 0.6 * (1 - radiusSeed * 0.5)]);
    colorMix.push(Math.random() * 0.3);
  }
  return { positions, colorMix };
}

// Sistema orbital: los `count` nodos se reparten entre los activos de
// `composition` en proporción a su peso (más peso → más nodos → anillo más
// denso/brillante, en vez de cambiar el radio, que es más legible). Cada
// `variant` reordena radios/densidad/inclinación para dar la sensación de
// "reconfiguración" del capítulo 08 sin tocar los pesos reales mostrados en
// el DOM (esos nunca cambian: solo cambia cómo se disponen visualmente).
export function buildOrbitalLayout(composition, count, variant = 0) {
  const totalWeight = composition.reduce((sum, c) => sum + c.weight, 0);
  const counts = composition.map((c) => Math.max(1, Math.round((c.weight / totalWeight) * count)));
  // Ajuste fino para que la suma cuadre exactamente con `count`.
  let diff = count - counts.reduce((a, b) => a + b, 0);
  let i = 0;
  while (diff !== 0) {
    counts[i % counts.length] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i += 1;
  }

  const baseRadius = 3.2;
  const ringSpacing = variant === 1 ? 1.9 : variant === 2 ? 1.4 : 1.6;
  const radiusJitterAmp = variant === 2 ? 0.35 : 0.18;

  const positions = [];
  const colorMix = [];
  const ringIndexByInstance = [];

  composition.forEach((asset, ringIndex) => {
    const ringRadius = baseRadius + ringIndex * ringSpacing;
    // Inclinación alterna por anillo: da profundidad, evita que se lea como
    // un plano único de círculos concéntricos.
    const inclination = (ringIndex % 2 === 0 ? 1 : -1) * (0.15 + ringIndex * 0.05) * (variant === 1 ? 1.4 : 1);
    const n = counts[ringIndex];
    for (let k = 0; k < n; k += 1) {
      const seed = (k + 0.5) / n;
      const angle = seed * Math.PI * 2 + ringIndex * 0.7;
      const r = ringRadius + (Math.sin(seed * 41.0 + ringIndex) * radiusJitterAmp);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r * Math.sin(inclination);
      const z = Math.sin(angle) * r * Math.cos(inclination) * 0.35;
      positions.push([x, y, z]);
      colorMix.push(ringIndex / Math.max(1, composition.length - 1));
      ringIndexByInstance.push(ringIndex);
    }
  });

  return { positions, colorMix, ringIndexByInstance, counts };
}

// Doble hélice del capítulo 10: dos hebras entrelazadas, una por cada mitad
// de instancias de cada capa. `layers` es un array de nombres (artwork,
// metadata, ownership...); cada capa ocupa un bloque contiguo a lo largo
// del eje de la hélice, con su propio colorMix para distinguirse.
export function buildHelixLayout(layers, count) {
  const perLayer = Math.floor(count / layers.length);
  const remainder = count - perLayer * layers.length;
  const helixRadius = 2.6;
  const helixHeight = 13;
  const turns = 3.2;

  const positions = [];
  const colorMix = [];
  const layerIndexByInstance = [];

  layers.forEach((_, layerIndex) => {
    const n = perLayer + (layerIndex < remainder ? 1 : 0);
    const layerStartT = layerIndex / layers.length;
    const layerEndT = (layerIndex + 1) / layers.length;
    for (let k = 0; k < n; k += 1) {
      const localT = n > 1 ? k / (n - 1) : 0;
      const t = layerStartT + localT * (layerEndT - layerStartT);
      const strand = k % 2; // alterna entre las dos hebras
      const angle = t * turns * Math.PI * 2 + strand * Math.PI;
      const y = (t - 0.5) * helixHeight;
      positions.push([Math.cos(angle) * helixRadius, y, Math.sin(angle) * helixRadius]);
      colorMix.push(layerIndex / Math.max(1, layers.length - 1));
      layerIndexByInstance.push(layerIndex);
    }
  });

  // Relleno si count no es múltiplo exacto (no debería ocurrir con la
  // distribución de arriba, pero por seguridad no dejamos instancias sin
  // posición asignada).
  while (positions.length < count) {
    positions.push(positions[positions.length - 1] ?? [0, 0, 0]);
    colorMix.push(colorMix[colorMix.length - 1] ?? 0);
    layerIndexByInstance.push(layerIndexByInstance[layerIndexByInstance.length - 1] ?? 0);
  }

  return { positions, colorMix, layerIndexByInstance };
}

// Blend piecewise A→B→C en 0-1 (0→A, 0.5→B, 1→C), continuo en los dos
// tramos. Con solo dos configuraciones basta pasar la misma en B y C (o en
// A y B) para que ese tramo simplemente se mantenga fijo.
export function blend3(a, b, c, t) {
  if (t <= 0.5) {
    const local = t * 2;
    return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local, a[2] + (b[2] - a[2]) * local];
  }
  const local = (t - 0.5) * 2;
  return [b[0] + (c[0] - b[0]) * local, b[1] + (c[1] - b[1]) * local, b[2] + (c[2] - b[2]) * local];
}

// Misma mezcla piecewise que blend3, para un escalar (colorMix por
// instancia) en vez de una posición.
export function blend1(a, b, c, t) {
  if (t <= 0.5) return a + (b - a) * (t * 2);
  return b + (c - b) * ((t - 0.5) * 2);
}
