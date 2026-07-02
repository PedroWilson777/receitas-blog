#!/usr/bin/env node
/**
 * Gera uma receita nova usando Claude API e salva como MDX
 * Rodado pelo GitHub Actions a cada 30 minutos
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { traduzirTitulo } from "./traducoes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new Anthropic();
const PEXELS_KEY = process.env.PEXELS_API_KEY;

async function buscarFoto(query) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`, {
    headers: { Authorization: PEXELS_KEY },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.photos?.[0]?.src?.large2x ?? null;
}

// Tenta várias queries (da mais específica pra mais genérica) até achar uma foto.
// Garante que toda receita publicada tenha imagem real — nunca publica sem foto.
async function buscarImagem(titulo, categorias) {
  if (!PEXELS_KEY) return null;

  const tentativas = [
    traduzirTitulo(titulo),
    titulo.split(" ").slice(0, 3).join(" ") + " food",
    `${categorias?.[0] ?? "homemade"} Brazilian food photography`,
    "Brazilian homemade food dish",
  ];

  for (const query of tentativas) {
    for (let i = 0; i < 2; i++) {
      try {
        const url = await buscarFoto(query);
        if (url) return url;
      } catch {
        // tenta de novo / próxima query
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return null;
}

// Banco de temas para variar os títulos (long-tail keywords reais)
const TEMAS = [
  // Clássicos caseiros
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
  // Receitas caseiras brasileiras
  "almôndegas ao molho de tomate caseiro",
  "escondidinho de carne moída com purê",
  "carne assada na panela de pressão suculenta",
  "frango caipira ensopado com legumes",
  "tutu de feijão mineiro com torresmo",
  "caldo de feijão cremoso com bacon",
  "arroz carreteiro gaúcho tradicional",
  "farofa de banana com manteiga",
  "macarrão ao molho branco com frango",
  "lasanha de carne moída com molho bechamel",
  "nhoque de batata ao molho pomodoro",
  "polenta cremosa com linguiça e cogumelos",
  "buchada de aves com legumes",
  "bolinho de bacalhau crocante",
  "moqueca de peixe baiana com azeite de dendê",
  "vatapá de camarão com amendoim",
  "bobó de camarão cremoso",
  "peixe grelhado com molho de limão e ervas",
  "tilápia assada no forno com alho",
  "salmão grelhado com legumes salteados",
  "picanha assada na churrasqueira",
  "costela de porco assada lentamente",
  "frango xadrez com castanha de caju",
  "strogonoff de frango com creme de leite",
  "bife acebolado com fritas caseiras",
  "espaguete à carbonara brasileira",
  "risoto de funghi com parmesão",
  "torta de legumes com massa podre",
  "empadão de frango cremoso",
  "coxas de frango assadas com ervas",
  "salada de macarrão com atum e maionese",
  "salpicão de frango com batata palha",
  "vinagrete brasileiro clássico",
  "tabule árabe com hortelã",
  "bolo de chocolate fofinho de liquidificador",
  "bolo de fubá caipira com erva-doce",
  "bolo de banana com canela e aveia",
  "bolo gelado de coco com leite condensado",
  "pavê de chocolate com biscoito",
  "mousse de maracujá cremoso",
  "pudim de tapioca com coco",
  "quindim tradicional baiano",
  "cocada cremosa de forno",
  "beijinho de coco para festa",
  "brigadeiro de pistache gourmet",
  "doce de leite caseiro na panela de pressão",
  "compota de goiaba com queijo minas",
  "canjica branca com amendoim",
  "curau de milho verde com canela",
  "sopa creme de abóbora com gengibre",
  "caldo verde com linguiça calabresa",
  "sopa de cebola gratinada com queijo",
  "creme de milho verde simples",
  "sopa de mandioca com frango desfiado",
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

  // Gera MDX com frontmatter SEO-otimizado (schema.org vai no frontmatter como JSON string)
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
ingredientes: ${JSON.stringify(receita.ingredientes)}
passos: ${JSON.stringify(receita.modo_preparo)}
dicas: "${receita.dicas.replace(/"/g, "'")}"
variacoes: "${receita.variacoes.replace(/"/g, "'")}"
image: "/og-receita.jpg"
---

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

  // Busca imagem no Pexels — obrigatória. Nunca publica receita sem foto real.
  const imageUrl = await buscarImagem(receita.titulo, receita.categorias);

  if (!imageUrl) {
    console.error(`❌ Não foi possível encontrar imagem para "${receita.titulo}". Receita NÃO publicada — tentaremos de novo no próximo ciclo.`);
    process.exitCode = 1;
    return;
  }

  const mdxFinal = mdxContent.replace('image: "/og-receita.jpg"', `image: "${imageUrl}"`);

  const filename = `${data}-${slug}.mdx`;
  const filepath = path.join(__dirname, "../content/receitas", filename);

  fs.writeFileSync(filepath, mdxFinal, "utf-8");

  // Registra qual receita acabou de sair — o postar-pinterest.js lê daqui (não é commitado)
  fs.writeFileSync(
    path.join(__dirname, ".ultima-receita.json"),
    JSON.stringify({ filename, titulo: receita.titulo, slug }),
    "utf-8"
  );

  console.log(`✅ Receita salva: ${filename}`);
  console.log(`   Tokens usados: ${message.usage.input_tokens + message.usage.output_tokens}`);

  return { titulo: receita.titulo, slug, filename };
}

if (!PEXELS_KEY) {
  console.error("❌ PEXELS_API_KEY não configurada — não dá pra garantir imagem, abortando.");
  process.exitCode = 1;
} else {
  gerarReceita().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
