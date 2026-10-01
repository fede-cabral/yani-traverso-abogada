"use client";
import { NEGOCIO } from "@/lib/negocio";

/**
 * Último recurso: el layout raíz falló.
 *
 * Reemplaza al documento entero, así que tiene que traer sus propias
 * etiquetas html y body. Y no recibe los estilos globales de la app, por eso
 * los colores van en línea acá — es la única excepción a la regla de no
 * escribir valores sueltos fuera del sistema de diseño.
 *
 * El teléfono no se muestra: sale de una variable de entorno, y si lo que
 * falló es justamente la configuración, leerla acá rompería también esta
 * pantalla. El mail está en negocio.ts y no depende de nada.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es-AR">
      <head>
        <meta name="color-scheme" content="dark" />
        <title>{`Error — ${NEGOCIO.nombre}`}</title>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
          background: "#0b0a08",
          color: "#f1ece0",
        }}
      >
        <main style={{ maxWidth: "36rem" }}>
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>El sitio no está disponible</h1>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>
            Hay un problema técnico. Probá recargar en unos minutos, o escribí a{" "}
            <strong>{NEGOCIO.email}</strong>.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "1.5rem",
              minHeight: "2.75rem",
              padding: "0 1.25rem",
              border: "none",
              borderRadius: "0.125rem",
              background: NEGOCIO.colores.marca,
              color: "#0b0a08",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          {error.digest && (
            <p style={{ marginTop: "2rem", fontSize: "0.75rem", opacity: 0.7 }}>
              Código: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
