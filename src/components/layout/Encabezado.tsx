import Link from "next/link";
import { EnlaceNav } from "./EnlaceNav";
import { NEGOCIO } from "@/lib/negocio";
import { NAVEGACION } from "./navegacion";

export function Encabezado() {
  return (
    <header className="encabezado-sitio sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur">
      {/*
        Franja superior: cuándo y dónde atiende. Es lo primero que quiere
        saber quien llega buscando abogada, antes que cualquier otra cosa.
      */}
      <div className="franja-marca px-4 py-1.5">
        <p className="text-center text-xs text-texto-suave">
          {NEGOCIO.horarios.legible} · {NEGOCIO.zona}
        </p>
      </div>

      <div className="contenedor flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="monograma" aria-hidden="true">
            {NEGOCIO.inicial}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold">{NEGOCIO.nombre}</span>
            <span className="rotulo">{NEGOCIO.rubro}</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {NAVEGACION.map((item) => (
              <li key={item.href}>
                <EnlaceNav href={item.href} grupo="escritorio">{item.texto}</EnlaceNav>
              </li>
            ))}
          </ul>
        </nav>

        {/* En celular no entra al lado del nombre sin partirlo en dos líneas,
            y "Turnos" ya está en el menú de abajo. El que se oculta es el
            contenedor: la clase .boton fija su propio display y le ganaría
            a un "hidden" puesto sobre el mismo enlace. */}
        <div className="hidden sm:block">
          <Link href="/turnos" className="boton boton-principal">
            Pedir turno
          </Link>
        </div>
      </div>

      {/* En móvil el menú va en una fila desplazable, no escondido detrás de
          un botón: son cuatro enlaces y esconderlos solo agrega un toque de
          más para llegar a cualquiera. */}
      <nav aria-label="Principal" className="md:hidden">
        <ul className="contenedor flex gap-5 overflow-x-auto pb-2 text-sm">
          {NAVEGACION.map((item) => (
            <li key={item.href}>
              <EnlaceNav href={item.href} grupo="movil" className="flex items-center whitespace-nowrap">
                {item.texto}
              </EnlaceNav>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
