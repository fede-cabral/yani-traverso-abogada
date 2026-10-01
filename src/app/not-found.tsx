import Link from "next/link";
import { Encabezado } from "@/components/layout/Encabezado";
import { PieDePagina } from "@/components/layout/PieDePagina";

/**
 * 404 global. Vive en la raíz, así que no hereda el chrome de (sitio): lo
 * monta por su cuenta. Una página de error sin navegación es un callejón
 * sin salida, y la gente que llega acá viene de un enlace roto o de Google.
 */
export default function NoEncontrado() {
  return (
    <>
      <Encabezado />
      <main id="contenido" className="contenedor seccion flex-1">
        <p className="rotulo">Error 404</p>
        <h1 className="mt-4 text-3xl">Esta página no existe</h1>
        <p className="mt-4 max-w-prose text-texto-suave">
          Puede que el enlace esté mal escrito o que la página se haya movido.
          Desde acá podés volver al inicio o pedir un turno.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="boton boton-principal" href="/">
            Volver al inicio
          </Link>
          <Link className="boton boton-secundario" href="/turnos">
            Pedir un turno
          </Link>
        </div>
      </main>
      <PieDePagina />
    </>
  );
}
