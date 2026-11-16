# Pendientes que dependen de Pilar o de Andrés (nada de esto está inventado en la web)

## Datos del negocio
- [ ] Dirección exacta, horario y teléfono (hoy solo dice "Alcantarilla, Murcia").
- [ ] **Número de WhatsApp de Pilar**: hoy el botón usa un número de EJEMPLO (34600000000) a petición de Andrés. Reemplazarlo antes de publicar: `WA_NUMBER=34XXXXXXXXX python3 site_src/build.py`.
- [ ] **Confirmar el horario de ejemplo cargado en la agenda (lun-vie 10-14 y 16-20, sáb 10-14), las duraciones y el límite de cancelación de 4 h.** Ver `AGENDA.md`. No publicar sin esto.
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
