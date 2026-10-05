"use server";

import { env } from "@/lib/env";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { LIMITES, permitido } from "@/lib/seguridad/limite";
import { consultaSchema, erroresPorCampo } from "@/lib/validations/formularios";
import { valoresDe, type EstadoFormulario } from "./estado";

const RECIBIDA = "Recibimos tu consulta. Te respondemos a la brevedad.";

/**
 * Envío del formulario de contacto.
 *
 * Orden deliberado de las defensas, de la más barata a la más cara:
 *   1. Honeypot — descarta bots simples sin tocar la base.
 *   2. Límite de peticiones — frena el abuso antes de validar.
 *   3. Validación Zod — nada llega a la base sin pasar por el esquema.
 *   4. Inserción.
 *
 * Next.js verifica el Origin de las Server Actions, así que el CSRF está
 * cubierto sin token adicional.
 */
export async function enviarConsulta(
  _estadoPrevio: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  // 1. Honeypot: un campo oculto que una persona nunca completa.
  // Se responde "ok" a propósito, para no enseñarle al bot que fue detectado.
  const trampa = datos.get("website");
  if (typeof trampa === "string" && trampa.length > 0) {
    return { ok: true, mensaje: RECIBIDA };
  }

  // Lo que la persona escribió se devuelve en cada respuesta fallida: sin
  // eso, cualquier error le vacía el formulario.
  const valores = valoresDe(datos, ["nombre", "email", "telefono", "mensaje", "acepta_privacidad"]);

  // En demostración no hay base a la que escribir. Se dice con todas las
  // letras en vez de fingir que se guardó.
  if (env.NEXT_PUBLIC_DEMO) {
    return {
      ok: false,
      mensaje:
        "Estás en modo demostración: el mensaje no se envía. Con Supabase conectado, acá llegaría al panel.",
      valores,
    };
  }

  // 2. Límite por IP.
  if (!(await permitido(LIMITES.consulta))) {
    return {
      ok: false,
      mensaje:
        "Recibimos varias consultas tuyas hace poco. Esperá unos minutos o escribinos por WhatsApp.",
      valores,
    };
  }

  // 3. Validación en el servidor. Lo que valide el navegador es comodidad.
  const resultado = consultaSchema.safeParse({
    nombre: datos.get("nombre"),
    email: datos.get("email") || null,
    telefono: datos.get("telefono") || null,
    mensaje: datos.get("mensaje"),
    acepta_privacidad: datos.get("acepta_privacidad"),
  });

  if (!resultado.success) {
    return {
      ok: false,
      errores: erroresPorCampo(resultado.error),
      mensaje: "Revisá los campos marcados.",
      valores,
    };
  }

  // 4. Inserción.
  //
  // Se usa el cliente admin y no el anónimo por una razón concreta: la
  // política RLS permite insertar consultas, pero el cliente admin deja
  // fijar el estado inicial sin depender de lo que mande el navegador.
  // Solo se escriben los campos validados, nunca el FormData entero.
  try {
    const d = resultado.data;
    const supabase = crearClienteAdmin();
    const { error } = await supabase.from("consultas").insert({
      nombre: d.nombre,
      email: d.email ?? null,
      telefono: d.telefono ?? null,
      mensaje: d.mensaje,
      origen: "contacto",
      estado: "nueva",
    });
    if (error) throw error;

    return { ok: true, mensaje: RECIBIDA };
  } catch (error) {
    // El detalle va al log del servidor; el visitante recibe un mensaje
    // genérico. Un error de Postgres en pantalla filtra tablas y columnas.
    console.error("[contacto] fallo al guardar la consulta", error);
    return {
      ok: false,
      mensaje: "No pudimos guardar tu consulta. Probá de nuevo o escribinos por WhatsApp.",
      valores,
    };
  }
}
