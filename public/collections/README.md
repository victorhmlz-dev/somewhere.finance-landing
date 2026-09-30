# Imágenes NFT — sourcing

Estas imágenes son tuyas (aportadas por ti, no generadas por código ni
descargadas de ningún sitio). Confirma que tienes derecho de uso sobre cada
una antes de un lanzamiento real. Por la regla de cumplimiento del proyecto
(CLAUDE.md): nunca deben ser artwork real de colecciones NFT existentes de
terceros — usa arte propio, encargado, o con licencia clara.

## Dónde se usan

Las tarjetas que emergen de la Nebula (capítulo 03,
`components/canvas/scenes/NftEmergence.jsx`). La lista y el orden de
aparición están en `data/nftCards.js`: todas en desktop, las 5 primeras en
móvil. Si un archivo falta o no carga, su tarjeta simplemente no se muestra.

## Añadir o cambiar una imagen

1. Coloca el archivo aquí (`public/collections/`).
2. Añade o edita su entrada en `data/nftCards.js`
   (`image: "/collections/<archivo>"`).

## Formato recomendado

- Cuadradas (1:1): se muestran en un plano siempre de cara a cámara; otro
  aspect ratio se deformaría.
- 900–1024 px de lado es suficiente incluso con DPR 2.
- `.jpg` para arte con muchos tonos; `.png` si necesitas transparencia.
