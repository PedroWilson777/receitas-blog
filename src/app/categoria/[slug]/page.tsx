import { getAllReceitas } from "@/lib/receitas";
import { getCategoria, receitaPertenceCategoria, CATEGORIAS } from "@/lib/categorias";
import RecipeCard from "@/components/RecipeCard";
import AdSlot from "@/components/AdSlot";
import { notFound, redirect } from "next/navigation";

export async function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) return {};
  return {
    title: `Receitas de ${categoria.label}`,
    description: `Receitas caseiras de ${categoria.label.toLowerCase()} no Sabores da Vovó.`,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) notFound();
  // Canonicaliza maiúsculas/minúsculas — /categoria/Doces e /categoria/doces
  // não podem ser duas URLs 200 com o mesmo conteúdo (duplicidade pro Google).
  if (slug !== categoria.slug) redirect(`/categoria/${categoria.slug}`);

  const todasReceitas = await getAllReceitas();
  const receitas = todasReceitas.filter((r) => receitaPertenceCategoria(r, categoria));

  const recentes = receitas.slice(0, 12);
  const restante = receitas.slice(12, 24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl p-8 mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">
          {categoria.emoji} Receitas de {categoria.label}
        </h1>
        <p className="text-orange-100">
          {receitas.length} {receitas.length === 1 ? "receita encontrada" : "receitas encontradas"}
        </p>
      </section>

      {receitas.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          Ainda não temos receitas de {categoria.label.toLowerCase()} publicadas — volte em breve.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-5 pb-2 border-b border-gray-200">
              🆕 Novidades
            </h2>
            <div className="flex flex-col gap-4">
              {recentes.map((r) => (
                <RecipeCard key={r.slug} receita={r} />
              ))}
            </div>
          </div>

          {restante.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-5 pb-2 border-b border-gray-200">
                Mais Receitas de {categoria.label}
              </h2>
              <div className="flex flex-col gap-4">
                {restante.map((r) => (
                  <RecipeCard key={r.slug} receita={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        <AdSlot size="banner" />
      </div>
    </div>
  );
}
