import type { Metadata } from "next";
import Link from "next/link";
import { Medallon } from "@/components/Medallon";
import { BIOGRAFIA } from "@/lib/biografia";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Sobre mí",
  description: `${NEGOCIO.titular}, abogada. Especialista en derecho inmobiliario y notarial. Matrícula ${MATRICULA_LEGIBLE}.`,
  alternates: { canonical: "/sobre-mi" },
};

export default function SobreMi() {
  return (
    <main id="contenido">
      <section className="franja-marca">
        <div className="contenedor grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="rotulo">Sobre mí</p>
            <h1 className="mt-4 text-3xl sm:text-[length:var(--text-hero)]">
              {NEGOCIO.titular}
            </h1>
            <hr className="filete mt-7" />
            <p className="mt-7 text-lg text-texto-suave">
              Abogada · Matrícula {MATRICULA_LEGIBLE}
            </p>
          </div>
          {/* PENDIENTE: cuando la Dra. pase una foto, va acá en lugar del
              logo. Una foto real, no de banco de imágenes: quien elige
              abogada quiere verle la cara a la persona que lo va a atender. */}
          <Medallon prioritario className="mx-auto lg:ms-auto lg:me-0" />
        </div>
      </section>

      <section className="contenedor seccion">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="max-w-[62ch]">
            {BIOGRAFIA.map((parrafo, i) => (
              <p
                key={parrafo}
                className={
                  i === 0
                    ? "font-serif text-2xl leading-snug"
                    : "mt-6 text-lg text-texto-suave"
                }
              >
                {parrafo}
              </p>
            ))}
          </div>

          <aside aria-label="Datos profesionales" className="tarjeta self-start p-6">
            <dl className="ficha">
              <div>
                <dt>Matrícula</dt>
                <dd>
                  Tomo {NEGOCIO.matricula.tomo}, Folio {NEGOCIO.matricula.folio}
                  <br />
                  {NEGOCIO.matricula.colegio}
                </dd>
              </div>
              <div>
                <dt>Especialidad</dt>
                <dd>Derecho inmobiliario y notarial</dd>
              </div>
              <div>
                <dt>Zona de atención</dt>
                <dd>{NEGOCIO.zona}</dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>{NEGOCIO.horarios.legible}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/turnos" className="boton boton-principal">
            Pedir un turno
          </Link>
          <Link href="/areas" className="boton boton-secundario">
            Ver áreas de práctica
          </Link>
        </div>
      </section>
    </main>
  );
}
