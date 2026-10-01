import type { Metadata } from "next";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Condiciones de uso de este sitio.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: true, follow: false },
};

/**
 * Aviso legal.
 *
 * Reemplaza a los "términos y condiciones" de la plantilla, que eran de una
 * tienda (precios, envíos, arrepentimiento, garantía). Acá no se vende nada:
 * lo que hay que dejar claro es qué es este sitio y qué no es.
 *
 * Es un borrador corto a propósito. La titular es abogada: el texto
 * definitivo lo escribe o lo aprueba ella.
 */
export default function AvisoLegal() {
  return (
    <main id="contenido" className="contenedor seccion">
      <p className="rotulo">Legal</p>
      <h1 className="mt-4 text-3xl">Aviso legal</h1>
      <hr className="filete mt-6" />

      <div className="prosa mt-8">
        <h2>1. Titular del sitio</h2>
        <p>
          Este sitio pertenece a <strong>{NEGOCIO.titular}</strong>, abogada,
          matrícula {MATRICULA_LEGIBLE} ({NEGOCIO.matricula.colegio}).
          Domicilio: {NEGOCIO.direccionLegible}. Contacto:{" "}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>.
        </p>

        <h2>2. Carácter informativo</h2>
        <p>
          El contenido de este sitio es de carácter general e informativo. No
          constituye asesoramiento legal para un caso concreto ni reemplaza una
          consulta profesional.
        </p>

        <h2>3. Consultas y turnos</h2>
        <p>
          Enviar una consulta o pedir un turno por este sitio no genera por sí
          solo una relación profesional entre quien escribe y la titular. El
          pedido de turno es una solicitud: queda firme cuando se confirma el
          día y el horario.
        </p>

        <h2>4. Datos personales</h2>
        <p>
          El tratamiento de los datos que se envían por los formularios está
          explicado en la{" "}
          <a href="/politica-de-privacidad">política de privacidad</a>.
        </p>

        <h2>5. Propiedad intelectual</h2>
        <p>
          Los textos, el logo y el diseño de este sitio pertenecen a su
          titular. No pueden reproducirse sin autorización.
        </p>

        <h2>6. Ley aplicable</h2>
        <p>Este sitio se rige por las leyes de la República Argentina.</p>

        {/* PENDIENTE: lo revisa la Dra. antes de publicar. Se saca este aviso
            cuando lo apruebe. Ver PENDIENTES.md. */}
        <p className="aviso">
          <strong>Borrador pendiente de revisión.</strong> Este texto lo tiene
          que revisar y aprobar la titular antes de que el sitio se publique.
        </p>
      </div>
    </main>
  );
}
