# Catta Nails 29 · reglas del proyecto

Cliente de Baltium Tech: salón de uñas de Pilar y formación de manicura en Alcantarilla (Murcia, España). Instagram: @catta_nails29.

## Reglas
- Español sencillo, orientado a que la clienta reserve y a que la interesada en el curso deje sus datos.
- No inventar datos: precios, dirección, horarios, reseñas, alumnas ni cifras. Si falta algo, se pide a Pilar.
- WhatsApp de Pilar: +34 602 44 71 02 (también se cambia desde el panel).
- Base de datos: Supabase propio `catta-nails` (sleckhpzbqbwlvqevtbc). NO tocar el proyecto jqfjoclxtsonsqurfpqq (Zarume / Baltium Agenda): Andrés pidió no modificar sus bases existentes.
- Panel de administración: `/admin` (código en `site_src/admin.js` y `admin.css`; SQL en `supabase/sql`). Ver `docs/PANEL.md`.
- Andrés hace el commit y el despliegue.
- Paleta actual: cereza #b3123f, rosa #ff9db8 y marfil #fff8f6; hero oscuro cereza. Ver `docs/DESIGN.md`.
- No tocar las animaciones existentes sin que Andrés lo pida. Solo `transform` y `opacity`, y respetar `prefers-reduced-motion`.
- El título, el texto principal y los botones de reservar nunca esperan a una animación.
- Antes de usar skills, leer `../Claude outputs/INSTRUCCIONES-FUTUROS-PROYECTOS.md` y `../Claude outputs/skills/`.

## Cómo se construye
1. Editar `site_src/build.py` (contenido), `site_src/styles.css` y `site_src/app.js`.
2. `python site_src/build.py` genera `out/dist` (para publicar) y `out/art` (vista previa con agenda de demostración).
3. `python site_src/extras.py` genera `out/paquete` (sitio + docs) y el zip.
4. Con número real: `WA_NUMBER=34XXXXXXXXX python site_src/build.py`.

## Dónde se cambia cada cosa (en `site_src/build.py`)
- Fotos de la galería del salón: lista `GALLERY` (imagen en `site/img`, nombre, texto alternativo, estilos).
- Muro de alumnas: lista `ALUMNAS` (vacía = no se muestra). Solo fotos y nombres reales con permiso.
- Servicios de la reserva: lista `SERV` y la agenda en Supabase (ver `docs/AGENDA.md`).

## Carpetas
- `sitio/`: lo que se publica (Netlify). `vista-previa/`: abrir `index.html` para ver el sitio sin publicar.
- `docs/`: lanzamiento, seguridad, agenda, pendientes, diseño, legal y palabras clave.
