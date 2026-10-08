import { Medallon } from "./Medallon";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

/**
 * El retrato de la Dra. en un marco vertical, con el medallón apoyado en la
 * esquina como un sello y la matrícula en una placa encima del borde.
 *
 * El medallón es el mismo de la portada: al ir de una página a la otra viaja
 * y se achica hasta la esquina. Así el logo sigue siendo el hilo del sitio
 * aunque acá el protagonista sea la cara de la persona.
 *
 * Sin foto, el marco muestra el monograma en grande. Queda como una decisión
 * de diseño y no como un hueco, y no hay que tocar nada el día que llegue
 * la foto: se carga en negocio.ts y aparece.
 *
 * <img> común y no next/image por la misma razón que el medallón: la CSP
 * prohíbe los estilos en línea que agrega next/image.
 */
export function Retrato({ className = "" }: { className?: string }) {
  const foto = NEGOCIO.foto;

  return (
    <figure className={`retrato ${className}`}>
      <div className="retrato-marco">
        {foto ? (
          <img
            src={foto.src}
            width={foto.ancho}
            height={foto.alto}
            alt={`Retrato de ${NEGOCIO.nombre}.`}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <span className="retrato-monograma" aria-hidden="true">
            {NEGOCIO.inicial}
          </span>
        )}
      </div>
      <Medallon tamano="sello" className="retrato-sello" />
      <figcaption className="retrato-placa">
        <span>Matrícula</span>
        {MATRICULA_LEGIBLE}
      </figcaption>
    </figure>
  );
}
