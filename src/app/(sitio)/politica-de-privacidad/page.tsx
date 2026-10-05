import type { Metadata } from "next";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos se recolectan en este sitio, para qué, dónde se guardan, por cuánto tiempo y cuáles son tus derechos.",
  alternates: { canonical: "/politica-de-privacidad" },
  robots: { index: true, follow: false },
};

/*
  Proveedores técnicos. Si cambia alguno, o la región de la base, esta lista
  se actualiza ANTES de que el cambio llegue a producción: la política tiene
  que decir dónde están los datos de verdad, no dónde estaban. Lo mismo si se
  agrega un servicio nuevo (mails, CAPTCHA, analítica).
*/
const PROVEEDORES = [
  {
    nombre: "Vercel Inc.",
    servicio: "Aloja el sitio y procesa cada visita.",
    lugar: "Estados Unidos",
  },
  {
    nombre: "Supabase Inc.",
    servicio: "Guarda los pedidos de turno y las consultas.",
    lugar: "Servidores en San Pablo, Brasil",
  },
] as const;

/**
 * Política de privacidad.
 *
 * Cubre lo que el art. 6 de la Ley 25.326 obliga a informar al pedir datos
 * (finalidad, destinatarios, responsable, qué es obligatorio, qué pasa si no
 * se dan, cómo ejercer los derechos), la transferencia internacional del
 * art. 12 y la leyenda de la Disposición 10/2008 de la DNPDP.
 *
 * Cada afirmación de esta página tiene que ser verdad en el código. Si
 * cambia el código (un campo nuevo, otro proveedor, otro plazo), cambia la
 * política en el mismo commit.
 */
export default function PoliticaDePrivacidad() {
  const correo = <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>;

  return (
    <main id="contenido" className="contenedor seccion">
      <p className="rotulo">Legal</p>
      <h1 className="mt-4 text-3xl">Política de privacidad</h1>
      <hr className="filete mt-6" />

      <div className="prosa mt-8">
        <p>
          Esta política explica qué datos personales se recolectan en este
          sitio, para qué se usan, dónde se guardan, por cuánto tiempo y qué
          podés hacer al respecto. Rige para los datos que se envían por los
          formularios de pedido de turno y de consulta.
        </p>

        <h2>1. Responsable de los datos</h2>
        <p>
          <strong>{NEGOCIO.titular}</strong>, abogada, matrícula{" "}
          {MATRICULA_LEGIBLE} ({NEGOCIO.matricula.colegio}). Domicilio:{" "}
          {NEGOCIO.direccionLegible}. Contacto: {correo}.
        </p>
        <p>
          Los datos que se envían por este sitio forman una base de datos de
          la que ella es la responsable, en los términos de la Ley 25.326 de
          Protección de los Datos Personales.
        </p>

        <h2>2. Qué datos se recolectan y para qué</h2>
        <table>
          <thead>
            <tr><th>Dato</th><th>Cuándo</th><th>Para qué</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Nombre</td>
              <td>Al pedir un turno o enviar una consulta</td>
              <td>Saber a quién se le responde</td>
            </tr>
            <tr>
              <td>Teléfono y email</td>
              <td>Al pedir un turno o enviar una consulta</td>
              <td>Confirmar el turno o responder la consulta</td>
            </tr>
            <tr>
              <td>Tema, día y franja horaria preferidos</td>
              <td>Al pedir un turno</td>
              <td>Coordinar la consulta</td>
            </tr>
            <tr>
              <td>Motivo o mensaje</td>
              <td>Solo si lo escribís</td>
              <td>Entender qué necesitás antes de la consulta</td>
            </tr>
            <tr>
              <td>Dirección IP, transformada en un código irreversible</td>
              <td>Al enviar cualquier formulario</td>
              <td>Frenar envíos masivos automáticos. No permite saber quién sos</td>
            </tr>
          </tbody>
        </table>
        <p>
          Los datos se usan <strong>únicamente</strong> para esas finalidades.
          El sitio no pide DNI, documentación ni datos de pago.
        </p>

        <h2>3. Qué datos son obligatorios</h2>
        <p>
          Los campos marcados con asterisco (*) son obligatorios: sin ellos no
          es posible coordinar el turno ni responder la consulta, y el
          formulario no se envía. Los demás son opcionales. Si un dato es
          inexacto —por ejemplo, un teléfono mal escrito— puede que no podamos
          comunicarnos con vos.
        </p>
        <p>
          Te pedimos que <strong>no cargues en los formularios el detalle de
          tu caso, datos de salud ni datos de otras personas</strong>. Eso se
          conversa en la consulta, donde rige el secreto profesional.
        </p>

        <h2>4. Consentimiento</h2>
        <p>
          Para enviar un formulario tenés que marcar la casilla que dice que
          aceptás esta política. Al hacerlo prestás tu consentimiento para que
          tus datos se traten como se explica acá, incluido que se guarden en
          los servidores de los proveedores del punto 6. Podés revocarlo en
          cualquier momento pidiendo que se borren tus datos (punto 8).
        </p>

        <h2>5. Qué no se hace con tus datos</h2>
        <ul>
          <li>No se venden, no se alquilan y no se ceden a terceros.</li>
          <li>No se usan para enviarte publicidad ni novedades.</li>
          <li>No se usan para nada distinto de lo que dice esta página.</li>
        </ul>

        <h2>6. Dónde se guardan y quién más interviene</h2>
        <p>
          Para que el sitio funcione intervienen dos proveedores técnicos.
          Procesan los datos solo para prestar su servicio, bajo sus propias
          obligaciones de seguridad y confidencialidad, y no los usan para
          fines propios:
        </p>
        <table>
          <thead>
            <tr><th>Proveedor</th><th>Qué hace</th><th>Dónde</th></tr>
          </thead>
          <tbody>
            {PROVEEDORES.map((p) => (
              <tr key={p.nombre}>
                <td>{p.nombre}</td>
                <td>{p.servicio}</td>
                <td>{p.lugar}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Como esos servidores están fuera de la Argentina, enviar un
          formulario implica una transferencia internacional de datos (art. 12
          de la Ley 25.326), que se hace con tu consentimiento (punto 4).
        </p>
        <p>
          La persona que mantiene técnicamente el sitio puede acceder a los
          datos solo cuando hace falta para resolver un problema, por cuenta y
          orden de la responsable y con obligación de confidencialidad.
        </p>
        <p>
          Si nos escribís por WhatsApp, o seguís un enlace a LinkedIn o a un
          mapa, salís de este sitio: esos servicios tratan tus datos según sus
          propias políticas.
        </p>

        <h2>7. Cuánto tiempo se guardan</h2>
        <ul>
          <li>
            Los pedidos de turno y las consultas se eliminan{" "}
            <strong>automáticamente a los 24 meses</strong> de haber sido
            enviados.
          </li>
          <li>
            El código que se obtiene de tu dirección IP se elimina dentro de
            las 48 horas.
          </li>
          <li>
            Si la consulta da lugar a una relación profesional, lo que haga
            falta conservar pasa al legajo del caso, sujeto al secreto
            profesional, y deja de regirse por esta política.
          </li>
        </ul>

        <h2>8. Tus derechos</h2>
        <p>
          Podés pedir en cualquier momento <strong>acceder</strong> a tus
          datos, <strong>rectificarlos</strong>, <strong>actualizarlos</strong>{" "}
          o <strong>suprimirlos</strong>, escribiendo a {correo}. El pedido de
          acceso se responde dentro de los 10 días corridos, y el de
          rectificación, actualización o supresión dentro de los 5 días
          hábiles (arts. 14 y 16 de la Ley 25.326). Para proteger tus datos,
          podemos pedirte que confirmes que sos la persona titular.
        </p>
        <p>
          El titular de los datos personales tiene la facultad de ejercer el
          derecho de acceso a los mismos en forma gratuita a intervalos no
          inferiores a seis meses, salvo que se acredite un interés legítimo al
          efecto, conforme lo establecido en el artículo 14, inciso 3 de la{" "}
          <strong>Ley 25.326</strong>.
        </p>
        <p>
          La <strong>Agencia de Acceso a la Información Pública</strong>, en su
          carácter de órgano de control de la Ley 25.326, tiene la atribución de
          atender las denuncias y reclamos que interpongan quienes resulten
          afectados en sus derechos por incumplimiento de las normas vigentes en
          materia de protección de datos personales.
        </p>

        <h2>9. Seguridad</h2>
        <p>
          Los datos viajan cifrados (HTTPS). Los pedidos de turno y las
          consultas no son visibles desde el sitio público: solo puede leerlos
          la responsable, entrando con usuario y contraseña, y los cambios que
          se hacen sobre ellos quedan registrados. Ningún sistema es
          invulnerable; si ocurriera un incidente que afecte tus datos, se
          tomarán las medidas que correspondan y se te informará cuando la
          ley lo exija.
        </p>

        <h2>10. Cookies</h2>
        <p>
          Este sitio no instala cookies a quien lo visita: ni de publicidad,
          ni de seguimiento, ni de analítica, y no carga contenido de terceros
          que las instale. La única cookie es la de sesión del panel de
          administración, que solo existe para quien inicia sesión en él.
        </p>

        <h2>11. Menores de edad</h2>
        <p>
          Los formularios están pensados para personas mayores de 18 años. Si
          necesitás una consulta por una persona menor de edad, la debe pedir
          su madre, padre o representante legal.
        </p>

        <h2>12. Cambios en esta política</h2>
        <p>
          Si esta política se modifica, la versión nueva se publica en esta
          misma página con su fecha. Los datos ya enviados se siguen tratando
          según la versión vigente al momento de enviarlos, salvo que
          consientas la nueva.
        </p>

        {/* PENDIENTE: lo revisa la Dra. antes de publicar. Cuando lo apruebe,
            se saca este aviso y se pone la fecha de vigencia arriba. Ver
            PENDIENTES.md. */}
        <p className="aviso">
          <strong>Borrador pendiente de revisión.</strong> Este texto lo tiene
          que revisar y aprobar la titular antes de que el sitio se publique.
        </p>
      </div>
    </main>
  );
}
