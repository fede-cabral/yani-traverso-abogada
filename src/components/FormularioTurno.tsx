"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ESTADO_INICIAL } from "@/acciones/estado";
import { AvisoFormulario } from "@/components/AvisoFormulario";
import { pedirTurno } from "@/acciones/turnos";
import { AREAS, AREA_OTRA } from "@/lib/areas";
import { ETIQUETA_FRANJA, FRANJAS } from "@/lib/turnos";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-principal" disabled={pending}>
      {pending ? "Enviando…" : "Pedir turno"}
    </button>
  );
}

interface Props {
  /**
   * Primer y último día que se pueden elegir, como "AAAA-MM-DD".
   *
   * Los calcula la página en el servidor y los pasa ya resueltos. Si se
   * calcularan acá, el servidor y el navegador podrían no coincidir cerca de
   * la medianoche y React avisaría de un desajuste al hidratar.
   */
  minimo: string;
  maximo: string;
  /** Tema ya elegido, cuando se llega desde la tarjeta de un área. */
  areaInicial?: string;
}

export function FormularioTurno({ minimo, maximo, areaInicial }: Props) {
  const [estado, accion] = useActionState(pedirTurno, ESTADO_INICIAL);
  const { errores, valores } = estado;

  if (estado.ok) {
    return (
      <div className="tarjeta p-6" role="status">
        <p className="font-semibold text-exito">Pedido recibido</p>
        <p className="mt-2 text-sm text-texto-suave">{estado.mensaje}</p>
        <p className="mt-2 text-sm text-texto-suave">
          El turno queda firme recién cuando te confirmamos el horario.
        </p>
      </div>
    );
  }

  return (
    <form action={accion} className="flex max-w-xl flex-col gap-5" noValidate>
      {/* Honeypot: ver el comentario en FormularioContacto. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">No completar este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <AvisoFormulario estado={estado} />

      <div className="campo">
        <label htmlFor="nombre">Nombre y apellido *</label>
        <input
          id="nombre"
          name="nombre"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          defaultValue={valores?.nombre}
          aria-describedby={errores?.nombre ? "error-nombre" : undefined}
          aria-invalid={errores?.nombre ? true : undefined}
        />
        {errores?.nombre && (
          <p id="error-nombre" className="error">{errores.nombre}</p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="telefono">Teléfono *</label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          maxLength={25}
          autoComplete="tel"
          defaultValue={valores?.telefono}
          aria-describedby={errores?.telefono ? "error-telefono ayuda-telefono" : "ayuda-telefono"}
          aria-invalid={errores?.telefono ? true : undefined}
        />
        {errores?.telefono && (
          <p id="error-telefono" className="error">{errores.telefono}</p>
        )}
        <p id="ayuda-telefono" className="ayuda">
          Es a donde te vamos a llamar o escribir para confirmar el horario.
        </p>
      </div>

      <div className="campo">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          maxLength={200}
          autoComplete="email"
          defaultValue={valores?.email}
          aria-describedby={errores?.email ? "error-email" : undefined}
          aria-invalid={errores?.email ? true : undefined}
        />
        {errores?.email && (
          <p id="error-email" className="error">{errores.email}</p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="area">Tema de la consulta *</label>
        {/*
          La key fuerza a React a recrear el select cuando vuelve un error.
          Sin ella, al vaciarse el formulario el select vuelve a "Elegí una
          opción" aunque el defaultValue diga otra cosa: a diferencia de un
          input, un select no relee su defaultValue después del reinicio.
          Probado en pantalla: era el único campo que perdía lo elegido.
        */}
        <select
          key={valores?.area ?? areaInicial ?? "sin-elegir"}
          id="area"
          name="area"
          required
          defaultValue={valores?.area ?? areaInicial ?? ""}
          aria-describedby={errores?.area ? "error-area" : undefined}
          aria-invalid={errores?.area ? true : undefined}
        >
          <option value="" disabled>
            Elegí una opción
          </option>
          {AREAS.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.nombre}
            </option>
          ))}
          <option value={AREA_OTRA}>Otro tema, o no sé cuál es</option>
        </select>
        {errores?.area && (
          <p id="error-area" className="error">{errores.area}</p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="fecha_preferida">Día preferido *</label>
        <input
          id="fecha_preferida"
          name="fecha_preferida"
          type="date"
          required
          min={minimo}
          max={maximo}
          defaultValue={valores?.fecha_preferida}
          aria-describedby={
            errores?.fecha_preferida ? "error-fecha ayuda-fecha" : "ayuda-fecha"
          }
          aria-invalid={errores?.fecha_preferida ? true : undefined}
        />
        {errores?.fecha_preferida && (
          <p id="error-fecha" className="error">{errores.fecha_preferida}</p>
        )}
        <p id="ayuda-fecha" className="ayuda">
          De lunes a viernes, a partir de mañana.
        </p>
      </div>

      <fieldset
        className="opciones"
        aria-describedby={errores?.franja ? "error-franja" : undefined}
      >
        <legend>Horario preferido *</legend>
        {FRANJAS.map((franja) => (
          <label key={franja}>
            <input
              type="radio"
              name="franja"
              value={franja}
              required
              defaultChecked={valores?.franja === franja}
            />
            {ETIQUETA_FRANJA[franja]}
          </label>
        ))}
        {errores?.franja && (
          <p id="error-franja" className="error">{errores.franja}</p>
        )}
      </fieldset>

      <div className="campo">
        <label htmlFor="motivo">Motivo, en pocas palabras</label>
        <textarea
          id="motivo"
          name="motivo"
          maxLength={500}
          defaultValue={valores?.motivo}
          aria-describedby={errores?.motivo ? "error-motivo ayuda-motivo" : "ayuda-motivo"}
          aria-invalid={errores?.motivo ? true : undefined}
        />
        {errores?.motivo && (
          <p id="error-motivo" className="error">{errores.motivo}</p>
        )}
        <p id="ayuda-motivo" className="ayuda">
          Opcional. No hace falta contar el caso ni dar nombres de terceros:
          eso se conversa en la consulta.
        </p>
      </div>

      <Boton />

      <p className="text-xs text-texto-suave">
        Tus datos se usan únicamente para coordinar este turno. Ver la{" "}
        <a href="/politica-de-privacidad" className="underline">política de privacidad</a>.
      </p>
    </form>
  );
}
