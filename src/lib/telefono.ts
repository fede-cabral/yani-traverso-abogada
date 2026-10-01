/**
 * Un número en formato internacional, legible: 5491127088591 → +54 9 11 2708-8591
 *
 * Buenos Aires va primero y aparte: su código de área tiene dos dígitos y el
 * número ocho, al revés que el resto del país. Con una sola regla, un número
 * de CABA sale partido como si fuera del interior.
 *
 * Vive en su propio archivo, sin importar las variables de entorno, para que
 * se pueda probar sin tener un .env.local.
 */
export function formatearTelefono(numero: string): string {
  const amba = /^54(9)?(11)(\d{4})(\d{4})$/.exec(numero);
  const interior = /^54(9)?(\d{3,4})(\d{3})(\d{4})$/.exec(numero);
  const m = amba ?? interior;
  if (!m) return `+${numero}`;
  const [, nueve, area, parte1, parte2] = m;
  return `+54${nueve ? " 9" : ""} ${area} ${parte1}-${parte2}`;
}
