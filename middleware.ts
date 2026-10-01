import { NextResponse, type NextRequest } from "next/server";

/**
 * Cabeceras de seguridad y CSP con nonce por request.
 *
 * Este middleware es la primera capa de defensa, no la única. La autorización
 * real se revalida en cada Server Action y en cada Route Handler: si alguien
 * llega a un endpoint sin pasar por acá, igual tiene que rebotar.
 */

const RUTAS_PROTEGIDAS = ["/admin", "/mi-cuenta"];

function generarNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function middleware(request: NextRequest) {
  const nonce = generarNonce();
  const esProduccion = process.env.NODE_ENV === "production";
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  /**
   * CSP estricta.
   *
   * Sin 'unsafe-inline' y sin 'unsafe-eval': una CSP con esos valores es
   * decorativa, no protege de nada. Todo script inline lleva el nonce.
   *
   * 'strict-dynamic' permite que un script con nonce cargue sus propios
   * chunks — que es exactamente lo que necesita Next.js — sin tener que
   * abrir el dominio entero.
   *
   * En desarrollo hace falta 'unsafe-eval' porque el refresco rápido de
   * Next.js lo usa. En producción no se incluye nunca.
   */
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${esProduccion ? "" : "'unsafe-eval'"}`,
    // Tailwind inyecta estilos en desarrollo; en producción el CSS es un archivo.
    `style-src 'self' 'nonce-${nonce}' ${esProduccion ? "" : "'unsafe-inline'"}`,
    `style-src-attr 'none'`,
    `img-src 'self' blob: data: ${supabaseHost}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' ${supabaseHost} ${supabaseHost.replace("https://", "wss://")}`,
    // Nadie puede meter este sitio en un iframe (clickjacking).
    `frame-ancestors 'none'`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    // Los formularios solo pueden enviarse a este mismo origen.
    `form-action 'self'`,
    `manifest-src 'self'`,
    esProduccion ? `upgrade-insecure-requests` : "",
  ]
    .filter(Boolean)
    .join("; ")
    .replace(/\s{2,}/g, " ");

  // El nonce viaja al renderizador por cabecera de request.
  const headersEntrada = new Headers(request.headers);
  headersEntrada.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: headersEntrada } });

  response.headers.set("Content-Security-Policy", csp);

  // HSTS solo en producción: en localhost forzaría HTTPS y rompería el dev.
  if (esProduccion) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // Impide que el navegador adivine el tipo de contenido. Sin esto, un .txt
  // subido por un usuario puede terminar ejecutándose como HTML.
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Redundante con frame-ancestors, a propósito: defensa en profundidad.
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), interest-cohort=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  const ruta = request.nextUrl.pathname;
  const esProtegida = RUTAS_PROTEGIDAS.some(
    (p) => ruta === p || ruta.startsWith(`${p}/`),
  );

  if (esProtegida) {
    // Nada de páginas privadas guardadas en cachés intermedias.
    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

    /**
     * Verificación de Origin como defensa contra CSRF.
     *
     * Toda petición que cambie estado tiene que venir del mismo origen.
     * Next.js ya valida el Origin en las Server Actions, pero esto cubre
     * también los Route Handlers escritos a mano.
     */
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (!origin || new URL(origin).host !== host) {
        return new NextResponse("Origen no permitido", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /**
     * Todas las rutas salvo los archivos estáticos y las imágenes optimizadas.
     * El negativo incluye explícitamente las peticiones de prefetch de Next.js
     * para que no reciban una CSP con un nonce que ya caducó.
     */
    {
      source: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
