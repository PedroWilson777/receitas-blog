import { getAllReceitas } from "@/lib/receitas";
import Link from "next/link";

const EMOJIS: Record<string, string> = {
  bolos: "🎂", carnes: "🥩", sopas: "🍲", doces: "🍮",
  frango: "🍗", peixe: "🐟", massas: "🍝", saladas: "🥗",
  lanches: "🥪", bebidas: "🥤",
};

function getEmoji(categorias: string[]) {
  for (const c of categorias) {
    for (const [key, emoji] of Object.entries(EMOJIS)) {
      if (c.toLowerCase().includes(key)) return emoji;
    }
  }
  return "🍽️";
}

export default async function Home() {
  const receitas = await getAllReceitas();
  const recentes = receitas.slice(0, 12);

  return (
    <>
      {/* Hero */}
      <section className="text-center py-12 mb-10">
        <div className="text-5xl mb-4">👵🍳</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Receitas Caseiras Brasileiras
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Pratos simples, deliciosos e fáceis de fazer. Nova receita publicada toda hora!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          {receitas.length} receitas publicadas
        </div>
      </section>

      {/* Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          📋 Receitas Recentes
        </h2>
        {recentes.length === 0 ? (
          <p className="text-gray-400 text-center py-16">Carregando receitas...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentes.map((receita) => (
              <Link
                key={receita.slug}
                href={`/receita/${receita.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-orange-100 hover:border-orange-300"
              >
                <div className="bg-gradient-to-br from-orange-100 to-amber-50 h-36 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-200">
                  {getEmoji(receita.categorias)}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {receita.titulo}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                    {receita.descricao}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                      ⏱️ {receita.tempo_preparo}
                    </span>
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      {receita.dificuldade}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
