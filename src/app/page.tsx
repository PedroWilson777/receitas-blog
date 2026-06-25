import { getAllReceitas } from "@/lib/receitas";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

const EMOJI_MAP: [string, string][] = [
  ["bolo","🎂"],["cookie","🍪"],["torta","🥧"],["frango","🍗"],["peixe","🐟"],
  ["carne","🥩"],["sopa","🍲"],["massa","🍝"],["macarrão","🍝"],["salada","🥗"],
  ["arroz","🍚"],["feijão","🫘"],["ovo","🍳"],["doce","🍮"],["pudim","🍮"],
  ["vitamina","🥤"],["suco","🍹"],["pão","🍞"],["pizza","🍕"],["risoto","🍚"],
];
function emoji(titulo: string) {
  const t = titulo.toLowerCase();
  for (const [k, e] of EMOJI_MAP) if (t.includes(k)) return e;
  return "🍽️";
}

export default async function Home() {
  const receitas = await getAllReceitas();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Sabores da Vovó</h1>
        <p className="text-orange-100 text-lg">Receitas caseiras brasileiras fáceis e deliciosas</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          {receitas.length} receitas publicadas · nova receita a cada 30 min
        </div>
      </section>

      <div className="flex gap-8">
        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-700 mb-5 pb-2 border-b border-gray-200">
            🕐 Receitas Recentes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {receitas.map((r) => (
              <Link
                key={r.slug}
                href={`/receita/${r.slug}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex"
              >
                <div className="w-24 h-24 bg-orange-50 flex-shrink-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {emoji(r.titulo)}
                </div>
                <div className="p-3 flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
                    {r.titulo}
                  </h3>
                  <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
                    <span>⏱️ {r.tempo_preparo}</span>
                    <span>·</span>
                    <span>{r.dificuldade}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* Sidebar com ads */}
        <aside className="hidden lg:flex flex-col gap-6 w-64 flex-shrink-0">
          <AdSlot size="sidebar" />
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-700 text-sm mb-3">🔥 Categorias</h3>
            <div className="flex flex-wrap gap-2">
              {["Bolos","Carnes","Sopas","Massas","Doces","Frango","Saladas","Lanches"].map(c => (
                <a key={c} href={`/categoria/${c.toLowerCase()}`}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full transition-colors">
                  {c}
                </a>
              ))}
            </div>
          </div>
          <AdSlot size="sidebar" />
        </aside>
      </div>
    </div>
  );
}
