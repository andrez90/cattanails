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
