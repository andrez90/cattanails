/* ---------- DEMO (solo en la vista previa): simula las funciones catta_* con el horario de ejemplo ---------- */
(function(){
var KEY='catta-demo-v1',SV=[{id:'s1',name:'Manicura',duration:60},{id:'s2',name:'Uñas con diseño',duration:90},{id:'s3',name:'Mantenimiento',duration:60},{id:'s4',name:'Consulta y consejo',duration:30}];
var HRS={1:[[600,840],[960,1200]],2:[[600,840],[960,1200]],3:[[600,840],[960,1200]],4:[[600,840],[960,1200]],5:[[600,840],[960,1200]],6:[[600,840]]};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{a:[]}}catch(e){return {a:[]}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function mins(t){var p=t.split(':');return +p[0]*60+ +p[1]}
function hm(m){return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)}
function dur(id){for(var i=0;i<SV.length;i++)if(SV[i].id===id)return SV[i]}
function busy(s,date,a,b){return s.a.some(function(x){return x.st==='confirmada'&&x.date===date&&a<x.end&&b>x.start})}
function slots(sid,date){
  var sv=dur(sid);if(!sv||!date)return [];var p=date.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);var now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  if(d<t0||d>new Date(t0.getTime()+60*864e5))return [];
  var s=load(),out=[];(HRS[d.getDay()]||[]).forEach(function(r){for(var m=r[0];m+sv.duration<=r[1];m+=30){
    var at=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,m);if(at<new Date(now.getTime()+120*6e4))continue;
    if(!busy(s,date,m,m+sv.duration))out.push(hm(m))}});return out}
function rnd(n){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',o='';for(var i=0;i<n;i++)o+=a.charAt(Math.floor(Math.random()*a.length));return o}
var F={
  catta_services:function(){return SV},
  catta_slots:function(b){return slots(b.p_service,b.p_date)},
  catta_book:function(b){var p=b.p,sv=dur(p.service_id);
    if(!p.consent)return {ok:false,error:'no_consent'};
    if(!sv)return {ok:false,error:'bad_service'};
    if(slots(p.service_id,p.date).indexOf(p.time)<0)return {ok:false,error:'slot_unavailable'};
    var s=load(),code='CN-'+rnd(4),tok=rnd(24),m=mins(p.time);
    s.a.push({code:code,tok:tok,date:p.date,time:p.time,start:m,end:m+sv.duration,service:sv.name,st:'confirmada'});save(s);
    return {ok:true,code:code,token:tok,service:sv.name,date:p.date,time:p.time,duration:sv.duration}},
  catta_get:function(b){var s=load(),a=s.a.filter(function(x){return x.code===b.p_code&&x.tok===b.p_token})[0];
    if(!a)return {ok:false,error:'not_found'};
    var at=new Date(+a.date.slice(0,4),+a.date.slice(5,7)-1,+a.date.slice(8,10),0,a.start);
    return {ok:true,status:a.st,service:a.service,date:a.date,time:a.time,cancel_limit_hours:4,can_cancel:a.st==='confirmada'&&at-new Date()>4*36e5}},
  catta_cancel:function(b){var s=load(),a=s.a.filter(function(x){return x.code===b.p_code&&x.tok===b.p_token})[0];
    if(!a)return {ok:false,error:'not_found'};if(a.st!=='confirmada')return {ok:false,error:'not_active'};
    var at=new Date(+a.date.slice(0,4),+a.date.slice(5,7)-1,+a.date.slice(8,10),0,a.start);
    if(at-new Date()<=4*36e5)return {ok:false,error:'too_late',cancel_limit_hours:4};
    a.st='cancelada';save(s);return {ok:true}}
};
window.__demoRpc=function(name,body){return new Promise(function(res){setTimeout(function(){res(F[name](body||{}))},250)})};
document.addEventListener('DOMContentLoaded',function(){
  var h=document.querySelector('#reservaForm,#mgWrap');if(!h)return;
  var n=document.createElement('p');n.className='demo-note';n.textContent='Vista previa con horas de ejemplo guardadas en tu navegador. En el sitio publicado se conecta a la agenda real de Pilar.';
  var host=document.querySelector('#reservaForm')?document.querySelector('.fcard'):document.querySelector('#mgWrap');if(host)host.insertBefore(n,host.firstChild)});
})();
