"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ingresar, type EstadoLogin } from "@/acciones/auth";

function Boton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="boton boton-principal w-full" disabled={pending}>
      {pending ? "Verificando…" : "Ingresar"}
    </button>
  );
}

export function FormularioLogin() {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(ingresar, {});

  return (
    <form action={accion} className="flex flex-col gap-5">
      {estado.error && (
        <p className="aviso" role="alert">
          {estado.error}
        </p>
      )}

      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" maxLength={200} />
      </div>

      <div className="campo">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          maxLength={200}
        />
      </div>

      <Boton />
    </form>
  );
}
