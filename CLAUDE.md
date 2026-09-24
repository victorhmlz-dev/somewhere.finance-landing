# somewhere.finance — reglas del proyecto

## Stack y convenciones
- Detecta el stack real (versión de Next.js, React, router, sistema de estilos, dependencias) antes de tocar nada y respétalo.
- Lenguaje: JAVASCRIPT.
- Estilos en archivos separados de los componentes. Datos mock en archivos de datos propios (data/*.js), nunca inline en componentes. Configuración y claves en .env; nunca hardcodees secretos.
- No añadas dependencias sin justificarlo antes (qué problema resuelve, alternativa sin dependencia, peso aproximado).
- Antes de usar una librería nueva o una API que no domines, consulta su documentación actual con Context7 y comprueba que su versión es compatible con las instaladas (React, Next.js).
- Reutiliza componentes, tokens y variables CSS existentes. No reorganices el proyecto más de lo necesario.

## Git
- No uses Git ni GitHub en absoluto: sin commits, ramas, push, checkout, stash ni reset. Lo gestiono yo.
- Como no hay red de seguridad de Git: no borres ni sobrescribas archivos existentes sin avisarme, y al final de cada entrega lista los archivos creados y modificados.

## Contenido y cumplimiento
- NFFC (NonFungible Financial Collectibles) es una metáfora de producto y de estructura visual. Nunca lo presentes como fondo indexado, ni como asesoramiento financiero, ni prometas rendimientos, APY o dividendos.
- Todos los datos son mock. Cualquier dato de demostración visible en la UI lleva la etiqueta "Illustrative data".
- Sin APIs financieras reales y sin conexión de wallets (salvo lo que ya exista en el proyecto).
- El copy de la interfaz es en inglés y breve. Patrón: visual → interacción → frase corta. Nunca párrafos largos.

## Rendimiento y accesibilidad (no negociables)
- WebGL: InstancedMesh y BufferGeometry, DPR limitado (máx. 2 en desktop, 1.5 en móvil), sin crear ni destruir objetos por frame, sin estado de React por frame.
- El progreso de scroll vive en un store o ref mutable que se lee dentro del loop de render. React solo se re-renderiza al cambiar de capítulo.
- Todo el texto vive en el DOM con HTML semántico; nunca dentro del canvas.
- prefers-reduced-motion: versión simple/estática que comunique el mismo contenido, sin camera shake. Fallback si WebGL no está disponible.
- Presupuestos iniciales (ajustables cuando midamos): objetivo 60 fps en desktop y al menos 30 fps en móvil de gama media; aprox. 150k partículas en desktop y 30k en móvil por escena activa.

## Validación
- Que compile no significa que funcione. Verifica con Playwright y Chrome DevTools según el brief (docs/SCROLLYTELLING_BRIEF.md, sección Validación).
- Para consultar el diseño creativo completo, lee docs/SCROLLYTELLING_BRIEF.md.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
