import type { Metadata } from "next";
import { cambiarEstadoTurno } from "@/acciones/turnos";
import { CambiarEstado } from "@/components/admin/CambiarEstado";
import { nombreDeArea } from "@/lib/areas";
import { exigirAdmin } from "@/lib/auth/sesion";
import { listarTurnos } from "@/lib/datos/admin";
import { formatoFechaHora } from "@/lib/formato";
import {
  ESTADOS_TURNO,
  ETIQUETA_ESTADO,
  ETIQUETA_FRANJA,
  fechaLegible,
  type EstadoTurno,
} from "@/lib/turnos";

export const metadata: Metadata = { title: "Turnos" };

const OPCIONES_ESTADO = ESTADOS_TURNO.map((e) => ({ valor: e, etiqueta: ETIQUETA_ESTADO[e] }));

/** El color acompaña a la palabra, nunca la reemplaza: el estado se lee igual sin él. */
const COLOR_ESTADO: Record<EstadoTurno, string> = {
  pendiente: "text-aviso",
  confirmado: "text-exito",
  atendido: "text-texto-suave",
  cancelado: "text-peligro",
};

/** Solo la primera letra: `capitalize` de CSS daría "Jueves, 1 De Octubre". */
function enMayuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Pedidos de turno.
 *
 * Datos personales y, por el tema de cada consulta, potencialmente
 * sensibles: solo administradores. El control real lo hace la política RLS
 * de la tabla `turnos`; esta página además no se muestra a nadie más.
 */
export default async function AdminTurnos() {
  await exigirAdmin();
  const turnos = await listarTurnos();

  const pendientes = turnos.filter((t) => t.estado === "pendiente").length;

  return (
    <>
      <h1 className="text-2xl">Turnos</h1>
      <p className="mt-2 text-sm text-texto-suave">
        {turnos.length} en total · {pendientes} por confirmar
      </p>

      <p className="aviso mt-4 max-w-2xl">
        Esta pantalla contiene datos personales. Los pedidos se conservan 24
        meses y después se eliminan.
      </p>

      {turnos.length === 0 ? (
        <div className="tarjeta mt-6 grid place-items-center p-12 text-center">
          <p className="font-semibold">Todavía no hay pedidos de turno</p>
          <p className="mt-2 max-w-sm text-sm text-texto-suave">
            Cuando alguien pida uno desde el sitio, aparece acá como pendiente
            para que lo llames y acuerden el horario.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {turnos.map((t) => (
            <li key={t.id} className="tarjeta p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{t.nombre}</p>
                <span className={`estado ${COLOR_ESTADO[t.estado]}`}>
                  {ETIQUETA_ESTADO[t.estado]}
                </span>
              </div>

              <p className="mt-2 text-sm">
                {enMayuscula(fechaLegible(t.fecha_preferida))} · {ETIQUETA_FRANJA[t.franja]} ·{" "}
                {nombreDeArea(t.area)}
              </p>

              <p className="mt-1 text-sm text-texto-suave">
                <a href={`tel:${t.telefono}`} className="underline">{t.telefono}</a>
                {t.email && (
                  <>
                    {" · "}
                    <a href={`mailto:${t.email}`} className="underline">{t.email}</a>
                  </>
                )}
              </p>

              {t.motivo && <p className="mt-3 whitespace-pre-line text-sm">{t.motivo}</p>}

              <p className="mt-3 text-xs text-texto-suave">
                Pedido el {formatoFechaHora.format(new Date(t.creado_en))}
              </p>

              <div className="mt-4 border-t border-borde pt-4">
                <CambiarEstado
                  accion={cambiarEstadoTurno}
                  id={t.id}
                  estado={t.estado}
                  opciones={OPCIONES_ESTADO}
                  descripcion={`del turno de ${t.nombre}`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
