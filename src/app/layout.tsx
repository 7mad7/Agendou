import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileShell } from "@/components/layout/mobile-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agendou | Tudo no seu bairro, com horário marcado",
  description:
    "Plataforma mobile-first para descobrir comércios locais e agendar serviços próximos sem fricção.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
