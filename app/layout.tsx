import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    default: "PromptForge — El mercado de prompts para IA",
    template: "%s | PromptForge",
  },
  description:
    "Comparte y vende prompts profesionales para ChatGPT, Midjourney, DALL-E y más. El mercado más seguro de prompts para IA.",
  keywords: ["prompts", "IA", "ChatGPT", "Midjourney", "mercado de prompts"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${GeistSans.variable} flex min-h-screen flex-col bg-background text-foreground antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
