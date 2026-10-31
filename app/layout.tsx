import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./themes.css";
import "./themes/nothing.css";
import "./themes/light.css";
import "./themes/lunar.css";
import "./theme-picker.css";
import "./themes/cinematic.css";
import "./themes/liquid-glass.css";
import "./profile-identity.css";
import "./editorial-cleanup.css";
import "./telemetry-responsive.css";
import { ThemeProvider } from "./theme-system";

export const metadata: Metadata = {
  metadataBase: new URL("https://vireonnoctis.github.io"),
  title: "Vireon — Businessman, Full-stack Developer & Real Estate Developer",
  description: "The personal portfolio of Vireon: businessman, full-stack developer, and real estate developer. Explore software, business ventures, property, and creative projects.",
  applicationName: "Vireon",
  authors: [{ name: "Vireon", url: "https://github.com/VireonNoctis" }],
  keywords: ["Vireon", "businessman", "full-stack developer", "real estate developer", "software", "property development", "AniList", "Lunar X"],
  openGraph: {
    type: "website",
    url: "https://vireonnoctis.github.io/",
    title: "Vireon — Business, Software & Property",
    description: "Businessman, full-stack developer, and real estate developer. A portfolio spanning software, business, property, and creative work.",
    siteName: "Vireon",
    images: [
      {
        url: "/vireon-preview.svg",
        width: 1200,
        height: 630,
        alt: "Vireon — The Slop King",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vireon — Businessman, Full-stack Developer & Real Estate Developer",
    description: "Business, software, property, and creative projects by Vireon.",
    images: ["/vireon-preview.svg"],
  },
  icons: { icon: "/vireon-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080b12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
