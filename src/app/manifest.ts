import type { MetadataRoute } from "next";
import { NEGOCIO, TITULO_SITIO } from "@/lib/negocio";

/**
 * Manifiesto de aplicación web.
 *
 * Permite que alguien agregue el sitio a la pantalla de inicio del celular.
 * Para un cliente que vuelve a pedir turno, es un atajo real.
 *
 * `display: "standalone"` sin service worker significa que abre sin la barra
 * del navegador pero sigue necesitando conexión. No se promete funcionar sin
 * internet, porque no funciona.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TITULO_SITIO,
    short_name: NEGOCIO.nombre,
    description: NEGOCIO.descripcion,
    start_url: "/",
    display: "standalone",
    background_color: NEGOCIO.colores.fondo,
    theme_color: NEGOCIO.colores.fondo,
    lang: "es-AR",
    categories: ["business"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
