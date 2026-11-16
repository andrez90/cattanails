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
