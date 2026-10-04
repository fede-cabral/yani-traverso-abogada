import { Compartido } from "./Compartido";
import { NEGOCIO } from "@/lib/negocio";

/**
 * El logo de la Dra., como medallón.
 *
 * Es un <img> común y no next/image a propósito: next/image le agrega al
 * elemento un atributo style, y la CSP del sitio prohíbe los estilos en línea
 * (style-src-attr 'none'). El navegador lo bloquearía y dejaría un error en
 * la consola de cada visita. Como el logo es un solo archivo que no cambia,
 * las dos medidas ya están generadas en public/marca/ y el srcset se escribe
 * a mano.
 *
 * Va siempre sobre la franja de marca, el gris más oscuro del sitio: el fondo
 * del logo es negro puro, y sobre un color claro el disco se vería recortado.
 * Sobre la franja, apenas más clara, se lee como una moneda apoyada.
 *
 * Está en la portada y en "Sobre mí", en el mismo lugar. El nombre de
 * transición hace que al ir de una a otra el medallón viaje a su nueva
 * posición en vez de desaparecer y reaparecer: se lee como el mismo objeto.
 * Por eso no puede haber dos medallones en una misma página (el navegador
 * cancela la transición si dos elementos comparten nombre).
 */
export function Medallon({
  prioritario = false,
  className = "",
}: {
  /** True solo en la portada, donde es la imagen más grande de la pantalla. */
  prioritario?: boolean;
  className?: string;
}) {
  return (
    <Compartido nombre="medallon">
      <img
        className={`medallon ${className}`}
        src="/marca/logo.webp"
        srcSet="/marca/logo-320.webp 320w, /marca/logo.webp 640w"
        sizes="(max-width: 640px) 70vw, 22rem"
        width={640}
        height={640}
        alt={`Logo de ${NEGOCIO.nombre}, abogada. ${NEGOCIO.eslogan}.`}
        loading={prioritario ? "eager" : "lazy"}
        fetchPriority={prioritario ? "high" : "auto"}
        decoding="async"
      />
    </Compartido>
  );
}
