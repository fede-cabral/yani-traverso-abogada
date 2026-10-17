/**
 * Lo que se puede mandar al log de un error de la base.
 *
 * Nunca el error entero: cuando Postgres rechaza una fila por una regla, el
 * campo `details` trae la fila completa ("Failing row contains (...)"), es
 * decir el nombre, el teléfono y el motivo de quien pidió el turno. Y los
 * logs de Vercel los lee cualquiera con acceso al proyecto (regla 9).
 *
 * Se guarda el código y el mensaje. Del mensaje se tapan los valores entre
 * comillas que siguen a dos puntos (`... type date: "lo que escribió"`),
 * que es donde Postgres repite lo que mandó el usuario; el nombre de la
 * regla que falló (`constraint "turnos_dia_habil"`) queda, porque es lo que
 * hace falta para diagnosticar.
 */
export function errorParaLog(error: unknown): { codigo?: string; mensaje: string } {
  if (error && typeof error === "object") {
    const e = error as { code?: unknown; message?: unknown; name?: unknown };
    const mensaje = typeof e.message === "string" ? e.message : String(e.name ?? "error");
    return {
      ...(typeof e.code === "string" && { codigo: e.code }),
      mensaje: mensaje.replace(/:\s*"[^"]*"/g, ': "…"').slice(0, 300),
    };
  }
  return { mensaje: "error desconocido" };
}
