import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  borrarUsuarios,
  clienteAnonimo,
  clienteServicio,
  crearUsuario,
  hayConfig,
  verificarNoEsProduccion,
  type UsuarioPrueba,
} from "./setup";

/**
 * PRUEBAS DE AUTORIZACIÓN
 *
 * Estas pruebas verifican lo que NO se puede hacer. Valen más que las que
 * verifican lo que sí: un fallo acá significa datos expuestos, no una pantalla
 * fea. Y en este sitio los datos son de gente que consultó a una abogada: que
 * un turno se filtre no es un incidente técnico, es una violación de la
 * confidencialidad. Si alguna vez hay que borrar tests por tiempo, estos no
 * se tocan.
 *
 * Cada una corresponde a una defensa concreta del sistema. Si una se pone en
 * rojo, no se "arregla el test": se arregla el agujero.
 */

const d = hayConfig ? describe : describe.skip;

/** Marca los turnos que crean estos tests, para poder borrarlos al final. */
const NOMBRE_PRUEBA = "TEST AUTORIZACION";

/** Un lunes lejano: siempre es día hábil, sin depender de cuándo corran los tests. */
const LUNES = "2030-01-07";

let turnoId = "";
let clienteA: UsuarioPrueba;
let clienteB: UsuarioPrueba;
let editor: UsuarioPrueba;
let admin: UsuarioPrueba;

d("Autorización", () => {
  beforeAll(async () => {
    verificarNoEsProduccion();

    // Un turno de prueba, creado con la clave de servicio: el dato que NADIE
    // que no sea administrador debería poder leer ni tocar.
    const { data, error } = await clienteServicio()
      .from("turnos")
      .insert({
        nombre: NOMBRE_PRUEBA,
        telefono: "11 5555-0100",
        area: "penal",
        fecha_preferida: LUNES,
        franja: "manana",
        motivo: "Motivo de prueba que no debería ver nadie.",
      })
      .select("id")
      .single();

    if (error) throw new Error(`Falta la tabla turnos: corré 0001_esquema.sql. ${error.message}`);
    turnoId = data.id;

    [clienteA, clienteB, editor, admin] = await Promise.all([
      crearUsuario("cliente", "cliente-a"),
      crearUsuario("cliente", "cliente-b"),
      crearUsuario("editor"),
      crearUsuario("admin"),
    ]);
  });

  afterAll(async () => {
    await clienteServicio().from("turnos").delete().eq("nombre", NOMBRE_PRUEBA);
    await borrarUsuarios(clienteA?.id, clienteB?.id, editor?.id, admin?.id);
  });

  // ─────────────────────────── Turnos: lectura ───────────────────────────

  it("un anónimo NO lee turnos", async () => {
    const { data } = await clienteAnonimo().from("turnos").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un anónimo NO lee un turno ni pidiéndolo por su id", async () => {
    const { data } = await clienteAnonimo().from("turnos").select("id, motivo").eq("id", turnoId);
    expect(data ?? []).toHaveLength(0);
  });

  it("un cliente autenticado NO lee turnos", async () => {
    const { data } = await clienteA.cliente.from("turnos").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un editor NO lee turnos (contienen datos personales)", async () => {
    const { data } = await editor.cliente.from("turnos").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un administrador SÍ lee turnos", async () => {
    const { data } = await admin.cliente.from("turnos").select("id").eq("id", turnoId);
    expect(data).toHaveLength(1);
  });

  // ─────────────────────────── Turnos: escritura ───────────────────────────

  it("un anónimo SÍ puede pedir un turno, y entra como pendiente", async () => {
    const { error } = await clienteAnonimo().from("turnos").insert({
      nombre: NOMBRE_PRUEBA,
      telefono: "11 5555-0101",
      area: "sucesiones",
      fecha_preferida: LUNES,
      franja: "tarde",
    });
    expect(error).toBeNull();
  });

  it("un anónimo NO puede insertar un turno ya confirmado", async () => {
    const { error } = await clienteAnonimo().from("turnos").insert({
      nombre: NOMBRE_PRUEBA,
      telefono: "11 5555-0102",
      area: "sucesiones",
      fecha_preferida: LUNES,
      franja: "tarde",
      estado: "confirmado",
    });
    expect(error).not.toBeNull();
  });

  it("un anónimo NO puede cambiar el estado de un turno", async () => {
    await clienteAnonimo().from("turnos").update({ estado: "cancelado" }).eq("id", turnoId);

    const { data } = await clienteServicio()
      .from("turnos")
      .select("estado")
      .eq("id", turnoId)
      .single();
    expect(data?.estado).toBe("pendiente");
  });

  it("un editor NO puede cambiar el estado de un turno", async () => {
    await editor.cliente.from("turnos").update({ estado: "cancelado" }).eq("id", turnoId);

    const { data } = await clienteServicio()
      .from("turnos")
      .select("estado")
      .eq("id", turnoId)
      .single();
    expect(data?.estado).toBe("pendiente");
  });

  it("un anónimo NO puede borrar turnos", async () => {
    await clienteAnonimo().from("turnos").delete().eq("id", turnoId);

    const { data } = await clienteServicio().from("turnos").select("id").eq("id", turnoId);
    expect(data).toHaveLength(1);
  });

  it("un administrador SÍ puede confirmar un turno", async () => {
    const { error } = await admin.cliente
      .from("turnos")
      .update({ estado: "confirmado" })
      .eq("id", turnoId);
    expect(error).toBeNull();

    const { data } = await clienteServicio()
      .from("turnos")
      .select("estado")
      .eq("id", turnoId)
      .single();
    expect(data?.estado).toBe("confirmado");

    // Se deja como estaba, para no condicionar a los demás tests.
    await clienteServicio().from("turnos").update({ estado: "pendiente" }).eq("id", turnoId);
  });

  // ────────────────────── Consultas y otros datos personales ──────────────────────

  it("un anónimo NO lee consultas", async () => {
    const { data } = await clienteAnonimo().from("consultas").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un cliente autenticado NO lee consultas", async () => {
    const { data } = await clienteA.cliente.from("consultas").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un editor NO lee consultas (contienen datos personales)", async () => {
    const { data } = await editor.cliente.from("consultas").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("solo un administrador cambia el estado de una consulta", async () => {
    // La consulta se crea y se borra acá adentro: es la única que usa este
    // test, y así no depende de lo que haya en la base de pruebas.
    const { data: creada, error: errorAlta } = await clienteServicio()
      .from("consultas")
      .insert({
        nombre: "Consulta de prueba",
        email: "prueba@ejemplo.com",
        mensaje: "Mensaje de prueba para los tests de autorización.",
        origen: "contacto",
        estado: "nueva",
      })
      .select("id")
      .single();
    expect(errorAlta).toBeNull();
    const consultaId = creada!.id as string;

    const estadoReal = async () => {
      const { data } = await clienteServicio()
        .from("consultas")
        .select("estado")
        .eq("id", consultaId)
        .single();
      return data?.estado;
    };

    try {
      await clienteAnonimo().from("consultas").update({ estado: "descartada" }).eq("id", consultaId);
      expect(await estadoReal()).toBe("nueva");

      await editor.cliente.from("consultas").update({ estado: "descartada" }).eq("id", consultaId);
      expect(await estadoReal()).toBe("nueva");

      const { error } = await admin.cliente
        .from("consultas")
        .update({ estado: "respondida" })
        .eq("id", consultaId);
      expect(error).toBeNull();
      expect(await estadoReal()).toBe("respondida");
    } finally {
      await clienteServicio().from("consultas").delete().eq("id", consultaId);
    }
  });

  it("un cliente NO lee el perfil de otro cliente", async () => {
    const { data } = await clienteA.cliente
      .from("perfiles")
      .select("id, rol")
      .eq("id", clienteB.id);

    expect(data ?? []).toHaveLength(0);
  });

  it("un anónimo NO lee el registro de auditoría", async () => {
    const { data } = await clienteAnonimo().from("log_auditoria").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  it("un editor NO lee el registro de auditoría", async () => {
    const { data } = await editor.cliente.from("log_auditoria").select("id").limit(1);
    expect(data ?? []).toHaveLength(0);
  });

  // ──────────────── Escalada de privilegios ────────────────

  it("un usuario NO puede ascenderse a admin editando su propio perfil", async () => {
    const { error } = await clienteA.cliente
      .from("perfiles")
      .update({ rol: "admin" })
      .eq("id", clienteA.id);

    expect(error).not.toBeNull();

    // Y sobre todo: el rol real no cambió.
    const { data } = await clienteServicio()
      .from("perfiles")
      .select("rol")
      .eq("id", clienteA.id)
      .single();

    expect(data?.rol).toBe("cliente");
  });

  it("un editor NO puede ascenderse a admin", async () => {
    await editor.cliente.from("perfiles").update({ rol: "admin" }).eq("id", editor.id);

    const { data } = await clienteServicio()
      .from("perfiles")
      .select("rol")
      .eq("id", editor.id)
      .single();

    expect(data?.rol).toBe("editor");
  });
});
