"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/acciones/estado";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-secundario text-xs" disabled={pending}>
      {pending ? "Guardando…" : "Guardar"}
    </button>
  );
}

/**
 * Cambio de estado de un turno o de una consulta.
 *
 * Es un desplegable con botón y no un botón por estado: cambiar de estado no
 * borra nada y se puede deshacer eligiendo otro, así que no necesita la
 * confirmación en dos pasos que sí llevaría un borrado.
 *
 * La acción llega por props. Que el componente no sepa cuál es no afloja
 * nada: cada acción revalida el rol y los datos por su cuenta.
 */
export function CambiarEstado({
  accion,
  id,
  estado,
  opciones,
  descripcion,
}: {
  accion: (previo: EstadoFormulario, datos: FormData) => Promise<EstadoFormulario>;
  id: string;
  estado: string;
  opciones: readonly { valor: string; etiqueta: string }[];
  /** Completa la etiqueta para lectores de pantalla: "del turno de Ana". */
  descripcion: string;
}) {
  const [resultado, enviar] = useActionState(accion, ESTADO_INICIAL);
  const campo = `estado-${id}`;

  return (
    <form action={enviar} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />

      <div className="campo">
        <label htmlFor={campo}>
          Estado<span className="sr-only"> {descripcion}</span>
        </label>
        <select id={campo} name="estado" defaultValue={estado}>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <Boton />

      {resultado.mensaje && (
        <p
          className={`w-full text-sm ${resultado.ok ? "text-exito" : "text-peligro"}`}
          role={resultado.ok ? "status" : "alert"}
        >
          {resultado.mensaje}
        </p>
      )}
    </form>
  );
}
