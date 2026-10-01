"use client";

import { useEffect, useRef } from "react";
import type { EstadoFormulario } from "@/acciones/estado";

/**
 * El mensaje que devuelve el servidor cuando un formulario no se pudo enviar.
 *
 * Va arriba del formulario, pero el botón de enviar está abajo: en un celular
 * el mensaje queda fuera de pantalla y la persona ve un botón que "no hizo
 * nada". Por eso, cuando aparece, se lleva a la vista y recibe el foco —
 * así también lo anuncia un lector de pantalla y el teclado sigue desde ahí.
 */
export function AvisoFormulario({ estado }: { estado: EstadoFormulario }) {
  const aviso = useRef<HTMLParagraphElement>(null);

  // Depende del objeto `estado` entero y no solo del texto: dos envíos
  // fallidos seguidos devuelven el mismo mensaje, y el segundo también tiene
  // que traerlo a la vista.
  useEffect(() => {
    if (!estado.mensaje || estado.ok) return;
    aviso.current?.focus({ preventScroll: true });
    aviso.current?.scrollIntoView({ block: "center" });
  }, [estado]);

  if (!estado.mensaje || estado.ok) return null;

  return (
    <p ref={aviso} tabIndex={-1} className="aviso" role="alert">
      {estado.mensaje}
    </p>
  );
}
