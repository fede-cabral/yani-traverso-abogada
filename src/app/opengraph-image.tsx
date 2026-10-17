import { ImageResponse } from "next/og";
import { MATRICULA_LEGIBLE, NEGOCIO, TITULO_SITIO } from "@/lib/negocio";

/** Tarjeta que se ve al compartir cualquier página del sitio por WhatsApp o redes. */

export const alt = TITULO_SITIO;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          background: NEGOCIO.colores.fondo,
          padding: 90,
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 10,
            color: NEGOCIO.colores.marca,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          {NEGOCIO.rubro} · {NEGOCIO.zona}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 104,
            fontWeight: 700,
            color: "#f4f1ea",
            lineHeight: 1.05,
          }}
        >
          {NEGOCIO.nombre}
        </div>
        <div
          style={{
            display: "flex",
            width: 200,
            height: 2,
            background: NEGOCIO.colores.marca,
          }}
        />
        <div style={{ display: "flex", fontSize: 44, color: "#f4f1ea" }}>
          {NEGOCIO.eslogan}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a8a295",
            fontFamily: "sans-serif",
          }}
        >
          Matrícula {MATRICULA_LEGIBLE}
        </div>
      </div>
    ),
    size,
  );
}
