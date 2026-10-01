-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Funciones de verificación
--  0005_verificacion.sql
--
--  Herramientas para que las pruebas automatizadas puedan comprobar
--  invariantes que, de otro modo, solo se verifican a mano y por lo tanto
--  se dejan de verificar.
-- ════════════════════════════════════════════════════════════════════════

/**
 * Tablas del esquema público que NO tienen RLS activada.
 *
 * Tiene que devolver cero filas, siempre. Una tabla sin RLS, con la clave
 * anónima publicada, es una base de datos abierta a internet.
 *
 * Existe como función para que un test automatizado pueda comprobarlo en
 * cada corrida. Una regla que solo vive en el README se rompe el día que
 * alguien agrega una tabla con prisa.
 */
create or replace function public.tablas_sin_rls()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select c.relname::text
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not c.relrowsecurity
  order by c.relname;
$$;

-- Solo la clave de servicio puede llamarla: la lista de tablas desprotegidas
-- es exactamente el mapa que querría un atacante.
revoke all on function public.tablas_sin_rls() from public, anon, authenticated;
