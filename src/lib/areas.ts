/**
 * Áreas de práctica.
 *
 * Son contenido fijo y no una tabla de la base: son diez, cambian una vez por
 * año con suerte, y ponerlas en la base obligaría a mantener un panel entero
 * para editar diez renglones. Cuando la Dra. quiera cambiar una, se cambia acá.
 *
 * Los resúmenes describen de qué trata cada rama, nada más. No prometen
 * resultados ni enumeran servicios que la Dra. no confirmó: la publicidad de
 * un abogado matriculado tiene reglas de ética profesional, y "ganamos tu
 * caso" las rompe. Si se amplían, que sea con texto de ella.
 */

export interface Area {
  slug: string;
  nombre: string;
  resumen: string;
  /** Las dos ramas en las que es especialista. Van primero y destacadas. */
  especialidad: boolean;
}

export const AREAS = [
  {
    slug: "inmobiliario",
    nombre: "Derecho inmobiliario",
    resumen: "Asesoramiento legal en operaciones y conflictos vinculados a inmuebles.",
    especialidad: true,
  },
  {
    slug: "notarial",
    nombre: "Derecho notarial",
    resumen: "Asesoramiento sobre escrituras, títulos y documentación notarial.",
    especialidad: true,
  },
  {
    slug: "sucesiones",
    nombre: "Sucesiones",
    resumen: "Trámites sucesorios para ordenar y transmitir los bienes de una persona fallecida.",
    especialidad: false,
  },
  {
    slug: "usucapiones",
    nombre: "Usucapiones",
    resumen:
      "Juicios para obtener el título de un inmueble por haberlo poseído durante el tiempo que exige la ley.",
    especialidad: false,
  },
  {
    slug: "familia",
    nombre: "Familia",
    resumen: "Asesoramiento y representación en asuntos de derecho de familia.",
    especialidad: false,
  },
  {
    slug: "laboral",
    nombre: "Laboral",
    resumen: "Asesoramiento y reclamos derivados de la relación de trabajo.",
    especialidad: false,
  },
  {
    slug: "art",
    nombre: "ART",
    resumen:
      "Reclamos por accidentes de trabajo y enfermedades profesionales ante las aseguradoras de riesgos del trabajo.",
    especialidad: false,
  },
  {
    slug: "accidentes-de-transito",
    nombre: "Accidentes de tránsito",
    resumen: "Reclamos por daños y lesiones sufridos en accidentes de tránsito.",
    especialidad: false,
  },
  {
    slug: "penal",
    nombre: "Penal",
    resumen: "Asesoramiento y defensa en causas penales.",
    especialidad: false,
  },
  {
    slug: "amparos-de-salud",
    nombre: "Amparos de salud",
    resumen: "Acciones de amparo para reclamar coberturas y prestaciones de salud.",
    especialidad: false,
  },
] as const satisfies readonly Area[];

export type SlugArea = (typeof AREAS)[number]["slug"];

/**
 * Lo que se puede elegir en el formulario de turnos: las áreas, más "otra"
 * para quien no sabe en cuál cae su tema — que es la mayoría de la gente
 * la primera vez que consulta a un abogado.
 */
export const AREA_OTRA = "otra";

export const OPCIONES_AREA: readonly string[] = [...AREAS.map((a) => a.slug), AREA_OTRA];

export function nombreDeArea(slug: string): string {
  if (slug === AREA_OTRA) return "Otro tema";
  return AREAS.find((a) => a.slug === slug)?.nombre ?? slug;
}
