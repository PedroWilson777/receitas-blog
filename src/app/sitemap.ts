import { getAllReceitas } from "@/lib/receitas";
import { CATEGORIAS } from "@/lib/categorias";

export default async function sitemap() {
  const receitas = await getAllReceitas();
  const base = "https://saboresdavovo.com.br";

  const receitaUrls = receitas.map((r) => ({
    url: `${base}/receita/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoriaUrls = CATEGORIAS.map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const paginasFixas = [
    { url: `${base}/sobre`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${base}/politica-de-privacidade`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 1 },
    ...categoriaUrls,
    ...receitaUrls,
    ...paginasFixas,
  ];
}
