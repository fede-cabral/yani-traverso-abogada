import type { Metadata } from "next";
import { FormularioLogin } from "@/components/FormularioLogin";

export const metadata: Metadata = {
  title: "Ingresar",
  // Una página de login no aporta nada en buscadores y sí le da pistas a
  // quien busca paneles de administración.
  robots: { index: false, follow: false },
};

export default function Ingresar() {
  return (
    <main id="contenido" className="contenedor grid min-h-[60vh] place-items-center py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Ingresar</h1>
        <p className="mt-2 text-sm text-texto-suave">
          Acceso al panel de administración.
        </p>
        <div className="mt-8">
          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}
