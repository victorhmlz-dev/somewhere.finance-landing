# Collection cover images — sourcing

Estas imágenes son tuyas (aportadas por ti, no generadas por código ni
descargadas de ningún sitio) — confirma que tienes derecho de uso sobre cada
una antes de colocarla aquí. Por la regla de cumplimiento del proyecto
(CLAUDE.md): nunca deben ser artwork real de colecciones NFT existentes de
terceros — usa arte propio, encargado, o con licencia clara. Si no tienes
todavía una imagen para alguna colección, no pasa nada: mientras el archivo
no exista, `CollectionImage.jsx` simplemente no renderiza nada para esa
colección (la galaxia procedural se sigue viendo igual, sin huecos ni
errores en consola).

## Archivos que faltan

Colócalos exactamente con estos nombres, en `public/collections/`:

| Archivo | Colección (data/collections.js) |
|---|---|
| `col-dense.jpg` | Dense Cluster #014 |
| `col-small.jpg` | Fragment Set #392 |
| `col-large.jpg` | Vast Archive #007 |
| `col-luminous.jpg` | Bright Index #101 |
| `col-chaotic.jpg` | Entropy Field #558 |
| `col-geometric.jpg` | Grid Protocol #220 |

## Formato recomendado

- Cuadradas (1:1) — se muestran en un plano `Billboard` (siempre de cara a
  cámara), un aspect ratio distinto se recortará visualmente.
- 1024×1024 px es suficiente incluso con DPR 2 en desktop; no hace falta más.
- `.jpg` para fotografía/arte con muchos tonos, `.png` si necesitas
  transparencia — si usas `.png`, cambia la extensión en `data/collections.js`
  (`image: "/collections/col-dense.png"`, etc.) a la vez que coloques el
  archivo.
- Sin restricciones de paleta: al ser una imagen real (no arte procedural
  como el de `NftEmergence.jsx`), no tiene que ajustarse a los tokens de
  `styles/tokens.css` — es contenido, no UI de marca.
