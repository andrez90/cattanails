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
