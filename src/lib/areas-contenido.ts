import type { SlugArea } from "@/lib/areas";

/**
 * El detalle de cada área, para su página propia (/areas/sucesiones).
 *
 * BORRADOR, pendiente de que lo apruebe la Dra. (ver PENDIENTES.md).
 *
 * Qué es y qué no es este texto:
 *
 * - Es información general sobre cómo funciona cada trámite según la ley
 *   argentina: qué es una usucapión, qué pasos tiene una sucesión. Sirve a
 *   quien busca en Google sin saber cómo se llama su problema, y es lo que
 *   le da a cada página contenido suficiente para posicionar.
 * - NO dice qué hace la Dra. en cada área ni enumera servicios suyos
 *   (regla 10 de CLAUDE.md). Los pasos están en impersonal: describen el
 *   trámite, no un servicio. Por ejemplo, que sea escribana no implica que
 *   tenga registro notarial y firme escrituras: por eso "Derecho notarial"
 *   habla del trámite de una escritura sin decir quién la firma.
 * - Ninguna promesa de resultado ni de plazo. Donde la ley fija un plazo
 *   firme (los veinte años de la usucapión) se menciona; donde depende del
 *   caso, se dice que hay plazos y que conviene consultar pronto.
 */

export interface ContenidoArea {
  /** Para la pestaña y Google; la página le suma " en Cañuelas". */
  tituloSeo: string;
  /** Meta descripción, hasta ~155 caracteres. */
  descripcionSeo: string;
  /** Qué es, en dos o tres párrafos cortos. */
  intro: readonly string[];
  /** Cómo es el trámite en general, en orden. */
  etapas: readonly string[];
  /** Qué conviene llevar a la primera consulta. */
  documentacion: readonly string[];
}

export const CONTENIDO_AREAS: Record<SlugArea, ContenidoArea> = {
  inmobiliario: {
    tituloSeo: "Abogada de derecho inmobiliario",
    descripcionSeo:
      "Asesoramiento legal en operaciones y conflictos sobre inmuebles: boletos, compraventas, alquileres y títulos. Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "El derecho inmobiliario se ocupa de todo lo que gira alrededor de un inmueble: comprarlo, venderlo, alquilarlo, dividirlo o reclamar por él. Es, junto con el notarial, la especialidad de la Dra. Traverso.",
      "Revisar la documentación antes de firmar una reserva, un boleto o un contrato de alquiler permite detectar a tiempo problemas que, de otro modo, aparecen cuando ya hay dinero de por medio: deudas, embargos, títulos con defectos o planos que no coinciden con lo construido.",
    ],
    etapas: [
      "Revisión de la documentación del inmueble: título, planos, deudas e informes de dominio e inhibiciones.",
      "Análisis de la reserva, el boleto o el contrato antes de firmarlo.",
      "Seguimiento de la operación hasta la escritura y su inscripción en el Registro de la Propiedad.",
      "Si hay un conflicto —un incumplimiento, una deuda, un desalojo—, evaluación de cómo resolverlo: primero por acuerdo y, si no se logra, por la vía judicial.",
    ],
    documentacion: [
      "Título o escritura del inmueble, si la tenés.",
      "Reserva, boleto o contrato, firmado o en borrador.",
      "Planos y boletas de impuestos y servicios.",
      "DNI de las personas que intervienen.",
    ],
  },

  notarial: {
    tituloSeo: "Abogada y escribana: derecho notarial",
    descripcionSeo:
      "Asesoramiento sobre escrituras, títulos, poderes y documentación notarial, con mirada de abogada y escribana. Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "El derecho notarial regula los actos que pasan por un escribano: escrituras, poderes, actas y certificaciones de firma. La Dra. Traverso es abogada y escribana, y esta es, junto con el inmobiliario, su especialidad.",
      "Una escritura bien hecha prueba quién es el dueño de un bien y en qué condiciones, frente a cualquiera. Un error en un título, en cambio, puede trabar una venta o una herencia años después, cuando corregirlo es más difícil.",
    ],
    etapas: [
      "Estudio de títulos: se revisan los antecedentes del inmueble para confirmar que no haya defectos.",
      "Pedido de certificados al Registro de la Propiedad y de las deudas del inmueble.",
      "Redacción y firma de la escritura ante el escribano.",
      "Inscripción en el registro que corresponda.",
    ],
    documentacion: [
      "Escritura o título anterior del bien.",
      "DNI de quienes van a firmar.",
      "Si se trata de un poder o un acta: qué se quiere dejar constancia o a quién se quiere autorizar.",
    ],
  },

  sucesiones: {
    tituloSeo: "Abogada de sucesiones",
    descripcionSeo:
      "Cómo es una sucesión: declaratoria de herederos, testamento, edictos e inscripción de los bienes. Abogada en Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "Cuando una persona fallece, sus bienes no pasan solos a sus herederos. Hace falta un proceso judicial, la sucesión, que determina quiénes son los herederos y les permite disponer de lo heredado: vender una casa, cobrar una cuenta, transferir un auto.",
      "Si no hay testamento, la ley define quiénes heredan y la sucesión se llama ab intestato. Si la persona dejó un testamento, es testamentaria y se sigue lo que dispuso, dentro de los límites que fija la ley.",
    ],
    etapas: [
      "Reunión de la documentación: partidas, DNI y datos de los bienes.",
      "Inicio del juicio sucesorio ante el juzgado del último domicilio de la persona fallecida.",
      "Publicación de edictos para citar a herederos y acreedores.",
      "Declaratoria de herederos o aprobación del testamento.",
      "Inscripción de los bienes a nombre de los herederos o, si así lo deciden, su venta.",
    ],
    documentacion: [
      "Partida de defunción.",
      "Partidas que acrediten el parentesco: nacimiento, matrimonio.",
      "DNI de los herederos.",
      "Datos de los bienes: escrituras, títulos de autos, cuentas bancarias.",
      "Testamento, si existe.",
    ],
  },

  usucapiones: {
    tituloSeo: "Abogada de usucapiones",
    descripcionSeo:
      "Usucapión o prescripción adquisitiva: cómo obtener el título de un inmueble que se posee como dueño hace años. Abogada en Cañuelas, Prov. de Buenos Aires.",
    intro: [
      "La usucapión, o prescripción adquisitiva, es el juicio que permite obtener el título de un inmueble cuando alguien lo posee como dueño, de forma continua y a la vista de todos, durante el tiempo que exige la ley.",
      "El plazo general es de veinte años de posesión; en algunos casos, con justo título y buena fe, la ley exige menos. Es un juicio de prueba: lo que se discute es si la posesión fue real y por cuánto tiempo, y eso se demuestra con documentos y testigos.",
    ],
    etapas: [
      "Reunión de pruebas de la posesión: impuestos y servicios pagados, mejoras, testigos.",
      "Plano de mensura confeccionado por un agrimensor.",
      "Informes del Registro de la Propiedad sobre quién figura como titular.",
      "Demanda y juicio, con la producción de la prueba.",
      "Sentencia e inscripción del inmueble a nombre de quien lo poseyó.",
    ],
    documentacion: [
      "Boletas de impuestos y servicios que hayas pagado, cuanto más antiguas, mejor.",
      "Boleto, cesión o cualquier papel por el que entraste al inmueble.",
      "Fotos y facturas de materiales o arreglos.",
      "Datos de vecinos que conozcan tu posesión y puedan declararlo.",
    ],
  },

  familia: {
    tituloSeo: "Abogada de familia",
    descripcionSeo:
      "Divorcio, cuota alimentaria, cuidado personal de los hijos y régimen de comunicación. Abogada de familia en Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "El derecho de familia abarca las relaciones entre parejas, y entre padres e hijos: divorcio, cuota alimentaria, cuidado personal de los hijos, régimen de comunicación y filiación, entre otros temas.",
      "Desde 2015 el divorcio no requiere expresar una causa y puede pedirlo uno solo de los cónyuges. Son temas delicados y, cuando es posible, conviene resolverlos por acuerdo; si no lo hay, se tramitan ante el juzgado de familia.",
    ],
    etapas: [
      "Consulta para entender la situación y qué se busca resolver.",
      "Intento de acuerdo, cuando es posible.",
      "Si no hay acuerdo, presentación ante el juzgado de familia.",
      "Revisión de lo acordado o resuelto cuando cambian las circunstancias.",
    ],
    documentacion: [
      "DNI, partida de matrimonio y partidas de nacimiento de los hijos.",
      "Copia de cualquier acuerdo o sentencia anterior.",
      "Comprobantes de ingresos y gastos, si el tema es la cuota alimentaria.",
    ],
  },

  laboral: {
    tituloSeo: "Abogada laboral",
    descripcionSeo:
      "Despidos, indemnizaciones, trabajo no registrado y diferencias salariales. Abogada laboral en Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "El derecho laboral protege a quien trabaja en relación de dependencia. Se ocupa de despidos, indemnizaciones, trabajo no registrado, diferencias salariales, licencias y cualquier otro conflicto con el empleador.",
      "Los reclamos laborales tienen plazos para iniciarse. Si te despidieron o tenés un conflicto en el trabajo, conviene consultar pronto y no firmar nada sin haberlo leído con atención.",
    ],
    etapas: [
      "Análisis de la relación laboral: fecha de ingreso, categoría, salario y cómo terminó.",
      "Intercambio de telegramas o cartas documento con el empleador.",
      "Instancia de conciliación, cuando corresponde.",
      "Demanda ante la justicia laboral, si no hay acuerdo.",
    ],
    documentacion: [
      "Recibos de sueldo.",
      "Telegramas o cartas documento enviados o recibidos.",
      "Si no estabas registrado: mensajes, fotos, datos de compañeros, cualquier cosa que pruebe que trabajabas ahí.",
    ],
  },

  art: {
    tituloSeo: "Abogada de ART y accidentes de trabajo",
    descripcionSeo:
      "Reclamos ante la ART por accidentes de trabajo, accidentes in itinere y enfermedades profesionales. Abogada en Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "Las aseguradoras de riesgos del trabajo (ART) tienen que cubrir los accidentes que ocurren en el trabajo o en el trayecto entre la casa y el trabajo, y las enfermedades profesionales. Esa cobertura incluye la atención médica y, si queda una incapacidad, una indemnización.",
      "El trámite pasa primero por las comisiones médicas, que determinan si hay incapacidad y en qué porcentaje. Si lo que resuelven no refleja la lesión, se puede recurrir.",
    ],
    etapas: [
      "Denuncia del accidente o de la enfermedad ante la ART.",
      "Atención médica hasta el alta.",
      "Trámite ante la comisión médica para determinar la incapacidad.",
      "Si no hay conformidad con lo resuelto, recurso ante la justicia.",
    ],
    documentacion: [
      "Número de siniestro y datos de la ART.",
      "Estudios, certificados y constancias médicas.",
      "Recibos de sueldo.",
      "La constancia de alta médica, si ya te la dieron.",
    ],
  },

  "accidentes-de-transito": {
    tituloSeo: "Abogada de accidentes de tránsito",
    descripcionSeo:
      "Reclamos por daños y lesiones en accidentes de tránsito: aseguradora, mediación y juicio. Abogada en Cañuelas, Provincia de Buenos Aires y CABA.",
    intro: [
      "Quien sufre un accidente de tránsito —como conductor, acompañante, ciclista o peatón— puede reclamar por los daños: el arreglo del vehículo, los gastos médicos, los días sin trabajar y las lesiones.",
      "El reclamo se dirige al responsable y a su aseguradora. Antes de un juicio hay una instancia obligatoria de mediación, en la que las partes pueden llegar a un acuerdo.",
    ],
    etapas: [
      "Reunión de pruebas: denuncia, fotos, testigos, presupuestos y constancias médicas.",
      "Reclamo ante la aseguradora.",
      "Mediación previa obligatoria.",
      "Juicio por daños y perjuicios, si no hay acuerdo.",
    ],
    documentacion: [
      "Denuncia ante tu aseguradora o la policía, si la hiciste.",
      "Datos del otro vehículo: patente, aseguradora y número de póliza.",
      "Fotos del lugar y de los daños.",
      "Constancias médicas y presupuestos de reparación.",
    ],
  },

  penal: {
    tituloSeo: "Abogada penalista",
    descripcionSeo:
      "Asesoramiento y defensa en causas penales: qué hacer si te citan, si te detienen o si fuiste víctima de un delito. Abogada en Cañuelas, Buenos Aires.",
    intro: [
      "El derecho penal interviene cuando hay un delito. Se puede necesitar una abogada por estar acusado, para ejercer la defensa, o por haber sido víctima, para participar del proceso como particular damnificado o querellante.",
      "En una causa penal lo que se declara desde el principio importa. Si te citan o te detienen, tenés derecho a contar con un abogado antes de declarar.",
    ],
    etapas: [
      "Consulta y análisis de la situación.",
      "Acceso a la causa en la fiscalía o el juzgado.",
      "Investigación penal preparatoria, a cargo del fiscal.",
      "Juicio, si la causa llega a esa instancia.",
    ],
    documentacion: [
      "Citación, notificación o cualquier papel de la causa.",
      "Número de causa, fiscalía o comisaría, si lo sabés.",
      "Copia de la denuncia, si sos la víctima.",
    ],
  },

  "amparos-de-salud": {
    tituloSeo: "Abogada de amparos de salud",
    descripcionSeo:
      "Amparos contra obras sociales y prepagas que niegan o demoran medicamentos, cirugías o tratamientos. Abogada en Cañuelas, Prov. de Buenos Aires y CABA.",
    intro: [
      "Cuando una obra social o una prepaga niega o demora una prestación —un medicamento, una cirugía, un tratamiento, una internación—, se le puede pedir a un juez que ordene la cobertura mediante una acción de amparo.",
      "Es una vía rápida, pensada para los casos en que esperar un juicio común pondría en riesgo la salud. Si hay urgencia, se puede pedir una medida cautelar para que la cobertura empiece mientras se tramita el amparo.",
    ],
    etapas: [
      "Pedido formal de la prestación a la obra social o prepaga, con la indicación médica.",
      "Intimación, si la niegan o no responden.",
      "Presentación del amparo y, si hay urgencia, de una medida cautelar.",
      "Sentencia y control de que se cumpla.",
    ],
    documentacion: [
      "Credencial de la obra social o prepaga.",
      "Indicación del médico tratante y resumen de historia clínica.",
      "Negativas o respuestas por escrito, mails o constancias del reclamo.",
    ],
  },
};
