# Lanzamiento de catta nails 29 (guía para Andrés)

Qué es esto: carpeta `sitio/` lista para subir (HTML, CSS, JS, imágenes WebP, sitemap, robots, cabeceras de seguridad) y esta carpeta `docs/` con las guías. Andrés hace el commit y el despliegue; yo no publiqué nada en ningún dominio.

## 1. Dominio y despliegue (30 min)
1. Elegir dominio (por ejemplo cattanails.es) y decidir si el canónico es con o sin www. **Dato que falta del dueño.**
2. En `docs/`: `./set-domain.sh https://tudominio.es`. Después `grep -r __DOMINIO__ ../sitio` no debe devolver nada.
3. Subir `sitio/` a Netlify (arrastrar la carpeta o desde GitHub). Publish directory: `sitio`, sin comando de build.
4. En Netlify: Domain management → agregar dominio, activar HTTPS, redirigir www ↔ sin www con 301.
5. Netlify → Forms: el formulario `curso` aparece solo tras el primer despliegue. Activar notificación por correo al correo de Pilar y el filtro de spam.

## 2. Google Search Console (15 min)
1. Agregar propiedad de dominio y verificar con registro DNS TXT. No borrarlo nunca.
2. Sitemaps → `sitemap.xml` → Enviar. Esperado: estado Correcto y 4 páginas.
3. Inspección de URLs → pedir indexación de: `/`, `/formacion`, `/unas-alcantarilla`. Anotar captura del aviso de confirmación.
4. Anotar cifras iniciales (0 clics, 0 impresiones) para comparar a 90 días.

## 3. Ficha de Google Business (salón en Alcantarilla)
Crear y verificar la ficha (categoría "Salón de manicura"), con los mismos nombre, dirección y teléfono que la web, enlace a la web y a Instagram, fotos reales y horario. Pedir 5 reseñas reales a clientas (nunca comprarlas) y responder todas. Cuando haya reseñas reales se pueden mostrar en la web.

## 4. Medición (opcional, con consentimiento)
La web ya trae el banner y los eventos listos pero **apagados**. Para activarlos: en las 6 páginas poner el ID de GA4 en `<meta name="ga-id" content="G-XXXXXXX">` y en `_headers` añadir a `script-src` y `connect-src` los dominios de Google (`https://www.googletagmanager.com`, `https://*.google-analytics.com`). Antes de aceptar cookies no sale ninguna petición; al aceptar llegan los eventos: `dm_click`, `curso_click`, `solicitar_click`, `form_start`, `form_submit`, `tally_click`. Marcar `form_submit` y `dm_click` como eventos clave. Usar UTM en los enlaces de redes: `?utm_source=instagram&utm_medium=social&utm_campaign=curso`.

## 5. Seguimiento (10 min por semana)
Search Console: consultas con muchas impresiones y pocos clics (reescribir título y descripción); páginas en posición 8 a 20 (ampliar y enlazar); errores de indexación. Una guía nueva al mes desde `keywords.csv`. Juzgar el SEO no antes de 90 días. No se promete ninguna posición.

## 6. Qué quedó hecho y qué no
Hecho: 6 páginas (inicio, formación, uñas en Alcantarilla, legal, gracias, 404), título y descripción únicos, un solo h1, canónicas, Open Graph 1200x630, JSON-LD (BeautySalon, Course, Service, BreadcrumbList), sitemap, robots, 404, imágenes WebP con ancho y alto, CSS y JS externos con caché, HTTPS por cabeceras, formulario con validación, honeypot y respaldo por Instagram.
No hecho (necesita al dueño o una cuenta): dominio, despliegue, Search Console, ficha de Google, reseñas, datos legales, guías (0 de 8 a 12), medición real. Ver `PENDIENTES.md`.
