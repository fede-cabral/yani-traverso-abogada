-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Límite de peticiones
--  0004_rate_limit.sql
--
--  El rate limiting vive en la base, no en memoria del proceso.
--
--  En un hosting serverless cada petición puede caer en una instancia
--  distinta, así que un contador en memoria no cuenta nada: un atacante con
--  mandar peticiones en paralelo ya lo esquiva. Un contador en Postgres es
--  compartido por todas las instancias y sobrevive a los reinicios.
-- ════════════════════════════════════════════════════════════════════════

create table public.limite_peticiones (
  clave       text primary key,       -- 'consulta:<hash de ip>'
  intentos    integer not null default 0,
  ventana_fin timestamptz not null,
  creado_en   timestamptz not null default now()
);

create index limite_peticiones_ventana_idx on public.limite_peticiones (ventana_fin);

alter table public.limite_peticiones enable row level security;
alter table public.limite_peticiones force row level security;

-- Sin políticas: nadie lee ni escribe esta tabla desde el cliente, en ningún
-- rol. Solo la toca la función de abajo, que es SECURITY DEFINER. Una tabla
-- de rate limiting que el atacante puede leer o vaciar no sirve de nada.

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

/** Limpieza de ventanas vencidas. Programar en pg_cron o en una tarea diaria. */
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
