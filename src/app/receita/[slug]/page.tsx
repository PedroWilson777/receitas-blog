import { getReceita, getAllReceitas } from "@/lib/receitas";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";

export async function generateStaticParams() {
  const receitas = await getAllReceitas();
  return receitas.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const receita = await getReceita(slug);
  if (!receita) return {};
  return {
    title: receita.frontmatter.title,
    description: receita.frontmatter.description,
    openGraph: {
      title: receita.frontmatter.title,
      description: receita.frontmatter.description,
      type: "article",
      publishedTime: receita.frontmatter.date,
    },
  };
}

export default async function ReceitaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const receita = await getReceita(slug);
  if (!receita) notFound();

  const fm = receita.frontmatter;

  // Schema.org para Google Rich Results
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: fm.title,
    description: fm.description,
    datePublished: fm.date,
    prepTime: `PT${String(fm.tempo_preparo).replace(/\D/g, "")}M`,
    cookTime: `PT${String(fm.tempo_cozimento).replace(/\D/g, "")}M`,
    recipeYield: fm.porcoes,
    recipeCategory: fm.categorias?.[0] ?? "Prato Principal",
    recipeCuisine: "Brasileira",
    nutrition: { "@type": "NutritionInformation", calories: fm.calorias },
    recipeIngredient: fm.ingredientes ?? [],
  };

  const ingredientes: string[] = fm.ingredientes ?? [];
  const passos: string[] = fm.passos ?? [];
  const dicas: string = fm.dicas ?? "";
  const variacoes: string = fm.variacoes ?? "";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <a href="/" className="hover:text-orange-500">Início</a>
          <span>›</span>
          {fm.categorias?.[0] && (
            <>
              <a href={`/categoria/${fm.categorias[0]}`} className="hover:text-orange-500 capitalize">{fm.categorias[0]}</a>
              <span>›</span>
            </>
          )}
          <span className="text-gray-600 line-clamp-1">{fm.title}</span>
        </nav>

        <div className="flex gap-8 items-start">
          {/* Conteúdo principal */}
          <article className="flex-1 min-w-0">
            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{fm.title}</h1>
            <p className="text-gray-500 mb-5">{fm.description}</p>

            {/* Barra de infos — estilo TudoGostoso */}
            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
              {[
                { icon: "⏱️", label: "Preparo", value: fm.tempo_preparo },
                { icon: "🔥", label: "Cozimento", value: fm.tempo_cozimento },
                { icon: "🍽️", label: "Porções", value: fm.porcoes },
                { icon: "📊", label: "Dificuldade", value: fm.dificuldade },
                { icon: "🌱", label: "Calorias", value: fm.calorias },
              ].map((item) => (
                <div key={item.label} className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-center min-w-[90px]">
                  <div className="text-lg mb-0.5">{item.icon}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</div>
                  <div className="text-sm font-bold text-gray-700">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Imagem */}
            {fm.image && fm.image !== "/og-receita.jpg" ? (
              <div className="rounded-2xl overflow-hidden mb-8 h-64 md:h-80">
                <img src={fm.image} alt={fm.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-2xl h-56 flex items-center justify-center text-7xl mb-8">
                🍽️
              </div>
            )}

            {/* Ingredientes + Modo de preparo lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

              {/* Ingredientes */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full inline-block"></span>
                  Ingredientes
                </h2>
                {ingredientes.length > 0 ? (
                  <ul className="space-y-2">
                    {ingredientes.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 py-2 border-b border-gray-100">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">Ver ingredientes no preparo abaixo.</p>
                )}
              </div>

              {/* Modo de preparo */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-500 rounded-full inline-block"></span>
                  Modo de Preparo
                </h2>
                {passos.length > 0 ? (
                  <ol className="space-y-4">
                    {passos.map((passo, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-700">
                        <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed pt-0.5">{passo.replace(/^Passo \d+:\s*/i, "")}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-400 text-sm">Modo de preparo não disponível.</p>
                )}
              </div>
            </div>

            {/* Dica do chef */}
            {dicas && (
              <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-6">
                <h3 className="font-bold text-amber-800 mb-1 flex items-center gap-2">👨‍🍳 Dica do Chef</h3>
                <p className="text-amber-700 text-sm leading-relaxed">{dicas}</p>
              </div>
            )}

            {/* Variações */}
            {variacoes && (
              <div className="bg-green-50 border-l-4 border-green-400 rounded-r-xl p-5 mb-6">
                <h3 className="font-bold text-green-800 mb-1 flex items-center gap-2">🔄 Variações</h3>
                <p className="text-green-700 text-sm leading-relaxed">{variacoes}</p>
              </div>
            )}

            {/* Voltar */}
            <a href="/" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition-colors text-sm">
              ← Ver mais receitas
            </a>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-6 w-60 flex-shrink-0">
            <AdSlot size="sidebar" />
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-700 text-sm mb-3">🔥 Categorias</h3>
              <div className="flex flex-wrap gap-2">
                {["Bolos","Carnes","Sopas","Massas","Doces","Frango","Saladas"].map(c => (
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
    </>
  );
}
