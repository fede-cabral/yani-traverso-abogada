import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env, serverEnv } from "@/lib/env";

/**
 * ⚠️ CLIENTE ADMINISTRATIVO — SALTEA TODAS LAS POLÍTICAS RLS ⚠️
 *
 * Esta es la llave maestra de la base de datos. No respeta ninguna regla de
 * acceso: lee, escribe y borra cualquier fila de cualquier tabla.
 *
 * REGLAS DE USO, SIN EXCEPCIÓN:
 *
 *  1. Solo en archivos de servidor. El import de "server-only" hace que el
 *     build falle si alguien lo arrastra al cliente — no lo saques.
 *  2. Nunca en un archivo compartido entre cliente y servidor.
 *  3. Antes de usarlo, preguntarse por qué no alcanza crearClienteServidor().
 *     Si la respuesta no es clara e inmediata, usá ese otro.
 *  4. Todo uso legítimo va acompañado de una verificación de permisos hecha
 *     a mano, justo antes, porque RLS acá no te protege.
 *
 * Casos legítimos: tareas programadas, webhooks firmados, migraciones de
 * datos. No para "es más cómodo que escribir la política".
 */
export function crearClienteAdmin() {
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
