"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Enlace del menú que sabe si es la página actual.
 *
 * Es lo único del encabezado que corre en el navegador: la ruta activa no se
 * puede saber desde el layout, que no se vuelve a renderizar al navegar.
 * `aria-current` se lo dice al lector de pantalla; el subrayado, a la vista.
 */
export function EnlaceNav({
  href,
  className = "",
  children,
}: {
  href: string;
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
    </Link>
  );
}
