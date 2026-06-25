#!/usr/bin/env node
/**
 * Busca imagem relevante no Pexels para cada receita.
 * Uso: node --env-file=.env.local scripts/adicionar-imagens.js
 * Adicionar --force para refazer todas, mesmo as que já têm imagem.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const DIR = path.join(__dirname, "../content/receitas");
const FORCE = process.argv.includes("--force");

if (!PEXELS_KEY) {
  console.error("❌ PEXELS_API_KEY não configurada no .env.local");
  process.exit(1);
}

// Traduz termos brasileiros para inglês para melhor resultado no Pexels
const TRADUCOES = [
  [/bife acebolado/i, "beef steak with caramelized onions"],
  [/frango grelhado/i, "grilled chicken"],
  [/frango assado/i, "roasted chicken"],
  [/frango caipira/i, "rustic chicken stew"],
  [/frango xadrez/i, "chicken stir fry cashews"],
  [/coxas de frango/i, "chicken thighs roasted"],
  [/strogonoff de frango/i, "chicken stroganoff"],
  [/estrogonofe/i, "chicken stroganoff"],
  [/bolo de chocolate/i, "chocolate cake slice"],
  [/bolo de cenoura/i, "carrot cake"],
  [/bolo de milho/i, "corn cake"],
  [/bolo de banana/i, "banana bread cake"],
  [/bolo de fubá/i, "cornmeal cake"],
  [/bolo de coco/i, "coconut cake"],
  [/pão de queijo/i, "Brazilian cheese bread"],
  [/brigadeiro/i, "Brazilian chocolate truffle"],
  [/pudim/i, "Brazilian flan caramel"],
  [/mousse de maracujá/i, "passion fruit mousse"],
  [/cocada/i, "coconut candy dessert"],
  [/quindim/i, "Brazilian coconut custard"],
  [/canjica/i, "Brazilian corn pudding"],
  [/curau/i, "Brazilian corn pudding"],
  [/pavê/i, "Brazilian layered dessert"],
  [/feijão tropeiro/i, "Brazilian beans bacon sausage"],
  [/tutu de feijão/i, "Brazilian mashed beans"],
  [/caldo de feijão/i, "Brazilian bean soup"],
  [/arroz de forno/i, "baked rice casserole"],
  [/arroz carreteiro/i, "Brazilian rice beef"],
  [/farofa/i, "Brazilian toasted cassava flour"],
  [/escondidinho/i, "Brazilian beef mashed potato casserole"],
  [/carne assada/i, "Brazilian pot roast beef"],
  [/almôndegas/i, "meatballs tomato sauce"],
  [/picanha/i, "Brazilian picanha grilled beef"],
  [/costela/i, "slow cooked pork ribs"],
  [/moqueca/i, "Brazilian fish coconut stew"],
  [/bobó de camarão/i, "Brazilian shrimp coconut stew"],
  [/vatapá/i, "Brazilian shrimp peanut stew"],
  [/risoto de camarão/i, "shrimp risotto"],
  [/risoto de funghi/i, "mushroom risotto"],
  [/tilápia/i, "baked tilapia fish"],
  [/salmão/i, "grilled salmon"],
  [/peixe grelhado/i, "grilled fish fillet"],
  [/bolinho de bacalhau/i, "Portuguese codfish cakes"],
  [/macarrão/i, "pasta dish"],
  [/lasanha/i, "lasagna baked"],
  [/espaguete/i, "spaghetti pasta"],
  [/nhoque/i, "gnocchi"],
  [/polenta/i, "polenta creamy"],
  [/torta de frango/i, "chicken pie"],
  [/torta de legumes/i, "vegetable tart"],
  [/empadão/i, "Brazilian chicken pie"],
  [/quiche/i, "quiche"],
  [/omelete/i, "omelette egg"],
  [/sopa de legumes/i, "vegetable soup"],
  [/sopa creme de abóbora/i, "pumpkin cream soup"],
  [/caldo verde/i, "Portuguese green soup"],
  [/sopa de cebola/i, "French onion soup"],
  [/sopa de mandioca/i, "cassava soup"],
  [/creme de milho/i, "cream of corn soup"],
  [/salada caesar/i, "Caesar salad chicken"],
  [/salada de macarrão/i, "pasta salad"],
  [/salpicão/i, "Brazilian chicken salad"],
  [/tabule/i, "tabbouleh salad"],
  [/vinagrete/i, "Brazilian salsa tomato"],
  [/cookies/i, "homemade cookies"],
  [/vitamina/i, "fruit smoothie"],
  [/suco/i, "fresh fruit juice"],
];

function traduzirTitulo(titulo) {
  for (const [regex, traducao] of TRADUCOES) {
    if (regex.test(titulo)) return traducao + " food photography";
  }
  // Fallback: remove termos genéricos e adiciona "food"
  const limpo = titulo
    .replace(/receita|caseiro|caseira|simples|fácil|fácil|rápido|cremoso|cremosa|crocante|delicioso|deliciosa|gourmet|tradicional|brasileiro|brasileira|com|de|e|ao|na|no|para|–|-/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4)
    .join(" ");
  return limpo + " Brazilian food dish";
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
