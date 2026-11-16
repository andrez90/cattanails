# Reservas del salón: Baltium Agenda conectada (horas reales, cancelar y liberar)

## Cómo funciona
- `/reservar` usa la agenda de Baltium Agenda que ya vive en tu Supabase (organización **Catta Nails 29**, slug `catta-nails-29`, zona Europe/Madrid, EUR). El cliente elige servicio, día y una **hora libre real**; al reservar, la hora se bloquea al instante (la base de datos impide dobles reservas aunque dos personas pulsen a la vez).
- El cliente recibe un código `CN-XXXX` y un enlace privado a `/mi-cita` (el token va en la parte `#` de la URL, no se envía a ningún servidor de analítica). Desde ahí **cancela**: la cita pasa a `cancelada` y la hora **vuelve a estar libre** al momento. Se puede cancelar hasta `cancel_limit_hours` (hoy 4 h) antes; después se le invita a escribir a Pilar. Para cambiar la hora: cancela y reserva otra.
- Pilar recibe además un aviso por correo (Netlify Forms, formulario `reserva`). Las citas también aparecen en el panel de Baltium Agenda (tu usuario es owner de la organización).
- Si la agenda no responde (sin internet, mantenimiento), el formulario cae a modo «franja» (mañana/tarde) y Pilar confirma, sin perder el cliente.

## Qué se creó en Supabase (proyecto jqfjoclxtsonsqurfpqq)
- Organización, profesional **Pilar** y 4 servicios (Manicura 60 min, Uñas con diseño 90, Mantenimiento 60, Consulta y consejo 30).
- 5 funciones públicas, solo para Catta: `catta_services`, `catta_slots(servicio, día)`, `catta_book(datos)`, `catta_get(código, token)`, `catta_cancel(código, token)`. Validan nombre, teléfono, consentimiento, hora libre y límites (máx. 3 intentos por hora y 2 citas activas por teléfono). El token se guarda con hash SHA-256. No hay acceso directo a las tablas desde el navegador (RLS).
- Probado con pruebas revertidas: reservar, bloquear la hora, segunda reserva rechazada, cancelar con token malo (rechazado), cancelar bien y liberar la hora, segunda cancelación rechazada.

## ⚠ Datos provisionales que Pilar debe confirmar ANTES de publicar
Horario cargado de ejemplo: lunes a viernes 10:00-14:00 y 16:00-20:00, sábado 10:00-14:00, intervalos de 30 min, aviso mínimo 2 h, hasta 60 días, cancelación hasta 4 h antes. Duraciones de ejemplo. Se cambian en el panel de Baltium Agenda (profesionales y servicios) o con SQL en `professionals.working_hours` y `services.duration_min`. Mientras no los confirme, no publiques la web: los clientes verían horas que Pilar quizá no atiende.
Para bloquear vacaciones o ausencias: tabla `time_off`.

## Siguiente nivel (cuando haya WhatsApp)
Modo `link` de Baltium Agenda: el cliente escribe por WhatsApp y el bot responde con el enlace de reserva; recordatorios por email/push gratis; lista de espera y recuperación de cupos al cancelar; precios por servicio.
