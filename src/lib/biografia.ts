/**
 * La presentación de la Dra., en primera persona.
 *
 * Es SU texto, apenas ordenado. No se le suman años de trayectoria, casos
 * ganados ni títulos que no dijo. Si hay que ampliarlo, que lo amplíe ella.
 *
 * La versión del 07/10/2026 la pasó ella. Se le sacó "orientada a
 * resultados": en la publicidad de una abogada, todo lo que suene a
 * resultado prometido es un riesgo ante el Colegio.
 *
 * Vive acá y no en la página porque lo usan dos: la portada muestra la cita
 * corta y "Sobre mí" muestra la biografía completa.
 */

/** El título de "Sobre mí". */
export const TITULO_SOBRE_MI = "Compromiso, experiencia y una visión integral del derecho";

export const BIOGRAFIA = [
  "Soy Yanina Traverso, abogada, graduada en la Universidad Católica de La Plata, con matrícula T° LXX, F° 338 del Colegio de Abogados de La Plata.",
  "Comencé mi carrera en un estudio jurídico de gran tamaño, donde trabajé durante cuatro años en casos de las más diversas ramas del derecho. Esa experiencia me dio una formación amplia y práctica, que fortalece hoy mi manera de asesorar y acompañar a cada cliente con una mirada integral.",
  "Además de abogada, soy escribana, por lo que me especializo en derecho notarial e inmobiliario. Actualmente asesoro a inmobiliarias y particulares en todo tipo de operaciones vinculadas al ámbito notarial y registral.",
] as const;

/** La cita de la portada: corta, para que se lea de un vistazo. */
export const CITA_PORTADA =
  "Empecé mi carrera en un estudio jurídico de gran tamaño, donde trabajé cuatro años con casos de las más diversas ramas del derecho. Esa experiencia me dio una formación amplia y práctica.";

/** Los cuatro datos al pie de "Sobre mí". */
export const DATOS_PROFESIONALES = [
  { icono: "formacion", titulo: "Formación", lineas: ["Universidad Católica de La Plata"] },
  {
    icono: "matricula",
    titulo: "Matrícula",
    lineas: ["Tomo LXX", "Folio 338", "Colegio de Abogados de La Plata"],
  },
  { icono: "especializacion", titulo: "Especialización", lineas: ["Derecho notarial e inmobiliario"] },
  { icono: "actualidad", titulo: "Actualidad", lineas: ["Asesora a inmobiliarias y particulares"] },
] as const;
