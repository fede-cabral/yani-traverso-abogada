import type { Metadata } from "next";
import { env } from "@/lib/env";
import { NEGOCIO, TITULO_SITIO } from "@/lib/negocio";

/**
 * La demostración no se indexa: tiene datos de ejemplo y el panel abierto.
 * robots.ts ya le cierra la puerta a Google; esto es la segunda llave, para
 * que una página que llegue al índice por un enlace externo no se publique.
 */
export const ROBOTS_DEMO = { index: false, follow: false } as const;

/**
 * La tarjeta al compartir. Vive en la raíz de app/ y no dentro de (sitio)
 * para que su dirección sea fija: dentro de un grupo de rutas Next le agrega
 * un sufijo al azar, y la dirección que usaban los datos para Google daba 404.
 */
const IMAGEN_COMPARTIR = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: TITULO_SITIO,
};

/**
 * Metadatos de una página pública, armados siempre igual.
 *
 * Existe porque Next no mezcla `openGraph` entre el layout y la página: si
 * una página define el suyo, pisa entero el del layout. Sin esta función,
 * sumar `og:url` en una página obligaba a repetir a mano el nombre del
 * sitio y el idioma, y la primera que se olvidara quedaba distinta.
 *
 * La imagen para compartir va explícita por la misma razón: la que genera
 * `app/opengraph-image.tsx` se pierde en cuanto la página define su propio
 * `openGraph`.
 */
export function metadatosPagina({
  titulo,
  descripcion,
  ruta,
  tituloCompleto = false,
  indexar = true,
}: {
  titulo: string;
  /** true: el título va tal cual, sin " · Dra. Yanina Traverso" al final, para no pasar los ~60 caracteres. */
  tituloCompleto?: boolean;
  descripcion: string;
  /** La ruta con barra inicial: "/areas". */
  ruta: string;
  /** Los textos legales se indexan pero no pasan autoridad a sus enlaces. */
  indexar?: boolean | "sin-seguir";
}): Metadata {
  return {
    title: tituloCompleto ? { absolute: titulo } : titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: NEGOCIO.nombre,
      title: titulo,
      description: descripcion,
      url: ruta,
      images: [IMAGEN_COMPARTIR],
    },
    ...(env.NEXT_PUBLIC_DEMO
      ? { robots: ROBOTS_DEMO }
      : indexar === "sin-seguir" && { robots: { index: true, follow: false } }),
  };
}

/** El identificador del estudio en los datos estructurados, para enlazarlo desde otras páginas. */
export const ID_ESTUDIO = `${env.NEXT_PUBLIC_SITE_URL}/#estudio`;

/**
 * Migas de pan para Google: Inicio › Áreas › Sucesiones. Se muestran en el
 * resultado de búsqueda en lugar de la URL cruda.
 */
export function migas(tramos: readonly { nombre: string; ruta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ nombre: "Inicio", ruta: "" }, ...tramos].map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.nombre,
      item: `${env.NEXT_PUBLIC_SITE_URL}${t.ruta}`,
    })),
  };
}
