import type { Metadata } from "next";
import Link from "next/link";
import { AREAS } from "@/lib/areas";
import { NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Áreas de práctica",
  description: `Derecho inmobiliario y notarial, sucesiones, usucapiones, familia, laboral, ART, accidentes de tránsito, penal y amparos de salud. ${NEGOCIO.zona}.`,
  alternates: { canonical: "/areas" },
};

export default function Areas() {
  return (
    <main id="contenido">
      <section className="contenedor seccion">
        <p className="rotulo">Áreas de práctica</p>
        <h1 className="mt-4 max-w-3xl text-3xl sm:text-[length:var(--text-hero)]">
          En qué trabaja el estudio
        </h1>
        <hr className="filete mt-7" />
        <p className="mt-7 max-w-2xl text-lg text-texto-suave">
          La especialidad es el derecho inmobiliario y notarial. El estudio
          atiende además las áreas que siguen. Si no sabés en cuál entra tu
          tema, pedí el turno igual: eso se define en la consulta.
        </p>

        {/*
          Una sola lista y no una página por área: hoy cada área tiene una
          línea de descripción, y diez páginas de una línea son diez páginas
          vacías para Google. Cuando la Dra. escriba el detalle de cada una,
          se separan.

          El id de cada ítem es el destino de los enlaces de la portada
          (/areas#sucesiones).
        */}
        <ul className="mt-12 grid gap-x-12 md:grid-cols-2">
          {AREAS.map((area, i) => (
            <li
              key={area.slug}
              id={area.slug}
              className={`area-detalle ${area.especialidad ? "area-detalle-especialidad" : ""}`}
            >
              <span className="numero">
                {String(i + 1).padStart(2, "0")}
                {area.especialidad && " · Especialidad"}
              </span>
              <h2 className="text-2xl">{area.nombre}</h2>
              <p>{area.resumen}</p>
              <Link href={`/turnos?area=${area.slug}`} className="enlace-flecha">
                Pedir turno<span className="sr-only">: {area.nombre}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="franja-marca seccion">
        <div className="contenedor">
          <h2 className="max-w-xl text-3xl">¿Querés consultar por tu caso?</h2>
          <p className="mt-4 max-w-xl text-texto-suave">
            Pedí un turno y contá, en pocas palabras, de qué se trata.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/turnos" className="boton boton-principal">
              Pedir un turno
            </Link>
            <Link href="/contacto" className="enlace-subrayado">
              Hacer una consulta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
