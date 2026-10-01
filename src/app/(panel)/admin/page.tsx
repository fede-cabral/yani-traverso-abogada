import Link from "next/link";
import { exigirStaff } from "@/lib/auth/sesion";
import { resumenPanel } from "@/lib/datos/admin";

function Tarjeta({
  etiqueta,
  valor,
  tono = "normal",
  href,
}: {
  etiqueta: string;
  valor: number;
  tono?: "normal" | "aviso" | "exito";
  href: string;
}) {
  const color = {
    normal: "text-texto",
    aviso: "text-aviso",
    exito: "text-exito",
  }[tono];

  return (
    <Link href={href} className="tarjeta tarjeta-enlace p-5">
      <p className={`text-3xl font-bold ${color}`}>{valor}</p>
      <p className="mt-1 text-sm text-texto-suave">{etiqueta}</p>
    </Link>
  );
}

export default async function PanelResumen() {
  const sesion = await exigirStaff();

  // Turnos y consultas son datos personales: solo administradores. A un
  // editor no se le muestran ni los números — y aunque se le mostraran
  // tarjetas, RLS le devolvería cero.
  if (sesion.rol !== "admin") {
    return (
      <>
        <h1 className="text-2xl">Resumen</h1>
        <p className="mt-4 max-w-2xl text-sm text-texto-suave">
          Tu usuario no tiene acceso a los turnos ni a las consultas, que
          contienen datos personales. Si tenés que verlos, pedile a la
          administradora que te cambie el rol.
        </p>
      </>
    );
  }

  const r = await resumenPanel();

  return (
    <>
      <h1 className="text-2xl">Resumen</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Tarjeta
          etiqueta="Turnos por confirmar"
          valor={r.turnos_pendientes}
          tono={r.turnos_pendientes > 0 ? "aviso" : "normal"}
          href="/admin/turnos"
        />
        <Tarjeta
          etiqueta="Turnos confirmados"
          valor={r.turnos_confirmados}
          tono={r.turnos_confirmados > 0 ? "exito" : "normal"}
          href="/admin/turnos"
        />
        <Tarjeta
          etiqueta="Consultas sin responder"
          valor={r.consultas_nuevas}
          tono={r.consultas_nuevas > 0 ? "aviso" : "normal"}
          href="/admin/consultas"
        />
      </div>

      {r.turnos_pendientes > 0 && (
        <div className="aviso mt-8 max-w-2xl">
          <p className="font-semibold">
            Hay {r.turnos_pendientes}{" "}
            {r.turnos_pendientes === 1 ? "pedido de turno" : "pedidos de turno"} sin
            confirmar.
          </p>
          <p className="mt-1">
            Cada persona está esperando que la llamen para acordar el horario.
            Cuando lo acuerdes, marcá el turno como confirmado.
          </p>
        </div>
      )}
    </>
  );
}
