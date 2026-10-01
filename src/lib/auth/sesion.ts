import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { crearClienteServidor } from "@/lib/supabase/server";

export type Rol = "cliente" | "editor" | "admin";

export interface Sesion {
  userId: string;
  email: string | null;
  rol: Rol;
}

/**
 * Sesión del usuario actual.
 *
 * Reglas que hacen que esto sea seguro y no decorativo:
 *
 *  1. Se usa `getUser()`, NO `getSession()`. `getSession()` lee la cookie sin
 *     verificarla contra el servidor de auth, así que un token manipulado
 *     pasaría. `getUser()` valida el token del lado servidor en cada llamada.
 *
 *  2. El rol se lee de la tabla `perfiles`, nunca del token ni de nada que
 *     mande el navegador. Un rol que viaja en el cliente es un rol que el
 *     cliente puede cambiar.
 *
 *  3. `cache()` de React deduplica la consulta dentro de un mismo request,
 *     así que llamarla en diez lugares cuesta una sola verificación. No
 *     persiste entre requests: cada petición se vuelve a verificar.
 */
/**
 * Sesión de demostración.
 *
 * Solo existe cuando NEXT_PUBLIC_DEMO=1, que es un modo que hay que activar a
 * mano y que muestra un cartel en pantalla. En modo normal esta rama no se
 * ejecuta nunca, y el build de producción sin la variable la elimina.
 */
const SESION_DEMO: Sesion = {
  userId: "demostracion",
  email: "demostracion@ejemplo.com",
  rol: "admin",
};

export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  if (env.NEXT_PUBLIC_DEMO) return SESION_DEMO;

  const supabase = await crearClienteServidor();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    // Si no hay perfil, el rol mínimo. Nunca asumir privilegios ante la duda.
    rol: (perfil?.rol as Rol) ?? "cliente",
  };
});

/**
 * Exige una sesión con alguno de los roles indicados.
 *
 * Esto se llama en CADA página y en CADA Server Action del panel, no solo en
 * el middleware. El middleware es la primera capa; si alguien llega a una
 * acción por otro camino, esto la frena igual. Una sola capa nunca alcanza.
 */
export async function exigirRol(...roles: Rol[]): Promise<Sesion> {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/ingresar");
  }

  if (!roles.includes(sesion.rol)) {
    // 404 en lugar de 403: no le confirmamos a nadie que /admin existe.
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return sesion;
}

export async function exigirStaff(): Promise<Sesion> {
  return exigirRol("editor", "admin");
}

export async function exigirAdmin(): Promise<Sesion> {
  return exigirRol("admin");
}
