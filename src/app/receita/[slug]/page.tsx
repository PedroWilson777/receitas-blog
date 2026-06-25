import { getReceita, getAllReceitas } from "@/lib/receitas";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

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

  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: fm.title,
    description: fm.description,
    datePublished: fm.date,
    prepTime: `PT${fm.tempo_preparo?.replace(/\D/g, "")}M`,
    cookTime: `PT${fm.tempo_cozimento?.replace(/\D/g, "")}M`,
    recipeYield: fm.porcoes,
    recipeCategory: fm.categorias?.[0] ?? "Prato Principal",
    recipeCuisine: "Brasileira",
    nutrition: { "@type": "NutritionInformation", calories: fm.calorias },
    recipeIngredient: fm.ingredientes ?? [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1">
        <a href="/" className="hover:text-orange-500 transition-colors">Início</a>
        <span>›</span>
        <span className="text-gray-600">{fm.title}</span>
      </nav>

      {/* Hero */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-orange-100">
        <div className="text-center mb-6">
          <div className="text-7xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 leading-tight">{fm.title}</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">{fm.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {[
            { icon: "⏱️", label: "Preparo", value: fm.tempo_preparo },
            { icon: "🔥", label: "Cozimento", value: fm.tempo_cozimento },
            { icon: "🍽️", label: "Porções", value: fm.porcoes },
            { icon: "📊", label: "Dificuldade", value: fm.dificuldade },
            { icon: "🌱", label: "Calorias", value: fm.calorias },
          ].map((item) => (
            <div key={item.label} className="bg-orange-50 rounded-xl p-3 text-center">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-sm font-semibold text-gray-700">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad slot topo */}
      <div className="bg-gray-100 rounded-xl h-20 flex items-center justify-center text-gray-300 text-xs mb-8 border border-dashed border-gray-200">
        Publicidade
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-100">
        <article className="prose prose-orange prose-lg max-w-none
          prose-headings:text-gray-800 prose-headings:font-bold
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-p:text-gray-600 prose-p:leading-relaxed
          prose-li:text-gray-600 prose-li:leading-relaxed
          prose-strong:text-gray-800
          prose-blockquote:bg-orange-50 prose-blockquote:border-orange-300 prose-blockquote:rounded-r-xl prose-blockquote:py-1
          prose-table:text-sm">
          <MDXRemote source={receita.content} />
        </article>
      </div>

      {/* Ad slot rodapé */}
      <div className="bg-gray-100 rounded-xl h-20 flex items-center justify-center text-gray-300 text-xs mt-8 border border-dashed border-gray-200">
        Publicidade
      </div>

      {/* Voltar */}
      <div className="mt-8 text-center">
        <a href="/" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition-colors">
          ← Ver mais receitas
        </a>
      </div>
    </>
  );
}
