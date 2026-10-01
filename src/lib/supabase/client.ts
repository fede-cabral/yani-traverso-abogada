"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Cliente de Supabase para el navegador.
 *
 * Usa la clave anónima, que es pública por diseño. Lo único que impide que
 * cualquiera lea la base entera con esta clave son las políticas RLS.
 * Si alguna tabla queda sin RLS, esta clave la expone a todo internet.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
