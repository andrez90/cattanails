/* ---------- DEMO (solo en la vista previa): imita la base de datos de Catta Nails en el navegador ----------
   Sitio y panel comparten estos datos (localStorage). Los registros de ejemplo llevan "Ejemplo" en el nombre. */
(function(){
var KEY='catta-demo-v3';
var DAYS=['sun','mon','tue','wed','thu','fri','sat'];
function pad(n){return (n<10?'0':'')+n}
function iso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function hm(m){return pad(Math.floor(m/60))+':'+pad(m%60)}
function mins(t){var p=t.split(':');return +p[0]*60+ +p[1]}
function rnd(n){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='';for(var i=0;i<n;i++)o+=a.charAt(Math.floor(Math.random()*a.length));return o}
function uid(){return 'd'+Date.now().toString(36)+rnd(5)}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n)}
function norm(p){var d=String(p||'').replace(/[^0-9+]/g,'');if(/^[67]\d{8}$/.test(d))return '+34'+d;if(/^\+?\d{9,15}$/.test(d))return d.charAt(0)==='+'?d:'+'+d;return null}
function seed(){
  var t=new Date(),s={v:3,
    settings:{timezone:'Europe/Madrid',booking_enabled:true,min_notice_minutes:120,max_advance_days:60,slot_step_minutes:30,cancel_limit_hours:4,wa_number:'34602447102',
      working_hours:{mon:[['09:00','14:00'],['16:00','20:00']],tue:[['09:00','14:00'],['16:00','20:00']],wed:[['09:00','14:00'],['16:00','20:00']],thu:[['09:00','14:00'],['16:00','20:00']],fri:[['09:00','14:00'],['16:00','20:00']],sat:[['10:00','14:00']],sun:[]}},
    services:[{id:'s1',name:'Manos semipermanente',duration_min:90,buffer_min:0,price:0,active:true,sort:1},{id:'s2',name:'Manos con refuerzo (rubber o builder)',duration_min:90,buffer_min:0,price:0,active:true,sort:2},
      {id:'s3',name:'Extensiones (polygel)',duration_min:150,buffer_min:0,price:0,active:true,sort:3},{id:'s4',name:'Pies',duration_min:60,buffer_min:0,price:0,active:true,sort:4}],
    customers:[],appts:[],timeoff:[],leads:[],pays:[],exps:[],content:{},outbox:[],admins:['demo@cattanails']};
  function cust(n,p){var c={id:uid(),full_name:n,phone:p,notes:'',no_show_count:0};s.customers.push(c);return c}
  function ap(c,sv,dayOff,time,st,price){var d=addDays(t,dayOff);var a={id:uid(),customer_id:c.id,service_id:sv.id,service_name:sv.name,date:iso(d),start:mins(time),end:mins(time)+sv.duration_min,status:st,source:dayOff%2?'web':'manual',price:price,code:'CN-'+rnd(4),tok:rnd(24),note:''};s.appts.push(a);return a}
  var c1=cust('Ejemplo · Laura','+34611000001'),c2=cust('Ejemplo · Marta','+34611000002'),c3=cust('Ejemplo · Sara','+34611000003');
  var a1=ap(c1,s.services[1],-6,'10:00','completada',35);s.pays.push({id:uid(),appointment_id:a1.id,category:'salon',amount:35,method:'bizum',concept:'Manos con refuerzo (rubber o builder)',date:a1.date});
  var a2=ap(c2,s.services[0],-3,'16:00','completada',20);s.pays.push({id:uid(),appointment_id:a2.id,category:'salon',amount:20,method:'efectivo',concept:'Manos semipermanente',date:a2.date});
  ap(c3,s.services[2],-2,'11:00','no_show',25);
  var tday=t.getDay()===0?1:0;ap(c2,s.services[1],tday,'17:00','confirmada',35);ap(c1,s.services[3],tday+1,'10:30','confirmada',25);ap(c3,s.services[0],tday+3,'12:00','confirmada',20);
  s.exps.push({id:uid(),category:'material',amount:18.5,method:'tarjeta',note:'Esmaltes (ejemplo)',date:iso(addDays(t,-4))});
  s.leads.push({id:uid(),kind:'curso',name:'Ejemplo · Andrea',phone:'+34611000010',instagram:'@ejemplo.andrea',answers:{objetivo:'Montar mi propio negocio',experiencia:'Empiezo desde cero',inicio:'Lo antes posible',presencial:'Sí, sin problema',inversion:'Tengo presupuesto para empezar'},score:90,status:'nuevo',notes:'',created_at:new Date(t-864e5).toISOString()});
  s.leads.push({id:uid(),kind:'curso',name:'Ejemplo · Carla',phone:'+34611000011',instagram:'@ejemplo.carla',answers:{objetivo:'Es un hobby',experiencia:'Ya hago uñas por mi cuenta',inicio:'Solo me estoy informando',presencial:'Vivo lejos, pero me organizo',inversion:'Depende del precio'},score:30,status:'contactado',notes:'Le escribí el lunes.',created_at:new Date(t-3*864e5).toISOString()});
  s.leads.push({id:uid(),kind:'lista',name:'Ejemplo · Nuria',contact:'@ejemplo.nuria',answers:{},score:0,status:'nuevo',notes:'',created_at:new Date(t-2*864e5).toISOString()});
  s.outbox.push({id:uid(),kind:'curso',to_phone:'+34611000010',to_name:'Ejemplo · Andrea',body:'Hola Andrea, soy Pilar de Catta Nails 29. Recibí tu solicitud para el curso de uñas. Te escribo para contarte fechas, duración y precio. ¿Cuándo te viene bien hablar?',send_at:new Date(t-864e5).toISOString(),status:'pendiente'});
  return s}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===3)return s}catch(e){}var x=seed();save(x);return x}
var MEM=null;
function save(s){MEM=s;try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function st(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===3){MEM=s;return s}}catch(e){}if(MEM)return MEM;MEM=seed();save(MEM);return MEM}
function svc(s,id){for(var i=0;i<s.services.length;i++)if(s.services[i].id===id)return s.services[i]}
function cus(s,id){for(var i=0;i<s.customers.length;i++)if(s.customers[i].id===id)return s.customers[i]}
function busy(s,date,a,b,skip){return s.appts.some(function(x){return x.id!==skip&&(x.status==='confirmada'||x.status==='pendiente')&&x.date===date&&a<x.end&&b>x.start})}
function off(s,date,a,b){return s.timeoff.some(function(x){var f=x.from.split(' '),t=x.to.split(' ');var s1=date+' '+hm(a),e1=date+' '+hm(b);return s1<x.to&&e1>x.from})}
function slots(sid,date){
  var s=st(),sv=svc(s,sid);if(!sv||!sv.active||!date||!s.settings.booking_enabled)return [];var p=date.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);var now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(d<t0||d>addDays(t0,s.settings.max_advance_days))return [];
  var out=[],step=s.settings.slot_step_minutes||30;(s.settings.working_hours[DAYS[d.getDay()]]||[]).forEach(function(r){for(var m=mins(r[0]);m+sv.duration_min<=mins(r[1]);m+=step){
    var at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,m);if(at<new Date(now.getTime()+s.settings.min_notice_minutes*6e4))continue;
    if(!busy(s,date,m,m+sv.duration_min)&&!off(s,date,m,m+sv.duration_min))out.push(hm(m))}});return out}
var TPL={confirmacion:'Hola {nombre}, soy Pilar de Catta Nails 29. Tu cita de {servicio} quedó reservada para el {fecha} a las {hora}. Tu código es {codigo}. Si necesitas cancelar, usa tu enlace: {enlace}',
  recordatorio:'Hola {nombre} 😊 Te recuerdo tu cita de {servicio} mañana {fecha} a las {hora} en Catta Nails 29. ¿Me confirmas que vienes? Respóndeme SÍ. Recuerda llegar a tu hora. Si no puedes venir, cancélala aquí para liberar la hora: {enlace}',
  gracias:'Gracias por venir, {nombre}. Si te gustó el resultado, me ayudarías mucho dejando tu opinión en Google o etiquetándome en Instagram @catta_nails29.',
  vuelve:'Hola {nombre}, ya toca mantenimiento de tus uñas. Reserva tu hora aquí: {web}/reservar',
  curso:'Hola {nombre}, soy Pilar de Catta Nails 29. Recibí tu solicitud para el curso de uñas. Te escribo para contarte fechas, duración y precio. ¿Cuándo te viene bien hablar?',
  lista:'Hola {nombre}, soy Pilar de Catta Nails 29. Te apunté a la lista del curso: te aviso en cuanto abra el próximo grupo.'};
function tpl(s,k,v){var t=(s.content['wa.templates']||{})[k]||TPL[k]||'';Object.keys(v).forEach(function(x){t=t.split('{'+x+'}').join(v[x]||'')});return t}
function queue(s,a,kind,when){var c=cus(s,a.customer_id),p=a.date.split('-');var v={nombre:c.full_name.replace(/^Ejemplo · /,'').split(' ')[0],servicio:a.service_name,fecha:p[2]+'/'+p[1],hora:hm(a.start),codigo:a.code,web:(s.content['site.url']||location.origin),enlace:(s.content['site.url']||location.origin)+'/mi-cita'};
  s.outbox.push({id:uid(),kind:kind,to_phone:c.phone,to_name:c.full_name,body:tpl(s,kind,v),send_at:(when||new Date()).toISOString(),status:'pendiente',appointment_id:a.id})}
function apptDate(a){var p=a.date.split('-');return new Date(+p[0],+p[1]-1,+p[2],0,a.start)}
function ok(x){x=x||{};x.ok=true;return x}
var F={
  catta_services:function(){var s=st();return s.settings.booking_enabled?s.services.filter(function(x){return x.active}).sort(function(a,b){return a.sort-b.sort}).map(function(x){return {id:x.id,name:x.name,duration:x.duration_min}}):[]},
  catta_slots:function(b){return slots(b.p_service,b.p_date)},
  catta_book:function(b){var p=b.p,s=st(),sv=svc(s,p.service_id);
    if(!p.consent)return {ok:false,error:'no_consent'};if(!sv)return {ok:false,error:'bad_service'};var ph=norm(p.phone);if(!ph)return {ok:false,error:'bad_phone'};
    if(slots(p.service_id,p.date).indexOf(p.time)<0)return {ok:false,error:'slot_unavailable'};
    var c=s.customers.filter(function(x){return x.phone===ph})[0];if(!c){c={id:uid(),full_name:p.name,phone:ph,notes:'',no_show_count:0};s.customers.push(c)}else c.full_name=p.name;
    var a={id:uid(),customer_id:c.id,service_id:sv.id,service_name:sv.name,date:p.date,start:mins(p.time),end:mins(p.time)+sv.duration_min,status:'confirmada',source:'web',price:sv.price,code:'CN-'+rnd(4),tok:rnd(24),note:p.note||''};
    s.appts.push(a);queue(s,a,'confirmacion');var r=new Date(apptDate(a)-864e5);if(r>new Date())queue(s,a,'recordatorio',r);save(s);
    return {ok:true,code:a.code,token:a.tok,service:sv.name,date:p.date,time:p.time,duration:sv.duration_min}},
  catta_get:function(b){var s=st(),a=s.appts.filter(function(x){return x.code===b.p_code&&x.tok===b.p_token})[0];if(!a)return {ok:false,error:'not_found'};
    return {ok:true,status:a.status,service:a.service_name,date:a.date,time:hm(a.start),cancel_limit_hours:s.settings.cancel_limit_hours,can_cancel:a.status==='confirmada'&&apptDate(a)-new Date()>s.settings.cancel_limit_hours*36e5}},
  catta_cancel:function(b){var s=st(),a=s.appts.filter(function(x){return x.code===b.p_code&&x.tok===b.p_token})[0];if(!a)return {ok:false,error:'not_found'};if(a.status!=='confirmada')return {ok:false,error:'not_active'};
    if(apptDate(a)-new Date()<=s.settings.cancel_limit_hours*36e5)return {ok:false,error:'too_late',cancel_limit_hours:s.settings.cancel_limit_hours};
    a.status='cancelada';s.outbox.forEach(function(m){if(m.appointment_id===a.id&&m.status==='pendiente')m.status='anulado'});save(s);return {ok:true}},
  catta_lead:function(b){var p=b.p||b,s=st();if(!p.consent)return {ok:false,error:'no_consent'};var ph=norm(p.phone||p.contact);
    var l={id:uid(),kind:p.kind,name:p.name,phone:ph,instagram:p.instagram||'',contact:p.contact||'',answers:p.answers||{},score:p.score||0,status:'nuevo',notes:'',created_at:new Date().toISOString()};s.leads.unshift(l);
    if(ph)s.outbox.push({id:uid(),kind:p.kind,to_phone:ph,to_name:p.name,body:tpl(s,p.kind,{nombre:String(p.name).split(' ')[0],web:(s.content['site.url']||location.origin)}),send_at:new Date().toISOString(),status:'pendiente'});save(s);return {ok:true}},
  catta_content:function(){var s=st(),c={};Object.keys(s.content).forEach(function(k){if(/^(site|gal)\./.test(k))c[k]=s.content[k]});return {c:c,wa:s.settings.wa_number}},
  admin_claim:function(){return true},
  adm_dashboard:function(){var s=st(),t=iso(new Date()),m0=t.slice(0,8)+'01';
    return {hoy:s.appts.filter(function(a){return a.date===t&&a.status!=='cancelada'}).sort(function(a,b){return a.start-b.start}).map(function(a){var c=cus(s,a.customer_id);return {id:a.id,hora:hm(a.start),servicio:a.service_name,nombre:c.full_name,telefono:c.phone,estado:a.status,nota:a.note}}),
      proximas7:s.appts.filter(function(a){var d=apptDate(a);return a.status==='confirmada'&&d>=new Date()&&d<addDays(new Date(),7)}).length,
      ingresos_mes:s.pays.filter(function(p){return p.date>=m0}).reduce(function(x,p){return x+ +p.amount},0),gastos_mes:s.exps.filter(function(p){return p.date>=m0}).reduce(function(x,p){return x+ +p.amount},0),
      citas_mes:s.appts.filter(function(a){return a.date>=m0&&a.status==='completada'}).length,no_show_mes:s.appts.filter(function(a){return a.date>=m0&&a.status==='no_show'}).length,
      leads_nuevos:s.leads.filter(function(l){return l.status==='nuevo'}).length,wa_pendientes:s.outbox.filter(function(m){return m.status==='pendiente'&&new Date(m.send_at)<=new Date()}).length}},
  adm_appointments:function(b){var s=st();return s.appts.filter(function(a){return a.date>=b.p_from&&a.date<=b.p_to}).sort(function(a,b2){return (a.date+hm(a.start))<(b2.date+hm(b2.start))?-1:1}).map(function(a){var c=cus(s,a.customer_id);
    return {id:a.id,fecha:a.date,hora:hm(a.start),fin:hm(a.end),servicio:a.service_name,precio:a.price,estado:a.status,origen:a.source,codigo:a.code,nota:a.note,interna:a.internal||'',nombre:c.full_name,telefono:c.phone,cliente_id:c.id,service_id:a.service_id,asistencia:!!a.conf,
      pagado:s.pays.filter(function(p){return p.appointment_id===a.id}).reduce(function(x,p){return x+ +p.amount},0)}})},
  adm_set_status:function(b){var s=st(),a=s.appts.filter(function(x){return x.id===b.p_id})[0];if(!a)return {ok:false,error:'not_found'};
    if(b.p_status==='confirmada'&&busy(s,a.date,a.start,a.end,a.id))return {ok:false,error:'slot_unavailable'};a.status=b.p_status;
    if(b.p_status==='cancelada'||b.p_status==='no_show')s.outbox.forEach(function(m){if(m.appointment_id===a.id&&m.status==='pendiente')m.status='anulado'});
    if(b.p_status==='no_show'){var c=cus(s,a.customer_id);c.no_show_count++}
    if(b.p_status==='completada'){if(+b.p_amount>0)s.pays.push({id:uid(),appointment_id:a.id,category:'salon',amount:+b.p_amount,method:b.p_method||'efectivo',concept:a.service_name,date:iso(new Date())});
      queue(s,a,'gracias',new Date(Date.now()+2*36e5));if(!s.appts.some(function(x){return x.customer_id===a.customer_id&&x.id!==a.id&&x.status==='confirmada'&&apptDate(x)>new Date()}))queue(s,a,'vuelve',addDays(apptDate(a),28))}
    save(s);return ok()},
  adm_book:function(b){var p=b.p,s=st(),sv=svc(s,p.service_id),ph=norm(p.phone);if(!sv)return {ok:false,error:'bad_service'};if(!ph)return {ok:false,error:'bad_phone'};
    var st0=mins(p.time),en=st0+(+p.duration||sv.duration_min);if(busy(s,p.date,st0,en))return {ok:false,error:'slot_unavailable'};
    var c=s.customers.filter(function(x){return x.phone===ph})[0];if(!c){c={id:uid(),full_name:p.name,phone:ph,notes:'',no_show_count:0};s.customers.push(c)}
    var a={id:uid(),customer_id:c.id,service_id:sv.id,service_name:sv.name,date:p.date,start:st0,end:en,status:'confirmada',source:'manual',price:p.price===''||p.price==null?sv.price:+p.price,code:'CN-'+rnd(4),tok:rnd(24),note:'',internal:p.note||''};
    s.outbox.forEach(function(m){if(m.kind==='vuelve'&&m.status==='pendiente'&&s.appts.some(function(x){return x.id===m.appointment_id&&x.customer_id===c.id}))m.status='anulado'});
    s.appts.push(a);if(p.notify!==false){queue(s,a,'confirmacion');var r=new Date(apptDate(a)-864e5);if(r>new Date())queue(s,a,'recordatorio',r)}save(s);return ok({id:a.id})},
  adm_confirm:function(b){var s=st(),a=s.appts.filter(function(x){return x.id===b.p_id})[0];if(a)a.conf=b.p_on!==false;save(s);return ok()},
  adm_timeoff:function(b){var s=st(),p=b.p||{};if(b.p_action==='add')s.timeoff.push({id:uid(),from:p.from_date+' '+(p.from_time||'00:00'),to:p.to_date+' '+(p.to_time||'23:59'),reason:p.reason||''});
    if(b.p_action==='del')s.timeoff=s.timeoff.filter(function(x){return x.id!==p.id});save(s);var n=iso(new Date());
    return s.timeoff.filter(function(x){return x.to.slice(0,10)>=n}).map(function(x){return {id:x.id,desde:x.from,hasta:x.to,motivo:x.reason}})},
  adm_settings_get:function(){var s=st();return {settings:s.settings,services:s.services.slice().sort(function(a,b){return a.sort-b.sort}),content:s.content,admins:s.admins,invites:s.invites||[]}},
  adm_settings_set:function(b){var s=st(),p=b.p;['booking_enabled','min_notice_minutes','max_advance_days','slot_step_minutes','cancel_limit_hours','working_hours','wa_number'].forEach(function(k){if(p[k]!=null&&p[k]!=='')s.settings[k]=k==='wa_number'?String(p[k]).replace(/\D/g,''):p[k]});save(s);return ok()},
  adm_service_save:function(b){var s=st(),p=b.p,x=p.id?svc(s,p.id):null;if(!x){x={id:uid(),sort:99};s.services.push(x)}
    x.name=p.name;x.duration_min=+p.duration_min;x.buffer_min=+p.buffer_min||0;x.price=+p.price||0;x.active=p.active!==false;if(p.sort!=null)x.sort=+p.sort;save(s);return ok({id:x.id})},
  adm_content_set:function(b){var s=st();if(b.p_value==null||b.p_value==='')delete s.content[b.p_key];else s.content[b.p_key]=b.p_value;save(s);return ok()},
  adm_invite:function(b){var s=st();s.invites=s.invites||[];var e=String(b.p_email).toLowerCase().trim();if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e))return {ok:false,error:'bad_email'};
    if(b.p_remove){s.invites=s.invites.filter(function(x){return x!==e});s.admins=s.admins.filter(function(x){return x!==e})}else if(s.invites.indexOf(e)<0)s.invites.push(e);save(s);return ok()},
  adm_leads:function(b){var s=st();return s.leads.filter(function(l){return (!b.p_kind||l.kind===b.p_kind)&&(!b.p_status||l.status===b.p_status)})},
  adm_lead_save:function(b){var s=st(),p=b.p,l=s.leads.filter(function(x){return x.id===p.id})[0];if(l){if(p.status)l.status=p.status;if(p.notes!=null)l.notes=p.notes;if(p.contacted)l.last_contact_at=new Date().toISOString()}save(s);return ok()},
  adm_customers:function(b){var s=st(),q=String(b.p_q||'').toLowerCase(),qd=q.replace(/\D/g,'');
    return s.customers.filter(function(c){return !q||c.full_name.toLowerCase().indexOf(q)>=0||(qd&&c.phone.indexOf(qd)>=0)}).map(function(c){var as=s.appts.filter(function(a){return a.customer_id===c.id});
      var done=as.filter(function(a){return a.status==='completada'});var nx=as.filter(function(a){return a.status==='confirmada'&&apptDate(a)>new Date()}).sort(function(a,b){return apptDate(a)-apptDate(b)})[0];
      return {id:c.id,nombre:c.full_name,telefono:c.phone,notas:c.notes,no_show:c.no_show_count,visitas:done.length,gastado:s.pays.filter(function(p){return as.some(function(a){return a.id===p.appointment_id})}).reduce(function(x,p){return x+ +p.amount},0),
        ultima:done.length?apptDate(done[done.length-1]).toISOString():null,proxima:nx?apptDate(nx).toISOString():null}})},
  adm_customer_note:function(b){var s=st(),c=cus(s,b.p_id);if(c)c.notes=b.p_notes;save(s);return ok()},
  adm_money:function(b){var s=st(),p=b.p||{},a=b.p_action;
    if(a==='pay')s.pays.push({id:uid(),appointment_id:p.appointment_id||null,lead_id:p.lead_id||null,category:p.category||'otro',amount:+p.amount,method:p.method||'efectivo',concept:p.concept||'',date:p.date||iso(new Date())});
    if(a==='expense')s.exps.push({id:uid(),category:p.category||'otro',amount:+p.amount,method:p.method||'efectivo',note:p.note||'',date:p.date||iso(new Date())});
    if(a==='del_pay')s.pays=s.pays.filter(function(x){return x.id!==p.id});if(a==='del_expense')s.exps=s.exps.filter(function(x){return x.id!==p.id});save(s);
    var f=p.from||iso(new Date()).slice(0,8)+'01',t=p.to||iso(new Date());function inr(x){return x.date>=f&&x.date<=t}
    var ing=s.pays.filter(inr),gas=s.exps.filter(inr),pc={},pm={};ing.forEach(function(x){pc[x.category]=(pc[x.category]||0)+ +x.amount;pm[x.method]=(pm[x.method]||0)+ +x.amount});
    return {ingresos:ing.map(function(x){return {id:x.id,fecha:x.date,categoria:x.category,metodo:x.method,concepto:x.concept,importe:x.amount}}).reverse(),gastos:gas.map(function(x){return {id:x.id,fecha:x.date,categoria:x.category,metodo:x.method,nota:x.note,importe:x.amount}}).reverse(),por_categoria:pc,por_metodo:pm}},
  adm_wa:function(b){var s=st(),p=b.p||{};if(b.p_action==='mark'){var m=s.outbox.filter(function(x){return x.id===p.id})[0];if(m){m.status=p.status||'manual';m.sent_at=new Date().toISOString()}save(s)}
    var lim=new Date(Date.now()+864e5),f=function(d){var x=new Date(d);return iso(x)+' '+hm(x.getHours()*60+x.getMinutes())};
    return {pendientes:s.outbox.filter(function(m){return (m.status==='pendiente'||m.status==='error')&&new Date(m.send_at)<=lim}).map(function(m){return {id:m.id,tipo:m.kind,telefono:m.to_phone,nombre:m.to_name,texto:m.body,cuando:f(m.send_at)}}),
      enviados:s.outbox.filter(function(m){return m.status==='enviado'||m.status==='manual'}).slice(-40).reverse().map(function(m){return {tipo:m.kind,nombre:m.to_name,estado:m.status,cuando:m.sent_at?f(m.sent_at):''}}),
      auto:s.content['wa.cloud']||{activo:false}}}
};
window.__demoRpc=function(name,body){return new Promise(function(res,rej){setTimeout(function(){if(!F[name])return rej(new Error('demo: '+name));try{res(F[name](body||{}))}catch(e){rej(e)}},200)})};
window.__demoReset=function(){try{localStorage.removeItem(KEY)}catch(e){}MEM=null};
document.addEventListener('DOMContentLoaded',function(){
  var h=document.querySelector('#reservaForm,#mgWrap');if(!h)return;
  var n=document.createElement('p');n.className='demo-note';n.textContent='Vista previa con horas de ejemplo guardadas en tu navegador. En el sitio publicado se conecta a la agenda real de Pilar.';
  var host=document.querySelector('#reservaForm')?document.querySelector('.fcard'):document.querySelector('#mgWrap');if(host)host.insertBefore(n,host.firstChild)});
})();
