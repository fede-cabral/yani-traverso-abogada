# ANEXO DE SEGURIDAD — Checklist exhaustivo
### Para aplicaciones web · Next.js + Supabase + Vercel · v1.0

> **Cómo se usa:** dos modos.
> 1. **Como parte del prompt** — pegalo junto al prompt maestro cuando arrancás un proyecto nuevo.
> 2. **Como auditoría** — pasalo entero a la IA con: *"Revisá el código del proyecto contra cada ítem de este checklist. Por cada uno respondé CUMPLE / NO CUMPLE / NO APLICA, con el archivo y la línea que lo prueba. No asumas que algo está bien si no lo ves en el código."*
>
> Marcá con `[x]` lo verificado. **Un ítem sin verificar es un ítem que no está.**

---

## 🎯 Los 5 principios que ordenan todo lo demás

1. **Negar por defecto** — todo prohibido salvo lo explícitamente permitido.
2. **Mínimo privilegio** — cada usuario, clave y servicio accede a lo mínimo indispensable.
3. **Defensa en profundidad** — nunca una sola capa. Si cae una, hay otra atrás.
4. **Fallar cerrado** — ante error, timeout o caso raro: denegar, no permitir.
5. **Nunca confiar en el cliente** — el navegador está bajo control del atacante. Siempre.

---

# 1. CONTROL DE ACCESO Y AUTORIZACIÓN
*(OWASP A01 — la vulnerabilidad #1 del mundo real)*

- [ ] **Matriz de permisos documentada** `rol × recurso × acción`, y el código la implementa 1:1.
- [ ] **Autorización verificada en el SERVIDOR en cada operación**, sin excepción. Ocultar un botón no es seguridad.
- [ ] **Verificación a nivel de registro, no solo de rol (anti-IDOR).** Antes de devolver o modificar el recurso `123`, el servidor confirma que *este usuario* es dueño de *ese* recurso. Probá cambiar el ID en la URL: si devuelve datos ajenos, es crítico.
- [ ] **IDs no predecibles** (UUID v4 / ULID) en recursos sensibles. Los IDs secuenciales son un mapa para enumerar.
- [ ] **Row Level Security (RLS) ACTIVADA en TODAS las tablas** de Supabase. Sin excepciones. Una tabla sin RLS + clave anónima = base de datos pública.
- [ ] **Políticas RLS explícitas por operación** (SELECT / INSERT / UPDATE / DELETE), no una sola política genérica.
- [ ] **Políticas RLS probadas con tests reales**: usuario A no ve ni modifica nada de usuario B. Anónimo no ve nada privado.
- [ ] **Vistas y funciones de Postgres** con `SECURITY INVOKER` (no `DEFINER`) salvo justificación explícita — `DEFINER` saltea RLS.
- [ ] **Rutas administrativas protegidas en el middleware Y en cada handler.** Doble control.
- [ ] **Escalada de privilegios imposible**: un usuario no puede cambiar su propio rol, ni enviando `role: "admin"` en el body. Lista blanca de campos actualizables.
- [ ] **Mass assignment bloqueado**: nunca `update(req.body)`. Siempre un objeto construido campo por campo desde un esquema validado.
- [ ] **CORS restrictivo**: orígenes en lista blanca explícita. Nunca `*` con credenciales.
- [ ] **Directory listing deshabilitado.** Sin acceso a `.git`, `.env`, `/backup`, `/admin.old`.
- [ ] **Endpoints de debug, seeds y datos de prueba eliminados** de producción.

---

# 2. AUTENTICACIÓN Y SESIONES
*(OWASP A07)*

- [ ] **Contraseñas hasheadas con Argon2id** (preferido) **o bcrypt cost ≥ 12**. Jamás MD5, SHA1, SHA256 pelado, ni cifrado reversible.
- [ ] **Mínimo 12 caracteres**, sin obligar composición absurda. Se recomiendan frases largas.
- [ ] **Contraseñas contrastadas contra listas filtradas** (Have I Been Pwned k-anonymity API) al registrar y al cambiar.
- [ ] **2FA disponible para usuarios, OBLIGATORIO para administradores.** TOTP mínimo; WebAuthn/passkeys si se puede.
- [ ] **Rate limiting + bloqueo progresivo en login.** 5 intentos → espera creciente. Nunca bloqueo permanente por IP (DoS a usuarios legítimos).
- [ ] **Sin enumeración de usuarios**: el mensaje de login, de registro y de recuperación es idéntico exista o no la cuenta. El tiempo de respuesta también.
- [ ] **Recuperación de contraseña**: token de un solo uso, criptográficamente aleatorio (≥128 bits), caducidad ≤ 30 min, invalidado al usarse, enviado solo por mail, y que **no revela si la cuenta existe**.
- [ ] **Rotación del ID de sesión al iniciar sesión** y al cambiar de privilegios (anti session fixation).
- [ ] **Cookies de sesión**: `HttpOnly` + `Secure` + `SameSite=Lax` o `Strict` + `Path=/` + prefijo `__Host-`.
- [ ] **Tokens JWT** (si se usan): firmados con algoritmo fijo en el servidor (nunca aceptar `alg` del token, nunca `none`), vida corta (≤15 min), refresh token rotativo con detección de reutilización.
- [ ] **Tokens de acceso NO en `localStorage`** (accesible por cualquier XSS). Cookies `HttpOnly`.
- [ ] **Expiración por inactividad** (ej. 30 min en admin) y **expiración absoluta** (ej. 12 h).
- [ ] **Logout invalida la sesión del lado servidor**, no solo borra la cookie.
- [ ] **"Cerrar todas las sesiones"** disponible, y forzado al cambiar contraseña.
- [ ] **Notificación por mail** ante login desde dispositivo nuevo, cambio de contraseña o de mail.
- [ ] **Cambio de mail confirmado en ambas direcciones** (viejo y nuevo).
- [ ] **Flujos OAuth/social**: `state` aleatorio validado, PKCE, `redirect_uri` en lista blanca exacta.

---

# 3. VALIDACIÓN DE ENTRADA E INYECCIÓN
*(OWASP A03)*

- [ ] **Validación de esquema en el servidor con Zod** (o equivalente) en **todo** input: body, query params, path params, headers, cookies, webhooks.
- [ ] **Lista blanca, no lista negra.** Definir lo permitido, no intentar enumerar lo prohibido.
- [ ] **Límites de longitud, rango, tipo y formato** en cada campo. Sin campos de texto ilimitados.
- [ ] **SQL siempre parametrizado.** Cero concatenación de strings. Si usás `rpc()` o SQL crudo, parámetros vinculados obligatorios.
- [ ] **Sin inyección NoSQL**: nunca pasar objetos del usuario directo a un query builder.
- [ ] **Sin inyección de comandos**: nada de `exec`, `spawn` con shell, ni backticks con input del usuario. Si es inevitable: lista blanca estricta de argumentos.
- [ ] **Sin inyección de plantillas** del lado servidor con contenido del usuario.
- [ ] **Sin `eval`, `new Function`, `setTimeout("string")`.**
- [ ] **Prototype pollution**: `Object.create(null)` para mapas, rechazar claves `__proto__`, `constructor`, `prototype` en JSON entrante.
- [ ] **Path traversal bloqueado**: nunca construir rutas de archivo con input del usuario. Normalizar y verificar que la ruta resuelta esté dentro del directorio permitido.
- [ ] **SSRF prevenido**: si el servidor hace peticiones a URLs que provee el usuario → lista blanca de dominios, bloqueo de IPs privadas (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254` metadata), sin seguir redirecciones ciegamente.
- [ ] **Redirecciones abiertas bloqueadas**: `?redirect=` solo acepta rutas relativas internas o dominios en lista blanca.
- [ ] **Deserialización insegura evitada**: nada de deserializar objetos arbitrarios del usuario.
- [ ] **Parsers de XML con entidades externas deshabilitadas** (XXE).
- [ ] **ReDoS**: sin expresiones regulares con backtracking catastrófico sobre input del usuario. Timeout en regex si aplica.

---

# 4. XSS Y SALIDA
*(OWASP A03)*

- [ ] **Escapado por defecto.** React escapa automáticamente — no lo saboteés.
- [ ] **`dangerouslySetInnerHTML` prohibido** salvo con DOMPurify y lista blanca de tags/atributos, documentado.
- [ ] **Markdown/rich text del usuario sanitizado** del lado servidor antes de guardar Y al renderizar.
- [ ] **Atributos peligrosos bloqueados** al sanitizar: `on*`, `javascript:`, `data:text/html`, `srcdoc`.
- [ ] **URLs de usuario validadas** antes de usarlas en `href` o `src`: solo `http:`, `https:`, `mailto:`.
- [ ] **Content Security Policy estricta**, con nonce por request:
  ```
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic';
  style-src 'self' 'nonce-{RANDOM}';
  img-src 'self' data: https://<tu-cdn>;
  font-src 'self';
  connect-src 'self' https://<tu-proyecto>.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
  ```
  **Sin `unsafe-inline` ni `unsafe-eval`.** Probala con CSP Evaluator de Google.
- [ ] **`Trusted Types`** activado si el navegador objetivo lo soporta.
- [ ] **Sin datos sensibles en el HTML** renderizado ni en `__NEXT_DATA__`.

---

# 5. CABECERAS HTTP Y TRANSPORTE

- [ ] `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (además de `frame-ancestors` en CSP)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()`
- [ ] `Cross-Origin-Opener-Policy: same-origin`
- [ ] `Cross-Origin-Resource-Policy: same-origin`
- [ ] `Cache-Control: no-store` en respuestas con datos personales o autenticadas.
- [ ] **Cabecera `Server` / `X-Powered-By` eliminada** (no regalar la versión del stack).
- [ ] **HTTPS obligatorio, TLS 1.2 mínimo (1.3 preferido).** Redirección 301 de HTTP a HTTPS.
- [ ] **Certificado válido, con renovación automática.** Alerta ante vencimiento.
- [ ] **Verificado con** [securityheaders.com](https://securityheaders.com) **→ objetivo A o A+** y [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/) **→ objetivo A**.

---

# 6. CSRF Y ORIGEN

- [ ] **Toda mutación protegida contra CSRF**: token sincronizador o doble cookie, o validación estricta de `Origin` / `Sec-Fetch-Site`.
- [ ] **Server Actions de Next.js**: verifican `Origin` por defecto, pero **confirmalo** y no expongas mutaciones vía GET.
- [ ] **Nunca una operación que cambia estado por GET.** GET es idempotente y sin efectos.
- [ ] **`SameSite` en cookies** como capa adicional, nunca como única defensa.
- [ ] **Clickjacking**: `frame-ancestors 'none'` + `X-Frame-Options: DENY`.

---

# 7. GESTIÓN DE SECRETOS Y CONFIGURACIÓN
*(OWASP A05)*

- [ ] **`.env` en `.gitignore` desde el primer commit.** Verificá también el historial: `git log --all -- .env`.
- [ ] **Ningún secreto en el código, en comentarios, ni en el repositorio.** Escaneá con `gitleaks` o `trufflehog`.
- [ ] **`.env.example`** con las claves pero **sin valores reales**.
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` SOLO en el servidor.** Jamás con prefijo `NEXT_PUBLIC_`. Esa clave saltea RLS: es la llave maestra.
- [ ] **Entendido que `NEXT_PUBLIC_*` es público**: cualquiera lo ve en el bundle. Solo la clave `anon` va ahí, y solo porque RLS la contiene.
- [ ] **Secretos distintos por entorno** (dev / staging / producción). Nunca la clave de producción en local.
- [ ] **Rotación de secretos** documentada, y ejecutada ante cualquier sospecha o salida de personal.
- [ ] **Variables de entorno validadas al arranque** con Zod: si falta una, la app no levanta.
- [ ] **Modo debug apagado en producción.** Sin source maps públicos con código sensible.
- [ ] **Mensajes de error genéricos hacia el usuario**, sin stack traces, rutas, versiones ni queries SQL.
- [ ] **Páginas 404 y 500 propias**, sin información del stack.
- [ ] **Dashboard de Supabase / Vercel con 2FA activado** en todas las cuentas con acceso.

---

# 8. CARGA DE ARCHIVOS
*(donde más rápido se rompe todo)*

- [ ] **Tipo real validado por magic bytes / firma binaria**, no por extensión ni `Content-Type` (ambos los controla el atacante).
- [ ] **Lista blanca de tipos permitidos.** Nunca lista negra.
- [ ] **Límite de tamaño** aplicado en el servidor, no solo en el cliente.
- [ ] **Nombre de archivo reescrito con UUID.** Nunca usar el nombre original (path traversal, doble extensión `foto.jpg.php`, caracteres unicode engañosos).
- [ ] **Almacenamiento fuera del webroot** o en Supabase Storage / S3 con políticas de acceso.
- [ ] **Servido desde un dominio o subdominio distinto**, o con `Content-Disposition: attachment` y `X-Content-Type-Options: nosniff`.
- [ ] **Nada subido se ejecuta jamás.** Sin permisos de ejecución en el directorio.
- [ ] **Imágenes reprocesadas** (re-encode con sharp) para destruir payloads embebidos y metadatos EXIF (que incluyen geolocalización).
- [ ] **Escaneo antivirus** (ClamAV) si se aceptan documentos.
- [ ] **Bombas de descompresión** controladas: límite de tamaño descomprimido en ZIP/imágenes.
- [ ] **Políticas RLS en Supabase Storage**: quién sube, quién lee, quién borra.
- [ ] **URLs firmadas con caducidad corta** para archivos privados.

---

# 9. LÓGICA DE NEGOCIO Y APIs

- [ ] **Importes, precios, descuentos y stock SIEMPRE recalculados en el servidor.** Nunca confiar en el precio que manda el cliente.
- [ ] **Cupones y descuentos**: validez, caducidad, límite de uso y no acumulables verificados en el servidor.
- [ ] **Race conditions controladas**: transacciones, bloqueos optimistas o restricciones únicas en base de datos. (Clásico: canjear el mismo cupón 50 veces en paralelo.)
- [ ] **Idempotencia** en operaciones críticas: reintentos no duplican pedidos ni cobros.
- [ ] **Flujos de varios pasos**: no se puede saltar un paso yendo directo a la URL final.
- [ ] **Cantidades validadas**: sin negativos, sin decimales donde no corresponde, sin desbordes.
- [ ] **Rate limiting por endpoint**, más estricto en: login, registro, recuperación, contacto, búsqueda, y cualquier cosa que cueste dinero (mails, SMS, llamadas a IA).
- [ ] **Paginación obligatoria** en listados. Sin `limit` ilimitado. Tope máximo en el servidor.
- [ ] **Sobre-exposición de datos evitada**: la API devuelve solo los campos necesarios, nunca `SELECT *` hacia el cliente. Que la UI oculte un campo no significa que no viaje.
- [ ] **GraphQL** (si aplica): límite de profundidad y complejidad, introspección apagada en producción, sin batching abusivo.
- [ ] **Webhooks entrantes**: firma criptográfica verificada (`stripe-signature`, HMAC), verificación de timestamp anti-replay, e idempotentes por `event_id`.
- [ ] **Antiautomatización**: CAPTCHA (hCaptcha / Turnstile) o similar en formularios públicos, y honeypot para bots simples.

---

# 10. PAGOS Y DATOS FINANCIEROS

- [ ] **Datos de tarjeta nunca tocan tu servidor.** Checkout alojado o tokenización del proveedor (Stripe Elements / Mercado Pago Bricks).
- [ ] **Sin PAN, CVV ni fecha de vencimiento almacenados.** Ni en base, ni en logs, ni en analítica.
- [ ] **El importe se calcula en el servidor** y se crea la intención de pago del lado servidor.
- [ ] **El estado del pedido cambia SOLO por webhook verificado**, nunca por la redirección de vuelta del navegador (esa la falsifica cualquiera).
- [ ] **Conciliación**: el importe del webhook coincide con el importe del pedido antes de marcar como pagado.
- [ ] **Registro de auditoría** de toda transacción, sin datos de tarjeta.
- [ ] **Reembolsos y cancelaciones** requieren rol específico + registro de auditoría.

---

# 11. DATOS PERSONALES Y PRIVACIDAD
*(Ley 25.326 Argentina · RGPD si hay tráfico UE)*

- [ ] **Minimización**: se recolecta solo lo necesario para la finalidad declarada. Cada campo del formulario justifica su existencia.
- [ ] **Cifrado en tránsito** (TLS 1.3) y **en reposo** (Supabase lo hace; verificá backups también).
- [ ] **Campos especialmente sensibles cifrados a nivel aplicación** (documento, datos de salud, biometría).
- [ ] **Política de privacidad real, accesible, en lenguaje claro**, que diga qué se recolecta, para qué, por cuánto tiempo y con quién se comparte.
- [ ] **Términos y condiciones** accesibles.
- [ ] **Consentimiento explícito y NO premarcado** para marketing. Separado del consentimiento del servicio.
- [ ] **Banner de cookies** que realmente bloquea las cookies no esenciales hasta el consentimiento, con opción "rechazar todo" tan visible como "aceptar".
- [ ] **Derechos ARCO** operables: acceso, rectificación, cancelación y oposición. Con un proceso real, aunque sea manual.
- [ ] **Exportación y borrado de cuenta** disponibles.
- [ ] **Política de retención** definida por tipo de dato, con borrado automático al vencer.
- [ ] **Sin PII en logs, URLs, analítica ni mensajes de error.**
- [ ] **Registro de la base de datos ante la Agencia de Acceso a la Información Pública** (obligatorio en Argentina si se tratan datos personales).
- [ ] **Encargados de tratamiento** (proveedores) identificados, con contrato: Vercel, Supabase, proveedor de mail, analítica.
- [ ] **Procedimiento de notificación de brecha** escrito: a quién, en cuánto tiempo, cómo.

---

# 12. DEPENDENCIAS Y CADENA DE SUMINISTRO
*(OWASP A06 · A08)*

- [ ] **Mínimas dependencias.** Cada una es código de terceros ejecutándose con tus privilegios. Justificá cada una.
- [ ] **`npm audit` / `pnpm audit` en cada build**, con el build fallando ante vulnerabilidad crítica.
- [ ] **Dependabot o Renovate activo** con revisión de los cambios, no merge automático a ciegas.
- [ ] **Lockfile commiteado** y builds con `npm ci` (no `npm install`).
- [ ] **Sin paquetes abandonados** (>12 meses sin actualizar) en funciones críticas.
- [ ] **Cuidado con el typosquatting**: verificá el nombre exacto y el autor antes de instalar.
- [ ] **Scripts de postinstall revisados** en paquetes nuevos.
- [ ] **Scripts de terceros en el frontend minimizados.** Cada tag de marketing es una vía de ataque (Magecart). Los necesarios, con SRI (`integrity` hash) y limitados por CSP.
- [ ] **CI/CD**: secretos como secretos del runner, permisos mínimos del token, PRs de forks sin acceso a secretos, acciones fijadas por SHA (no por tag móvil).
- [ ] **Acceso al repositorio con 2FA obligatorio** y revisión obligatoria en la rama principal.

---

# 13. REGISTRO, MONITOREO Y RESPUESTA
*(OWASP A09)*

- [ ] **Log de eventos de seguridad**: login exitoso y fallido, logout, cambio de contraseña/mail, cambio de permisos, acceso denegado, borrados, cambios de precio, exportaciones de datos.
- [ ] **Cada log con**: timestamp UTC, identidad, acción, recurso, IP, user-agent, resultado.
- [ ] **Sin contraseñas, tokens, cookies, tarjetas ni PII en los logs.**
- [ ] **Logs protegidos contra manipulación** y con retención definida (90 días mínimo recomendado).
- [ ] **Alertas automáticas** ante: pico de errores 401/403, pico de 500, intentos de login masivos, uso inesperado de la clave de servicio, tráfico anómalo.
- [ ] **Monitoreo de errores** (Sentry) configurado **sin enviar PII**.
- [ ] **Uptime monitoring** externo.
- [ ] **Plan de respuesta a incidentes escrito**: quién decide, cómo se corta el acceso, cómo se revierte el deploy, cómo se avisa a los usuarios, cómo se rotan las claves. Escribilo ANTES de necesitarlo.
- [ ] **Contacto de seguridad publicado** (`/.well-known/security.txt`) para que te reporten fallas en lugar de venderlas.

---

# 14. INFRAESTRUCTURA, DISPONIBILIDAD Y RECUPERACIÓN

- [ ] **Backups automáticos diarios** de base de datos y storage.
- [ ] **Restauración PROBADA** al menos una vez. Un backup no restaurado no es un backup.
- [ ] **Backups en ubicación separada** de la producción, y cifrados.
- [ ] **Point-in-time recovery** activado si el plan lo permite.
- [ ] **Protección DDoS / WAF** (Vercel y Cloudflare lo dan en plan gratuito).
- [ ] **Límites de recursos** configurados para evitar facturas sorpresa por abuso.
- [ ] **Entorno de staging separado**, con datos anonimizados. **Nunca una copia de producción con datos reales en staging.**
- [ ] **Staging protegido con contraseña y `noindex`.**
- [ ] **Rollback de un deploy en menos de 5 minutos**, y probado.
- [ ] **Dominio con registrar lock y 2FA.** El secuestro de dominio es el ataque más barato y más devastador.
- [ ] **Registros DNS SPF, DKIM y DMARC** configurados para que nadie envíe mails suplantando tu dominio.

---

# 15. VERIFICACIÓN FINAL ANTES DE PUBLICAR

**Automático:**
- [ ] `npm audit` sin vulnerabilidades críticas ni altas.
- [ ] Build sin errores de TypeScript ni warnings de lint.
- [ ] Lighthouse: Rendimiento ≥ 90, Accesibilidad ≥ 95, SEO ≥ 95.
- [ ] [securityheaders.com](https://securityheaders.com) → A o A+.
- [ ] [SSL Labs](https://www.ssllabs.com/ssltest/) → A.
- [ ] [CSP Evaluator](https://csp-evaluator.withgoogle.com/) sin hallazgos altos.
- [ ] Escaneo de secretos en el repositorio limpio (`gitleaks detect`).
- [ ] Tests pasando, **incluidos los de autorización**.

**Manual — probá romperlo vos:**
- [ ] Cambiar un ID en la URL → ¿ves datos de otro usuario?
- [ ] Entrar a `/admin` sin sesión → ¿te rechaza?
- [ ] Entrar a `/admin` con sesión de usuario común → ¿te rechaza?
- [ ] Llamar al endpoint de API directo con curl sin token → ¿te rechaza?
- [ ] Mandar `{"role":"admin"}` al actualizar tu perfil → ¿lo ignora?
- [ ] Poner `<script>alert(1)</script>` en cada campo de texto → ¿queda escapado en todos lados donde se muestra?
- [ ] Poner `' OR '1'='1` en cada campo → ¿nada raro?
- [ ] Subir un `.php`, un `.html` y un `.svg` con script → ¿los rechaza o los neutraliza?
- [ ] Mandar 100 requests seguidos al login → ¿te frena?
- [ ] Modificar el precio en el request del carrito → ¿el servidor lo recalcula?
- [ ] Abrir DevTools → Network → ¿la API devuelve campos que no deberías ver?
- [ ] Buscar `service_role` en el bundle del cliente → **tiene que dar cero resultados.**
- [ ] Ver el sitio en 375px → ¿todo usable?
- [ ] Navegar todo con Tab → ¿llegás a todos lados y ves el foco?

---

## 📌 Mapa rápido: OWASP Top 10 2021 → sección de este documento

| | Riesgo | Secciones |
|---|---|---|
| A01 | Pérdida de control de acceso | 1, 6 |
| A02 | Fallas criptográficas | 2, 5, 11 |
| A03 | Inyección | 3, 4 |
| A04 | Diseño inseguro | 9, 10 |
| A05 | Configuración de seguridad incorrecta | 5, 7, 14 |
| A06 | Componentes vulnerables y desactualizados | 12 |
| A07 | Fallas de identificación y autenticación | 2 |
| A08 | Fallas de integridad de software y datos | 12 |
| A09 | Fallas de registro y monitoreo | 13 |
| A10 | Falsificación de solicitudes del lado del servidor (SSRF) | 3 |

---

## ⚠️ Los 10 errores que más veo, en orden de frecuencia

1. **RLS desactivada** en alguna tabla de Supabase, o activada sin políticas → base de datos pública.
2. **`service_role` key filtrada al cliente** por ponerle `NEXT_PUBLIC_`.
3. **IDOR**: verificar el rol pero no la propiedad del registro.
4. **Confiar en el precio del cliente** en el checkout.
5. **`.env` commiteado** en el primer commit y "borrado" después (sigue en el historial).
6. **Sin rate limiting** → fuerza bruta y facturas de miles de dólares.
7. **Estado del pedido cambiado por la URL de retorno** en vez de por webhook firmado.
8. **`dangerouslySetInnerHTML`** con contenido de usuario.
9. **CSP con `unsafe-inline`** porque "si no, no funciona" → CSP decorativa.
10. **Backups que nunca se probaron.**

---

*Este checklist se revisa cada 6 meses. Las amenazas cambian; la disciplina, no.*
