"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary del sitio público.
 *
 * Dos cosas importan acá:
 *
 * 1. NO mostrar `error.message`. Next.js ya lo reemplaza por un genérico en
 *    producción para no filtrar detalles del servidor, pero mostrarlo igual
 *    sería confiar en ese comportamiento. Se muestra el `digest`, que es un
 *    identificador inútil para un atacante y valiosísimo para encontrar el
 *    error en los logs del servidor.
 *
 * 2. Dar una salida. Una pantalla de error sin nada para hacer es una
 *    consulta perdida; acá tiene el reintento y el contacto a un toque.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[error-sitio]", error.digest ?? error);
  }, [error]);

  return (
    <main id="contenido" className="contenedor seccion">
      <h1 className="text-3xl">Algo salió mal</h1>
      <p className="mt-4 max-w-prose text-texto-suave">
        No se pudo cargar esta página. Probá de nuevo; si sigue fallando,
        escribí por WhatsApp o por mail desde la página de contacto.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="boton boton-principal" onClick={() => retry()}>
          Reintentar
        </button>
        <Link className="boton boton-secundario" href="/contacto">
          Ir a contacto
        </Link>
      </div>

      {error.digest && (
        <p className="mt-10 text-xs text-texto-suave">
          Si escribís por este error, pasá este código: <code>{error.digest}</code>
        </p>
      )}
    </main>
  );
}
