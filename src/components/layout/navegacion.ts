/**
 * El menú del sitio, una sola vez. Lo usan el encabezado y el pie: con dos
 * listas separadas, tarde o temprano una tiene un enlace que la otra no.
 */
export const NAVEGACION = [
  { href: "/areas", texto: "Áreas de práctica" },
  { href: "/sobre-mi", texto: "Sobre mí" },
  { href: "/turnos", texto: "Turnos" },
  { href: "/contacto", texto: "Contacto" },
] as const;
