"use server";

import { redirect } from "next/navigation";
import { auditar } from "@/lib/auth/auditoria";
import { obtenerSesion } from "@/lib/auth/sesion";
import { LIMITES, permitido } from "@/lib/seguridad/limite";
import { crearClienteServidor } from "@/lib/supabase/server";
import { z } from "zod";

export interface EstadoLogin {
  error?: string;
}

const loginSchema = z.object({
  email: z.email({ error: "Email inválido" }).max(200),
  password: z.string().min(1).max(200),
});

/**
 * Mensaje único para cualquier fallo de login.
 *
 * Nunca decir "ese usuario no existe" ni "la contraseña es incorrecta": eso
 * permite enumerar qué cuentas existen, que es el primer paso de cualquier
 * ataque dirigido. El mensaje es el mismo exista la cuenta o no.
 */
const ERROR_GENERICO = "Email o contraseña incorrectos.";

export async function ingresar(
  _previo: EstadoLogin,
  datos: FormData,
): Promise<EstadoLogin> {
  // El límite se aplica ANTES de validar y antes de tocar auth: frenar la
  // fuerza bruta no debe costar una consulta a la base por intento.
  if (!(await permitido(LIMITES.login))) {
    return {
      error: "Demasiados intentos. Esperá unos minutos antes de volver a probar.",
    };
  }

  const resultado = loginSchema.safeParse({
    email: datos.get("email"),
    password: datos.get("password"),
  });

  if (!resultado.success) {
    return { error: ERROR_GENERICO };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: resultado.data.email,
    password: resultado.data.password,
  });

  if (error) {
    // El detalle real va al log del servidor; afuera sale el mensaje genérico.
    console.warn("[login] intento fallido", { motivo: error.message });
    await auditar(null, "auth.login_fallido", "auth");
    return { error: ERROR_GENERICO };
  }

  const sesion = await obtenerSesion();
  await auditar(sesion, "auth.login", "auth", sesion?.userId);

  // Supabase rota el identificador de sesión al iniciar sesión, lo que
  // previene fijación de sesión.
  redirect(sesion?.rol === "cliente" ? "/" : "/admin");
}

export async function salir(): Promise<void> {
  const sesion = await obtenerSesion();
  const supabase = await crearClienteServidor();
  // signOut invalida la sesión del lado servidor, no solo borra la cookie.
  await supabase.auth.signOut();
  await auditar(sesion, "auth.logout", "auth", sesion?.userId);
  redirect("/ingresar");
}
