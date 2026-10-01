/**
 * Lo que devuelve una Server Action a su formulario.
 *
 * Vive aparte de las acciones porque un archivo "use server" solo puede
 * exportar funciones asíncronas, y este tipo lo comparten varias.
 */
export interface EstadoFormulario {
  ok: boolean;
  mensaje?: string;
  errores?: Record<string, string>;
  /**
   * Lo que la persona había escrito, para volver a mostrarlo cuando hay un
   * error. React vacía el formulario al terminar la acción: sin esto, un
   * teléfono mal escrito le borra a alguien el motivo entero de su consulta.
   */
  valores?: Record<string, string>;
}

export const ESTADO_INICIAL: EstadoFormulario = { ok: false };

/** Los campos de texto del formulario, tal cual llegaron, para devolverlos. */
export function valoresDe(datos: FormData, campos: readonly string[]): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const campo of campos) {
    const valor = datos.get(campo);
    // Recortado: es para rellenar un input, no hace falta devolver un mensaje
    // de 2 MB a quien lo mandó para probar.
    if (typeof valor === "string") valores[campo] = valor.slice(0, 2000);
  }
  return valores;
}
