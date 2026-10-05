-- ════════════════════════════════════════════════════════════════════════
--  Dra. Yanina Traverso — Funciones de servicio
--  0003_funciones.sql
--
--  Las que llama el servidor con la clave de servicio: el límite de
--  peticiones de los formularios y la comprobación de RLS de los tests.
--  Ninguna se puede llamar con la clave anónima ni con un usuario logueado.
-- ════════════════════════════════════════════════════════════════════════

-- ──────────────────────── Límite de peticiones ────────────────────────

/**
 * Registra un intento y dice si se puede seguir.
 *
 * Devuelve true si la petición está permitida, false si superó el límite.
 * La ventana es deslizante por bloques: al vencer se reinicia el contador.
 *
 * Es atómica: el insert ... on conflict do update se resuelve dentro de una
 * sola sentencia, así que diez peticiones en paralelo cuentan diez, no una.
 * Un contador con lectura y escritura por separado se esquiva con
 * concurrencia, que es justo lo que hace un script de abuso.
 */
create or replace function public.registrar_intento(
  p_clave        text,
  p_maximo       integer,
  p_ventana_segs integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_intentos integer;
begin
  insert into public.limite_peticiones (clave, intentos, ventana_fin)
  values (p_clave, 1, now() + make_interval(secs => p_ventana_segs))
  on conflict (clave) do update
    set intentos = case
          when public.limite_peticiones.ventana_fin < now() then 1
          else public.limite_peticiones.intentos + 1
        end,
        ventana_fin = case
          when public.limite_peticiones.ventana_fin < now()
            then now() + make_interval(secs => p_ventana_segs)
          else public.limite_peticiones.ventana_fin
        end
  returning intentos into v_intentos;

  return v_intentos <= p_maximo;
end;
$$;

revoke all on function public.registrar_intento(text, integer, integer) from public, anon, authenticated;

/** Limpieza de ventanas vencidas. */
create or replace function public.limpiar_limites()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_borrados integer;
begin
  delete from public.limite_peticiones
  where ventana_fin < now() - interval '1 day';
  get diagnostics v_borrados = row_count;
  return v_borrados;
end;
$$;

revoke all on function public.limpiar_limites() from public, anon, authenticated;

-- ──────────────────────────── Verificación ────────────────────────────

/**
 * Tablas del esquema público que NO tienen RLS activada.
 *
 * Tiene que devolver cero filas, siempre. Existe como función para que un
 * test automatizado lo compruebe en cada corrida: una regla que solo vive en
 * el README se rompe el día que alguien agrega una tabla con prisa.
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
