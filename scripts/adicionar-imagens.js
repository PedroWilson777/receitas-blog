#!/usr/bin/env node
/**
 * Busca imagem relevante no Pexels para cada receita.
 * Uso: node --env-file=.env.local scripts/adicionar-imagens.js
 * Adicionar --force para refazer todas, mesmo as que já têm imagem.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { traduzirTitulo } from "./traducoes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const DIR = path.join(__dirname, "../content/receitas");
const FORCE = process.argv.includes("--force");

if (!PEXELS_KEY) {
  console.error("❌ PEXELS_API_KEY não configurada no .env.local");
  process.exit(1);
}

async function buscarImagem(titulo) {
  const query = traduzirTitulo(titulo);
  console.log(`   🔎 Query: "${query}"`);

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.photos?.length) return null;

  // Prefere fotos que tenham "food" nos tags, senão pega a primeira
  return data.photos[0]?.src?.large2x ?? null;
}

async function main() {
  const arquivos = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx")).sort();
  let atualizados = 0;

  for (const arquivo of arquivos) {
    const filepath = path.join(DIR, arquivo);
    const conteudo = fs.readFileSync(filepath, "utf-8");

    if (!FORCE && conteudo.includes('image: "https://')) {
      // já tem imagem, pula (use --force pra refazer tudo)
      continue;
    }

    const match = conteudo.match(/^title:\s*"(.+?)"/m);
    if (!match) continue;
    const titulo = match[1];

    console.log(`\n🍽️  ${titulo}`);
    const imageUrl = await buscarImagem(titulo);

    if (!imageUrl) {
      console.log(`   ⚠️  Sem resultado`);
      continue;
    }

    let novo;
    if (conteudo.includes('image: "/og-receita.jpg"')) {
      novo = conteudo.replace('image: "/og-receita.jpg"', `image: "${imageUrl}"`);
    } else if (conteudo.includes('image: "https://')) {
      novo = conteudo.replace(/image: "https:\/\/[^"]+"/m, `image: "${imageUrl}"`);
    } else {
      // Insere antes do segundo --- (funciona com \r\n e \n)
      const closingFence = conteudo.indexOf('\n---', 3);
      if (closingFence === -1) continue;
      novo = conteudo.slice(0, closingFence) + `\nimage: "${imageUrl}"` + conteudo.slice(closingFence);
    }

    fs.writeFileSync(filepath, novo, "utf-8");
    console.log(`   ✅ OK`);
    atualizados++;

    await new Promise((r) => setTimeout(r, 700));
  }

  console.log(`\n✅ ${atualizados} receitas atualizadas`);
}

main().catch(console.error);
