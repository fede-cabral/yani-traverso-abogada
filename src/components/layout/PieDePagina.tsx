import Link from "next/link";
import { MATRICULA_LEGIBLE, NEGOCIO, enlaceMapa } from "@/lib/negocio";
import { enlaceGeneral, telefonoLegible } from "@/lib/whatsapp";
import { NAVEGACION } from "./navegacion";

/**
 * Pie de página.
 *
 * Quien busca abogada quiere comprobar tres cosas antes de escribir: que
 * existe, que está matriculada y cómo se la encuentra. El pie las responde
 * en todas las páginas: nombre completo, matrícula, dirección y teléfono.
 */
export function PieDePagina() {
  const anio = new Date().getFullYear();
  const mapa = enlaceMapa();

  return (
    <footer className="pie-sitio franja-marca mt-auto border-t border-borde">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-semibold">{NEGOCIO.nombre}</p>
          <p className="rotulo mt-1">{NEGOCIO.rubro}</p>
          <p className="mt-4 text-sm text-texto-suave">
            {NEGOCIO.titular}
            <br />
            Matrícula {MATRICULA_LEGIBLE}
          </p>
        </div>

        <nav aria-label="Sitio">
          <p className="rotulo">Sitio</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-texto-suave">
            {NAVEGACION.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-acento">
                  {item.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="rotulo">Contacto</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-texto-suave">
            <li>
              <a
                href={enlaceGeneral()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-acento"
              >
                WhatsApp {telefonoLegible()}
              </a>
            </li>
            <li>
              <a href={`mailto:${NEGOCIO.email}`} className="break-all hover:text-acento">
                {NEGOCIO.email}
              </a>
            </li>
            <li>
              <address className="not-italic">
                {mapa ? (
                  <a href={mapa} target="_blank" rel="noopener noreferrer" className="hover:text-acento">
                    {NEGOCIO.direccionLegible}
                  </a>
                ) : (
                  NEGOCIO.direccionLegible
                )}
              </address>
            </li>
            <li>{NEGOCIO.horarios.legible}</li>
            {NEGOCIO.linkedin && (
              <li>
                <a
                  href={NEGOCIO.linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-acento"
                >
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        </div>

        <nav aria-label="Legal">
          <p className="rotulo">Legal</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-texto-suave">
            <li>
              <Link href="/aviso-legal" className="hover:text-acento">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/politica-de-privacidad" className="hover:text-acento">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-borde">
        <div className="contenedor flex flex-col gap-1 py-5 text-xs text-texto-suave">
          <p>
            © {anio} {NEGOCIO.titular}.{NEGOCIO.avisoLegal && ` ${NEGOCIO.avisoLegal}`}
          </p>
          {/* Transparencia sobre cómo se hizo el sitio. El detalle está en el
              aviso legal (punto 9). */}
          <p>
            Sitio desarrollado con asistencia de inteligencia artificial.{" "}
            <Link href="/aviso-legal" className="underline hover:text-acento">
              Más información
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
