import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Una demostración publicada tiene datos de ejemplo y el panel abierto: que
  // Google la indexe sería mostrar como real algo que no lo es.
  if (env.NEXT_PUBLIC_DEMO) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nada de esto aporta a la búsqueda y parte filtra datos privados.
      disallow: ["/admin", "/mi-cuenta", "/api/"],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
