import type { Metadata } from "next";
import { cambiarEstadoConsulta } from "@/acciones/consultas";
import { CambiarEstado } from "@/components/admin/CambiarEstado";
import { exigirAdmin } from "@/lib/auth/sesion";
import {
  ESTADOS_CONSULTA,
  ETIQUETA_ESTADO_CONSULTA,
  esperaRespuesta,
  type EstadoConsulta,
} from "@/lib/consultas";
import { listarConsultas } from "@/lib/datos/admin";
import { formatoFechaHora } from "@/lib/formato";

export const metadata: Metadata = { title: "Consultas" };

const OPCIONES_ESTADO = ESTADOS_CONSULTA.map((e) => ({
  valor: e,
  etiqueta: ETIQUETA_ESTADO_CONSULTA[e],
}));

/** El color acompaña a la palabra, nunca la reemplaza: el estado se lee igual sin él. */
const COLOR_ESTADO: Record<EstadoConsulta, string> = {
  nueva: "text-aviso",
  en_proceso: "text-aviso",
  respondida: "text-exito",
  cerrada: "text-texto-suave",
  descartada: "text-texto-suave",
};

/**
 * Consultas recibidas por el formulario de contacto.
 *
 * Contiene datos personales, así que es solo para administradores. El
 * control real lo hace la política RLS de la tabla `consultas`; esta página
 * además no se muestra a nadie más.
 */
export default async function AdminConsultas() {
  await exigirAdmin();
  const consultas = await listarConsultas();

  const esperando = consultas.filter((c) => esperaRespuesta(c.estado)).length;

  return (
    <>
      <h1 className="text-2xl">Consultas</h1>
      <p className="mt-2 text-sm text-texto-suave">
        {consultas.length} en total · {esperando} esperando respuesta
      </p>

      <p className="aviso mt-4 max-w-2xl">
        Esta pantalla contiene datos personales. Las consultas se conservan 24
        meses y después se eliminan.
      </p>

      {consultas.length === 0 ? (
        <div className="tarjeta mt-6 grid place-items-center p-12 text-center">
          <p className="font-semibold">Todavía no hay consultas</p>
          <p className="mt-2 max-w-sm text-sm text-texto-suave">
            Lo que la gente escriba en el formulario de contacto del sitio
            aparece acá.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {consultas.map((c) => (
            <li key={c.id} className="tarjeta p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{c.nombre}</p>
                <span className={`estado ${COLOR_ESTADO[c.estado]}`}>
                  {ETIQUETA_ESTADO_CONSULTA[c.estado]}
                </span>
              </div>

              <p className="mt-1 text-sm text-texto-suave">
                {c.email && <a href={`mailto:${c.email}`} className="underline">{c.email}</a>}
                {c.email && c.telefono && " · "}
                {c.telefono && <a href={`tel:${c.telefono}`} className="underline">{c.telefono}</a>}
              </p>

              <p className="mt-3 whitespace-pre-line text-sm">{c.mensaje}</p>

              <p className="mt-3 text-xs text-texto-suave">
                Recibida el {formatoFechaHora.format(new Date(c.creado_en))}
              </p>

              <div className="mt-4 border-t border-borde pt-4">
                <CambiarEstado
                  accion={cambiarEstadoConsulta}
                  id={c.id}
                  estado={c.estado}
                  opciones={OPCIONES_ESTADO}
                  descripcion={`de la consulta de ${c.nombre}`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
