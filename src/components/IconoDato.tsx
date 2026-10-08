/**
 * Íconos de línea de los datos profesionales de "Sobre mí".
 *
 * Dibujados acá y no traídos de una librería: son cuatro, y una dependencia
 * por cuatro íconos es superficie de ataque de más. Trazo de 1.5 y color
 * heredado (currentColor), así toman el dorado del contenedor.
 */
const TRAZOS = {
  // Birrete
  formacion: (
    <>
      <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z" />
      <path d="M7 11.5v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4" />
      <path d="M21 9.5V15" />
    </>
  ),
  // Edificio con columnas
  matricula: (
    <>
      <path d="M3 9h18L12 4 3 9Z" />
      <path d="M5 9v8M9.5 9v8M14.5 9v8M19 9v8" />
      <path d="M3 20h18M4 17h16" />
    </>
  ),
  // Documento con lapicera
  especializacion: (
    <>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M8 12h5M8 15h3" />
      <path d="m13 19 5.5-5.5 1.5 1.5L14.5 20.5 12.5 21l.5-2Z" />
    </>
  ),
  // Personas
  actualidad: (
    <>
      <circle cx="12" cy="8" r="2.5" />
      <circle cx="5.5" cy="10" r="2" />
      <circle cx="18.5" cy="10" r="2" />
      <path d="M7.5 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <path d="M2.5 19c0-2 1.3-3.5 3-3.5 .8 0 1.5.3 2 .8M21.5 19c0-2-1.3-3.5-3-3.5-.8 0-1.5.3-2 .8" />
    </>
  ),
} as const;

export function IconoDato({ nombre }: { nombre: keyof typeof TRAZOS }) {
  return (
    <svg
      className="icono-dato"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
