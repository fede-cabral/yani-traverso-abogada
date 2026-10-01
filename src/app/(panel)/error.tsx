"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Error boundary del panel. Mismo criterio: identificador sí, detalle no. */
export default function ErrorPanel({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[error-panel]", error.digest ?? error);
  }, [error]);

  return (
    <main id="contenido" className="contenedor py-20">
      <h1 className="text-2xl font-bold">No se pudo cargar</h1>
      <p className="mt-3 max-w-prose text-texto-suave">
        Puede ser un problema momentáneo de conexión con la base. Reintentá; si
        persiste, avisale al desarrollador con el código de abajo.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="boton boton-principal" onClick={() => retry()}>
          Reintentar
        </button>
        <Link className="boton boton-secundario" href="/admin">
          Volver al panel
        </Link>
      </div>
      {error.digest && (
        <p className="mt-10 text-xs text-texto-suave">
          Código del error: <code>{error.digest}</code>
        </p>
      )}
    </main>
  );
}
