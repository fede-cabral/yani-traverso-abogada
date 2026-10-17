/**
 * Datos estructurados (JSON-LD) para Google.
 *
 * Es una de las dos excepciones a la prohibición de dangerouslySetInnerHTML
 * (ver README). Vive en un solo componente para que el escape de "<" —lo que
 * impide cerrar el <script> desde un texto— esté escrito una sola vez.
 */
export function DatosEstructurados({ datos }: { datos: object | readonly object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
