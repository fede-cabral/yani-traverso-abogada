"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auth/auditoria";
import { exigirAdmin } from "@/lib/auth/sesion";
import { env } from "@/lib/env";
import { LIMITES, permitido } from "@/lib/seguridad/limite";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { ETIQUETA_ESTADO, fechaLegible } from "@/lib/turnos";
import {
  erroresPorCampo,
  estadoTurnoSchema,
  turnoSchema,
} from "@/lib/validations/formularios";
import { valoresDe, type EstadoFormulario } from "./estado";

/**
 * Pedido de turno desde el sitio público.
 *
 * Mismas defensas y mismo orden que el formulario de contacto: honeypot,
 * límite de peticiones, Zod, inserción. Un turno es además un dato más
 * delicado que una consulta, así que nunca se loguea su contenido: ante un
 * fallo va al log el error de la base, no lo que escribió la persona.
 */
export async function pedirTurno(
  _estadoPrevio: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  // Se responde "ok" a propósito, para no enseñarle al bot que fue detectado.
  const trampa = datos.get("website");
  if (typeof trampa === "string" && trampa.length > 0) {
    return { ok: true, mensaje: "Recibimos tu pedido de turno." };
  }

  // Lo que la persona escribió se devuelve en cada respuesta fallida: sin
  // eso, cualquier error le vacía el formulario.
  const valores = valoresDe(datos, [
    "nombre", "telefono", "email", "area", "fecha_preferida", "franja", "motivo",
  ]);

  if (env.NEXT_PUBLIC_DEMO) {
    return {
      ok: false,
      mensaje:
        "Estás en modo demostración: el pedido no se guarda. Con Supabase conectado, acá llegaría al panel de turnos.",
      valores,
    };
  }

  if (!(await permitido(LIMITES.turno))) {
    return {
      ok: false,
      mensaje:
        "Recibimos varios pedidos tuyos hace poco. Esperá unos minutos o escribinos por WhatsApp.",
      valores,
    };
  }

  const resultado = turnoSchema.safeParse({
    nombre: datos.get("nombre"),
    telefono: datos.get("telefono"),
    email: datos.get("email") || null,
    area: datos.get("area"),
    fecha_preferida: datos.get("fecha_preferida"),
    franja: datos.get("franja"),
    motivo: datos.get("motivo") || null,
  });

  if (!resultado.success) {
    return {
      ok: false,
      errores: erroresPorCampo(resultado.error),
      mensaje: "Revisá los campos marcados.",
      valores,
    };
  }

  try {
    const d = resultado.data;
    // Cliente admin por la misma razón que en contacto: el estado inicial lo
    // fija el servidor. Solo se escriben los campos validados.
    const supabase = crearClienteAdmin();
    const { error } = await supabase.from("turnos").insert({
      nombre: d.nombre,
      telefono: d.telefono,
      email: d.email ?? null,
      area: d.area,
      fecha_preferida: d.fecha_preferida,
      franja: d.franja,
      motivo: d.motivo ?? null,
      estado: "pendiente",
    });
    if (error) throw error;

    return {
      ok: true,
      mensaje: `Recibimos tu pedido para el ${fechaLegible(d.fecha_preferida)}, por la ${
        d.franja === "manana" ? "mañana" : "tarde"
      }. Te vamos a contactar para confirmar el horario.`,
    };
  } catch (error) {
    console.error("[turnos] fallo al guardar el pedido", error);
    return {
      ok: false,
      mensaje: "No pudimos guardar tu pedido. Probá de nuevo o escribinos por WhatsApp.",
      valores,
    };
  }
}

/**
 * Cambio de estado de un turno, desde el panel.
 *
 * Solo administradores. El layout del panel ya exige sesión, pero el layout
 * no protege las acciones: cualquiera puede invocar una Server Action por su
 * cuenta, así que el rol se revalida acá. Y aunque esto fallara, la política
 * RLS turnos_update_admin rechaza la escritura: se usa el cliente del
 * usuario, no el admin, justamente para que RLS siga en juego.
 */
export async function cambiarEstadoTurno(
  _estadoPrevio: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const sesion = await exigirAdmin();

  if (env.NEXT_PUBLIC_DEMO) {
    return {
      ok: false,
      mensaje: "Estás en modo demostración: los cambios no se guardan.",
    };
  }

  const resultado = estadoTurnoSchema.safeParse({
    id: datos.get("id"),
    estado: datos.get("estado"),
  });
  if (!resultado.success) {
    return { ok: false, mensaje: "No se pudo cambiar el estado. Recargá la página y probá de nuevo." };
  }

  const { id, estado } = resultado.data;

  try {
    const supabase = await crearClienteServidor();

    const { data: previo, error: errorLectura } = await supabase
      .from("turnos")
      .select("estado")
      .eq("id", id)
      .maybeSingle();
    if (errorLectura) throw errorLectura;
    if (!previo) return { ok: false, mensaje: "Ese turno ya no existe." };

    const { error } = await supabase.from("turnos").update({ estado }).eq("id", id);
    if (error) throw error;

    // En la auditoría va el cambio de estado y nada más: ni el nombre ni el
    // motivo. El registro dice quién tocó qué turno, no quién es el cliente.
    await auditar(sesion, "turno.estado", "turnos", id, {
      antes: { estado: previo.estado },
      despues: { estado },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/turnos");

    return { ok: true, mensaje: `Turno marcado como ${ETIQUETA_ESTADO[estado].toLowerCase()}.` };
  } catch (error) {
    console.error("[turnos] fallo al cambiar el estado", error);
    return { ok: false, mensaje: "No se pudo cambiar el estado. Intentá de nuevo." };
  }
}
