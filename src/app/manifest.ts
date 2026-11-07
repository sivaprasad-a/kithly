import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_TAGLINE,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F5F2E9",
    theme_color: "#10383A",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
