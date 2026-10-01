import type { Metadata } from "next";
import Link from "next/link";
import { Medallon } from "@/components/Medallon";
import { AREAS } from "@/lib/areas";
import { BIOGRAFIA } from "@/lib/biografia";
import { env } from "@/lib/env";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";
import { enlaceGeneral } from "@/lib/whatsapp";

const ESPECIALIDADES = AREAS.filter((a) => a.especialidad);
const OTRAS_AREAS = AREAS.filter((a) => !a.especialidad);

const PASOS = [
  {
    titulo: "Pedís el turno",
    texto: "Elegís el día y si preferís la mañana o la tarde. Lleva un minuto.",
  },
  {
    titulo: "Confirmamos el horario",
    texto: "Te contactamos por teléfono para acordar la hora exacta.",
  },
  {
    titulo: "Tenés tu consulta",
    texto: "En el día y horario acordados, con el tiempo para ver tu caso.",
  },
] as const;

/*
  El título de la portada suma la especialidad: es lo que alguien escribe en
  el buscador, y el nombre solo no dice a qué se dedica. "absolute" evita que
  la plantilla del layout le agregue el nombre otra vez.
*/
export const metadata: Metadata = {
  title: { absolute: `${NEGOCIO.nombre} — Abogada · Derecho inmobiliario y notarial` },
};

export default function Home() {
  /*
    Datos estructurados del estudio. Con esto Google puede mostrar la ficha de
    la Dra. con horario, zona y teléfono — que para una profesional local vale
    más que cualquier otra cosa que pongamos en la portada.

    Solo entra lo que está confirmado: sin localidad no se publica dirección,
    y sin redes no se publica sameAs. Un dato estructurado inventado es un
    dato falso que además lee una máquina.
  */
  const d = NEGOCIO.direccion;
  const redes = [NEGOCIO.instagram?.url, NEGOCIO.linkedin?.url].filter(
    (url): url is string => Boolean(url),
  );
  const estudio = {
    "@context": "https://schema.org",
    "@type": NEGOCIO.tipoSchema,
    name: NEGOCIO.nombre,
    description: NEGOCIO.descripcion,
    url: env.NEXT_PUBLIC_SITE_URL,
    telephone: `+${env.NEXT_PUBLIC_WHATSAPP}`,
    email: NEGOCIO.email,
    image: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Provincia de Buenos Aires" },
      { "@type": "AdministrativeArea", name: "Ciudad Autónoma de Buenos Aires" },
    ],
    knowsAbout: AREAS.map((a) => a.nombre),
    openingHoursSpecification: NEGOCIO.horarios.franjas.map((f) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: f.desde,
      closes: f.hasta,
    })),
    ...(d.ciudad && {
      address: {
        "@type": "PostalAddress",
        streetAddress: d.calle,
        addressLocality: d.ciudad,
        ...(d.provincia && { addressRegion: d.provincia }),
        ...(d.codigoPostal && { postalCode: d.codigoPostal }),
        addressCountry: d.pais,
      },
    }),
    ...(redes.length > 0 && { sameAs: redes }),
  };

  return (
    <main id="contenido">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(estudio).replace(/</g, "\\u003c"),
        }}
      />

      {/*
        Arriba de todo, en orden: quién es → qué hace → dónde → acción.
        Una sola acción principal (pedir turno). Si hubiera dos con el mismo
        peso visual, no habría ninguna.
      */}
      <section className="franja-marca">
        <div className="contenedor grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <p className="rotulo">{NEGOCIO.nombre} · {NEGOCIO.rubro}</p>
            <h1 className="mt-5 max-w-2xl text-[length:var(--text-hero)]">
              {NEGOCIO.eslogan}
            </h1>
            <hr className="filete mt-7" />
            <p className="mt-7 max-w-xl text-lg text-texto-suave">
              {NEGOCIO.presentacion}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/turnos" className="boton boton-principal">
                Pedir un turno
              </Link>
              <a
                className="boton boton-secundario"
                href={enlaceGeneral()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>

          <Medallon prioritario className="mx-auto lg:ms-auto lg:me-0" />
        </div>

        {/* Los tres datos que alguien verifica antes de escribirle a una
            abogada que no conoce: que está matriculada, cuándo atiende y dónde. */}
        <div className="border-t border-borde">
          <dl className="contenedor ficha py-8 sm:grid-cols-3">
            <div>
              <dt>Matrícula</dt>
              <dd>{MATRICULA_LEGIBLE}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{NEGOCIO.horarios.legible}</dd>
            </div>
            <div>
              <dt>Zona</dt>
              <dd>{NEGOCIO.zona}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="contenedor seccion revelar" aria-labelledby="titulo-especialidad">
        <p className="rotulo">Especialidad</p>
        <h2 id="titulo-especialidad" className="mt-4 max-w-2xl text-3xl">
          Derecho inmobiliario y notarial
        </h2>
        <hr className="filete mt-6" />

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {ESPECIALIDADES.map((area, i) => (
            <li key={area.slug}>
              <Link href={`/areas#${area.slug}`} className="tarjeta tarjeta-area h-full">
                <span className="numero">{String(i + 1).padStart(2, "0")}</span>
                <h3>{area.nombre}</h3>
                <p>{area.resumen}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="franja-arena seccion revelar"
        aria-labelledby="titulo-areas"
      >
        <div className="contenedor">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="rotulo">Áreas de práctica</p>
              <h2 id="titulo-areas" className="mt-4 text-3xl">
                Otras áreas en las que trabaja el estudio
              </h2>
            </div>
            <Link href="/areas" className="text-sm underline underline-offset-4 hover:text-acento">
              Ver todas las áreas
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OTRAS_AREAS.map((area, i) => (
              <li key={area.slug}>
                <Link href={`/areas#${area.slug}`} className="tarjeta tarjeta-area h-full">
                  <span className="numero">
                    {String(i + 1 + ESPECIALIDADES.length).padStart(2, "0")}
                  </span>
                  <h3>{area.nombre}</h3>
                  <p>{area.resumen}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="contenedor seccion revelar" aria-labelledby="titulo-sobre-mi">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="rotulo">Sobre mí</p>
            <h2 id="titulo-sobre-mi" className="mt-4 text-3xl">
              {NEGOCIO.titular}
            </h2>
            <hr className="filete mt-6" />
          </div>
          <div>
            {/* Cita en primera persona: es su voz, y la serif grande la separa
                del resto del sitio, que habla en tercera. */}
            <p className="font-serif text-2xl leading-snug">{BIOGRAFIA[0]}</p>
            <Link
              href="/sobre-mi"
              className="mt-6 inline-flex items-center text-sm underline underline-offset-4 hover:text-acento"
            >
              Conocer más
            </Link>
          </div>
        </div>
      </section>

      <section className="franja-marca seccion" aria-labelledby="titulo-turnos">
        <div className="contenedor revelar">
          <p className="rotulo">Turnos</p>
          <h2 id="titulo-turnos" className="mt-4 max-w-2xl text-3xl">
            Cómo pedir una consulta
          </h2>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo} className="border-t border-borde pt-5">
                <span className="rotulo">Paso {i + 1}</span>
                <h3 className="mt-3 text-xl">{paso.titulo}</h3>
                <p className="mt-2 text-sm text-texto-suave">{paso.texto}</p>
              </li>
            ))}
          </ol>

          <Link href="/turnos" className="boton boton-principal mt-10">
            Pedir un turno
          </Link>
        </div>
      </section>
    </main>
  );
}
