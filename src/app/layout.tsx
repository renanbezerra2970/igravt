import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://igravt-app.vercel.app"),
  title: "iGravt — Relacionamento que traz clientes de volta",
  description: "Plataforma de experiência do consumidor e retenção para bares e restaurantes.",
  openGraph: {
    title: "iGravt",
    description: "Relacionamento que traz clientes de volta.",
    type: "website",
  },
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
