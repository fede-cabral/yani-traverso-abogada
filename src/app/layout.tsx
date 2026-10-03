import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Manrope } from "next/font/google";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import "./globals.css";
import { NEGOCIO, TITULO_SITIO } from "@/lib/negocio";

/**
 * Layout raíz: solo el documento.
 *
 * El encabezado y el pie del sitio público viven en (sitio)/layout.tsx, no
 * acá. Si estuvieran en la raíz, el panel de administración los heredaría y
 * mostraría el botón de turnos y el pie de un sitio público, que no tienen
 * nada que hacer ahí.
 *
 * Los paréntesis de (sitio) y (panel) son grupos de rutas: organizan el
 * código y permiten layouts distintos, pero NO aparecen en la URL.
 */

/*
  Las fuentes las descarga Next al compilar y las sirve desde este mismo
  dominio: el navegador de quien visita nunca le pide nada a Google. Eso
  importa dos veces en el sitio de una abogada — no se le avisa a un tercero
  quién entró, y la CSP puede seguir sin abrir dominios externos.

  Se exponen como variables CSS y globals.css las toma en --font-serif y
  --font-sans. `display: swap` muestra el texto con la fuente de respaldo
  mientras llega la definitiva, en vez de dejarlo invisible.
*/
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fuente-serif",
  display: "swap",
});

/*
  Cinzel, solo para el título de la portada. Es una romana de inscripción, de
  la familia de las mayúsculas "YANINA TRAVERSO" del logo: sus minúsculas son
  versalitas, así que el título se lee con la solemnidad de una placa grabada
  sin gritar en mayúsculas. Fuera del título no se usa — en un párrafo cansa.
*/
const display = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--fuente-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--fuente-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: TITULO_SITIO,
    template: `%s · ${NEGOCIO.nombre}`,
  },
  description: NEGOCIO.descripcion,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "es_AR", siteName: NEGOCIO.nombre },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Nunca fijar maximumScale ni userScalable: false — impide el zoom a quien
  // lo necesita para leer, y es una falla de accesibilidad directa.
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Leer los headers obliga a renderizar en cada request. Hace falta: la CSP
  // lleva un nonce nuevo por pedido (middleware.ts) y Next solo se lo pone a
  // sus propios scripts si la página no está prerenderizada.
  await headers();

  return (
    // data-scroll-behavior: globals.css usa scroll suave, y Next necesita este
    // aviso para apagarlo durante el cambio de página (si no, cada navegación
    // "viaja" desde el scroll anterior hasta arriba).
    <html
      lang="es-AR"
      className={`${serif.variable} ${sans.variable} ${display.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        {/*
          El sitio tiene un solo tema, oscuro. Declararlo acá hace que el
          fondo inicial ya sea oscuro y no parpadee en blanco al cargar.
        */}
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
