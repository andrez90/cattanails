#!/usr/bin/env python3
"""Genera el sitio de Catta Nails 29 en dos variantes:
   dist/  -> paquete para desplegar (CSS/JS externos, URLs limpias, headers de seguridad)
   art/   -> vista previa (CSS/JS en línea, enlaces relativos) para publicar como artifact."""
import json, os, shutil, sys, re, textwrap
from urllib.parse import quote
SRC = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SRC)
DIMS = json.load(open(os.path.join(ROOT, 'site', 'dims.json')))
CSS = open(os.path.join(SRC, 'styles.css')).read()
CSS += """
h1 .mark,h1 .sub{display:block}
h1 .sub{font-family:var(--sans);font-weight:400}
.crumbs{font-size:13px;color:var(--muted);padding-top:22px}
.crumbs a{text-decoration:none}
.crumbs a:hover{text-decoration:underline}
.shead{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;padding-block:36px 70px}
.shead h1{font-size:clamp(40px,6vw,78px);line-height:1}
.shead p{color:var(--muted);max-width:50ch;font-size:17px;margin:18px 0 24px}
.svc3{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.svc3 .box h3{font-size:32px}
.price{font-size:13px;color:var(--gold);font-weight:600;letter-spacing:.04em}
.ctaband{text-align:center;display:grid;gap:18px;justify-items:center;padding-block:80px}
.ctaband h2{font-size:clamp(34px,5vw,60px);line-height:1.02}
@media(max-width:860px){.shead{grid-template-columns:1fr}.svc3{grid-template-columns:1fr}}
"""
JS = open(os.path.join(SRC, 'app.js')).read()
JSART = JS.replace('/* ---------- reservas del salón', open(os.path.join(SRC, 'demo.js')).read() + '\n/* ---------- reservas del salón', 1)

BRAND = 'Catta Nails 29'
DOM = os.environ.get('SITE_DOMAIN', 'https://cattanails.netlify.app').rstrip('/')  # dominio publicado en Netlify; para uno propio: SITE_DOMAIN=https://tudominio.es
IG = 'https://www.instagram.com/catta_nails29/'
DM = 'https://ig.me/m/catta_nails29'
TALLY = 'https://tally.so/r/wA1aPo'
POLICY_VERSION = 'v1-2026-11'
SB_URL = 'https://sleckhpzbqbwlvqevtbc.supabase.co'  # proyecto Supabase propio de Catta Nails
SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZWNraHB6YnFid2x2cWV2dGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NDk3ODYsImV4cCI6MjExMDUyNTc4Nn0.qUC3EIjda94GwfYW6IKRaOzUr9XpfL3fLXnkyGBMJek'  # clave pública (anon)  # clave pública (anon): segura en el navegador, el acceso real lo limitan RLS y las funciones catta_*
WA_PLACEHOLDER = '34602447102'  # WhatsApp de Pilar (+34 602 44 71 02). También se cambia desde el panel.
WAN = re.sub(r'\D', '', os.environ.get('WA_NUMBER', WA_PLACEHOLDER))  # WhatsApp de Pilar, solo dígitos con prefijo (ej. 34600123456). Vacío = botón oculto.

PAGES = {  # clave: (url dist, archivo art, archivo dist)
    'home': ('/', 'index.html', 'index.html'),
    'form': ('/formacion', 'formacion.html', 'formacion.html'),
    'svc': ('/unas-alcantarilla', 'unas-alcantarilla.html', 'unas-alcantarilla.html'),
    'legal': ('/aviso-legal-privacidad', 'aviso-legal-privacidad.html', 'aviso-legal-privacidad.html'),
    'thanks': ('/gracias', 'gracias.html', 'gracias.html'),
    'book': ('/reservar', 'reservar.html', 'reservar.html'),
    'bookok': ('/reserva-enviada', 'reserva-enviada.html', 'reserva-enviada.html'),
    'manage': ('/mi-cita', 'mi-cita.html', 'mi-cita.html'),
    'admin': ('/admin', 'admin.html', 'admin.html'),
}

def lens(title, desc):
    assert len(title) <= 60, (len(title), title)
    assert len(desc) <= 155, (len(desc), desc)

def make(mode):
    art = mode == 'art'
    L = (lambda k: PAGES[k][1]) if art else (lambda k: PAGES[k][0])
    IMGP = 'img/' if art else '/img/'
    def IM(n, alt, cls='', lazy=True, prio=False):
        w, h = DIMS[n]
        a = ' loading="lazy"' if lazy and not prio else ''
        if prio: a = ' fetchpriority="high"'
        c = f' class="{cls}"' if cls else ''
        return f'<img{c} src="{IMGP}{n}.webp" width="{w}" height="{h}" alt="{alt}"{a}>'

    def head(key, title, desc, ld=None, noindex=False, full=True, canon=None):
        lens(title, desc)
        url = DOM + (PAGES[key][0] if key != 'home' else '/')
        h = [f'<title>{title}</title>',
             '<meta name="claude:viewport-fit-sides" content="cover">' if (art and not full) else '',
             '<meta charset="utf-8">',
             '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' if full else '',
             f'<meta name="description" content="{desc}">',
             '<meta name="robots" content="noindex,follow">' if noindex else '<meta name="robots" content="index,follow,max-image-preview:large">',
             f'<link rel="canonical" href="{canon or url}">',
             '<meta name="theme-color" content="#560d2b">',
             f'<meta property="og:type" content="website"><meta property="og:locale" content="es_ES"><meta property="og:site_name" content="{BRAND}">',
             f'<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{url}">',
             f'<meta property="og:image" content="{DOM}/img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">',
             '<meta name="twitter:card" content="summary_large_image">',
             f'<meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{desc}"><meta name="twitter:image" content="{DOM}/img/og.jpg">',
             f'<meta name="img-base" content="{IMGP}"><meta name="formacion-url" content="{L("form")}"><meta name="ga-id" content=""><meta name="sb-url" content="{SB_URL}"><meta name="sb-key" content="{SB_KEY}">']
        if not art:
            h += ['<link rel="icon" href="/favicon.svg" type="image/svg+xml">', '<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">',
                  '<link rel="manifest" href="/site.webmanifest">']
        h += ['<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
              '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Marcellus&family=DM+Sans:wght@400;500;600;700&display=swap">']
        h.append('<style>[hidden]{display:none!important}' + CSS + '</style>' if art else '<link rel="stylesheet" href="/styles.css">')
        if ld:
            h.append('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>')
        return '\n'.join(x for x in h if x)

    def header(cur, book_label='Reservar cita', book_href=None, book_evt='reserva_click'):
        book_href = book_href or L('book')
        def tab(k, label):
            c = ' aria-current="page"' if cur == k else ''
            return f'<a href="{L(k)}"{c}>{label}</a>'
        ext = ' target="_blank" rel="noopener"' if book_href.startswith('http') else ''
        return f'''<a class="skip" href="#main">Saltar al contenido</a><div id="prog" aria-hidden="true"></div><p class="aviso" data-k="site.aviso" role="status" hidden></p>
<header class="top"><div class="wrap bar">
<a class="logo" href="{L('home')}" aria-label="Catta Nails 29, inicio">CATTA<small>NAILS 29</small></a>
<nav class="tabs" aria-label="Secciones del sitio">{tab('home','Salón')}<a class="tab-x" href="{L('home')}#galeria">Trabajos</a>{tab('form','Formación')}</nav>
<div class="tools"><button type="button" class="icon-btn" id="theme" aria-label="Cambiar entre tema claro y oscuro">◐</button>
<a class="book-sm" href="{book_href}"{ext} data-evt="{book_evt}">{book_label}</a></div></div></header>'''

    WAI = '<svg class="wai" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.3 1 4.3 2.7 5.8L5 21l4.3-1.9c.9.2 1.8.3 2.7.3 5.1 0 9-3.6 9-8.1S17.1 3 12 3z" fill="currentColor"/><circle cx="8.2" cy="11.2" r="1.2" fill="#fff"/><circle cx="12" cy="11.2" r="1.2" fill="#fff"/><circle cx="15.8" cy="11.2" r="1.2" fill="#fff"/></svg>'
    def sticky(a, b):
        def btn(x, solid):
            lab, href, evt = x
            ext = '' if href.startswith('#') or href.startswith('/') or not href.startswith('http') else ' target="_blank" rel="noopener"'
            ic = WAI if evt == 'wa_click' else ''
            cl = ' wa' if evt == 'wa_click' else ''
            return f'<a class="pill{" solid" if solid else ""}{cl}" href="{href}"{ext} data-evt="{evt}">{ic}{lab}</a>'
        return f'<div class="sticky-cta">{btn(a, True)}{btn(b, False)}</div>'

    WAI = '<svg class="wai" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.3 1 4.3 2.7 5.8L5 21l4.3-1.9c.9.2 1.8.3 2.7.3 5.1 0 9-3.6 9-8.1S17.1 3 12 3z" fill="currentColor"/><circle cx="8.2" cy="11.2" r="1.2" fill="#fff"/><circle cx="12" cy="11.2" r="1.2" fill="#fff"/><circle cx="15.8" cy="11.2" r="1.2" fill="#fff"/></svg>'
    def wa(msg):
        return f'https://wa.me/{WAN}?text={quote(msg)}'
    def wabtn(label='Escribir por WhatsApp', msg='Hola Pilar, quiero reservar una cita en Catta Nails.', solid=False, evt='wa_click'):
        if not WAN: return ''
        return f'<a class="pill{" solid" if solid else ""} wa" href="{wa(msg)}" target="_blank" rel="noopener" data-evt="{evt}">{WAI}{label}</a>'
    def salon_sticky():
        b = ('WhatsApp', wa('Hola Pilar, quiero reservar una cita en Catta Nails.'), 'wa_click') if WAN else ('Ver curso', L('form'), 'curso_click')
        return sticky(('Reservar cita', L('book'), 'reserva_click'), b)

    def footer():
        return f'''<div class="wrap"><footer class="foot">
<div class="fgrid"><div><a class="logo" href="{L('home')}">CATTA<small>NAILS 29</small></a><p style="color:var(--muted);margin:10px 0 0;max-width:34ch;font-size:14px">Uñas hechas a mano y formación de manicura en Alcantarilla, Murcia.</p></div>
<nav class="flinks" aria-label="Pie de página"><a href="{L('home')}">Salón</a><a href="{L('form')}">Formación</a><a href="{L('book')}">Reservar cita</a><a href="{L('svc')}">Uñas en Alcantarilla</a><a href="{IG}" target="_blank" rel="noopener">Instagram</a><a href="{L('legal')}">Aviso legal y privacidad</a><a href="{L('legal')}#cookies">Cookies</a><a href="{L('admin')}" rel="nofollow">Acceso Pilar</a></nav></div>
<small>© <span data-year>2026</span> Catta Nails 29 · Alcantarilla, Murcia (España)</small></footer></div>
<div class="consent" id="consent" hidden role="dialog" aria-label="Preferencias de cookies"><p>Usamos cookies de analítica solo si las aceptas. Puedes rechazarlas y seguir navegando igual.</p><div class="row"><button type="button" id="cAcc">Aceptar</button><button type="button" id="cRej">Rechazar</button><button type="button" id="cCfg">Solo necesarias</button></div></div>'''

    def page(key, title, desc, body, ld=None, noindex=False, full=None, canon=None):
        isfull = (not art) or key != 'home'
        hd = head(key, title, desc, ld, noindex, full=isfull, canon=canon)
        script = f'<script>{JSART}</script>' if art else '<script src="/app.js" defer></script>'
        if isfull:
            return f'<!doctype html>\n<html lang="es-ES"><head>\n{hd}\n</head><body>\n{body}\n{script}\n</body></html>'
        return f'{hd}\n{body}\n{script}'

    crumb = lambda items: {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": DOM + u} for i, (n, u) in enumerate(items)]}
    ORG = {"@type": ["BeautySalon", "LocalBusiness"], "@id": DOM + "/#salon", "name": BRAND, "url": DOM + "/",
           "image": DOM + "/img/og.jpg", "description": "Salón de uñas y formación de manicura en Alcantarilla, Murcia.",
           "address": {"@type": "PostalAddress", "addressLocality": "Alcantarilla", "addressRegion": "Región de Murcia", "addressCountry": "ES"},
           "sameAs": [IG], "founder": {"@type": "Person", "name": "Pilar"},
           "potentialAction": {"@type": "ReserveAction", "name": "Reservar cita", "target": {"@type": "EntryPoint", "urlTemplate": DOM + "/reservar"}}}

    out = {}
    # Galería del salón: (imagen, nombre, texto alternativo, estilos). Añadir aquí las fotos nuevas.
    GCATS = [('todo','Todos'),('french','French'),('flores','Flores'),('mariposas','Mariposas'),('color','Color y natural')]
    GALLERY = [('n1','French rojo con flor','Uñas french rojas con flor y pedrería','french flores'),
               ('n2','French con mariposa','French con mariposa pintada a mano','french mariposas'),
               ('n4','French con flor verde','French con flor verde pintada a mano','french flores'),
               ('n6','Flor sobre fondo vino','Flor pintada sobre fondo vino','flores color'),
               ('n3','Rojo con detalle dorado','Uñas rojas con detalle dorado','color'),
               ('n5','Nude natural','Manicura nude natural','color')]
    # Muro de alumnas: solo fotos y nombres reales y con permiso. Vacío = la sección no se muestra.
    # Formato: ('archivo-sin-extension', 'Nombre', 'Qué hizo o qué dice, con sus palabras')
    ALUMNAS = []

    # ---------------- INICIO ----------------
    faq = lambda items: ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q, a in items)
    home_faq = [('¿Cómo reservo una cita en el salón?', f'Desde la <a href="{L("book")}">página de reservas</a>: eliges servicio, día y franja en un minuto. Tu hora queda reservada al momento y puedes cancelarla o cambiarla tú mismo.'),
                ('¿Dónde está el salón?', 'En Alcantarilla, Murcia (España). Te damos la dirección exacta al confirmar tu cita.'),
                ('¿Necesito experiencia para el curso?', f'No. El curso <a href="{L("form")}">Inicio en el mundo de las uñas</a> está pensado para mujeres que empiezan desde cero.'),
                ('¿La formación es presencial?', 'Sí, la capacitación es 100 % presencial en Alcantarilla.')]
    home = f'''{header('home')}
<main id="main">
<section class="hero"><span class="aur aur1" aria-hidden="true"></span><span class="aur aur2" aria-hidden="true"></span><div class="wrap hero-grid">
<div class="hero-copy">
<span class="hero-badge"><i></i><span data-k="site.hero_badge">Reserva online · sin llamadas</span></span>
<h1><span class="mark"><i>C</i><i>A</i><i>T</i><i>T</i><i>A</i></span><span class="sub">Nails 29 · Uñas a mano alzada en Alcantarilla</span></h1>
<p class="lead" data-k="site.hero_lead">Diseños que se ven bien y también duran, hechos por Pilar en su salón de Alcantarilla (Murcia). Elige tu hora libre en un minuto.</p>
<div class="ctas"><a class="pill solid glow big" href="{L('book')}" data-evt="reserva_click">Reservar mi hora</a>{wabtn('Escribir por WhatsApp', solid=True)}</div>
<p class="hero-note">Cancelas cuando quieras desde tu enlace · <a href="{L('form')}">¿Quieres aprender? Mira el curso</a></p>
</div>
<div class="portrait"><div class="ring"></div><div class="arch">{IM('hero','Pilar, formadora de manicura, en su salón de Alcantarilla',prio=True)}</div>
<a class="stamp" href="{L('book')}" data-evt="reserva_click" aria-label="Reservar cita"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="stp" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs><text><textPath href="#stp">Reserva tu hora · Hecho a mano · </textPath></text></svg><b>→</b></a>
<div class="cap"><strong>Pilar</strong><span>Formadora de manicura</span></div></div>
</div>
<div class="ticker" aria-hidden="true"><div>{''.join(f'<span>{t}</span>' for t in 2*['French','Nail art a mano alzada','Flores pintadas a mano','Mariposas','Resultado estético y funcional','Formación presencial','Alcantarilla'])}</div></div>
</section>

<section class="reel" id="trabajos" aria-label="Trabajos reales"><div class="reel-sticky">
<div class="reel-head" id="reelHead"><span class="eyebrow">Trabajos reales</span><h2>Cada set,<em>en primer plano.</em></h2></div>
<div class="reel-stage" id="reelStage"></div>
<div class="reel-copy" id="reelCopy"><span class="eyebrow">Hecho a mano</span><h3>De lo sencillo <em>a lo individual.</em></h3>
<p>Cada set empieza en tu uña natural y termina a tu medida: forma, color y detalles pintados a mano, uno a uno. Resultado estético y funcional.</p>
<a class="pill solid" href="{L('book')}" data-evt="reserva_click">Pedir mi diseño</a></div>
<div class="reel-hint" id="reelHint"><span>Sigue bajando</span><i></i></div></div></section>

<section class="sec" id="servicios"><div class="wrap two">
<div class="rv"><span class="eyebrow">Servicios del salón</span><h2 style="margin:10px 0 16px">Uñas con diseño, <em>sin complicaciones.</em></h2>
<p>Elige lo que necesitas y reserva tu cita. Pilar te dice el precio y el tiempo antes de confirmarla.</p>
<div class="ctas" style="margin-top:22px"><a class="pill solid" href="{L('svc')}">Ver servicios</a></div></div>
<ul class="svc-list rv"><li><a href="{L('svc')}#manicura"><strong>Manicura</strong><small data-k="site.precio_manicura">Precio al consultar</small></a></li>
<li><a href="{L('svc')}#diseno"><strong>Uñas con diseño</strong><small data-k="site.precio_diseno">Precio al consultar</small></a></li>
<li><a href="{L('svc')}#mantenimiento"><strong>Mantenimiento</strong><small data-k="site.precio_mantenimiento">Precio al consultar</small></a></li>
<li><a href="{L('form')}"><strong>Formación</strong><small>Curso presencial</small></a></li></ul></div></section>

<section class="sec" id="pilar" style="padding-top:20px"><div class="wrap about">
<div class="pic rv">{IM('about','Pilar de Catta Nails 29')}</div>
<div class="rv"><span class="eyebrow">Pilar · Formadora de manicura</span>
<h2 style="margin:12px 0 18px">De Colombia a España, <em>hasta tener su propio salón.</em></h2>
<p>Pilar pasó de no tener nada a abrir su propio salón de uñas en Alcantarilla. Hoy quiere que otras mujeres también logren vivir de este oficio, y por eso, además de atender en el salón, da formación.</p>
<ul><li>Resultado estético y funcional en cada set</li><li>Diseños a mano alzada: flores, mariposas y french</li><li>Formación presencial para empezar desde cero</li></ul>
<div class="ctas" style="margin-top:22px"><a class="pill solid" href="{L('book')}" data-evt="reserva_click">Reservar con Pilar</a>{wabtn('WhatsApp')}<a class="pill" href="{IG}" target="_blank" rel="noopener">Ver su Instagram</a></div></div></div></section>

<section class="band sec"><div class="wrap"><div class="sec-head" style="margin-bottom:10px"><span class="eyebrow">Su camino</span><h2>Mi inicio, mi trayectoria, <em>mi carrera.</em></h2></div></div>
<div class="line-track" id="line"></div><p class="hint">Toca una foto para verla más grande</p></section>

<section class="sec" id="galeria"><div class="wrap"><div class="sec-head"><span class="eyebrow">Trabajos del salón</span><h2>Elige tu diseño <em>y reserva tu hora.</em></h2><p>Fotos reales de uñas hechas por Pilar. Toca «Quiero este» y tu reserva ya lleva el diseño anotado.</p></div>
<div class="gfil" role="group" aria-label="Filtrar trabajos por estilo">{''.join(f'<button type="button" aria-pressed="{"true" if k=="todo" else "false"}" data-f="{k}">{lab}</button>' for k,lab in GCATS)}</div>
<div class="gal" id="gal">{''.join(f'<figure data-c="{c}">{IM(n,a)}<figcaption><strong>{nm}</strong><a class="pill solid" href="{L("book")}#d={quote(nm)}" data-evt="diseno_click">Quiero este</a></figcaption></figure>' for n,nm,a,c in GALLERY)}</div>
<p class="gal-empty" id="galEmpty" hidden>Aún no hay fotos de este estilo aquí. <a href="{IG}" target="_blank" rel="noopener">Mira más en Instagram</a>.</p>
<div class="ctas" style="justify-content:center;margin-top:26px"><a class="pill solid" href="{L('book')}" data-evt="reserva_click">Reservar con otro diseño</a><a class="pill" href="{IG}" target="_blank" rel="noopener" data-evt="ig_click">Ver más en @catta_nails29</a></div></div></section>

<section class="learn band" aria-label="Formación"><div id="floaters"></div><div class="wrap"><span class="eyebrow" style="position:relative;z-index:2">Formación Catta Nails</span>
<h2>Aprende<em>estas manos</em></h2><p>Capacitación de uñas 100 % presencial en Alcantarilla, pensada para empezar desde cero.</p>
<a class="pill solid" href="{L('form')}">Ver el curso y solicitar plaza</a></div></section>

<section class="sec" id="visita"><div class="wrap visit">{IM('visit','Puesto de trabajo del salón Catta Nails 29')}
<div class="rv"><span class="eyebrow">La visita</span><h2>Un salón propio, <em>hecho con cariño.</em></h2>
<div class="three"><div class="box"><h3>Dónde</h3><p data-k="site.direccion">Alcantarilla, Murcia (España). Te damos la dirección exacta al confirmar tu cita.</p><p class="hor" data-k="site.horario" hidden></p></div>
<div class="box"><h3>Cómo reservar</h3><p><a href="{L('book')}">Reserva tu cita en línea</a>{' o escríbele por WhatsApp' if WAN else ''}. También en Instagram: @catta_nails29.</p></div>
<div class="box"><h3>Formación</h3><p>Los cursos son presenciales. <a href="{L('form')}">Rellena el formulario</a> y Pilar te contacta.</p></div></div></div></div></section>

<section class="band sec" id="preguntas"><div class="wrap" style="max-width:860px"><div class="sec-head"><span class="eyebrow">Preguntas</span><h2>Antes de <em>empezar.</em></h2></div>{faq(home_faq)}</div></section>
</main>
{footer()}
{salon_sticky()}
<div class="modal" id="modal" hidden role="dialog" aria-modal="true" aria-label="Foto ampliada"></div>'''
    t, d = 'Catta Nails 29 · Uñas y curso de manicura en Alcantarilla', 'Salón de uñas con diseños a mano alzada y curso presencial de manicura desde cero en Alcantarilla, Murcia. Reserva en línea.'
    out['home'] = page('home', t, d, home, ld={"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "@id": DOM + "/#website", "url": DOM + "/", "name": BRAND, "inLanguage": "es-ES"}, ORG]})

    # ---------------- FORMACIÓN ----------------
    def radio(n, v):
        return f'<label><input type="radio" name="{n}" value="{v}"> {v}</label>'
    def chk(n, v):
        return f'<label><input type="checkbox" name="{n}" value="{v}"> {v}</label>'
    form = f'''<form id="cursoForm" name="curso" method="POST" action="{L('thanks')}" data-netlify="true" netlify-honeypot="bot-field" data-thanks="{L('thanks')}" data-post="/" data-policy="{POLICY_VERSION}" novalidate>
<input type="hidden" name="form-name" value="curso">
<p class="hp" aria-hidden="true"><label>No rellenar este campo <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<div class="progress"><span id="plabel">Paso 1 de 2</span><i><b id="pbar"></b></i></div>
<div class="fmsg bad" id="summary" role="alert" hidden></div>
<div class="fstep" data-step="1">
<div class="field"><label for="nombre">Nombre y apellidos *</label><input type="text" id="nombre" name="nombre" autocomplete="name" required aria-describedby="e-nombre"><p class="err" id="e-nombre" aria-live="polite"></p></div>
<div class="field"><label for="telefono">Tu número de teléfono *</label><input type="tel" id="telefono" name="telefono" autocomplete="tel" inputmode="tel" placeholder="+34 600 000 000" required aria-describedby="e-telefono"><p class="err" id="e-telefono" aria-live="polite"></p></div>
<div class="field"><label for="instagram">Tu Instagram con @ *</label><input type="text" id="instagram" name="instagram" autocomplete="off" autocapitalize="none" placeholder="@tunombre" required aria-describedby="e-instagram"><p class="err" id="e-instagram" aria-live="polite"></p></div>
<div class="actions"><button type="button" class="fbtn" id="next">Continuar</button><small style="color:var(--acad-muted)">2 pasos, 1 minuto. Sin pagos.</small></div>
</div>
<div class="fstep" data-step="2" hidden>
<input type="hidden" name="curso" value="Inicio en el mundo de las uñas">
<fieldset class="field"><legend>¿Para qué quieres aprender? *</legend><div class="opts">{radio('objetivo','Trabajar en un salón')}{radio('objetivo','Montar mi propio negocio')}{radio('objetivo','Mejorar lo que ya hago')}{radio('objetivo','Es un hobby')}</div><p class="err" id="e-objetivo" aria-live="polite"></p></fieldset>
<fieldset class="field"><legend>¿Cuál es tu punto de partida? *</legend><div class="opts" id="exp">{radio('experiencia','Empiezo desde cero')}{radio('experiencia','Ya hago uñas por mi cuenta')}{radio('experiencia','Ya trabajo en el sector')}</div><p class="err" id="e-experiencia" aria-live="polite"></p></fieldset>
<fieldset class="field"><legend>¿Cuándo te gustaría empezar? *</legend><div class="opts">{radio('inicio','Lo antes posible')}{radio('inicio','En 1 a 3 meses')}{radio('inicio','Solo me estoy informando')}</div><p class="err" id="e-inicio" aria-live="polite"></p></fieldset>
<fieldset class="field"><legend>Es 100 % presencial en Alcantarilla. ¿Puedes venir? *</legend><div class="opts">{radio('presencial','Sí, sin problema')}{radio('presencial','Vivo lejos, pero me organizo')}{radio('presencial','No puedo desplazarme')}</div><p class="err" id="e-presencial" aria-live="polite"></p></fieldset>
<fieldset class="field"><legend>Para formarte, ¿cómo lo ves? *</legend><div class="opts">{radio('inversion','Tengo presupuesto para empezar')}{radio('inversion','Depende del precio')}{radio('inversion','Necesitaría facilidades de pago')}</div><p class="err" id="e-inversion" aria-live="polite"></p></fieldset>
<div class="field"><label class="check"><input type="checkbox" id="consentimiento" name="consentimiento" value="si" aria-describedby="e-consentimiento"><span>He leído el <a href="{L('legal')}#privacidad" target="_blank" rel="noopener">aviso de privacidad</a> y acepto que Catta Nails 29 trate mis datos para contactarme sobre el curso. *</span></label><p class="err" id="e-consentimiento" aria-live="polite"></p></div>
<label class="check"><input type="checkbox" name="novedades" value="si"><span>Quiero recibir novedades y fechas de próximos cursos (opcional; puedes retirarlo cuando quieras).</span></label>
<div class="actions"><button type="button" class="fbtn ghost" id="back">Atrás</button><button type="submit" class="fbtn" id="send">Enviar mi solicitud</button></div>
</div></form>
<div class="fb-panel" id="fallback" hidden><h3 id="fbHead" tabindex="-1" style="font-size:30px">No pudimos enviarlo desde aquí</h3>
<p style="margin:0;color:var(--acad-muted)">Tu solicitud no llegó a Pilar todavía. Copia el mensaje y envíaselo por WhatsApp o Instagram, así no pierdes lo que escribiste.</p>
<textarea id="fbText" class="field" style="width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:12px;color:var(--acad-fg)" readonly></textarea>
<div class="actions"><button type="button" class="fbtn" id="fbCopy">Copiar mensaje</button>{('<a class="fbtn" style="text-decoration:none;display:inline-flex;align-items:center" href="'+wa('Hola Pilar, quiero solicitar plaza en el curso.')+'" target="_blank" rel="noopener" data-evt="wa_click">Abrir WhatsApp</a>') if WAN else ''}<a class="fbtn" style="text-decoration:none;display:inline-flex;align-items:center" href="{DM}" target="_blank" rel="noopener" data-evt="dm_click">Abrir Instagram</a><button type="button" class="fbtn ghost" id="fbBack">Volver al formulario</button></div>
<div class="fmsg" id="fbOk" role="status" hidden></div></div>
<p class="alt">¿Prefieres el formulario original de Pilar? <a href="{TALLY}" target="_blank" rel="noopener" data-evt="tally_click">Rellénalo en Tally</a>.</p>'''
    formation = f'''{header('form', 'Solicitar plaza', '#solicitar', 'solicitar_click')}
<main id="main">
<section class="dark"><div class="wrap fhero"><div>
<span class="eyebrow" style="color:var(--acad-muted)">Curso · Inicio en el mundo de las uñas</span>
<h1 style="margin-top:12px">Curso de uñas desde cero <em>en Alcantarilla (Murcia)</em></h1>
<p>Una formación pensada para mujeres que quieren empezar en el mundo de las uñas desde cero, aprender una nueva profesión, tener libertad económica y crear su propio camino. Pilar te acompaña paso a paso.</p>
<p class="cinfo" data-k="site.curso_info" hidden></p>
<div class="chips"><span>100 % presencial</span><span>Desde cero</span><span>Paso a paso</span><a href="#comunidad">Con comunidad ↓</a></div>
<div class="ctas"><a class="pill solid glow" href="#solicitar" data-evt="solicitar_click">Solicitar mi plaza</a><a class="pill" href="{wa('Hola Pilar, quiero información sobre el curso.') if WAN else DM}" target="_blank" rel="noopener" data-evt="{'wa_click' if WAN else 'dm_click'}">Hablar con Pilar</a></div></div>
<div class="arch">{IM('acad','Práctica de uñas durante la formación de Catta Nails 29',prio=True)}</div></div></section>

<section class="sec"><div class="wrap"><div class="sec-head rv"><span class="eyebrow">Para quién es</span><h2>Este curso es para ti <em>si quieres…</em></h2></div>
<div class="for rv"><div><h3>Empezar desde cero</h3><p>No necesitas experiencia previa. Aprendes el oficio desde el principio, con alguien que te acompaña.</p></div>
<div><h3>Una nueva profesión</h3><p>Aprender uñas como oficio, con técnicas reales de salón y con la guía de una profesional que tiene su propio negocio.</p></div>
<div><h3>Libertad económica</h3><p>Crear tu propio camino y tener la opción de vivir de lo que sabes hacer.</p></div></div></div></section>

<section class="band sec"><div class="wrap about">
<div class="pic rv">{IM('about','Pilar, formadora de manicura de Catta Nails 29')}</div>
<div class="rv"><span class="eyebrow">Quién te enseña</span><h2 style="margin:12px 0 18px">Pilar pasó de no tener nada <em>a su propio salón.</em></h2>
<p>De Colombia a España, Pilar construyó su salón de uñas en Alcantarilla. Ahora quiere que tú también logres vivir de este oficio, y por eso da formación presencial.</p>
<ul><li>Formación 100 % presencial</li><li>Acompañamiento paso a paso</li><li>Resultado estético y funcional como criterio de trabajo</li></ul></div></div></section>

<section class="sec"><div class="wrap"><div class="sec-head rv"><span class="eyebrow">Cómo entrar al curso</span><h2>Tres pasos, <em>sin compromiso.</em></h2><p>Fechas, duración y precio te los confirma Pilar cuando te contacte.</p></div>
<ol class="steps rv" style="padding:0;margin:0"><li><h3>Rellena el formulario</h3><p>Son pocos datos y casi todo se responde con un toque. Tardas un minuto.</p></li>
<li><h3>Pilar te conoce</h3><p>Tus respuestas le ayudan a saber si este curso es para ti y a prepararse para hablar contigo.</p></li>
<li><h3>Empiezas tu camino</h3><p>Si estás lista para un cambio real, Pilar te acompaña paso a paso.</p></li></ol></div></section>

<section class="band sec" style="padding-block:60px"><div class="wrap"><div class="strip rv">{''.join(IM(n,a) for n,a in [('n1','French rojo con flor y pedrería'),('n2','French con mariposa pintada a mano'),('n4','French con flor verde'),('n3','Uñas rojas con detalle dorado')])}</div>
<p class="hint" style="padding-top:14px">Trabajos hechos en el salón de Pilar.</p></div></section>

<section class="dark formsec" id="solicitar"><div class="wrap formgrid">
<div class="side rv"><span class="eyebrow" style="color:var(--acad-muted)">Solicita tu plaza</span><h2 style="margin:12px 0 16px">¿Empezamos? <em>Cuéntale a Pilar quién eres.</em></h2>
<p>Cinco preguntas rápidas le ayudan a Pilar a saber si el curso es para ti y a prepararse para hablar contigo.</p>
<ul><li>Tardas un minuto: casi todo se responde con un toque</li><li>Pilar revisa tu solicitud y te contacta</li><li>Sin pagos en este paso</li></ul></div>
<div class="fcard rv">{form}</div></div></section>

<section class="sec" id="comunidad"><div class="wrap"><div class="sec-head"><span class="eyebrow">Comunidad Catta Nails</span><h2>No aprendes sola: <em>aquí nos apoyamos.</em></h2><p>Aunque todavía no te apuntes, puedes ir entrando: mira cómo trabaja Pilar, practica y comparte lo que haces.</p></div>
<div class="three comm"><div class="box"><h3>Mira el día a día</h3><p>En Instagram Pilar enseña sus trabajos. Síguela y pregúntale lo que quieras.</p><a class="pill" href="{IG}" target="_blank" rel="noopener" data-evt="ig_click">Seguir a @catta_nails29</a></div>
<div class="box"><h3>Enseña tus prácticas</h3><p>Sube tus uñas a Instagram y etiqueta a <b>@catta_nails29</b>. Así te ve Pilar y te ven otras chicas que también están empezando.</p><a class="pill" href="{DM}" target="_blank" rel="noopener" data-evt="dm_click">Enviar mi práctica a Pilar</a></div>
<div class="box"><h3>Trae a una amiga</h3><p>Empezar acompañada es más fácil. Pásale esta página a quien también quiera aprender.</p><button type="button" class="pill" id="shareBtn" data-text="Mira este curso de uñas desde cero en Alcantarilla">Compartir el curso</button><span class="hint-c" id="shareOk" role="status"></span></div></div>
{('<div class="wall"><h3>Alumnas de Pilar</h3><div class="wall-g">'+''.join(f'<figure>{IM(n,"Trabajo de "+nm+", alumna de Catta Nails 29")}<figcaption><strong>{nm}</strong><span>{tx}</span></figcaption></figure>' for n,nm,tx in ALUMNAS)+'</div></div>') if ALUMNAS else ''}
<div class="dark listcard"><div><span class="eyebrow" style="color:var(--acad-muted)">Lista de próximas fechas</span><h3>¿Aún no es tu momento? <em>Te avisamos del próximo grupo.</em></h3><p>Déjale tu contacto a Pilar y serás de las primeras en saber cuándo abre plazas. Sin compromiso y te borras cuando quieras.</p></div>
<form id="listaForm" name="lista" method="POST" action="{L('thanks')}" data-netlify="true" netlify-honeypot="bot-field" data-post="/" data-policy="{POLICY_VERSION}" novalidate>
<input type="hidden" name="form-name" value="lista"><p class="hp" aria-hidden="true"><label>No rellenar este campo <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<div class="field"><label for="lnombre">Tu nombre *</label><input type="text" id="lnombre" name="nombre" autocomplete="given-name" required aria-describedby="e-lnombre"><p class="err" id="e-lnombre" aria-live="polite"></p></div>
<div class="field"><label for="lcontacto">Tu WhatsApp o tu Instagram *</label><input type="text" id="lcontacto" name="contacto" autocapitalize="none" placeholder="+34 600 000 000 o @tunombre" required aria-describedby="e-lcontacto"><p class="err" id="e-lcontacto" aria-live="polite"></p></div>
<div class="field"><label class="check"><input type="checkbox" id="lconsent" name="consentimiento" value="si" aria-describedby="e-lconsent"><span>Acepto que Catta Nails 29 me avise de próximas fechas del curso, según el <a href="{L('legal')}#privacidad" target="_blank" rel="noopener">aviso de privacidad</a>. *</span></label><p class="err" id="e-lconsent" aria-live="polite"></p></div>
<div class="actions"><button type="submit" class="fbtn" id="lsend">Avisadme</button></div>
<div class="fmsg" id="lmsg" role="status" hidden></div></form></div>
</div></section>

<section class="sec" id="preguntas"><div class="wrap" style="max-width:860px"><div class="sec-head"><span class="eyebrow">Preguntas</span><h2>Antes de <em>solicitar tu plaza.</em></h2></div>
{faq([('¿Necesito experiencia para el curso?','No. Inicio en el mundo de las uñas está pensado para mujeres que quieren empezar desde cero.'),
('¿La formación es presencial?','Sí, es 100 % presencial en Alcantarilla (Murcia).'),
('¿Cuánto tarda el formulario y qué piden?','Un minuto. Piden tu nombre y apellidos, tu teléfono y tu Instagram con @. Después, cinco preguntas de un toque: para qué quieres aprender, tu punto de partida, cuándo empezar, si puedes venir y cómo ves la inversión.'),
('¿Cuándo empieza, cuánto dura y cuánto cuesta?','Pilar te confirma fechas, duración y precio cuando te contacte, según el grupo que se esté formando.'),
('¿Es solo para mujeres?','El curso está pensado para mujeres que quieren empezar en el mundo de las uñas. Si tienes dudas, escribe a Pilar por Instagram.')])}</div></section>
</main>
{footer()}
{sticky(('Solicitar plaza', '#solicitar', 'solicitar_click'), ('WhatsApp', wa('Hola Pilar, quiero información sobre el curso.'), 'wa_click') if WAN else ('Instagram', DM, 'dm_click'))}'''
    t, d = 'Curso de uñas desde cero en Alcantarilla | Catta Nails 29', 'Formación presencial de manicura para mujeres que empiezan desde cero. Aprende con Pilar en Alcantarilla y solicita tu plaza en un minuto.'
    out['form'] = page('form', t, d, formation, ld={"@context": "https://schema.org", "@graph": [
        {"@type": "Course", "name": "Inicio en el mundo de las uñas", "description": "Formación presencial de manicura para mujeres que quieren empezar desde cero, aprender una nueva profesión y crear su propio camino.",
         "provider": {"@type": "Organization", "name": BRAND, "sameAs": IG, "url": DOM + "/"}, "inLanguage": "es-ES",
         "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "onsite", "location": {"@type": "Place", "address": {"@type": "PostalAddress", "addressLocality": "Alcantarilla", "addressRegion": "Región de Murcia", "addressCountry": "ES"}}}},
        crumb([('Inicio', '/'), ('Formación', '/formacion')])]})

    # ---------------- SERVICIO LOCAL ----------------
    svc = f'''{header('svc')}
<main id="main"><div class="wrap"><nav class="crumbs" aria-label="Ruta"><a href="{L('home')}">Inicio</a> › <span>Uñas en Alcantarilla</span></nav>
<section class="shead"><div><span class="eyebrow">Salón de uñas · Alcantarilla, Murcia</span><h1 style="margin-top:12px">Uñas en Alcantarilla, <em>hechas a mano.</em></h1>
<p>Manicura y diseños a mano alzada en el salón de Pilar: french, flores, mariposas y acabados que se ven bien y duran. Reserva tu cita en un minuto.</p>
<div class="ctas"><a class="pill solid glow" href="{L('book')}" data-evt="reserva_click">Reservar cita</a>{wabtn()}<a class="pill" href="{L('form')}">Ver el curso</a></div></div>
<div class="arch" style="justify-self:center">{IM('n1','Uñas french rojas con flor y pedrería',prio=True)}</div></section></div>

<section class="band sec"><div class="wrap"><div class="sec-head rv"><span class="eyebrow">Qué hacemos</span><h2>Servicios <em>del salón.</em></h2><p>El precio depende del diseño. Pilar te lo dice antes de confirmar tu cita.</p></div>
<div class="svc3 rv"><div class="box" id="manicura"><h3>Manicura</h3><p>Preparación de la uña natural y acabado en el color que elijas.</p><span class="price">Precio al consultar</span></div>
<div class="box" id="diseno"><h3>Uñas con diseño</h3><p>French, flores, mariposas, detalles dorados y pedrería, dibujados a mano alzada.</p><span class="price">Precio al consultar</span></div>
<div class="box" id="mantenimiento"><h3>Mantenimiento</h3><p>Renovación y cuidado para que tu set siga bien semanas después. Resultado estético y funcional.</p><span class="price">Precio al consultar</span></div></div></div></section>

<section class="sec"><div class="wrap"><div class="sec-head rv"><span class="eyebrow">Cómo reservar</span><h2>Tu cita en <em>tres pasos.</em></h2></div>
<ol class="steps rv" style="padding:0;margin:0"><li><h3>Elige servicio y día</h3><p>Indica qué quieres hacerte y qué día te viene bien.</p></li><li><h3>Elige tu hora</h3><p>Ves las horas libres y reservas la que prefieras. Pilar te cuenta el precio exacto del diseño.</p></li><li><h3>Ven al salón</h3><p>Te damos la dirección exacta al confirmar. Si tienes una foto de referencia, envíala.</p></li></ol>
<p style="text-align:center;margin-top:28px"><a class="pill solid" href="{L('book')}" data-evt="reserva_click">Reservar cita</a></p></div></section>

<section class="band sec" style="padding-block:60px"><div class="wrap"><div class="strip rv">{''.join(IM(n,a) for n,a in [('n2','French con mariposa pintada a mano'),('n3','Uñas rojas con detalle dorado'),('n5','Manicura nude natural'),('n4','French con flor verde')])}</div></div></section>

<section class="sec" id="preguntas"><div class="wrap" style="max-width:860px"><div class="sec-head"><span class="eyebrow">Preguntas</span><h2>Sobre tu <em>cita.</em></h2></div>
{faq([('¿Dónde está el salón?','En Alcantarilla, Murcia (España). Pilar te da la dirección exacta al confirmar tu cita.'),
('¿Cuánto cuesta?','Depende del diseño. Pilar te da el precio antes de confirmar.'),
('¿Puedo llevar una foto de referencia?','Sí. Cuéntalo en la reserva y envíala a Pilar cuando te confirme, para que te diga si puede hacerla y cómo.'),
('¿Cómo reservo?',f'Desde la <a href="{L("book")}">página de reservas</a>. Eliges servicio, día y hora libre, y puedes cancelar o cambiar tu cita en línea.'),
('¿También dan cursos?',f'Sí. Pilar da formación presencial para empezar desde cero: <a href="{L("form")}">mira el curso Inicio en el mundo de las uñas</a>.')])}</div></section>
</main>
{footer()}
{salon_sticky()}'''
    t, d = 'Uñas en Alcantarilla: nail art a mano | Catta Nails 29', 'Manicura y uñas con diseño a mano alzada en Alcantarilla, Murcia: french, flores y mariposas. Reserva tu cita en línea con Pilar.'
    out['svc'] = page('svc', t, d, svc, ld={"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": "Manicura y uñas con diseño a mano alzada", "provider": {"@id": DOM + "/#salon"}, "areaServed": {"@type": "City", "name": "Alcantarilla"}},
        crumb([('Inicio', '/'), ('Uñas en Alcantarilla', '/unas-alcantarilla')])]})


    # ---------------- RESERVAR (SALÓN) ----------------
    SERV = ['Manicura', 'Uñas con diseño', 'Mantenimiento', 'Consulta y consejo']
    bform = f"""<form id="reservaForm" name="reserva" method="POST" action="{L('bookok')}" data-netlify="true" netlify-honeypot="bot-field" data-thanks="{L('bookok')}" data-post="/" data-policy="{POLICY_VERSION}" novalidate>
<input type="hidden" name="form-name" value="reserva"><input type="hidden" name="codigo" id="rcodigo" value=""><input type="hidden" name="hora_reservada" id="rhora" value="">
<p class="hp" aria-hidden="true"><label>No rellenar este campo <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
<div class="progress"><span id="rplabel">Paso 1 de 2</span><i><b id="rpbar"></b></i></div>
<div class="fmsg bad" id="rsummary" role="alert" hidden></div>
<div class="fstep" data-rstep="1">
<fieldset class="field"><legend>¿Qué te gustaría hacerte? *</legend><div class="opts" id="svcOpts">{''.join(radio('servicio', n) for n in SERV)}</div><p class="err" id="e-servicio" aria-live="polite"></p></fieldset>
<div class="field"><label for="fecha">¿Qué día te viene bien? *</label><div class="days" id="dayChips" role="group" aria-label="Días próximos"></div><label class="other-day" for="fecha">Otro día:</label><input type="date" id="fecha" name="fecha" required aria-describedby="e-fecha"><p class="err" id="e-fecha" aria-live="polite"></p></div>
<fieldset class="field" id="horaBox"><legend>Elige tu hora *</legend><div class="opts" id="slots" aria-live="polite"><span class="hint-s" id="slotsMsg">Elige servicio y día para ver las horas libres.</span></div><p class="err" id="e-hora" aria-live="polite"></p><div class="nextfree" id="nextFree" hidden></div></fieldset>
<fieldset class="field" id="franjaBox" hidden><legend>¿A qué hora del día? *</legend><p class="hint-s">Ahora mismo no podemos mostrar las horas libres. Dinos tu preferencia y Pilar te confirma la hora.</p><div class="opts">{radio('franja','Mañana')}{radio('franja','Tarde')}{radio('franja','Me da igual')}</div><p class="err" id="e-franja" aria-live="polite"></p></fieldset>
<div class="field"><label for="nota">¿Qué diseño tienes en mente? <small>(opcional)</small></label><textarea id="nota" name="nota" maxlength="400" placeholder="Ej.: french con flores. Si tienes una foto, se la envías a Pilar cuando te confirme."></textarea></div>
<div class="actions"><button type="button" class="fbtn" id="rnext">Continuar</button><small style="color:var(--acad-muted)">2 pasos, 1 minuto. Sin pagos.</small></div>
<p class="waalt">¿No te cuadra ninguna hora? <a id="waAlt" data-wa="{WAN}" href="{wa('Hola Pilar, quiero reservar una cita y no encuentro hora en la web.') if WAN else DM}" target="_blank" rel="noopener" data-evt="wa_click">Escríbele a Pilar y te busca hueco</a>.</p>
</div>
<div class="fstep" data-rstep="2" hidden>
<div class="sumline" id="rsum"></div>
<div class="field"><label for="rnombre">Tu nombre *</label><input type="text" id="rnombre" name="nombre" autocomplete="name" required aria-describedby="e-rnombre"><p class="err" id="e-rnombre" aria-live="polite"></p></div>
<div class="field"><label for="rtelefono">Tu teléfono (mejor si tiene WhatsApp) *</label><input type="tel" id="rtelefono" name="telefono" autocomplete="tel" inputmode="tel" placeholder="+34 600 000 000" required aria-describedby="e-rtelefono"><p class="err" id="e-rtelefono" aria-live="polite"></p></div>
<fieldset class="field"><legend>¿Has venido antes al salón? <small>(opcional)</small></legend><div class="opts">{radio('cliente','Es mi primera vez')}{radio('cliente','Ya soy clienta')}</div></fieldset>
<div class="field"><label class="check"><input type="checkbox" id="rconsentimiento" name="consentimiento" value="si" aria-describedby="e-rconsentimiento"><span>He leído el <a href="{L('legal')}#privacidad" target="_blank" rel="noopener">aviso de privacidad</a> y acepto que Catta Nails 29 trate mis datos para gestionar mi cita. *</span></label><p class="err" id="e-rconsentimiento" aria-live="polite"></p></div>
<div class="actions"><button type="button" class="fbtn ghost" id="rback">Atrás</button><button type="submit" class="fbtn" id="rsend">Reservar mi hora</button></div>
</div></form>
<div class="fb-panel" id="rfallback" hidden><h3 id="rfbHead" tabindex="-1" style="font-size:30px">No pudimos enviarla desde aquí</h3>
<p style="margin:0;color:var(--acad-muted)">Tu reserva no se completó. Copia el mensaje y envíaselo por WhatsApp o Instagram, así no pierdes lo que escribiste.</p>
<textarea id="rfbText" class="field" style="width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.28);border-radius:12px;padding:12px;color:var(--acad-fg)" readonly></textarea>
<div class="actions"><button type="button" class="fbtn" id="rfbCopy">Copiar mensaje</button>{('<a class="fbtn" style="text-decoration:none;display:inline-flex;align-items:center" href="'+wa('Hola Pilar, quiero reservar una cita.')+'" target="_blank" rel="noopener" data-evt="wa_click">Abrir WhatsApp</a>') if WAN else ''}<a class="fbtn" style="text-decoration:none;display:inline-flex;align-items:center" href="{DM}" target="_blank" rel="noopener" data-evt="dm_click">Abrir Instagram</a><button type="button" class="fbtn ghost" id="rfbBack">Volver al formulario</button></div>
<div class="fmsg" id="rfbOk" role="status" hidden></div></div>"""
    booking = f"""{header('home', 'Ver curso', L('form'), 'curso_click')}
<main id="main"><div class="wrap"><nav class="crumbs" aria-label="Ruta"><a href="{L('home')}">Inicio</a> › <span>Reservar cita</span></nav></div>
<section class="dark formsec" style="padding-top:36px"><div class="wrap formgrid">
<div class="side"><span class="eyebrow" style="color:var(--acad-muted)">Salón · Alcantarilla, Murcia</span><h1 style="margin:12px 0 16px;font-size:clamp(38px,5vw,64px)">Reserva tu cita <em>con Pilar.</em></h1>
<p>Elige el servicio, el día y una hora libre. Tu hora queda reservada al momento y, si te surge algo, puedes cancelarla tú mismo y la hora se libera.</p>
<ul><li>Horas libres en tiempo real</li><li>Un minuto, sin pagos</li><li>Cancela o cambia tu cita en línea</li></ul>
<div class="ctas" style="margin-top:20px">{wabtn('Prefiero escribir por WhatsApp')}<a class="pill" href="{L('svc')}">Ver servicios</a></div></div>
<div class="fcard">{bform}</div></div></section>
<section class="sec" id="preguntas"><div class="wrap" style="max-width:860px"><div class="sec-head"><span class="eyebrow">Preguntas</span><h2>Sobre tu <em>reserva.</em></h2></div>
{faq([('¿Mi cita queda confirmada al reservar?','Sí: la hora que eliges queda reservada al momento y nadie más puede cogerla. Recibes un código y un enlace para gestionarla.'),
('¿Cómo cancelo o cambio mi cita?','Con el enlace que ves al reservar (o el de tu código). Si cancelas con tiempo, la hora se libera al instante. Para cambiarla, cancela y reserva otra hora.'),
('¿Hasta cuándo puedo cancelar?','Hasta 4 horas antes de la cita. Después, escribe a Pilar directamente.'),
('¿Cuánto cuesta?','Depende del diseño. Pilar te da el precio antes o al empezar tu cita.'),
('¿Dónde está el salón?','En Alcantarilla, Murcia (España). Pilar te da la dirección exacta.'),
('¿También dan cursos?',f'Sí, formación presencial para empezar desde cero: <a href="{L("form")}">mira el curso</a>.')])}</div></section>
</main>
{footer()}"""
    t, d = 'Reservar cita de uñas en Alcantarilla | Catta Nails 29', 'Reserva tu hora de uñas con Pilar en Alcantarilla, Murcia: horas libres en tiempo real y cancelación en línea, sin llamadas.'
    out['book'] = page('book', t, d, booking, ld={"@context": "https://schema.org", "@graph": [crumb([('Inicio', '/'), ('Reservar cita', '/reservar')])]})

    bok = f"""{header('home', 'Ver curso', L('form'), 'curso_click')}
<main id="main"><div class="wrap center"><div id="okWrap"><svg class="tick" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26.5"/><path d="M16 29l8 8 16-17"/></svg><span class="eyebrow" id="okEye">Solicitud recibida</span><h1 style="margin-top:12px" id="okH">Listo. <em>Pilar te confirmará la hora.</em></h1>
<p id="okMsg">Tu solicitud de cita ya está con Pilar. Todavía no es una cita confirmada: ella te escribirá con la hora exacta.</p>
<p id="okDet" style="font-size:18px;font-weight:600" hidden></p>
<p id="okCode" style="font-size:15px;color:var(--muted)" hidden>Tu código: <b id="okCodeV"></b></p>
<div class="ctas" style="justify-content:center"><a class="pill solid glow" id="okManage" href="{L('manage')}" hidden>Cambiar o cancelar mi cita</a><a class="pill" id="okIcs" href="#" hidden>Añadir al calendario</a>{('<a class="pill wa" id="okWa" href="'+wa('Hola Pilar, acabo de reservar una cita en la web.')+'" target="_blank" rel="noopener" data-evt="wa_click">Escribir a Pilar por WhatsApp</a>') if WAN else ''}<a class="pill" href="{DM}" target="_blank" rel="noopener" data-evt="dm_click">Escribir por Instagram</a><a class="pill" href="{L('home')}">Volver al inicio</a></div></div></div></main>
{footer()}"""
    out['bookok'] = page('bookok', 'Reserva recibida | Catta Nails 29', 'Tu reserva de cita en Catta Nails 29: consulta la hora, añádela a tu calendario o cancélala.', bok, noindex=True)

    mng = f"""{header('home', 'Reservar cita')}
<main id="main"><div class="wrap center"><div id="mgWrap" style="max-width:560px">
<span class="eyebrow">Tu cita</span><h1 style="margin-top:12px" id="mgH">Cargando <em>tu cita…</em></h1>
<p id="mgMsg" role="status"></p>
<p id="mgDet" style="font-size:18px;font-weight:600" hidden></p>
<div class="ctas" style="justify-content:center;margin-top:18px">
<button type="button" class="pill solid" id="mgCancel" hidden>Cancelar mi cita</button>
<span id="mgConfirm" hidden style="display:none;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center"><span>¿Seguro que quieres cancelarla?</span><button type="button" class="pill solid" id="mgYes">Sí, cancelar</button><button type="button" class="pill" id="mgNo">No, mantenerla</button></span>
<a class="pill solid" id="mgBook" href="{L('book')}" hidden>Reservar otra hora</a>
{('<a class="pill wa" id="mgWa" href="'+wa('Hola Pilar, necesito cambiar mi cita.')+'" target="_blank" rel="noopener" data-evt="wa_click" hidden>Escribir a Pilar por WhatsApp</a>') if WAN else ''}
<a class="pill" id="mgIg" href="{DM}" target="_blank" rel="noopener" data-evt="dm_click" hidden>Escribir por Instagram</a></div></div></div></main>
{footer()}"""
    out['manage'] = page('manage', 'Gestionar mi cita | Catta Nails 29', 'Consulta, cancela o cambia tu cita en Catta Nails 29. Al cancelar, la hora queda libre para otra clienta.', mng, noindex=True)

    # ---------------- LEGAL ----------------
    P = lambda s: f'<span class="ph">[{s}]</span>'
    legal = f'''{header('home')}
<main id="main"><div class="wrap"><article class="legal">
<h1>Aviso legal, privacidad y cookies</h1>
<p class="draft"><b>Borrador pendiente de revisión legal.</b> Los textos marcados como <span class="ph">[DATO_REAL]</span> los completa el titular del negocio. Versión {POLICY_VERSION}.</p>
<h2 id="aviso-legal">Aviso legal</h2>
<p>En cumplimiento de la Ley 34/2002 (LSSI-CE), se informa de que este sitio web es titularidad de {P('NOMBRE_O_RAZON_SOCIAL')}, con NIF/CIF {P('NIF')}, domicilio en {P('DIRECCION_POSTAL')} y correo de contacto {P('CORREO_CONTACTO')}. Datos registrales, si aplican: {P('DATOS_REGISTRALES')}.</p>
<p>Los contenidos, textos e imágenes de este sitio pertenecen a sus titulares y no pueden reproducirse sin permiso.</p>
<h2 id="privacidad">Aviso de privacidad</h2>
<h3>Responsable del tratamiento</h3><p>{P('NOMBRE_O_RAZON_SOCIAL')} · NIF/CIF {P('NIF')} · {P('DIRECCION_POSTAL')} · {P('CORREO_PRIVACIDAD')}.</p>
<h3>Qué datos recogemos y para qué</h3>
<p>Con el formulario de cursos recogemos tu nombre y apellidos, teléfono, usuario de Instagram, tu objetivo, punto de partida, cuándo quieres empezar, si puedes asistir presencialmente y cómo ves la inversión. Con el formulario de reserva de citas recogemos tu nombre, teléfono, el servicio, el día y la franja que prefieres y, si lo escribes, una nota sobre el diseño. Los usamos para <b>gestionar tu solicitud de plaza o de cita y contactarte</b>. En el curso, además, usamos tus respuestas para priorizar a quién llamar primero (no se toman decisiones automatizadas sobre ti). Si marcas la casilla opcional, también para enviarte novedades y fechas de próximos cursos.</p>
<h3>Base legal</h3><p>Tu consentimiento (art. 6.1.a RGPD) y la aplicación de medidas precontractuales a petición tuya (art. 6.1.b). Puedes retirar tu consentimiento en cualquier momento escribiendo a {P('CORREO_PRIVACIDAD')}.</p>
<h3>Destinatarios</h3><p>Los datos se guardan en el servicio de alojamiento y formularios del sitio ({P('PROVEEDOR_HOSTING_Y_FORMULARIOS')}). Si decides escribir por Instagram o WhatsApp, ese mensaje lo gestiona Meta con su propia política. {P('TRANSFERENCIAS_INTERNACIONALES_SI_APLICA')}</p>
<h3>Conservación</h3><p>Conservamos tus datos durante {P('PLAZO_DE_CONSERVACION')} o hasta que retires tu consentimiento.</p>
<h3>Tus derechos</h3><p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a {P('CORREO_PRIVACIDAD')}. Si crees que no hemos tratado tus datos correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
<h2 id="cookies">Cookies</h2>
<p>Este sitio usa solo almacenamiento técnico en tu navegador: recuerda si prefieres el tema claro u oscuro y, si existe, tu elección sobre cookies. No usa cookies publicitarias. Si en el futuro se activa una herramienta de analítica, te pediremos permiso antes de cargarla, con los mismos botones para aceptar y rechazar.</p>
<p><a href="#cookies" id="prefCookies">Cambiar mis preferencias de cookies</a></p>
</article></div></main>
{footer()}'''
    t, d = 'Aviso legal, privacidad y cookies | Catta Nails 29', 'Aviso legal, aviso de privacidad (RGPD) y política de cookies de Catta Nails 29, salón de uñas y formación en Alcantarilla.'
    out['legal'] = page('legal', t, d, legal, ld=None)

    # ---------------- GRACIAS ----------------
    thanks = f'''{header('form')}
<main id="main"><div class="wrap center"><div><svg class="tick" viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="26.5"/><path d="M16 29l8 8 16-17"/></svg><span class="eyebrow">Solicitud recibida</span><h1 style="margin-top:12px">Gracias. <em>Pilar te contactará.</em></h1>
<p>Pilar revisará tu solicitud y te escribirá por teléfono o Instagram. Mientras tanto, puedes ver sus trabajos.</p>
<div class="ctas" style="justify-content:center"><a class="pill solid" href="{L('home')}">Volver al inicio</a><a class="pill" href="{IG}" target="_blank" rel="noopener">Ver Instagram</a></div></div></div></main>
{footer()}'''
    out['thanks'] = page('thanks', 'Solicitud recibida | Catta Nails 29', 'Gracias por tu solicitud. Pilar la revisará y te contactará.', thanks, noindex=True)
    # 404
    nf = f'''{header('home')}
<main id="main"><div class="wrap center"><div><span class="eyebrow">Error 404</span><h1 style="margin-top:12px">Esta página <em>no existe.</em></h1>
<p>Puede que el enlace haya cambiado. Elige a dónde quieres ir.</p>
<div class="ctas" style="justify-content:center"><a class="pill solid" href="{L('home')}">Ir al inicio</a><a class="pill" href="{L('form')}">Ver el curso</a><a class="pill" href="{L('svc')}">Uñas en Alcantarilla</a></div></div></div></main>
{footer()}'''
    out['404'] = page('thanks', 'Página no encontrada | Catta Nails 29', 'La página que buscas no existe. Vuelve al inicio, al curso o a los servicios del salón.', nf, noindex=True, canon=DOM + '/404')
    # PANEL DE ADMINISTRACIÓN
    acss = open(os.path.join(SRC, 'admin.css'), encoding='utf-8').read()
    ajs = open(os.path.join(SRC, 'admin.js'), encoding='utf-8').read()
    ademo = open(os.path.join(SRC, 'demo.js'), encoding='utf-8').read()
    fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=DM+Sans:wght@400;500;600;700&display=swap">'
    out['admin'] = ('<!doctype html>\n<html lang="es-ES"><head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
        f'<title>Panel · Catta Nails 29</title><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#560d2b">'
        f'<meta name="sb-url" content="{SB_URL}"><meta name="sb-key" content="{SB_KEY}"><meta name="site-url" content="{DOM}"><meta name="home-url" content="{L("home")}">' + fonts +
        (f'<style>{acss}</style>' if art else '<link rel="stylesheet" href="/admin.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml">') +
        '\n</head><body>\n' +
        '<div id="app"><p style="padding:24px">Cargando el panel…</p></div><div class="modal" id="modal" hidden role="dialog" aria-modal="true"></div><div class="toast" id="toast" role="status" aria-live="polite"></div>' +
        (f'<script>{ademo}</script><script>{ajs}</script>' if art else '<script src="/admin.js" defer></script>') + '\n</body></html>')
    return out

def write(base, files):
    for name, content in files.items():
        p = os.path.join(base, name); os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, 'w', encoding='utf-8').write(content)

if __name__ == '__main__':
    dist = os.path.join(ROOT, 'out', 'dist'); art = os.path.join(ROOT, 'out', 'art')
    for d in (dist, art):
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        shutil.copytree(os.path.join(ROOT, 'site', 'img'), os.path.join(d, 'img'))
    names = {'admin': 'admin.html', 'home': 'index.html', 'form': 'formacion.html', 'svc': 'unas-alcantarilla.html', 'legal': 'aviso-legal-privacidad.html', 'thanks': 'gracias.html', 'book': 'reservar.html', 'bookok': 'reserva-enviada.html', 'manage': 'mi-cita.html', '404': '404.html'}
    for mode, base in (('dist', dist), ('art', art)):
        pages = make(mode)
        write(base, {names[k]: v for k, v in pages.items()})
    # extras sólo para el paquete desplegable
    shutil.copy(os.path.join(ROOT, 'site', 'favicon.svg'), dist)
    open(os.path.join(dist, 'styles.css'), 'w').write('/* Catta Nails 29 */\n[hidden]{display:none!important}\n' + CSS)
    open(os.path.join(dist, 'app.js'), 'w').write(JS)
    shutil.copy(os.path.join(SRC, 'admin.js'), dist); shutil.copy(os.path.join(SRC, 'admin.css'), dist)
    print('ok', os.listdir(dist))
