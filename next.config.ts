import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  // No filtrar la versión del framework en las cabeceras.
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Solo se permiten imágenes desde el storage del proyecto.
    // Reemplazar <PROYECTO> por el ref real de Supabase.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  typescript: {
    // Nunca poner en true: un build que ignora errores de tipos es un build que miente.
    ignoreBuildErrors: false,
  },
};

export default config;
