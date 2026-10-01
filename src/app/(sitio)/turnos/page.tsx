import type { Metadata } from "next";
import { FormularioTurno } from "@/components/FormularioTurno";
import { OPCIONES_AREA } from "@/lib/areas";
import { NEGOCIO } from "@/lib/negocio";
import { rangoDeTurnos } from "@/lib/turnos";
import { enlaceGeneral, telefonoLegible } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pedir un turno",
  description: `Pedí un turno con la ${NEGOCIO.nombre}, abogada. ${NEGOCIO.horarios.legible}. ${NEGOCIO.zona}.`,
  alternates: { canonical: "/turnos" },
};

export default async function Turnos({
  searchParams,
}: {
  searchParams: Promise<{ area?: string | string[] }>;
}) {
  // Desde la tarjeta de un área se llega con ?area=…, para no hacer elegir
  // el tema dos veces. Viene de la URL, así que solo se acepta si está en la
  // lista; cualquier otra cosa se ignora y el desplegable arranca vacío.
  const { area } = await searchParams;
  const areaInicial =
    typeof area === "string" && OPCIONES_AREA.includes(area) ? area : undefined;

  // Se calcula acá, en el servidor, con la hora de Buenos Aires. El
  // formulario lo recibe resuelto (ver el comentario en FormularioTurno).
  const { minimo, maximo } = rangoDeTurnos();

  return (
    <main id="contenido" className="contenedor seccion">
      <p className="rotulo">Turnos</p>
      <h1 className="mt-4 text-3xl sm:text-[length:var(--text-hero)]">Pedir un turno</h1>
      <hr className="filete mt-7" />

      <div className="mt-10 grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <section aria-label="Formulario de turno">
          <FormularioTurno minimo={minimo} maximo={maximo} areaInicial={areaInicial} />
        </section>

        <aside aria-label="Cómo funciona" className="flex flex-col gap-8 self-start">
          <div>
            <h2 className="text-xl">Cómo funciona</h2>
            <p className="mt-3 text-sm text-texto-suave">
              Esto es un pedido, no una reserva automática. Elegís el día y si
              preferís la mañana o la tarde, y te contactamos por teléfono para
              confirmar la hora exacta. El turno queda firme recién ahí.
            </p>
          </div>

          <dl className="ficha tarjeta p-6">
            <div>
              <dt>Días</dt>
              <dd>{NEGOCIO.horarios.dias}</dd>
            </div>
            <div>
              <dt>Horario</dt>
              <dd>
                {NEGOCIO.horarios.franjas
                  .map((f) => `${f.desde} a ${f.hasta}`)
                  .join(" y ")}
              </dd>
            </div>
            <div>
              <dt>Zona</dt>
              <dd>{NEGOCIO.zona}</dd>
            </div>
          </dl>

          <div>
            <h2 className="text-xl">¿Es urgente?</h2>
            <p className="mt-3 text-sm text-texto-suave">
              Si no podés esperar a que confirmemos el turno, escribí
              directamente por WhatsApp.
            </p>
            <a
              className="boton boton-whatsapp mt-4"
              href={enlaceGeneral()}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {telefonoLegible()}
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
