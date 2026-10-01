import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 *
 * Actúa EN NOMBRE DEL USUARIO que hizo la petición: usa la clave anónima y la
 * sesión que viene en las cookies, así que todas las políticas RLS se aplican.
 * Este es el cliente que hay que usar el 99% del tiempo.
 */
export async function crearClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              });
            }
          } catch {
            // Un Server Component no puede escribir cookies. El refresco de
            // sesión lo hace el middleware, así que ignorar acá es correcto.
          }
        },
      },
    },
  );
}
