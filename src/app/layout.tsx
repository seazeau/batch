import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  title: "MacroBatch — Batch Cooking Protéiné & Budgétaire (1h20)",
  description:
    "Optimiseur de batch cooking hebdomadaire : 10 repas (20 portions), < 3,20€/portion et 130g de protéines/jour préparés en 1h20 le dimanche.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MacroBatch",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#2D5A27]/15 selection:text-[#2D5A27]">
        {children}
      </body>
    </html>
  );
}
