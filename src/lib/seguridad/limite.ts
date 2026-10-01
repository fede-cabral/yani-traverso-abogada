import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { crearClienteAdmin } from "@/lib/supabase/admin";

/**
 * Límite de peticiones.
 *
 * Usa el cliente admin porque la tabla de contadores no tiene políticas RLS
 * a propósito: nadie debe poder leerla ni vaciarla desde el cliente. Es uno
 * de los usos legítimos del cliente admin, y está acotado a llamar una única
 * función que solo incrementa un contador.
 */

/**
 * La IP se guarda hasheada, no en claro.
 *
 * Una IP es un dato personal. Para contar peticiones alcanza con distinguir
 * un visitante de otro, no con saber quién es. El hash con sal hace que la
 * tabla no sirva para rastrear a nadie ni siquiera si se filtra.
 */
function hashear(valor: string): string {
  const sal = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${sal}:${valor}`).digest("hex").slice(0, 32);
}

export async function ipDelVisitante(): Promise<string> {
  const h = await headers();
  // En Vercel la IP real viene en x-forwarded-for. El primer valor es el
  // cliente; el resto son los proxies intermedios. Nunca confiar en una
  // cabecera que el cliente puede fabricar sin un proxy de confianza delante.
  const reenviada = h.get("x-forwarded-for");
  const ip = reenviada?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
  return hashear(ip);
}

export interface Limite {
  /** Identificador de la acción, ej. "consulta". */
  accion: string;
  maximo: number;
  ventanaSegundos: number;
}

/**
 * Devuelve true si la petición está permitida.
 *
 * Falla CERRADO: si la base no responde, se deniega. Un límite que se abre
 * solo cuando hay problemas es exactamente lo que busca quien abusa, porque
 * saturar el servicio le desactiva la defensa.
 */
export async function permitido(limite: Limite): Promise<boolean> {
  try {
    const ip = await ipDelVisitante();
    const supabase = crearClienteAdmin();
    const { data, error } = await supabase.rpc("registrar_intento", {
      p_clave: `${limite.accion}:${ip}`,
      p_maximo: limite.maximo,
      p_ventana_segs: limite.ventanaSegundos,
    });
    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error("[limite] fallo al verificar, se deniega por precaución", error);
    return false;
  }
}

/** Límites por acción. Ajustar con datos reales, no por intuición. */
export const LIMITES = {
  consulta: { accion: "consulta", maximo: 5, ventanaSegundos: 600 },
  // Turnos: más estricto que las consultas. Nadie pide tres turnos en una
  // hora, y cada pedido falso le cuesta a la Dra. una llamada.
  turno: { accion: "turno", maximo: 3, ventanaSegundos: 3600 },
  // Login: estricto. Es la puerta de entrada al panel y lo primero que
  // prueba cualquiera que quiera entrar por fuerza bruta.
  login: { accion: "login", maximo: 5, ventanaSegundos: 900 },
} as const satisfies Record<string, Limite>;
