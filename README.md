# Catta Nails 29

Sitio web de Catta Nails 29 (Pilar, Alcantarilla, Murcia): reservas de uñas y formación de manicura.

- **Se publica:** carpeta `sitio/` (Netlify, sin comando de build; ver `netlify.toml`).
- **Código fuente:** `site_src/` (`python site_src/build.py` y luego `python site_src/extras.py` regeneran el sitio).
- **Base de datos:** Supabase propio `catta-nails` (`sleckhpzbqbwlvqevtbc`). SQL en `supabase/sql`, función de WhatsApp en `supabase/functions`.
- **Panel:** `/admin` (ver `docs/PANEL.md`).
- **Guías:** `docs/` (lanzamiento, agenda, seguridad, pendientes).

## Antes de publicar de verdad
- Si el dominio no es `cattanails.netlify.app`: `SITE_DOMAIN=https://tudominio.es python site_src/build.py` y `python site_src/extras.py`.
- Ver `docs/PENDIENTES.md`.
