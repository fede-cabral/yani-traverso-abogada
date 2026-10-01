import { ImageResponse } from "next/og";
import { NEGOCIO } from "@/lib/negocio";

/**
 * Icono del sitio, generado en vez de un .ico suelto.
 *
 * A 32px el logo completo es una mancha: no entran ni la balanza ni el
 * nombre. Entra el monograma. "YT" en dorado sobre negro, los dos colores de
 * la marca, se distingue en una pestaña entre veinte — que es todo lo que un
 * favicon tiene que lograr.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icono() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: NEGOCIO.colores.fondo,
          color: NEGOCIO.colores.marca,
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "serif",
          letterSpacing: -1,
          borderRadius: 4,
        }}
      >
        {NEGOCIO.inicial}
      </div>
    ),
    size,
  );
}
