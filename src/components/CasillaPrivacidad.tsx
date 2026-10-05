/**
 * La casilla de aceptación de la política de privacidad, obligatoria en los
 * dos formularios.
 *
 * La Ley 25.326 (art. 5) pide que el consentimiento para tratar datos
 * personales sea libre, expreso e informado. Un texto al pie del formulario
 * informa, pero no prueba que la persona aceptó: la casilla sí, y la valida
 * el servidor (no solo el navegador). La fecha del consentimiento es la del
 * propio pedido (creado_en): sin la casilla marcada, el pedido no se guarda.
 *
 * Arranca sin marcar a propósito. Una casilla premarcada no es consentimiento
 * expreso.
 */
export function CasillaPrivacidad({
  finalidad,
  errores,
  valores,
}: {
  /** Para qué se usan los datos en este formulario, en una frase. */
  finalidad: string;
  errores?: Record<string, string>;
  valores?: Record<string, string>;
}) {
  const error = errores?.acepta_privacidad;

  return (
    <div className="campo">
      <div className="flex items-start gap-3">
        <input
          id="acepta_privacidad"
          name="acepta_privacidad"
          type="checkbox"
          value="si"
          required
          defaultChecked={valores?.acepta_privacidad === "si"}
          className="mt-1 size-4 shrink-0 accent-acento"
          aria-describedby={error ? "error-acepta_privacidad" : undefined}
          aria-invalid={error ? true : undefined}
        />
        <label htmlFor="acepta_privacidad" className="text-sm text-texto-suave">
          Acepto que mis datos se usen {finalidad}, según la{" "}
          <a href="/politica-de-privacidad" className="underline" target="_blank" rel="noopener">
            política de privacidad
          </a>
          . *
        </label>
      </div>
      {error && (
        <p id="error-acepta_privacidad" className="error">{error}</p>
      )}
    </div>
  );
}
