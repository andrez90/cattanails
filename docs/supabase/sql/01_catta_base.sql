-- Catta Nails 29 · base de datos propia (proyecto Supabase "catta-nails").
-- Todo el acceso pasa por funciones SECURITY DEFINER: las tablas tienen RLS activo y ninguna política,
-- así nadie puede leerlas ni escribirlas directamente con la clave pública.
create extension if not exists btree_gist;
create extension if not exists pgcrypto with schema extensions;

-- ---------- tablas ----------
create table settings (
  id int primary key default 1 check (id = 1),
  timezone text not null default 'Europe/Madrid',
  booking_enabled boolean not null default true,
  min_notice_minutes int not null default 120,
  max_advance_days int not null default 60,
  slot_step_minutes int not null default 30,
  cancel_limit_hours int not null default 4,
  working_hours jsonb not null default '{"mon":[["10:00","14:00"],["16:00","20:00"]],"tue":[["10:00","14:00"],["16:00","20:00"]],"wed":[["10:00","14:00"],["16:00","20:00"]],"thu":[["10:00","14:00"],["16:00","20:00"]],"fri":[["10:00","14:00"],["16:00","20:00"]],"sat":[["10:00","14:00"]],"sun":[]}',
  wa_number text not null default '34602447102',
  updated_at timestamptz not null default now()
);
insert into settings default values;

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  description text,
  duration_min int not null check (duration_min between 10 and 480),
  buffer_min int not null default 0 check (buffer_min between 0 and 120),
  price numeric(10,2) not null default 0 check (price >= 0),
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
insert into services (name, duration_min, sort) values
 ('Manicura',60,1),('Uñas con diseño',90,2),('Mantenimiento',60,3),('Consulta y consejo',30,4);

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null unique,
  email text,
  notes text,
  consent_at timestamptz,
  no_show_count int not null default 0,
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  service_id uuid references services(id),
  service_name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_until timestamptz not null,
  status text not null default 'confirmada' check (status in ('pendiente','confirmada','completada','cancelada','no_show')),
  source text not null default 'web' check (source in ('web','manual','whatsapp')),
  price numeric(10,2) not null default 0,
  public_code text not null unique,
  token_hash text,
  note text,
  internal_notes text,
  consent jsonb,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_double_booking exclude using gist (tstzrange(starts_at, blocked_until, '[)') with &&)
    where (status in ('pendiente','confirmada'))
);
create index on appointments (starts_at);
create index on appointments (customer_id);

create table time_off (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  reason text,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('curso','lista')),
  name text not null,
  phone text,
  instagram text,
  contact text,
  answers jsonb not null default '{}',
  score int,
  status text not null default 'nuevo' check (status in ('nuevo','contactado','interesada','inscrita','descartada')),
  notes text,
  newsletter boolean not null default false,
  consent_text text,
  policy_version text,
  created_at timestamptz not null default now(),
  last_contact_at timestamptz
);
create index on leads (created_at desc);

create table payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  category text not null default 'salon' check (category in ('salon','curso','producto','otro')),
  amount numeric(10,2) not null check (amount > 0),
  method text not null default 'efectivo' check (method in ('efectivo','tarjeta','bizum','transferencia','otro')),
  concept text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table expenses (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'material' check (category in ('material','alquiler','suministros','publicidad','formacion','impuestos','otro')),
  amount numeric(10,2) not null check (amount > 0),
  method text not null default 'efectivo',
  note text,
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table content (
  key text primary key check (key ~ '^[a-z0-9_.]{2,60}$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table admins (user_id uuid primary key, email text not null, created_at timestamptz not null default now());
create table admin_invites (email text primary key, created_at timestamptz not null default now());

create table wa_outbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  to_phone text not null,
  to_name text,
  body text not null,
  params jsonb not null default '[]',
  appointment_id uuid references appointments(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  send_at timestamptz not null default now(),
  status text not null default 'pendiente' check (status in ('pendiente','enviado','manual','error','anulado')),
  attempts int not null default 0,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index on wa_outbox (status, send_at);

create table audit (
  id bigint generated always as identity primary key,
  actor text, action text not null, entity text, entity_id text, data jsonb,
  created_at timestamptz not null default now()
);

do $$ declare t text; begin
  foreach t in array array['settings','services','customers','appointments','time_off','leads','payments','expenses','content','admins','admin_invites','wa_outbox','audit'] loop
    execute format('alter table %I enable row level security', t);
    execute format('revoke all on %I from anon, authenticated', t);
  end loop; end $$;

-- ---------- utilidades ----------
create or replace function set_blocked() returns trigger language plpgsql as $$
declare b int; begin
  select coalesce(buffer_min,0) into b from services where id = new.service_id;
  new.blocked_until := new.ends_at + make_interval(mins => coalesce(b,0));
  new.updated_at := now();
  return new; end $$;
create trigger appointments_blocked before insert or update of starts_at, ends_at, service_id on appointments for each row execute function set_blocked();

create or replace function norm_phone(p text) returns text language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(p,''),'[^0-9+]','','g'); begin
  if d ~ '^[67][0-9]{8}$' then return '+34'||d; end if;
  if d ~ '^00[0-9]{9,15}$' then return '+'||substr(d,3); end if;
  if d ~ '^\+?[0-9]{9,15}$' then return case when left(d,1)='+' then d else '+'||d end; end if;
  return null; end $$;

create or replace function tpl(p_kind text, p_vars jsonb) returns text language plpgsql stable security definer set search_path = public as $$
declare t text; k text; begin
  select value->>p_kind into t from content where key = 'wa.templates';
  if t is null then t := case p_kind
    when 'confirmacion' then 'Hola {nombre}, soy Pilar de Catta Nails 29. Tu cita de {servicio} quedó reservada para el {fecha} a las {hora}. Tu código es {codigo}. Si necesitas cancelar, usa tu enlace: {enlace}'
    when 'recordatorio' then 'Hola {nombre}, te recuerdo tu cita de {servicio} mañana {fecha} a las {hora} en Catta Nails 29. ¡Te espero! Si no puedes venir, cancélala aquí para liberar la hora: {enlace}'
    when 'gracias' then 'Gracias por venir, {nombre}. Si te gustó el resultado, me ayudarías mucho dejando tu opinión en Google o etiquetándome en Instagram @catta_nails29.'
    when 'vuelve' then 'Hola {nombre}, ya toca mantenimiento de tus uñas. Reserva tu hora aquí: {web}/reservar'
    when 'curso' then 'Hola {nombre}, soy Pilar de Catta Nails 29. Recibí tu solicitud para el curso de uñas. Te escribo para contarte fechas, duración y precio. ¿Cuándo te viene bien hablar?'
    when 'lista' then 'Hola {nombre}, soy Pilar de Catta Nails 29. Te apunté a la lista del curso: te aviso en cuanto abra el próximo grupo.'
    else '' end; end if;
  for k in select jsonb_object_keys(p_vars) loop t := replace(t, '{'||k||'}', coalesce(p_vars->>k,'')); end loop;
  return t; end $$;

create or replace function web_url() returns text language sql stable security definer set search_path = public as $$
  select rtrim(coalesce(nullif((select value#>>'{}' from content where key='site.url'),''), ''),'/') $$;

-- ---------- admins ----------
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from admins where user_id = auth.uid()) $$;
create or replace function admin_claim() returns boolean language plpgsql security definer set search_path = public as $$
declare e text := lower(coalesce(auth.jwt()->>'email','')); begin
  if auth.uid() is null then return false; end if;
  if is_admin() then return true; end if;
  if (not exists(select 1 from admins) and e = 'andrezbalanta@gmail.com') or exists(select 1 from admin_invites where email = e) then
    insert into admins(user_id,email) values (auth.uid(), e) on conflict do nothing;
    delete from admin_invites where email = e;
    insert into audit(actor,action) values (e,'admin_claim');
    return true; end if;
  return false; end $$;
create or replace function must_admin() returns void language plpgsql stable security definer set search_path = public as $$
begin if not is_admin() then raise exception 'no_admin' using errcode = '42501'; end if; end $$;
create or replace function log(p_action text, p_entity text, p_id text, p_data jsonb default null) returns void language sql security definer set search_path = public as $$
  insert into audit(actor,action,entity,entity_id,data) values (auth.jwt()->>'email', p_action, p_entity, p_id, p_data) $$;

-- ---------- reservas públicas (mismos nombres que usaba el sitio) ----------
create or replace function catta_services() returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'duration',duration_min) order by sort),'[]'::jsonb)
  from services where active and (select booking_enabled from settings) $$;

create or replace function catta_slots(p_service uuid, p_date date) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o settings; s services; dow text; r jsonb; t timestamp; st timestamptz; en timestamptz; blk timestamptz; res jsonb := '[]'; today date;
begin
  if p_service is null or p_date is null then return res; end if;
  select * into o from settings; if not o.booking_enabled then return res; end if;
  select * into s from services where id = p_service and active; if not found then return res; end if;
  today := (now() at time zone o.timezone)::date;
  if p_date < today or p_date > today + o.max_advance_days then return res; end if;
  dow := (array['sun','mon','tue','wed','thu','fri','sat'])[extract(dow from p_date)::int + 1];
  for r in select * from jsonb_array_elements(coalesce(o.working_hours->dow,'[]')) loop
    t := p_date + (r->>0)::time;
    while t + make_interval(mins=>s.duration_min) <= p_date + (r->>1)::time loop
      st := t at time zone o.timezone; en := st + make_interval(mins=>s.duration_min); blk := en + make_interval(mins=>s.buffer_min);
      if st >= now() + make_interval(mins=>o.min_notice_minutes)
        and not exists (select 1 from appointments a where a.status in ('pendiente','confirmada') and tstzrange(a.starts_at,a.blocked_until,'[)') && tstzrange(st,blk,'[)'))
        and not exists (select 1 from time_off x where tstzrange(x.starts_at,x.ends_at,'[)') && tstzrange(st,en,'[)'))
      then res := res || to_jsonb(to_char(t,'HH24:MI')); end if;
      t := t + make_interval(mins=>o.slot_step_minutes);
    end loop;
  end loop;
  return res; end $$;

create or replace function new_code() returns text language plpgsql volatile set search_path = public as $$
declare c text; begin
  loop c := 'CN-'||(select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',1+floor(random()*32)::int,1),'') from generate_series(1,4));
    exit when not exists(select 1 from appointments where public_code=c); end loop; return c; end $$;

-- encola los mensajes de WhatsApp de una cita (confirmación y recordatorio 24 h antes)
create or replace function queue_appt_msgs(p_appt uuid, p_token text) returns void language plpgsql security definer set search_path = public as $$
declare a appointments; c customers; o settings; v jsonb; begin
  select * into a from appointments where id=p_appt; select * into c from customers where id=a.customer_id; select * into o from settings;
  v := jsonb_build_object('nombre',split_part(c.full_name,' ',1),'servicio',a.service_name,
     'fecha',to_char(a.starts_at at time zone o.timezone,'DD/MM'),'hora',to_char(a.starts_at at time zone o.timezone,'HH24:MI'),
     'codigo',a.public_code,'web',web_url(),
     'enlace',case when p_token is null then web_url()||'/mi-cita' else web_url()||'/mi-cita#c='||a.public_code||'&t='||p_token end);
  insert into wa_outbox(kind,to_phone,to_name,body,params,appointment_id,send_at) values
    ('confirmacion',c.phone,c.full_name,tpl('confirmacion',v),v,a.id,now());
  if a.starts_at - interval '24 hours' > now() + interval '1 hour' then
    insert into wa_outbox(kind,to_phone,to_name,body,params,appointment_id,send_at) values
      ('recordatorio',c.phone,c.full_name,tpl('recordatorio',v),v,a.id,a.starts_at - interval '24 hours'); end if;
end $$;

create or replace function catta_book(p jsonb) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare o settings; s services; v_date date; v_time time; st timestamptz; en timestamptz; v_name text; v_phone text; v_cust uuid; v_code text; v_token text; v_appt uuid;
begin
  select * into o from settings; if not o.booking_enabled then return jsonb_build_object('ok',false,'error','closed'); end if;
  begin v_date := (p->>'date')::date; v_time := (p->>'time')::time; exception when others then return jsonb_build_object('ok',false,'error','bad_input'); end;
  v_name := btrim(coalesce(p->>'name',''));
  if char_length(v_name) < 2 or char_length(v_name) > 80 then return jsonb_build_object('ok',false,'error','bad_name'); end if;
  v_phone := norm_phone(p->>'phone'); if v_phone is null then return jsonb_build_object('ok',false,'error','bad_phone'); end if;
  if coalesce((p->>'consent')::boolean,false) is not true then return jsonb_build_object('ok',false,'error','no_consent'); end if;
  begin select * into s from services where id=(p->>'service_id')::uuid and active; exception when others then return jsonb_build_object('ok',false,'error','bad_service'); end;
  if s.id is null then return jsonb_build_object('ok',false,'error','bad_service'); end if;
  if not (catta_slots(s.id, v_date) ? to_char(v_time,'HH24:MI')) then return jsonb_build_object('ok',false,'error','slot_unavailable'); end if;
  insert into customers(full_name,phone,consent_at) values (v_name,v_phone,now())
    on conflict (phone) do update set full_name=excluded.full_name, consent_at=coalesce(customers.consent_at,now()) returning id into v_cust;
  if (select count(*) from appointments where customer_id=v_cust and created_at > now()-interval '1 hour') >= 3 then return jsonb_build_object('ok',false,'error','too_many'); end if;
  if (select count(*) from appointments where customer_id=v_cust and status in ('pendiente','confirmada') and starts_at > now()) >= 2 then return jsonb_build_object('ok',false,'error','limit_active'); end if;
  st := (v_date + v_time) at time zone o.timezone; en := st + make_interval(mins=>s.duration_min);
  v_code := new_code(); v_token := encode(gen_random_bytes(18),'hex');
  begin
    insert into appointments(customer_id,service_id,service_name,starts_at,ends_at,blocked_until,status,source,price,public_code,token_hash,note,consent)
    values (v_cust,s.id,s.name,st,en,en,'confirmada','web',s.price,v_code,encode(sha256(convert_to(v_token,'utf8')),'hex'),nullif(left(btrim(coalesce(p->>'note','')),400),''),
      jsonb_build_object('policy_version',left(coalesce(p->>'policy_version',''),30),'text',left(coalesce(p->>'consent_text',''),400),'first_time',left(coalesce(p->>'first_time',''),30),'at',now()))
    returning id into v_appt;
  exception when exclusion_violation then return jsonb_build_object('ok',false,'error','slot_unavailable'); end;
  perform queue_appt_msgs(v_appt, v_token);
  return jsonb_build_object('ok',true,'code',v_code,'token',v_token,'service',s.name,'date',to_char(v_date,'YYYY-MM-DD'),'time',to_char(v_time,'HH24:MI'),'duration',s.duration_min);
end $$;

create or replace function catta_get(p_code text, p_token text) returns jsonb language plpgsql stable security definer set search_path = public, extensions as $$
declare a appointments; o settings; begin
  select * into o from settings;
  select * into a from appointments where public_code=upper(btrim(p_code)) and token_hash=encode(sha256(convert_to(coalesce(p_token,''),'utf8')),'hex');
  if not found then return jsonb_build_object('ok',false,'error','not_found'); end if;
  return jsonb_build_object('ok',true,'status',a.status,'service',a.service_name,'date',to_char(a.starts_at at time zone o.timezone,'YYYY-MM-DD'),
    'time',to_char(a.starts_at at time zone o.timezone,'HH24:MI'),'cancel_limit_hours',o.cancel_limit_hours,
    'can_cancel',a.status in ('pendiente','confirmada') and a.starts_at - now() > make_interval(hours=>o.cancel_limit_hours));
end $$;

create or replace function catta_cancel(p_code text, p_token text) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare a appointments; o settings; begin
  select * into o from settings;
  select * into a from appointments where public_code=upper(btrim(p_code)) and token_hash=encode(sha256(convert_to(coalesce(p_token,''),'utf8')),'hex') for update;
  if not found then return jsonb_build_object('ok',false,'error','not_found'); end if;
  if a.status not in ('pendiente','confirmada') then return jsonb_build_object('ok',false,'error','not_active'); end if;
  if a.starts_at - now() <= make_interval(hours=>o.cancel_limit_hours) then return jsonb_build_object('ok',false,'error','too_late','cancel_limit_hours',o.cancel_limit_hours); end if;
  update appointments set status='cancelada', cancel_reason='cliente_web' where id=a.id;
  update wa_outbox set status='anulado' where appointment_id=a.id and status='pendiente';
  return jsonb_build_object('ok',true); end $$;

-- inscripciones al curso y lista de próximas fechas
create or replace function catta_lead(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_kind text := p->>'kind'; v_name text := btrim(coalesce(p->>'name','')); v_phone text; v_contact text := left(btrim(coalesce(p->>'contact','')),60); v_id uuid; v jsonb;
begin
  if v_kind not in ('curso','lista') then return jsonb_build_object('ok',false,'error','bad_kind'); end if;
  if char_length(v_name) < 2 or char_length(v_name) > 80 then return jsonb_build_object('ok',false,'error','bad_name'); end if;
  if coalesce((p->>'consent')::boolean,false) is not true then return jsonb_build_object('ok',false,'error','no_consent'); end if;
  v_phone := norm_phone(coalesce(nullif(p->>'phone',''), case when v_contact ~ '^[+0-9 ()-]{9,}$' then v_contact end));
  if v_kind='curso' and v_phone is null then return jsonb_build_object('ok',false,'error','bad_phone'); end if;
  if v_phone is null and v_contact = '' then return jsonb_build_object('ok',false,'error','bad_contact'); end if;
  if (select count(*) from leads where created_at > now()-interval '1 hour' and ((v_phone is not null and phone=v_phone) or (v_contact<>'' and contact=v_contact))) >= 3
    then return jsonb_build_object('ok',false,'error','too_many'); end if;
  insert into leads(kind,name,phone,instagram,contact,answers,score,newsletter,consent_text,policy_version)
  values (v_kind,v_name,v_phone,left(nullif(btrim(coalesce(p->>'instagram','')),''),40),nullif(v_contact,''),
    coalesce(p->'answers','{}'::jsonb) - array(select k from jsonb_object_keys(coalesce(p->'answers','{}'::jsonb)) k where k !~ '^[a-z_]{2,30}$'),
    least(greatest(coalesce((p->>'score')::int,0),0),100), coalesce((p->>'newsletter')::boolean,false),
    left(coalesce(p->>'consent_text',''),400), left(coalesce(p->>'policy_version',''),30))
  returning id into v_id;
  if v_phone is not null then
    v := jsonb_build_object('nombre',split_part(v_name,' ',1),'web',web_url());
    insert into wa_outbox(kind,to_phone,to_name,body,params,lead_id) values (v_kind,v_phone,v_name,tpl(v_kind,v),v,v_id); end if;
  return jsonb_build_object('ok',true); end $$;

-- textos y ajustes que el sitio público puede leer
create or replace function catta_content() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('c', coalesce((select jsonb_object_agg(key,value) from content where key like 'site.%' or key like 'gal.%'),'{}'::jsonb),
    'wa', (select wa_number from settings)) $$;

-- ---------- panel: resumen ----------
create or replace function adm_dashboard() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o settings; d0 timestamptz; m0 timestamptz; r jsonb; begin
  perform must_admin(); select * into o from settings;
  d0 := date_trunc('day', now() at time zone o.timezone) at time zone o.timezone;
  m0 := date_trunc('month', now() at time zone o.timezone) at time zone o.timezone;
  select jsonb_build_object(
    'hoy', (select coalesce(jsonb_agg(x order by x->>'hora'),'[]') from (select jsonb_build_object('id',a.id,'hora',to_char(a.starts_at at time zone o.timezone,'HH24:MI'),'servicio',a.service_name,'nombre',c.full_name,'telefono',c.phone,'estado',a.status,'nota',a.note) x
        from appointments a join customers c on c.id=a.customer_id where a.starts_at >= d0 and a.starts_at < d0 + interval '1 day' and a.status <> 'cancelada') q),
    'proximas7', (select count(*) from appointments where starts_at >= now() and starts_at < now()+interval '7 days' and status in ('pendiente','confirmada')),
    'ingresos_mes', (select coalesce(sum(amount),0) from payments where paid_at >= m0),
    'gastos_mes', (select coalesce(sum(amount),0) from expenses where spent_at >= m0),
    'citas_mes', (select count(*) from appointments where starts_at >= m0 and status='completada'),
    'no_show_mes', (select count(*) from appointments where starts_at >= m0 and status='no_show'),
    'leads_nuevos', (select count(*) from leads where status='nuevo'),
    'wa_pendientes', (select count(*) from wa_outbox where status='pendiente' and send_at <= now())) into r;
  return r; end $$;

-- ---------- panel: agenda ----------
create or replace function adm_appointments(p_from date, p_to date) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare o settings; begin perform must_admin(); select * into o from settings;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'fecha',to_char(a.starts_at at time zone o.timezone,'YYYY-MM-DD'),'hora',to_char(a.starts_at at time zone o.timezone,'HH24:MI'),
    'fin',to_char(a.ends_at at time zone o.timezone,'HH24:MI'),'servicio',a.service_name,'precio',a.price,'estado',a.status,'origen',a.source,'codigo',a.public_code,'nota',a.note,'interna',a.internal_notes,
    'nombre',c.full_name,'telefono',c.phone,'cliente_id',c.id,'pagado',(select coalesce(sum(amount),0) from payments p where p.appointment_id=a.id)) order by a.starts_at),'[]')
  from appointments a join customers c on c.id=a.customer_id
  where a.starts_at >= (p_from::timestamp at time zone o.timezone) and a.starts_at < ((p_to+1)::timestamp at time zone o.timezone)); end $$;

create or replace function adm_set_status(p_id uuid, p_status text, p_amount numeric default null, p_method text default 'efectivo') returns jsonb language plpgsql security definer set search_path = public as $$
declare a appointments; c customers; v jsonb; begin perform must_admin();
  if p_status not in ('confirmada','completada','cancelada','no_show') then return jsonb_build_object('ok',false,'error','bad_status'); end if;
  select * into a from appointments where id=p_id for update; if not found then return jsonb_build_object('ok',false,'error','not_found'); end if;
  begin update appointments set status=p_status, cancel_reason=case when p_status='cancelada' then 'salon' else cancel_reason end where id=p_id;
  exception when exclusion_violation then return jsonb_build_object('ok',false,'error','slot_unavailable'); end;
  if p_status in ('cancelada','no_show') then update wa_outbox set status='anulado' where appointment_id=p_id and status='pendiente'; end if;
  if p_status='no_show' then update customers set no_show_count=no_show_count+1 where id=a.customer_id; end if;
  if p_status='completada' then
    if coalesce(p_amount,0) > 0 then insert into payments(appointment_id,category,amount,method,concept) values (p_id,'salon',p_amount,coalesce(nullif(p_method,''),'efectivo'),a.service_name); end if;
    select * into c from customers where id=a.customer_id;
    v := jsonb_build_object('nombre',split_part(c.full_name,' ',1),'web',web_url());
    insert into wa_outbox(kind,to_phone,to_name,body,params,appointment_id,send_at) values
      ('gracias',c.phone,c.full_name,tpl('gracias',v),v,p_id,now()+interval '2 hours'),
      ('vuelve',c.phone,c.full_name,tpl('vuelve',v),v,p_id,a.starts_at+interval '21 days');
  end if;
  perform log('estado_cita','appointment',p_id::text,jsonb_build_object('estado',p_status,'importe',p_amount));
  return jsonb_build_object('ok',true); end $$;

create or replace function adm_book(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare o settings; s services; st timestamptz; en timestamptz; v_phone text; v_cust uuid; v_appt uuid; begin perform must_admin(); select * into o from settings;
  select * into s from services where id=(p->>'service_id')::uuid; if not found then return jsonb_build_object('ok',false,'error','bad_service'); end if;
  v_phone := norm_phone(p->>'phone'); if v_phone is null then return jsonb_build_object('ok',false,'error','bad_phone'); end if;
  begin st := ((p->>'date')::date + (p->>'time')::time) at time zone o.timezone; exception when others then return jsonb_build_object('ok',false,'error','bad_input'); end;
  en := st + make_interval(mins=>coalesce((p->>'duration')::int, s.duration_min));
  insert into customers(full_name,phone) values (left(btrim(p->>'name'),80),v_phone) on conflict (phone) do update set full_name=excluded.full_name returning id into v_cust;
  begin insert into appointments(customer_id,service_id,service_name,starts_at,ends_at,blocked_until,status,source,price,public_code,internal_notes)
    values (v_cust,s.id,s.name,st,en,en,'confirmada','manual',coalesce((p->>'price')::numeric,s.price),new_code(),nullif(left(coalesce(p->>'note',''),400),'')) returning id into v_appt;
  exception when exclusion_violation then return jsonb_build_object('ok',false,'error','slot_unavailable'); end;
  if coalesce((p->>'notify')::boolean,true) then perform queue_appt_msgs(v_appt, null); end if;
  perform log('cita_manual','appointment',v_appt::text,null);
  return jsonb_build_object('ok',true,'id',v_appt); end $$;

create or replace function adm_timeoff(p_action text, p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare o settings; begin perform must_admin(); select * into o from settings;
  if p_action='add' then
    insert into time_off(starts_at,ends_at,reason) values (((p->>'from_date')::date + coalesce(p->>'from_time','00:00')::time) at time zone o.timezone,
      ((p->>'to_date')::date + coalesce(p->>'to_time','23:59')::time) at time zone o.timezone, left(coalesce(p->>'reason',''),120));
  elsif p_action='del' then delete from time_off where id=(p->>'id')::uuid; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',id,'desde',to_char(starts_at at time zone o.timezone,'YYYY-MM-DD HH24:MI'),'hasta',to_char(ends_at at time zone o.timezone,'YYYY-MM-DD HH24:MI'),'motivo',reason) order by starts_at),'[]')
    from time_off where ends_at > now()); end $$;

-- ---------- panel: ajustes, servicios y contenido ----------
create or replace function adm_settings_get() returns jsonb language plpgsql stable security definer set search_path = public as $$
begin perform must_admin();
  return jsonb_build_object('settings',(select to_jsonb(s) - 'id' from settings s),
    'services',(select coalesce(jsonb_agg(to_jsonb(x) order by x.sort),'[]') from services x),
    'content',(select coalesce(jsonb_object_agg(key,value),'{}') from content),
    'admins',(select coalesce(jsonb_agg(email order by created_at),'[]') from admins),
    'invites',(select coalesce(jsonb_agg(email),'[]') from admin_invites)); end $$;

create or replace function adm_settings_set(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
begin perform must_admin();
  update settings set
    booking_enabled = coalesce((p->>'booking_enabled')::boolean, booking_enabled),
    min_notice_minutes = coalesce(least(greatest((p->>'min_notice_minutes')::int,0),10080), min_notice_minutes),
    max_advance_days = coalesce(least(greatest((p->>'max_advance_days')::int,1),365), max_advance_days),
    slot_step_minutes = coalesce(least(greatest((p->>'slot_step_minutes')::int,5),120), slot_step_minutes),
    cancel_limit_hours = coalesce(least(greatest((p->>'cancel_limit_hours')::int,0),168), cancel_limit_hours),
    working_hours = coalesce(p->'working_hours', working_hours),
    wa_number = coalesce(nullif(regexp_replace(coalesce(p->>'wa_number',''),'[^0-9]','','g'),''), wa_number),
    updated_at = now();
  perform log('ajustes','settings','1',p); return jsonb_build_object('ok',true); end $$;

create or replace function adm_service_save(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid; begin perform must_admin();
  if nullif(p->>'id','') is null then
    insert into services(name,description,duration_min,buffer_min,price,active,sort) values (left(btrim(p->>'name'),60),left(p->>'description',300),(p->>'duration_min')::int,coalesce((p->>'buffer_min')::int,0),coalesce((p->>'price')::numeric,0),coalesce((p->>'active')::boolean,true),coalesce((p->>'sort')::int,99)) returning id into v_id;
  else update services set name=left(btrim(p->>'name'),60), description=left(p->>'description',300), duration_min=(p->>'duration_min')::int, buffer_min=coalesce((p->>'buffer_min')::int,0),
      price=coalesce((p->>'price')::numeric,0), active=coalesce((p->>'active')::boolean,true), sort=coalesce((p->>'sort')::int,sort) where id=(p->>'id')::uuid returning id into v_id; end if;
  perform log('servicio','service',v_id::text,p); return jsonb_build_object('ok',true,'id',v_id); end $$;

create or replace function adm_content_set(p_key text, p_value jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
begin perform must_admin();
  if p_value is null or p_value = 'null'::jsonb then delete from content where key=p_key;
  else insert into content(key,value,updated_at) values (p_key,p_value,now()) on conflict (key) do update set value=excluded.value, updated_at=now(); end if;
  perform log('contenido','content',p_key,null); return jsonb_build_object('ok',true); end $$;

create or replace function adm_invite(p_email text, p_remove boolean default false) returns jsonb language plpgsql security definer set search_path = public as $$
declare e text := lower(btrim(p_email)); begin perform must_admin();
  if e !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' then return jsonb_build_object('ok',false,'error','bad_email'); end if;
  if p_remove then
    if e = lower(auth.jwt()->>'email') then return jsonb_build_object('ok',false,'error','self'); end if;
    delete from admin_invites where email=e; delete from admins where email=e;
  else insert into admin_invites(email) values (e) on conflict do nothing; end if;
  perform log(case when p_remove then 'admin_quitar' else 'admin_invitar' end,'admin',e,null); return jsonb_build_object('ok',true); end $$;

-- ---------- panel: alumnas / interesadas ----------
create or replace function adm_leads(p_kind text default null, p_status text default null) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin perform must_admin();
  return (select coalesce(jsonb_agg(to_jsonb(l) order by l.created_at desc),'[]') from leads l
    where (p_kind is null or l.kind=p_kind) and (p_status is null or l.status=p_status)); end $$;
create or replace function adm_lead_save(p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
begin perform must_admin();
  update leads set status=coalesce(p->>'status',status), notes=coalesce(left(p->>'notes',2000),notes),
    last_contact_at=case when (p->>'contacted')::boolean then now() else last_contact_at end where id=(p->>'id')::uuid;
  perform log('alumna','lead',p->>'id',p); return jsonb_build_object('ok',true); end $$;

-- ---------- panel: clientas ----------
create or replace function adm_customers(p_q text default '') returns jsonb language plpgsql stable security definer set search_path = public as $$
begin perform must_admin();
  return (select coalesce(jsonb_agg(x order by x->>'ultima' desc nulls last),'[]') from (
    select jsonb_build_object('id',c.id,'nombre',c.full_name,'telefono',c.phone,'notas',c.notes,'no_show',c.no_show_count,
      'visitas',(select count(*) from appointments a where a.customer_id=c.id and a.status='completada'),
      'gastado',(select coalesce(sum(p.amount),0) from payments p join appointments a on a.id=p.appointment_id where a.customer_id=c.id),
      'ultima',(select max(starts_at) from appointments a where a.customer_id=c.id and a.status='completada'),
      'proxima',(select min(starts_at) from appointments a where a.customer_id=c.id and a.status='confirmada' and a.starts_at>now())) x
    from customers c where p_q = '' or c.full_name ilike '%'||p_q||'%' or c.phone like '%'||regexp_replace(p_q,'[^0-9]','','g')||'%' limit 300) q); end $$;
create or replace function adm_customer_note(p_id uuid, p_notes text) returns jsonb language plpgsql security definer set search_path = public as $$
begin perform must_admin(); update customers set notes=left(p_notes,2000) where id=p_id; return jsonb_build_object('ok',true); end $$;

-- ---------- panel: finanzas ----------
create or replace function adm_money(p_action text, p jsonb) returns jsonb language plpgsql security definer set search_path = public as $$
declare o settings; f timestamptz; t timestamptz; begin perform must_admin(); select * into o from settings;
  if p_action='pay' then insert into payments(appointment_id,lead_id,category,amount,method,concept,paid_at) values (nullif(p->>'appointment_id','')::uuid,nullif(p->>'lead_id','')::uuid,
      coalesce(p->>'category','otro'),(p->>'amount')::numeric,coalesce(p->>'method','efectivo'),left(p->>'concept',120),coalesce(((p->>'date')::date + time '12:00') at time zone o.timezone, now()));
  elsif p_action='expense' then insert into expenses(category,amount,method,note,spent_at) values (coalesce(p->>'category','otro'),(p->>'amount')::numeric,coalesce(p->>'method','efectivo'),left(p->>'note',120),coalesce(((p->>'date')::date + time '12:00') at time zone o.timezone, now()));
  elsif p_action='del_pay' then delete from payments where id=(p->>'id')::uuid;
  elsif p_action='del_expense' then delete from expenses where id=(p->>'id')::uuid; end if;
  if p_action <> 'list' then perform log('finanzas_'||p_action,'money',p->>'id',p); end if;
  f := coalesce((p->>'from')::date, date_trunc('month', now() at time zone o.timezone)::date)::timestamp at time zone o.timezone;
  t := (coalesce((p->>'to')::date, (now() at time zone o.timezone)::date) + 1)::timestamp at time zone o.timezone;
  return jsonb_build_object(
    'ingresos',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'fecha',to_char(paid_at at time zone o.timezone,'YYYY-MM-DD'),'categoria',category,'metodo',method,'concepto',concept,'importe',amount) order by paid_at desc),'[]') from payments where paid_at>=f and paid_at<t),
    'gastos',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'fecha',to_char(spent_at at time zone o.timezone,'YYYY-MM-DD'),'categoria',category,'metodo',method,'nota',note,'importe',amount) order by spent_at desc),'[]') from expenses where spent_at>=f and spent_at<t),
    'por_categoria',(select coalesce(jsonb_object_agg(category,s),'{}') from (select category, sum(amount) s from payments where paid_at>=f and paid_at<t group by 1) q),
    'por_metodo',(select coalesce(jsonb_object_agg(method,s),'{}') from (select method, sum(amount) s from payments where paid_at>=f and paid_at<t group by 1) q)); end $$;

-- ---------- panel: WhatsApp ----------
create or replace function adm_wa(p_action text default 'list', p jsonb default '{}') returns jsonb language plpgsql security definer set search_path = public as $$
declare o settings; begin perform must_admin(); select * into o from settings;
  if p_action='mark' then update wa_outbox set status=coalesce(p->>'status','manual'), sent_at=now() where id=(p->>'id')::uuid;
  elsif p_action='send' then insert into wa_outbox(kind,to_phone,to_name,body,send_at) select 'manual', norm_phone(p->>'phone'), left(p->>'name',80), left(p->>'body',1000), now() where norm_phone(p->>'phone') is not null; end if;
  return jsonb_build_object(
    'pendientes',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'tipo',kind,'telefono',to_phone,'nombre',to_name,'texto',body,'cuando',to_char(send_at at time zone o.timezone,'YYYY-MM-DD HH24:MI'),'error',error) order by send_at),'[]')
      from wa_outbox where status in ('pendiente','error') and send_at <= now() + interval '1 day'),
    'enviados',(select coalesce(jsonb_agg(jsonb_build_object('tipo',kind,'nombre',to_name,'estado',status,'cuando',to_char(sent_at at time zone o.timezone,'YYYY-MM-DD HH24:MI')) order by sent_at desc),'[]')
      from (select * from wa_outbox where status in ('enviado','manual') order by sent_at desc limit 40) q),
    'auto', coalesce((select value from content where key='wa.cloud'),'{"activo":false}'::jsonb)); end $$;

-- que solo se puedan llamar estas funciones, y cada grupo con su rol
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function catta_services(), catta_slots(uuid,date), catta_book(jsonb), catta_get(text,text), catta_cancel(text,text), catta_lead(jsonb), catta_content() to anon, authenticated;
grant execute on function is_admin(), admin_claim(), adm_dashboard(), adm_appointments(date,date), adm_set_status(uuid,text,numeric,text), adm_book(jsonb), adm_timeoff(text,jsonb),
  adm_settings_get(), adm_settings_set(jsonb), adm_service_save(jsonb), adm_content_set(text,jsonb), adm_invite(text,boolean), adm_leads(text,text), adm_lead_save(jsonb),
  adm_customers(text), adm_customer_note(uuid,text), adm_money(text,jsonb), adm_wa(text,jsonb) to authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ---------- fotos que sube el panel ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media','media',true,3145728,array['image/webp','image/jpeg','image/png']) on conflict (id) do nothing;
create policy "media lectura" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media sube admin" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media borra admin" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
grant execute on function public.is_admin() to authenticated;

-- ---------- aplicado después (migraciones catta_wa_auto y catta_wa_claim_kinds) ----------
alter function set_blocked() set search_path = public;
alter function norm_phone(text) set search_path = public;
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
create or replace function wa_claim(p_kinds text[], p_limit int default 20) returns setof wa_outbox language sql security definer set search_path = public as $$
  update wa_outbox set attempts = attempts + 1
  where id in (select id from wa_outbox where status='pendiente' and kind = any(p_kinds) and send_at <= now() and attempts < 3
               and send_at > now() - interval '3 days' order by send_at limit p_limit for update skip locked)
  returning * $$;
create or replace function wa_done(p_id uuid, p_ok boolean, p_error text default null) returns void language sql security definer set search_path = public as $$
  update wa_outbox set status = case when p_ok then 'enviado' when attempts >= 3 then 'error' else 'pendiente' end,
    sent_at = case when p_ok then now() else sent_at end, error = left(p_error,300) where id = p_id $$;
create or replace function wa_config() returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce((select value from content where key='wa.cloud'),'{"activo":false}'::jsonb) $$;
revoke execute on function wa_claim(text[],int), wa_done(uuid,boolean,text), wa_config(), web_url() from public, anon, authenticated;
grant execute on function wa_claim(text[],int), wa_done(uuid,boolean,text), wa_config() to service_role;
create extension if not exists pg_net;
create extension if not exists pg_cron;
-- programación cada 5 minutos de la función wa-send (cambia <ANON_KEY> por la clave pública del proyecto)
-- select cron.schedule('catta-wa-send','*/5 * * * *', $$select net.http_post(url:='https://sleckhpzbqbwlvqevtbc.supabase.co/functions/v1/wa-send',
--   headers:='{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb, body:='{}'::jsonb, timeout_milliseconds:=20000)$$);
