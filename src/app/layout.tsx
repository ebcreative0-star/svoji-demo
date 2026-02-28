import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Svoji - AI Svatební Asistent",
  description: "Naplánujte svatbu s AI asistentem. Checklist, rozpočet, hosté a osobní poradce v jedné aplikaci. Pro české páry.",
  keywords: ["svatba", "plánování svatby", "AI asistent", "checklist", "rozpočet", "svatební web"],
  openGraph: {
    title: "Svoji - AI Svatební Asistent",
    description: "Naplánujte svatbu s AI asistentem. Checklist, rozpočet, hosté a osobní poradce v jedné aplikaci.",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Svoji - AI Svatební Asistent",
    description: "Naplánujte svatbu s AI asistentem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
