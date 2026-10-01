import { z } from "zod";
import { NEGOCIO } from "./negocio";

/**
 * Validación de variables de entorno al arranque.
 *
 * Si falta una variable o tiene un formato inválido, la aplicación NO levanta.
 * Es intencional: un fallo temprano y ruidoso en el arranque es infinitamente
 * preferible a un error silencioso en producción a las tres de la mañana.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    error: "NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida (https://xxx.supabase.co)",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(20, { error: "NEXT_PUBLIC_SUPABASE_ANON_KEY parece vacía o truncada" }),
  NEXT_PUBLIC_SITE_URL: z.url({
    error: "NEXT_PUBLIC_SITE_URL debe ser una URL válida, sin barra final",
  }),
  NEXT_PUBLIC_WHATSAPP: z
    .string()
    .regex(/^\d{10,15}$/, {
      error: "NEXT_PUBLIC_WHATSAPP debe ser solo dígitos en formato internacional, ej. 5491123456789",
    }),

  /**
   * Modo demostración: el sitio funciona con datos y fotos de ejemplo, sin
   * base de datos. Sirve para mostrárselo al cliente antes de tener Supabase.
   *
   * Es pública a propósito: la interfaz muestra un cartel bien visible cuando
   * está activa. Un modo demostración que no se nota es una trampa esperando
   * a que alguien crea que los datos son reales.
   */
  NEXT_PUBLIC_DEMO: z
    .enum(["0", "1"])
    .default("0")
    .transform((v) => v === "1"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(20, { error: "SUPABASE_SERVICE_ROLE_KEY parece vacía o truncada" }),
});

function parseOrThrow<T extends z.ZodType>(schema: T, source: unknown, scope: string): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const detalle = result.error.issues
      .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `\n\n❌ Variables de entorno inválidas (${scope}):\n${detalle}\n\n` +
        `Copiá .env.example a .env.local y completá los valores.\n`,
    );
  }
  return result.data;
}

/**
 * Variables públicas. Se pueden leer desde el cliente y desde el servidor.
 *
 * ⚠️ Todo lo que está acá viaja al navegador dentro del bundle. Es público de
 * verdad: cualquiera lo ve abriendo el inspector. No es un escondite.
 *
 * Next.js reemplaza `process.env.NEXT_PUBLIC_*` en tiempo de build únicamente
 * cuando se escribe la referencia completa y literal, por eso no se puede
 * iterar sobre `process.env` acá.
 */
const esDemo = process.env.NEXT_PUBLIC_DEMO === "1";

/**
 * En modo demostración las variables tienen valores de relleno.
 *
 * Es la única excepción a la regla de "sin variable, la app no arranca", y
 * está acotada a propósito: el modo demostración existe justo para poder
 * levantar el sitio sin haber configurado nada. En modo normal la validación
 * sigue siendo estricta, porque ahí un valor por defecto escondería un error
 * de configuración hasta que sea tarde.
 */
const RELLENO_DEMO = {
  NEXT_PUBLIC_SUPABASE_URL: "https://demostracion.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "modo-demostracion-sin-base-de-datos",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_WHATSAPP: NEGOCIO.whatsapp,
} as const;

export const env = parseOrThrow(
  publicSchema,
  {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? (esDemo ? RELLENO_DEMO.NEXT_PUBLIC_SUPABASE_URL : undefined),
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (esDemo ? RELLENO_DEMO.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined),
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? (esDemo ? RELLENO_DEMO.NEXT_PUBLIC_SITE_URL : undefined),
    NEXT_PUBLIC_WHATSAPP:
      process.env.NEXT_PUBLIC_WHATSAPP ?? (esDemo ? RELLENO_DEMO.NEXT_PUBLIC_WHATSAPP : undefined),
    NEXT_PUBLIC_DEMO: process.env.NEXT_PUBLIC_DEMO ?? "0",
  },
  "públicas",
);

/**
 * Variables privadas. SOLO servidor.
 *
 * Esta función lanza si se la llama desde el navegador. No es paranoia
 * decorativa: `SUPABASE_SERVICE_ROLE_KEY` saltea todas las políticas RLS, así
 * que si alguna vez se filtra al cliente, la base entera queda expuesta.
 */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() no puede usarse en el navegador.");
  }
  return parseOrThrow(
    serverSchema,
    { SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY },
    "privadas",
  );
}
