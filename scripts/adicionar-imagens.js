#!/usr/bin/env node
/**
 * Adiciona imagens do Pexels em receitas que ainda têm o placeholder /og-receita.jpg
 * Uso: node --env-file=.env.local scripts/adicionar-imagens.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const DIR = path.join(__dirname, "../content/receitas");

if (!PEXELS_KEY) {
  console.error("❌ PEXELS_API_KEY não configurada no .env.local");
  process.exit(1);
}

async function buscarImagem(titulo) {
  const query = encodeURIComponent(titulo.split(" ").slice(0, 4).join(" "));
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${query}&per_page=3&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  // Pega a segunda foto se disponível (evita sempre o mesmo resultado)
  return data.photos?.[1]?.src?.large2x ?? data.photos?.[0]?.src?.large2x ?? null;
}

async function main() {
  const arquivos = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  let atualizados = 0;

  for (const arquivo of arquivos) {
    const filepath = path.join(DIR, arquivo);
    const conteudo = fs.readFileSync(filepath, "utf-8");

    // Pula se já tem imagem real
    if (conteudo.includes("image: \"https://")) continue;

    // Extrai título do frontmatter
    const match = conteudo.match(/^title:\s*"(.+?)"/m);
    if (!match) continue;
    const titulo = match[1];

    console.log(`🔍 Buscando imagem: ${titulo}`);
    const imageUrl = await buscarImagem(titulo);

    if (!imageUrl) {
      console.log(`   ⚠️  Sem resultado`);
      continue;
    }

    // Insere ou substitui o campo image no frontmatter
    let novo;
    if (conteudo.includes('image: "/og-receita.jpg"')) {
      novo = conteudo.replace('image: "/og-receita.jpg"', `image: "${imageUrl}"`);
    } else {
      // Adiciona antes do fechamento do frontmatter
      novo = conteudo.replace(/^---\n([\s\S]*?)\n---/, (_, body) => `---\n${body}\nimage: "${imageUrl}"\n---`);
    }
    fs.writeFileSync(filepath, novo, "utf-8");
    console.log(`   ✅ Imagem adicionada`);
    atualizados++;

    // Respeita rate limit do Pexels (200 req/hora)
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\n✅ ${atualizados} receitas atualizadas com imagens`);
}

main().catch(console.error);
