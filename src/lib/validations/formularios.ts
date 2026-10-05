import { z } from "zod";
// Rutas relativas y no "@/…" a propósito: los tests unitarios importan este
// archivo directo, y Vitest no conoce el alias de Next.
import { OPCIONES_AREA } from "../areas";
import { ESTADOS_CONSULTA } from "../consultas";
import {
  ESTADOS_TURNO,
  FRANJAS,
  esDiaHabil,
  esFechaValida,
  fechaEnRango,
} from "../turnos";

/**
 * Esquemas de validación — la única puerta de entrada de datos externos.
 *
 * Todo lo que llega de afuera pasa por acá EN EL SERVIDOR. La validación del
 * navegador es comodidad para el usuario, no seguridad: el cliente está bajo
 * control del atacante y manda lo que se le antoja.
 *
 * Lista blanca, nunca lista negra: se define lo permitido, no se intenta
 * enumerar lo prohibido.
 */

const nombre = z
  .string({ error: "Decinos tu nombre" })
  .trim()
  .min(2, { error: "Decinos tu nombre" })
  .max(120, { error: "Máximo 120 caracteres" });

/** Solo dígitos, espacios y los signos de un teléfono. Sin saltos de línea. */
const telefono = z
  .string({ error: "Dejanos un teléfono" })
  .trim()
  .regex(/^[\d +()-]{6,25}$/, { error: "Teléfono inválido" });

const email = z.email({ error: "Email inválido" }).max(200);

/** Trampa para bots: un campo oculto que una persona nunca completa. */
const trampa = z.string().max(0).optional();

/**
 * Consentimiento expreso para el tratamiento de los datos (Ley 25.326,
 * art. 5). La casilla manda "si" solo si está marcada; cualquier otra cosa
 * —incluido que no venga— se rechaza. Ver CasillaPrivacidad.
 */
const aceptaPrivacidad = z.literal("si", {
  error: "Para enviar el formulario tenés que aceptar la política de privacidad",
});

/** Formulario de contacto. Lo que más abuso recibe, así que es lo más acotado. */
export const consultaSchema = z
  .object({
    nombre,
    email: email.nullable().optional(),
    telefono: telefono.nullable().optional(),
    mensaje: z
      .string({ error: "Escribí tu consulta" })
      .trim()
      .min(5, { error: "Contanos un poco más" })
      .max(2000, { error: "Máximo 2000 caracteres" }),
    acepta_privacidad: aceptaPrivacidad,
    website: trampa,
  })
  .refine((d) => Boolean(d.email) || Boolean(d.telefono), {
    error: "Dejanos un mail o un teléfono para poder responderte",
    path: ["email"],
  });

/**
 * Pedido de turno.
 *
 * El teléfono es obligatorio (en contacto no lo es): el turno se confirma
 * llamando o escribiendo, y un pedido sin teléfono es un pedido que nadie
 * puede confirmar.
 *
 * La fecha se valida tres veces: que exista, que sea día hábil y que caiga
 * en la ventana permitida. La base repite la regla del día hábil (ver
 * 0001_esquema.sql); la ventana no, porque depende del reloj.
 */
export const turnoSchema = z.object({
  nombre,
  telefono,
  email: email.nullable().optional(),
  area: z.enum(OPCIONES_AREA as [string, ...string[]], {
    error: "Elegí un tema de la lista",
  }),
  fecha_preferida: z
    .string({ error: "Elegí un día" })
    .refine(esFechaValida, { error: "Elegí un día" })
    .refine(esDiaHabil, { error: "Atendemos de lunes a viernes: elegí un día hábil" })
    .refine((f) => fechaEnRango(f), {
      error: "Elegí un día entre mañana y los próximos dos meses",
    }),
  franja: z.enum(FRANJAS, { error: "Elegí mañana o tarde" }),
  motivo: z.string().trim().max(500, { error: "Máximo 500 caracteres" }).nullable().optional(),
  acepta_privacidad: aceptaPrivacidad,
  website: trampa,
});

/** Cambio de estado de un turno, desde el panel. */
export const estadoTurnoSchema = z.object({
  id: z.uuid(),
  estado: z.enum(ESTADOS_TURNO),
});

/** Cambio de estado de una consulta, desde el panel. */
export const estadoConsultaSchema = z.object({
  id: z.uuid(),
  estado: z.enum(ESTADOS_CONSULTA),
});

export type Consulta = z.infer<typeof consultaSchema>;
export type PedidoTurno = z.infer<typeof turnoSchema>;

/** Los errores de Zod, como { campo: mensaje }, para pintarlos junto a cada input. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? "general");
    errores[campo] ??= issue.message;
  }
  return errores;
}
