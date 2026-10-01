# Dra. Yanina Traverso — sitio del estudio

Sitio de una abogada: áreas de práctica, pedido de turnos y contacto, con un
panel privado donde ella ve los turnos y las consultas.

**Matrícula:** T° LXX F° 338, Colegio de Abogados de La Plata · **Zona:**
Provincia de Buenos Aires y CABA · **Horario:** lunes a viernes, 10 a 13 y 15 a 18

**Stack:** Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS v4 · Supabase (Postgres + Auth + RLS) · Vercel

**Qué hace y qué no:** recibe pedidos de turno y consultas. No cobra, no tiene
cuentas de clientes y no guarda documentación de casos. Lo que falta para
publicarlo está en [`PENDIENTES.md`](PENDIENTES.md).

---

## Arranque local

```bash
npm ci                      # ci, no install: respeta el lockfile
cp .env.example .env.local  # completar con los valores reales
npm run dev                 # http://localhost:3000
```

**Si falta una variable de entorno, la aplicación no arranca, a propósito.** El error dice cuál falta. Es un fallo temprano y ruidoso, no un bug.

> El proyecto vive en `C:\Users\GHouse\proyectos\yanina-traverso`, **fuera de OneDrive** y a propósito: `node_modules` tiene decenas de miles de archivos y la sincronización lo vuelve lentísimo además de corromper builds. No lo muevas a una carpeta sincronizada.

### Modo demostración

Para mostrarle el sitio a la Dra. **sin tener Supabase configurado**:

```bash
npm run demo        # http://localhost:3000
```

No hace falta `.env.local` ni base de datos. El panel se abre en `/admin` **sin login**, como administrador, con tres turnos y dos consultas de personas inventadas.

Un cartel ámbar arriba de todo avisa que es una demostración, y **los formularios y el panel no guardan nada**: lo dicen con todas las letras en vez de fingir que guardaron. Un pedido de turno que parece haber llegado y no llegó es la peor falla posible de este sitio.

El modo se activa solo con `NEXT_PUBLIC_DEMO=1`. Sin esa variable, la aplicación exige la configuración real y no arranca sin ella.

### Variables de entorno

| Variable | Dónde vive | Cuidado |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Pública. **Lo único que la contiene es RLS** |
| `NEXT_PUBLIC_SITE_URL` | Cliente y servidor | Pública. Sin barra final |
| `NEXT_PUBLIC_WHATSAPP` | Cliente y servidor | Pública. Solo dígitos, formato internacional |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor** | 🔴 Saltea RLS. Llave maestra de la base |
| `NEXT_PUBLIC_DEMO` | Cliente y servidor | `1` activa el modo demostración. Por defecto `0` |

Todo lo que lleva prefijo `NEXT_PUBLIC_` **viaja al navegador y es visible para cualquiera**. No hay excepción, no hay truco, no sirve que esté minificado.

---

## Qué tiene el sitio

| Ruta | Qué es |
|---|---|
| `/` | Portada: quién es, especialidad, áreas, presentación y cómo pedir turno |
| `/areas` | Las diez áreas de práctica |
| `/sobre-mi` | Presentación de la Dra. y datos de matrícula |
| `/turnos` | Formulario de pedido de turno |
| `/contacto` | WhatsApp, mail, dirección y formulario de consulta |
| `/aviso-legal`, `/politica-de-privacidad` | Textos legales (borradores, los aprueba ella) |
| `/admin` | Panel: resumen, turnos y consultas |
| `/ingresar` | Login del panel |

**Los datos del estudio** están en un solo archivo, `src/lib/negocio.ts`. Lo que la Dra. no confirmó está en `null` y el sitio lo omite: sin localidad no hay enlace al mapa ni dirección en los datos para Google.

**Las áreas de práctica** están en `src/lib/areas.ts`, como contenido fijo. No son una tabla porque son diez y cambian una vez por año: un panel para editarlas sería más código que mantener que las áreas mismas.

**La presentación** está en `src/lib/biografia.ts`. Es su texto, apenas ordenado.

---

## Turnos

Un turno es un **pedido**, no una reserva. La persona elige un día y si prefiere la mañana o la tarde; la Dra. la llama y acuerdan la hora. No hay agenda de horarios libres, a propósito: exigiría que ella mantenga su disponibilidad cargada al día, y una agenda desactualizada da turnos que no existen.

Reglas (en `src/lib/turnos.ts`, probadas en `tests/unitarios/`):

- De lunes a viernes. La base lo repite con la restricción `turnos_dia_habil`: un sábado no entra ni salteando la aplicación.
- Desde mañana y hasta 60 días. "Mañana" es el mañana de Buenos Aires, no el del servidor, que corre en UTC.
- Teléfono obligatorio: sin él nadie puede confirmar el turno.
- Como mucho 3 pedidos por hora desde una misma conexión.

Estados: `pendiente` → `confirmado` → `atendido`, o `cancelado`. El público solo puede crear turnos pendientes; lo impone la política RLS `turnos_insert_publico`, no el formulario.

---

## Base de datos

Las migraciones están en `supabase/migrations/`, en orden. Se aplican desde el SQL Editor de Supabase, de la `0001` a la `0010`, o con `supabase db push`.

| Archivo | Qué hace |
|---|---|
| `0001_schema.sql` | Tablas, tipos, restricciones y auditoría. Incluye `consultas`, `perfiles` y `log_auditoria` |
| `0002_rls.sql` | Row Level Security: políticas por tabla y por operación |
| `0003_seed.sql` | Vacío. En la plantilla cargaba el catálogo |
| `0004_rate_limit.sql` | Contador de peticiones y su función atómica |
| `0005_verificacion.sql` | Función `tablas_sin_rls()` para el test automatizado |
| `0006` a `0008` | Columnas y tablas del catálogo de la plantilla. Sin uso acá |
| `0009_primer_admin.sql` | Permite crear el primer administrador desde el SQL Editor |
| `0010_turnos.sql` | **Tabla `turnos`**, con RLS forzada y sus restricciones |

**Sobre las tablas de catálogo.** Este proyecto salió de una plantilla de tienda. Las migraciones `0001` a `0008` crean tablas de productos, categorías y promociones que este sitio no usa. Quedan creadas y vacías: las políticas y funciones de seguridad de esas mismas migraciones las referencian, y reescribir migraciones ya probadas para ahorrar cinco tablas vacías era cambiar un riesgo real por prolijidad. RLS las protege igual que al resto.

### Verificación obligatoria después de cada migración

```sql
select c.relname as tabla_sin_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
```

**Tiene que devolver cero filas.** Una tabla sin RLS, con la clave anónima publicada, es literalmente una base de datos abierta a internet. `npm test` corre la misma comprobación.

---

## Seguridad y confidencialidad

Lo que guarda este sitio es quién consultó a una abogada y por qué tema. Eso se trata como confidencial en cada capa:

- **Nadie del público lee turnos ni consultas**, ni los propios. Solo un administrador, por política RLS.
- **El contenido nunca se loguea.** Ante un fallo va al log el error de la base, no lo que escribió la persona. En la auditoría queda quién cambió el estado de qué turno, sin nombre ni motivo.
- **Los formularios piden lo mínimo** y avisan que no se cargue el detalle del caso ni datos de terceros.
- **Ningún tercero en el sitio público.** Sin analítica, sin píxeles, sin mapas embebidos. Las fuentes las descarga Next al compilar y se sirven desde el mismo dominio: el navegador de quien visita no le pide nada a Google.
- **CSP estricta con nonce**, sin `unsafe-inline`. Por eso todas las páginas se renderizan por request (`ƒ` en el build) y no hay estilos en línea.
- **Límite de peticiones en la base**, no en memoria, y falla cerrado: si la base no responde, se deniega.
- **Trampa para bots** (campo oculto) en los dos formularios.

Las dos excepciones a "nada de `dangerouslySetInnerHTML`": el script de tema del layout raíz, que lleva nonce, y el JSON-LD de la portada, que escapa `<`.

## Panel de administración

`/admin`, protegido en tres capas:

1. **Middleware** — bloquea la ruta y añade `Cache-Control: no-store`.
2. **Layout y páginas** — `exigirStaff()` en el layout, `exigirAdmin()` en turnos y consultas.
3. **Cada Server Action** — vuelve a exigir el rol por su cuenta.

La tercera es la que importa: una Server Action es un endpoint y se puede invocar sin pasar por ninguna página. Y debajo de las tres está RLS: el panel lee con el cliente del usuario, no con la llave maestra.

Sin sesión, `/admin` redirige a `/ingresar`. Con sesión de rol insuficiente devuelve **404**, no 403: no le confirmamos a nadie que el panel existe.

### El primer administrador

Un usuario recién registrado nace siempre como `cliente`, y el trigger `proteger_rol` impide que nadie se ascienda solo. Procedimiento, una sola vez:

1. **Authentication → Users → Add user**: correo y contraseña de la Dra., con "Auto Confirm User" activado.
2. **SQL Editor**:
   ```sql
   update public.perfiles
      set rol = 'admin'
    where id = (select id from auth.users where email = 'el-correo-de-la-dra@ejemplo.com');
   ```
3. Entrar en `/ingresar` con ese correo.

### Login

Mensaje de error idéntico exista o no la cuenta (sin enumeración de usuarios), límite de 5 intentos cada 15 minutos por IP, y auditoría de cada intento fallido. La sesión se verifica con `getUser()`, que valida el token contra el servidor de auth — nunca con `getSession()`, que solo lee la cookie.

---

## Diseño

Negro y dorado, tomados del logo. Serif (Cormorant Garamond) para títulos y nombre, sans (Manrope) para leer.

- **Tokens** en `src/app/globals.css`. Ningún color se escribe a mano en un componente.
- **Un solo tema, oscuro** (desde el 01/10/2026, a pedido): negro, beige oscuro y dorado. La escala `tinta` es beige, no gris; no hay versión clara.
- **La franja de marca** (`.franja-marca`) es el negro exacto del logo, el punto más oscuro de la página. `.franja-arena` es el contrapunto: una franja de beige oscuro para cortar el negro.
- **El logo** está en `public/marca/`: el original y dos versiones WebP. Si cambia, hay que regenerarlas.
- **Movimiento**: transición entre páginas y aparición de las secciones al hacer scroll, todo en CSS y todo apagado para quien pidió menos movimiento.

---

## Tests

**Dos grupos.** `tests/unitarios/` prueba las reglas —fechas, días hábiles, zona horaria, validación de formularios— y corre siempre, sin configurar nada.

`tests/authz/` prueba la autorización contra una base real. **Verifican lo que NO se puede hacer**: que un anónimo no lea turnos, que nadie inserte un turno ya confirmado, que un editor no vea datos personales. Si alguna vez hay que borrar tests por tiempo, estos no se tocan.

Para correrlos, creá un `.env.test` en la raíz apuntando a un proyecto de Supabase de **desarrollo**:

```bash
# ⚠️ PRUEBAS DE AUTORIZACIÓN — ESCRIBEN EN LA BASE.
# Apuntá esto a un proyecto de DESARROLLO, nunca a producción.
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO-DEV.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Freno de seguridad: si esto no dice localhost o staging, las pruebas abortan.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sin `.env.test` las pruebas **se saltan con un aviso** en vez de fallar. Hasta que no corran contra una base real, la autorización está escrita pero no demostrada.

---

## Documentación

| Archivo | Qué es |
|---|---|
| `CLAUDE.md` | Reglas del proyecto para trabajar con Claude |
| `PENDIENTES.md` | Lo que falta, ordenado por quién lo destraba |
| `docs/proyecto/brief.md` | Quién es la clienta y qué tono lleva el sitio |
| `docs/02-anexo-seguridad.md` | Anexo de seguridad, genérico de la plantilla |
| `docs/01-…` y `docs/04-…` | Guías genéricas de la plantilla. Hablan de una tienda; valen como referencia de método, no de contenido |
