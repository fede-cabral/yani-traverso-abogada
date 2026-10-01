import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente para las consultas del catálogo público.
 *
 * Usa la clave anónima y NO lee cookies, a propósito. Dos razones:
 *
 *  1. Rendimiento. Un cliente que lee cookies obliga a renderizar cada página
 *     en cada request. Sin cookies, el catálogo se puede generar una vez y
 *     revalidar cada tantos minutos: más rápido para el visitante y mucho más
 *     barato de servir.
 *  2. Higiene. El catálogo público no necesita saber quién mira. No leer la
 *     sesión evita que datos de un usuario se filtren a una página cacheada,
 *     que es una de las formas más fáciles de arruinar un sitio con caché.
 *
 * Las políticas RLS se aplican igual: este cliente ve exactamente lo que ve
 * un visitante anónimo, o sea solo productos con publicado = true.
 */
export function crearClientePublico() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
