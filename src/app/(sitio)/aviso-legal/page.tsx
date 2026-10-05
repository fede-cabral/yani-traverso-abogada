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
 * lo que hay que dejar claro es qué es este sitio, qué no es, quién es la
 * titular y cómo se hizo.
 *
 * Ninguna cláusula intenta quitarle derechos a quien visita el sitio: una
 * cláusula así no vale, y en el sitio de una abogada además se leería mal.
 * La protección real es que todo lo que el sitio dice sea cierto.
 *
 * La titular es abogada: el texto definitivo lo aprueba ella.
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
          El contenido de este sitio es de carácter general e informativo.
          No constituye asesoramiento legal para un caso concreto ni reemplaza
          una consulta profesional: cada situación requiere un análisis
          particular. No actúes ni dejes de actuar en un asunto legal
          basándote solo en lo que leas acá.
        </p>

        <h2>3. Consultas y turnos</h2>
        <p>
          Enviar una consulta o pedir un turno por este sitio no genera por sí
          solo una relación profesional entre quien escribe y la titular, ni
          la obliga a tomar un caso. El pedido de turno es una solicitud:
          queda firme recién cuando se confirman el día y el horario.
        </p>
        <p>
          Los formularios no son un medio para plazos urgentes. Si tu asunto
          tiene un vencimiento próximo, comunicate por teléfono o por WhatsApp.
        </p>

        <h2>4. Sin promesa de resultados</h2>
        <p>
          Nada de lo publicado en este sitio constituye una promesa ni una
          garantía sobre el resultado de un asunto. El resultado de un caso
          depende de sus circunstancias particulares.
        </p>

        <h2>5. Confidencialidad</h2>
        <p>
          Lo que se conversa en una consulta está amparado por el secreto
          profesional que rige para la abogacía. Por eso te pedimos que no
          envíes por los formularios el detalle de tu caso ni documentación:
          eso se trata en la consulta.
        </p>

        <h2>6. Datos personales</h2>
        <p>
          El tratamiento de los datos que se envían por los formularios está
          explicado en la{" "}
          <a href="/politica-de-privacidad">política de privacidad</a>.
        </p>

        <h2>7. Disponibilidad y enlaces externos</h2>
        <p>
          Se procura que el sitio funcione en forma continua y que su
          información esté actualizada, pero puede haber interrupciones por
          mantenimiento o por fallas de los proveedores técnicos. Los enlaces
          a WhatsApp, LinkedIn o mapas llevan a servicios de terceros, que se
          rigen por sus propias condiciones.
        </p>

        <h2>8. Propiedad intelectual</h2>
        <p>
          Los textos, el logo y el diseño de este sitio pertenecen a su
          titular o se usan con autorización. No pueden reproducirse sin
          autorización.
        </p>

        <h2>9. Cómo se hizo este sitio</h2>
        <p>
          Este sitio fue diseñado y desarrollado con asistencia de
          herramientas de inteligencia artificial, con revisión humana. La
          información sobre la titular y su actividad profesional surge de
          datos provistos por ella.
        </p>

        <h2>10. Cambios</h2>
        <p>
          Este aviso puede actualizarse. La versión vigente es siempre la
          publicada en esta página.
        </p>

        <h2>11. Ley aplicable</h2>
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
