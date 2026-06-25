import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Sabores da Vovó",
    default: "Sabores da Vovó — Receitas Caseiras Brasileiras",
  },
  description:
    "Receitas caseiras brasileiras fáceis e deliciosas. Aprenda a cozinhar pratos tradicionais com ingredientes simples.",
  metadataBase: new URL("https://saboresdavovo.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Sabores da Vovó",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} bg-orange-50 min-h-screen`}>
        {/* Header */}
        <header className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <div>
                <div className="text-lg font-bold text-orange-600 leading-none">Sabores da Vovó</div>
                <div className="text-xs text-gray-400">Receitas caseiras brasileiras</div>
              </div>
            </a>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
              <a href="/categoria/bolos" className="hover:text-orange-500 transition-colors">🎂 Bolos</a>
              <a href="/categoria/carnes" className="hover:text-orange-500 transition-colors">🥩 Carnes</a>
              <a href="/categoria/sopas" className="hover:text-orange-500 transition-colors">🍲 Sopas</a>
              <a href="/categoria/doces" className="hover:text-orange-500 transition-colors">🍮 Doces</a>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <footer className="bg-white border-t border-orange-100 mt-16 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
            <p className="text-base mb-1">🍳 Sabores da Vovó</p>
            <p>© {new Date().getFullYear()} Culinária Brasileira feita com amor</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
