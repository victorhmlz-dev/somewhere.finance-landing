// Posición de una galaxia espiral procedural: distribución por brazos,
// rotación diferencial (el interior gira más rápido que el exterior, como
// una espiral real) y ruido orgánico. Un único chunk reutilizado por el
// morph nebulosa->galaxia del acto 4, las colecciones del cap. 04, las
// chains del cap. 05 y las galaxias cercanas del LOD del cap. 06 — nunca
// un círculo relleno de estrellas.
export const galaxyGLSL = /* glsl */ `
  vec3 galaxyPosition(
    float radiusSeed,   // 0-1, con sesgo hacia el centro ya aplicado
    float armIndex,     // entero (como float) 0..armCount-1
    float angleJitter,  // pequeño offset propio de la partícula
    float heightSeed,   // -1..1
    float armCount,
    float tightness,
    float radius,
    float thickness,
    float noiseAmount,
    float rotationSpeed,
    float t
  ) {
    float r = radiusSeed * radius;
    float armAngle = armIndex * (6.28318530718 / armCount);
    float spiral = radiusSeed * tightness;
    // Rotación diferencial: 1/(r+eps) hace que el centro gire más rápido.
    float spin = rotationSpeed * t / (radiusSeed * 0.8 + 0.15);
    float angle = armAngle + spiral + spin + angleJitter;

    // Disco en el plano XY (normal en Z, hacia la cámara por defecto): así
    // se ve de frente, la vista clásica de espiral — en XZ quedaba de canto.
    vec3 pos = vec3(cos(angle) * r, sin(angle) * r, heightSeed * thickness * (1.0 - radiusSeed * 0.5));
    pos += curlNoise(pos * 0.6 + t * 0.02) * noiseAmount;
    return pos;
  }
`;
