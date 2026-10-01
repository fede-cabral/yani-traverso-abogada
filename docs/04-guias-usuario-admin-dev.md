# GUÍAS PRÁCTICAS — Usuario · Administrador · Desarrollador
### Tres manuales para el mismo sitio · v1.0

> **Para qué sirve este archivo:** cuando el sitio esté construido, estas tres guías son lo que hace que no dependa de vos para siempre. También son un **prompt en sí mismas**: pegale a la IA la sección que corresponda con *"Generá esta guía adaptada al proyecto que construimos, con las rutas, nombres y pantallas reales"* y te devuelve el manual concreto.

---
---

# 👤 GUÍA 1 — USUARIO FINAL (el cliente que compra)

> Esta guía va **publicada en el sitio** (sección "Ayuda" o "Preguntas frecuentes"), no en un archivo. Escrita en segunda persona, sin jerga técnica, respondiendo lo que la gente realmente pregunta.

## Cómo encontrar lo que buscás

- **Buscador** (arriba de todo): escribí el nombre del producto. Funciona aunque tengas un error de tipeo.
- **Categorías** (menú principal): navegá por tipo de producto si no sabés exactamente qué querés.
- **Filtros** (en el listado): acotá por talle, color, marca, precio y disponibilidad. En el celular están en el botón "Filtrar".

## Cómo leer una ficha de producto

- **Las fotos** se amplían al tocarlas. Deslizá para ver más ángulos.
- **La ficha técnica** (tabla) tiene material, medidas, peso y compatibilidades. Si vas a comparar con otro producto, mirá ahí.
- **La guía de talles** está enlazada al lado del selector. **Usala**: los talles varían mucho entre marcas y es la causa principal de cambios.
- **La disponibilidad** dice la verdad:
  - *En stock* — sale hoy o mañana.
  - *Últimas unidades* — quedan pocas.
  - *Sin stock* — dejá tu mail y te avisamos cuando vuelva.

## Cómo comprar

1. Elegí talle y color (si el producto los tiene).
2. "Agregar al carrito" o "Consultar por WhatsApp", según el producto.
3. En el carrito revisá cantidades y el costo de envío antes de avanzar.
4. Completá tus datos. **No hace falta crear una cuenta.**
5. Pagá con el medio que prefieras. El pago se procesa en la plataforma del proveedor: **nosotros nunca vemos ni guardamos los datos de tu tarjeta.**
6. Te llega un mail con el número de pedido. Guardalo.

## Envíos

- Los plazos y costos están en **Envíos y devoluciones**, con valores concretos por zona.
- Cuando el pedido se despacha, te llega el código de seguimiento por mail.
- Si pasó el plazo y no llegó, escribinos con el número de pedido.

## Cambios y devoluciones

- **Tenés 10 días corridos desde que recibís el producto para arrepentirte de la compra**, sin dar explicaciones. Es tu derecho por la Ley 24.240 de Defensa del Consumidor, y el costo de devolución corre por nuestra cuenta.
- Para cambios de talle, escribinos antes de usar el producto y con la etiqueta puesta.
- El **botón de arrepentimiento** está en el pie de página, siempre visible.

## Tu cuenta (si creás una)

- Ves el historial de pedidos y su estado.
- Guardás direcciones para no volver a escribirlas.
- Podés cambiar la contraseña y cerrar todas las sesiones desde "Mi cuenta → Seguridad".
- Podés **pedir una copia de tus datos o eliminar tu cuenta** cuando quieras, desde la misma sección.

## Tu privacidad y tu seguridad

- Guardamos lo mínimo necesario para venderte y enviarte el producto.
- No vendemos ni cedemos tus datos.
- **Nunca te vamos a pedir la contraseña ni los datos de tu tarjeta por WhatsApp, por mail ni por teléfono.** Si alguien lo hace diciendo ser nosotros, no es nuestro.
- Los mails nuestros siempre vienen de `@{{TU_DOMINIO}}`. Revisá el remitente antes de hacer clic.
- Si recibís algo raro, escribinos directamente desde el sitio en lugar de responder ese mensaje.

## Problemas comunes

| Pasa esto | Hacé esto |
|---|---|
| No me llegó el mail de confirmación | Revisá spam. Si no está, escribinos con tu mail y la hora aproximada de la compra. |
| Olvidé la contraseña | "Olvidé mi contraseña" en el login. Llega un enlace que vence en 30 minutos. |
| El pago se rechazó | Probá otro medio. Si te debitaron igual, mandanos el comprobante: se revierte. |
| El talle no me va | Escribinos antes de usarlo, con la etiqueta puesta. |
| La página se ve rara | Actualizá con Ctrl+F5 (o Cmd+Shift+R en Mac). Si sigue, contanos qué navegador usás. |

---
---

# 🛠️ GUÍA 2 — ADMINISTRADOR (el dueño que carga productos y gestiona pedidos)

> Esta guía asume que **no sos técnico**. No necesitás serlo. Pero sí necesitás ser disciplinado con tres cosas: la seguridad de tu cuenta, la verificación del catálogo, y la honestidad del stock.

## 🔐 Antes que nada: tu cuenta es la llave del negocio

Si alguien entra a tu panel, puede cambiar precios, ver los datos de todos tus clientes y publicar lo que quiera en tu nombre. Esto no es paranoia, es la parte más importante de esta guía.

- **Activá el segundo factor (2FA) el primer día.** Sin excepción. Es una app en el celular (Google Authenticator, Authy) que genera un código de 6 dígitos.
- **Contraseña única y larga.** Una frase de 4 palabras que no uses en ningún otro lado. Usá un gestor de contraseñas (Bitwarden es gratis).
- **Nunca compartas tu usuario.** Si entra otra persona al negocio, se le crea su propia cuenta con su propio rol. Así sabés quién hizo qué.
- **Cerrá sesión en computadoras que no son tuyas.**
- **Nadie legítimo te va a pedir tu contraseña.** Ni el desarrollador, ni "soporte", ni nadie.

## Los dos roles del panel

| Rol | Puede | No puede |
|---|---|---|
| **Editor** | Cargar y editar productos, subir fotos, actualizar stock | Cambiar precios publicados, ver datos de clientes, gestionar pedidos, crear usuarios |
| **Admin** | Todo | — |

**Dale a cada persona el rol más bajo que le permita trabajar.** Si el que carga productos no necesita ver los datos de los clientes, no se los des.

## ⚖️ Cargar un producto — el paso que no se saltea

El sistema **no te deja publicar un producto sin clasificarlo legalmente**. No es un capricho del programador: es lo que protege el negocio.

1. **Datos básicos**: nombre, descripción, categoría, marca, SKU.
2. **Clasificación legal** — el campo obligatorio:
   - `No controlado` → se puede publicar.
   - `En revisión` → queda en borrador hasta que se verifique.
   - `Controlado` → **nunca se publica.** El sistema lo bloquea.
   - Anotá **quién verificó y en base a qué** en el campo de nota. Si mañana hay una consulta, esa nota es tu respaldo.
3. **Ante la duda, `En revisión`.** Siempre. Un producto sin publicar no te cuesta nada; un producto mal publicado sí.
4. **Precio y stock.**
5. **Variantes**: cargá cada combinación de talle y color con su propio stock.
6. **Fotos**: mínimo 3, máximo 8. Fondo neutro, producto centrado, misma distancia en todas. Esto define si te compran o no.
7. **Ficha técnica**: material, medidas, peso, capacidad, compatibilidades. Cuanto más completa, menos consultas y menos devoluciones.
8. **SEO**: el sistema genera título y descripción automáticos. Revisalos: que el título tenga el nombre real del producto tal como la gente lo busca.
9. **Vista previa antes de publicar.** Miralo en el celular.

### Cómo escribir una descripción que vende

- Primera línea: qué es y para quién.
- Después: el problema que resuelve, no la lista de características.
- Sé específico con los materiales — este público sabe la diferencia entre Cordura 500D y 1000D, y compra por eso.
- **No exageres.** Si el producto no es impermeable, decí "resistente al agua". Una devolución por descripción engañosa cuesta más que la venta.

## 📦 Gestionar pedidos

**Estados y qué significan:**
`Pendiente de pago` → `Pagado` → `En preparación` → `Despachado` → `Entregado` · y `Cancelado` / `Devuelto`.

**Rutina diaria (15 minutos):**
1. Revisá pedidos nuevos.
2. Confirmá que hay stock real de cada ítem.
3. Preparalos y marcalos "Despachado" **cargando el código de seguimiento** — eso dispara el mail automático al cliente y te ahorra la mitad de las consultas.
4. Respondé las consultas pendientes.

**Reglas que evitan problemas:**
- **El stock del sistema tiene que ser el stock real.** Vender algo que no tenés es la forma más rápida de perder un cliente y ganar una reseña mala.
- **Nunca cambies un precio con pedidos pendientes de pago** de ese producto.
- **Toda cancelación o reembolso lleva una nota** de por qué. Queda en el registro de auditoría.
- **Si un cliente reclama, respondé el mismo día**, aunque sea para decir "lo estoy viendo".

## 📊 Qué mirar cada semana (10 minutos)

- **Productos más vistos que no se venden** → el precio, las fotos o la descripción tienen un problema.
- **Búsquedas sin resultados** → es tu lista de compras: la gente te está diciendo qué quiere y no tenés.
- **Carritos abandonados** → si se abandonan en el paso del envío, el costo de envío es el problema.
- **De dónde viene el tráfico** → dónde conviene poner esfuerzo.
- **Reporte de cumplimiento** → repasá que todo lo publicado siga clasificado como corresponde.

## 🚨 Qué hacer si algo sale mal

| Situación | Acción inmediata |
|---|---|
| Entraron a mi cuenta / veo cosas que no hice | Cambiá la contraseña, cerrá todas las sesiones, avisá al desarrollador **ahora**. No esperes. |
| Publiqué algo que no debía | Despublicalo del panel (queda oculto al instante) y avisá. |
| El sitio está caído | Verificá desde otra red o el celular con datos. Si sigue caído, avisá al desarrollador con la hora exacta. |
| Un cliente dice que le cobraron dos veces | Buscá el pedido, mirá el detalle de pagos, y si hay duplicado reembolsá desde el panel del proveedor de pagos. |
| Recibí un mail raro pidiendo datos o con un archivo adjunto | No lo abras. No hagas clic. Reenvialo al desarrollador y borralo. |
| Perdí el acceso al 2FA | Usá los códigos de recuperación que guardaste al activarlo. **Guardalos en papel en un cajón, hoy.** |

## ✅ Rutina de mantenimiento

**Cada semana:** revisar métricas, actualizar stock, responder reseñas y consultas.
**Cada mes:** revisar el reporte de cumplimiento, verificar que el backup del mes anterior existe, revisar precios frente a costos.
**Cada 3 meses:** con el desarrollador — actualizaciones de seguridad, revisión de usuarios con acceso (sacá a quien ya no trabaja), y **prueba de restauración del backup**.
**Cada año:** revisar textos legales y renovar el dominio (ponelo en renovación automática).

---
---

# 💻 GUÍA 3 — DESARROLLADOR (el que mantiene el código)

> Escrita para que alguien que nunca vio este proyecto pueda ser productivo en una tarde, y para que no se rompa nada por desconocer una regla no escrita.

## Arranque local

```bash
git clone {{REPO}}
cd {{PROYECTO}}
npm ci                      # ci, no install: respeta el lockfile
cp .env.example .env.local  # pedí los valores al dueño del proyecto
npm run dev                 # http://localhost:3000
```

**Si falta una variable de entorno, la app no arranca a propósito.** El error dice cuál falta. Es un fallo temprano y ruidoso, no un bug.

### Variables de entorno

| Variable | Dónde vive | Cuidado |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | Pública. Está en el bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Pública. **Lo único que la contiene es RLS.** |
| `SUPABASE_SERVICE_ROLE_KEY` | **SOLO servidor** | 🔴 Saltea RLS. Es la llave maestra. Si toca el cliente, la base está comprometida. |
| `{{PAGOS}}_SECRET_KEY` | **SOLO servidor** | 🔴 |
| `{{PAGOS}}_WEBHOOK_SECRET` | **SOLO servidor** | 🔴 Sin esto no se puede verificar un webhook. |

**Toda variable con prefijo `NEXT_PUBLIC_` es visible para cualquiera que abra el inspector.** No hay excepción, no hay truco, no hay "pero está minificado".

## Estructura

```
app/                 # rutas (App Router)
  (public)/          # catálogo, contenido — Server Components
  (auth)/            # login, registro, recuperación
  admin/             # panel — protegido en middleware Y en cada handler
  api/               # route handlers, webhooks
components/
  ui/                # primitivas del sistema de diseño
  features/          # componentes con lógica de dominio
lib/
  supabase/          # clientes: browser / server / admin (¡tres distintos!)
  validations/       # esquemas Zod — fuente de verdad de todo input
  services/          # lógica de negocio, pura y testeable
  auth/              # sesión y verificación de permisos
supabase/
  migrations/        # SQL versionado, incluidas las políticas RLS
tests/
  authz/             # tests de autorización — NO son opcionales
```

## 🔴 Las 8 reglas que no se rompen

1. **RLS activada en toda tabla nueva.** La migración que crea una tabla crea sus políticas en el mismo archivo. Una tabla sin RLS con la clave anónima es una base de datos pública. Verificá con:
   ```sql
   select tablename from pg_tables
   where schemaname='public' and tablename not in (
     select tablename from pg_tables t
     join pg_class c on c.relname=t.tablename
     where c.relrowsecurity
   );
   ```
   Tiene que devolver cero filas.

2. **El cliente `admin` de Supabase (service_role) solo en archivos de servidor.** Nunca importado desde un componente con `"use client"`, nunca desde `lib/` compartido. Si dudás, no lo uses.

3. **Autorización verificada en el servidor, a nivel de registro, en cada operación.** No alcanza con el rol: verificá la propiedad del recurso concreto. Ocultar el botón en la UI **no es seguridad**.

4. **Todo input externo pasa por un esquema Zod en el servidor.** Body, query, params, headers, webhooks. La validación del cliente es experiencia de usuario, no defensa.

5. **Precios, totales, descuentos y stock se calculan en el servidor.** Lo que manda el cliente es una sugerencia, nunca un dato.

6. **El estado del pedido cambia solo por webhook con firma verificada.** La URL de retorno del navegador la falsifica cualquiera con curl.

7. **`dangerouslySetInnerHTML` está prohibido** salvo con DOMPurify configurado y un comentario que explique por qué era necesario.

8. **Ningún secreto en el repositorio, jamás.** Si se te escapa uno: rotalo primero (asumí que ya está comprometido), limpiá el historial después. El orden importa.

## Flujo de trabajo

```
main         → producción (deploy automático en Vercel)
develop      → staging
feature/xxx  → tu trabajo
```

- Rama por tarea, PR a `develop`, revisión obligatoria antes de `main`.
- **Migraciones de base de datos siempre hacia adelante** y probadas en staging primero. Toda migración destructiva lleva su plan de reversión escrito en el PR.
- **Staging nunca tiene datos reales de clientes.** Datos anonimizados o generados.

### Checklist de PR

- [ ] TypeScript sin errores, lint limpio.
- [ ] Tests pasando, **incluidos los de autorización**.
- [ ] Si toqué la base: migración creada, RLS incluida, probada en staging.
- [ ] Si agregué un endpoint: validación Zod + verificación de autorización + rate limiting si escribe.
- [ ] Si agregué una dependencia: justificada en el PR, `npm audit` limpio.
- [ ] Sin `console.log` con datos personales.
- [ ] Sin secretos en el diff.
- [ ] Probado en 375px.

## Tests que importan más que la cobertura

```
tests/authz/
  anonimo-no-lee-pedidos.test.ts
  cliente-no-lee-pedido-ajeno.test.ts      # el anti-IDOR
  editor-no-cambia-precios.test.ts
  usuario-no-se-asciende-a-admin.test.ts
  producto-controlado-no-se-publica.test.ts
```

**Un test que prueba que algo NO se puede hacer vale más que diez que prueban que sí.** Si alguna vez borrás tests por tiempo, estos no.

## Despliegue

```bash
npm run build          # tiene que pasar limpio
npm run test
npm audit --audit-level=high
```

Merge a `main` → Vercel despliega. **Rollback:** dashboard de Vercel → deployment anterior → "Promote to Production". Menos de 2 minutos. Practicalo una vez cuando no haya urgencia, no la primera vez bajo presión.

## Monitoreo

- **Sentry** — errores. Configurado **sin enviar datos personales**.
- **Vercel Analytics** — Core Web Vitals.
- **Supabase Dashboard** — consultas lentas, tamaño de base, uso del plan.
- **Alertas que importan:** pico de 500, pico de 403 (alguien probando), pico de intentos de login, uso inesperado de la clave de servicio.

## Mantenimiento programado

**Semanal:** revisar Sentry, `npm audit`, PRs de Dependabot.
**Mensual:** actualizar dependencias menores, revisar consultas lentas, **revisar quién tiene acceso al repo, a Vercel y a Supabase — sacar a quien ya no corresponde**.
**Trimestral:** actualizaciones mayores en staging, **restauración de backup probada de verdad**, repaso completo del anexo de seguridad, rotación de secretos.
**Anual:** revisión de arquitectura, revisión de textos legales, y la pregunta honesta: ¿qué parte de este código es más compleja de lo que el problema necesita?

## 🚨 Respuesta a incidentes

**Si sospechás que hay un compromiso, el orden es este:**

1. **Contener** — rotá todas las claves (Supabase, pagos, cualquier API). Si hace falta, poné el sitio en mantenimiento. Contener primero, investigar después.
2. **Evaluar** — logs de Supabase, de Vercel, y el registro de auditoría. ¿Qué se accedió? ¿Se tocaron datos personales?
3. **Erradicar** — cerrá el agujero, no solo el síntoma.
4. **Recuperar** — restaurá desde backup limpio si hizo falta. Forzá cierre de todas las sesiones.
5. **Comunicar** — si se expusieron datos personales, hay obligación de notificar. Avisá al dueño del negocio de inmediato; la decisión legal no es tuya.
6. **Aprender** — postmortem escrito, sin buscar culpables. Qué falló, qué lo detectó (o qué no), qué cambia para que no se repita.

**Escribí los contactos y los accesos de emergencia ANTES de necesitarlos**, y guardalos donde no dependan de que el sitio funcione.

---

## 📌 Cómo generar estas guías para tu proyecto real

Pegale esto a la IA cuando el sitio esté construido:

> Generá las tres guías (usuario final, administrador y desarrollador) adaptadas al proyecto que acabamos de construir. Usá los nombres reales de las pantallas, las rutas reales, los roles reales y los campos reales del modelo de datos. La guía de usuario va escrita para publicar en el sitio; la de administrador, para alguien sin conocimientos técnicos; la de desarrollador, para que alguien que nunca vio el proyecto sea productivo en una tarde. Marcá explícitamente las reglas que, si se rompen, comprometen la seguridad.
