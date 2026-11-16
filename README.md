# Catta Nails 29

Sitio web de Catta Nails 29 (Pilar, Alcantarilla, Murcia): reservas de uñas y formación de manicura.

- **Se publica:** carpeta `sitio/` (Netlify, sin comando de build; ver `netlify.toml`).
- **Código fuente:** `site_src/` (`python site_src/build.py` regenera el sitio). Con número real: `WA_NUMBER=34XXXXXXXXX python site_src/build.py`.
- **Guías:** `docs/` (lanzamiento, agenda, seguridad, pendientes).

## Antes de publicar de verdad
- Cambiar el WhatsApp de relleno (34600000000) por el de Pilar.
- Si el dominio no es `cattanails.netlify.app`: `cd docs && ./set-domain.sh https://tudominio.es` (cambia el dominio en canónicas, sitemap y robots).
- Ver `docs/PENDIENTES.md`.
