import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource-variable/jost";
import "@fontsource/pinyon-script";
import "@fontsource-variable/playfair-display";
import "./globals.css";
import "@/components/invite/invite.css";
import { APP_NAME, APP_TAGLINE } from "@/config/brand";
import { EnvBadge } from "@/components/ui/EnvBadge";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_TAGLINE,
  applicationName: APP_NAME,
};

export const viewport: Viewport = { themeColor: "#10383A" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        {children}
        <EnvBadge />
      </body>
    </html>
  );
}
