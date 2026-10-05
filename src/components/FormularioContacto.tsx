"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { enviarConsulta } from "@/acciones/contacto";
import { ESTADO_INICIAL } from "@/acciones/estado";
import { AvisoFormulario } from "@/components/AvisoFormulario";
import { CasillaPrivacidad } from "@/components/CasillaPrivacidad";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-principal" disabled={pending}>
      {pending ? "Enviando…" : "Enviar consulta"}
    </button>
  );
}

export function FormularioContacto() {
  const [estado, accion] = useActionState(enviarConsulta, ESTADO_INICIAL);
  const { errores, valores } = estado;

  if (estado.ok) {
    return (
      <div className="tarjeta p-6" role="status">
        <p className="font-semibold text-exito">Consulta enviada</p>
        <p className="mt-2 text-sm text-texto-suave">{estado.mensaje}</p>
      </div>
    );
  }

  return (
    <form action={accion} className="flex max-w-xl flex-col gap-5" noValidate>
      {/*
        Honeypot. Oculto para personas pero visible para un bot que rellena
        todo lo que encuentra. aria-hidden y tabIndex -1 lo sacan del alcance
        de teclado y de los lectores de pantalla; autoComplete off evita que
        el navegador lo complete solo.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">No completar este campo</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <AvisoFormulario estado={estado} />

      <div className="campo">
        <label htmlFor="nombre">Nombre *</label>
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
        <label htmlFor="telefono">Teléfono</label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          maxLength={25}
          autoComplete="tel"
          defaultValue={valores?.telefono}
          aria-describedby={errores?.telefono ? "error-telefono ayuda-contacto" : "ayuda-contacto"}
          aria-invalid={errores?.telefono ? true : undefined}
        />
        {errores?.telefono && (
          <p id="error-telefono" className="error">{errores.telefono}</p>
        )}
        <p id="ayuda-contacto" className="ayuda">
          Dejanos al menos un mail o un teléfono para poder responderte.
        </p>
      </div>

      <div className="campo">
        <label htmlFor="mensaje">Consulta *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          minLength={5}
          maxLength={2000}
          defaultValue={valores?.mensaje}
          aria-describedby={errores?.mensaje ? "error-mensaje ayuda-mensaje" : "ayuda-mensaje"}
          aria-invalid={errores?.mensaje ? true : undefined}
        />
        {errores?.mensaje && (
          <p id="error-mensaje" className="error">{errores.mensaje}</p>
        )}
        <p id="ayuda-mensaje" className="ayuda">
          Alcanza con una idea general. Los detalles y la documentación se ven
          en la consulta, no por este formulario.
        </p>
      </div>

      <CasillaPrivacidad
        finalidad="únicamente para responder esta consulta"
        errores={errores}
        valores={valores}
      />

      <Boton />
    </form>
  );
}
