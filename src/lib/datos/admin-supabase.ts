import "server-only";

import type { EstadoConsulta } from "@/lib/consultas";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { EstadoTurno, Franja } from "@/lib/turnos";

/**
 * Consultas del panel.
 *
 * Usan el cliente del servidor EN NOMBRE DEL USUARIO, no el cliente admin.
 * Eso significa que las políticas RLS se aplican: solo un administrador ve
 * consultas y turnos. Si acá se usara el cliente admin, RLS dejaría de
 * proteger nada y toda la separación de roles quedaría en manos de que el
 * código no tenga bugs. No es una apuesta que convenga hacer.
 *
 * Nada de esto se cachea: el panel tiene que mostrar el estado real, y los
 * datos dependen de quién mira.
 */

export interface ResumenPanel {
  consultas_nuevas: number;
  turnos_pendientes: number;
  turnos_confirmados: number;
}

export async function resumenPanel(): Promise<ResumenPanel> {
  const supabase = await crearClienteServidor();

  try {
    const contarTurnos = (estado: EstadoTurno) =>
      supabase.from("turnos").select("id", { count: "exact", head: true }).eq("estado", estado);

    const [consultas, pendientes, confirmados] = await Promise.all([
      supabase.from("consultas").select("id", { count: "exact", head: true }).eq("estado", "nueva"),
      contarTurnos("pendiente"),
      contarTurnos("confirmado"),
    ]);

    return {
      // Quien no es administrador no puede leer estas tablas: el conteo viene
      // null y se muestra 0. Es el comportamiento correcto, no un error.
      consultas_nuevas: consultas.count ?? 0,
      turnos_pendientes: pendientes.count ?? 0,
      turnos_confirmados: confirmados.count ?? 0,
    };
  } catch (error) {
    console.error("[admin:resumen]", error);
    return { consultas_nuevas: 0, turnos_pendientes: 0, turnos_confirmados: 0 };
  }
}

export interface ConsultaAdmin {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  mensaje: string;
  estado: EstadoConsulta;
  creado_en: string;
}

/**
 * Consultas, con lo que espera respuesta arriba.
 *
 * Igual que en turnos, ordenar por `estado` usa el orden del enum en la base
 * (nueva, en_proceso, respondida, cerrada, descartada).
 */
export async function listarConsultas(): Promise<ConsultaAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("consultas")
    .select("id, nombre, email, telefono, mensaje, estado, creado_en")
    .order("estado")
    .order("creado_en", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[admin:listarConsultas]", error);
    return [];
  }
  return (data ?? []) as ConsultaAdmin[];
}

export interface TurnoAdmin {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  area: string;
  fecha_preferida: string;
  franja: Franja;
  motivo: string | null;
  estado: EstadoTurno;
  creado_en: string;
}

/**
 * Turnos, con lo pendiente arriba.
 *
 * Ordenar por `estado` usa el orden en que se declaró el enum en la base
 * (pendiente, confirmado, atendido, cancelado), que es justo el orden en que
 * la Dra. los necesita: primero lo que espera una respuesta suya.
 */
export async function listarTurnos(): Promise<TurnoAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("turnos")
    .select(
      "id, nombre, telefono, email, area, fecha_preferida, franja, motivo, estado, creado_en",
    )
    .order("estado")
    .order("fecha_preferida")
    .limit(200);

  if (error) {
    console.error("[admin:listarTurnos]", error);
    return [];
  }
  return (data ?? []) as TurnoAdmin[];
}
