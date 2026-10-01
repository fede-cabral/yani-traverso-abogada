-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Promociones
--  0008_promociones.sql
--
--  Una promoción es un ANUNCIO con fecha de vencimiento, no un cálculo.
--
--  Esa decisión es deliberada. Un sistema que recalcula precios solo es un
--  sistema que puede equivocarse solo, y acá la venta se cierra por
--  WhatsApp: el precio que cobra el dueño lo pone el dueño. La promoción
--  dice "15 % en conjuntos hasta el 30/9"; la rebaja concreta de cada
--  producto se carga con precio_anterior_centavos, que ya existe y ya está
--  protegido contra ofertas falsas.
--
--  Lo que sí resuelve la base es lo que la gente olvida: sacar el cartel
--  cuando la promoción termina. Nadie se acuerda de bajar un cartel un
--  domingo a la noche, y un "válido hasta el 30/9" visible el 12/10 es una
--  oferta incumplida — que en Argentina obliga a cumplirla (Ley 24.240,
--  art. 7 y 8: la oferta publicitada vincula a quien la emite).
-- ════════════════════════════════════════════════════════════════════════

create table public.promociones (
  id uuid primary key default gen_random_uuid(),

  -- Lo que se lee en la barra. Corto: es una franja de una línea.
  titulo text not null,

  -- Detalle opcional: condiciones, letra chica, a qué aplica.
  texto text,

  -- A dónde lleva el cartel al hacer clic. Opcional.
  enlace text,

  -- Ventana de vigencia. `hasta` es el instante en que deja de mostrarse.
  desde timestamptz not null default now(),
  hasta timestamptz not null,

  -- Interruptor manual, independiente de las fechas: sirve para bajar una
  -- promoción antes de tiempo sin tener que inventar una fecha de fin.
  activa boolean not null default true,

  -- Con dos promociones vigentes a la vez, se muestra la de orden más bajo.
  orden smallint not null default 0,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  constraint promociones_titulo_util check (
    length(trim(titulo)) between 3 and 120
  ),

  constraint promociones_texto_acotado check (
    texto is null or length(trim(texto)) between 3 and 300
  ),

  -- El enlace tiene que ser una ruta interna del propio sitio.
  --
  -- Sin esta restricción, quien tenga acceso al panel puede convertir la
  -- barra superior del sitio —la que se ve en TODAS las páginas— en un
  -- enlace a cualquier dominio. Eso es exactamente la forma de un ataque de
  -- phishing con la credibilidad del sitio prestada.
  --
  -- Cuatro condiciones, y las cuatro hacen falta:
  --   1. Empieza con "/" y solo usa caracteres de ruta. Descarta esquemas
  --      (https:, javascript:), espacios, barras invertidas y saltos de línea.
  --   2. No contiene "//" en ningún lado. "//otro.com" es protocolo relativo:
  --      el navegador lo lleva a otro dominio.
  --   3. No tiene segmentos "." ni "..". "/.//otro.com" pasa la regla 2 a
  --      simple vista y el navegador lo normaliza a "//otro.com".
  --   4. Largo acotado, igual que en Zod.
  constraint promociones_enlace_interno check (
    enlace is null
    or (
      enlace ~ '^/[A-Za-z0-9/_?=&#.-]*$'
      and position('//' in enlace) = 0
      and enlace !~ '(^|/)\.\.?(/|$|[?#])'
      and length(enlace) <= 300
    )
  ),

  -- Una promoción que termina antes de empezar no es un caso de borde: es
  -- un error de tipeo en el año, y sin esto queda cargada y nunca se ve.
  constraint promociones_ventana_valida check (hasta > desde),

  -- Tope de un año, también en la base. Si solo estuviera en Zod, un editor
  -- con su propio token podría crear una promoción "hasta 2099" hablándole
  -- directo a la API: un cartel que en la práctica no vence nunca.
  constraint promociones_duracion_acotada check (hasta - desde <= interval '366 days'),

  constraint promociones_orden_acotado check (orden between 0 and 999)
);

comment on table public.promociones is
  'Anuncios con vigencia para la barra superior del sitio. No modifican precios.';
comment on column public.promociones.hasta is
  'Instante en que la promoción deja de mostrarse. La base la esconde sola.';

-- Índice para la consulta que corre en cada carga de página: la promoción
-- vigente. Parcial sobre `activa`, porque las vencidas se acumulan y no se
-- consultan nunca más salvo desde el panel.
create index promociones_vigentes_idx
  on public.promociones (orden, desde desc)
  where activa = true;

create trigger promociones_actualizado_en
  before update on public.promociones
  for each row execute function public.tocar_actualizado_en();

-- ──────────────────────────── Auditoría ────────────────────────────

create or replace function public.auditar_promocion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.log_auditoria (actor_id, accion, entidad, entidad_id, datos_antes, datos_despues)
  values (
    auth.uid(),
    'promocion.' || lower(tg_op),
    'promociones',
    coalesce(new.id, old.id)::text,
    case when tg_op = 'INSERT' then null else to_jsonb(old) end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

create trigger promociones_auditoria
  after insert or update or delete on public.promociones
  for each row execute function public.auditar_promocion();

-- ─────────────────────── Row Level Security ───────────────────────
--
-- Toda tabla nueva activa RLS en la misma migración que la crea. Sin esto,
-- con la clave anónima publicada, la tabla es de lectura y escritura libre.

alter table public.promociones enable row level security;
alter table public.promociones force row level security;

-- El público ve SOLO lo vigente.
--
-- El filtro de fechas está en la política, no solo en la consulta de la
-- aplicación. Así una promoción vencida es invisible para el cliente
-- anónimo aunque alguien se olvide del `where` en el código: la fecha de
-- corte la decide Postgres con su propio reloj, que es el único que no se
-- puede manipular desde el navegador.
create policy promociones_select_vigentes on public.promociones
  for select to anon
  using (activa = true and now() >= desde and now() < hasta);

-- El panel necesita ver también las programadas y las vencidas.
create policy promociones_select_staff on public.promociones
  for select to authenticated
  using (
    public.es_staff()
    or (activa = true and now() >= desde and now() < hasta)
  );

create policy promociones_insert_staff on public.promociones
  for insert to authenticated with check (public.es_staff());

create policy promociones_update_staff on public.promociones
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());

-- Borrar es de admin: una promoción vencida es el registro de lo que se
-- prometió y hasta cuándo. Ante un reclamo, eso es la prueba.
create policy promociones_delete_admin on public.promociones
  for delete to authenticated using (public.es_admin());
