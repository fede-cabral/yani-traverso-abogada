/**
 * Estados de una consulta del formulario de contacto.
 *
 * Son los valores del enum `estado_consulta` de la base (migración 0001), en
 * el mismo orden. Si se agrega uno allá, se agrega acá.
 */
export const ESTADOS_CONSULTA = [
  "nueva",
  "en_proceso",
  "respondida",
  "cerrada",
  "descartada",
] as const;

export type EstadoConsulta = (typeof ESTADOS_CONSULTA)[number];

export const ETIQUETA_ESTADO_CONSULTA: Record<EstadoConsulta, string> = {
  nueva: "Sin responder",
  en_proceso: "En curso",
  respondida: "Respondida",
  cerrada: "Cerrada",
  descartada: "Descartada",
};

/** Las que todavía esperan algo de la Dra.: son las que se cuentan y van arriba. */
export function esperaRespuesta(estado: EstadoConsulta): boolean {
  return estado === "nueva" || estado === "en_proceso";
}
