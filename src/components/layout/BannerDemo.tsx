import { env } from "@/lib/env";

/**
 * Cartel de modo demostración.
 *
 * Tiene que ser imposible de pasar por alto. Un modo demostración discreto es
 * una trampa: alguien pide un turno de prueba, se va contento, y nadie se
 * entera de que ese pedido no llegó a ningún lado.
 */
export function BannerDemo() {
  if (!env.NEXT_PUBLIC_DEMO) return null;

  return (
    <p
      role="status"
      className="bg-aviso px-4 py-2 text-center text-xs font-semibold text-texto-inverso"
    >
      MODO DEMOSTRACIÓN · Los turnos y las consultas no se guardan, y los que
      muestra el panel son de ejemplo.
    </p>
  );
}
