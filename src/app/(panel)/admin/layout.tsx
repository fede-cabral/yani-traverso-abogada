import type { Metadata } from "next";
import Link from "next/link";
import { salir } from "@/acciones/auth";
import { exigirStaff } from "@/lib/auth/sesion";
import { NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

const ETIQUETA_ROL = {
  admin: "Administrador",
  editor: "Editor",
  cliente: "Cliente",
} as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
    Guarda en el layout. El middleware ya bloquea /admin sin sesión, pero
    esto lo revalida acá. Dos capas, a propósito: si alguien llega por un
    camino que el middleware no cubre, esto lo frena.

    Deja pasar a cualquier usuario del estudio (exigirStaff); lo que cada
    página muestra lo decide ella. Turnos y consultas tienen datos personales
    y exigen administrador por su cuenta — y debajo de eso, RLS.

    Ojo: el layout NO protege las Server Actions. Cada acción revalida el rol
    por su cuenta — ver src/acciones/turnos.ts.
  */
  const sesion = await exigirStaff();

  return (
    <div className="contenedor py-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-borde pb-4">
        <div>
          <p className="text-sm font-bold">Panel · {NEGOCIO.nombre}</p>
          <p className="text-xs text-texto-suave">
            {sesion.email} · {ETIQUETA_ROL[sesion.rol]}
          </p>
        </div>

        <nav aria-label="Panel" className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/admin" className="hover:text-acento">Resumen</Link>
          {sesion.rol === "admin" && (
            <>
              <Link href="/admin/turnos" className="hover:text-acento">Turnos</Link>
              <Link href="/admin/consultas" className="hover:text-acento">Consultas</Link>
            </>
          )}
          <Link href="/" className="hover:text-acento">Ver sitio</Link>
          {/* Cerrar sesión es una mutación: va por POST (form + action),
              nunca por un enlace GET. */}
          <form action={salir}>
            <button type="submit" className="boton boton-secundario text-xs">
              Salir
            </button>
          </form>
        </nav>
      </header>

      <main id="contenido" className="pt-6">
        {children}
      </main>
    </div>
  );
}
