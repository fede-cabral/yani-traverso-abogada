# Pendientes

Lo que falta para publicar el sitio de la Dra. Yanina Traverso, ordenado por
**quién lo destraba**. Es la única lista: si algo se resuelve, se tacha acá.

Última revisión: 03/10/2026.

---

## Cómo queda repartido

- **La Dra. es la dueña.** Las cuentas de Vercel y Supabase y el dominio se
  crean a su nombre, con su mail y su tarjeta. Si mañana deja de trabajar con
  federico, el sitio sigue siendo de ella sin pedirle nada a nadie.
- **federico mantiene.** Entra como miembro invitado en cada cuenta, nunca
  con la contraseña de ella. Cada uno tiene su usuario y su contraseña.
- **El código** vive en el GitHub de federico
  (`fede-cabral/yani-traverso-abogada`). Qué pasa con el código si la
  relación termina se deja escrito en el acuerdo (sección 1).

### Costos aproximados (a confirmar al contratar, precios de octubre 2026)

| Servicio | Plan | Costo | Por qué ese plan |
|---|---|---|---|
| Vercel | Pro | USD 20/mes por cada persona que publica | El plan gratis (Hobby) **prohíbe el uso comercial**, y un estudio jurídico lo es. |
| Supabase | Pro (recomendado) | USD 25/mes | El plan gratis **pausa la base tras 7 días sin uso** (los turnos dejarían de andar) y **no tiene copias de seguridad**. |
| Supabase | Gratis (alternativa) | USD 0 | Solo si se acepta el riesgo de arriba y se hace una copia manual todos los meses. |
| Dominio `.com.ar` | NIC Argentina | Arancel anual | Lo paga y lo renueva ella. |

> **A definir en Vercel:** si la cuenta es de ella y federico publica, pueden
> ser dos asientos (USD 40/mes). Ver al crear el equipo si ella puede quedar
> con el asiento de facturación (gratis, solo lectura) y federico con el de
> desarrollo.

---

## 1. Entre los dos (antes de arrancar)

- [ ] **Acuerdo por escrito**, corto. Que diga:
  - Precio del sitio y qué incluye.
  - Mantenimiento: qué cubre (actualizaciones de seguridad, cambios de texto,
    arreglos), cuánto cuesta por mes y en cuánto tiempo responde federico.
  - Que las cuentas y el dominio son de ella, y que ella paga los servicios.
  - Qué pasa con el código si dejan de trabajar juntos.
  - **Confidencialidad**: federico va a poder ver los pedidos de turno y las
    consultas, que son datos de los clientes de ella. Se compromete a no
    mirarlos salvo para arreglar algo y a no copiarlos fuera del sistema. Para
    la Ley 25.326, ella es la responsable de la base y él el encargado del
    tratamiento.
- [ ] **Decidir Supabase gratis o Pro** (tabla de arriba).
- [ ] **Decidir qué mail recibe los avisos de turnos** cuando se agreguen
      (sección 5).

## 2. La Dra. — datos y textos

Sin esto el sitio funciona en demostración, pero no se puede publicar.

- [x] **Localidad de "San Martín 328".** Cañuelas, Provincia de Buenos Aires
      (01/10/2026).
- [ ] **Código postal del estudio.** Hoy va vacío en los datos para Google
      (`src/lib/negocio.ts` → `direccion.codigoPostal`).
- [x] **Biografía de "Sobre mí"** (07/10/2026). La pasó ella: Universidad
      Católica de La Plata, escribana, asesora a inmobiliarias y particulares.
      Se sacó "orientada a resultados" (riesgo de publicidad profesional).
      Está en `src/lib/biografia.ts`.
- [x] **Imagen de "Sobre mí" en buena resolución** (07/10/2026, 708×2000). Era un recorte de
      301×850 de una captura: en escritorio se ve borrosa. Va en
      `public/marca/sobre-mi-escena.webp`.
- [ ] **Revisar los textos de las diez áreas** (`src/lib/areas.ts`). Hoy cada
      una tiene una línea genérica. Si quiere detallar qué hace en cada una,
      que lo escriba ella.
- [ ] **Aprobar el lema de la portada**: "Vas a tener acompañamiento en todo
      el proceso." Es una promesa de trato, no de resultado, pero va en su
      nombre. Está en `negocio.ts` → `lema`.
- [ ] **Confirmar el modo de turnos**: pedido por día y franja (mañana o
      tarde), que ella confirma por teléfono.
- [ ] **Foto profesional** para "Sobre mí". Hoy va el logo.
- [x] **LinkedIn**: cargado el 01/10/2026.
- [ ] **Instagram**, cuando exista.
- [ ] **Revisar y aprobar el aviso legal y la política de privacidad.** Hoy son
      borradores y lo dicen en pantalla con un cartel. Se reescribieron el
      05/10/2026 con lo que exige la Ley 25.326 (finalidad, datos
      obligatorios, transferencia internacional, plazos de respuesta,
      retención). Puntos que tiene que confirmar ella en particular:
  - Que los datos se guarden en Brasil (Supabase) y se procesen en EE.UU.
    (Vercel), con el consentimiento de la casilla como base de la
    transferencia internacional.
  - La frase sobre el secreto profesional (aviso legal, punto 5).
  - La mención "Sitio desarrollado con asistencia de inteligencia
    artificial" en el pie y en el aviso legal (punto 9). La pidió federico.
  - Si quiere fijar una jurisdicción en el aviso legal (hoy solo dice "leyes
    de la República Argentina").
- [ ] **Revisar que el sitio cumpla las normas de publicidad de su colegio.**

## 3. La Dra. — cuentas (a su nombre)

Cada paso le lleva unos minutos. Conviene hacerlos con federico al lado (o
en videollamada) la primera vez.

- [ ] **Vercel**: crear cuenta en [vercel.com](https://vercel.com) con su
      mail, pasar a plan **Pro**, cargar su tarjeta e **invitar a federico**
      al equipo.
- [ ] **Supabase**: crear cuenta en [supabase.com](https://supabase.com) con
      su mail, crear una organización, elegir plan (sección 1) e **invitar a
      federico** a la organización.
- [ ] **Segundo factor (2FA)** activado en Vercel y en Supabase.
- [ ] **Dominio** en [nic.ar](https://nic.ar):
  1. Necesita CUIT/CUIL y Clave Fiscal nivel 3.
  2. En la web de ARCA (ex AFIP), adherir los servicios "NIC Argentina -
     Administración de dominios" y "Trámites a Distancia".
  3. Registrar el dominio a su nombre y pagarlo.
  4. Para que federico pueda apuntarlo a Vercel: o lo **delega** a federico
     como representante (Administrador de Relaciones de Clave Fiscal), o
     carga ella los datos de DNS que él le pase.
- [ ] **Google Search Console** (opcional, gratis): crear la propiedad con su
      cuenta de Google y agregar a federico como usuario.
- [ ] **Inscribir la base de datos** ante la Agencia de Acceso a la
      Información Pública (Ley 25.326). Ella es la responsable; que lo
      confirme como abogada.

## 4. federico — para publicar

En orden. Cada paso necesita que el anterior esté hecho.

- [x] ~~**Limpiar las migraciones** antes de aplicarlas.~~ Hecho el
      05/10/2026: son tres (`0001` a `0003`), sin las tablas de la tienda.
- [ ] **Supabase — proyecto de producción** en la organización de ella,
      región São Paulo:
  1. Correr las migraciones en orden en el **SQL Editor**.
  2. Correr la consulta de verificación de RLS del `README.md`: tiene que
     dar cero filas.
  3. Crear el usuario administrador de ella y el tuyo (`README.md` → "El
     primer administrador"). Cada uno con su mail.
- [ ] **Supabase — proyecto de pruebas** (separado) y `.env.test`. Con eso
      corren los tests de autorización. **Nunca** contra producción: escriben
      y borran datos.
- [ ] **Vercel**: transferir el proyecto `yani-traverso-abogada` desde tu
      equipo (`fedcode2`) al equipo de ella (*Settings → Transfer*), o crearlo
      de nuevo ahí conectado al mismo repo.
- [ ] **Variables en Vercel**: las de `.env.local` de producción, **sacar
      `NEXT_PUBLIC_DEMO`**, y `NEXT_PUBLIC_SITE_URL` con el dominio real.
- [ ] **Conectar el dominio** en Vercel (*Settings → Domains*) y cargar los
      DNS en nic.ar (o pasárselos a ella).
- [ ] **Sacar los carteles de "borrador"** del aviso legal y la privacidad,
      cuando ella los apruebe.
- [ ] **Prueba completa en producción**, desde el celular: pedir un turno,
      mandar una consulta, entrar al panel con el usuario de ella, cambiarle
      el estado, salir.
- [ ] **Enviar el sitemap** en Search Console.
- [ ] **Enseñarle el panel** a ella (15 minutos) y dejarle una hoja corta:
      cómo entrar, ver turnos, marcar consultas, qué hacer si olvida la
      contraseña.
- [ ] **Repo público**: decidir si sacás `PENDIENTES.md` y `CLAUDE.md`, que
      tienen notas internas.

## 5. Técnico

Lo hace Claude cuando digas. Ordenado por importancia.

- [x] ~~**Probar las migraciones contra un Postgres real.**~~ Hecho el
      05/10/2026 sobre PGlite: 31 comprobaciones en verde (RLS, permisos,
      restricciones, primer admin, límite de peticiones y borrado).
- [ ] **Repetir esa prueba en Supabase** al crear el proyecto, y comprobar
      que el borrado quedó programado: `select jobname from cron.job;` tiene
      que mostrar `borrar-vencidos`.
- [ ] **Correr los tests de autorización** (`tests/authz/`) contra la base de
      pruebas. Hasta entonces, que un anónimo no puede leer turnos está
      escrito en las políticas pero no demostrado.
- [ ] **Antes de publicar:** los agentes `auditor-seguridad` y
      `revisor-codigo` sobre todo el proyecto, y revisar monitoreo y copias de
      seguridad (secciones 13 y 14 de `docs/02-anexo-seguridad.md`).
- [ ] **Aviso por mail a la Dra.** cuando entra un turno o una consulta. Hoy
      tiene que entrar al panel para enterarse. Necesita un servicio de envío
      de mails (dependencia nueva): se decide con vos.
- [x] ~~**Borrado automático a los 24 meses**~~. Hecho el 05/10/2026:
      migración `0004_retencion.sql`, probada.
- [x] ~~**Casilla de consentimiento** en los formularios~~ (Ley 25.326,
      art. 5). Hecho el 05/10/2026, validada en el servidor.
- [ ] **Segundo factor de autenticación** para el panel.
- [ ] **CAPTCHA** (Cloudflare Turnstile) en los formularios. Es contenido de
      un tercero: hay que tocar la CSP y la política de privacidad.
- [ ] **Una página por área de práctica**, cuando la Dra. escriba el detalle.
- [x] ~~**Marcar consultas como respondidas** desde el panel.~~ Hecho el
      01/10/2026. Falta probarlo contra la base real.

## 6. federico — mantenimiento (después de publicar)

- [ ] **Cada mes**: `npm run audit:sec`, actualizar dependencias con
      parches de seguridad, `typecheck` + `build` + `test`, y publicar.
- [ ] **Cada mes, si Supabase es gratis**: descargar una copia de la base
      (el plan gratis no tiene copias automáticas).
- [ ] **Cada mes**: entrar al sitio desde el celular y pedir un turno de
      prueba (borrarlo después desde el panel).
- [ ] **Cada año**: recordarle a ella la renovación del dominio antes del
      vencimiento.
- [ ] **Cuando ella pida cambios de texto**: hacerlos, mostrarle la captura,
      publicar.
