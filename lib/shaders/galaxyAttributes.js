// Genera los atributos por partícula de una galaxia procedural una sola vez
// (a nivel de módulo, nunca dentro del render — mismo motivo que en
// UniverseParticles: no llamar a Math.random durante el ciclo de React).
export function createGalaxyAttributes(count, { armCount, colorMixCenter = 0.3, sizeRange = [1.2, 3.5] }) {
  const position = new Float32Array(count * 3);
  const aRadiusSeed = new Float32Array(count);
  const aArmIndex = new Float32Array(count);
  const aAngleJitter = new Float32Array(count);
  const aHeightSeed = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aBaseSize = new Float32Array(count);
  const aColorMix = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    // Radio mínimo garantizado: sin él, demasiadas partículas convergen a
    // radio≈0 y el bloom las funde en un núcleo saturado sin forma.
    aRadiusSeed[i] = 0.12 + Math.pow(Math.random(), 2.2) * 0.88;
    aArmIndex[i] = Math.floor(Math.random() * armCount);
    aAngleJitter[i] = (Math.random() - 0.5) * 0.5;
    aHeightSeed[i] = Math.random() * 2 - 1;
    aSeed[i] = Math.random();
    aBaseSize[i] = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    aColorMix[i] = Math.min(1, Math.max(0, colorMixCenter + (Math.random() - 0.5) * 0.3));
  }

  return { position, aRadiusSeed, aArmIndex, aAngleJitter, aHeightSeed, aSeed, aBaseSize, aColorMix };
}
