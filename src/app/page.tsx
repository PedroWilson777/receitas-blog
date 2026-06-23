import { getAllReceitas } from "@/lib/receitas";
import Link from "next/link";

export default async function Home() {
  const receitas = await getAllReceitas();
  const recentes = receitas.slice(0, 12);

  return (
    <>
      {/* Hero */}
      <section className="text-center py-10 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Receitas Caseiras Brasileiras
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Pratos simples, deliciosos e fáceis de fazer. Novas receitas toda hora!
        </p>
      </section>

      {/* Grid de receitas */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Receitas Recentes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentes.map((receita) => (
            <Link
              key={receita.slug}
              href={`/receita/${receita.slug}`}
              className="block bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden border border-gray-100"
            >
              <div className="bg-orange-50 h-40 flex items-center justify-center text-5xl">
                🍽️
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                  {receita.titulo}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {receita.descricao}
                </p>
                <div className="mt-3 flex gap-2 text-xs text-gray-400">
                  <span>⏱️ {receita.tempo_preparo}</span>
                  <span>•</span>
                  <span>📊 {receita.dificuldade}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
