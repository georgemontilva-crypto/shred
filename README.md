# Shred Master

Web informativa de la marca: Home, Products, About us y Contact us.
Sin base de datos y sin panel admin: todo el contenido vive en archivos del repo.

**Stack:** React + Vite + TypeScript, servido por un servidor Express mínimo (`server/index.js`) que también envía el formulario de contacto por Resend.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # desarrollo en http://localhost:5173
npm run build      # typecheck + build de producción en /dist
npm start          # servir /dist en el puerto $PORT (3000 por defecto)
```

## Desplegar en Railway

1. New Project → Deploy from GitHub repo → `shred`.
2. Railway lee `railway.json`: build `npm run build`, start `npm start`, healthcheck `/api/health`.
3. Settings → Networking → Generate Domain.

No necesita base de datos.

### Variables de entorno (solo para el formulario de contacto)

| Variable | Para qué |
| --- | --- |
| `RESEND_API_KEY` | API key de Resend |
| `CONTACT_TO` | Correo que recibe los mensajes (varios separados por coma) |
| `CONTACT_FROM` | Remitente con dominio verificado en Resend, p. ej. `Shred Master <hello@shredmasterusa.com>` |

Sin estas variables el sitio funciona igual, pero el formulario muestra un aviso de que no está conectado.

## Dónde se edita cada cosa

| Qué | Archivo |
| --- | --- |
| Productos, textos, colores, specs | `src/data/products.ts` |
| Fotos de producto | `public/img/…` (reemplazar el archivo con el mismo nombre) |
| Videos verticales | `public/videos/` + una línea en `src/data/videos.ts` |
| Correo, teléfono, redes, edad mínima | `src/data/site.ts` |
| Textos de About us | `src/pages/About.tsx` |
| Textos de las 4 piezas en el hero del Home | `src/components/HeroStage.tsx` |
| Sección 3D "Take a closer look" (textos, colores, tamaños) | `src/components/CloserLook.tsx` |
| Modelo 3D del grinder (formas, materiales, cámara) | `src/three/grinder.ts` |
| Capas animadas del grinder del hero | `public/img/aluminum/pieces/` (se regeneran con `tools/cut-pieces`) |

### Agregar un video

1. Copiar el `.mp4` vertical (9:16) a `public/videos/`.
2. Agregar una línea en `src/data/videos.ts`.

La sección de videos del Home está oculta mientras la lista esté vacía.

### Cambiar una foto

Las imágenes actuales salieron del catálogo PDF. Para usar una foto mejor, exportarla como `.webp` con fondo transparente y guardarla sobre el archivo existente en `public/img/`. Si cambian las proporciones, actualizar el ancho y alto en `src/data/imageSizes.json`.
