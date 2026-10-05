-- ════════════════════════════════════════════════════════════════════════
--  Dra. Yanina Traverso — Esquema base
--  0001_esquema.sql
--
--  Regla de oro de este archivo: la base de datos es la última línea de
--  defensa. Toda invariante que importe se expresa acá como restricción,
--  no solo como validación en la aplicación. Si el código falla, la base
--  igual rechaza el estado inválido.
--
--  Toda tabla activa y fuerza RLS acá mismo, en la línea siguiente a su
--  creación. Activar RLS sin políticas bloquea todo: hasta que 0002 abre lo
--  necesario, ninguna tabla es legible ni escribible con la clave anónima.
--
--  El sitio guarda tres cosas: quién puede entrar al panel (perfiles), lo
--  que deja la gente (consultas y pedidos de turno) y quién hizo qué
--  (auditoría). Nada más. Este proyecto nació de una plantilla de tienda;
--  las tablas de catálogo se sacaron antes de aplicar la primera migración,
--  para no tener en la base de una abogada tablas vacías que nadie mira.
-- ════════════════════════════════════════════════════════════════════════

-- gen_random_uuid() viene en Postgres desde la versión 13: no hace falta
-- la extensión pgcrypto, y cada extensión es una dependencia más.

-- ───────────────────────────── Tipos ─────────────────────────────

create type public.rol_usuario as enum (
  'cliente',  -- cuenta sin permisos. Es el rol con el que nace todo usuario.
  'editor',   -- reservado para un colaborador futuro. Hoy no ve turnos ni consultas.
  'admin'     -- la Dra. (y quien mantiene el sitio). Lee y gestiona todo.
);

create type public.estado_consulta as enum (
  'nueva',
  'en_proceso',
  'respondida',
  'cerrada',
  'descartada'
);

-- Un turno es un PEDIDO: la persona propone un día y una franja, y la Dra.
-- confirma el horario exacto por teléfono. No hay agenda de horarios libres.
create type public.estado_turno as enum (
  'pendiente',   -- recién pedido. Es el único estado que puede fijar el público.
  'confirmado',  -- la Dra. acordó día y hora con la persona.
  'atendido',
  'cancelado'
);

create type public.franja_turno as enum ('manana', 'tarde');

-- ──────────────────────── Función utilitaria ────────────────────────

create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

-- ───────────────────────────── Perfiles ─────────────────────────────
-- Extiende auth.users con el rol. El rol NUNCA se guarda en el token ni se
-- acepta desde el cliente: se lee siempre de esta tabla, del lado servidor.

create table public.perfiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  rol             public.rol_usuario not null default 'cliente',
  nombre          text,
  telefono        text,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create trigger perfiles_actualizado
  before update on public.perfiles
  for each row execute function public.tocar_actualizado_en();

alter table public.perfiles enable row level security;
alter table public.perfiles force row level security;

comment on table public.perfiles is
  'Rol y datos del usuario. El rol solo lo modifica un admin (ver 0002_seguridad.sql).';

-- ────────────────────────── Consultas ──────────────────────────
-- Formulario de contacto. Datos personales: lo mínimo indispensable.

create table public.consultas (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,          -- PII
  email          text,                   -- PII
  telefono       text,                   -- PII
  mensaje        text not null,          -- puede contener datos sensibles
  estado         public.estado_consulta not null default 'nueva',
  -- De qué formulario vino. Hoy hay uno solo; queda para no tener que
  -- migrar el día que haya otro.
  origen         text not null default 'contacto',
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  constraint consultas_nombre_largo check (length(trim(nombre)) between 2 and 120),
  constraint consultas_mensaje_largo check (length(trim(mensaje)) between 5 and 2000),
  constraint consultas_algun_contacto check (email is not null or telefono is not null),
  constraint consultas_email_formato
    check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint consultas_origen_formato
    check (length(origen) <= 30 and origen ~ '^[a-z]+(-[a-z]+)*$')
);

create trigger consultas_actualizado
  before update on public.consultas
  for each row execute function public.tocar_actualizado_en();

create index consultas_estado_idx on public.consultas (estado, creado_en desc);

alter table public.consultas enable row level security;
alter table public.consultas force row level security;

comment on table public.consultas is
  'Datos personales y potencialmente sensibles. Retención: 24 meses. Ver política de privacidad.';

-- ─────────────────────────── Turnos ───────────────────────────
-- Datos personales de gente que consulta a una abogada. Eso es más delicado
-- que una consulta a un comercio: que alguien pidió turno por un tema penal
-- o de familia ya es, por sí solo, información sensible.

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

alter table public.turnos enable row level security;
alter table public.turnos force row level security;

comment on table public.turnos is
  'Datos personales y potencialmente sensibles. Retención: 24 meses. Ver política de privacidad.';

-- ───────────────────── Registro de auditoría ─────────────────────
-- Quién hizo qué, cuándo. Sin esto, un incidente es imposible de investigar.
-- Nunca guarda el contenido de un turno o una consulta (regla 9 de
-- CLAUDE.md): solo la acción y el id.

create table public.log_auditoria (
  id            bigserial primary key,
  actor_id      uuid references auth.users(id) on delete set null,
  actor_email   text,
  accion        text not null,   -- 'turno.estado', 'sesion.ingresar', ...
  entidad       text not null,   -- nombre de tabla
  entidad_id    text,
  datos_antes   jsonb,
  datos_despues jsonb,
  ip            inet,
  user_agent    text,
  creado_en     timestamptz not null default now()
);

create index log_auditoria_entidad_idx on public.log_auditoria (entidad, entidad_id, creado_en desc);
create index log_auditoria_actor_idx on public.log_auditoria (actor_id, creado_en desc);

alter table public.log_auditoria enable row level security;
alter table public.log_auditoria force row level security;

comment on table public.log_auditoria is
  'Solo escritura. Nunca guardar contraseñas, tokens ni el contenido de turnos o consultas.';

-- ──────────────────── Límite de peticiones ────────────────────
-- El rate limiting vive en la base, no en memoria del proceso. En un hosting
-- serverless cada petición puede caer en una instancia distinta, así que un
-- contador en memoria no cuenta nada. Un contador en Postgres es compartido
-- por todas las instancias y sobrevive a los reinicios. La función que lo
-- usa está en 0003_funciones.sql.

create table public.limite_peticiones (
  clave       text primary key,       -- 'turno:<hash de ip>'
  intentos    integer not null default 0,
  ventana_fin timestamptz not null,
  creado_en   timestamptz not null default now()
);

create index limite_peticiones_ventana_idx on public.limite_peticiones (ventana_fin);

alter table public.limite_peticiones enable row level security;
alter table public.limite_peticiones force row level security;
