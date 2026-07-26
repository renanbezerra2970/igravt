import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iGravt — Protótipo",
  description: "Plataforma de experiência do consumidor e retenção para bares e restaurantes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
