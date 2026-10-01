import { env } from "@/lib/env";
import { formatearTelefono } from "@/lib/telefono";

/**
 * Enlaces de WhatsApp con el mensaje precargado.
 *
 * El texto nunca se arma con datos que mande el visitante ni con parámetros
 * de la URL: un enlace de WhatsApp con texto controlado por un tercero es una
 * vía cómoda para hacerse pasar por el estudio.
 */

export function enlaceWhatsApp(texto: string): string {
  const numero = env.NEXT_PUBLIC_WHATSAPP;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function enlaceGeneral(): string {
  return enlaceWhatsApp("Hola, quería hacer una consulta.");
}

/** El WhatsApp del estudio, para mostrarlo en pantalla. */
export function telefonoLegible(): string {
  return formatearTelefono(env.NEXT_PUBLIC_WHATSAPP);
}
