/**
 * Datos del estudio y de la marca, en un solo lugar.
 *
 * El nombre, la matrícula, la frase de la portada, los colores del ícono y de
 * la tarjeta al compartir, la dirección y los horarios salen todos de acá: en
 * el resto del código no hay ningún dato del estudio escrito a mano.
 *
 * El teléfono de WhatsApp y la URL del sitio no están acá sino en las
 * variables de entorno (`.env.local`), porque cambian entre la computadora
 * de desarrollo y el sitio publicado.
 *
 * Regla: lo que la Dra. no confirmó va en `null` y se anota en PENDIENTES.md.
 * Un dato inventado en el sitio de una abogada matriculada no es un detalle
 * de redacción: es publicidad profesional falsa.
 */

export const NEGOCIO = {
  /** Como se presenta: encabezado, pie, títulos de Google. */
  nombre: "Dra. Yanina Traverso",

  /** Nombre completo, como figura en la matrícula. */
  titular: "Yanina Susana Traverso",

  /** Monograma para el ícono de la pestaña. */
  inicial: "YT",

  /** Qué hace, en pocas palabras. Va en el título de Google y al compartir. */
  rubro: "Abogada",

  /** Una o dos frases para buscadores. Hasta ~155 caracteres. */
  descripcion:
    "Asesoría jurídica integral en Provincia de Buenos Aires y CABA. Derecho inmobiliario y notarial, sucesiones, familia, laboral y penal.",

  /** La frase grande de la portada y de la tarjeta al compartir el sitio. */
  eslogan: "Asesoría jurídica integral",

  /** El párrafo debajo del eslogan, en la portada. */
  presentacion:
    "Abogada especialista en derecho inmobiliario y notarial. Atención en Provincia de Buenos Aires y CABA.",

  /** Tipo de negocio para Google (schema.org). */
  tipoSchema: "Attorney",

  /**
   * Colores fijos para lo que no puede leer el CSS del sitio: el ícono de la
   * pestaña, el manifiesto y las tarjetas al compartir. Que coincidan con
   * --color-oro-400 y --color-marca-fondo de globals.css.
   */
  colores: {
    marca: "#d4af61",
    fondo: "#000000",
  },

  /**
   * Aviso al pie de todas las páginas. Es el resguardo habitual de un sitio
   * profesional: lo que se lee acá no reemplaza una consulta.
   */
  avisoLegal:
    "La información de este sitio es de carácter general y no constituye asesoramiento legal para un caso concreto." as
      | string
      | null,

  matricula: {
    tomo: "LXX",
    folio: "338",
    colegio: "Colegio de Abogados de La Plata",
    sigla: "CALP",
  },

  /** Dónde atiende. Sale del logo de la Dra. */
  zona: "Provincia de Buenos Aires y CABA",

  direccion: {
    calle: "San Martín 328",
    ciudad: "Cañuelas" as string | null,
    provincia: "Buenos Aires" as string | null,
    // PENDIENTE: la Dra. no pasó el código postal. No se completa de memoria.
    codigoPostal: null as string | null,
    pais: "AR",
  },

  /** Cómo se muestra la dirección en pantalla, en una línea. */
  get direccionLegible(): string {
    const d = this.direccion;
    return d.ciudad ? `${d.calle}, ${d.ciudad}` : d.calle;
  },

  /**
   * WhatsApp del estudio: 54 + 9 + código de área sin 0 + número sin 15.
   *
   * La variable NEXT_PUBLIC_WHATSAPP de .env.local, si está, tiene prioridad.
   * Este valor es el que usa el modo demostración cuando no hay .env.local.
   */
  whatsapp: "5491127088591",

  email: "yaninatraverso1995@gmail.com",

  /**
   * Horario de atención. Las dos franjas son también las que ofrece el
   * formulario de turnos (ver src/lib/turnos.ts): si cambian acá, cambian allá.
   */
  horarios: {
    dias: "Lunes a viernes",
    franjas: [
      { desde: "10:00", hasta: "13:00" },
      { desde: "15:00", hasta: "18:00" },
    ],
    legible: "Lunes a viernes, de 10 a 13 y de 15 a 18",
  },

  // ── PENDIENTES ──
  // Instagram profesional todavía no existe. Cuando exista se carga acá y
  // aparece solo en el pie, en contacto y en los datos para Google.
  instagram: null as { usuario: string; url: string } | null,
  // Sin los parámetros de seguimiento (utm_*) con los que se compartió el enlace.
  linkedin: { url: "https://www.linkedin.com/in/yanina-susana-traverso-549a20141" } as { url: string } | null,
  cuit: null as string | null,
} as const;

/** "Nombre — Rubro": el título por defecto del sitio. */
export const TITULO_SITIO = `${NEGOCIO.nombre} — ${NEGOCIO.rubro}`;

/** "T° LXX F° 338 · CALP": la matrícula, como se escribe en el fuero. */
export const MATRICULA_LEGIBLE = `T° ${NEGOCIO.matricula.tomo} F° ${NEGOCIO.matricula.folio} · ${NEGOCIO.matricula.sigla}`;

/**
 * Enlace a Google Maps con la dirección, o null si falta la localidad.
 *
 * Null y no un enlace aproximado: mandar a alguien a la "San Martín 328" de
 * otra ciudad es peor que no darle mapa.
 */
export function enlaceMapa(): string | null {
  const d = NEGOCIO.direccion;
  if (!d.ciudad) return null;
  const consulta = [d.calle, d.ciudad, d.provincia, "Argentina"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}
