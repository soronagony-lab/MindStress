import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mindstress-app.vercel.app";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MindStress — Gestion du stress",
    template: "%s · MindStress",
  },
  description:
    "Santé mentale et gestion du stress pour la Côte d’Ivoire — avec bienveillance.",
  applicationName: "MindStress",
  keywords: [
    "stress",
    "santé mentale",
    "Côte d’Ivoire",
    "bien-être",
    "accompagnement",
  ],
  authors: [{ name: "MindStress" }],
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: siteUrl,
    siteName: "MindStress",
    title: "MindStress — Gestion du stress",
    description:
      "Un espace calme pour parler du stress sans tabou — outils concrets et bienveillance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindStress",
    description: "Santé mentale et gestion du stress — Côte d’Ivoire.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c1610" },
    { media: "(prefers-color-scheme: light)", color: "#f1f8e9" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
