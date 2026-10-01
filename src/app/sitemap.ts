import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const BASE = env.NEXT_PUBLIC_SITE_URL;

/**
 * Mapa del sitio. Son siete páginas fijas: si se agrega una, se agrega acá.
 * El panel y el login no figuran, y robots.ts además los excluye.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/areas`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/turnos`, changeFrequency: "yearly", priority: 0.9 },
    { url: `${BASE}/sobre-mi`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/contacto`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${BASE}/aviso-legal`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
