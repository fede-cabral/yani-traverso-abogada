-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Esquema base
--  0001_schema.sql
--
--  Regla de oro de este archivo: la base de datos es la última línea de
--  defensa. Toda invariante que importe se expresa acá como restricción,
--  no solo como validación en la aplicación. Si el código falla, la base
--  igual rechaza el estado inválido.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────── Tipos ─────────────────────────────

-- La clasificación legal de cada producto.
-- Es el campo más importante del sistema: determina qué se puede publicar.
create type public.clasificacion_legal as enum (
  'no_controlado',  -- verificado como de libre venta. Solo estos se publican.
  'en_revision',    -- todavía sin verificar. Se carga pero NO se publica.
  'controlado'      -- no se comercializa. La base impide publicarlo.
);

create type public.rol_usuario as enum (
  'cliente',  -- compra, ve sus propios pedidos y consultas
  'editor',   -- carga y edita productos; no toca precios publicados ni datos de clientes
  'admin'     -- todo
);

create type public.estado_consulta as enum (
  'nueva',
  'en_proceso',
  'respondida',
  'cerrada',
  'descartada'
);

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

comment on table public.perfiles is
  'Rol y datos del usuario. El rol solo lo modifica un admin (ver políticas RLS en 0002).';

-- ──────────────────────────── Categorías ────────────────────────────

create table public.categorias (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  nombre          text not null,
  descripcion     text,
  orden           integer not null default 0,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),

  constraint categorias_slug_formato
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categorias_nombre_no_vacio
    check (length(trim(nombre)) > 0)
);

create trigger categorias_actualizado
  before update on public.categorias
  for each row execute function public.tocar_actualizado_en();

create index categorias_orden_idx on public.categorias (orden, nombre);

-- ───────────────────────────── Productos ─────────────────────────────

create table public.productos (
  id                 uuid primary key default gen_random_uuid(),
  sku                text not null unique,
  slug               text not null unique,
  nombre             text not null,
  categoria_id       uuid not null references public.categorias(id) on delete restrict,

  proveedor          text,
  material           text,
  descripcion_corta  text,
  descripcion        text,

  -- Precios en CENTAVOS de peso, como entero. Nunca float:
  -- 0.1 + 0.2 no da 0.3 en punto flotante, y con plata eso es inaceptable.
  precio_centavos            bigint not null default 0,
  precio_mayorista_centavos  bigint,

  -- ── Bloque de cumplimiento legal ──
  clasificacion      public.clasificacion_legal not null default 'en_revision',
  verificado_por     text,
  verificado_en      timestamptz,
  nota_verificacion  text,

  publicado          boolean not null default false,
  destacado          boolean not null default false,
  novedad            boolean not null default false,

  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now(),

  constraint productos_slug_formato
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint productos_sku_formato
    check (sku ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  constraint productos_precio_no_negativo
    check (precio_centavos >= 0),
  constraint productos_mayorista_no_negativo
    check (precio_mayorista_centavos is null or precio_mayorista_centavos >= 0),

  -- ════════════════════════════════════════════════════════════════
  --  LA RESTRICCIÓN QUE PROTEGE EL NEGOCIO
  --
  --  Un producto solo puede estar publicado si:
  --    1. está clasificado como no controlado, Y
  --    2. alguien con nombre y apellido lo verificó, Y
  --    3. quedó registrada la fecha de esa verificación.
  --
  --  Esto vive en la base, no en la aplicación, a propósito. Aunque un bug
  --  del panel, un script de importación o alguien con acceso directo a la
  --  base intenten publicar algo sin verificar, Postgres lo rechaza.
  -- ════════════════════════════════════════════════════════════════
  constraint productos_solo_publica_lo_verificado check (
    publicado = false
    or (
      clasificacion = 'no_controlado'
      and verificado_por is not null
      and length(trim(verificado_por)) > 0
      and verificado_en is not null
    )
  )
);

create trigger productos_actualizado
  before update on public.productos
  for each row execute function public.tocar_actualizado_en();

-- Índices pensados para las consultas reales del catálogo.
create index productos_publicados_idx
  on public.productos (categoria_id, nombre)
  where publicado = true;

create index productos_destacados_idx
  on public.productos (actualizado_en desc)
  where publicado = true and destacado = true;

create index productos_clasificacion_idx
  on public.productos (clasificacion);

-- Búsqueda de texto en español, sin depender de ILIKE '%...%' que no escala.
create index productos_busqueda_idx on public.productos
  using gin (to_tsvector('spanish',
    coalesce(nombre, '') || ' ' ||
    coalesce(descripcion_corta, '') || ' ' ||
    coalesce(material, '')));

comment on column public.productos.clasificacion is
  'Determina si el producto es publicable. Ver restricción productos_solo_publica_lo_verificado.';
comment on column public.productos.precio_centavos is
  'Centavos de peso argentino, entero. $85.000 se guarda como 8500000.';

-- ───────────────────────────── Variantes ─────────────────────────────
-- Talle / color / numeración. El stock vive acá, no en el producto.

create table public.variantes (
  id              uuid primary key default gen_random_uuid(),
  producto_id     uuid not null references public.productos(id) on delete cascade,
  sku             text not null unique,
  talle           text,
  color           text,
  stock           integer not null default 0,
  -- Sobrescribe el precio del producto solo si esta variante vale distinto.
  precio_centavos bigint,
  activa          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now(),

  constraint variantes_stock_no_negativo check (stock >= 0),
  constraint variantes_precio_no_negativo
    check (precio_centavos is null or precio_centavos >= 0),
  constraint variantes_sku_formato
    check (sku ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'),
  -- Una misma combinación de talle y color no puede repetirse en un producto.
  constraint variantes_combinacion_unica
    unique (producto_id, talle, color)
);

create trigger variantes_actualizado
  before update on public.variantes
  for each row execute function public.tocar_actualizado_en();

create index variantes_producto_idx on public.variantes (producto_id) where activa = true;

-- ────────────────────────── Imágenes ──────────────────────────

create table public.imagenes_producto (
  id            uuid primary key default gen_random_uuid(),
  producto_id   uuid not null references public.productos(id) on delete cascade,
  -- Ruta dentro del bucket de Storage. Nunca una URL externa arbitraria.
  ruta          text not null,
  alt           text not null,
  orden         integer not null default 0,
  ancho         integer,
  alto          integer,
  creado_en     timestamptz not null default now(),

  -- El alt vacío no sirve: estas imágenes son informativas, no decorativas.
  constraint imagenes_alt_no_vacio check (length(trim(alt)) > 0),
  constraint imagenes_ruta_relativa check (ruta !~ '^(https?:)?//' and ruta !~ '\.\.')
);

create index imagenes_producto_idx on public.imagenes_producto (producto_id, orden);

-- ────────────────────────── Consultas ──────────────────────────
-- Formulario de contacto y "avisame cuando haya stock".
-- Contiene datos personales: mínimo indispensable y con retención definida.

create table public.consultas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,          -- PII
  email         text,                   -- PII
  telefono      text,                   -- PII
  mensaje       text not null,
  producto_id   uuid references public.productos(id) on delete set null,
  variante_id   uuid references public.variantes(id) on delete set null,
  estado        public.estado_consulta not null default 'nueva',
  origen        text,                   -- 'contacto' | 'stock' | 'producto'
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  constraint consultas_nombre_largo check (length(trim(nombre)) between 2 and 120),
  constraint consultas_mensaje_largo check (length(trim(mensaje)) between 5 and 2000),
  constraint consultas_algun_contacto check (email is not null or telefono is not null),
  constraint consultas_email_formato
    check (email is null or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create trigger consultas_actualizado
  before update on public.consultas
  for each row execute function public.tocar_actualizado_en();

create index consultas_estado_idx on public.consultas (estado, creado_en desc);

comment on table public.consultas is
  'Datos personales. Retención: 24 meses desde el cierre. Ver política de privacidad.';

-- ───────────────────── Registro de auditoría ─────────────────────
-- Quién hizo qué, cuándo. Sin esto, un incidente es imposible de investigar.

create table public.log_auditoria (
  id           bigserial primary key,
  actor_id     uuid references auth.users(id) on delete set null,
  actor_email  text,
  accion       text not null,   -- 'producto.publicar', 'producto.precio', ...
  entidad      text not null,   -- nombre de tabla
  entidad_id   text,
  datos_antes  jsonb,
  datos_despues jsonb,
  ip           inet,
  user_agent   text,
  creado_en    timestamptz not null default now()
);

create index log_auditoria_entidad_idx on public.log_auditoria (entidad, entidad_id, creado_en desc);
create index log_auditoria_actor_idx on public.log_auditoria (actor_id, creado_en desc);

comment on table public.log_auditoria is
  'Solo escritura. Nunca guardar contraseñas, tokens ni datos de tarjeta acá.';

-- Auditoría automática de los cambios sensibles en productos.
create or replace function public.auditar_producto()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cambio text;
begin
  if tg_op = 'UPDATE' then
    if old.publicado is distinct from new.publicado then
      cambio := case when new.publicado then 'producto.publicar' else 'producto.despublicar' end;
    elsif old.precio_centavos is distinct from new.precio_centavos then
      cambio := 'producto.precio';
    elsif old.clasificacion is distinct from new.clasificacion then
      cambio := 'producto.clasificacion';
    else
      return new;
    end if;
  elsif tg_op = 'DELETE' then
    cambio := 'producto.borrar';
  else
    cambio := 'producto.crear';
  end if;

  insert into public.log_auditoria (actor_id, accion, entidad, entidad_id, datos_antes, datos_despues)
  values (
    auth.uid(),
    cambio,
    'productos',
    coalesce(new.id, old.id)::text,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );

  return coalesce(new, old);
end;
$$;

create trigger productos_auditoria
  after insert or update or delete on public.productos
  for each row execute function public.auditar_producto();
