import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anna & Tomáš - Svatba 2025",
  description: "Zveme vás na naši svatbu! Najdete zde všechny potřebné informace o našem velkém dni.",
  openGraph: {
    title: "Anna & Tomáš - Svatba 2025",
    description: "Zveme vás na naši svatbu!",
    type: "website",
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
