# myFont

Genera plantillas PDF para crear tu propia tipografía manuscrita: imprímela, llénala a mano, fotografía cada página y convierte tu letra en una fuente instalable.

- **Presets de un clic** (Mínimo → Signos pro, hasta 318 caracteres) o **selector personalizado**: 14 grupos combinables (matemáticos, griegos, sub/superíndices, flechas, monedas, formas, música, cirílico, símbolos de teclado…) + campo libre para caracteres sueltos, con o sin **letra fantasma de referencia** calibrada (pisa la línea base exacta).
- **Bilingüe ES/EN** con i18n listo para más idiomas.
- 100% estático, sin backend, sin CDNs: el motor PDF (`pdf-lib`, MIT) va vendoreado en `vendor/`.

## Uso local

```bash
cd myFont
python -m http.server 8080
# abre http://localhost:8080
```

## Deploy (Cloudflare Pages)

Proyecto conectado al repo con auto-deploy en push a `main`. Build: ninguno (sitio estático). Directorio de salida: `/`.

## Estructura

| Archivo         | Qué es                                                        |
|-----------------|---------------------------------------------------------------|
| `index.html`    | Página única: hero, controles, preview, guía                  |
| `styles.css`    | Estilos propios con acentos Riso de 2 tintas                  |
| `app.js`        | i18n + generador PDF en cliente (geometría calibrada propia)  |
| `charsets-generated.js` | Charsets auto-generados: tiers + grupos del picker   |
| `scripts/`      | `build-tiers.py` (charsets+i18n) y `gen-embedded.py` (i18n)   |
| `i18n/es.json`  | Textos en español                                             |
| `i18n/en.json`  | Textos en inglés (misma estructura de claves)                 |
| `vendor/`       | `pdf-lib.min.js` vendoreado (MIT) — cero dependencias de red  |

## Geometría de la plantilla (hallazgo propio, verificado por medición)

- A4, 6×7 celdas, línea base sólida + punteadas de capitular/altura-x.
- Fantasma Helvetica 79pt anclada por `y = baseline − 0.718 × FS`: pies sobre la base, techo en la capitular (desvío máx. medido 1.62pt = overshoot óptico normal).
- Gris `#d9d9d9`: se borra solo al umbralizar, solo sobrevive la tinta.

## Licencia

MIT — ver `LICENSE`.
