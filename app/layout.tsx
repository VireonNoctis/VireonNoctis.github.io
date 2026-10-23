import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vireonnoctis.github.io"),
  title: "Vireon Noctis — Software, Stories, Sound",
  description: "Software, anime, music, and the projects behind them.",
  applicationName: "Vireon Noctis",
  authors: [{ name: "Vireon Noctis", url: "https://github.com/VireonNoctis" }],
  keywords: ["Vireon Noctis", "developer", "creative studio", "AniList", "Lunar X"],
  openGraph: {
    type: "website",
    url: "https://vireonnoctis.github.io/",
    title: "Vireon Noctis — An Independent Digital World",
    description: "Software, anime, music, and things made with intent.",
    siteName: "Vireon Noctis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vireon Noctis",
    description: "Software, stories, sound.",
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
      <body>{children}</body>
    </html>
  );
}
