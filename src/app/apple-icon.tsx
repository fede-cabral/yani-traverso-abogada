import { ImageResponse } from "next/og";
import { NEGOCIO } from "@/lib/negocio";

/** Icono para cuando alguien agrega el sitio a la pantalla de inicio en iOS. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function IconoApple() {
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
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "serif",
          letterSpacing: -4,
        }}
      >
        {NEGOCIO.inicial}
      </div>
    ),
    size,
  );
}
