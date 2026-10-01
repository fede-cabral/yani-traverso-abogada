import "server-only";

import { headers } from "next/headers";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import type { Sesion } from "./sesion";

/**
 * Registro de auditoría de las acciones del panel.
 *
 * Los cambios en productos ya los audita un trigger de Postgres. Esto cubre
 * lo que el trigger no ve: inicios de sesión, cambios de rol, accesos a datos
 * personales. Sin esto, un incidente es imposible de investigar.
 *
 * Nunca se guardan contraseñas, tokens ni datos de tarjeta.
 */
export async function auditar(
  sesion: Sesion | null,
  accion: string,
  entidad: string,
  entidadId?: string,
  datos?: { antes?: unknown; despues?: unknown },
): Promise<void> {
  try {
    const h = await headers();
    const supabase = crearClienteAdmin();

    await supabase.from("log_auditoria").insert({
      actor_id: sesion?.userId ?? null,
      actor_email: sesion?.email ?? null,
      accion,
      entidad,
      entidad_id: entidadId ?? null,
      datos_antes: datos?.antes ?? null,
      datos_despues: datos?.despues ?? null,
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: h.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (error) {
    // Un fallo al auditar no debe tumbar la operación, pero sí tiene que
    // gritar en los logs: una auditoría que falla en silencio es peor que
    // no tener auditoría, porque da una falsa sensación de cobertura.
    console.error("[auditoria] NO SE PUDO REGISTRAR", { accion, entidad, error });
  }
}
