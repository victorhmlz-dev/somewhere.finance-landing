# Chain logos — sourcing

Usados en el capítulo activo "The Galaxies & Chains" (04, cúmulo derecho),
junto a la etiqueta de cada ecosistema (`components/dom/EcosystemNodes.jsx`,
vía la proyección de `lib/scroll/cameraBridge.js`). Colores originales de
cada marca, sin forzar a la paleta del proyecto.

El cúmulo izquierdo del mismo capítulo (empresas con acciones tokenizadas —
Tesla, Apple, X, SpaceX, Google, Amazon, Nvidia) SÍ usa un icono real por
instrucción explícita (corrección de la composición, ver
`docs/ARCHIVED_NFFC_ACT.md` para el historial de esa decisión). A diferencia
de las chains de arriba (ecosistemas cripto que en general fomentan el uso de
su logo en integraciones de terceros), estas son marcas de consumo con
políticas de marca restrictivas — no encontré un brand-kit público que
autorice explícitamente este uso en un producto no afiliado (intenté
`about.google/brand-resource-center`, que redirige a un portal de partners
con acceso restringido; `nvidia.com/.../brand-guidelines` da 404; `spacex.com/media`
no expone assets descargables). Por eso los 7 iconos vienen de **Simple
Icons** (`simpleicons.org`, licencia CC0 sobre el propio trazado SVG que
ellos redibujan) en vez de un archivo oficial de cada marca — es una fuente
transparente y ampliamente usada para mostrar marcas de terceros en UI
(exactamente este caso de uso), pero **la marca registrada sigue siendo de
cada compañía**: confirma que este uso es aceptable para ti (o consigue
licencia/permiso expreso) antes de un lanzamiento real, no solo antes de un
demo.

- Archivos: `tesla-mark-red.svg`, `apple-mark-white.svg`, `x-mark-white.svg`,
  `spacex-mark-white.svg`, `google-mark-white.svg`, `amazon-mark-orange.svg`,
  `nvidia-mark-green.svg`.
- Fuente: `https://cdn.simpleicons.org/<slug>/<hex>` (Tesla, Apple, X,
  SpaceX, Google, Nvidia) y `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazon.svg`
  recoloreado a mano (el endpoint de color de `cdn.simpleicons.org` no
  resolvía ese slug) — Simple Icons es el mismo trazado en los dos casos.
- Color: rojo de marca para Tesla (`#CC0000`) y verde de marca para Nvidia
  (`#76B900`) y naranja de marca para Amazon (`#FF9900`) — reconocibles y
  visibles sobre fondo oscuro. Apple/X/SpaceX/Google en blanco: su marca
  canónica en un solo tono es negra (invisible sobre el fondo oscuro del
  proyecto) — blanco es el tratamiento estándar de esas marcas en superficies
  oscuras. El "G" de Google es su versión monocromo (Simple Icons no ofrece
  el "G" de cuatro colores como un solo trazado recoloreable).

Lo archivado en `components/archive/act-ii-nffc/` (ver
`docs/ARCHIVED_NFFC_ACT.md`) también sigue leyendo estos mismos archivos si
se reconecta "One Universe".

## Ethereum

- Archivo: `eth-diamond-purple.svg`
- Fuente: página oficial de brand assets de la Ethereum Foundation,
  https://ethereum.org/en/assets/
- URL directa: `https://ethereum.org/images/assets/svgs/eth-diamond-purple.svg`
- Es el diamante ETH (símbolo del token), no el logo de la fundación con
  wordmark.

## Solana

- Archivo: `solana-logomark.svg`
- Fuente: página oficial de branding de la Solana Foundation,
  https://solana.com/branding
- URL directa: `https://solana.com/src/img/branding/solanaLogoMark.svg`
- Logomark (las tres barras), no el logotipo completo con wordmark.

## BNB Chain (BSC)

- Archivo: `bnb-symbol-yellow.svg`
- Fuente: guía de marca oficial de BNB Chain,
  https://www.bnbchain.org/en/brand-guidelines
- URL directa: `https://www.bnbchain.org/images/brand-guidelines/svg/BNB Chain_Symbol_Yellow.svg`
- Símbolo/moneda BNB (color oficial #F0B90B), no el logo de Binance.

## Base

- Archivo: `base-square-blue.svg`
- Fuente: repositorio oficial de marca de Base (Coinbase/Base team),
  https://github.com/base/brand-kit
- URL directa: `https://raw.githubusercontent.com/base/brand-kit/main/logo/TheSquare/Digital/Base_square_blue.svg`
- "The Square", el símbolo/icono oficial (no el wordmark). Color azul puro
  (`#0000FF`, RGB 0/0/255) — comprobado en https://brand.base.org/color:
  es el azul de marca real de Base ("screen native RGB 0 0 255"), no un
  placeholder del archivo fuente.

## Optimism

- Archivo: `optimism-symbol.svg`
- Fuente: página oficial de marca de Optimism, https://www.optimism.io/brand
- URL directa del asset original (composición completa, tarjeta con fondo):
  `https://cdn.sanity.io/images/y6ka751a/production/0619395edc911805bcea3268156418134c1c5b32-2500x1875.svg`
- El archivo guardado aquí es un recorte de ese mismo SVG (mismo `<rect>` y
  `<path>`, mismos colores) al área real del símbolo (viewBox `841 529 817
  817`), quitando el rectángulo de fondo `#F3F3F1` que solo era el marco de
  la tarjeta de presentación — el propio sitio de Optimism distingue este
  "OP Mainnet symbol" (para referirse a la blockchain) del wordmark y del
  avatar del token OP.

## Arbitrum

- Archivo: `arbitrum-symbol.svg`
- Fuente: Arbiscan (explorador oficial de Arbitrum, Offchain Labs),
  https://arbiscan.io/brandassets — la página oficial `arbitrum.io/brand-kit`
  devolvió 403 al intentar leerla directamente.
- URL directa: `https://arbiscan.io/assets/arbitrum/images/svg/brandassets/logo-symbol.svg`
- Símbolo/icono independiente (no el wordmark), colores de marca oficiales
  (`#12AAFF`, `#213147`, `#9DCCED`).

## Robinhood

- Archivo: `robinhood.png`
- Se buscó específicamente una marca propia de **Robinhood Chain** (la
  blockchain), distinta del icono de la app de trading. Resultado: no existe.
  La documentación oficial (`docs.robinhood.com/chain`) y la página de
  producto (`robinhood.com/us/en/blockchain`) usan el mismo icono corporativo
  de la pluma de Robinhood (`feather-light.svg` / `feather-dark.svg`,
  servidos desde `cdn.robinhood.com`) — es literalmente el mismo mark que la
  app, no uno específico de la chain.
- Decisión inicial (ya no vigente): no sustituir por el logo de la empresa,
  `logo: null` en `data/chains.js` y tratamiento abstracto sin icono.
- Decisión actual, por instrucción explícita: se usa igualmente el icono
  corporativo de la pluma (`robinhood.png`, ya presente en esta carpeta) en
  `data/chains.js` — mismo caso que las 7 empresas de abajo (icono real de
  una marca sin distinción propia para "la chain" en concreto).
