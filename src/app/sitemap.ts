import { getAllReceitas } from "@/lib/receitas";

export default async function sitemap() {
  const receitas = await getAllReceitas();
  const base = "https://receitasdavovo.com.br";

  const receitaUrls = receitas.map((r) => ({
    url: `${base}/receita/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 1 },
    ...receitaUrls,
  ];
}
