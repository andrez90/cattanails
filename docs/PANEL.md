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
