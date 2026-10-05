import { afterAll, describe, expect, it } from "vitest";
import { clienteServicio, hayConfig, verificarNoEsProduccion } from "./setup";

/**
 * INVARIANTES DE LA BASE DE DATOS
 *
 * Estas pruebas no verifican permisos de usuarios sino que las restricciones
 * de Postgres realmente rechazan el estado inválido. Son la última línea de
 * defensa: si el código de la aplicación falla, esto tiene que aguantar.
 *
 * Por eso insertan con la clave de servicio, que saltea RLS y Zod: lo que se
 * prueba es qué pasa cuando no queda ninguna otra defensa en pie.
 */

const d = hayConfig ? describe : describe.skip;

const NOMBRE_PRUEBA = "TEST RESTRICCIONES";

/** Un lunes y un sábado lejanos: no dependen de cuándo corran los tests. */
const LUNES = "2030-01-07";
const SABADO = "2030-01-12";

const turnoValido = () => ({
  nombre: NOMBRE_PRUEBA,
  telefono: "11 5555-0100",
  area: "sucesiones",
  fecha_preferida: LUNES,
  franja: "manana",
});

d("Restricciones de la base", () => {
  afterAll(async () => {
    await clienteServicio().from("turnos").delete().eq("nombre", NOMBRE_PRUEBA);
  });

  it("TODAS las tablas públicas tienen RLS activada", async () => {
    // El test más importante del archivo. Una tabla sin RLS con la clave
    // anónima publicada es, literalmente, una base de datos abierta a
    // internet. Esto impide que una tabla nueva se cuele sin políticas dentro
    // de seis meses, cuando nadie se acuerde de la regla.
    const { data, error } = await clienteServicio().rpc("tablas_sin_rls");

    expect(
      error,
      "Falta la función tablas_sin_rls: corré la migración 0003_funciones.sql",
    ).toBeNull();

    expect(data, `Tablas SIN RLS: ${JSON.stringify(data)} — revisar de inmediato`).toEqual([]);
  });

  // ─────────────────────────── Turnos ───────────────────────────

  it("SÍ se acepta un turno válido en día hábil", async () => {
    verificarNoEsProduccion();
    const { error } = await clienteServicio().from("turnos").insert(turnoValido());
    expect(error).toBeNull();
  });

  it("NO se acepta un turno un sábado, aunque se saltee Zod", async () => {
    const { error } = await clienteServicio()
      .from("turnos")
      .insert({ ...turnoValido(), fecha_preferida: SABADO });
    expect(error).not.toBeNull();
  });

  it("NO se acepta un teléfono con letras", async () => {
    const { error } = await clienteServicio()
      .from("turnos")
      .insert({ ...turnoValido(), telefono: "llamame al fijo" });
    expect(error).not.toBeNull();
  });

  it("NO se acepta un área con formato inválido", async () => {
    for (const area of ["Sucesiones", "con espacios", "a".repeat(61), ""]) {
      const { error } = await clienteServicio().from("turnos").insert({ ...turnoValido(), area });
      expect(error, `la base aceptó el área "${area}"`).not.toBeNull();
    }
  });

  it("NO se acepta un motivo de más de 500 caracteres", async () => {
    const { error } = await clienteServicio()
      .from("turnos")
      .insert({ ...turnoValido(), motivo: "x".repeat(501) });
    expect(error).not.toBeNull();
  });

  it("NO se acepta una franja que no existe", async () => {
    const { error } = await clienteServicio()
      .from("turnos")
      .insert({ ...turnoValido(), franja: "noche" });
    expect(error).not.toBeNull();
  });

  // ─────────────────────── Límite de peticiones ───────────────────────

  it("el límite de peticiones cuenta y corta", async () => {
    verificarNoEsProduccion();
    const servicio = clienteServicio();
    const clave = `test:${Date.now()}`;

    const resultados: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      const { data } = await servicio.rpc("registrar_intento", {
        p_clave: clave,
        p_maximo: 3,
        p_ventana_segs: 60,
      });
      resultados.push(data === true);
    }

    expect(resultados).toEqual([true, true, true, false]);
  });

  it("el límite de peticiones es atómico bajo concurrencia", async () => {
    // Diez peticiones en paralelo tienen que contar diez, no una. Un contador
    // con lectura y escritura por separado fallaría acá, y es justo así como
    // un script de abuso esquiva un rate limiting mal hecho.
    const servicio = clienteServicio();
    const clave = `test-concurrente:${Date.now()}`;

    const respuestas = await Promise.all(
      Array.from({ length: 10 }, () =>
        servicio.rpc("registrar_intento", {
          p_clave: clave,
          p_maximo: 5,
          p_ventana_segs: 60,
        }),
      ),
    );

    const permitidas = respuestas.filter((r) => r.data === true).length;
    expect(permitidas).toBe(5);
  });
});
