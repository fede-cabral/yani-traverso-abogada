-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Cómo se crea el primer administrador
--  0009_primer_admin.sql
--
--  Arregla un problema de arranque de 0002_rls.sql.
--
--  proteger_rol() solo dejaba cambiar un rol a quien ya fuera administrador.
--  Es la regla correcta para los usuarios, pero deja un huevo y la gallina:
--  el PRIMER administrador no tiene quién lo nombre. Desde el SQL Editor de
--  Supabase no hay ningún usuario logueado (auth.uid() es null), así que
--  es_admin() daba falso y el cambio se rechazaba. La única salida era
--  desactivar el trigger a mano — el tipo de atajo que después alguien se
--  olvida de deshacer, y la protección queda apagada para siempre.
--
--  Desde esta migración también pueden cambiar roles las dos conexiones que
--  administran la base: el SQL Editor (rol postgres) y la clave service_role,
--  que nunca sale del servidor. Las dos ya pueden hacer cualquier cosa en la
--  base —saltean RLS entera—, así que negarles esto no protegía nada.
--
--  Para un usuario común no cambia nada: sigue sin poder ascenderse a sí
--  mismo ni a otro, que es lo que este trigger existe para impedir.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.proteger_rol()
returns trigger
language plpgsql
-- SECURITY INVOKER a propósito (en 0002 era DEFINER). Con DEFINER, adentro
-- de la función `current_user` es siempre el dueño de la función (postgres)
-- sin importar quién haga el cambio, y la excepción de abajo dejaría pasar a
-- cualquiera. es_admin() sigue funcionando igual porque rol_actual(), que es
-- la que lee la tabla de perfiles, es DEFINER por su cuenta.
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
  'Solo un admin, el SQL Editor o service_role pueden cambiar roles. Ver 0009.';
