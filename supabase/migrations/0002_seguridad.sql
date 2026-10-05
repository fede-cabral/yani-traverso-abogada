-- ════════════════════════════════════════════════════════════════════════
--  Dra. Yanina Traverso — Row Level Security
--  0002_seguridad.sql
--
--  Principio: NEGAR POR DEFECTO.
--  0001 activa RLS en cada tabla, y RLS sin políticas bloquea todo. Acá se
--  abre, operación por operación, solo lo estrictamente necesario.
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
--
-- Además de un admin, pueden cambiar roles las dos conexiones que
-- administran la base: el SQL Editor (rol postgres) y la clave service_role,
-- que nunca sale del servidor. Sin esa excepción, el PRIMER administrador no
-- tendría quién lo nombre: desde el SQL Editor no hay usuario logueado y
-- es_admin() da falso. Las dos ya saltean RLS entera, así que negarles esto
-- no protegía nada.
--
-- SECURITY INVOKER a propósito: con DEFINER, adentro de la función
-- `current_user` sería siempre el dueño (postgres) sin importar quién haga el
-- cambio, y la excepción dejaría pasar a cualquiera. es_admin() sigue
-- funcionando porque rol_actual(), que lee la tabla, es DEFINER por su cuenta.
create or replace function public.proteger_rol()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.rol is distinct from old.rol
     and not (
       current_user in ('postgres', 'supabase_admin', 'service_role')
       or public.es_admin()
     )
  then
    raise exception 'No tenés permiso para cambiar el rol de un usuario'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

comment on function public.proteger_rol() is
  'Solo un admin, el SQL Editor o service_role pueden cambiar roles.';

create trigger perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function public.proteger_rol();

-- Todo usuario nuevo arranca como cliente, es decir, sin permisos. Sin
-- excepción, y sin que el registro pueda elegir su propio rol.
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

-- ═══════════════════════════ CONSULTAS ═══════════════════════════

-- Cualquiera puede dejar una consulta, pero solo como 'nueva'. El abuso de
-- volumen se contiene con el límite de peticiones en la aplicación: RLS
-- controla acceso, no volumen.
create policy consultas_insert_publico on public.consultas
  for insert to anon, authenticated
  with check (estado = 'nueva');

-- Nadie del público lee consultas, ni las propias: no hay forma seria de
-- probar que un anónimo es el mismo que dejó una consulta anterior. Un
-- editor tampoco: solo administradores.
create policy consultas_select_admin on public.consultas
  for select to authenticated using (public.es_admin());

create policy consultas_update_admin on public.consultas
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy consultas_delete_admin on public.consultas
  for delete to authenticated using (public.es_admin());

-- ════════════════════════════ TURNOS ════════════════════════════

-- Cualquiera puede pedir un turno, pero solo en estado 'pendiente': nadie
-- del público puede insertar un turno ya "confirmado".
create policy turnos_insert_publico on public.turnos
  for insert to anon, authenticated
  with check (estado = 'pendiente');

-- Igual que las consultas: solo administradores leen y gestionan turnos.
create policy turnos_select_admin on public.turnos
  for select to authenticated using (public.es_admin());

create policy turnos_update_admin on public.turnos
  for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

create policy turnos_delete_admin on public.turnos
  for delete to authenticated using (public.es_admin());

-- ════════════════════════ REGISTRO DE AUDITORÍA ════════════════════════

-- Solo lectura, y solo para admin. Las escrituras entran con la clave de
-- servicio desde el servidor, que no pasa por estas políticas. Nadie —ni
-- siquiera un admin— puede editar ni borrar el registro desde la
-- aplicación: un log que se puede alterar no sirve como evidencia.
create policy log_select_admin on public.log_auditoria
  for select to authenticated using (public.es_admin());

-- ═════════════════════ LÍMITE DE PETICIONES ═════════════════════

-- Sin políticas, a propósito: nadie lee ni escribe esta tabla desde el
-- cliente, en ningún rol. Solo la toca registrar_intento() (0003), que es
-- SECURITY DEFINER. Una tabla de rate limiting que el atacante puede leer o
-- vaciar no sirve de nada.

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
