import "server-only";

import { env } from "@/lib/env";
import * as supabase from "./admin-supabase";
import * as demo from "./admin-demo";

/**
 * La fuente de datos del panel se elige una vez, acá: Supabase o los datos de
 * ejemplo, según NEXT_PUBLIC_DEMO. El resto del código importa de este archivo
 * y no se entera. Toda función nueva va en los dos.
 */

const fuente = env.NEXT_PUBLIC_DEMO ? demo : supabase;

export type { ResumenPanel, ConsultaAdmin, TurnoAdmin } from "./admin-supabase";

export const resumenPanel = fuente.resumenPanel;
export const listarConsultas = fuente.listarConsultas;
export const listarTurnos = fuente.listarTurnos;
