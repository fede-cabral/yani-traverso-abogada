import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

/**
 * Entorno de pruebas de autorización.
 *
 * ⚠️ ESTAS PRUEBAS CORREN CONTRA UNA BASE REAL Y ESCRIBEN EN ELLA.
 * Usá un proyecto de Supabase de desarrollo, NUNCA producción. El archivo
 * .env.test tiene que apuntar a ese proyecto.
 *
 * Si no hay configuración, las pruebas se saltan con un aviso en vez de
 * fallar: un test que falla porque falta configuración entrena al equipo a
 * ignorar el rojo, y a partir de ahí el rojo deja de significar nada.
 */

config({ path: ".env.test", quiet: true });

export const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const CLAVE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const CLAVE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hayConfig = Boolean(URL_SUPABASE && CLAVE_ANON && CLAVE_SERVICE);

if (!hayConfig) {
  console.warn(
    "\n⚠️  Sin configuración de pruebas: se saltan los tests de autorización.\n" +
      "   Creá un .env.test apuntando a un proyecto de Supabase de DESARROLLO\n" +
      "   con NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY y\n" +
      "   SUPABASE_SERVICE_ROLE_KEY.\n",
  );
}

/** Protección: nunca correr esto contra producción por accidente. */
export function verificarNoEsProduccion(): void {
  const prohibido = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (prohibido && !prohibido.includes("localhost") && !prohibido.includes("staging")) {
    throw new Error(
      `Las pruebas escriben en la base. NEXT_PUBLIC_SITE_URL apunta a "${prohibido}", ` +
        "que no parece un entorno de desarrollo. Abortando.",
    );
  }
}

export function clienteAnonimo(): SupabaseClient {
  return createClient(URL_SUPABASE, CLAVE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function clienteServicio(): SupabaseClient {
  return createClient(URL_SUPABASE, CLAVE_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface UsuarioPrueba {
  id: string;
  email: string;
  cliente: SupabaseClient;
}

const CLAVE_PRUEBA = "prueba-autorizacion-2026-XyZ!";

/**
 * Crea (o reutiliza) un usuario con el rol indicado y devuelve un cliente
 * autenticado como él. El rol se asigna con la clave de servicio, que es la
 * única forma legítima de hacerlo — precisamente porque un usuario no puede
 * asignarse su propio rol, que es una de las cosas que estas pruebas verifican.
 */
export async function crearUsuario(
  rol: "cliente" | "editor" | "admin",
  /**
   * Distingue a dos usuarios del mismo rol. Sin esto, pedir dos "cliente"
   * devuelve dos veces a la misma persona, y un test de "un cliente no ve
   * lo de otro" termina comparando a alguien consigo mismo.
   */
  etiqueta: string = rol,
): Promise<UsuarioPrueba> {
  const servicio = clienteServicio();
  const email = `prueba-${etiqueta}@ejemplo-test.local`;

  const { data: creado, error } = await servicio.auth.admin.createUser({
    email,
    password: CLAVE_PRUEBA,
    email_confirm: true,
  });

  let id = creado?.user?.id;

  if (error) {
    // Ya existía de una corrida anterior: lo buscamos.
    const { data: lista } = await servicio.auth.admin.listUsers({ perPage: 1000 });
    id = lista?.users.find((u) => u.email === email)?.id;
    if (!id) throw new Error(`No se pudo crear ni encontrar el usuario ${email}: ${error.message}`);
  }

  await servicio.from("perfiles").upsert({ id, rol }, { onConflict: "id" });

  const cliente = createClient(URL_SUPABASE, CLAVE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: errorLogin } = await cliente.auth.signInWithPassword({
    email,
    password: CLAVE_PRUEBA,
  });
  if (errorLogin) throw new Error(`No se pudo iniciar sesión como ${rol}: ${errorLogin.message}`);

  return { id: id!, email, cliente };
}

export async function borrarUsuarios(...ids: string[]): Promise<void> {
  const servicio = clienteServicio();
  for (const id of ids) {
    await servicio.auth.admin.deleteUser(id).catch(() => undefined);
  }
}
