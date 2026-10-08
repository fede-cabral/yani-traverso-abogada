import type { Metadata } from "next";
import Link from "next/link";
import { Compartido } from "@/components/Compartido";
import { IconoDato } from "@/components/IconoDato";
import { BIOGRAFIA, DATOS_PROFESIONALES, TITULO_SOBRE_MI } from "@/lib/biografia";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: `${NEGOCIO.titular}, abogada y escribana. Especialista en derecho notarial e inmobiliario. Matrícula ${MATRICULA_LEGIBLE}.`,
  alternates: { canonical: "/sobre-mi" },
};

export default function SobreMi() {
  return (
    <main id="contenido">
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
            width={301}
            height={850}
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
