import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./themes.css";
import "./themes/nothing.css";
import "./themes/light.css";
import "./themes/lunar.css";
import "./theme-picker.css";
import { ThemeProvider } from "./theme-system";

export const metadata: Metadata = {
  metadataBase: new URL("https://vireonnoctis.github.io"),
  title: "Vireon — The Slop King 👑 | Software, Stories, Sound",
  description: "Vireon — The Slop King. Software, anime, music, and the creative chaos behind them.",
  applicationName: "Vireon",
  authors: [{ name: "Vireon", url: "https://github.com/VireonNoctis" }],
  keywords: ["Vireon", "The Slop King", "developer", "creative studio", "AniList", "Lunar X"],
  openGraph: {
    type: "website",
    url: "https://vireonnoctis.github.io/",
    title: "Vireon — The Slop King 👑",
    description: "A personal world of software, anime, music, and creative chaos.",
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
    title: "Vireon — The Slop King 👑 | Software, Stories, Sound",
    description: "Vireon — The Slop King. Software, anime, music, and creative projects.",
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
