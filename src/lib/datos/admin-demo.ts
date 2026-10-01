import "server-only";

import { rangoDeTurnos, sumarDias, esDiaHabil } from "@/lib/turnos";
import type { ConsultaAdmin, ResumenPanel, TurnoAdmin } from "./admin-supabase";

/**
 * Panel en modo demostración.
 *
 * Personas y mensajes inventados, para que se vea cómo queda el panel con
 * datos sin tener base. Los nombres son de fantasía a propósito: acá nunca
 * va un caso real, ni siquiera cambiado.
 */

/** El primer día hábil a partir de una fecha, para que la demo no muestre un sábado. */
function proximoHabil(fecha: string): string {
  let f = fecha;
  while (!esDiaHabil(f)) f = sumarDias(f, 1);
  return f;
}

function turnosDemo(): TurnoAdmin[] {
  const { minimo } = rangoDeTurnos();
  const ahora = new Date().toISOString();

  return [
    {
      id: "d0000000-0000-4000-8000-0000000000a1",
      nombre: "Persona de ejemplo Uno",
      telefono: "11 5555-0101",
      email: "uno@ejemplo.com",
      area: "sucesiones",
      fecha_preferida: proximoHabil(minimo),
      franja: "manana",
      motivo: "Consulta de ejemplo sobre una sucesión.",
      estado: "pendiente",
      creado_en: ahora,
    },
    {
      id: "d0000000-0000-4000-8000-0000000000a2",
      nombre: "Persona de ejemplo Dos",
      telefono: "11 5555-0102",
      email: null,
      area: "inmobiliario",
      fecha_preferida: proximoHabil(sumarDias(minimo, 2)),
      franja: "tarde",
      motivo: null,
      estado: "pendiente",
      creado_en: ahora,
    },
    {
      id: "d0000000-0000-4000-8000-0000000000a3",
      nombre: "Persona de ejemplo Tres",
      telefono: "11 5555-0103",
      email: "tres@ejemplo.com",
      area: "otra",
      fecha_preferida: proximoHabil(sumarDias(minimo, 5)),
      franja: "manana",
      motivo: "No sé en qué área entra mi tema.",
      estado: "confirmado",
      creado_en: ahora,
    },
  ];
}

export async function listarTurnos(): Promise<TurnoAdmin[]> {
  return turnosDemo();
}

export async function listarConsultas(): Promise<ConsultaAdmin[]> {
  const ahora = new Date().toISOString();
  return [
    {
      id: "d0000000-0000-4000-8000-0000000000c1",
      nombre: "Persona de ejemplo Cuatro",
      email: "cuatro@ejemplo.com",
      telefono: "11 5555-0104",
      mensaje: "Mensaje de ejemplo: quería saber si atienden consultas por alquileres.",
      estado: "nueva",
      creado_en: ahora,
    },
    {
      id: "d0000000-0000-4000-8000-0000000000c2",
      nombre: "Persona de ejemplo Cinco",
      email: null,
      telefono: "11 5555-0105",
      mensaje: "Mensaje de ejemplo: ¿la primera consulta es presencial?",
      estado: "respondida",
      creado_en: ahora,
    },
  ];
}

export async function resumenPanel(): Promise<ResumenPanel> {
  const turnos = turnosDemo();
  return {
    consultas_nuevas: 1,
    turnos_pendientes: turnos.filter((t) => t.estado === "pendiente").length,
    turnos_confirmados: turnos.filter((t) => t.estado === "confirmado").length,
  };
}
