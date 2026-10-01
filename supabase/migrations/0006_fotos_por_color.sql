-- ════════════════════════════════════════════════════════════════════════
--  INDUMENTARIA MAX — Fotos asociadas a un color
--  0006_fotos_por_color.sql
--
--  Un producto que viene en tres colores tiene fotos de cada uno. Sin esta
--  columna, elegir "negro" en la ficha sigue mostrando la foto del coyote,
--  y el cliente termina preguntando por WhatsApp algo que la página ya
--  debería haberle respondido.
-- ════════════════════════════════════════════════════════════════════════

alter table public.imagenes_producto
  add column color text;

comment on column public.imagenes_producto.color is
  'Color que muestra esta foto. Null = sirve para cualquier color. Tiene que coincidir con variantes.color.';

-- Buscar rápido las fotos de un color al cambiar la selección en la ficha.
create index imagenes_producto_color_idx
  on public.imagenes_producto (producto_id, color, orden);
