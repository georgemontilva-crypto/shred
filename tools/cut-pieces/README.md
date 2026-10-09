# Cortar el grinder en piezas

El hero del Home anima el grinder de aluminio mediano pieza por pieza. Para eso cada color
está cortado en 4 capas (`public/img/aluminum/pieces/<color>-lid|teeth|screen|catcher.webp`)
y sus posiciones están en `src/data/pieces.json`.

Solo hay que volver a correr esto si se cambian las fotos `public/img/aluminum/medium-*.webp`.

```bash
pip install opencv-python-headless scikit-image pillow numpy
python tools/cut-pieces/layers.py public/img/aluminum public/img/aluminum/pieces src/data/pieces.json
```

El script espera el grinder en la misma pose que el catálogo (4 piezas separadas en diagonal).
