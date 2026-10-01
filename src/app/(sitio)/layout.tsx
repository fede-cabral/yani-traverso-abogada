import { BannerDemo } from "@/components/layout/BannerDemo";
import { Encabezado } from "@/components/layout/Encabezado";
import { PieDePagina } from "@/components/layout/PieDePagina";

/** Chrome del sitio público: encabezado, contenido y pie. */
export default function SitioLayout({
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
      <Encabezado />
      <div className="flex-1">{children}</div>
      <PieDePagina />
    </>
  );
}
