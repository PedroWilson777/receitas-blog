#!/usr/bin/env node
/**
 * Gera uma receita nova usando Claude API e salva como MDX
 * Rodado pelo GitHub Actions a cada 30 minutos
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic(); // usa ANTHROPIC_API_KEY do env

// Banco de temas para variar os títulos (long-tail keywords reais)
const TEMAS = [
  "frango grelhado para emagrecer",
  "bolo de cenoura sem glúten",
  "feijão tropeiro mineiro tradicional",
  "arroz de forno cremoso",
  "pão de queijo crocante",
  "brigadeiro gourmet de colher",
  "sopa de legumes para criança",
  "frango assado com batata para diabéticos",
  "torta de frango rápida no liquidificador",
  "vitamina de banana com aveia",
  "macarrão alho e óleo simples",
  "bolo de milho de lata fácil",
  "estrogonofe de frango cremoso",
  "coxinha de batata sem fritar",
  "pudim de leite condensado tradicional",
  "risoto de camarão simples",
  "salada caesar com frango",
  "omelete recheada proteica",
  "quiche de queijo e presunto",
  "cookies de aveia e banana",
];

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function temaJaExiste(slug) {
  const dir = path.join(__dirname, "../content/receitas");
  if (!fs.existsSync(dir)) return false;
  const arquivos = fs.readdirSync(dir);
  return arquivos.some((f) => f.includes(slug));
}

async function gerarReceita() {
  // Escolhe tema aleatório que ainda não existe
  let tema;
  for (const t of TEMAS.sort(() => Math.random() - 0.5)) {
    if (!temaJaExiste(slugify(t))) {
      tema = t;
      break;
    }
  }

  if (!tema) {
    console.log("Todos os temas já foram usados. Adicionando variação...");
    tema = TEMAS[Math.floor(Math.random() * TEMAS.length)] + " versão 2";
  }

  console.log(`Gerando receita: ${tema}`);

  const prompt = `Você é um chef brasileiro especialista em culinária caseira. Crie uma receita completa e original para: "${tema}".

Responda EXATAMENTE neste formato JSON (sem markdown, apenas JSON puro):

{
  "titulo": "Título atraente e descritivo da receita",
  "descricao": "Descrição apetitosa de 2 frases para SEO (~150 chars)",
  "tempo_preparo": "X minutos",
  "tempo_cozimento": "X minutos",
  "porcoes": "X porções",
  "dificuldade": "Fácil|Médio|Difícil",
  "calorias": "XXX kcal por porção",
  "categorias": ["categoria1", "categoria2"],
  "ingredientes": [
    "2 xícaras de farinha de trigo",
    "..."
  ],
  "modo_preparo": [
    "Passo 1: descrição detalhada",
    "Passo 2: ...",
    "..."
  ],
  "dicas": "Dica especial do chef para deixar a receita perfeita",
  "variacoes": "Sugestão de variação ou substituição de ingrediente"
}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  let jsonText = message.content[0].text.trim();
  // Remove markdown code fences se presentes
  jsonText = jsonText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const receita = JSON.parse(jsonText);

  // Gera slug e data
  const slug = slugify(receita.titulo);
  const agora = new Date();
  const data = agora.toISOString().split("T")[0];
  const timestamp = agora.toISOString();

  // Gera MDX com frontmatter SEO-otimizado e Schema.org
  const mdxContent = `---
title: "${receita.titulo}"
description: "${receita.descricao}"
date: "${data}"
slug: "${slug}"
categorias: ${JSON.stringify(receita.categorias)}
tempo_preparo: "${receita.tempo_preparo}"
tempo_cozimento: "${receita.tempo_cozimento}"
porcoes: "${receita.porcoes}"
dificuldade: "${receita.dificuldade}"
calorias: "${receita.calorias}"
image: "/og-receita.jpg"
---

export const schema = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "${receita.titulo}",
  "description": "${receita.descricao}",
  "datePublished": "${timestamp}",
  "prepTime": "PT${receita.tempo_preparo.replace(/\D/g, "")}M",
  "cookTime": "PT${receita.tempo_cozimento.replace(/\D/g, "")}M",
  "recipeYield": "${receita.porcoes}",
  "recipeCategory": "${receita.categorias[0] || "Prato Principal"}",
  "recipeCuisine": "Brasileira",
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "${receita.calorias}"
  },
  "recipeIngredient": ${JSON.stringify(receita.ingredientes)},
  "recipeInstructions": ${JSON.stringify(
    receita.modo_preparo.map((passo, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "text": passo,
    }))
  )}
}

# ${receita.titulo}

${receita.descricao}

## Informações

| | |
|---|---|
| ⏱️ Preparo | ${receita.tempo_preparo} |
| 🔥 Cozimento | ${receita.tempo_cozimento} |
| 🍽️ Porções | ${receita.porcoes} |
| 📊 Dificuldade | ${receita.dificuldade} |
| 🌱 Calorias | ${receita.calorias} |

## Ingredientes

${receita.ingredientes.map((i) => `- ${i}`).join("\n")}

## Modo de Preparo

${receita.modo_preparo.map((p, i) => `${i + 1}. ${p}`).join("\n\n")}

## Dica do Chef

> ${receita.dicas}

## Variações

${receita.variacoes}
`;

  const filename = `${data}-${slug}.mdx`;
  const filepath = path.join(__dirname, "../content/receitas", filename);

  fs.writeFileSync(filepath, mdxContent, "utf-8");
  console.log(`✅ Receita salva: ${filename}`);
  console.log(`   Tokens usados: ${message.usage.input_tokens + message.usage.output_tokens}`);

  return { titulo: receita.titulo, slug, filename };
}

gerarReceita().catch(console.error);
