import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import NavScroll from "@/components/NavScroll";
import WhatsAppFab from "@/components/WhatsAppFab";

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Com Automação | Sistemas de gestão para sua empresa",
    template: "%s — Com Automação",
  },
  description:
    "Representamos os melhores sistemas de gestão e cuidamos da implantação, do treinamento e do suporte local. Empresas organizadas decolam.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <ScrollReveal />
        <NavScroll />
        <Nav />
        {children}
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
