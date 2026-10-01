import type { Metadata } from "next";
import Link from "next/link";
import { FormularioContacto } from "@/components/FormularioContacto";
import { MATRICULA_LEGIBLE, NEGOCIO, enlaceMapa } from "@/lib/negocio";
import { enlaceGeneral, telefonoLegible } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contacto con la ${NEGOCIO.nombre}, abogada. WhatsApp, mail y formulario de consulta. ${NEGOCIO.horarios.legible}.`,
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  const mapa = enlaceMapa();

  return (
    <main id="contenido" className="contenedor seccion">
      <p className="rotulo">Contacto</p>
      <h1 className="mt-4 text-3xl sm:text-[length:var(--text-hero)]">Contacto</h1>
      <hr className="filete mt-7" />

      <div className="mt-10 grid gap-14 lg:grid-cols-2">
        <section aria-labelledby="titulo-directo">
          <h2 id="titulo-directo" className="text-xl">
            Contacto directo
          </h2>
          <p className="mt-3 text-texto-suave">
            Por WhatsApp o por mail, dentro del horario de atención. Si lo que
            querés es una consulta, lo más simple es{" "}
            <Link href="/turnos" className="text-acento underline underline-offset-4">
              pedir un turno
            </Link>
            .
          </p>
          <a
            className="boton boton-whatsapp mt-5"
            href={enlaceGeneral()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {telefonoLegible()}
          </a>

          <dl className="ficha tarjeta mt-8 p-6">
            <div>
              <dt>Mail</dt>
              <dd>
                <a href={`mailto:${NEGOCIO.email}`} className="break-all underline underline-offset-4">
                  {NEGOCIO.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>
                {mapa ? (
                  <a href={mapa} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    {NEGOCIO.direccionLegible}
                  </a>
                ) : (
                  NEGOCIO.direccionLegible
                )}
              </dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>{NEGOCIO.horarios.legible}</dd>
            </div>
            <div>
              <dt>Zona de atención</dt>
              <dd>{NEGOCIO.zona}</dd>
            </div>
            <div>
              <dt>Matrícula</dt>
              <dd>{MATRICULA_LEGIBLE}</dd>
            </div>
            {NEGOCIO.linkedin && (
              <div>
                <dt>LinkedIn</dt>
                <dd>
                  <a
                    href={NEGOCIO.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4"
                  >
                    Perfil profesional
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="titulo-formulario">
          <h2 id="titulo-formulario" className="text-xl">
            Dejá tu consulta
          </h2>
          <div className="mt-5">
            <FormularioContacto />
          </div>
        </section>
      </div>
    </main>
  );
}
