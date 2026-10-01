import type { Metadata } from "next";
import { BannerDemo } from "@/components/layout/BannerDemo";

export const metadata: Metadata = {
  // Ni el panel ni el login tienen por qué estar en buscadores.
  robots: { index: false, follow: false },
};

/**
 * Chrome del panel y del login.
 *
 * Deliberadamente vacío: nada del sitio público entra acá. El botón de
 * turnos, el menú y el pie con los datos de contacto son para quien visita,
 * no para quien está administrando los turnos.
 */
export default function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-superficie focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <BannerDemo />
      <div className="flex-1">{children}</div>
    </>
  );
}
