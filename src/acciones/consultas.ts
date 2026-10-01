"use server";

import { revalidatePath } from "next/cache";
import { auditar } from "@/lib/auth/auditoria";
import { exigirAdmin } from "@/lib/auth/sesion";
import { ETIQUETA_ESTADO_CONSULTA } from "@/lib/consultas";
import { env } from "@/lib/env";
import { crearClienteServidor } from "@/lib/supabase/server";
import { estadoConsultaSchema } from "@/lib/validations/formularios";
import type { EstadoFormulario } from "./estado";

/**
 * Cambio de estado de una consulta, desde el panel.
 *
 * Mismo criterio que el de turnos: el rol se revalida acá porque el layout no
 * protege las acciones, y se escribe con el cliente del usuario para que la
 * política RLS consultas_update_admin siga en juego aunque esto fallara.
 */
export async function cambiarEstadoConsulta(
  _estadoPrevio: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const sesion = await exigirAdmin();

  if (env.NEXT_PUBLIC_DEMO) {
    return {
      ok: false,
      mensaje: "Estás en modo demostración: los cambios no se guardan.",
    };
  }

  const resultado = estadoConsultaSchema.safeParse({
    id: datos.get("id"),
    estado: datos.get("estado"),
  });
  if (!resultado.success) {
    return { ok: false, mensaje: "No se pudo cambiar el estado. Recargá la página y probá de nuevo." };
  }

  const { id, estado } = resultado.data;

  try {
    const supabase = await crearClienteServidor();

    const { data: previo, error: errorLectura } = await supabase
      .from("consultas")
      .select("estado")
      .eq("id", id)
      .maybeSingle();
    if (errorLectura) throw errorLectura;
    if (!previo) return { ok: false, mensaje: "Esa consulta ya no existe." };

    const { error } = await supabase.from("consultas").update({ estado }).eq("id", id);
    if (error) throw error;

    // En la auditoría va el cambio de estado y nada más: ni el nombre ni el
    // mensaje. El registro dice quién tocó qué consulta, no quién escribió.
    await auditar(sesion, "consulta.estado", "consultas", id, {
      antes: { estado: previo.estado },
      despues: { estado },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/consultas");

    return {
      ok: true,
      mensaje: `Consulta marcada como ${ETIQUETA_ESTADO_CONSULTA[estado].toLowerCase()}.`,
    };
  } catch (error) {
    console.error("[consultas] fallo al cambiar el estado", error);
    return { ok: false, mensaje: "No se pudo cambiar el estado. Intentá de nuevo." };
  }
}
