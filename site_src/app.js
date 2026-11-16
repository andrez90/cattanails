/* Catta Nails 29 · comportamiento compartido. Sin librerías. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var meta=function(n){var m=$('meta[name="'+n+'"]');return m?m.content:''};
var IMGB=meta('img-base')||'img/';
var DM='https://ig.me/m/catta_nails29';
var root=document.documentElement;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function img(n,w,h,alt,extra){return '<img src="'+IMGB+n+'.webp" width="'+w+'" height="'+h+'" alt="'+alt+'" '+(extra||'')+'>'}

/* tema */
try{var t=localStorage.getItem('catta-theme');if(t)root.setAttribute('data-theme',t)}catch(e){}
var tb=$('#theme');
if(tb)tb.addEventListener('click',function(){
  var dark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);
  var n=dark?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('catta-theme',n)}catch(e){}
});

/* barra de progreso de lectura */
var prog=$('#prog');
function onScroll(){
  if(prog){var h=document.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')'}
  reelReq();
}

/* aparición suave: solo para lo que está bajo el pliegue; si falla JS, todo queda visible */
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('rv-in');e.target.classList.remove('rv-pre');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
  /* revelado suave para secciones que aún no tenían animación (mismo observador, solo transform/opacity) */
  var extra=$$('.sec-head,.three>.box,.svc3>.box,.steps>li,.fgrid,details,.fcard,.formgrid>.side,.ctaband,.sumline');
  var seen=new Map();
  extra.forEach(function(el){if(el.classList.contains('rv')||(el.parentNode.closest&&el.parentNode.closest('.rv')))return;
    var n=(seen.get(el.parentNode)||0);seen.set(el.parentNode,n+1);el.style.transitionDelay=Math.min(n,5)*70+'ms';el.classList.add('rv')});
  $$('.rv').forEach(function(el){if(el.getBoundingClientRect().top>innerHeight*0.95){el.classList.add('rv-pre');io.observe(el)}});
}

/* ---------- escena de trabajos (inicio) ---------- */
var SETS=[['n3',560,631,'Uñas rojas con detalle dorado'],['n2',560,631,'French con mariposa pintada a mano'],['n5',560,435,'Manicura nude natural'],['n4',560,631,'French con flor verde'],['n6',560,447,'Flor pintada sobre fondo vino'],['n1',560,607,'French rojo con flor y pedrería']];
var LBL=['Rojo con detalles','French con mariposa','Nude natural','French con flor verde','Flor sobre vino','French con flor roja'];
var reel=$('.reel'),rcs=[],reelReq=function(){};
if(reel){
  var rs=$('#reelStage'),copy=$('#reelCopy'),rhead=$('#reelHead'),hint=$('#reelHint');
  rs.innerHTML=SETS.map(function(s,i){return '<figure class="rc">'+img(s[0],s[1],s[2],s[3])+'<small>'+LBL[i]+'</small></figure>'}).join('');
  rcs=$$('.rc');var N=rcs.length;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var ease=function(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2};
  if(reduce)reel.classList.add('static');
  var ticking=false;
  var frame=function(){
    ticking=false;if(reel.classList.contains('static'))return;
    var sticky=reel.firstElementChild,total=reel.offsetHeight-sticky.offsetHeight;
    var p=clamp(-reel.getBoundingClientRect().top+(parseFloat(getComputedStyle(sticky).top)||0),0,total)/total;
    var W=rs.clientWidth,H=rs.clientHeight,narrow=W<760;
    var cw=clamp(narrow?W*.52:W*.2,150,270);rs.style.setProperty('--cw',cw+'px');
    var A=.72,a=clamp(p/A,0,1),b=ease(clamp((p-A)/(1-A),0,1));
    var tt=ease(a)*(N-1);var gap=cw*(narrow?.82:1.08);
    rcs.forEach(function(c,i){
      var d=i-tt,ad=Math.abs(d);
      var x=d*gap*(1+b*.9),ry=clamp(-d*40,-68,68),z=-ad*150,y=ad*6,s=1-Math.min(ad,2.5)*.05,o=clamp(1-Math.max(0,ad-2.1)*.55,0,1)*(1-(i===N-1?0:b));
      if(i===N-1){x=d*gap*(1+b*.9)+(narrow?0:-W*.17*b);ry=ry*(1-b);z=z+b*90;s=s+b*(narrow?.02:.3);y=y-(narrow?H*.21*b:0);o=1}
      c.style.transform='translate(-50%,-50%) translate3d('+x+'px,'+y+'px,'+z+'px) rotateY('+ry+'deg) scale('+s+')';
      c.style.opacity=o;c.style.zIndex=String(100-Math.round(ad*10));
    });
    copy.style.opacity=b;copy.style.transform=narrow?'translateY('+((1-b)*24)+'px)':'translateY(calc(-50% + '+((1-b)*24)+'px))';
    copy.style.pointerEvents=b>.6?'auto':'none';
    rhead.style.opacity=1-b*.85;rhead.style.transform='translateY('+(-b*14)+'px)';
    hint.style.opacity=p>.02?0:1;
  };
  reelReq=function(){if(!ticking){ticking=true;requestAnimationFrame(frame)}};
  addEventListener('resize',reelReq);frame();
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- polaroids (inicio) ---------- */
var line=$('#line');
if(line){
  var P=[['p1','Mi inicio','De Colombia a España, sin tener nada.'],['p2','Mi trayectoria','Hasta abrir su propio salón en Alcantarilla.'],['p3','Mi carrera','Hoy forma a mujeres para que vivan de las uñas.']];
  var ROT=[-2.4,1.6,-1.4];
  line.innerHTML=P.map(function(p,i){return '<button type="button" class="pol" data-i="'+i+'" style="transform:rotate('+ROT[i]+'deg)" aria-label="Ver foto: '+p[1]+'">'+img(p[0],560,633,p[1],'loading="lazy"')+'<em>'+p[1]+'</em></button>'}).join('');
  var modal=$('#modal');
  line.addEventListener('click',function(e){var b=e.target.closest('.pol');if(!b)return;var p=P[+b.dataset.i];
    modal.innerHTML='<div class="box">'+img(p[0],560,633,p[1])+'<div class="txt"><button type="button" class="x" aria-label="Cerrar">✕</button><span class="eyebrow">Pilar · Catta Nails</span><h3>'+p[1]+'</h3><p style="color:var(--muted);margin:0">'+p[2]+'</p><a class="pill solid" style="justify-self:start" href="'+meta('formacion-url')+'">Quiero aprender con Pilar</a></div></div>';
    modal.hidden=false;modal.querySelector('.x').focus()});
  modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('.x'))modal.hidden=true});
  addEventListener('keydown',function(e){if(e.key==='Escape')modal.hidden=true});
}

/* ---------- tarjetas flotantes ---------- */
var fl=$('#floaters');
if(fl){
  var FL=[{x:'4%',y:'8%',r:-8,k:'n1',h:607,n:'French y flor'},{x:'6%',y:'58%',r:6,k:'n4',h:631,n:'Detalle verde'},{x:'80%',y:'4%',r:7,k:'n2',h:631,n:'Mariposa'},{x:'78%',y:'56%',r:-6,k:'n3',h:631,n:'Rojo glossy'}];
  fl.innerHTML=FL.map(function(f,i){return '<div class="fl" data-d="'+((i%2?-1:1)*(14+i*5))+'" style="left:'+f.x+';top:'+f.y+';transform:rotate('+f.r+'deg);--r2:'+(f.r+2)+'deg;animation-delay:'+(i*-1.4)+'s">'+img(f.k,560,f.h,f.n,'loading="lazy"')+'<span>'+f.n+'</span></div>'}).join('');
  if(!reduce)addEventListener('scroll',function(){var s=$('.learn').getBoundingClientRect();var k=s.top/innerHeight;$$('.fl').forEach(function(f){f.style.translate='0 '+(k*(+f.dataset.d)*2)+'px'})},{passive:true});
}

/* ---------- formulario de cursos ---------- */
var f=$('#cursoForm');
if(f){
  var t0=Date.now(),started=false,step=1;
  var s1=$('[data-step="1"]',f),s2=$('[data-step="2"]',f),bar=$('#pbar'),plab=$('#plabel');
  var RADIOS=['objetivo','experiencia','inicio','presencial','inversion'];
  function radioOk(n){return !!$('input[name="'+n+'"]:checked',f)}
  var RULES={
    nombre:function(v){v=v.trim();return v.length<5||v.indexOf(' ')<0?'Escribe tu nombre y apellidos.':''},
    telefono:function(v){return /^\+?[0-9 ()\-]{9,18}$/.test(v.trim())?'':'Escribe un teléfono válido, con prefijo si no es de España (ej. +34 600 000 000).'},
    instagram:function(v){return /^@?[A-Za-z0-9._]{2,30}$/.test(v.trim())?'':'Escribe tu usuario de Instagram, por ejemplo @tunombre.'},
    email:function(v){return !v.trim()||/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())?'':'Revisa el correo: parece incompleto.'},
    objetivo:function(){return radioOk('objetivo')?'':'Elige una opción.'},
    experiencia:function(){return radioOk('experiencia')?'':'Cuéntanos tu punto de partida.'},
    inicio:function(){return radioOk('inicio')?'':'Elige una opción.'},
    presencial:function(){return radioOk('presencial')?'':'Elige una opción.'},
    inversion:function(){return radioOk('inversion')?'':'Elige una opción.'},
    consentimiento:function(){return $('#consentimiento').checked?'':'Necesitamos tu permiso para poder contactarte.'}
  };
  function val(n){var el=f.elements[n];if(!el)return '';if(el.tagName==='SELECT'||el.tagName==='INPUT'||el.tagName==='TEXTAREA')return el.type==='radio'?'':el.value;return ''}
  function setErr(n,m){
    var e=$('#e-'+n);if(e)e.textContent=m;
    var el=RADIOS.indexOf(n)>=0?$('input[name="'+n+'"]',f):f.elements[n];
    if(el)(el.length&&!el.tagName?[].slice.call(el):[el]).forEach(function(x){if(m)x.setAttribute('aria-invalid','true');else x.removeAttribute('aria-invalid')});
    return m
  }
  function check(names){
    var first=null;
    names.forEach(function(n){var m=setErr(n,RULES[n](val(n)));if(m&&!first)first=n});
    if(first){var el=RADIOS.indexOf(first)>=0?$('input[name="'+first+'"]',f):f.elements[first];if(el)el.focus();var sm=$('#summary');sm.hidden=false;sm.className='fmsg bad';sm.textContent='Revisa los campos marcados: algo falta o tiene un error.'}
    else $('#summary').hidden=true;
    return !first
  }
  /* los errores aparecen al salir del campo y se quitan al escribir (nunca al salir, para que el botón no se mueva antes del clic) */
  ['nombre','telefono','instagram'].forEach(function(n){var el=f.elements[n];if(!el)return;
    el.addEventListener('blur',function(){if(el.value){var m=RULES[n](el.value);if(m)setErr(n,m)}});
    var clear=function(){if(el.getAttribute('aria-invalid')&&!RULES[n](el.value))setErr(n,'')};
    el.addEventListener('input',clear);el.addEventListener('change',clear)});
  f.addEventListener('change',function(e){var t=e.target;
    if(RADIOS.indexOf(t.name)>=0)setErr(t.name,'');
    if(t.id==='consentimiento'&&t.checked)setErr('consentimiento','')});
  f.addEventListener('focusin',function(){if(!started){started=true;track('form_start')}});
  function go(n){
    step=n;s1.hidden=n!==1;s2.hidden=n!==2;
    bar.style.transform='scaleX('+(n===1?.5:1)+')';plab.textContent='Paso '+n+' de 2';
    var first=n===1?f.elements.nombre:$('input[name="objetivo"]',f);if(first)first.focus({preventScroll:false});
  }
  $('#next').addEventListener('click',function(){if(check(['nombre','telefono','instagram']))go(2)});
  $('#back').addEventListener('click',function(){go(1)});
  function pick(n){var x=$('input[name="'+n+'"]:checked',f);return x?x.value:''}
  function interes(){
    var sc=0,i=pick('inicio'),p=pick('presencial'),v=pick('inversion'),o=pick('objetivo');
    sc+=i==='Lo antes posible'?2:i==='En 1 a 3 meses'?1:0;
    sc+=p==='Sí, sin problema'?2:p==='Vivo lejos, pero me organizo'?1:0;
    sc+=v==='Tengo presupuesto para empezar'?2:v==='Depende del precio'?1:0;
    sc+=(o==='Trabajar en un salón'||o==='Montar mi propio negocio')?1:0;
    if(p==='No puedo desplazarme')return 'bajo';
    return sc>=5?'alto':sc>=3?'medio':'bajo'
  }
  function summaryText(){
    var ig=f.elements.instagram.value.trim();if(ig&&ig.charAt(0)!=='@')ig='@'+ig;
    return ['Hola Pilar, quiero solicitar plaza en el curso: Inicio en el mundo de las uñas.','Nombre: '+f.elements.nombre.value.trim(),'Teléfono: '+f.elements.telefono.value.trim(),'Instagram: '+ig,
      'Quiero aprender para: '+pick('objetivo'),'Punto de partida: '+pick('experiencia'),'Empezar: '+pick('inicio'),'Presencial en Alcantarilla: '+pick('presencial'),'Inversión: '+pick('inversion')].join('\n')
  }
  function fallback(){
    f.hidden=true;var fb=$('#fallback');fb.hidden=false;$('#fbText').value=summaryText();
    var hd=$('#fbHead');if(hd)hd.focus();
  }
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(step===1){if(check(['nombre','telefono','instagram']))go(2);return}
    if(!check(['nombre','telefono','instagram'].concat(RADIOS,['consentimiento'])))return;
    var thanks=f.getAttribute('data-thanks');
    var bot=f.elements['bot-field'].value||(Date.now()-t0<3500);
    if(bot){location.href=thanks;return}
    var btn=$('#send');btn.disabled=true;btn.textContent='Enviando…';
    var fd=new FormData(f);
    fd.set('form-name','curso');
    fd.set('texto_consentimiento',$('#consentimiento').closest('label').textContent.replace(/\s+/g,' ').trim());
    fd.set('politica_version',f.getAttribute('data-policy'));
    fd.set('interes_estimado',interes());
    fd.set('pagina_origen',location.pathname);
    fd.set('fecha_cliente',new Date().toISOString());
    var ig=f.elements.instagram.value.trim();fd.set('instagram',ig.charAt(0)==='@'?ig:'@'+ig);
    var body=new URLSearchParams();fd.forEach(function(v,k){body.append(k,v)});
    var ctl='AbortController' in window?new AbortController():null;var to=setTimeout(function(){ctl&&ctl.abort()},12000);
    fetch(f.getAttribute('data-post')||'/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString(),signal:ctl?ctl.signal:undefined})
      .then(function(r){clearTimeout(to);if(!r.ok)throw new Error('http '+r.status);track('form_submit');location.href=thanks})
      .catch(function(){clearTimeout(to);btn.disabled=false;btn.textContent='Enviar mi solicitud';fallback()});
  });
  var cp=$('#fbCopy');
  if(cp)cp.addEventListener('click',function(){
    var ta=$('#fbText'),ok=$('#fbOk');
    function done(m){ok.hidden=false;ok.textContent=m}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){done('Copiado. Pega el mensaje en el chat con Pilar.')},function(){ta.select();done('Selecciona el texto y cópialo con Ctrl+C o mantén pulsado en el móvil.')})}
    else{ta.select();done('Selecciona el texto y cópialo con Ctrl+C o mantén pulsado en el móvil.')}
  });
  var again=$('#fbBack');if(again)again.addEventListener('click',function(){$('#fallback').hidden=true;f.hidden=false;go(2)});
}

/* ---------- reservas del salón (Baltium Agenda en Supabase: horas libres, reservar y cancelar) ---------- */
var SBU=meta('sb-url'),SBK=meta('sb-key');
function rpc(name,body){
  if(window.__demoRpc)return window.__demoRpc(name,body);
  var ctl='AbortController' in window?new AbortController():null;var to=setTimeout(function(){ctl&&ctl.abort()},10000);
  return fetch(SBU+'/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json',apikey:SBK,Authorization:'Bearer '+SBK},body:JSON.stringify(body||{}),signal:ctl?ctl.signal:undefined})
    .then(function(r){clearTimeout(to);if(!r.ok)throw new Error('http '+r.status);return r.json()},function(e){clearTimeout(to);throw e})
}
function fmtDay(iso){var p=iso.split('-');var d=new Date(+p[0],+p[1]-1,+p[2]);var t=d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});return t.charAt(0).toUpperCase()+t.slice(1)}
function hashParams(){var o={};location.hash.replace(/^#/,'').split('&').forEach(function(x){var k=x.split('=');if(k[0])o[k[0]]=decodeURIComponent(k[1]||'')});return o}
function icsHref(title,date,time,mins){
  var s=date.replace(/-/g,'')+'T'+time.replace(':','')+'00';var d=new Date(+date.slice(0,4),+date.slice(5,7)-1,+date.slice(8,10),+time.slice(0,2),+time.slice(3,5)+mins);
  var e=''+d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'T'+('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2)+'00';
  var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Catta Nails 29//ES','BEGIN:VEVENT','UID:'+s+'@cattanails','DTSTAMP:'+s,'DTSTART;TZID=Europe/Madrid:'+s,'DTEND;TZID=Europe/Madrid:'+e,'SUMMARY:'+title,'LOCATION:Alcantarilla\\, Murcia','END:VEVENT','END:VCALENDAR'].join('\r\n');
  return 'data:text/calendar;charset=utf-8,'+encodeURIComponent(ics)
}
/* ---------- galería del salón: filtro por estilo ---------- */
var gf=$('.gfil'),gl=$('#gal');
if(gf&&gl)gf.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var f=b.getAttribute('data-f'),n=0;
  $$('button',gf).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  $$('figure',gl).forEach(function(g){var on=f==='todo'||(' '+g.getAttribute('data-c')+' ').indexOf(' '+f+' ')>=0;g.hidden=!on;if(on)n++});
  var em=$('#galEmpty');if(em)em.hidden=n>0});
/* ---------- comunidad: compartir el curso y lista de próximas fechas ---------- */
var sb=$('#shareBtn');
if(sb)sb.addEventListener('click',function(){var u=location.href.split('#')[0],ok=$('#shareOk'),t=sb.getAttribute('data-text');
  if(navigator.share){navigator.share({title:document.title,text:t,url:u}).catch(function(){})}
  else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t+': '+u).then(function(){ok.textContent='Enlace copiado. Pégalo en WhatsApp.'},function(){ok.textContent='Copia este enlace: '+u})}
  else ok.textContent='Copia este enlace: '+u;
  track('compartir_curso')});
var lf=$('#listaForm');
if(lf){var lt0=Date.now();
  var LR={lnombre:function(v){return v.trim().length<2?'Escribe tu nombre.':''},lcontacto:function(v){v=v.trim();return (/^\+?[0-9 ()\-]{9,18}$/.test(v)||/^@?[A-Za-z0-9._]{2,30}$/.test(v))?'':'Escribe un teléfono o tu Instagram con @.'},lconsent:function(){return $('#lconsent').checked?'':'Necesitamos tu permiso para avisarte.'}};
  lf.addEventListener('submit',function(ev){ev.preventDefault();var bad=null;
    ['lnombre','lcontacto','lconsent'].forEach(function(n){var el=$('#'+n),m=LR[n](el.value||'');$('#e-'+n).textContent=m;if(m){el.setAttribute('aria-invalid','true');if(!bad)bad=el}else el.removeAttribute('aria-invalid')});
    if(bad){bad.focus();return}
    var msg=$('#lmsg'),btn=$('#lsend');
    function done(){lf.querySelectorAll('.field,.actions').forEach(function(x){x.hidden=true});msg.hidden=false;msg.className='fmsg';msg.textContent='Listo, '+$('#lnombre').value.trim()+'. Pilar te avisará cuando abra plazas. Mientras tanto, síguela en Instagram.';track('lista_submit')}
    if(lf.elements['bot-field'].value||Date.now()-lt0<2500){done();return}
    btn.disabled=true;btn.textContent='Enviando…';
    if(window.__demoRpc){setTimeout(done,300);return}
    var fd=new FormData(lf);fd.set('politica_version',lf.getAttribute('data-policy'));fd.set('texto_consentimiento',$('#lconsent').closest('label').textContent.replace(/\s+/g,' ').trim());fd.set('fecha_cliente',new Date().toISOString());
    var body=new URLSearchParams();fd.forEach(function(v,k){body.append(k,v)});
    fetch(lf.getAttribute('data-post')||'/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()}).then(function(r){if(!r.ok)throw 0;done()}).catch(function(){btn.disabled=false;btn.textContent='Avisadme';msg.hidden=false;msg.className='fmsg bad';msg.textContent='No pudimos apuntarte desde aquí. Escríbele a Pilar por Instagram (@catta_nails29) y dile que quieres saber las próximas fechas.'})
  })}
var rf=$('#reservaForm');
if(rf){
  var rt0=Date.now(),rstarted=false,rstep=1,live=false,SVC={},reqId=0;
  var rs1=$('[data-rstep="1"]',rf),rs2=$('[data-rstep="2"]',rf),rbar=$('#rpbar'),rplab=$('#rplabel');
  function pad(n){return (n<10?'0':'')+n}
  function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  var today=new Date(),maxd=new Date();maxd.setDate(maxd.getDate()+60);
  var fe=rf.elements.fecha;if(fe){fe.min=iso(today);fe.max=iso(maxd)}
  function rpick(n){var x=$('input[name="'+n+'"]:checked',rf);return x?x.value:''}
  function setLive(on){live=on;$('#horaBox').hidden=!on;$('#franjaBox').hidden=on}
  /* servicios y duraciones desde la agenda; si no hay conexión, se pide solo la franja */
  setLive(false);
  rpc('catta_services').then(function(list){
    if(!list||!list.length)throw new Error('empty');
    list.forEach(function(s){SVC[s.name]=s});
    $$('input[name="servicio"]',rf).forEach(function(r){var s=SVC[r.value];if(s){var l=r.parentNode;l.appendChild(document.createTextNode(' · '+s.duration+' min'))}});
    setLive(true);loadSlots()
  }).catch(function(){setLive(false)});
  function shortDay(d,i){if(i===0)return 'Hoy';if(i===1)return 'Mañana';var t=d.toLocaleDateString('es-ES',{weekday:'short',day:'numeric'}).replace('.','');return t.charAt(0).toUpperCase()+t.slice(1)}
  /* días rápidos: evita abrir el calendario para lo más habitual */
  var dc=$('#dayChips');
  if(dc&&fe){var hh='';for(var di=0;di<7;di++){var dd=new Date(today.getFullYear(),today.getMonth(),today.getDate()+di);if(dd.getDay()===0)continue;hh+='<button type="button" data-d="'+iso(dd)+'" aria-pressed="false">'+shortDay(dd,di)+'</button>'}
    dc.innerHTML=hh;
    dc.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;fe.value=b.getAttribute('data-d');rerr('fecha','');markDay();loadSlots();upWa()})}
  function markDay(){if(dc)$$('button',dc).forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-d')===fe.value?'true':'false')})}
  /* si el día está lleno, propone las próximas horas libres para no perder la reserva */
  function findNext(sv,d,id){
    var nf=$('#nextFree');if(!nf)return;var p=d.split('-'),base=new Date(+p[0],+p[1]-1,+p[2]),days=[];
    for(var k=1;k<=10;k++){var x=new Date(base.getFullYear(),base.getMonth(),base.getDate()+k);if(x<=maxd)days.push(iso(x))}
    nf.hidden=false;nf.innerHTML='<span class="hint-s">Buscando las próximas horas libres…</span>';
    Promise.all(days.map(function(x){return rpc('catta_slots',{p_service:sv.id,p_date:x}).then(function(h){return {d:x,h:h||[]}},function(){return {d:x,h:[]}})})).then(function(res){
      if(id!==reqId)return;var out=[];res.forEach(function(r){if(out.length<4&&r.h.length)out.push(r)});
      if(!out.length){nf.innerHTML='<span class="hint-s">No vemos horas libres en los próximos días. Escríbele a Pilar con el enlace de abajo y te busca hueco.</span>';return}
      nf.innerHTML='<span class="hint-s">Próximas horas libres:</span><div class="days">'+out.map(function(r){return '<button type="button" data-d="'+r.d+'" data-h="'+r.h[0]+'">'+fmtDay(r.d).replace(/ de \w+$/,'')+' · '+r.h[0]+'</button>'}).join('')+'</div>'
    })
  }
  var nfb=$('#nextFree');if(nfb)nfb.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;fe.value=b.getAttribute('data-d');markDay();loadSlots(b.getAttribute('data-h'));upWa()});
  /* salida por WhatsApp con lo ya elegido */
  function upWa(){var w=$('#waAlt');if(!w||!w.getAttribute('data-wa'))return;var m='Hola Pilar, quiero reservar una cita y no encuentro hora en la web.';if(rpick('servicio'))m+=' Servicio: '+rpick('servicio')+'.';if(fe.value)m+=' Día que me viene bien: '+fmtDay(fe.value)+'.';var n=rf.elements.nota.value.trim();if(n)m+=' Diseño: '+n+'.';w.href='https://wa.me/'+w.getAttribute('data-wa')+'?text='+encodeURIComponent(m)}
  /* llega desde la galería con un diseño elegido */
  var hp0=hashParams();if(hp0.d){rf.elements.nota.value='Diseño de la web: '+hp0.d.slice(0,80);var rd=$('input[name="servicio"][value="Uñas con diseño"]',rf);if(rd)rd.checked=true;
    var sd=$('.side p');if(sd){var tg=document.createElement('p');tg.className='picked';tg.textContent='Diseño elegido: '+hp0.d.slice(0,80);sd.parentNode.insertBefore(tg,sd.nextSibling)}}
  function loadSlots(pre){
    var nf0=$('#nextFree');if(nf0){nf0.hidden=true;nf0.innerHTML=''}
    if(!live)return;
    var box=$('#slots'),sv=SVC[rpick('servicio')],d=fe.value,id=++reqId;
    $('#rhora').value='';
    if(!sv||!d){box.innerHTML='<span class="hint-s" id="slotsMsg">Elige servicio y día para ver las horas libres.</span>';return}
    if(RR.fecha()){box.innerHTML='<span class="hint-s">'+RR.fecha()+'</span>';return}
    box.innerHTML='<span class="hint-s">Buscando horas libres…</span>';
    rpc('catta_slots',{p_service:sv.id,p_date:d}).then(function(h){
      if(id!==reqId)return;
      if(!h.length){box.innerHTML='<span class="hint-s">No quedan horas libres ese día.</span>';findNext(sv,d,id);return}
      box.innerHTML=h.map(function(t){return '<label><input type="radio" name="hora" value="'+t+'"'+(t===pre?' checked':'')+'> '+t+'</label>'}).join('')
    }).catch(function(){if(id===reqId){setLive(false)}})
  }
  var RR={
    servicio:function(){return rpick('servicio')?'':'Elige un servicio.'},
    fecha:function(){var v=fe.value;if(!v)return 'Elige un día.';if(v<iso(today))return 'Elige un día a partir de hoy.';if(v>iso(maxd))return 'Elige un día dentro de los próximos 60 días.';return ''},
    hora:function(){return rpick('hora')?'':'Elige una hora libre.'},
    franja:function(){return rpick('franja')?'':'Elige una franja.'},
    nombre:function(v){return v.trim().length<2?'Escribe tu nombre.':''},
    telefono:function(v){return /^\+?[0-9 ()\-]{9,18}$/.test(v.trim())?'':'Escribe un teléfono válido, con prefijo si no es de España (ej. +34 600 000 000).'},
    consentimiento:function(){return $('#rconsentimiento').checked?'':'Necesitamos tu permiso para poder contactarte.'}
  };
  var RRAD=['servicio','franja','hora'];
  function rid(n){return n==='nombre'||n==='telefono'||n==='consentimiento'?'r'+n:n}
  function rval(n){var el=rf.elements[n];return el&&el.value!==undefined&&!el.length?el.value:''}
  function rerr(n,m){
    var e=$('#e-'+rid(n));if(e)e.textContent=m;
    var el=RRAD.indexOf(n)>=0?$('input[name="'+n+'"]',rf):$('#'+rid(n));
    if(el){if(m)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid')}
    return m
  }
  function rcheck(names){
    var first=null;
    names.forEach(function(n){var m=rerr(n,RR[n](rval(n)));if(m&&!first)first=n});
    var sm=$('#rsummary');
    if(first){var el=RRAD.indexOf(first)>=0?$('input[name="'+first+'"]',rf):$('#'+rid(first));if(el)el.focus();sm.hidden=false;sm.textContent='Revisa los campos marcados: algo falta o tiene un error.'}
    else sm.hidden=true;
    return !first
  }
  ['telefono','nombre'].forEach(function(n){var el=$('#'+rid(n));if(!el)return;
    el.addEventListener('blur',function(){if(el.value){var m=RR[n](el.value);if(m)rerr(n,m)}});
    el.addEventListener('input',function(){if(el.getAttribute('aria-invalid')&&!RR[n](el.value))rerr(n,'')})});
  if(fe)fe.addEventListener('change',function(){if(!RR.fecha())rerr('fecha','');markDay();loadSlots();upWa()});
  rf.addEventListener('change',function(e){if(e.target.name==='servicio')upWa()});rf.elements.nota.addEventListener('input',upWa);
  rf.addEventListener('change',function(e){var t=e.target;if(RRAD.indexOf(t.name)>=0)rerr(t.name,'');if(t.name==='servicio')loadSlots();if(t.id==='rconsentimiento'&&t.checked)rerr('consentimiento','')});
  rf.addEventListener('focusin',function(){if(!rstarted){rstarted=true;track('reserva_start')}});
  function s1names(){return ['servicio','fecha',live?'hora':'franja']}
  function rgo(n){rstep=n;rs1.hidden=n!==1;rs2.hidden=n!==2;rbar.style.transform='scaleX('+(n===1?.5:1)+')';rplab.textContent='Paso '+n+' de 2';
    if(n===2)$('#rsum').textContent=rpick('servicio')+' · '+fmtDay(fe.value)+(live?' · '+rpick('hora'):' · '+rpick('franja'));
    var first=n===1?$('input[name="servicio"]',rf):$('#rnombre');if(first)first.focus()}
  $('#rnext').addEventListener('click',function(){if(rcheck(s1names()))rgo(2)});
  $('#rback').addEventListener('click',function(){rgo(1)});
  function fdate(v){var p=v.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
  function rsummary(code){
    var L=['Hola Pilar, quiero reservar una cita.'+(code?' Código: '+code:''),'Servicio: '+rpick('servicio'),'Día: '+fdate(fe.value),live?'Hora: '+rpick('hora'):'Franja: '+rpick('franja'),'Nombre: '+rval('nombre').trim(),'Teléfono: '+rval('telefono').trim()];
    if(rf.elements.nota.value.trim())L.push('Diseño: '+rf.elements.nota.value.trim());
    return L.join('\n')
  }
  function newCode(){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='CN-';var r=new Uint8Array(4);(window.crypto||{getRandomValues:function(x){for(var i=0;i<x.length;i++)x[i]=Math.random()*256}}).getRandomValues(r);for(var i=0;i<4;i++)o+=a.charAt(r[i]%a.length);return o}
  function fail(code){var btn=$('#rsend');btn.disabled=false;btn.textContent=live?'Reservar mi hora':'Pedir mi cita';rf.hidden=true;var fb=$('#rfallback');fb.hidden=false;$('#rfbText').value=rsummary(code);var hd=$('#rfbHead');if(hd)hd.focus()}
  var ERR={slot_unavailable:'Esa hora acaba de ocuparse. Elige otra, por favor.',too_many:'Has hecho demasiados intentos. Prueba más tarde o escribe a Pilar.',limit_active:'Ya tienes 2 citas pendientes. Cancela una o escribe a Pilar si necesitas más.',bad_phone:'Revisa el teléfono.',bad_name:'Revisa tu nombre.',no_consent:'Necesitamos tu permiso para poder reservar.',closed:'Las reservas en línea están cerradas ahora mismo.',bad_service:'Elige un servicio.',bad_input:'Revisa el día y la hora.'};
  function netlify(extra){
    var fd=new FormData(rf);fd.set('form-name','reserva');
    fd.set('texto_consentimiento',$('#rconsentimiento').closest('label').textContent.replace(/\s+/g,' ').trim());
    fd.set('politica_version',rf.getAttribute('data-policy'));fd.set('pagina_origen',location.pathname);fd.set('fecha_cliente',new Date().toISOString());
    for(var k in extra)fd.set(k,extra[k]);
    var body=new URLSearchParams();fd.forEach(function(v,k){body.append(k,v)});
    var ctl='AbortController' in window?new AbortController():null;var to=setTimeout(function(){ctl&&ctl.abort()},12000);
    return fetch(rf.getAttribute('data-post')||'/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString(),signal:ctl?ctl.signal:undefined}).then(function(r){clearTimeout(to);if(!r.ok)throw new Error('http '+r.status)})
  }
  rf.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(rstep===1){if(rcheck(s1names()))rgo(2);return}
    if(!rcheck(s1names().concat(['nombre','telefono','consentimiento'])))return;
    var thanks=rf.getAttribute('data-thanks');
    var bot=rf.elements['bot-field'].value||(Date.now()-rt0<3500);
    if(bot){location.href=thanks;return}
    var btn=$('#rsend');btn.disabled=true;btn.textContent='Reservando…';
    if(live){
      var sv=SVC[rpick('servicio')],hora=rpick('hora');
      rpc('catta_book',{p:{service_id:sv.id,date:fe.value,time:hora,name:rval('nombre').trim(),phone:rval('telefono').trim(),consent:true,note:rf.elements.nota.value,first_time:rpick('cliente'),
        policy_version:rf.getAttribute('data-policy'),consent_text:$('#rconsentimiento').closest('label').textContent.replace(/\s+/g,' ').trim()}})
      .then(function(r){
        if(!r.ok){btn.disabled=false;btn.textContent='Reservar mi hora';
          var sm=$('#rsummary');sm.hidden=false;sm.textContent=ERR[r.error]||'No pudimos completar la reserva. Inténtalo de nuevo o escribe a Pilar.';
          if(r.error==='slot_unavailable'||r.error==='bad_input'){rgo(1);loadSlots()}
          return}
        track('reserva_submit');
        $('#rcodigo').value=r.code;$('#rhora').value=r.date+' '+r.time;
        var go=function(){location.href=thanks+'#c='+encodeURIComponent(r.code)+'&t='+encodeURIComponent(r.token)};
        /* aviso a Pilar por correo (Netlify Forms); si falla, la cita ya está en la agenda */
        Promise.race([netlify({codigo:r.code,hora_reservada:r.date+' '+r.time,servicio:r.service}).catch(function(){}),new Promise(function(x){setTimeout(x,2500)})]).then(go)
      }).catch(function(){fail(null)});
    }else{
      var code=newCode();$('#rcodigo').value=code;
      netlify({}).then(function(){track('reserva_submit');location.href=thanks+'?c='+encodeURIComponent(code)}).catch(function(){fail(code)})
    }
  });
  var rcp=$('#rfbCopy');
  if(rcp)rcp.addEventListener('click',function(){
    var ta=$('#rfbText'),ok=$('#rfbOk');
    function done(m){ok.hidden=false;ok.textContent=m}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(function(){done('Copiado. Pega el mensaje en el chat con Pilar.')},function(){ta.select();done('Selecciona el texto y cópialo con Ctrl+C o mantén pulsado en el móvil.')})}
    else{ta.select();done('Selecciona el texto y cópialo con Ctrl+C o mantén pulsado en el móvil.')}
  });
  var rag=$('#rfbBack');if(rag)rag.addEventListener('click',function(){$('#rfallback').hidden=true;rf.hidden=false;rgo(2)});
}

/* ---------- página de reserva enviada ---------- */
var okc=$('#okCode');
if(okc){
  var hp=hashParams(),mm=/[?&]c=(CN-[A-Z0-9]{4})/.exec(location.search),code=hp.c||(mm&&mm[1]);
  if(code){okc.hidden=false;$('#okCodeV').textContent=code}
  if(hp.c&&hp.t){
    rpc('catta_get',{p_code:hp.c,p_token:hp.t}).then(function(r){
      if(!r.ok)return;
      $('#okEye').textContent='Cita confirmada';$('#okH').innerHTML='Tu hora está <em>reservada.</em>';
      $('#okMsg').textContent='Guarda este código. Puedes cancelar o cambiar tu cita desde el botón de abajo.';
      var d=$('#okDet');d.hidden=false;d.textContent=r.service+' · '+fmtDay(r.date)+' · '+r.time;
      var mg=$('#okManage');mg.hidden=false;mg.href=mg.getAttribute('href').split('#')[0]+'#c='+encodeURIComponent(hp.c)+'&t='+encodeURIComponent(hp.t);
      var ic=$('#okIcs');ic.hidden=false;ic.href=icsHref('Cita en Catta Nails 29 · '+r.service,r.date,r.time,60);ic.setAttribute('download','cita-catta-nails.ics');
      var w=$('#okWa');if(w){try{var u=new URL(w.href);u.searchParams.set('text','Hola Pilar, acabo de reservar mi cita (código '+hp.c+').');w.href=u.toString()}catch(e){}}
    }).catch(function(){});
  }else if(code){var w2=$('#okWa');if(w2){try{var u2=new URL(w2.href);u2.searchParams.set('text','Hola Pilar, acabo de pedir una cita en la web. Mi código es '+code+'.');w2.href=u2.toString()}catch(e){}}}
}

/* ---------- gestionar mi cita: ver y cancelar (libera la hora) ---------- */
var mg=$('#mgWrap');
if(mg){
  var P=hashParams();
  function show(ids){['mgCancel','mgBook','mgWa','mgIg','mgConfirm'].forEach(function(i){var e=$('#'+i);if(e)e.hidden=ids.indexOf(i)<0});var c=$('#mgConfirm');if(c)c.style.display=ids.indexOf('mgConfirm')>=0?'flex':'none'}
  function say(h,m){$('#mgH').innerHTML=h;$('#mgMsg').textContent=m||''}
  show([]);
  if(!P.c||!P.t){say('No encontramos <em>tu cita.</em>','Abre el enlace que te dimos al reservar. Si lo perdiste, escribe a Pilar.');show(['mgWa','mgIg','mgBook'])}
  else rpc('catta_get',{p_code:P.c,p_token:P.t}).then(function(r){
    if(!r.ok){say('No encontramos <em>tu cita.</em>','Revisa que el enlace esté completo.');show(['mgWa','mgIg','mgBook']);return}
    var d=$('#mgDet');d.hidden=false;d.textContent=r.service+' · '+fmtDay(r.date)+' · '+r.time;
    if(r.status==='cancelada'){say('Tu cita está <em>cancelada.</em>','La hora ya quedó libre. Si quieres, reserva otra.');show(['mgBook']);return}
    if(r.status!=='pendiente'&&r.status!=='confirmada'){say('Esta cita <em>ya no está activa.</em>','');show(['mgBook']);return}
    if(r.can_cancel){say('Tu cita <em>está reservada.</em>','Puedes cancelarla hasta '+r.cancel_limit_hours+' horas antes. Al cancelar, la hora queda libre para otra persona. Para cambiarla, cancela y reserva otra hora.');show(['mgCancel'])}
    else{say('Ya no puedes cancelar <em>en línea.</em>','Faltan menos de '+r.cancel_limit_hours+' horas para tu cita. Escribe a Pilar y lo resolvéis.');show(['mgWa','mgIg'])}
  }).catch(function(){say('No pudimos <em>cargar tu cita.</em>','Revisa tu conexión e inténtalo de nuevo, o escribe a Pilar.');show(['mgWa','mgIg'])});
  $('#mgCancel').addEventListener('click',function(){show(['mgConfirm']);$('#mgNo').focus()});
  $('#mgNo').addEventListener('click',function(){show(['mgCancel']);$('#mgCancel').focus()});
  $('#mgYes').addEventListener('click',function(){
    $('#mgYes').disabled=true;
    rpc('catta_cancel',{p_code:P.c,p_token:P.t}).then(function(r){
      $('#mgYes').disabled=false;
      if(r.ok){track('reserva_cancel');say('Cita <em>cancelada.</em>','La hora ya está libre. Gracias por avisar. Cuando quieras, reserva otra.');$('#mgDet').hidden=true;show(['mgBook'])}
      else if(r.error==='too_late'){say('Ya no puedes cancelar <em>en línea.</em>','Faltan menos de '+r.cancel_limit_hours+' horas. Escribe a Pilar.');show(['mgWa','mgIg'])}
      else if(r.error==='not_active'){say('Esta cita <em>ya estaba cancelada.</em>','');show(['mgBook'])}
      else{say('No pudimos <em>cancelarla.</em>','Inténtalo de nuevo o escribe a Pilar.');show(['mgCancel','mgWa','mgIg'])}
    }).catch(function(){$('#mgYes').disabled=false;say('No pudimos <em>cancelarla.</em>','Revisa tu conexión e inténtalo de nuevo.');show(['mgCancel','mgIg'])})
  });
}

/* ---------- analítica con consentimiento (se activa solo si hay ID en <meta name="ga-id">) ---------- */
var GA=meta('ga-id');
function track(name){if(window.gtag&&window.__cattaGA)window.gtag('event',name)}
document.addEventListener('click',function(e){var a=e.target.closest('[data-evt]');if(a)track(a.getAttribute('data-evt'))});
if(GA){
  var KEY='catta-consent';var saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
  window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};
  window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
  var load=function(){
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA);document.head.appendChild(s);
    window.gtag('js',new Date());window.gtag('consent','update',{analytics_storage:'granted'});window.gtag('config',GA,{anonymize_ip:true});window.__cattaGA=true};
  var ban=$('#consent');
  var decide=function(v){try{localStorage.setItem(KEY,v)}catch(e){}if(ban)ban.hidden=true;if(v==='granted')load()};
  if(saved==='granted')load();else if(!saved&&ban){ban.hidden=false;
    $('#cAcc').addEventListener('click',function(){decide('granted')});
    $('#cRej').addEventListener('click',function(){decide('denied')});
    $('#cCfg').addEventListener('click',function(){decide('denied')})}
  var pref=$('#prefCookies');if(pref)pref.addEventListener('click',function(e){e.preventDefault();try{localStorage.removeItem(KEY)}catch(x){}if(ban)ban.hidden=false});
}
$$('[data-year]').forEach(function(n){n.textContent=new Date().getFullYear()});
})();
