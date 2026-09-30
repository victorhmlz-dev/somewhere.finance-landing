import * as THREE from "three";

// Puente mínimo cámara -> DOM: CameraRig (dentro del Canvas) escribe aquí la
// matriz vista-proyección cada frame; los overlays de DOM que necesitan
// proyectar una posición 3D a píxeles (p. ej. las etiquetas de las chains)
// la leen en su propio rAF. Mismo patrón que scrollStore: un objeto mutable
// compartido, sin pasar por estado de React ni por contexto.
export const cameraBridge = {
  viewProjectionMatrix: new THREE.Matrix4(),
  ready: false,
};

const tmpVector = new THREE.Vector3();

// Profundidad de vista (w de clip) de una posición del mundo: mayor = más
// lejos de la cámara. Sin allocations — lee la matriz directamente.
export function getViewDepth(worldPos) {
  const e = cameraBridge.viewProjectionMatrix.elements;
  return e[3] * worldPos[0] + e[7] * worldPos[1] + e[11] * worldPos[2] + e[15];
}

// Proyecta una posición del mundo a coordenadas de píxel de pantalla.
// Devuelve null si el punto cae detrás de la cámara.
export function projectToScreen(worldPos, width, height) {
  if (!cameraBridge.ready) return null;
  tmpVector.set(worldPos[0], worldPos[1], worldPos[2]);
  tmpVector.applyMatrix4(cameraBridge.viewProjectionMatrix);
  if (tmpVector.z > 1) return null; // detrás de la cámara en NDC
  return {
    x: (tmpVector.x * 0.5 + 0.5) * width,
    y: (1 - (tmpVector.y * 0.5 + 0.5)) * height,
  };
}
