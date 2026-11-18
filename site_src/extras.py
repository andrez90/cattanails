#!/usr/bin/env python3
"""Archivos de SEO, seguridad y documentos de entrega. Se ejecuta después de build.py."""
import os, shutil, zipfile, textwrap
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'out', 'dist')
PKG = os.path.join(ROOT, 'out', 'paquete')
shutil.rmtree(PKG, ignore_errors=True)
SITE = os.path.join(PKG, 'sitio'); DOCS = os.path.join(PKG, 'docs')
shutil.copytree(DIST, SITE); os.makedirs(os.path.join(DOCS, 'legal'))
W = lambda p, s: open(p, 'w', encoding='utf-8').write(textwrap.dedent(s).lstrip('\n'))

# ---------- SEO técnico ----------
DOMX = os.environ.get('SITE_DOMAIN', 'https://cattanails.netlify.app').rstrip('/')
W(os.path.join(SITE, 'sitemap.xml'), '''
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>__DOMINIO__/</loc><lastmod>2026-11-01</lastmod><priority>1.0</priority></url>
  <url><loc>__DOMINIO__/reservar</loc><lastmod>2026-11-01</lastmod><priority>0.9</priority></url>
  <url><loc>__DOMINIO__/formacion</loc><lastmod>2026-11-01</lastmod><priority>0.9</priority></url>
  <url><loc>__DOMINIO__/unas-alcantarilla</loc><lastmod>2026-11-01</lastmod><priority>0.8</priority></url>
  <url><loc>__DOMINIO__/aviso-legal-privacidad</loc><lastmod>2026-11-01</lastmod><priority>0.3</priority></url>
</urlset>
''')
W(os.path.join(SITE, 'robots.txt'), '''
User-agent: *
Allow: /
Disallow: /admin

Sitemap: __DOMINIO__/sitemap.xml
''')
for _f in ('sitemap.xml', 'robots.txt'):
    _p = os.path.join(SITE, _f); _t = open(_p, encoding='utf-8').read().replace('__DOMINIO__', DOMX); open(_p, 'w', encoding='utf-8').write(_t)
W(os.path.join(SITE, 'site.webmanifest'), '''
{"name":"Catta Nails 29","short_name":"Catta Nails","lang":"es-ES","start_url":"/","display":"standalone","background_color":"#fff8f6","theme_color":"#560d2b",
 "icons":[{"src":"/img/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"/img/icon-512.png","sizes":"512x512","type":"image/png"}]}
''')
# ---------- seguridad (Netlify) ----------
W(os.path.join(SITE, '_headers'), '''
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://sleckhpzbqbwlvqevtbc.supabase.co; connect-src 'self' https://sleckhpzbqbwlvqevtbc.supabase.co; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'

/admin
  Cache-Control: no-store
  X-Robots-Tag: noindex, nofollow

/admin.js
  Cache-Control: no-cache

/img/*
  Cache-Control: public, max-age=31536000, immutable

/styles.css
  Cache-Control: public, max-age=86400

/app.js
  Cache-Control: public, max-age=86400
''')
W(os.path.join(SITE, '_redirects'), '''
/panel      /admin  301
/curso      /formacion  301
/cursos     /formacion  301
/reserva    /reservar  301
/cita       /reservar  301
/unas       /unas-alcantarilla  301
/servicios  /unas-alcantarilla  301
''')
W(os.path.join(DOCS, 'set-domain.sh'), '''
#!/usr/bin/env bash
# Uso: ./set-domain.sh https://www.tudominio.es   (desde la carpeta docs/, con ../sitio al lado)
# Sustituye __DOMINIO__ en canónicas, Open Graph, JSON-LD, sitemap y robots.
set -euo pipefail
[ $# -eq 1 ] || { echo "Uso: $0 https://tudominio.es"; exit 1; }
D="${1%/}"
grep -rl "__DOMINIO__" ../sitio | while read -r f; do sed -i.bak "s|__DOMINIO__|$D|g" "$f" && rm -f "$f.bak"; done
echo "Listo. Revisa: grep -r __DOMINIO__ ../sitio  (no debe devolver nada)"
''')
os.chmod(os.path.join(DOCS, 'set-domain.sh'), 0o755)

# ---------- palabras clave ----------
W(os.path.join(DOCS, 'keywords.csv'), '''
keyword,intencion,volumen_estimado,dificultad_estimada,url_destino,prioridad
curso de uñas desde cero murcia,compra,bajo-medio (estimado),media (estimada),/formacion,alta
curso de uñas alcantarilla,compra,bajo (estimado),baja (estimada),/formacion,alta
curso de manicura murcia,compra,medio (estimado),media (estimada),/formacion,alta
formación manicura presencial murcia,compra,bajo (estimado),baja (estimada),/formacion,media
curso de uñas para empezar sin experiencia,compra,medio (estimado),media (estimada),/formacion,media
uñas alcantarilla,compra,bajo (estimado),baja (estimada),/unas-alcantarilla,alta
manicura alcantarilla,compra,bajo (estimado),baja (estimada),/unas-alcantarilla,alta
nail art alcantarilla,compra,bajo (estimado),baja (estimada),/unas-alcantarilla,media
uñas french con flores,informativa,medio (estimado),media (estimada),guía futura /guias/unas-french-con-flores,larga
cómo aprender a hacer uñas desde cero,informativa,alto (estimado),alta (estimada),guía futura /guias/aprender-unas-desde-cero,larga
se puede vivir de hacer uñas,informativa,medio (estimado),media (estimada),guía futura /guias/vivir-de-las-unas,larga
salón de uñas murcia,compra,alto (estimado),alta (estimada),/unas-alcantarilla,baja (largo plazo)
''')

# ---------- documentos ----------
W(os.path.join(DOCS, 'LANZAMIENTO.md'), '''
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
''')
W(os.path.join(DOCS, 'SEGURIDAD.md'), '''
# Seguridad y protección contra ataques (catta nails 29)

Ninguna web pequeña frena un ataque grande por sí sola. La protección real va **antes** del servidor; el código solo evita que un abuso pequeño cueste dinero o llene el correo de spam. No se promete "inmune".

## Qué ya trae el sitio
- Sitio 100 % estático: no hay base de datos, ni login, ni API propia, ni claves en el código. Lo único que recibe datos es el formulario.
- Cabeceras en `_headers`: HSTS, CSP (solo recursos propios y Google Fonts), X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP.
- Formulario: validación con límites (el motivo tiene máximo 600 caracteres), campo trampa (honeypot) `bot-field`, tiempo mínimo de llenado de 3,5 s y envío solo a `/` del propio sitio (`connect-src 'self'`, `form-action 'self'`).
- Si el envío falla, el formulario no pierde lo escrito: ofrece copiar el mensaje y mandarlo por Instagram.
- Nota honesta sobre la CSP: `style-src` permite `'unsafe-inline'` porque el sitio usa atributos `style` en algunos elementos. Es un riesgo bajo en un sitio sin contenido de usuarios; se puede endurecer después.

## Capa de red ($0), pasos para Andrés
1. **Cloudflare gratis** delante del dominio: cambiar los nameservers en el registrador, proxy activo (nube naranja), SSL/TLS en **Completo (estricto)**, HSTS ya viene de `_headers`.
2. Activar **Bot Fight Mode** y nivel de seguridad medio. **Under Attack Mode** solo como interruptor de emergencia.
3. Regla de límite de peticiones: `POST /` máximo 5 por minuto por IP (el formulario es lo único que se envía). Primero en modo solo registrar unos días.
4. Regla opcional: desafío a países desde donde no haya clientas, sin bloquear Googlebot.
5. Netlify → Forms: activar el filtro de spam (Akismet). Opcional: reCAPTCHA 2 de Netlify o Cloudflare Turnstile (requiere una función de verificación; se puede añadir si el spam aparece).
6. Alertas: aviso de uso y ancho de banda en Netlify; **UptimeRobot** gratis cada 5 minutos al correo; anotar el costo máximo que se acepta perder.

## Plan de respuesta
1. Confirmar si es ataque o un pico bueno (una publicación viral): ver las analíticas de Cloudflare (IP, países, rutas).
2. Activar Under Attack Mode y subir el nivel de seguridad.
3. Bloquear o desafiar el patrón (ruta, país, agente de usuario) y endurecer el límite del formulario.
4. Si el formulario se llena de spam: pausar notificaciones en Netlify o subir el filtro.
5. Avisar al soporte de Netlify y de Cloudflare si no cede; guardar fechas, IP y rutas.
6. Después: quitar el modo de emergencia, dejar la regla permanente y anotar la lección.

## Respaldo
El sitio completo vive en un repositorio de Git (ramas protegidas). Exportar cada mes las solicitudes del formulario de Netlify. Anotar los pasos para reapuntar el DNS en menos de una hora.

## Reglas
Solo defensa del sitio propio. Nunca pruebas de carga contra sitios de terceros ni contra el propio sin avisar al hosting.
''')
W(os.path.join(DOCS, 'PENDIENTES.md'), '''
# Pendientes que dependen de Pilar o de Andrés (nada de esto está inventado en la web)

## Datos del negocio
- [ ] Dirección exacta, horario y teléfono (hoy solo dice "Alcantarilla, Murcia").
- [x] Número de WhatsApp: +34 602 44 71 02 (en todos los botones; se puede cambiar desde el panel, «Mi web» → Horario).
- [x] Horario de Pilar: 9:00-14:00 y 16:00-20:00 (lunes a viernes) y duraciones reales: pies 1 h, manos semipermanente o con refuerzo 1 h 30, extensiones 2 h 30.
- [ ] **¿Abre los sábados?** Hoy el sábado tiene 10:00-14:00 provisional. Confirmar o quitarlo en el panel («Mi web» → Horario).
- [ ] Precios reales de cada servicio (panel → «Mi web» → Servicios y Textos) y si quiere cambiar la cancelación hasta 4 h antes.
- [ ] **Dirección de la web** en el panel («Mi web» → Textos → Dirección de tu web), para que los enlaces de los mensajes de WhatsApp funcionen.
- [ ] Correo de Pilar para invitarla al panel («Mi web» → Quién puede entrar).
- [ ] En Supabase (proyecto `catta-nails`) → Authentication → URL Configuration: poner la dirección de la web como Site URL y añadir `https://TU-DOMINIO/admin` en Redirect URLs (para los correos de confirmar acceso y recuperar contraseña).
- [ ] Servicios reales del salón y **precios** (hoy: Manicura, Uñas con diseño y Mantenimiento, todos "Precio al consultar"; las categorías salen de lo que se ve en las fotos).
- [ ] Del curso "Inicio en el mundo de las uñas": temario, duración, fechas, precio, plazas por grupo y qué incluye. Hoy la web dice que Pilar lo confirma al contactar.
- [ ] Si hay **otros cursos**: el formulario tiene la opción "otros cursos o formación personalizada"; añadir cada curso como opción y como página.
- [ ] Texto final de la historia de Pilar: la web usa solo lo que dice su biografía de Instagram (la frase final aparece cortada).

## Pruebas y confianza (nunca inventar)
- [ ] Casos de clientas con permiso (antes y después).
- [ ] 5 reseñas reales en Google y permiso para mostrarlas.
- [ ] Testimonios de alumnas con permiso.

## Imágenes
- [ ] Fotos originales en alta resolución (las actuales salen de capturas de Instagram, mejoradas con escalado por IA).
- [ ] Logo en vector y colores corporativos oficiales (hoy: cereza, rosa y marfil, inspirados en los rojos de las fotos).

## Legal (España)
- [ ] Completar `aviso-legal-privacidad`: titular, NIF/CIF, domicilio, correo de privacidad, proveedor de alojamiento, plazo de conservación y transferencias internacionales.
- [ ] Revisión por un abogado. Ver `legal/compliance.md`.

## Técnico
- [ ] Dominio, despliegue, Cloudflare, Search Console, ficha de Google Business (ver `LANZAMIENTO.md` y `SEGURIDAD.md`).
- [ ] Correo que recibe las solicitudes del formulario (Netlify → Forms → Notifications).
- [ ] Guías para SEO (de 8 a 12) cuando Pilar confirme los temas.
''')
W(os.path.join(DOCS, 'legal', 'compliance.md'), '''
# Matriz de cumplimiento legal, España (borrador, requiere abogado)

La skill de legal de Baltium está escrita para Colombia (Ley 1581, SIC). Este negocio opera en España, así que se adaptó a la normativa europea y española. **No es una certificación de cumplimiento.** Todo lo marcado "requiere abogado" debe revisarlo un profesional.

| Norma | Requisito | Dónde se cumple en el sitio | Estado | Abogado |
|---|---|---|---|---|
| RGPD (UE 2016/679) art. 13 | Informar de responsable, finalidad, base legal, destinatarios, conservación y derechos | `aviso-legal-privacidad#privacidad` | Parcial: faltan datos del titular, hosting, plazo y transferencias | Sí |
| RGPD art. 6.1.a y 7 | Consentimiento libre, informado y demostrable | Casilla de consentimiento **sin marcar** y separada de la casilla de novedades; el envío guarda texto exacto de la casilla, versión de la política (`v1-2026-11`), página y fecha | Hecho (registro en las solicitudes de Netlify Forms) | Sí |
| RGPD art. 15-22 | Derechos de acceso, rectificación, supresión, oposición, limitación, portabilidad | Texto en el aviso de privacidad + correo del titular | Parcial: falta correo real | Sí |
| LOPDGDD (LO 3/2018) | Información por capas, derechos digitales | Aviso de privacidad | Parcial | Sí |
| LSSI-CE (Ley 34/2002) art. 10 | Datos del titular del sitio | `aviso-legal-privacidad#aviso-legal` | Pendiente: nombre, NIF, domicilio, correo | Sí |
| LSSI-CE art. 22.2 (cookies) | Consentimiento previo para cookies no necesarias | Hoy solo hay almacenamiento técnico (tema). Banner con Aceptar, Rechazar y Solo necesarias, listo pero apagado; la analítica no carga sin aceptar | Hecho | Sí |
| LSSI-CE art. 21 | No enviar comunicaciones comerciales sin consentimiento | Casilla opcional de novedades, sin marcar | Hecho | Sí |
| Ley de consumidores (RDL 1/2007) | Información de precios y condiciones si se vende en línea | No aplica hoy: la web no cobra ni vende en línea. Aplicará si se añaden pagos o reservas de pago | No aplica | Sí, si se añaden pagos |

Registro de consentimientos: el sitio estático no tiene base de datos propia. Netlify Forms guarda cada envío con fecha y los campos de consentimiento; exportarlo cada mes. Si más adelante se usa una base de datos, crear una tabla de solo inserción con versión del documento, hash del texto, fecha, IP y página (ver la skill de visibilidad y legal).
''')
W(os.path.join(DOCS, 'DESIGN.md'), '''
# Dirección de arte de catta nails 29

Concepto: salón artesanal cálido con una pestaña aparte para la formación. Dos pestañas fijas en la cabecera (Salón / Formación) porque son dos públicos distintos: clientas que quieren sus uñas y mujeres que quieren aprender.

Paleta (inspirada en los rojos de las fotos): cereza #b3123f, rosa #ff9db8, marfil #fff8f6, rosa intenso #d63c72; hero y secciones oscuras de #16060d a #560d2b. Paleta anterior: vino #5b2236, rosa empolvado #e8b9a6, crema #faf3ee, cobre #a8664f; sección oscura vino #2c0f1b a #5a2a3a. Modo claro y oscuro.
Tipografía: Cormorant Garamond (titulares, cursiva para el énfasis), Marcellus (marca), DM Sans (texto y formularios).
Movimiento con función: escena fija de trabajos que avanza con el scroll (tarjetas 3D y la última se abre con la oferta), brillo lento en la marca, barra de progreso, aparición suave solo de lo que está bajo el pliegue. Solo transform y opacity; respeta "reducir movimiento" (la escena pasa a una tira simple). El título, el texto y los botones no esperan a ninguna animación.
Conversión: un botón principal por pantalla; barra fija inferior en móvil (Reservar / Ver curso, o Solicitar plaza / Instagram); formulario corto en 2 pasos con etiquetas visibles, errores junto al campo y respaldo por Instagram si el envío falla.
No se inventó: reseñas, cifras, precios, temario ni fechas.
''')
W(os.path.join(DOCS, 'README.md'), '''
# Paquete Catta Nails 29

- `sitio/`  carpeta para publicar (Netlify u otro hosting estático).
- `docs/LANZAMIENTO.md`  pasos de despliegue, Search Console, Google Business y seguimiento.
- `docs/SEGURIDAD.md`  Cloudflare, límites, plan de respuesta.
- `docs/PANEL.md`  cómo entrar y usar el panel de administración.\n- `docs/WHATSAPP-BUSINESS.md`  textos para el WhatsApp Business de Pilar (modo provisional).\n- `docs/WHATSAPP.md`  mensajes automáticos con la API y lo que se encontró en el Drive.\n- `docs/AGENDA.md`  reservas del salón.\n- `docs/PENDIENTES.md`  lo que falta que entreguen Pilar o Andrés.
- `docs/keywords.csv`  palabras clave con estimaciones marcadas.
- `docs/legal/compliance.md`  matriz legal adaptada a España (requiere abogado).
- `docs/set-domain.sh`  pone el dominio real en canónicas, sitemap y robots.
''')

W(os.path.join(DOCS, 'AGENDA.md'), '''
# Reservas del salón: agenda propia de Catta Nails (horas reales, cancelar y liberar)

## Cómo funciona
- `/reservar` usa la base de datos propia **catta-nails** (Supabase `sleckhpzbqbwlvqevtbc`, Europe/Madrid, EUR). La clienta elige servicio, día y una **hora libre real**; al reservar, la hora se bloquea al instante (la base de datos impide dobles reservas aunque dos personas pulsen a la vez).
- Recibe un código `CN-XXXX` y un enlace privado a `/mi-cita` para **cancelar**: la hora vuelve a estar libre al momento (hasta 4 h antes, configurable en el panel).
- Cada reserva aparece en el panel (`/admin`) y prepara su confirmación y su recordatorio de WhatsApp. Pilar recibe además un aviso por correo (Netlify Forms).
- Si la agenda no responde, el formulario pide solo mañana o tarde y Pilar confirma, sin perder a la clienta.
- El proyecto anterior (`jqfjoclxtsonsqurfpqq`, Zarume y Baltium Agenda) no se modificó; la web ya no lo usa. Las funciones `catta_*` que se crearon ahí antes siguen existiendo; se pueden borrar cuando Andrés lo decida.

## ⚠ Datos provisionales que Pilar debe confirmar ANTES de publicar
Horario cargado de ejemplo: lunes a viernes 10:00-14:00 y 16:00-20:00, sábado 10:00-14:00, intervalos de 30 min, aviso mínimo 2 h, hasta 60 días, cancelación hasta 4 h antes. Duraciones de ejemplo. Se cambian en el panel: «Mi web» → Servicios y Horario. Mientras no los confirme, no publiques la web: los clientes verían horas que Pilar quizá no atiende.
Para vacaciones o ausencias: panel → Agenda → «Bloquear días u horas».

## Siguiente nivel (cuando haya WhatsApp)
Modo `link` de Baltium Agenda: el cliente escribe por WhatsApp y el bot responde con el enlace de reserva; recordatorios por email/push gratis; lista de espera y recuperación de cupos al cancelar; precios por servicio.
''')

W(os.path.join(DOCS, 'PANEL.md'), '''
# Panel de administración de Catta Nails 29

Dirección: `https://TU-DOMINIO/admin` (también `/panel`). No aparece en Google (noindex y bloqueado en robots).

## Dónde viven los datos
Proyecto Supabase propio **catta-nails** (`sleckhpzbqbwlvqevtbc`, región París). Es independiente: el proyecto de Zarume y Baltium Agenda no se tocó.
Las reservas de la web, las interesadas del curso, las clientas, las finanzas, los textos editables y la cola de WhatsApp están ahí.
Las tablas no se pueden leer con la clave pública: todo pasa por funciones que comprueban si quien llama es administradora.
El SQL completo está en `docs/supabase/01_catta_base.sql` y la función de envío en `docs/supabase/functions/wa-send/index.ts`.

## Primer acceso
1. Abre `/admin` → «Primera vez: crear acceso» con **andrezbalanta@gmail.com** y una contraseña.
2. Confirma el correo que te envía Supabase y vuelve a `/admin` → «Entrar». Ese primer correo queda como administrador.
3. En «Mi web» → «Quién puede entrar», invita el correo de Pilar. Ella entra con «Primera vez: crear acceso» usando ese correo.
Antes, en Supabase → Authentication → URL Configuration: Site URL = tu dominio y Redirect URLs = `https://TU-DOMINIO/admin`.

## Qué hace cada sección
- **Inicio**: ingresos, gastos y lo que queda del mes; citas de hoy con botones «Hecha y cobrar», «No vino», «Cancelar» y WhatsApp.
- **Agenda**: semana completa, nueva cita a mano (con confirmación y recordatorio por WhatsApp), bloquear vacaciones u horas (desaparecen de la web).
- **Clientas**: historial, visitas, cuánto ha gastado, veces que no vino, notas privadas.
- **Formación**: personas que piden plaza en el curso o se apuntan a la lista; nivel de interés calculado por sus respuestas, estado (nueva, contactada, interesada, inscrita, descartada), notas, WhatsApp con un toque, registrar el pago y descargar en Excel (CSV).
- **Finanzas**: ingresos y gastos por periodo, por categoría y forma de pago (efectivo, tarjeta, Bizum, transferencia), descarga en Excel.
- **WhatsApp**: mensajes preparados solos (confirmación, recordatorio 24 h antes, gracias, vuelve a reservar a los 21 días, respuesta al curso y a la lista), textos editables y envío automático.
- **Mi web**: textos (aviso arriba, frase del inicio, precios, próximo grupo del curso, horario, dirección), subir fotos de trabajos a la galería con su botón «Quiero este», ocultar fotos, servicios y duraciones, horario de reservas, aviso mínimo, cancelación, número de WhatsApp y accesos.

## Importante sobre Google
Los textos que cambias en el panel se ven al instante para las visitas, pero Google lee el texto original del HTML. Si cambias algo importante para el posicionamiento (por ejemplo, los precios), pídelo también en el código en la próxima actualización.
''')

W(os.path.join(DOCS, 'WHATSAPP.md'), '''
# WhatsApp: qué funciona hoy y cómo dejarlo 100 % automático

## Hoy (gratis, sin configurar nada)
- Botones de WhatsApp de la web con el número **+34 602 44 71 02**.
- Cada reserva, solicitud del curso o cita marcada como hecha **prepara sola** su mensaje en el panel (sección WhatsApp). Pilar toca «Enviar», se abre su WhatsApp con el texto escrito y solo le da a enviar.
- Si una clienta cancela desde su enlace, sus recordatorios se anulan solos.

## Automático de verdad (sin tocar nada)
WhatsApp solo permite mensajes automáticos que empiecen las empresas mediante su **API oficial (WhatsApp Cloud API de Meta)** y con **plantillas aprobadas**. Esas plantillas tienen coste por mensaje según el país y la categoría: revisar la tarifa oficial de Meta para España antes de activarlo.
Ya está todo preparado en el proyecto `catta-nails`:
- Función `wa-send` desplegada y programada cada 5 minutos. Hoy no envía nada porque está desactivada.
Pasos para activarlo:
1. Crear una app en developers.facebook.com con el producto WhatsApp y registrar el número de Pilar (ideal en modo coexistencia, para seguir usando la app WhatsApp Business en el móvil).
2. Crear y aprobar plantillas de utilidad en el WhatsApp Manager (por ejemplo `confirmacion_cita` con variables {{1}} nombre, {{2}} servicio, {{3}} fecha, {{4}} hora).
3. En Supabase → Edge Functions → Secrets: `WA_TOKEN` (token permanente de usuario del sistema) y `WA_PHONE_ID` (ID del número). Nunca pegar el token en el chat ni en el código.
4. En el panel → WhatsApp → «Envío automático»: escribir el nombre de cada plantilla y sus variables en orden (`nombre, servicio, fecha, hora`) y activar.
Los mensajes sin plantilla siguen apareciendo en el panel para enviarlos con un toque.

## Lo que encontré en tu Drive y qué conviene
| Archivo | Qué es | ¿Usarlo para Catta? |
|---|---|---|
| Plantillas n8n «Building Your First WhatsApp Chatbot» y «Respond to WhatsApp Messages with AI Like a Pro!» | Flujos de n8n con el disparador y el nodo **oficiales** de WhatsApp (Cloud API) y un agente de IA | Sí, como siguiente paso: un asistente que responda preguntas (precios, horario, curso) y mande el enlace de reserva. Usa la misma cuenta de Meta del paso anterior |
| Carpeta «Automatización de ventas con ManyChat para Facebook y WhatsApp» | Curso de ManyChat (enlace a MEGA) | Opción de pago sin programar para respuestas automáticas en Instagram y WhatsApp |
| «Curso de copywriting para WhatsApp Business» (plantillas de módulos 1 a 10) | Organizar contactos con etiquetas y escribir mensajes que venden | Sí, para los textos de los mensajes y las etiquetas de WhatsApp Business |
| «Cómo automatizar la gestión de mensajes en WhatsApp con MessageBird» | Proveedor intermediario | No hace falta: el panel conecta directo con Meta, sin comisión de intermediario |
| whaticket.zip, «CRM de Redes Sociales» (ElizaBot y otros con «WhatsApp QR») y «AutoResponder for WhatsApp Mod.apk» | Conexiones **no oficiales** por código QR y una app modificada | **No usar**: incumplen los términos de WhatsApp y Meta puede bloquear el número de Pilar. La app modificada además es un riesgo de seguridad |
''')

W(os.path.join(DOCS, 'WHATSAPP-BUSINESS.md'), '''
# WhatsApp Business de Pilar: textos listos para pegar (modo provisional, sin API)

Dónde se configura (app WhatsApp Business en el móvil): **Ajustes → Herramientas para la empresa**.
Lo que va entre [corchetes] lo completa Pilar con sus datos reales.

## 1. Perfil de empresa (Herramientas → Perfil de empresa)
- **Categoría:** Salón de belleza (o Manicura / Servicio de uñas).
- **Descripción:**
  Salón de uñas a mano alzada en Alcantarilla (Murcia) 💅 Diseños de flores, mariposas y french. También formación para aprender desde cero. Reserva tu hora online: https://cattanails.netlify.app/reservar
- **Sitio web:** https://cattanails.netlify.app
- **Horario:** lunes a viernes de 9:00 a 14:00 y de 16:00 a 20:00 ([confirmar si abre sábados]).

## 2. Mensaje de bienvenida (Herramientas → Mensaje de bienvenida → Enviar a: todos)
¡Hola! 💅 Soy Pilar, de Catta Nails 29.

📅 Para reservar tu cita, elige servicio y hora libre aquí (tardas 1 minuto y la hora queda guardada al momento):
https://cattanails.netlify.app/reservar

🎓 ¿Te interesa el curso de uñas? Aquí tienes la información y puedes pedir tu plaza:
https://cattanails.netlify.app/formacion

⏱️ Para que sepas cuánto dura: pies 1 h · manos semipermanente o con refuerzo 1 h 30 · extensiones desde 2 h 30.

Si tienes otra duda, escríbemela y te respondo en cuanto termine con la clienta que estoy atendiendo.

## 3. Mensaje de ausencia (Herramientas → Mensaje de ausencia → Fuera del horario comercial)
Hola 😊 Ahora mismo el salón está cerrado, pero puedes reservar tu hora tú misma a cualquier hora aquí:
https://cattanails.netlify.app/reservar
Mañana te respondo lo demás. ¡Gracias por escribir a Catta Nails 29!

## 4. Respuestas rápidas (Herramientas → Respuestas rápidas → +). Se usan escribiendo «/» y el atajo
- **/reservar**
  Reserva aquí tu cita, verás solo las horas libres 👉 https://cattanails.netlify.app/reservar
  Al terminar te da un código y un enlace para cambiarla o cancelarla.
- **/curso**
  ¡Qué bien que te interese! 🎓 Aquí tienes todo sobre el curso y puedes pedir tu plaza: https://cattanails.netlify.app/formacion
  Cuéntame: ¿has hecho uñas antes o empiezas desde cero?
- **/apuntada**  (cuando Pilar apunta una cita a mano en el panel)
  ¡Listo! Te apunté para [servicio] el [día] a las [hora] ✅ Si te surge algo, avísame con tiempo para liberar la hora a otra clienta.
- **/recordatorio**  (un día antes, como hace Pilar siempre; también sale escrito en el panel → Inicio → «Mañana: confirma asistencia»)
  Hola 😊 Te recuerdo tu cita de mañana a las [hora] en Catta Nails 29. ¿Me confirmas que vienes? Respóndeme SÍ. Recuerda llegar a tu hora. Si no puedes venir, avísame para liberar la hora.
- **/proxima**  (antes de que la clienta se vaya)
  ¡Te dejo apuntada tu próxima cita para el [día] a las [hora]! ✅ Un día antes te escribo para confirmar.
- **/puntual**
  Te cuento cómo trabajo para que todo vaya bien: voy con horarios justos para no hacer esperar a nadie. Si llegas tarde, puede que no pueda atenderte y tengamos que cambiar la cita. ¡Gracias por entenderlo! 💖
- **/cancelar**
  Sin problema. Puedes cancelar o cambiar tu cita desde el enlace que te llegó al reservar (botón «Cambiar o cancelar mi cita»). Si no lo encuentras, dime tu nombre y el día y lo hago yo.
- **/precio**
  El precio depende del diseño: [escribir aquí los precios reales de Pilar]. Si me mandas una foto de la idea, te digo el precio exacto.
- **/donde**
  Estoy en Alcantarilla (Murcia): [dirección exacta]. Te la mando también al confirmar tu cita.
- **/gracias**
  ¡Gracias por venir! 💖 Si te gustaron tus uñas, me ayudas muchísimo dejando tu opinión en Google [enlace a la ficha] o etiquetándome en Instagram @catta_nails29.
- **/lista**
  ¡Apuntada! Te aviso en cuanto abra el próximo grupo del curso. Mientras, puedes ver mis trabajos en Instagram @catta_nails29.

## 5. Etiquetas (Herramientas → Etiquetas)
Nueva clienta · Cita reservada · Toca mantenimiento · Interesada en curso · Inscrita en curso · Pendiente de pago

## 6. Cómo le llegan ahora los avisos a Pilar
- **Reservas de la web:** al terminar, la clienta ve «Último paso: envía tu reserva a Pilar». Se abre su WhatsApp con el resumen (nombre, servicio, día, hora, código) y solo le da a enviar. Aunque no lo envíe, la cita ya está en el panel y la hora bloqueada.
- **Curso:** al enviar el formulario, la persona ve «Enviar mis datos a Pilar» con sus respuestas ya escritas.
- **Lista de próximas fechas:** botón «Avisar a Pilar por WhatsApp» al apuntarse.
- **Resumen del día:** en el panel, Inicio → «Resumen de hoy a mi WhatsApp» (o «de mañana»). Abre el chat contigo misma («Mensaje para mí») con todas las citas escritas. Funciona en el móvil donde Pilar tiene su WhatsApp con el número del panel.
- Cuando quieran que todo salga solo (bot que reserva en el chat y avisos sin tocar nada), ver `WHATSAPP.md` (API oficial).
''')

import shutil as _sh
_sh.copytree(os.path.join(ROOT, 'admin'), os.path.join(DOCS, 'supabase'))

# ---------- zip ----------
zp = os.path.join(ROOT, 'out', 'catta-nails-paquete.zip')
if os.path.exists(zp): os.remove(zp)
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
    for base, _, fs in os.walk(PKG):
        for f in fs:
            p = os.path.join(base, f); z.write(p, os.path.relpath(p, PKG))
print('zip', os.path.getsize(zp) // 1024, 'KB')
