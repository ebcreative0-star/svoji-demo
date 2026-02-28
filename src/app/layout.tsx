import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="cs">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
