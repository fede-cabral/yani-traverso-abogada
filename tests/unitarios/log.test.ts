import { describe, expect, it } from "vitest";
import { errorParaLog } from "../../src/lib/seguridad/log";

/*
  Lo que llega al log de Vercel nunca puede traer los datos de quien pidió el
  turno (regla 9). Estos son errores con la forma real que devuelve Supabase.
*/
describe("errorParaLog", () => {
  it("descarta la fila completa que Postgres pone en details", () => {
    const error = {
      code: "23514",
      message: 'new row for relation "turnos" violates check constraint "turnos_dia_habil"',
      details: "Failing row contains (1, Juana Pérez, 11 5555-5555, divorcio urgente).",
      hint: null,
    };
    const log = JSON.stringify(errorParaLog(error));
    expect(log).not.toContain("Juana");
    expect(log).not.toContain("5555");
    expect(log).toContain("23514");
    // El nombre de la regla queda: es lo que sirve para diagnosticar.
    expect(log).toContain("turnos_dia_habil");
  });

  it("tapa el valor que Postgres repite en el mensaje", () => {
    const error = { code: "22P02", message: 'invalid input syntax for type date: "Juana Pérez"' };
    expect(errorParaLog(error).mensaje).not.toContain("Juana");
  });

  it("no falla con algo que no es un error", () => {
    expect(errorParaLog(undefined)).toEqual({ mensaje: "error desconocido" });
    expect(errorParaLog(new Error("sin conexión")).mensaje).toBe("sin conexión");
  });
});
