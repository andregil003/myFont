# DECISIONES — myFont

Bitácora de decisiones del proyecto (la mantiene PUCK junto con André).

## 2026-09-29 — v1 inicial

- **Repo nuevo `andregil003/myFont`, MIT.** Herramienta oficial standalone, código 100% propio, sin referencias a otros repos: es combinación y hallazgo nuestro.
- **Estático puro (HTML/CSS/JS vanilla, sin build).** Para que Cloudflare Pages lo sirva tal cual y el auto-deploy sea trivial.
- **`pdf-lib` vendoreado en `vendor/` (MIT 1.17.1).** Nada de CDNs: funciona offline y el deploy no depende de terceros.
- **Geometría propia calibrada:** fantasma 79pt, ancla `baseline − 0.718×FS`, gris `#d9d9d9`. QA por medición de píxeles: 94/94 celdas, peor desvío 1.62pt (overshoot óptico, por diseño).
- **Riso Eco en modo B:** desregistro (`::before` desplazado + multiply), grano SVG y halftone solo en hero/CTAs; cuerpo limpio y legible.
- **i18n desde v1:** `es.json`/`en.json` con paridad de claves, ES por defecto, toggle en header, persistencia en `localStorage`.
- **Alcance v1 = A:** solo generador de plantilla (charset + fantasma + preview + descargar/imprimir + guía). Foto→fuente queda fuera (pide backend).
- **Deploy:** Cloudflare Pages conectado a GitHub, auto-deploy en `main`, dominio `*.pages.dev` por ahora.

## 2026-09-29 — tiers latin1/exta/pro + DejaVu

- **Escalera de cobertura (estudio Google Fonts GF tiers + WGL4):** minimal 79 (2p) / spanish 94 (3p) / latin1 173 (5p) / exta 301 (8p) / pro 318 (8p), acumulativos.
- **DejaVu Sans 2.37 vendoreado** (`vendor/fonts/` + LICENSE): built-in Helvetica solo cubre WinAnsi; exta/pro necesitan cobertura real. Fantasma recalibrado a FS=75 (caps -0.7pt, arcos +2pt, pies exactos).
- **Carga perezosa:** `fontkit` (1.5MB) + `dejavu-b64.js` (1MB) solo se descargan al pulsar Generar; la pagina inicial sigue ligera. `file://` y offline funcionan (fallbacks embebidos).
- **QA por tier:** matriz 5 tiers x fantasma on/off (paginas + presencia), pixel estricto en spanish (0.90pt/2.92pt), generico en el resto (0 celdas vacias, solo flotantes/descendentes por diseno).
- **Skill espejo:** `make-ref.js` con `--charset` tiers + `--font` (nota de recalibracion incluida).
