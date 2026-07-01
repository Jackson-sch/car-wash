import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WashMaster Pro",
    short_name: "WashMaster",
    description: "Sistema de Gestión y Fidelización para Autolavados",
    start_url: "/",
    display: "standalone",
    background_color: "#050510",
    theme_color: "#050510",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
