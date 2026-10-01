-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Precio anterior (rebajas)
--  0007_precio_anterior.sql
--
--  Para mostrar "$124.000 $99.000" con el primero tachado hacen falta dos
--  precios: el que se cobra y el que se cobraba antes.
--
--  El que se cobra sigue siendo `precio_centavos`, siempre. Así ningún
--  cálculo de venta tiene que preguntarse cuál de los dos vale: el precio es
--  el precio, y el anterior es solo información para el comprador.
-- ════════════════════════════════════════════════════════════════════════

alter table public.productos
  add column precio_anterior_centavos bigint;

comment on column public.productos.precio_anterior_centavos is
  'Precio tachado. Null = sin rebaja. Siempre mayor que precio_centavos.';

-- Un "precio anterior" menor o igual al actual no es una rebaja: es un
-- aumento disfrazado de oferta, y en Argentina eso está expresamente
-- prohibido por la Resolución 7/2002 de Lealtad Comercial. La base lo
-- rechaza en vez de confiar en que nadie se equivoque cargando.
alter table public.productos
  add constraint productos_rebaja_valida check (
    precio_anterior_centavos is null
    or (precio_anterior_centavos > precio_centavos and precio_centavos > 0)
  );

-- Listar las ofertas es una consulta frecuente: índice parcial, que solo
-- indexa las filas rebajadas en lugar de la tabla entera.
create index productos_en_oferta_idx
  on public.productos (actualizado_en desc)
  where publicado = true and precio_anterior_centavos is not null;

-- La auditoría ya registra los cambios de precio; esto suma la rebaja.
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
    elsif old.precio_anterior_centavos is distinct from new.precio_anterior_centavos then
      cambio := case
        when new.precio_anterior_centavos is null then 'producto.quitar_rebaja'
        else 'producto.rebajar'
      end;
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
