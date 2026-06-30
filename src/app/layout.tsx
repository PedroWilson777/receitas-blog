import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Sabores da Vovó",
    default: "Sabores da Vovó — Receitas Caseiras Brasileiras",
  },
  description: "Receitas caseiras brasileiras fáceis e deliciosas. Aprenda a cozinhar pratos tradicionais com ingredientes simples.",
  metadataBase: new URL("https://saboresdavovo.com.br"),
  openGraph: { type: "website", locale: "pt_BR", siteName: "Sabores da Vovó" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {/* Header — fundo na mesma cor creme da logo, pra ela encaixar sem corte */}
        <header className="bg-[#FEF2E3] shadow-md border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Sabores da Vovó" className="w-14 h-14 rounded-full object-cover" />
              <div>
                <div className="text-xl font-bold leading-none text-amber-900">Sabores da Vovó</div>
                <div className="text-xs text-amber-700">Receitas caseiras brasileiras</div>
              </div>
            </a>
            <nav className="hidden md:flex gap-5 text-sm font-medium text-amber-800">
              {["Bolos","Carnes","Sopas","Massas","Doces","Saladas"].map(c => (
                <a key={c} href={`/categoria/${c.toLowerCase()}`} className="hover:text-orange-600 transition-colors">{c}</a>
              ))}
            </nav>
          </div>
        </header>

        {children}

        <footer className="bg-orange-700 text-white mt-12 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-orange-200">
            <p className="text-white font-semibold text-base mb-1">🍳 Sabores da Vovó</p>
            <p>© {new Date().getFullYear()} Culinária Brasileira com amor · saboresdavovo.com.br</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
