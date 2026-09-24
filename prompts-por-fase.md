# Prompts por fase — somewhere.finance

Pega uno a la vez en el chat de Claude Code, solo después de aprobar la fase anterior.

## FASE 2 — Foundation

```text
Implementa la FASE 2 (Foundation) según el plan aprobado.
Alcance: canvas WebGL persistente (cliente, sin SSR), scroll engine con progreso en store/ref mutable, chapter registry con los 14 capítulos como placeholders, camera controller, modo debug de progreso, tema oscuro de la escena, tipografía y navegación mínima. Solo una escena de prueba con unas pocas partículas.
Criterios de aceptación: recorrer los 14 capítulos con el progreso correcto; sin errores de consola; sin re-renders por frame; funciona el modo debug.
Valida con Playwright (capturas en desktop y móvil) y DevTools. Al terminar, dame la lista de archivos creados/modificados y detente.
```

## FASE 3a — Vertical slice (capítulos 01–03)

```text
Implementa solo los capítulos 01 (Singularity), 02 (Big Bang) y 03 (Nebula) con la máxima calidad visual posible. Este es el vertical slice que fija el lenguaje visual de todo el resto.
Valida con el ciclo del brief (capturas por progreso, máximo 3 rondas de refinamiento, DevTools para rendimiento). Preséntame capturas y métricas y detente para mi aprobación antes de seguir.
```

## FASE 3b — Universo (capítulos 04–06)

```text
Con el lenguaje visual aprobado, implementa los capítulos 04 (Galaxies), 05 (Chains) y 06 (Universe). Galaxias procedurales con instancing; identidades abstractas por chain, sin logos y sin propiedades técnicas inventadas.
Mismo ciclo de validación y misma parada para aprobación.
```

## FASE 4 — NFFC (capítulos 07–10)

```text
Implementa los capítulos 07 a 10 (NFFC, Index, Non-Fungible, Digital DNA). Datos mock en data/nffc.js con la etiqueta "Illustrative data" visible. La recomposición de órbitas debe explicar el concepto por sí sola, y la transición a la doble hélice debe ser el segundo gran momento visual.
Mismo ciclo de validación y misma parada para aprobación.
```

## FASE 5 — Mercado y cierre (capítulos 11–14)

```text
Implementa los capítulos 11 a 14 (Market, Your Universe, One Universe, Final) con datos mock separados en data/market.js. El final debe cerrar el círculo con el punto inicial, ahora convertido en "somewhere" y el CTA.
Mismo ciclo de validación y misma parada para aprobación.
```

## FASE 6 — Polish

```text
FASE 6 (Polish): transiciones entre capítulos, microinteracciones, tipografía, responsive real en móvil/tablet, accesibilidad (teclado, foco, contraste, reduced motion con versión estática), fallback sin WebGL, pantalla de carga y manejo de errores.
Rendimiento: mide con DevTools, compara con los presupuestos de CLAUDE.md, reporta el cuello de botella de cada capítulo y corrígelo. Dime qué necesita medirse en mi GPU real.
Entrégame un informe final con lo hecho, lo pendiente y los riesgos abiertos.
```

