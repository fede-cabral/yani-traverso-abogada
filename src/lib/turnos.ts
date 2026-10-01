/**
 * Reglas de los turnos.
 *
 * Un turno acá es un PEDIDO, no una reserva: la persona propone un día y una
 * franja, y la Dra. confirma el horario exacto por teléfono. No hay agenda de
 * horarios libres porque eso exigiría que ella mantenga su disponibilidad
 * cargada al día, y una agenda desactualizada da turnos que no existen.
 *
 * Este archivo no importa nada del servidor a propósito: lo usan el
 * formulario (en el navegador), la validación Zod y los tests.
 */

/** Zona horaria del estudio. "Hoy" y "mañana" se calculan siempre acá. */
export const ZONA_ESTUDIO = "America/Argentina/Buenos_Aires";

/** Las dos franjas de atención. Coinciden con NEGOCIO.horarios. */
export const FRANJAS = ["manana", "tarde"] as const;
export type Franja = (typeof FRANJAS)[number];

export const ETIQUETA_FRANJA: Record<Franja, string> = {
  manana: "Mañana (10 a 13 h)",
  tarde: "Tarde (15 a 18 h)",
};

export const ESTADOS_TURNO = ["pendiente", "confirmado", "atendido", "cancelado"] as const;
export type EstadoTurno = (typeof ESTADOS_TURNO)[number];

export const ETIQUETA_ESTADO: Record<EstadoTurno, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  atendido: "Atendido",
  cancelado: "Cancelado",
};

/** Con cuánta anticipación máxima se puede pedir un turno. */
export const DIAS_MAXIMOS = 60;

const formatoFechaISO = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_ESTUDIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * La fecha de hoy en el estudio, como "AAAA-MM-DD".
 *
 * Con `Intl` y zona fija, no con `getDate()`: el servidor corre en UTC, y a
 * las 22 h de Buenos Aires ya es "mañana" para él. Sin esto, de noche el
 * formulario ofrecería como primer día uno que en Argentina es pasado mañana.
 */
export function hoyEnEstudio(ahora: Date = new Date()): string {
  return formatoFechaISO.format(ahora);
}

/**
 * Suma días a una fecha "AAAA-MM-DD".
 *
 * Se opera al mediodía UTC: lejos de la medianoche, ningún desfase horario
 * puede correr el resultado un día para atrás o para adelante.
 */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** ¿Es una fecha real con formato AAAA-MM-DD? Rechaza el 31 de febrero. */
export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}

/** Lunes a viernes. El estudio no atiende sábados ni domingos. */
export function esDiaHabil(fecha: string): boolean {
  const dia = new Date(`${fecha}T12:00:00Z`).getUTCDay();
  return dia >= 1 && dia <= 5;
}

/**
 * Entre qué fechas se puede pedir turno: desde mañana hasta DIAS_MAXIMOS.
 *
 * Desde mañana y no desde hoy: un pedido para "hoy a la tarde" hecho a las
 * 17:30 no lo puede confirmar nadie, y la persona se queda esperando.
 */
export function rangoDeTurnos(ahora: Date = new Date()): { minimo: string; maximo: string } {
  const hoy = hoyEnEstudio(ahora);
  return { minimo: sumarDias(hoy, 1), maximo: sumarDias(hoy, DIAS_MAXIMOS) };
}

export function fechaEnRango(fecha: string, ahora: Date = new Date()): boolean {
  const { minimo, maximo } = rangoDeTurnos(ahora);
  // Las fechas ISO se comparan bien como texto: mismo largo, de mayor a menor.
  return fecha >= minimo && fecha <= maximo;
}

const formatoFechaLarga = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** "2026-10-06" → "martes, 6 de octubre". Para mostrar, nunca para guardar. */
export function fechaLegible(fecha: string): string {
  if (!esFechaValida(fecha)) return fecha;
  return formatoFechaLarga.format(new Date(`${fecha}T12:00:00Z`));
}
