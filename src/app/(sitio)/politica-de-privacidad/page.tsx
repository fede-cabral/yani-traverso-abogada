import type { Metadata } from "next";
import { MATRICULA_LEGIBLE, NEGOCIO } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos se recolectan en este sitio, para qué, por cuánto tiempo y cuáles son tus derechos.",
  alternates: { canonical: "/politica-de-privacidad" },
  robots: { index: true, follow: false },
};

export default function PoliticaDePrivacidad() {
  return (
    <main id="contenido" className="contenedor seccion">
      <p className="rotulo">Legal</p>
      <h1 className="mt-4 text-3xl">Política de privacidad</h1>
      <hr className="filete mt-6" />

      <div className="prosa mt-8">
        <p>
          Esta política explica qué datos personales se recolectan en este
          sitio, para qué se usan y qué podés hacer al respecto. Está escrita
          para que se entienda.
        </p>

        <h2>Quién es responsable</h2>
        <p>
          <strong>{NEGOCIO.titular}</strong>, abogada, matrícula{" "}
          {MATRICULA_LEGIBLE} ({NEGOCIO.matricula.colegio}). Domicilio:{" "}
          {NEGOCIO.direccionLegible}. Contacto:{" "}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>.
        </p>

        <h2>Qué datos se recolectan</h2>
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
              <td>Tema, día y horario preferidos</td>
              <td>Al pedir un turno</td>
              <td>Coordinar la consulta</td>
            </tr>
            <tr>
              <td>Motivo o mensaje</td>
              <td>Solo si lo escribís</td>
              <td>Entender qué necesitás</td>
            </tr>
          </tbody>
        </table>
        <p>
          El sitio no pide DNI, documentación ni datos de pago. Te pedimos
          además que no cargues en los formularios el detalle de tu caso ni
          datos de otras personas: eso se conversa en la consulta.
        </p>

        <h2>Qué no se hace con tus datos</h2>
        <ul>
          <li>No se venden ni se ceden a terceros.</li>
          <li>No se usan para enviarte publicidad.</li>
          <li>No se usan para nada distinto de lo que dice esta página.</li>
        </ul>

        <h2>Cuánto tiempo se guardan</h2>
        <p>
          Los pedidos de turno y las consultas enviadas por este sitio se
          conservan <strong>24 meses</strong> y después se eliminan.
        </p>

        <h2>Con quién se comparten</h2>
        <p>
          Solo con los proveedores técnicos necesarios para que el sitio
          funcione, y únicamente con esa finalidad:
        </p>
        <ul>
          <li>El proveedor de hosting del sitio.</li>
          <li>El proveedor de base de datos.</li>
        </ul>

        <h2>Seguridad</h2>
        <p>
          Los datos viajan cifrados (HTTPS). Los pedidos de turno y las
          consultas solo puede leerlos la titular del sitio, con usuario y
          contraseña, y los cambios que se hacen sobre ellos quedan
          registrados.
        </p>

        <h2>Tus derechos</h2>
        <p>
          Podés pedir en cualquier momento acceder a tus datos, corregirlos,
          actualizarlos o eliminarlos, escribiendo a{" "}
          <a href={`mailto:${NEGOCIO.email}`}>{NEGOCIO.email}</a>.
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

        <h2>Cookies</h2>
        <p>
          Este sitio no usa cookies de publicidad ni de seguimiento, ni carga
          contenido de terceros que las instale. La única cookie es la de
          sesión del panel de administración, que no se le instala a quien
          visita el sitio.
        </p>

        <h2>Cambios</h2>
        <p>
          Si esta política se modifica, la versión nueva se publica en esta
          misma página.
        </p>

        {/* PENDIENTE: lo revisa la Dra. antes de publicar. Se saca este aviso
            cuando lo apruebe. Ver PENDIENTES.md. */}
        <p className="aviso">
          <strong>Borrador pendiente de revisión.</strong> Este texto lo tiene
          que revisar y aprobar la titular antes de que el sitio se publique.
        </p>
      </div>
    </main>
  );
}
