import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ViraStack Start",
    short_name: "ViraStack Start",
    description: "Premium, agent-ready Next.js boilerplate.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/virastack.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
