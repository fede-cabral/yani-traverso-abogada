import type { Metadata } from "next";
import Link from "next/link";
import { Compartido } from "@/components/Compartido";
import { IconoDato } from "@/components/IconoDato";
import { BIOGRAFIA, DATOS_PROFESIONALES, TITULO_SOBRE_MI } from "@/lib/biografia";
import { DatosEstructurados } from "@/components/DatosEstructurados";
import { env } from "@/lib/env";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";
import { ID_ESTUDIO, metadatosPagina, migas } from "@/lib/seo";

export const metadata: Metadata = metadatosPagina({
  titulo: "Sobre mí",
  descripcion: `${NEGOCIO.titular}, abogada y escribana en ${NEGOCIO.direccion.ciudad}. Especialista en derecho notarial e inmobiliario. Matrícula ${MATRICULA_LEGIBLE}.`,
  ruta: "/sobre-mi",
});

/*
  La Dra. como persona, para Google: lo que permite que su nombre aparezca
  con su profesión, su formación y su colegio. Todo sale de lo que ella
  escribió en su biografía; nada se agrega.
*/
const persona = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: NEGOCIO.titular,
  honorificPrefix: "Dra.",
  jobTitle: ["Abogada", "Escribana"],
  url: `${env.NEXT_PUBLIC_SITE_URL}/sobre-mi`,
  alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad Católica de La Plata" },
  memberOf: { "@type": "Organization", name: NEGOCIO.matricula.colegio },
  knowsAbout: ["Derecho inmobiliario", "Derecho notarial"],
  worksFor: { "@id": ID_ESTUDIO },
  ...(NEGOCIO.linkedin && { sameAs: [NEGOCIO.linkedin.url] }),
};

export default function SobreMi() {
  return (
    <main id="contenido">
      <DatosEstructurados datos={[persona, migas([{ nombre: "Sobre mí", ruta: "/sobre-mi" }])]} />
      {/*
        Texto a la izquierda y la imagen a sangre a la derecha, de borde a
        borde de su columna: la escena (balanza, libros) dice "estudio
        jurídico" sin palabras, y el texto queda en la columna de lectura.
        En celular angosto la imagen pasa arriba, como franja.
      */}
      <section className="sobre-mi">
        <div className="sobre-mi-texto">
          <div className="rotulo-con-linea">
            <Compartido nombre="rotulo-sobre-mi">
              <p className="rotulo">Sobre mí</p>
            </Compartido>
          </div>
          <h1 className="sobre-mi-titulo">{TITULO_SOBRE_MI}</h1>
          <Compartido nombre="filete-sobre-mi">
            <hr className="filete-corto" />
          </Compartido>
          <div className="sobre-mi-bio">
            {BIOGRAFIA.map((parrafo) => (
              <p key={parrafo}>{parrafo}</p>
            ))}
          </div>
        </div>

        {/* Decorativa: no aporta información, el lector de pantalla la saltea. */}
        <div className="sobre-mi-escena">
          <img
            className="sobre-mi-imagen"
            src="/marca/sobre-mi-escena.webp"
            width={708}
            height={2000}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section aria-label="Datos profesionales" className="contenedor">
        <dl className="datos-profesionales">
          {DATOS_PROFESIONALES.map((dato) => (
            <div key={dato.titulo}>
              <IconoDato nombre={dato.icono} />
              <dt>{dato.titulo}</dt>
              <dd>
                {dato.lineas.map((linea) => (
                  <span key={linea}>{linea}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="contenedor pb-20">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/turnos" className="boton boton-principal">
            Pedir un turno
          </Link>
          <Link href="/areas" className="enlace-subrayado">
            Ver áreas de práctica
          </Link>
        </div>
      </section>
    </main>
  );
}
