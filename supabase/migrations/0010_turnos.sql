-- ════════════════════════════════════════════════════════════════════════
--  Pedidos de turno
--  0010_turnos.sql
--
--  Un turno es un PEDIDO: la persona propone un día y una franja, y la Dra.
--  confirma el horario exacto por teléfono. No hay agenda de horarios libres.
--
--  Contiene datos personales de gente que consulta a una abogada. Eso es más
--  delicado que una consulta a un comercio: que alguien pidió turno por un
--  tema penal o de familia ya es, por sí solo, información sensible. Por eso
--  la tabla nace con RLS forzada y sin lectura pública de ningún tipo.
-- ════════════════════════════════════════════════════════════════════════

create type public.estado_turno as enum (
  'pendiente',   -- recién pedido. Es el único estado que puede fijar el público.
  'confirmado',  -- la Dra. acordó día y hora con la persona.
  'atendido',
  'cancelado'
);

create type public.franja_turno as enum ('manana', 'tarde');

create table public.turnos (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null,          -- PII
  telefono         text not null,          -- PII
  email            text,                   -- PII
  -- Slug de un área de práctica (src/lib/areas.ts) u 'otra'. Es texto y no un
  -- enum para que agregar un área no exija una migración; el formato sí se
  -- restringe, y la lista exacta la valida Zod en el servidor.
  area             text not null,
  fecha_preferida  date not null,
  franja           public.franja_turno not null,
  motivo           text,                   -- puede contener datos sensibles
  estado           public.estado_turno not null default 'pendiente',
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),

  constraint turnos_nombre_largo
    check (length(trim(nombre)) between 2 and 120),
  constraint turnos_telefono_formato
    check (telefono ~ '^[0-9 +()-]{6,25}$'),
  constraint turnos_email_formato
    check (email is null or (length(email) <= 200 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  constraint turnos_area_formato
    check (length(area) <= 60 and area ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint turnos_motivo_largo
    check (motivo is null or length(motivo) <= 500),
  -- El estudio atiende de lunes a viernes. isodow: 1 = lunes … 7 = domingo.
  -- Vive acá además de en Zod: si mañana alguien carga turnos con un script,
  -- la base igual rechaza un sábado.
  constraint turnos_dia_habil
    check (extract(isodow from fecha_preferida) between 1 and 5)
);

create trigger turnos_actualizado
  before update on public.turnos
  for each row execute function public.tocar_actualizado_en();

-- El panel lista primero lo pendiente, por fecha.
create index turnos_estado_fecha_idx on public.turnos (estado, fecha_preferida);

comment on table public.turnos is
  'Datos personales y potencialmente sensibles. Retención: 24 meses desde el turno. Ver política de privacidad.';

-- ═══════════════════════════ Seguridad ═══════════════════════════

alter table public.turnos enable row level security;
alter table public.turnos force row level security;

-- Cualquiera puede pedir un turno, pero solo en estado 'pendiente': nadie
-- del público puede insertar un turno ya "confirmado". El abuso de volumen se
-- contiene con el límite de peticiones en la aplicación (ver 0004).
create policy turnos_insert_publico on public.turnos
  for insert to anon, authenticated
  with check (estado = 'pendiente');

-- Nadie del público lee turnos, ni los propios: no hay forma seria de probar
-- que un anónimo es quien pidió un turno anterior. Un editor tampoco: solo
-- administradores.
create policy turnos_select_admin on public.turnos
  for select to authenticated using (public.es_admin());

create policy turnos_update_admin on public.turnos
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy turnos_delete_admin on public.turnos
  for delete to authenticated using (public.es_admin());
