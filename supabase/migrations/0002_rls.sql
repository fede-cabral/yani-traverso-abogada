-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Row Level Security
--  0002_rls.sql
--
--  Principio: NEGAR POR DEFECTO.
--  Activar RLS sin políticas bloquea todo. Después se abre, operación por
--  operación, solo lo estrictamente necesario.
--
--  Una tabla con RLS desactivada y la clave anónima publicada es, literal-
--  mente, una base de datos pública. Toda tabla nueva que se agregue en el
--  futuro tiene que activar RLS en la misma migración que la crea.
-- ════════════════════════════════════════════════════════════════════════

-- ──────────────────── Funciones de identidad ────────────────────

-- Devuelve el rol del usuario actual.
--
-- SECURITY DEFINER es necesario y está justificado: las políticas de la tabla
-- `perfiles` necesitan consultar `perfiles`, y sin DEFINER eso produce una
-- recursión infinita. La función es de solo lectura, devuelve un único valor
-- escalar y tiene el search_path fijado, así que no amplía la superficie.
create or replace function public.rol_actual()
returns public.rol_usuario
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select rol from public.perfiles where id = auth.uid()),
    'cliente'::public.rol_usuario
  );
$$;

revoke all on function public.rol_actual() from public;
grant execute on function public.rol_actual() to authenticated;

create or replace function public.es_admin()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null and public.rol_actual() = 'admin';
$$;

create or replace function public.es_staff()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null and public.rol_actual() in ('admin', 'editor');
$$;

-- ═══════════════════════════ PERFILES ═══════════════════════════

alter table public.perfiles enable row level security;
alter table public.perfiles force row level security;

create policy perfiles_select_propio on public.perfiles
  for select to authenticated
  using (id = auth.uid() or public.es_admin());

create policy perfiles_update_propio on public.perfiles
  for update to authenticated
  using (id = auth.uid() or public.es_admin())
  with check (id = auth.uid() or public.es_admin());

create policy perfiles_insert_admin on public.perfiles
  for insert to authenticated
  with check (public.es_admin());

create policy perfiles_delete_admin on public.perfiles
  for delete to authenticated
  using (public.es_admin());

-- RLS no distingue columnas: la política de arriba deja a un usuario editar
-- su propio perfil, y eso incluiría la columna `rol`. Este trigger cierra esa
-- puerta. Es la defensa contra escalada de privilegios: mandar
-- {"rol":"admin"} al actualizar el perfil propio no hace nada.
create or replace function public.proteger_rol()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rol is distinct from old.rol and not public.es_admin() then
    raise exception 'No tenés permiso para cambiar el rol de un usuario'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function public.proteger_rol();

-- Todo usuario nuevo arranca como cliente. Sin excepción, y sin que el
-- registro pueda elegir su propio rol.
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, rol)
  values (new.id, 'cliente')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();

-- ═══════════════════════════ CATEGORÍAS ═══════════════════════════

alter table public.categorias enable row level security;
alter table public.categorias force row level security;

-- Lectura pública: el catálogo tiene que verse sin iniciar sesión.
create policy categorias_select_publico on public.categorias
  for select to anon, authenticated
  using (true);

create policy categorias_insert_staff on public.categorias
  for insert to authenticated with check (public.es_staff());

create policy categorias_update_staff on public.categorias
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());

create policy categorias_delete_admin on public.categorias
  for delete to authenticated using (public.es_admin());

-- ═══════════════════════════ PRODUCTOS ═══════════════════════════

alter table public.productos enable row level security;
alter table public.productos force row level security;

-- El público ve ÚNICAMENTE lo publicado. Un producto en revisión no existe
-- para el visitante: no aparece en listados, y pedirlo por ID devuelve vacío.
create policy productos_select_publicados on public.productos
  for select to anon, authenticated
  using (publicado = true);

-- El staff ve todo, incluido lo que está en revisión.
create policy productos_select_staff on public.productos
  for select to authenticated
  using (public.es_staff());

create policy productos_insert_staff on public.productos
  for insert to authenticated with check (public.es_staff());

create policy productos_update_staff on public.productos
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());

-- Borrar productos es solo de admin. Un editor despublica, no destruye.
create policy productos_delete_admin on public.productos
  for delete to authenticated using (public.es_admin());

-- Separación real entre editor y admin: el editor carga y corrige productos,
-- pero no toca el precio de algo ya publicado ni la clasificación legal.
create or replace function public.limitar_editor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.rol_actual() <> 'editor' then
    return new;
  end if;

  if old.publicado and new.precio_centavos is distinct from old.precio_centavos then
    raise exception 'Un editor no puede cambiar el precio de un producto publicado'
      using errcode = '42501';
  end if;

  if new.clasificacion is distinct from old.clasificacion then
    raise exception 'Un editor no puede cambiar la clasificación legal de un producto'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger productos_limitar_editor
  before update on public.productos
  for each row execute function public.limitar_editor();

-- ═══════════════════════════ VARIANTES ═══════════════════════════

alter table public.variantes enable row level security;
alter table public.variantes force row level security;

-- Una variante se ve solo si su producto padre está publicado. Si no se
-- encadenara la condición, alguien podría leer el catálogo entero —
-- incluidos productos en revisión — a través de esta tabla.
create policy variantes_select_publico on public.variantes
  for select to anon, authenticated
  using (
    activa = true
    and exists (
      select 1 from public.productos p
      where p.id = variantes.producto_id and p.publicado = true
    )
  );

create policy variantes_select_staff on public.variantes
  for select to authenticated using (public.es_staff());

create policy variantes_insert_staff on public.variantes
  for insert to authenticated with check (public.es_staff());

create policy variantes_update_staff on public.variantes
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());

create policy variantes_delete_admin on public.variantes
  for delete to authenticated using (public.es_admin());

-- ═══════════════════════ IMÁGENES DE PRODUCTO ═══════════════════════

alter table public.imagenes_producto enable row level security;
alter table public.imagenes_producto force row level security;

create policy imagenes_select_publico on public.imagenes_producto
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.productos p
      where p.id = imagenes_producto.producto_id and p.publicado = true
    )
  );

create policy imagenes_select_staff on public.imagenes_producto
  for select to authenticated using (public.es_staff());

create policy imagenes_insert_staff on public.imagenes_producto
  for insert to authenticated with check (public.es_staff());

create policy imagenes_update_staff on public.imagenes_producto
  for update to authenticated
  using (public.es_staff()) with check (public.es_staff());

create policy imagenes_delete_staff on public.imagenes_producto
  for delete to authenticated using (public.es_staff());

-- ═══════════════════════════ CONSULTAS ═══════════════════════════

alter table public.consultas enable row level security;
alter table public.consultas force row level security;

-- Cualquiera puede dejar una consulta. El abuso se contiene con rate limiting
-- y CAPTCHA en la capa de aplicación, no acá: RLS controla acceso, no volumen.
create policy consultas_insert_publico on public.consultas
  for insert to anon, authenticated
  with check (
    estado = 'nueva'
    and (producto_id is null or exists (
      select 1 from public.productos p
      where p.id = producto_id and p.publicado = true
    ))
  );

-- Nadie del público lee consultas. Ni las propias: no hay forma seria de
-- probar que un anónimo es el mismo que dejó una consulta anterior.
create policy consultas_select_admin on public.consultas
  for select to authenticated using (public.es_admin());

create policy consultas_update_admin on public.consultas
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy consultas_delete_admin on public.consultas
  for delete to authenticated using (public.es_admin());

-- ════════════════════════ REGISTRO DE AUDITORÍA ════════════════════════

alter table public.log_auditoria enable row level security;
alter table public.log_auditoria force row level security;

-- Solo lectura, y solo para admin. Las escrituras entran por los triggers
-- SECURITY DEFINER, que no pasan por estas políticas. Nadie —ni siquiera un
-- admin— puede editar ni borrar el registro desde la aplicación: un log que
-- se puede alterar no sirve como evidencia.
create policy log_select_admin on public.log_auditoria
  for select to authenticated using (public.es_admin());

-- ═══════════════════════════ VERIFICACIÓN ═══════════════════════════
-- Esta consulta DEBE devolver cero filas. Si devuelve alguna, esa tabla está
-- expuesta a cualquiera que tenga la clave anónima (o sea, a todo internet).
--
--   select c.relname as tabla_sin_rls
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
--
-- Correr esto después de cada migración. Sin excepciones.
