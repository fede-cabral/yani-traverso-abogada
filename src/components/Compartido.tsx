import { ViewTransition } from "react";

/**
 * Marca un elemento que existe en dos páginas como "el mismo". Al navegar de
 * una a otra, en vez de desaparecer y reaparecer, viaja de su lugar viejo al
 * nuevo: se entiende que la página nueva continúa lo que se estaba mirando.
 *
 * Reglas para usarlo bien:
 * - El `nombre` tiene que ser único en cada página. Si dos elementos visibles
 *   lo comparten, el navegador cancela la transición entera.
 * - Solo vale la pena con elementos que se ven igual en las dos páginas
 *   (mismo texto en un renglón, misma imagen, mismo filete). Un título que
 *   en una página ocupa un renglón y en la otra dos se superpone deformado a
 *   mitad de camino: se probó con el nombre de la Dra. y se descartó.
 * - React solo lo hace viajar si estaba a la vista al tocar el enlace. Si no,
 *   aparece con el resto de la página, sin volar desde fuera de la pantalla.
 *
 * El tiempo y la curva están en globals.css (clase `viaje`), y con
 * movimiento reducido no se anima nada.
 */
export function Compartido({
  nombre,
  children,
}: {
  nombre: string;
  children: React.ReactNode;
}) {
  return (
    <ViewTransition name={nombre} share="viaje" default="none">
      {children}
    </ViewTransition>
  );
}
