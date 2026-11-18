/* Catta Nails 29 · Panel de administración. Sin librerías: Supabase Auth + funciones seguras (rpc).
   Todo lo que se muestra pasa por esc() o textContent para que ningún dato pueda inyectar código. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function meta(n){var m=document.querySelector('meta[name="'+n+'"]');return m?m.content:''}
var SBU=meta('sb-url'),SBK=meta('sb-key'),SITE=/^https?:/.test(meta('site-url'))?meta('site-url'):location.origin,DEMO=!!window.__demoRpc;
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var eur=function(n){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(+n||0)};
function pad(n){return (n<10?'0':'')+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function parse(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function dayName(s,long){var t=parse(s).toLocaleDateString('es-ES',long?{weekday:'long',day:'numeric',month:'long'}:{weekday:'short',day:'numeric',month:'short'});return t.charAt(0).toUpperCase()+t.slice(1)}
function waLink(phone,text){return 'https://wa.me/'+String(phone||'').replace(/\D/g,'')+(text?'?text='+encodeURIComponent(text):'')}
function first(n){return String(n||'').replace(/^Ejemplo · /,'').split(' ')[0]}
var ESTADOS={confirmada:'Confirmada',completada:'Hecha',cancelada:'Cancelada',no_show:'No vino',pendiente:'Pendiente'};
var LEADST={nuevo:'Nueva',contactado:'Contactada',interesada:'Interesada',inscrita:'Inscrita',descartada:'Descartada'};
var METODOS={efectivo:'Efectivo',tarjeta:'Tarjeta',bizum:'Bizum',transferencia:'Transferencia',otro:'Otro'};
var CATING={salon:'Salón',curso:'Curso',producto:'Producto',otro:'Otro'};
var CATGAS={material:'Material',alquiler:'Alquiler',suministros:'Luz, agua, internet',publicidad:'Publicidad',formacion:'Formación',impuestos:'Impuestos',otro:'Otro'};
var KINDS={confirmacion:'Confirmación de cita',recordatorio:'Recordatorio (24 h antes)',gracias:'Gracias tras la cita',vuelve:'Vuelve a reservar (4 semanas, si no tiene cita)',curso:'Respuesta a solicitud del curso',lista:'Respuesta a lista del curso'};
var TPLDEF={confirmacion:'Hola {nombre}, soy Pilar de Catta Nails 29. Tu cita de {servicio} quedó reservada para el {fecha} a las {hora} (código {codigo}). Te pido llegar puntual: trabajo con horarios justos y si llegas tarde puede que no pueda atenderte. Si necesitas cancelar: {enlace}',
  recordatorio:'Hola {nombre} 😊 Te recuerdo tu cita de {servicio} mañana {fecha} a las {hora} en Catta Nails 29. ¿Me confirmas que vienes? Respóndeme SÍ. Recuerda llegar a tu hora. Si no puedes venir, cancélala aquí para liberar la hora: {enlace}',
  gracias:'Gracias por venir, {nombre}. Si te gustó el resultado, me ayudarías mucho dejando tu opinión en Google o etiquetándome en Instagram @catta_nails29.',
  vuelve:'Hola {nombre}, ya va tocando volver a hacerte las uñas 💅 Reserva tu hora aquí: {web}/reservar',
  curso:'Hola {nombre}, soy Pilar de Catta Nails 29. Recibí tu solicitud para el curso de uñas. Te escribo para contarte fechas, duración y precio. ¿Cuándo te viene bien hablar?',
  lista:'Hola {nombre}, soy Pilar de Catta Nails 29. Te apunté a la lista del curso: te aviso en cuanto abra el próximo grupo.'};
/* Textos de la web que se pueden cambiar sin código (la web los lee al cargar) */
var TEXTS=[['site.url','Dirección de tu web','Ej.: https://tudominio.com — se usa en los enlaces de los mensajes de WhatsApp.'],['site.aviso','Aviso arriba de todo (promoción, vacaciones…)','Ej.: Del 24 al 26 de diciembre el salón está cerrado. Vacío = no se muestra.'],
  ['site.hero_badge','Etiqueta pequeña del inicio','Ej.: Reserva online · sin llamadas'],
  ['site.hero_lead','Frase principal del inicio','La frase que está debajo de «CATTA».'],
  ['site.precio_manicura','Texto bajo «Manos» (lista del inicio)','Ej.: 1 h 30 · desde 25 €'],
  ['site.precio_diseno','Texto bajo «Extensiones de polygel»','Ej.: Desde 2 h 30 · desde 45 €'],
  ['site.precio_mantenimiento','Texto bajo «Pies»','Ej.: 1 h · desde 20 €'],
  ['site.curso_info','Próximo grupo del curso (página Formación)','Ej.: Próximo grupo: 12 de enero · 6 plazas. Vacío = no se muestra.'],
  ['site.horario','Horario (sección «La visita»)','Ej.: Lunes a viernes de 10:00 a 14:00 y de 16:00 a 20:00.'],
  ['site.direccion','Dirección o zona (sección «La visita»)','Ej.: Calle Mayor 10, Alcantarilla. Vacío = texto actual.']];
var GALDEF=['French rojo con flor','French con mariposa','French con flor verde','Flor sobre fondo vino','Rojo con detalle dorado','Nude natural'];
var GALCATS={french:'French',flores:'Flores',mariposas:'Mariposas',color:'Color y natural'};

/* ---------- sesión ---------- */
var SK='catta-adm-s',S=null;
try{S=JSON.parse(localStorage.getItem(SK))}catch(e){}
function setS(x){S=x;try{x?localStorage.setItem(SK,JSON.stringify(x)):localStorage.removeItem(SK)}catch(e){}}
function auth(path,body,method,tok){return fetch(SBU+'/auth/v1/'+path,{method:method||'POST',headers:{'Content-Type':'application/json',apikey:SBK,Authorization:'Bearer '+(tok||SBK)},body:body?JSON.stringify(body):undefined})
  .then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok)throw new Error(authMsg(j));return j})})}
function authMsg(j){var m=(j&&(j.error_description||j.msg||j.message||j.error))||'';
  if(/invalid login/i.test(m))return 'Correo o contraseña incorrectos.';if(/not confirmed/i.test(m))return 'Falta confirmar tu correo: abre el enlace que te llegó.';
  if(/already registered/i.test(m))return 'Ese correo ya tiene acceso. Inicia sesión o recupera la contraseña.';if(/password/i.test(m)&&/6/.test(m))return 'La contraseña debe tener al menos 6 caracteres.';
  if(/rate|seconds/i.test(m))return 'Demasiados intentos. Espera un minuto y vuelve a probar.';return m||'No se pudo completar. Inténtalo de nuevo.'}
function keep(j){setS({at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000-60000,email:(j.user&&j.user.email)||(S&&S.email)||''})}
function token(){if(!S)return Promise.reject(new Error('login'));if(Date.now()<S.exp)return Promise.resolve(S.at);
  return auth('token?grant_type=refresh_token',{refresh_token:S.rt}).then(function(j){keep(j);return S.at},function(){setS(null);throw new Error('login')})}
function rpc(name,body){
  if(DEMO)return window.__demoRpc(name,body);
  return token().then(function(t){return fetch(SBU+'/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json',apikey:SBK,Authorization:'Bearer '+t},body:JSON.stringify(body||{})})})
    .then(function(r){return r.json().catch(function(){return null}).then(function(j){
      if(r.status===401){setS(null);showLogin('Tu sesión caducó. Vuelve a entrar.');throw new Error('login')}
      if(!r.ok)throw new Error(j&&/no_admin/.test(j.message||'')?'Tu usuario no tiene permiso de administración.':'No se pudo guardar. Revisa tu conexión.');return j})})}
var ERRS={slot_unavailable:'Esa hora ya está ocupada.',bad_phone:'Revisa el teléfono.',bad_service:'Elige un servicio.',bad_input:'Revisa la fecha y la hora.',bad_email:'Revisa el correo.',self:'No puedes quitarte a ti misma.'};
function chk(r){if(r&&r.ok===false)throw new Error(ERRS[r.error]||'No se pudo completar.');return r}

/* ---------- interfaz base ---------- */
var app=$('#app');
function toast(m,bad){var t=$('#toast');t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(toast.t);toast.t=setTimeout(function(){t.className='toast'},3200)}
function fail(e){if(e&&e.message!=='login')toast(e.message||'Algo falló',true)}
function modal(title,html,onSubmit,submitLabel){
  var m=$('#modal');m.innerHTML='<form class="mbox" novalidate><div class="mhead"><h3>'+esc(title)+'</h3><button type="button" class="x" aria-label="Cerrar">×</button></div><div class="mbody">'+html+'</div>'+
    (onSubmit?'<div class="mfoot"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn">'+esc(submitLabel||'Guardar')+'</button></div>':'')+'</form>';
  m.hidden=false;var f=$('form',m),fi=$('input,select,textarea',f);if(fi)setTimeout(function(){fi.focus()},30);
  function close(){m.hidden=true;m.innerHTML=''}
  $$('.x,[data-close]',m).forEach(function(b){b.onclick=close});m.onclick=function(e){if(e.target===m)close()};
  document.onkeydown=function(e){if(e.key==='Escape'&&!m.hidden)close()};
  f.onsubmit=function(e){e.preventDefault();if(!onSubmit)return;var b=$('.mfoot .btn:last-child',f);b.disabled=true;
    Promise.resolve(onSubmit(f)).then(function(r){if(r!==false)close();else b.disabled=false},function(err){b.disabled=false;fail(err)})};
  return f}
function val(f,n){var e=f.elements[n];return e?String(e.value).trim():''}

/* ---------- login ---------- */
function showLogin(msg,mode){
  mode=mode||'in';
  app.innerHTML='<div class="login"><div class="lcard"><div class="brand">CATTA <small>Panel</small></div>'+
    '<h1>'+(mode==='in'?'Entra a tu panel':mode==='up'?'Crea tu acceso':mode==='pw'?'Nueva contraseña':'Recupera tu contraseña')+'</h1>'+
    (msg?'<p class="lmsg">'+esc(msg)+'</p>':'')+
    '<form id="lf" novalidate>'+(mode!=='pw'?'<label>Correo<input type="email" name="email" autocomplete="username" required></label>':'')+
    (mode!=='rec'?'<label>Contraseña<input type="password" name="pw" autocomplete="'+(mode==='in'?'current-password':'new-password')+'" minlength="6" required></label>':'')+
    '<button class="btn wide">'+(mode==='in'?'Entrar':mode==='up'?'Crear acceso':mode==='pw'?'Guardar contraseña':'Enviarme el enlace')+'</button></form>'+
    '<p class="lalt">'+(mode==='in'?'<a href="#" data-m="rec">Olvidé mi contraseña</a> · <a href="#" data-m="up">Primera vez: crear acceso</a>':'<a href="#" data-m="in">Volver a entrar</a>')+'</p>'+
    '<p class="lfine">Solo pueden entrar los correos autorizados. Si te invitaron, crea tu acceso con ese correo.</p></div></div>';
  $$('[data-m]').forEach(function(a){a.onclick=function(e){e.preventDefault();showLogin('',a.getAttribute('data-m'))}});
  $('#lf').onsubmit=function(e){e.preventDefault();var f=e.target,b=$('button',f),em=val(f,'email'),pw=f.elements.pw?f.elements.pw.value:'';
    if(mode!=='pw'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return showErr('Escribe un correo válido.');
    if(mode!=='rec'&&pw.length<6)return showErr('La contraseña debe tener al menos 6 caracteres.');
    b.disabled=true;var back=location.origin+location.pathname;
    var p=mode==='in'?auth('token?grant_type=password',{email:em,password:pw}).then(function(j){keep(j);start()}):
      mode==='up'?auth('signup?redirect_to='+encodeURIComponent(back),{email:em,password:pw}).then(function(j){if(j.access_token){keep(j);start()}else showLogin('Te enviamos un correo para confirmar tu acceso. Ábrelo y luego entra aquí.','in')}):
      mode==='rec'?auth('recover?redirect_to='+encodeURIComponent(back),{email:em}).then(function(){showLogin('Si ese correo tiene acceso, te llegará un enlace para crear una contraseña nueva.','in')}):
      auth('user',{password:pw},'PUT',S&&S.at).then(function(){toast('Contraseña guardada');start()});
    p.catch(function(err){b.disabled=false;showErr(err.message)})};
  function showErr(m){var x=$('.lmsg');if(!x){x=document.createElement('p');x.className='lmsg';$('#lf').parentNode.insertBefore(x,$('#lf'))}x.textContent=m;x.classList.add('bad')}
}
/* enlaces de correo de Supabase (confirmación o recuperación) */
(function(){if(DEMO||!/access_token=/.test(location.hash))return;var h={};location.hash.slice(1).split('&').forEach(function(x){var k=x.split('=');h[k[0]]=decodeURIComponent(k[1]||'')});
  keep({access_token:h.access_token,refresh_token:h.refresh_token,expires_in:+h.expires_in||3600});history.replaceState(null,'',location.pathname);if(h.type==='recovery')S.recovery=true})();

/* ---------- arranque ---------- */
var SET=null;
function start(){
  if(!DEMO&&!S)return showLogin();
  if(!DEMO&&S.recovery){S.recovery=false;setS(S);return showLogin('Escribe tu contraseña nueva.','pw')}
  rpc('admin_claim').then(function(ok){if(!ok){setS(null);return showLogin('Este correo no tiene permiso todavía. Pide a quien administra el panel que te invite.')}shell()},fail);
}
var TABS=[['inicio','Inicio','M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],['agenda','Agenda','M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
  ['clientas','Clientas','M16 19a4 4 0 0 0-8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],['curso','Formación','M3 8l9-4 9 4-9 4zM7 10v5c3 2 7 2 10 0v-5'],
  ['finanzas','Finanzas','M4 19V9M10 19V5M16 19v-7M21 19H3'],['whatsapp','WhatsApp','M12 3C6.9 3 3 6.6 3 11.1c0 2.3 1 4.3 2.7 5.8L5 21l4.3-1.9c.9.2 1.8.3 2.7.3 5.1 0 9-3.6 9-8.1S17.1 3 12 3z'],
  ['web','Mi web','M4 5h16v12H4zM8 21h8M12 17v4']];
var cur='inicio';
function shell(){
  app.innerHTML='<div class="shell"><aside class="side"><div class="brand">CATTA <small>Panel</small></div><nav id="nav">'+
    TABS.map(function(t){return '<button type="button" data-tab="'+t[0]+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+t[2]+'"/></svg><span>'+t[1]+'</span><b class="bdg" data-b="'+t[0]+'" hidden></b></button>'}).join('')+
    '</nav><div class="who">'+(DEMO?'<span class="demo">Modo demostración: datos de ejemplo en tu navegador</span><button type="button" class="lnk" id="reset">Reiniciar ejemplo</button>':'<span>'+esc(S.email)+'</span><button type="button" class="lnk" id="out">Salir</button>')+
    '<a class="lnk" href="'+esc(meta('home-url')||'/')+'" target="_blank" rel="noopener">Ver mi web ↗</a></div></aside><div class="mtop"><div class="brand">CATTA <small>Panel</small></div>'+(DEMO?'<span class="demo">Demostración</span>':'<button type="button" class="lnk" id="out2">Salir</button>')+'</div><main id="view" class="view" tabindex="-1"></main></div>';
  $('#nav').onclick=function(e){var b=e.target.closest('[data-tab]');if(b)go(b.getAttribute('data-tab'))};
  $$('#out,#out2').forEach(function(o){o.onclick=function(){auth('logout',null,'POST',S.at).catch(function(){});setS(null);showLogin('Sesión cerrada.')}});
  var rs=$('#reset');if(rs)rs.onclick=function(){if(window.__demoReset)window.__demoReset();go(cur)};
  var h=(location.hash||'').replace('#','');go(TABS.some(function(t){return t[0]===h})?h:'inicio');
}
function go(t){cur=t;try{history.replaceState(null,'','#'+t)}catch(e){}
  $$('#nav [data-tab]').forEach(function(b){b.setAttribute('aria-current',b.getAttribute('data-tab')===t?'page':'false')});
  var v=$('#view');v.innerHTML='<p class="loading">Cargando…</p>';v.focus({preventScroll:true});window.scrollTo(0,0);
  ({inicio:vInicio,agenda:vAgenda,clientas:vClientas,curso:vCurso,finanzas:vFinanzas,whatsapp:vWa,web:vWeb})[t]().catch(fail);badges()}
function badges(){rpc('adm_dashboard').then(function(d){setB('curso',d.leads_nuevos);setB('whatsapp',d.wa_pendientes)}).catch(function(){})}
function setB(k,n){var b=$('[data-b="'+k+'"]');if(b){b.hidden=!n;b.textContent=n>99?'99+':n}}
function settings(force){if(SET&&!force)return Promise.resolve(SET);return rpc('adm_settings_get').then(function(s){SET=s;return s})}
function V(html){var v=$('#view');v.innerHTML=html;return v}

/* ---------- tarjeta de cita (inicio y agenda) ---------- */
function apptCard(a){
  var txt='Hola '+first(a.nombre)+', soy Pilar de Catta Nails 29. Te escribo por tu cita de '+a.servicio+' el '+dayName(a.fecha||iso(new Date()),true)+' a las '+a.hora+'.';
  return '<article class="appt st-'+esc(a.estado)+'"><div class="t">'+esc(a.hora)+(a.fin?'<small>'+esc(a.fin)+'</small>':'')+'</div><div class="i"><strong>'+esc(a.nombre)+'</strong><span>'+esc(a.servicio)+(a.precio>0?' · '+eur(a.precio):'')+'</span>'+
    (a.nota?'<em>«'+esc(a.nota)+'»</em>':'')+(a.interna?'<em>Nota: '+esc(a.interna)+'</em>':'')+'<span class="tag '+esc(a.estado)+'">'+esc(ESTADOS[a.estado]||a.estado)+(a.pagado>0?' · cobrado '+eur(a.pagado):'')+'</span>'+(a.asistencia&&a.estado==='confirmada'?'<span class="tag completada">✓ Confirmó que viene</span>':'')+'</div>'+
    '<div class="acts"><a class="ic wa" href="'+esc(waLink(a.telefono,txt))+'" target="_blank" rel="noopener" title="WhatsApp" aria-label="Escribir por WhatsApp a '+esc(a.nombre)+'"><svg viewBox="0 0 24 24"><path d="M12 3C6.9 3 3 6.6 3 11.1c0 2.3 1 4.3 2.7 5.8L5 21l4.3-1.9c.9.2 1.8.3 2.7.3 5.1 0 9-3.6 9-8.1S17.1 3 12 3z"/></svg></a>'+
    (a.estado==='confirmada'?'<button type="button" class="btn sm" data-done="'+esc(a.id)+'" data-price="'+esc(a.precio||'')+'" data-name="'+esc(a.nombre)+'" data-ph="'+esc(a.telefono)+'" data-sv="'+esc(a.service_id||'')+'" data-svn="'+esc(a.servicio)+'" data-day="'+esc(a.fecha||'')+'" data-time="'+esc(a.hora)+'">Hecha y cobrar</button><button type="button" class="btn sm ghost" data-ns="'+esc(a.id)+'">No vino</button><button type="button" class="btn sm ghost" data-cancel="'+esc(a.id)+'">Cancelar</button>':'')+
    (a.estado==='cancelada'||a.estado==='no_show'?'<button type="button" class="btn sm ghost" data-reopen="'+esc(a.id)+'">Reactivar</button>':'')+'</div></article>'}
function apptActions(root,reload){
  root.onclick=function(e){var b=e.target.closest('button');if(!b)return;
    if(b.dataset.done){var nd=iso(addDays(parse(b.dataset.day||iso(new Date())),28));
      modal('Cita hecha: '+b.dataset.name,'<p class="hint">Apunta lo que te pagó y queda en tus finanzas. Si no cobraste, deja 0.</p><div class="row2"><label>Importe (€)<input name="amount" type="number" min="0" step="0.5" inputmode="decimal" value="'+esc(b.dataset.price>0?b.dataset.price:'')+'"></label><label>Forma de pago'+sel('method',METODOS,'efectivo')+'</label></div>'+
        '<fieldset class="next"><legend>Su próxima cita (antes de que se vaya)</legend><label class="chk"><input type="checkbox" name="nx" checked> Reservarle ya la próxima: '+esc(b.dataset.svn)+'</label><div class="row2"><label>Día<input type="date" name="nd" value="'+nd+'"></label><label>Hora<input type="time" name="nt" step="300" value="'+esc(b.dataset.time||'')+'"></label></div><p class="hint">Por defecto, dentro de 4 semanas, mismo día y hora. Se le programa la confirmación y el recordatorio por WhatsApp.</p></fieldset>',
      function(f){var nx=f.elements.nx.checked&&val(f,'nd')&&val(f,'nt');
        return rpc('adm_set_status',{p_id:b.dataset.done,p_status:'completada',p_amount:+val(f,'amount')||0,p_method:val(f,'method')}).then(chk).then(function(){
          if(!nx){toast('Cita marcada como hecha');reload();return}
          return rpc('adm_book',{p:{service_id:b.dataset.sv,date:val(f,'nd'),time:val(f,'nt'),name:b.dataset.name,phone:b.dataset.ph,notify:true}}).then(function(r){
            if(r&&r.ok===false){toast(r.error==='slot_unavailable'?'Cita hecha. La próxima no se guardó: esa hora ya está ocupada, elige otra en la Agenda.':'Cita hecha. La próxima no se pudo guardar.',true)}else toast('Hecha y próxima cita reservada para el '+dayName(val(f,'nd'))+' a las '+val(f,'nt'));reload()})})},'Guardar')}
    else if(b.dataset.conf)rpc('adm_confirm',{p_id:b.dataset.conf,p_on:b.dataset.on==='1'}).then(function(){toast(b.dataset.on==='1'?'Marcada: confirmó que viene':'Confirmación quitada');reload()}).catch(fail);
    else if(b.dataset.ns)status(b.dataset.ns,'no_show','Marcada como «no vino»');
    else if(b.dataset.cancel){modal('¿Cancelar esta cita?','<p>La hora queda libre para otra clienta y se anulan los recordatorios. Avísale por WhatsApp si hace falta.</p>',function(){return status(b.dataset.cancel,'cancelada','Cita cancelada')},'Sí, cancelar')}
    else if(b.dataset.reopen)status(b.dataset.reopen,'confirmada','Cita reactivada');
  };
  function status(id,s,m){return rpc('adm_set_status',{p_id:id,p_status:s,p_amount:null,p_method:null}).then(chk).then(function(){toast(m);reload()}).catch(fail)}
}
function sel(n,map,v){return '<select name="'+n+'">'+Object.keys(map).map(function(k){return '<option value="'+esc(k)+'"'+(k===v?' selected':'')+'>'+esc(map[k])+'</option>'}).join('')+'</select>'}

/* ---------- INICIO ---------- */
function vInicio(){var tm=iso(addDays(new Date(),1));return Promise.all([rpc('adm_dashboard'),rpc('adm_appointments',{p_from:tm,p_to:tm}),settings()]).then(function(R){var d=R[0],man=R[1].filter(function(a){return a.estado==='confirmada'}),tp=R[2].content['wa.templates']||{};
  var ben=(+d.ingresos_mes)-(+d.gastos_mes),h=new Date().getHours();
  var v=V('<header class="vh"><h1>'+(h<13?'Buenos días':h<20?'Buenas tardes':'Buenas noches')+'</h1><p>'+esc(dayName(iso(new Date()),true))+'</p></header>'+
    '<div class="kpis"><div class="kpi"><span>Ingresos del mes</span><b>'+eur(d.ingresos_mes)+'</b></div><div class="kpi"><span>Gastos del mes</span><b>'+eur(d.gastos_mes)+'</b></div>'+
    '<div class="kpi '+(ben>=0?'up':'down')+'"><span>Te queda</span><b>'+eur(ben)+'</b></div><div class="kpi"><span>Citas hechas este mes</span><b>'+(+d.citas_mes)+'</b>'+(d.no_show_mes?'<small>'+d.no_show_mes+' no vinieron</small>':'')+'</div></div>'+
    '<div class="quick">'+(d.wa_pendientes?'<button type="button" class="qk hot" data-go="whatsapp"><b>'+d.wa_pendientes+'</b> mensajes de WhatsApp por enviar</button>':'')+
    (d.leads_nuevos?'<button type="button" class="qk hot" data-go="curso"><b>'+d.leads_nuevos+'</b> interesadas nuevas en el curso</button>':'')+
    '<button type="button" class="qk wa" data-sum="0">📲 Resumen de hoy a mi WhatsApp</button><button type="button" class="qk wa" data-sum="1">📲 Resumen de mañana</button><button type="button" class="qk" data-go="agenda"><b>'+(+d.proximas7)+'</b> citas en los próximos 7 días</button><button type="button" class="qk" id="qnew">+ Nueva cita</button><button type="button" class="qk" id="qexp">+ Apuntar un gasto</button></div>'+
    '<section class="card"><h2>Hoy</h2><div id="today">'+(d.hoy.length?d.hoy.map(apptCard).join(''):'<p class="empty">Hoy no tienes citas. Comparte tu enlace de reservas en Instagram para llenar huecos.</p>')+'</div></section>'+
    '<section class="card"><div class="row"><h2>Mañana: confirma asistencia ('+man.filter(function(a){return a.asistencia}).length+'/'+man.length+')</h2></div><p class="hint">Envía el recordatorio con un toque y marca «Confirmó» cuando te responda.</p><div id="manana">'+
      (man.length?man.map(function(a){var p=a.fecha.split('-');var t=(tp.recordatorio||TPLDEF.recordatorio).split('{nombre}').join(first(a.nombre)).split('{servicio}').join(a.servicio).split('{fecha}').join(p[2]+'/'+p[1]).split('{hora}').join(a.hora).split('{enlace}').join(SITE+'/mi-cita').split('{web}').join(SITE);
        return '<div class="li conf"><span><b>'+esc(a.hora)+'</b> '+esc(a.nombre)+' · '+esc(a.servicio)+(a.asistencia?' <span class="tag completada">✓ Confirmó</span>':'')+'</span><span class="acts"><a class="btn sm wa" href="'+esc(waLink(a.telefono,t))+'" target="_blank" rel="noopener">Recordar</a>'+
          (a.asistencia?'<button type="button" class="btn sm ghost" data-conf="'+esc(a.id)+'" data-on="0">Quitar ✓</button>':'<button type="button" class="btn sm" data-conf="'+esc(a.id)+'" data-on="1">Confirmó ✓</button>')+'</span></div>'}).join(''):'<p class="empty sm">Mañana no hay citas.</p>')+'</div></section>');
  $$('[data-go]',v).forEach(function(b){b.onclick=function(){go(b.dataset.go)}});
  $$('[data-sum]',v).forEach(function(b){b.onclick=function(){sendSummary(+b.dataset.sum)}});
  $('#qnew').onclick=function(){newAppt(iso(new Date()),vInicio)};$('#qexp').onclick=function(){newMoney('expense',vInicio)};
  apptActions($('#today'),function(){vInicio();badges()});apptActions($('#manana'),function(){vInicio()});
})}

/* Resumen del día al propio WhatsApp de Pilar (chat «Mensaje para mí»): sin API, un toque */
function sendSummary(off){var w=window.open('about:blank','_blank');var d=iso(addDays(new Date(),off));
  Promise.all([rpc('adm_appointments',{p_from:d,p_to:d}),settings()]).then(function(r){var list=r[0].filter(function(a){return a.estado==='confirmada'||a.estado==='completada'}),num=r[1].settings.wa_number;
    var L=['📅 '+(off?'Mañana':'Hoy')+', '+dayName(d,true)+': '+(list.length?list.length+(list.length===1?' cita':' citas'):'sin citas')];
    list.forEach(function(a){L.push('• '+a.hora+' '+a.nombre.replace(/^Ejemplo · /,'')+' · '+a.servicio+(a.precio>0?' · '+eur(a.precio):'')+(a.nota?' · «'+a.nota+'»':'')+' · '+a.telefono)});
    if(!list.length)L.push('Buen momento para compartir el enlace de reservas en tus historias.');
    var url=waLink(num,L.join('\n'));if(w){w.location.href=url}else location.href=url}).catch(function(e){if(w)w.close();fail(e)})}

/* ---------- AGENDA ---------- */
var wk=null;
function monday(d){var x=new Date(d);var k=(x.getDay()+6)%7;return addDays(x,-k)}
function vAgenda(){wk=wk||monday(new Date());var from=iso(wk),to=iso(addDays(wk,6));
  return Promise.all([rpc('adm_appointments',{p_from:from,p_to:to}),rpc('adm_timeoff',{p_action:'list',p:{}}),settings()]).then(function(r){var list=r[0],offs=r[1];
    var days=[];for(var i=0;i<7;i++)days.push(iso(addDays(wk,i)));
    var hasWeek=list.filter(function(a){return a.estado!=='cancelada'}).length;
    var v=V('<header class="vh row"><div><h1>Agenda</h1><p>'+esc(dayName(from))+' – '+esc(dayName(to))+' · '+hasWeek+' citas</p></div><div class="tools"><button type="button" class="btn ghost sm" id="prev" aria-label="Semana anterior">‹</button><button type="button" class="btn ghost sm" id="hoy">Hoy</button><button type="button" class="btn ghost sm" id="next" aria-label="Semana siguiente">›</button><button type="button" class="btn sm" id="nueva">+ Nueva cita</button></div></header>'+
      '<div class="week" id="week">'+days.map(function(d){var it=list.filter(function(a){return a.fecha===d});var isT=d===iso(new Date());
        return '<section class="day'+(isT?' today':'')+'"><h3>'+esc(dayName(d))+(isT?' · hoy':'')+'<button type="button" class="add" data-day="'+d+'" aria-label="Nueva cita el '+esc(dayName(d))+'">+</button></h3>'+(it.length?it.map(apptCard).join(''):'<p class="empty sm">Libre</p>')+'</section>'}).join('')+'</div>'+
      '<section class="card"><h2>Días cerrados y descansos</h2><p class="hint">Lo que bloquees aquí desaparece de las horas libres de la web.</p><div id="offs">'+(offs.length?offs.map(function(o){return '<div class="li"><span><b>'+esc(o.desde)+'</b> → <b>'+esc(o.hasta)+'</b> '+esc(o.motivo||'')+'</span><button type="button" class="btn sm ghost" data-off="'+esc(o.id)+'">Quitar</button></div>'}).join(''):'<p class="empty sm">No hay bloqueos.</p>')+'</div><button type="button" class="btn ghost" id="addoff">+ Bloquear días u horas</button></section>');
    $('#prev').onclick=function(){wk=addDays(wk,-7);vAgenda().catch(fail)};$('#next').onclick=function(){wk=addDays(wk,7);vAgenda().catch(fail)};$('#hoy').onclick=function(){wk=monday(new Date());vAgenda().catch(fail)};
    $('#nueva').onclick=function(){newAppt(iso(new Date())>from?iso(new Date()):from,vAgenda)};
    $$('.add',v).forEach(function(b){b.onclick=function(){newAppt(b.dataset.day,vAgenda)}});
    apptActions($('#week'),function(){vAgenda().catch(fail)});
    $('#offs').onclick=function(e){var b=e.target.closest('[data-off]');if(b)rpc('adm_timeoff',{p_action:'del',p:{id:b.dataset.off}}).then(function(){toast('Bloqueo quitado');vAgenda()}).catch(fail)};
    $('#addoff').onclick=function(){var t=iso(new Date());modal('Bloquear días u horas','<div class="row2"><label>Desde el día<input type="date" name="fd" value="'+t+'" required></label><label>Hora<input type="time" name="ft" value="00:00"></label></div><div class="row2"><label>Hasta el día<input type="date" name="td" value="'+t+'" required></label><label>Hora<input type="time" name="tt" value="23:59"></label></div><label>Motivo (solo lo ves tú)<input name="r" maxlength="120" placeholder="Vacaciones, médico, curso…"></label>',
      function(f){if(!val(f,'fd')||!val(f,'td')||val(f,'td')+val(f,'tt')<=val(f,'fd')+val(f,'ft')){toast('Revisa las fechas: el final debe ir después del inicio.',true);return false}
        return rpc('adm_timeoff',{p_action:'add',p:{from_date:val(f,'fd'),from_time:val(f,'ft'),to_date:val(f,'td'),to_time:val(f,'tt'),reason:val(f,'r')}}).then(function(){toast('Bloqueado');vAgenda()})},'Bloquear')};
  })}
function newAppt(day,reload){settings().then(function(s){var sv=s.services.filter(function(x){return x.active});
  var f=modal('Nueva cita','<label>Servicio<select name="sv">'+sv.map(function(x){return '<option value="'+esc(x.id)+'" data-p="'+esc(x.price)+'" data-d="'+esc(x.duration_min)+'">'+esc(x.name)+' · '+x.duration_min+' min</option>'}).join('')+'</select></label>'+
    '<div class="row2"><label>Día<input type="date" name="d" value="'+esc(day)+'" required></label><label>Hora<input type="time" name="t" step="300" required></label></div>'+
    '<div class="row2"><label>Nombre de la clienta<input name="n" autocomplete="off" required maxlength="80"></label><label>Teléfono<input name="ph" type="tel" inputmode="tel" placeholder="612 345 678" required></label></div>'+
    '<div class="row2"><label>Precio (€)<input name="pr" type="number" min="0" step="0.5" inputmode="decimal"></label><label>Duración (min)<input name="du" type="number" min="10" step="5"></label></div>'+
    '<label>Nota interna<input name="no" maxlength="200" placeholder="Ej.: quiere french con flores"></label><label class="chk"><input type="checkbox" name="wa" checked> Programar confirmación y recordatorio por WhatsApp</label>',
    function(f){if(!val(f,'t')||val(f,'n').length<2||!val(f,'ph')){toast('Completa hora, nombre y teléfono.',true);return false}
      return rpc('adm_book',{p:{service_id:val(f,'sv'),date:val(f,'d'),time:val(f,'t'),name:val(f,'n'),phone:val(f,'ph'),price:val(f,'pr')===''?null:+val(f,'pr'),duration:+val(f,'du')||null,note:val(f,'no'),notify:f.elements.wa.checked}}).then(chk).then(function(){toast('Cita guardada');reload()})},'Guardar cita');
  function fill(){var o=f.elements.sv.selectedOptions[0];if(o){f.elements.pr.placeholder=o.dataset.p>0?o.dataset.p:'';f.elements.du.placeholder=o.dataset.d}}
  f.elements.sv.onchange=fill;fill()}).catch(fail)}

/* ---------- CLIENTAS ---------- */
function vClientas(q){q=q||'';return rpc('adm_customers',{p_q:q}).then(function(list){
  var v=V('<header class="vh"><h1>Clientas</h1><p>'+list.length+' en tu agenda</p></header><div class="search"><input type="search" id="cq" placeholder="Busca por nombre o teléfono" value="'+esc(q)+'" aria-label="Buscar clienta"></div>'+
    '<div class="grid" id="cl">'+(list.length?list.map(function(c){return '<article class="cli"><div><strong>'+esc(c.nombre)+'</strong><span>'+esc(c.telefono)+'</span></div>'+
      '<div class="stats"><span><b>'+(+c.visitas)+'</b> visitas</span><span><b>'+eur(c.gastado)+'</b> gastado</span>'+(c.no_show?'<span class="warn"><b>'+c.no_show+'</b> no vino</span>':'')+'</div>'+
      (c.proxima?'<p class="hint">Próxima cita: '+esc(new Date(c.proxima).toLocaleString('es-ES',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))+'</p>':c.ultima?'<p class="hint">Última visita: '+esc(new Date(c.ultima).toLocaleDateString('es-ES',{day:'numeric',month:'short'}))+'</p>':'')+
      (c.notas?'<p class="note">'+esc(c.notas)+'</p>':'')+
      '<div class="acts"><a class="btn sm wa" href="'+esc(waLink(c.telefono,'Hola '+first(c.nombre)+', soy Pilar de Catta Nails 29. '))+'" target="_blank" rel="noopener">WhatsApp</a><button type="button" class="btn sm ghost" data-note="'+esc(c.id)+'" data-n="'+esc(c.nombre)+'" data-v="'+esc(c.notas||'')+'">Notas</button></div></article>'}).join(''):'<p class="empty">Todavía no hay clientas. Aparecen solas cuando reservan en la web o cuando apuntas una cita.</p>')+'</div>');
  var t;$('#cq').oninput=function(e){clearTimeout(t);var x=e.target.value;t=setTimeout(function(){vClientas(x).then(function(){var i=$('#cq');i.focus();i.setSelectionRange(x.length,x.length)}).catch(fail)},350)};
  $('#cl').onclick=function(e){var b=e.target.closest('[data-note]');if(!b)return;modal('Notas de '+b.dataset.n,'<p class="hint">Gustos, alergias que te cuente, colores favoritos… Solo lo ves tú.</p><textarea name="t" rows="6" maxlength="2000">'+esc(b.dataset.v)+'</textarea>',
    function(f){return rpc('adm_customer_note',{p_id:b.dataset.note,p_notes:f.elements.t.value}).then(function(){toast('Notas guardadas');vClientas($('#cq').value)})})};
})}

/* ---------- FORMACIÓN (inscritas) ---------- */
var lf={kind:'',status:''};
var QS={objetivo:'Para qué',experiencia:'Punto de partida',inicio:'Cuándo empezar',presencial:'Puede venir',inversion:'Inversión'};
function vCurso(){return Promise.all([rpc('adm_leads',{p_kind:lf.kind||null,p_status:lf.status||null}),settings()]).then(function(r){var list=r[0],tpls=(r[1].content['wa.templates']||{});
  function lvl(s){return s>=80?['alto','Muy interesada']:s>=50?['medio','Interesada']:['bajo','Poco interés']}
  var v=V('<header class="vh row"><div><h1>Formación</h1><p>Interesadas en el curso y lista de próximas fechas</p></div><div class="tools"><button type="button" class="btn ghost sm" id="csv">Descargar Excel (CSV)</button></div></header>'+
    '<div class="filters"><label>Tipo'+sel('k',{'':'Todas',curso:'Solicitud de plaza',lista:'Lista de próximas fechas'},lf.kind)+'</label><label>Estado'+sel('s',Object.assign({'':'Todos'},LEADST),lf.status)+'</label></div>'+
    '<div class="grid" id="ll">'+(list.length?list.map(function(l){var L=lvl(+l.score||0),a=l.answers||{};
      var txt=(tpls[l.kind]||TPLDEF[l.kind]||'').split('{nombre}').join(first(l.name)).split('{web}').join(SITE);
      return '<article class="lead"><div class="lh"><div><strong>'+esc(l.name)+'</strong><span>'+esc(l.kind==='curso'?'Solicitud de plaza':'Lista de próximas fechas')+' · '+esc(new Date(l.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'}))+'</span></div>'+(l.kind==='curso'?'<span class="lvl '+L[0]+'">'+L[1]+'</span>':'')+'</div>'+
        '<p class="contact">'+(l.phone?esc(l.phone):'')+(l.instagram?' · '+esc(l.instagram):'')+(l.contact&&!l.phone?esc(l.contact):'')+'</p>'+
        (Object.keys(a).length?'<dl>'+Object.keys(QS).filter(function(k){return a[k]}).map(function(k){return '<dt>'+QS[k]+'</dt><dd>'+esc(a[k])+'</dd>'}).join('')+'</dl>':'')+
        '<label class="inl">Estado'+sel('st',LEADST,l.status).replace('<select','<select data-st="'+esc(l.id)+'"')+'</label>'+
        '<textarea data-nt="'+esc(l.id)+'" rows="2" placeholder="Notas (qué hablasteis, cuándo volver a escribir…)" maxlength="2000">'+esc(l.notes||'')+'</textarea>'+
        '<div class="acts">'+(l.phone?'<a class="btn sm wa" href="'+esc(waLink(l.phone,txt))+'" target="_blank" rel="noopener" data-contact="'+esc(l.id)+'">WhatsApp</a>':l.contact&&/^@/.test(l.contact)?'<a class="btn sm" href="https://instagram.com/'+esc(l.contact.slice(1))+'" target="_blank" rel="noopener">Instagram</a>':'')+
        '<button type="button" class="btn sm ghost" data-pay="'+esc(l.id)+'" data-n="'+esc(l.name)+'">Registrar pago</button></div></article>'}).join(''):'<p class="empty">Aún no hay interesadas con este filtro. Comparte la página del curso en tus historias.</p>')+'</div>');
  $('select[name=k]',v).onchange=function(e){lf.kind=e.target.value;vCurso().catch(fail)};$('select[name=s]',v).onchange=function(e){lf.status=e.target.value;vCurso().catch(fail)};
  $('#ll').onchange=function(e){var s=e.target.closest('[data-st]');if(s)rpc('adm_lead_save',{p:{id:s.dataset.st,status:s.value}}).then(function(){toast('Estado guardado');badges()}).catch(fail)};
  $('#ll').addEventListener('focusout',function(e){var t=e.target.closest('[data-nt]');if(t&&t.value!==t.defaultValue)rpc('adm_lead_save',{p:{id:t.dataset.nt,notes:t.value}}).then(function(){t.defaultValue=t.value;toast('Nota guardada')}).catch(fail)});
  $('#ll').onclick=function(e){var a=e.target.closest('[data-contact]');if(a){var s=$('[data-st="'+a.dataset.contact+'"]');rpc('adm_lead_save',{p:{id:a.dataset.contact,contacted:true,status:s&&s.value==='nuevo'?'contactado':null}}).then(function(){if(s&&s.value==='nuevo')s.value='contactado';badges()}).catch(function(){})}
    var b=e.target.closest('[data-pay]');if(b)newMoney('pay',vCurso,{category:'curso',lead_id:b.dataset.pay,concept:'Curso · '+b.dataset.n})};
  $('#csv').onclick=function(){csv('interesadas-curso.csv',[['Fecha','Tipo','Nombre','Teléfono','Instagram','Contacto','Estado','Interés'].concat(Object.keys(QS).map(function(k){return QS[k]}),['Notas'])].concat(list.map(function(l){var a=l.answers||{};
    return [l.created_at.slice(0,10),l.kind,l.name,l.phone||'',l.instagram||'',l.contact||'',LEADST[l.status]||l.status,l.score||''].concat(Object.keys(QS).map(function(k){return a[k]||''}),[l.notes||''])})))};
})}
function csv(name,rows){var t='﻿'+rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);if(/^[=+\-@]/.test(c))c="'"+c;return /[;"\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')}).join('\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);
  if(DEMO)toast('En la vista previa la descarga puede estar bloqueada; en tu web funciona.')}

/* ---------- FINANZAS ---------- */
var per='mes';
function range(){var t=new Date();if(per==='mes')return [iso(new Date(t.getFullYear(),t.getMonth(),1)),iso(t)];
  if(per==='ant')return [iso(new Date(t.getFullYear(),t.getMonth()-1,1)),iso(new Date(t.getFullYear(),t.getMonth(),0))];
  if(per==='ano')return [t.getFullYear()+'-01-01',iso(t)];return [iso(addDays(t,-6)),iso(t)]}
function vFinanzas(){var r=range();return rpc('adm_money',{p_action:'list',p:{from:r[0],to:r[1]}}).then(function(d){
  var ti=d.ingresos.reduce(function(x,i){return x+ +i.importe},0),tg=d.gastos.reduce(function(x,i){return x+ +i.importe},0);
  function bars(o,map){var k=Object.keys(o);if(!k.length)return '<p class="empty sm">Sin datos.</p>';var mx=Math.max.apply(null,k.map(function(x){return +o[x]}));
    return k.sort(function(a,b){return o[b]-o[a]}).map(function(x){return '<div class="bar"><span>'+esc(map[x]||x)+'</span><i style="width:'+Math.max(4,Math.round(+o[x]/mx*100))+'%"></i><b>'+eur(o[x])+'</b></div>'}).join('')}
  var gc={};d.gastos.forEach(function(g){gc[g.categoria]=(gc[g.categoria]||0)+ +g.importe});
  var v=V('<header class="vh row"><div><h1>Finanzas</h1><p>'+esc(dayName(r[0]))+' – '+esc(dayName(r[1]))+'</p></div><div class="tools">'+sel('per',{sem:'Últimos 7 días',mes:'Este mes',ant:'Mes pasado',ano:'Este año'},per)+'<button type="button" class="btn sm" id="ading">+ Ingreso</button><button type="button" class="btn sm ghost" id="adgas">+ Gasto</button></div></header>'+
    '<div class="kpis"><div class="kpi"><span>Ingresos</span><b>'+eur(ti)+'</b></div><div class="kpi"><span>Gastos</span><b>'+eur(tg)+'</b></div><div class="kpi '+(ti-tg>=0?'up':'down')+'"><span>Te queda</span><b>'+eur(ti-tg)+'</b></div></div>'+
    '<div class="cols"><section class="card"><h2>De dónde viene el dinero</h2>'+bars(d.por_categoria,CATING)+'<h3 class="sub">Cómo te pagan</h3>'+bars(d.por_metodo,METODOS)+'</section><section class="card"><h2>En qué se va</h2>'+bars(gc,CATGAS)+'</section></div>'+
    '<section class="card"><div class="row"><h2>Movimientos</h2><button type="button" class="btn sm ghost" id="csv">Descargar Excel (CSV)</button></div><div class="mov" id="mov">'+
      d.ingresos.map(function(i){return {f:i.fecha,t:'in',c:CATING[i.categoria]||i.categoria,d:i.concepto||'',m:METODOS[i.metodo]||i.metodo,v:+i.importe,id:i.id}}).concat(d.gastos.map(function(g){return {f:g.fecha,t:'out',c:CATGAS[g.categoria]||g.categoria,d:g.nota||'',m:METODOS[g.metodo]||g.metodo||'',v:-g.importe,id:g.id}}))
      .sort(function(a,b){return a.f<b.f?1:-1}).map(function(x){return '<div class="li"><span class="d">'+esc(dayName(x.f))+'</span><span class="c">'+esc(x.c)+(x.d?' · '+esc(x.d):'')+'<small>'+esc(x.m)+'</small></span><b class="'+x.t+'">'+(x.v>0?'+':'')+eur(x.v)+'</b><button type="button" class="ic del" data-del="'+x.t+':'+esc(x.id)+'" aria-label="Borrar movimiento">×</button></div>'}).join('')+
      (d.ingresos.length+d.gastos.length?'':'<p class="empty">No hay movimientos en este periodo. Al marcar una cita como «hecha» el cobro aparece aquí solo.</p>')+'</div></section>');
  $('select[name=per]',v).onchange=function(e){per=e.target.value;vFinanzas().catch(fail)};
  $('#ading').onclick=function(){newMoney('pay',vFinanzas)};$('#adgas').onclick=function(){newMoney('expense',vFinanzas)};
  $('#mov').onclick=function(e){var b=e.target.closest('[data-del]');if(!b)return;var p=b.dataset.del.split(':');modal('¿Borrar este movimiento?','<p>Se quita de tus cuentas. No se puede deshacer.</p>',function(){return rpc('adm_money',{p_action:p[0]==='in'?'del_pay':'del_expense',p:{id:p[1]}}).then(function(){toast('Borrado');vFinanzas()})},'Sí, borrar')};
  $('#csv').onclick=function(){csv('finanzas-'+r[0]+'-a-'+r[1]+'.csv',[['Fecha','Tipo','Categoría','Detalle','Forma de pago','Importe']].concat(d.ingresos.map(function(i){return [i.fecha,'Ingreso',CATING[i.categoria]||i.categoria,i.concepto||'',METODOS[i.metodo]||i.metodo,String(i.importe).replace('.',',')]}),
    d.gastos.map(function(g){return [g.fecha,'Gasto',CATGAS[g.categoria]||g.categoria,g.nota||'',METODOS[g.metodo]||g.metodo||'','-'+String(g.importe).replace('.',',')]})))};
})}
function newMoney(kind,reload,pre){pre=pre||{};var t=iso(new Date());
  modal(kind==='pay'?'Apuntar un ingreso':'Apuntar un gasto','<div class="row2"><label>Importe (€)<input name="a" type="number" min="0.01" step="0.01" inputmode="decimal" required></label><label>Fecha<input type="date" name="d" value="'+t+'"></label></div>'+
    '<div class="row2"><label>'+(kind==='pay'?'De qué es':'Categoría')+sel('c',kind==='pay'?CATING:CATGAS,pre.category||(kind==='pay'?'salon':'material'))+'</label><label>Forma de pago'+sel('m',METODOS,'efectivo')+'</label></div>'+
    '<label>'+(kind==='pay'?'Concepto':'Nota')+'<input name="n" maxlength="120" value="'+esc(pre.concept||'')+'" placeholder="'+(kind==='pay'?'Ej.: Uñas con diseño':'Ej.: Esmaltes y limas')+'"></label>',
    function(f){var a=+val(f,'a');if(!(a>0)){toast('Escribe un importe mayor que 0.',true);return false}
      var p=kind==='pay'?{amount:a,date:val(f,'d'),category:val(f,'c'),method:val(f,'m'),concept:val(f,'n'),lead_id:pre.lead_id||null}:{amount:a,date:val(f,'d'),category:val(f,'c'),method:val(f,'m'),note:val(f,'n')};
      return rpc('adm_money',{p_action:kind,p:p}).then(function(){toast(kind==='pay'?'Ingreso apuntado':'Gasto apuntado');reload()})},'Guardar')}

/* ---------- WHATSAPP ---------- */
function vWa(){return Promise.all([rpc('adm_wa',{p_action:'list',p:{}}),settings(true)]).then(function(r){var d=r[0],c=r[1].content,tp=c['wa.templates']||{},auto=c['wa.cloud']||{activo:false,plantillas:{}};
  var v=V('<header class="vh"><h1>WhatsApp</h1><p>Mensajes que la agenda prepara sola: confirmaciones, recordatorios, gracias y respuestas al curso.</p></header>'+
    '<section class="card"><div class="row"><h2>Por enviar ('+d.pendientes.length+')</h2><button type="button" class="btn sm ghost" id="free">+ Mensaje nuevo</button></div>'+
      (auto.activo?'<p class="ok">Envío automático activado: los mensajes con plantilla aprobada salen solos cada 5 minutos.</p>':'<p class="hint">Toca «Enviar» y se abre tu WhatsApp con el mensaje escrito; solo tienes que darle a enviar. Cuando actives el envío automático, saldrán solos.</p>')+
      '<div id="pend">'+(d.pendientes.length?d.pendientes.map(function(m){return '<article class="msg"><div class="mh"><strong>'+esc(m.nombre||m.telefono)+'</strong><span>'+esc(KINDS[m.tipo]||'Mensaje')+' · '+esc(m.cuando)+'</span></div><p>'+esc(m.texto)+'</p>'+(m.error?'<p class="warn">Error del envío automático: '+esc(m.error)+'</p>':'')+
        '<div class="acts"><a class="btn sm wa" href="'+esc(waLink(m.telefono,m.texto))+'" target="_blank" rel="noopener" data-sent="'+esc(m.id)+'">Enviar</a><button type="button" class="btn sm ghost" data-skip="'+esc(m.id)+'">Descartar</button></div></article>'}).join(''):'<p class="empty">Todo al día. No hay mensajes pendientes.</p>')+'</div></section>'+
    '<section class="card"><h2>Textos de los mensajes</h2><p class="hint">Puedes usar: {nombre} {servicio} {fecha} {hora} {codigo} {enlace} {web}. Se rellenan solos.</p><form id="tpf">'+Object.keys(KINDS).map(function(k){return '<label>'+esc(KINDS[k])+'<textarea name="'+k+'" rows="3" maxlength="900">'+esc(tp[k]||TPLDEF[k])+'</textarea></label>'}).join('')+'<button class="btn">Guardar textos</button></form></section>'+
    '<section class="card"><h2>Envío automático (API oficial de WhatsApp)</h2><p class="hint">Para que salgan solos sin tocar nada, WhatsApp exige su API oficial de Meta y plantillas aprobadas. Los pasos están en «docs/WHATSAPP.md». Cuando tengas las plantillas aprobadas, escribe aquí su nombre exacto.</p>'+
      '<form id="auf"><label class="chk"><input type="checkbox" name="on"'+(auto.activo?' checked':'')+'> Activar envío automático</label>'+Object.keys(KINDS).map(function(k){var p=(auto.plantillas||{})[k]||{};
        return '<div class="row2"><label>Plantilla para «'+esc(KINDS[k])+'»<input name="n_'+k+'" value="'+esc(p.nombre||'')+'" placeholder="nombre_en_meta (vacío = manual)"></label><label>Variables en orden<input name="v_'+k+'" value="'+esc((p.variables||[]).join(', '))+'" placeholder="nombre, servicio, fecha, hora"></label></div>'}).join('')+'<button class="btn">Guardar envío automático</button></form></section>'+
    '<section class="card"><h2>Enviados</h2>'+(d.enviados.length?d.enviados.map(function(m){return '<div class="li"><span>'+esc(m.nombre||'')+' · '+esc(KINDS[m.tipo]||m.tipo)+'</span><small>'+esc(m.estado==='enviado'?'automático':'desde tu WhatsApp')+' · '+esc(m.cuando)+'</small></div>'}).join(''):'<p class="empty sm">Todavía nada.</p>')+'</section>');
  $('#pend').onclick=function(e){var a=e.target.closest('[data-sent]'),s=e.target.closest('[data-skip]');
    if(a)setTimeout(function(){rpc('adm_wa',{p_action:'mark',p:{id:a.dataset.sent,status:'manual'}}).then(function(){vWa();badges()}).catch(fail)},400);
    if(s)rpc('adm_wa',{p_action:'mark',p:{id:s.dataset.skip,status:'anulado'}}).then(function(){toast('Descartado');vWa();badges()}).catch(fail)};
  $('#tpf').onsubmit=function(e){e.preventDefault();var o={};Object.keys(KINDS).forEach(function(k){var x=e.target.elements[k].value.trim();if(x&&x!==TPLDEF[k])o[k]=x});
    rpc('adm_content_set',{p_key:'wa.templates',p_value:Object.keys(o).length?o:null}).then(function(){toast('Textos guardados');settings(true)}).catch(fail)};
  $('#auf').onsubmit=function(e){e.preventDefault();var f=e.target,pl={};Object.keys(KINDS).forEach(function(k){var n=f.elements['n_'+k].value.trim();if(n)pl[k]={nombre:n,idioma:'es',variables:f.elements['v_'+k].value.split(',').map(function(x){return x.trim().replace(/[{}]/g,'')}).filter(Boolean)}});
    rpc('adm_content_set',{p_key:'wa.cloud',p_value:{activo:f.elements.on.checked,plantillas:pl}}).then(function(){toast('Guardado');settings(true)}).catch(fail)};
  $('#free').onclick=function(){modal('Mensaje nuevo','<label>Teléfono<input name="ph" type="tel" inputmode="tel" placeholder="612 345 678" required></label><label>Mensaje<textarea name="t" rows="4" maxlength="900">Hola, soy Pilar de Catta Nails 29. </textarea></label>',
    function(f){var ph=val(f,'ph').replace(/[^0-9+]/g,'');if(/^[67]\d{8}$/.test(ph))ph='34'+ph;if(ph.replace(/\D/g,'').length<9){toast('Revisa el teléfono.',true);return false}window.open(waLink(ph,f.elements.t.value),'_blank','noopener')},'Abrir WhatsApp')};
})}

/* ---------- MI WEB ---------- */
function vWeb(){return settings(true).then(function(s){var c=s.content,st=s.settings,wh=st.working_hours||{},extra=c['gal.extra']||[],hid=c['gal.ocultar']||[];
  var DN={mon:'Lunes',tue:'Martes',wed:'Miércoles',thu:'Jueves',fri:'Viernes',sat:'Sábado',sun:'Domingo'};
  function rng(d,i){var r=(wh[d]||[])[i]||['',''];return '<input type="time" name="'+d+i+'a" value="'+esc(r[0])+'" aria-label="'+DN[d]+' tramo '+(i+1)+' desde"><span>a</span><input type="time" name="'+d+i+'b" value="'+esc(r[1])+'" aria-label="'+DN[d]+' tramo '+(i+1)+' hasta">'}
  var v=V('<header class="vh"><h1>Mi web</h1><p>Lo que cambies aquí se ve en la web al momento, sin tocar código.</p></header>'+
    '<section class="card"><h2>Textos</h2><form id="txf">'+TEXTS.map(function(t){var x=c[t[0]];return '<label>'+esc(t[1])+'<input name="'+t[0]+'" maxlength="220" value="'+esc(typeof x==='string'?x:'')+'"><small>'+esc(t[2])+'</small></label>'}).join('')+'<button class="btn">Guardar textos</button></form></section>'+
    '<section class="card"><h2>Fotos de trabajos</h2><p class="hint">Sube fotos nuevas a la galería «Elige tu diseño». Cada foto lleva su botón «Quiero este» para reservar. Mejor en vertical y con buena luz.</p>'+
      '<div class="gal" id="galx">'+extra.map(function(g,i){return '<figure><img src="'+esc(g.url)+'" alt="'+esc(g.nombre)+'" loading="lazy"><figcaption>'+esc(g.nombre)+'<button type="button" class="ic del" data-gx="'+i+'" aria-label="Quitar foto">×</button></figcaption></figure>'}).join('')+'</div>'+
      '<form id="upf" class="upl"><label>Foto<input type="file" name="f" accept="image/jpeg,image/png,image/webp" required></label><label>Nombre del diseño<input name="n" maxlength="40" placeholder="Ej.: French nude con brillos" required></label><fieldset><legend>Estilo</legend>'+
        Object.keys(GALCATS).map(function(k){return '<label class="chk"><input type="checkbox" name="c" value="'+k+'"> '+GALCATS[k]+'</label>'}).join('')+'</fieldset><button class="btn">Subir foto</button></form>'+
      '<h3 class="sub">Fotos que ya trae la web</h3><p class="hint">Desmarca las que no quieras mostrar.</p><form id="hdf">'+GALDEF.map(function(n){return '<label class="chk"><input type="checkbox" name="g" value="'+esc(n)+'"'+(hid.indexOf(n)<0?' checked':'')+'> '+esc(n)+'</label>'}).join('')+'<button class="btn ghost">Guardar</button></form></section>'+
    '<section class="card"><h2>Servicios y precios de la reserva</h2><p class="hint">La duración decide qué horas libres se muestran. El precio se usa al marcar la cita como hecha.</p><div id="svl">'+s.services.map(svRow).join('')+'</div><button type="button" class="btn ghost" id="svadd">+ Añadir servicio</button></section>'+
    '<section class="card"><h2>Horario de reservas</h2><form id="hrf"><div class="hours">'+Object.keys(DN).map(function(d){return '<div class="hd"><b>'+DN[d]+'</b><div>'+rng(d,0)+'</div><div>'+rng(d,1)+'</div></div>'}).join('')+'</div>'+
      '<div class="row3"><label>Aviso mínimo (horas)<input name="mn" type="number" min="0" max="168" value="'+Math.round(st.min_notice_minutes/60)+'"></label><label>Reservar hasta (días)<input name="ad" type="number" min="1" max="365" value="'+st.max_advance_days+'"></label><label>Cancelar hasta (horas antes)<input name="cl" type="number" min="0" max="168" value="'+st.cancel_limit_hours+'"></label></div>'+
      '<div class="row3"><label>Cada cuánto empieza una cita (min)<input name="sp" type="number" min="5" max="120" step="5" value="'+st.slot_step_minutes+'"></label><label>Tu WhatsApp (con prefijo)<input name="wa" inputmode="tel" value="'+esc(st.wa_number)+'"></label><label class="chk"><input type="checkbox" name="on"'+(st.booking_enabled?' checked':'')+'> Reservas en línea abiertas</label></div><button class="btn">Guardar horario</button></form></section>'+
    '<section class="card"><h2>Quién puede entrar al panel</h2><div>'+s.admins.map(function(e){return '<div class="li"><span>'+esc(e)+'</span><button type="button" class="btn sm ghost" data-rm="'+esc(e)+'">Quitar</button></div>'}).join('')+s.invites.map(function(e){return '<div class="li"><span>'+esc(e)+' <small>(invitada, aún no entra)</small></span><button type="button" class="btn sm ghost" data-rm="'+esc(e)+'">Quitar</button></div>'}).join('')+'</div>'+
      '<form id="ivf" class="inline"><input type="email" name="e" placeholder="correo@ejemplo.com" aria-label="Correo a invitar" required><button class="btn">Invitar</button></form><p class="hint">La persona invitada entra en este panel con «Primera vez: crear acceso» usando ese correo.</p></section>');
  function svRow(x){return '<form class="svr" data-id="'+esc(x.id||'')+'"><input name="n" value="'+esc(x.name||'')+'" placeholder="Nombre" aria-label="Nombre del servicio" required maxlength="60"><label>min<input name="d" type="number" min="10" max="480" step="5" value="'+esc(x.duration_min||60)+'"></label><label>€<input name="p" type="number" min="0" step="0.5" value="'+esc(x.price||0)+'"></label><label class="chk"><input type="checkbox" name="a"'+(x.active!==false?' checked':'')+'> Activo</label><button class="btn sm">Guardar</button></form>'}
  $('#txf').onsubmit=function(e){e.preventDefault();var f=e.target,ps=TEXTS.map(function(t){var x=f.elements[t[0]].value.trim();return (c[t[0]]||'')===x?null:rpc('adm_content_set',{p_key:t[0],p_value:x||null})}).filter(Boolean);
    Promise.all(ps).then(function(){toast(ps.length?'Textos guardados: ya se ven en la web':'No había cambios');settings(true)}).catch(fail)};
  $('#svl').onsubmit=function(e){e.preventDefault();var f=e.target;rpc('adm_service_save',{p:{id:f.dataset.id||null,name:val(f,'n'),duration_min:+val(f,'d'),price:+val(f,'p')||0,active:f.elements.a.checked}}).then(chk).then(function(r){f.dataset.id=r.id;toast('Servicio guardado');settings(true)}).catch(fail)};
  $('#svadd').onclick=function(){var d=document.createElement('div');d.innerHTML=svRow({});$('#svl').appendChild(d.firstChild);$('#svl form:last-child input').focus()};
  $('#hrf').onsubmit=function(e){e.preventDefault();var f=e.target,w={},bad=false;Object.keys(DN).forEach(function(d){w[d]=[];[0,1].forEach(function(i){var a=f.elements[d+i+'a'].value,b=f.elements[d+i+'b'].value;if(a&&b){if(b<=a)bad=true;w[d].push([a,b])}})});
    if(bad){toast('En cada tramo la hora final debe ir después de la inicial.',true);return}
    rpc('adm_settings_set',{p:{working_hours:w,min_notice_minutes:Math.round(+val(f,'mn')*60),max_advance_days:+val(f,'ad'),cancel_limit_hours:+val(f,'cl'),slot_step_minutes:+val(f,'sp'),wa_number:val(f,'wa'),booking_enabled:f.elements.on.checked}}).then(function(){toast('Horario guardado');settings(true)}).catch(fail)};
  $('#hdf').onsubmit=function(e){e.preventDefault();var h=GALDEF.filter(function(n){return !$$('input[name=g]',e.target).some(function(i){return i.checked&&i.value===n})});rpc('adm_content_set',{p_key:'gal.ocultar',p_value:h.length?h:null}).then(function(){toast('Galería guardada');settings(true)}).catch(fail)};
  $('#galx').onclick=function(e){var b=e.target.closest('[data-gx]');if(!b)return;var n=extra.slice();n.splice(+b.dataset.gx,1);rpc('adm_content_set',{p_key:'gal.extra',p_value:n.length?n:null}).then(function(){toast('Foto quitada de la web');vWeb()}).catch(fail)};
  $('#upf').onsubmit=function(e){e.preventDefault();var f=e.target,file=f.elements.f.files[0],n=val(f,'n'),cats=$$('input[name=c]:checked',f).map(function(i){return i.value});
    if(!file||!n){toast('Elige una foto y escribe el nombre.',true);return}var b=$('button',f);b.disabled=true;b.textContent='Subiendo…';
    shrink(file).then(upload).then(function(url){var x=extra.concat([{url:url,nombre:n.slice(0,40),estilos:cats.join(' ')||'color'}]);return rpc('adm_content_set',{p_key:'gal.extra',p_value:x})})
      .then(function(){toast('Foto subida: ya está en la web');vWeb()}).catch(function(err){b.disabled=false;b.textContent='Subir foto';fail(err)})};
  $('#ivf').onsubmit=function(e){e.preventDefault();rpc('adm_invite',{p_email:val(e.target,'e'),p_remove:false}).then(chk).then(function(){toast('Invitación guardada');vWeb()}).catch(fail)};
  v.addEventListener('click',function(e){var b=e.target.closest('[data-rm]');if(b)modal('¿Quitar acceso?','<p>'+esc(b.dataset.rm)+' ya no podrá entrar al panel.</p>',function(){return rpc('adm_invite',{p_email:b.dataset.rm,p_remove:true}).then(chk).then(function(){toast('Acceso quitado');vWeb()})},'Quitar')});
})}
/* reduce la foto en el navegador (máx. 1400 px, WebP) para que la web cargue rápido */
function shrink(file){return new Promise(function(res,rej){if(file.size>15e6)return rej(new Error('La foto pesa demasiado (máx. 15 MB).'));var img=new Image(),u=URL.createObjectURL(file);
  img.onload=function(){var k=Math.min(1,1400/Math.max(img.width,img.height)),w=Math.round(img.width*k),h=Math.round(img.height*k),cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(u);
    cv.toBlob(function(b){b?res(b):rej(new Error('No se pudo preparar la foto.'))},'image/webp',.82)};img.onerror=function(){rej(new Error('Ese archivo no es una imagen válida.'))};img.src=u})}
function upload(blob){if(DEMO)return new Promise(function(res){var r=new FileReader();r.onload=function(){res(r.result)};r.readAsDataURL(blob)});
  var path='gal/'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)+'.webp';
  return token().then(function(t){return fetch(SBU+'/storage/v1/object/media/'+path,{method:'POST',headers:{apikey:SBK,Authorization:'Bearer '+t,'Content-Type':'image/webp','x-upsert':'false'},body:blob})})
    .then(function(r){if(!r.ok)throw new Error('No se pudo subir la foto ('+r.status+').');return SBU+'/storage/v1/object/public/media/'+path})}

start();
})();
