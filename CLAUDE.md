# CLAUDE.md

Instrucciones para cualquier sesión de Claude que trabaje en este repositorio.
Se lee al arrancar. Si algo de acá contradice lo que parece razonable en el
momento, gana lo de acá: está escrito por algo que ya pasó.

@AGENTS.md

---

## Este proyecto

**Dra. Yanina Traverso** — abogada (matrícula T° LXX F° 338, Colegio de
Abogados de La Plata). Asesoría jurídica integral, especialista en derecho
inmobiliario y notarial. Atiende en Provincia de Buenos Aires y CABA, de lunes
a viernes de 10 a 13 y de 15 a 18.

El sitio hace tres cosas: presenta las áreas de práctica, recibe **pedidos de
turno** y recibe consultas. No vende nada y no cobra online. Datos del estudio
en `src/lib/negocio.ts`.

Hay dos riesgos concretos, y los dos son de la profesión, no del código:

- **Confidencialidad.** Que alguien pidió turno por un tema penal o de familia
  ya es información sensible. Turnos y consultas solo los lee un administrador
  (lo garantiza RLS en la base, regla 9), y su contenido nunca va a un log.
- **Publicidad profesional.** Un abogado matriculado no puede prometer
  resultados ni atribuirse lo que no tiene. Todo texto sobre la Dra. sale de lo
  que ella dijo (regla 10).

> Este proyecto nació de la plantilla de catálogo (Indumentaria Max). Se le
> sacó todo lo de tienda — productos, precios, stock, ofertas, promociones —
> y se le agregó turnos. Las migraciones se reescribieron sin las tablas de
> catálogo antes de aplicarse por primera vez (ver `README.md` → "Base de
> datos").

---

## Comandos

```bash
npm run demo          # sitio completo con datos de ejemplo, sin base de datos
npm run dev           # desarrollo contra Supabase (necesita .env.local)
npm run build         # build de producción — tiene que pasar antes de cerrar algo
npm run demo:build    # lo mismo, sin .env.local
npm run typecheck     # tsc --noEmit
npm test              # unitarios siempre; autorización solo con .env.test
npm run audit:sec     # npm audit, falla con vulnerabilidades altas
```

**Antes de dar cualquier tarea por terminada:** `npm run typecheck`, `npm run
build` y `npm test` en verde. Si tocaste algo visible, levantalo con `npm run
demo` y miralo en pantalla (el sitio tiene un solo tema, oscuro). Un cambio que compila
pero no se probó en pantalla no está terminado.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript estricto con
`noUncheckedIndexedAccess` · Tailwind CSS v4 (configuración en CSS, `@theme`) ·
Supabase (Postgres + Auth + RLS) · Zod v4 · Vitest · Vercel.

**Next 16 no es el Next que conocés.** Diferencias que ya mordieron:

- Los error boundaries reciben `retry()`, no `reset()`.
- `params` y `searchParams` son Promises: `const { slug } = await params`.
- `next.config.ts` ya no acepta la clave `eslint`.
- Invalidar caché de datos desde una Server Action: `updateTag(...)`, no
  `revalidateTag`. (Hoy el sitio no cachea consultas; el panel usa
  `revalidatePath`.)
- Ante la duda, leer `node_modules/next/dist/docs/` antes de escribir código.

Zod v4: `z.uuid()`, `z.email()`, `z.url()` son de primer nivel, y los mensajes
van en `{ error: "…" }`, no en `{ message: "…" }`.

React 19 vacía el formulario al terminar una Server Action. Por eso las
acciones devuelven `valores` cuando fallan y los formularios los usan como
`defaultValue`. Un `<select>` además necesita `key` para releerlo.

---

## Arquitectura en diez líneas

1. `src/app/(sitio)/` es el sitio público; `src/app/(panel)/` es el panel. Los
   paréntesis agrupan layouts y no aparecen en la URL.
2. `src/acciones/` tiene todas las Server Actions. Las del panel:
   `exigirAdmin()` primero, después validación Zod, después la base.
3. `src/lib/validations/formularios.ts` es la **única** puerta de entrada de
   datos.
4. `src/lib/datos/admin.ts` elige la fuente una vez: `admin-supabase.ts` o
   `admin-demo.ts` según `NEXT_PUBLIC_DEMO`. **Toda función nueva va en los dos.**
5. Cuatro clientes de Supabase en `src/lib/supabase/`. Solo `admin.ts` saltea
   RLS, y solo puede importarse desde el servidor.
6. La CSP usa nonce por request (`middleware.ts`), lo que obliga a renderizar
   dinámico, y prohíbe estilos en línea: nada de `style={{…}}` ni `next/image`
   (por eso el logo es un `<img>` con su `srcset` a mano, ver `Medallon.tsx`).
7. Las áreas de práctica son contenido fijo (`src/lib/areas.ts`), no una tabla.
   Las reglas de los turnos están en `src/lib/turnos.ts`; fechas siempre en
   hora de Buenos Aires, nunca en la del servidor.
8. Colores como tokens en `globals.css` , tema único oscuro (negro, beige oscuro, dorado). Nada de hex sueltos.
   La franja negra (`.franja-marca`) redeclara los tokens con su valor oscuro:
   si agregás un token semántico, agregalo también ahí.
9. Migraciones en `supabase/migrations/`, numeradas. Nunca se edita una ya
   aplicada: se escribe la siguiente.
10. `README.md` tiene el detalle de cada decisión. Leelo antes de cambiar una.

Ojo con las capas de CSS: las clases de `@layer componentes` le ganan a las
utilidades de Tailwind sobre el mismo elemento. `class="boton hidden"` no
oculta nada. Para eso se envuelve en un contenedor.

---

## Reglas que no se rompen

1. **RLS activada en toda tabla nueva**, en la misma migración que la crea.
   El test `tablas_sin_rls` falla si no.
2. **`service_role` solo en el servidor.** El `import "server-only"` hace fallar
   el build si se filtra al cliente. No lo saques.
3. **Autorización en el servidor, en cada operación, a nivel de registro.**
   Ocultar un botón no es seguridad.
4. **Todo input externo pasa por Zod en el servidor.**
5. **El estado de un turno lo fija el servidor.** El público solo puede crear
   turnos `pendiente` (lo impone la política `turnos_insert_publico`).
6. **Nada que cambie estado por GET.**
7. **`dangerouslySetInnerHTML` prohibido** salvo las dos excepciones
   documentadas en `README.md` (script de tema con nonce, JSON-LD escapado).
8. **Ningún secreto en el repositorio.** Si se escapa uno: rotarlo primero,
   limpiar el historial después.
9. **Turnos y consultas son confidenciales.** Solo los lee un administrador
   (RLS). Su contenido —nombre, teléfono, motivo— nunca va a `console.log`,
   ni al registro de auditoría, ni a un mensaje de error, ni a un servicio de
   terceros. En los logs va el error de la base, no lo que escribió la persona.
10. **Nada sobre la Dra. que ella no haya dicho.** Ni años de trayectoria, ni
    casos, ni títulos, ni servicios dentro de un área. Y ninguna promesa de
    resultado ("ganamos tu caso", "sin costo si no cobrás"): es publicidad
    profesional regulada por su colegio.
11. **Nada de terceros en el sitio público** sin preguntar: ni analítica, ni
    píxeles, ni mapas embebidos, ni fuentes desde un CDN. La política de
    privacidad dice que no hay, y la CSP no los deja cargar.
12. **Los mensajes de error al usuario nunca exponen detalles de Postgres.**

---

## Convenciones

- **Código, comentarios y textos en español rioplatense.** "Pedí", "tenés".
- El sitio habla en plural del estudio ("te contactamos") y en primera persona
  solo en la presentación de la Dra. (`src/lib/biografia.ts`).
- **Los comentarios explican el porqué**, no el qué. Si una decisión tiene un
  costo (rendimiento, legal, UX), el comentario lo nombra.
- Accesibilidad no es opcional: labels en todo input, `sr-only` donde el
  contexto visual no alcanza, nunca `maximumScale` en el viewport, contraste
  mínimo 4,5:1.
- Confirmaciones destructivas con `<details>` en dos pasos, nunca `confirm()`.
- Estados vacíos siempre diseñados: qué pasó y qué hacer ahora.

---

## Lo que NO se hace sin preguntar

- Editar una migración existente o escribir una que borre datos.
- Tocar `middleware.ts` (CSP y guarda de `/admin`), `src/lib/supabase/admin.ts`
  o `src/lib/auth/`.
- Debilitar una política RLS o una restricción `CHECK`.
- Instalar dependencias nuevas. Cada una es superficie de ataque.
- Deploy, push a remoto, o cualquier cosa que llegue a producción.
- Borrar archivos del usuario.
- Datos del estudio (dirección, matrícula, CUIT, textos legales, biografía):
  **nunca inventarlos**. Si faltan, van en `null` y se anotan en `PENDIENTES.md`.

---

## Subagentes del proyecto

En `.claude/agents/` (los copia `INICIAR.ps1` desde `para-claude/`). Usalos
para trabajo acotado y verificable:

| Agente | Para qué | Puede editar |
|---|---|---|
| `auditor-seguridad` | Revisar cambios contra `docs/02-anexo-seguridad.md` | No (lee y corre `npm audit`) |
| `revisor-codigo` | Calidad, accesibilidad y consistencia con estas reglas | No |
| `escritor-tests` | Tests de autorización y de restricciones de la base | Solo `tests/` |
| `seo-contenido` | Metadatos, JSON-LD y textos | Sí, sin inventar datos |

Los que no editan informan; la decisión es tuya. Un buen ciclo para cualquier
cambio grande: hacer el cambio → `revisor-codigo` y `auditor-seguridad` en
paralelo → corregir → `escritor-tests` si hubo tabla o acción nueva.
