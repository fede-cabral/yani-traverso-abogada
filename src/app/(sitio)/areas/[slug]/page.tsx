import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DatosEstructurados } from "@/components/DatosEstructurados";
import { AREAS } from "@/lib/areas";
import { CONTENIDO_AREAS } from "@/lib/areas-contenido";
import { env } from "@/lib/env";
import { NEGOCIO } from "@/lib/negocio";
import { ID_ESTUDIO, metadatosPagina, migas } from "@/lib/seo";

/*
  Una página por área. Cada una apunta a una búsqueda concreta ("abogada de
  sucesiones en Cañuelas"), que una sola página con las diez no puede ganar.
*/

function buscarArea(slug: string) {
  const area = AREAS.find((a) => a.slug === slug);
  return area ? { area, contenido: CONTENIDO_AREAS[area.slug] } : null;
}

export function generateStaticParams() {
  return AREAS.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const encontrada = buscarArea((await params).slug);
  if (!encontrada) return {};
  const { area, contenido } = encontrada;
  const ciudad = NEGOCIO.direccion.ciudad;
  return metadatosPagina({
    titulo: ciudad ? `${contenido.tituloSeo} en ${ciudad}` : contenido.tituloSeo,
    tituloCompleto: true,
    descripcion: contenido.descripcionSeo,
    ruta: `/areas/${area.slug}`,
  });
}

export default async function PaginaArea({ params }: { params: Promise<{ slug: string }> }) {
  const encontrada = buscarArea((await params).slug);
  if (!encontrada) notFound();
  const { area, contenido } = encontrada;
  const ruta = `/areas/${area.slug}`;

  const otras = AREAS.filter((a) => a.slug !== area.slug);

  return (
    <main id="contenido">
      <DatosEstructurados
        datos={[
          migas([
            { nombre: "Áreas de práctica", ruta: "/areas" },
            { nombre: area.nombre, ruta },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: area.nombre,
            serviceType: area.nombre,
            description: contenido.descripcionSeo,
            url: `${env.NEXT_PUBLIC_SITE_URL}${ruta}`,
            provider: { "@id": ID_ESTUDIO },
            areaServed: [
              { "@type": "AdministrativeArea", name: "Provincia de Buenos Aires" },
              { "@type": "AdministrativeArea", name: "Ciudad Autónoma de Buenos Aires" },
            ],
          },
        ]}
      />

      <section className="contenedor seccion">
        <nav aria-label="Ruta" className="migas">
          <Link href="/areas">Áreas de práctica</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{area.nombre}</span>
        </nav>

        <p className="rotulo mt-8">{area.especialidad ? "Especialidad" : "Área de práctica"}</p>
        <h1 className="mt-4 max-w-3xl text-3xl sm:text-[length:var(--text-hero)]">{area.nombre}</h1>
        <hr className="filete mt-7" />

        <div className="area-pagina mt-10">
          <div className="area-pagina-texto">
            {contenido.intro.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}

            <h2>Cómo es el trámite, en general</h2>
            <ol className="area-etapas">
              {contenido.etapas.map((etapa) => (
                <li key={etapa}>{etapa}</li>
              ))}
            </ol>
            <p className="area-aclaracion">
              Cada caso es distinto: esto es una guía general, no un asesoramiento. Qué
              corresponde en el tuyo se define en la consulta.
            </p>
          </div>

          <aside className="area-pagina-lateral" aria-labelledby="que-traer">
            <h2 id="que-traer">Qué traer a la primera consulta</h2>
            <ul>
              {contenido.documentacion.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
            <p className="area-aclaracion">Si no tenés todo, pedí el turno igual.</p>
            <Link href={`/turnos?area=${area.slug}`} className="boton boton-principal mt-6">
              Pedir un turno
            </Link>
          </aside>
        </div>
      </section>

      <section className="franja-arena seccion" aria-labelledby="otras-areas">
        <div className="contenedor">
          <h2 id="otras-areas" className="text-2xl">
            Otras áreas de práctica
          </h2>
          <ul className="otras-areas mt-6">
            {otras.map((a) => (
              <li key={a.slug}>
                <Link href={`/areas/${a.slug}`}>{a.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
