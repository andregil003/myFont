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
