# Pendientes

Lo que falta para publicar el sitio de la Dra. Yanina Traverso, ordenado por
**quién lo destraba**. Es la única lista: si algo se resuelve, se tacha acá.

Última revisión: 01/10/2026.

---

## 1. La Dra. (datos que solo ella tiene)

Sin esto el sitio funciona en demostración, pero no se puede publicar.

- [x] **Localidad de "San Martín 328".** Cañuelas, Provincia de Buenos Aires
      (pasado el 01/10/2026). Ya figura en el sitio con enlace al mapa.
- [ ] **Código postal del estudio.** No lo pasó; hoy va vacío en los datos
      para Google (`src/lib/negocio.ts` → `direccion.codigoPostal`).
- [ ] **Confirmar la frase "Actualmente asesoro a inmobiliarias".** En lo que
      mandó decía "acceso a inmobiliarias"; se interpretó como "asesoro". Está
      en `src/lib/biografia.ts`.
- [ ] **Revisar los textos de las diez áreas** (`src/lib/areas.ts`). Hoy cada
      una tiene una línea que describe la rama del derecho, sin enumerar
      servicios. Si quiere detallar qué hace en cada una, que lo escriba ella.
- [ ] **Revisar y aprobar el aviso legal y la política de privacidad.** Son
      borradores y lo dicen en pantalla con un cartel. Cuando los apruebe, se
      saca el cartel de las dos páginas.
- [ ] **Confirmar que el horario y el modo de turnos son los que quiere**:
      pedido por día y franja (mañana o tarde), que ella confirma por teléfono.
- [ ] **Foto profesional**, para "Sobre mí". Hoy va el logo en su lugar.
- [x] **LinkedIn**: cargado el 01/10/2026.
- [ ] **Instagram**, cuando exista. Se carga en `negocio.ts` y aparece solo.
- [ ] **Revisar que el sitio cumpla las normas de publicidad de su colegio.**
      Se evitó a propósito toda promesa de resultado, pero la que sabe es ella.

## 2. Vos, ahora

- [ ] **Correr el script de arranque.** Crea Git con el proyecto como primer
      commit y copia los agentes a `.claude\`. En PowerShell, dentro de la
      carpeta del proyecto:
      ```powershell
      powershell -ExecutionPolicy Bypass -File .\INICIAR.ps1
      ```
- [ ] **Mirar el sitio** con `npm run demo` y decir qué cambiar del diseño.

## 3. Vos, para publicar

Estos pasos necesitan tus cuentas, por eso no los puede hacer Claude.

- [ ] **Supabase** (la base de datos, tiene plan gratis):
  1. Crear un proyecto en [supabase.com](https://supabase.com), región São Paulo.
  2. En **SQL Editor**, correr las migraciones de `supabase/migrations/` en
     orden, de la `0001` a la `0010`.
  3. Correr la consulta de verificación de RLS del `README.md`: tiene que dar
     cero filas.
  4. Crear el usuario administrador de la Dra. (`README.md` → "El primer
     administrador").
  5. Crear `.env.local` a partir de `.env.example`.
- [ ] **Un segundo proyecto de Supabase para pruebas**, con un `.env.test`.
      Con eso corren los tests de autorización, que hoy se saltean. **Nunca**
      contra el proyecto de producción: escriben y borran datos.
- [ ] **GitHub** (repositorio **privado**) y **Vercel**, con las mismas
      variables de `.env.local`.
- [ ] **Dominio**: un `.com.ar` en [nic.ar](https://nic.ar), conectado en Vercel.
- [ ] **Inscribir la base de datos** ante la Agencia de Acceso a la
      Información Pública (Ley 25.326). Que lo confirme la Dra.

## 4. Técnico

Lo hace Claude cuando digas. Ordenado por importancia.

- [ ] **Probar `0010_turnos.sql` contra un Postgres real.** Está escrita y
      revisada, pero todavía no se ejecutó en ninguna base: es lo primero que
      hay que hacer al crear el proyecto de Supabase. Las migraciones `0001` a
      `0009` vienen probadas de la plantilla.
- [ ] **Correr los tests de autorización** (`tests/authz/`) contra la base de
      pruebas. Hasta entonces, que un anónimo no puede leer turnos está
      escrito en las políticas pero no demostrado.
- [ ] **Aviso por mail a la Dra.** cuando entra un turno o una consulta. Hoy
      tiene que entrar al panel para enterarse. Necesita un servicio de envío
      de mails, que es una dependencia nueva: se decide con vos.
- [x] ~~**Marcar consultas como respondidas** desde el panel.~~ Hecho el
      01/10/2026: cada consulta tiene su estado (sin responder, en curso,
      respondida, cerrada, descartada) y las que esperan respuesta van arriba.
      Falta probarlo contra la base real, junto con los tests de autorización.
- [ ] **Borrado automático a los 24 meses** de turnos y consultas, que es lo
      que promete la política de privacidad. Hoy no hay nada que lo haga.
- [ ] **Segundo factor de autenticación** para el panel. Hoy entra con mail y
      contraseña.
- [ ] **CAPTCHA** (Cloudflare Turnstile) en los formularios. Hoy tienen trampa
      para bots y límite de envíos, que alcanza para empezar. Ojo: es contenido
      de un tercero, hay que tocar la CSP y la política de privacidad.
- [ ] **Una página por área de práctica**, cuando la Dra. escriba el detalle
      de cada una. Hoy están todas en `/areas`.
- [ ] **Antes de publicar:** los agentes `auditor-seguridad` y
      `revisor-codigo` sobre todo el proyecto, y revisar monitoreo y copias de
      seguridad (secciones 13 y 14 de `docs/02-anexo-seguridad.md`).
