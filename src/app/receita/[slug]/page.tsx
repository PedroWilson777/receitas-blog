import { getReceita, getAllReceitas } from "@/lib/receitas";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

export async function generateStaticParams() {
  const receitas = await getAllReceitas();
  return receitas.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const receita = await getReceita(params.slug);
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

export default async function ReceitaPage({ params }: { params: { slug: string } }) {
  const receita = await getReceita(params.slug);
  if (!receita) notFound();

  const fm = receita.frontmatter;

  // Schema.org Recipe para Google Rich Results
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
  };

  return (
    <>
      {/* Schema.org inject */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4">
        <a href="/" className="hover:underline">Início</a> › {fm.title}
      </nav>

      {/* Hero receita */}
      <div className="bg-orange-50 rounded-2xl p-8 mb-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{fm.title}</h1>
        <p className="text-gray-500 mb-6">{fm.description}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-white rounded-full px-3 py-1 shadow-sm">⏱️ Preparo: {fm.tempo_preparo}</span>
          <span className="bg-white rounded-full px-3 py-1 shadow-sm">🔥 Cozimento: {fm.tempo_cozimento}</span>
          <span className="bg-white rounded-full px-3 py-1 shadow-sm">🍽️ {fm.porcoes}</span>
          <span className="bg-white rounded-full px-3 py-1 shadow-sm">📊 {fm.dificuldade}</span>
          <span className="bg-white rounded-full px-3 py-1 shadow-sm">🌱 {fm.calorias}</span>
        </div>
      </div>

      {/* Ad slot topo */}
      <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center text-gray-400 text-sm mb-8">
        [Anúncio Google AdSense]
      </div>

      {/* Conteúdo MDX */}
      <article className="prose prose-orange max-w-none">
        <MDXRemote source={receita.content} />
      </article>

      {/* Ad slot rodapé */}
      <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center text-gray-400 text-sm mt-8">
        [Anúncio Google AdSense]
      </div>
    </>
  );
}
