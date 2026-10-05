-- ════════════════════════════════════════════════════════════════════════
--  Dra. Yanina Traverso — Borrado automático a los 24 meses
--  0004_retencion.sql
--
--  La política de privacidad promete que los pedidos de turno y las
--  consultas se eliminan 24 meses después de enviados. Una promesa así no
--  puede depender de que alguien se acuerde: la cumple la base sola, todas
--  las noches. Es además lo que pide la Ley 25.326 (art. 4, inc. 7): los
--  datos se destruyen cuando dejan de ser necesarios para lo que se
--  pidieron.
--
--  Si un pedido termina en una relación profesional, lo que haga falta
--  conservar del caso se guarda en el expediente de la Dra., no acá.
-- ════════════════════════════════════════════════════════════════════════

/**
 * Borra los turnos y las consultas de más de 24 meses, y las ventanas
 * vencidas del límite de peticiones (que guardan IPs hasheadas y no tienen
 * por qué durar más de un día).
 *
 * Devuelve cuántas filas borró de cada tabla, y deja constancia en el
 * registro de auditoría: solo los números, nunca el contenido de lo borrado
 * (regla 9 de CLAUDE.md). Ante un reclamo, el registro prueba que el
 * borrado se hizo y cuándo.
 */
create or replace function public.borrar_vencidos()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_turnos    integer;
  v_consultas integer;
  v_limites   integer;
  v_resultado jsonb;
begin
  delete from public.turnos where creado_en < now() - interval '24 months';
  get diagnostics v_turnos = row_count;

  delete from public.consultas where creado_en < now() - interval '24 months';
  get diagnostics v_consultas = row_count;

  v_limites := public.limpiar_limites();

  v_resultado := jsonb_build_object(
    'turnos', v_turnos,
    'consultas', v_consultas,
    'limites', v_limites
  );

  insert into public.log_auditoria (accion, entidad, datos_despues)
  values ('retencion.borrado_automatico', 'turnos,consultas', v_resultado);

  return v_resultado;
end;
$$;

-- Solo la tarea programada (que corre como postgres) y la clave de
-- servicio. Nadie puede dispararla desde el sitio.
revoke all on function public.borrar_vencidos() from public, anon, authenticated;

comment on function public.borrar_vencidos() is
  'Cumple la retención de 24 meses de la política de privacidad. La corre pg_cron todas las noches.';

-- ───────────────────────── Programación ─────────────────────────
--
-- pg_cron es la extensión de Supabase para tareas programadas (en el panel:
-- Integrations → Cron). Corre todos los días a las 3:00 de Buenos Aires,
-- que son las 6:00 UTC: pg_cron usa la hora UTC del servidor.
--
-- Si pg_cron no está disponible (por ejemplo, en una base local de
-- pruebas), la migración no falla: avisa, y la función queda creada para
-- programarla después con la misma sentencia de abajo.

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule(
      'borrar-vencidos',
      '0 6 * * *',
      'select public.borrar_vencidos()'
    );
  else
    raise notice 'pg_cron no está disponible: el borrado automático NO quedó programado. Programalo con: select cron.schedule(''borrar-vencidos'', ''0 6 * * *'', ''select public.borrar_vencidos()'');';
  end if;
end;
$$;
