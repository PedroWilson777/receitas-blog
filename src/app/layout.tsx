import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Receitas da Vovó",
    default: "Receitas da Vovó — Culinária Brasileira",
  },
  description:
    "Receitas caseiras brasileiras fáceis e deliciosas. Aprenda a cozinhar pratos tradicionais com ingredientes simples.",
  metadataBase: new URL("https://receitasdavovo.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Receitas da Vovó",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google AdSense — substitua pelo seu publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <header className="bg-orange-600 text-white py-4 px-6 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">
              🍳 Receitas da Vovó
            </a>
            <nav className="hidden md:flex gap-6 text-sm">
              <a href="/categoria/bolos" className="hover:underline">Bolos</a>
              <a href="/categoria/carnes" className="hover:underline">Carnes</a>
              <a href="/categoria/sopas" className="hover:underline">Sopas</a>
              <a href="/categoria/doces" className="hover:underline">Doces</a>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>

        <footer className="bg-gray-100 border-t mt-16 py-8 text-center text-sm text-gray-500">
          <p>© 2025 Receitas da Vovó — Culinária Brasileira com amor</p>
        </footer>
      </body>
    </html>
  );
}
