import { describe, expect, it } from "vitest";
import { AREAS, AREA_OTRA, OPCIONES_AREA, nombreDeArea } from "../../src/lib/areas";
import { formatearTelefono } from "../../src/lib/telefono";
import {
  DIAS_MAXIMOS,
  esDiaHabil,
  esFechaValida,
  fechaEnRango,
  fechaLegible,
  hoyEnEstudio,
  rangoDeTurnos,
  sumarDias,
} from "../../src/lib/turnos";
import { ESTADOS_CONSULTA, ETIQUETA_ESTADO_CONSULTA, esperaRespuesta } from "../../src/lib/consultas";
import {
  consultaSchema,
  estadoConsultaSchema,
  turnoSchema,
} from "../../src/lib/validations/formularios";

/**
 * Tests unitarios de las reglas del sitio.
 *
 * A diferencia de los de tests/authz/, estos no necesitan base de datos: corren
 * siempre, en cualquier máquina, en menos de un segundo. Cubren la lógica que
 * decide qué turno se acepta — fechas, días hábiles, zona horaria — y que si
 * se rompe, se rompe en silencio: nadie avisa que el formulario dejó pasar un
 * sábado.
 */

/** El primer día hábil dentro de la ventana de turnos, contado desde hoy. */
function proximoDiaHabil(): string {
  let fecha = rangoDeTurnos().minimo;
  while (!esDiaHabil(fecha)) fecha = sumarDias(fecha, 1);
  return fecha;
}

const pedidoValido = () => ({
  nombre: "Persona de Prueba",
  telefono: "11 5555-0100",
  email: null,
  area: "sucesiones",
  fecha_preferida: proximoDiaHabil(),
  franja: "manana",
  motivo: null,
  acepta_privacidad: "si",
});

describe("Fechas en hora del estudio", () => {
  it("'hoy' es el día de Buenos Aires, no el del servidor", () => {
    // 02:30 UTC del 1/10 son las 23:30 del 30/9 en Buenos Aires.
    expect(hoyEnEstudio(new Date("2026-10-01T02:30:00Z"))).toBe("2026-09-30");
    // Y a las 03:00 UTC ya es 1/10 también acá.
    expect(hoyEnEstudio(new Date("2026-10-01T03:00:00Z"))).toBe("2026-10-01");
  });

  it("sumar días cruza bien el fin de mes y de año", () => {
    expect(sumarDias("2026-09-30", 1)).toBe("2026-10-01");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2028-02-28", 1)).toBe("2028-02-29"); // bisiesto
  });

  it("rechaza fechas que no existen o están mal escritas", () => {
    expect(esFechaValida("2026-10-06")).toBe(true);
    expect(esFechaValida("2026-02-31")).toBe(false);
    expect(esFechaValida("06/10/2026")).toBe(false);
    expect(esFechaValida("2026-10-06T10:00")).toBe(false);
    expect(esFechaValida("")).toBe(false);
  });

  it("solo son hábiles los días de lunes a viernes", () => {
    expect(esDiaHabil("2026-10-05")).toBe(true); // lunes
    expect(esDiaHabil("2026-10-09")).toBe(true); // viernes
    expect(esDiaHabil("2026-10-10")).toBe(false); // sábado
    expect(esDiaHabil("2026-10-11")).toBe(false); // domingo
  });

  it("la ventana de turnos va de mañana a dos meses, nunca incluye hoy", () => {
    const ahora = new Date("2026-10-01T15:00:00Z");
    expect(rangoDeTurnos(ahora)).toEqual({
      minimo: "2026-10-02",
      maximo: sumarDias("2026-10-01", DIAS_MAXIMOS),
    });
    expect(fechaEnRango("2026-10-01", ahora)).toBe(false);
    expect(fechaEnRango("2026-10-02", ahora)).toBe(true);
    expect(fechaEnRango("2026-09-30", ahora)).toBe(false);
    expect(fechaEnRango("2027-06-01", ahora)).toBe(false);
  });

  it("de noche, 'mañana' sigue siendo el mañana de Buenos Aires", () => {
    // 23:30 del 30/9 en Buenos Aires: para el servidor (UTC) ya es 1/10.
    // El primer día que se puede pedir es el 1/10, no el 2/10.
    const ahora = new Date("2026-10-01T02:30:00Z");
    expect(rangoDeTurnos(ahora).minimo).toBe("2026-10-01");
  });

  it("muestra la fecha con el día de la semana correcto", () => {
    expect(fechaLegible("2026-10-06")).toBe("martes, 6 de octubre");
  });
});

describe("Pedido de turno", () => {
  it("acepta un pedido completo en día hábil", () => {
    expect(turnoSchema.safeParse(pedidoValido()).success).toBe(true);
  });

  it("rechaza sábados y domingos, con un mensaje que explica por qué", () => {
    let sabado = rangoDeTurnos().minimo;
    while (new Date(`${sabado}T12:00:00Z`).getUTCDay() !== 6) sabado = sumarDias(sabado, 1);

    const r = turnoSchema.safeParse({ ...pedidoValido(), fecha_preferida: sabado });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toContain("lunes a viernes");
  });

  it("rechaza fechas de hoy, pasadas o demasiado lejanas", () => {
    for (const fecha of [hoyEnEstudio(), "2020-01-06", sumarDias(hoyEnEstudio(), 400)]) {
      const r = turnoSchema.safeParse({ ...pedidoValido(), fecha_preferida: fecha });
      expect(r.success, `aceptó la fecha ${fecha}`).toBe(false);
    }
  });

  it("exige teléfono: sin él nadie puede confirmar el turno", () => {
    expect(turnoSchema.safeParse({ ...pedidoValido(), telefono: "" }).success).toBe(false);
    expect(turnoSchema.safeParse({ ...pedidoValido(), telefono: null }).success).toBe(false);
  });

  it("rechaza teléfonos con letras o saltos de línea", () => {
    for (const malo of ["llamame", "11 5555\n0100", "<script>", "1"]) {
      const r = turnoSchema.safeParse({ ...pedidoValido(), telefono: malo });
      expect(r.success, `aceptó "${malo}"`).toBe(false);
    }
  });

  it("solo acepta áreas de la lista", () => {
    expect(turnoSchema.safeParse({ ...pedidoValido(), area: AREA_OTRA }).success).toBe(true);
    for (const mala of ["tributario", "", "Sucesiones", "sucesiones; drop table turnos"]) {
      const r = turnoSchema.safeParse({ ...pedidoValido(), area: mala });
      expect(r.success, `aceptó "${mala}"`).toBe(false);
    }
  });

  it("solo acepta las dos franjas de atención", () => {
    expect(turnoSchema.safeParse({ ...pedidoValido(), franja: "tarde" }).success).toBe(true);
    expect(turnoSchema.safeParse({ ...pedidoValido(), franja: "noche" }).success).toBe(false);
  });

  it("el motivo es opcional pero tiene tope", () => {
    expect(turnoSchema.safeParse({ ...pedidoValido(), motivo: "x".repeat(500) }).success).toBe(true);
    expect(turnoSchema.safeParse({ ...pedidoValido(), motivo: "x".repeat(501) }).success).toBe(false);
  });

  it("si el campo trampa viene con algo, el pedido no valida", () => {
    expect(turnoSchema.safeParse({ ...pedidoValido(), website: "http://spam" }).success).toBe(false);
  });

  it("sin aceptar la política de privacidad, el pedido no valida (Ley 25.326, art. 5)", () => {
    for (const valor of [undefined, null, "", "on", "no", "true"]) {
      const r = turnoSchema.safeParse({ ...pedidoValido(), acepta_privacidad: valor });
      expect(r.success, `aceptó acepta_privacidad = ${String(valor)}`).toBe(false);
    }
  });
});

describe("Formulario de contacto", () => {
  const consulta = {
    nombre: "Persona de Prueba",
    mensaje: "Una consulta de prueba.",
    acepta_privacidad: "si",
  };

  it("alcanza con un mail o con un teléfono", () => {
    expect(consultaSchema.safeParse({ ...consulta, email: "p@ejemplo.com" }).success).toBe(true);
    expect(consultaSchema.safeParse({ ...consulta, telefono: "11 5555-0100" }).success).toBe(true);
  });

  it("sin ninguna forma de contacto, se rechaza", () => {
    const r = consultaSchema.safeParse({ ...consulta, email: null, telefono: null });
    expect(r.success).toBe(false);
  });

  it("el mensaje tiene piso y techo", () => {
    const base = { ...consulta, email: "p@ejemplo.com" };
    expect(consultaSchema.safeParse({ ...base, mensaje: "hola" }).success).toBe(false);
    expect(consultaSchema.safeParse({ ...base, mensaje: "x".repeat(2001) }).success).toBe(false);
  });

  it("sin aceptar la política de privacidad, la consulta no valida", () => {
    const base = { ...consulta, email: "p@ejemplo.com" };
    expect(consultaSchema.safeParse({ ...base, acepta_privacidad: undefined }).success).toBe(false);
    expect(consultaSchema.safeParse({ ...base, acepta_privacidad: "on" }).success).toBe(false);
  });
});

describe("Áreas de práctica", () => {
  it("los slugs son únicos y tienen el formato que exige la base", () => {
    const slugs = AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    // Misma expresión que la restricción turnos_area_formato de 0001_esquema.sql.
    for (const slug of OPCIONES_AREA) {
      expect(slug, `"${slug}" no pasaría la restricción de la base`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
      );
    }
  });

  it("hay exactamente dos especialidades: inmobiliario y notarial", () => {
    expect(AREAS.filter((a) => a.especialidad).map((a) => a.slug)).toEqual([
      "inmobiliario",
      "notarial",
    ]);
  });

  it("'otra' se puede elegir y tiene un nombre legible", () => {
    expect(OPCIONES_AREA).toContain(AREA_OTRA);
    expect(nombreDeArea(AREA_OTRA)).toBe("Otro tema");
    expect(nombreDeArea("sucesiones")).toBe("Sucesiones");
  });
});

describe("Estados de una consulta", () => {
  const id = "d0000000-0000-4000-8000-0000000000c1";

  it("todo estado tiene una etiqueta para mostrar", () => {
    for (const estado of ESTADOS_CONSULTA) {
      expect(ETIQUETA_ESTADO_CONSULTA[estado]).toBeTruthy();
    }
  });

  it("solo las nuevas y las que están en curso esperan respuesta", () => {
    expect(ESTADOS_CONSULTA.filter(esperaRespuesta)).toEqual(["nueva", "en_proceso"]);
  });

  it("el panel solo puede mandar un estado de la lista y un id válido", () => {
    expect(estadoConsultaSchema.safeParse({ id, estado: "respondida" }).success).toBe(true);
    expect(estadoConsultaSchema.safeParse({ id, estado: "borrada" }).success).toBe(false);
    expect(estadoConsultaSchema.safeParse({ id: "1 or 1=1", estado: "respondida" }).success).toBe(false);
  });
});

describe("Teléfono legible", () => {
  it("un número de Buenos Aires se parte en 11 + ocho dígitos", () => {
    expect(formatearTelefono("5491127088591")).toBe("+54 9 11 2708-8591");
  });

  it("un número del interior se parte con su código de área", () => {
    expect(formatearTelefono("5493511234567")).toBe("+54 9 351 123-4567");
  });

  it("un número que no reconoce se muestra entero, sin inventar un formato", () => {
    expect(formatearTelefono("12025550100")).toBe("+12025550100");
  });
});
