#!/usr/bin/env node
/**
 * Posta a última receita gerada como pin no Pinterest
 * Rodado pelo GitHub Actions logo após o push da receita
 *
 * Credenciais (GitHub Secrets):
 *   PINTEREST_APP_ID + PINTEREST_APP_SECRET + PINTEREST_REFRESH_TOKEN  (recomendado — renova sozinho)
 *   ou PINTEREST_ACCESS_TOKEN  (para teste local — expira em 30 dias)
 *
 * Sem credenciais configuradas, o script apenas avisa e sai com sucesso —
 * a publicação da receita no blog nunca depende do Pinterest.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = "https://saboresdavovo.com.br";
const API = "https://api.pinterest.com/v5";

// Boards do Sabores da Vovó — espelham as categorias do blog (src/lib/categorias.ts).
// A primeira keyword que bater no título ou nas categorias da receita define o board.
// Boards são criados automaticamente na primeira vez que uma receita da categoria sai.
const BOARDS = [
  { keyword: "bolo", nome: "Bolos Caseiros da Vovó", descricao: "Receitas de bolo caseiro fofinho, fácil e testado — bolo de cenoura, chocolate, fubá e muito mais." },
  { keyword: "sopa", nome: "Sopas e Caldos", descricao: "Sopas cremosas e caldos quentinhos para toda a família — receitas fáceis e reconfortantes." },
  { keyword: "frango", nome: "Receitas com Frango", descricao: "Frango assado, grelhado, ensopado e cremoso — receitas práticas para o dia a dia." },
  { keyword: "peixe", nome: "Peixes e Frutos do Mar", descricao: "Moquecas, peixes assados e camarão — receitas brasileiras com sabor de casa." },
  { keyword: "carne", nome: "Carnes e Assados", descricao: "Carne assada, costela, picanha e receitas de panela suculentas e fáceis." },
  { keyword: "massa", nome: "Massas Caseiras", descricao: "Macarrão, lasanha, nhoque e massas caseiras com molhos que sempre dão certo." },
  { keyword: "salada", nome: "Saladas e Leves", descricao: "Saladas completas e refeições leves, práticas e cheias de sabor." },
  { keyword: "lanche", nome: "Lanches e Salgados", descricao: "Coxinha, bolinho, quiche e lanches caseiros para qualquer hora do dia." },
  { keyword: "doce", nome: "Doces e Sobremesas da Vovó", descricao: "Pudim, brigadeiro, mousse e doces de família — sobremesas fáceis e irresistíveis." },
  { keyword: "sobremesa", nome: "Doces e Sobremesas da Vovó", descricao: "Pudim, brigadeiro, mousse e doces de família — sobremesas fáceis e irresistíveis." },
];

const BOARD_PADRAO = { nome: "Receitas da Vovó", descricao: "Receitas caseiras brasileiras fáceis e testadas — comida de verdade com gostinho de casa." };

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// ── Credenciais ──────────────────────────────────────────────────────────────

async function obterAccessToken() {
  const { PINTEREST_ACCESS_TOKEN, PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REFRESH_TOKEN } = process.env;

  if (PINTEREST_APP_ID && PINTEREST_APP_SECRET && PINTEREST_REFRESH_TOKEN) {
    const basic = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
    const res = await fetch(`${API}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: PINTEREST_REFRESH_TOKEN,
      }),
    });
    if (!res.ok) throw new Error(`Falha ao renovar token Pinterest: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.access_token;
  }

  if (PINTEREST_ACCESS_TOKEN) return PINTEREST_ACCESS_TOKEN;

  return null;
}

// ── Receita ──────────────────────────────────────────────────────────────────

function encontrarUltimaReceita() {
  // Caminho principal: gerar-receita.js registra qual arquivo acabou de criar
  const registro = path.join(__dirname, ".ultima-receita.json");
  const dir = path.join(__dirname, "../content/receitas");

  let filename;
  if (fs.existsSync(registro)) {
    filename = JSON.parse(fs.readFileSync(registro, "utf-8")).filename;
  } else {
    // Fallback: arquivo mais recente pelo prefixo de data no nome
    const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).sort();
    filename = arquivos[arquivos.length - 1];
  }

  if (!filename) return null;
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) return null;

  const { data } = matter(fs.readFileSync(filepath, "utf-8"));
  return data;
}

// ── Boards ───────────────────────────────────────────────────────────────────

function escolherBoard(receita) {
  const texto = normalizar(`${receita.title} ${(receita.categorias ?? []).join(" ")}`);
  return BOARDS.find((b) => texto.includes(b.keyword)) ?? BOARD_PADRAO;
}

async function garantirBoard(token, board) {
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const res = await fetch(`${API}/boards?page_size=100`, { headers });
  if (!res.ok) throw new Error(`Falha ao listar boards: ${res.status} ${await res.text()}`);
  const { items } = await res.json();

  const existente = items?.find((b) => normalizar(b.name) === normalizar(board.nome));
  if (existente) return existente.id;

  console.log(`Board "${board.nome}" não existe — criando...`);
  const criar = await fetch(`${API}/boards`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: board.nome, description: board.descricao, privacy: "PUBLIC" }),
  });
  if (!criar.ok) throw new Error(`Falha ao criar board: ${criar.status} ${await criar.text()}`);
  const novo = await criar.json();
  return novo.id;
}

// ── Pin ──────────────────────────────────────────────────────────────────────

async function criarPin(token, boardId, receita) {
  const titulo = String(receita.title).slice(0, 100);
  const descricao = `${receita.description} Receita completa, testada e fácil de fazer no blog Sabores da Vovó. 👵🧡`.slice(0, 500);
  const link = `${SITE}/receita/${receita.slug}`;

  const res = await fetch(`${API}/pins`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      board_id: boardId,
      title: titulo,
      description: descricao,
      alt_text: titulo,
      link,
      media_source: { source_type: "image_url", url: receita.image },
    }),
  });
  if (!res.ok) throw new Error(`Falha ao criar pin: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const token = await obterAccessToken();
  if (!token) {
    console.log("⏭️ Pinterest não configurado (sem PINTEREST_* nos secrets) — pulando sem erro.");
    return;
  }

  const receita = encontrarUltimaReceita();
  if (!receita) {
    console.log("⏭️ Nenhuma receita encontrada para postar — pulando.");
    return;
  }
  if (!receita.image || !String(receita.image).startsWith("http")) {
    console.log(`⏭️ Receita "${receita.title}" sem imagem pública — pin precisa de imagem, pulando.`);
    return;
  }

  const board = escolherBoard(receita);
  console.log(`📌 Postando "${receita.title}" no board "${board.nome}"...`);

  const boardId = await garantirBoard(token, board);
  const pin = await criarPin(token, boardId, receita);

  console.log(`✅ Pin criado: https://pinterest.com/pin/${pin.id}`);
  console.log(`   Link do pin → ${SITE}/receita/${receita.slug}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
