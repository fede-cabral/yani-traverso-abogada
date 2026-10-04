"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Anima el cambio de página: la página vieja se desvanece hacia arriba en el
 * lugar donde estaba y la nueva entra desde abajo (clases en globals.css).
 *
 * La `key` es la ruta: al cambiar de página, React trata la vieja como una
 * que sale y la nueva como una que entra, cada una en su lugar. Con una sola
 * caja que "se actualiza", la vieja se mostraba desde su parte de arriba
 * aunque la persona estuviera mirando la mitad de la página, y se veía un
 * parpadeo de la portada antes de cambiar.
 *
 * Solo la ruta, sin los parámetros: cambiar un filtro del listado no es
 * cambiar de página y no tiene que deslizar nada.
 *
 * Sin esta envoltura, además, React solo arranca una transición cuando algún
 * elemento compartido cambia de lugar: unas navegaciones se animaban y otras
 * cambiaban de golpe.
 */
export function TransicionPagina({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();

  return (
    <ViewTransition key={ruta} enter="pagina-entra" exit="pagina-sale" default="none">
      <div className="flex-1">{children}</div>
    </ViewTransition>
  );
}
