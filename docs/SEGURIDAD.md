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
