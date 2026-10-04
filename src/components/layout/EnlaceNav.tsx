"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compartido } from "@/components/Compartido";

/**
 * Enlace del menú que sabe si es la página actual.
 *
 * Es lo único del encabezado que corre en el navegador: la ruta activa no se
 * puede saber desde el layout, que no se vuelve a renderizar al navegar.
 * `aria-current` se lo dice al lector de pantalla; el filete, a la vista.
 *
 * El filete es un elemento propio y no un borde del enlace: así tiene nombre
 * de transición y, al cambiar de página, se desliza desde la sección
 * anterior hasta la nueva en vez de apagarse en una y prenderse en otra.
 * Indica hacia dónde se fue, que es justo lo que hace un menú.
 *
 * `grupo` separa el menú de escritorio del de celular: los dos existen en la
 * página (uno oculto) y dos filetes con el mismo nombre harían que el
 * navegador cancele la transición.
 */
export function EnlaceNav({
  href,
  grupo,
  className = "",
  children,
}: {
  href: string;
  grupo: "escritorio" | "movil";
  className?: string;
  children: React.ReactNode;
}) {
  const ruta = usePathname();
  const actual = ruta === href || ruta.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={actual ? "page" : undefined}
      className={`enlace-nav ${className}`}
    >
      {children}
      {actual && (
        <Compartido nombre={`filete-nav-${grupo}`}>
          <span className="filete-nav" aria-hidden="true" />
        </Compartido>
      )}
    </Link>
  );
}
