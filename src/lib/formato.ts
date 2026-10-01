import { ZONA_ESTUDIO } from "./turnos";

/**
 * Fecha y hora legibles, en formato argentino y hora del estudio.
 *
 * Con zona fija: el servidor de Vercel corre en UTC, y sin esto una consulta
 * que entró a las 21 h del lunes se vería en el panel como del martes.
 */
export const formatoFechaHora = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: ZONA_ESTUDIO,
});
