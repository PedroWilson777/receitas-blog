import { getAllReceitas } from "@/lib/receitas";

// Feed RSS do blog — usado pelo auto-publish do Pinterest (Configurações → Importar conteúdo)
// e por qualquer leitor RSS. Regenerado a cada build (o site rebuilda a cada receita nova).
export const dynamic = "force-static";

const BASE = "https://saboresdavovo.com.br";

function escapeXml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const receitas = (await getAllReceitas()).slice(0, 50);

  const items = receitas
    .map((r) => {
      const url = `${BASE}/receita/${r.slug}`;
      const pubDate = r.date ? new Date(`${r.date}T12:00:00-03:00`).toUTCString() : new Date().toUTCString();
      const imagem = r.image
        ? `\n      <enclosure url="${escapeXml(r.image)}" type="image/jpeg" length="0"/>\n      <media:content url="${escapeXml(r.image)}" medium="image"/>`
        : "";
      return `    <item>
      <title>${escapeXml(r.titulo)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(r.descricao)}</description>${imagem}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sabores da Vovó — Receitas Caseiras Brasileiras</title>
    <link>${BASE}</link>
    <description>Receitas caseiras brasileiras fáceis e testadas: bolos, pães, tortas, sopas e doces de família. Receitas novas todos os dias.</description>
    <language>pt-BR</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
