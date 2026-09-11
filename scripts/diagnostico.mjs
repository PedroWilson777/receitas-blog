#!/usr/bin/env node
/**
 * Diagnóstico read-only das 829 receitas publicadas: duplicatas exatas e
 * quase-exatas, colisão de slug, contaminação de categoria, reuso de foto
 * e alegações de saúde não comprovadas.
 *
 * NÃO apaga, NÃO edita, NÃO commita nada. Só lê content/receitas/ e escreve
 * um relatório em outputs/diagnostico-<data>.json e um resumo no console.
 *
 * Uso: node scripts/diagnostico.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "../content/receitas");
const OUT_DIR = path.join(__dirname, "../outputs");

// Espelha src/lib/categorias.ts — mantenha os dois em sincronia.
const CATEGORIAS = [
  { label: "Bolos", slug: "bolos", sinonimos: ["bolo", "bolos", "cupcake", "cupcakes"] },
  { label: "Carnes", slug: "carnes", sinonimos: ["carne", "carnes", "bovina", "bovino", "suina", "suino", "picanha", "costela", "bife"] },
  { label: "Frango", slug: "frango", sinonimos: ["frango", "galinha", "aves", "ave"] },
  { label: "Peixes", slug: "peixes", sinonimos: ["peixe", "peixes", "camarao", "camaroes", "frutos do mar", "mariscos", "tilapia", "salmao", "bacalhau", "moqueca", "vatapa", "bobo"] },
  { label: "Sopas", slug: "sopas", sinonimos: ["sopa", "sopas", "caldo", "caldos", "creme"] },
  { label: "Massas", slug: "massas", sinonimos: ["massa", "massas", "macarrao", "espaguete", "lasanha", "nhoque", "risoto", "fettuccine"] },
  { label: "Doces", slug: "doces", sinonimos: ["doce", "doces", "sobremesa", "sobremesas", "confeitaria", "brigadeiro", "pudim", "mousse", "cocada", "quindim", "beijinho", "doceria"] },
  { label: "Saladas", slug: "saladas", sinonimos: ["salada", "saladas", "vinagrete", "tabule"] },
  { label: "Lanches", slug: "lanches", sinonimos: ["lanche", "lanches", "sanduiche", "coxinha", "salgado", "salgados", "empada", "empadao"] },
];

const STOPWORDS = new Set([
  "de","com","e","a","o","os","as","ao","aos","na","no","nas","nos","para","do","da","dos","das",
  "à","às","um","uma","uns","umas","receita","receitas","prato","jeito","estilo","molho",
]);

const FLUFF = new Set([
  "cremoso","cremosa","cremosos","cremosas","crocante","crocantes","delicioso","deliciosa",
  "deliciosos","deliciosas","gourmet","especial","especiais","perfeito","perfeita","perfeitos",
  "perfeitas","autentico","autentica","autenticos","autenticas","tradicional","tradicionais",
  "saudavel","saudaveis","nutritivo","nutritiva","nutritivos","nutritivas","carinhoso","carinhosa",
  "magico","magica","colorido","colorida","coloridos","coloridas","light","fit","rapido","rapida",
  "facil","faceis","simples","suculento","suculenta","dourado","dourada","saboroso","saborosa",
  "irresistivel","irresistiveis","classico","classica","caseiro","caseira","caseiros","caseiras",
  "pratico","pratica","praticos","praticas","cozinha","jantar","almoco","festa","familia","fresco",
  "fresca","frescos","frescas","especialmente","incrivel","incriveis","surpreendente","otimo","otima",
]);

const HEALTH_TERMS = [
  "diabétic", "diabetes", "emagrec", "glicêmic", "glicemic", "baixo índice", "baixo indice",
  "segura para", "ideal para diabét", "controlada para", "detox", "perde peso", "dieta de emagrec",
];

function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function assinatura(titulo) {
  const palavras = normalizar(titulo)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 1 && !STOPWORDS.has(p) && !FLUFF.has(p));
  return [...new Set(palavras)].sort().join(" ");
}

function idDaFoto(url) {
  const m = String(url ?? "").match(/photos\/(\d+)\//);
  return m ? m[1] : (url || "(sem imagem)");
}

function carregarReceitas() {
  const arquivos = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  return arquivos.map((filename) => {
    const filepath = path.join(DIR, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data, content } = matter(raw);
    return {
      filename,
      title: data.title ?? "",
      slug: data.slug ?? filename.replace(/\.mdx?$/, ""),
      date: data.date ?? "",
      categorias: data.categorias ?? [],
      image: data.image ?? "",
      descricao: data.description ?? "",
      dicas: data.dicas ?? "",
      variacoes: data.variacoes ?? "",
      ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes.join(" ") : "",
      passos: Array.isArray(data.passos) ? data.passos.join(" ") : "",
      content,
      sig: assinatura(data.title ?? ""),
    };
  });
}

function detectarDuplicatasExatas(receitas) {
  const grupos = new Map();
  for (const r of receitas) {
    const key = normalizar(r.title).trim();
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push(r);
  }
  return [...grupos.entries()]
    .filter(([, itens]) => itens.length > 1)
    .map(([titulo, itens]) => ({ titulo: itens[0].title, ocorrencias: itens.length, arquivos: itens.map((i) => i.filename) }))
    .sort((a, b) => b.ocorrencias - a.ocorrencias);
}

function detectarQuaseDuplicatas(receitas) {
  const grupos = new Map();
  for (const r of receitas) {
    if (!grupos.has(r.sig)) grupos.set(r.sig, []);
    grupos.get(r.sig).push(r);
  }
  return [...grupos.entries()]
    .filter(([sig, itens]) => sig && itens.length > 1)
    .map(([sig, itens]) => {
      itens.sort((a, b) => a.date.localeCompare(b.date) || a.filename.localeCompare(b.filename));
      return {
        assinatura: sig,
        ocorrencias: itens.length,
        manter_sugerido: { titulo: itens[0].title, arquivo: itens[0].filename, data: itens[0].date },
        candidatos_remover: itens.slice(1).map((i) => ({ titulo: i.title, arquivo: i.filename, data: i.date, slug: i.slug })),
      };
    })
    .sort((a, b) => b.ocorrencias - a.ocorrencias);
}

function detectarColisaoSlug(receitas) {
  const grupos = new Map();
  for (const r of receitas) {
    if (!grupos.has(r.slug)) grupos.set(r.slug, []);
    grupos.get(r.slug).push(r);
  }
  return [...grupos.entries()]
    .filter(([, itens]) => itens.length > 1)
    .map(([slug, itens]) => ({ slug, ocorrencias: itens.length, arquivos: itens.map((i) => i.filename) }));
}

function contemPalavra(frase, sinonimo) {
  const regex = new RegExp(`\\b${sinonimo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`);
  return regex.test(normalizar(frase));
}

function detectarContaminacaoCategoria(receitas) {
  const porCategoria = {};
  for (const cat of CATEGORIAS) porCategoria[cat.slug] = [];

  for (const r of receitas) {
    for (const cat of CATEGORIAS) {
      const bate = r.categorias.some((c) => cat.sinonimos.some((s) => contemPalavra(c, s)));
      if (bate) {
        porCategoria[cat.slug].push({ titulo: r.title, arquivo: r.filename, categorias_ia: r.categorias });
      }
    }
  }

  const resumo = {};
  for (const cat of CATEGORIAS) {
    const itens = porCategoria[cat.slug];
    resumo[cat.slug] = { label: cat.label, total: itens.length, exemplos: itens.slice(0, 8) };
  }
  return resumo;
}

function detectarReusoImagem(receitas) {
  const grupos = new Map();
  for (const r of receitas) {
    const id = idDaFoto(r.image);
    if (!grupos.has(id)) grupos.set(id, []);
    grupos.get(id).push(r);
  }
  return [...grupos.entries()]
    .filter(([id, itens]) => itens.length > 1 && id !== "(sem imagem)")
    .map(([id, itens]) => ({ foto_id: id, ocorrencias: itens.length, receitas: itens.map((i) => ({ titulo: i.title, arquivo: i.filename })) }))
    .sort((a, b) => b.ocorrencias - a.ocorrencias);
}

function detectarAlegacoesSaude(receitas) {
  const achados = [];
  for (const r of receitas) {
    const textoCompleto = normalizar(
      [r.title, r.descricao, r.dicas, r.variacoes, r.ingredientes, r.passos, r.content].join(" ")
    );
    const termosEncontrados = HEALTH_TERMS.filter((t) => textoCompleto.includes(normalizar(t)));
    if (termosEncontrados.length > 0) {
      achados.push({ titulo: r.title, arquivo: r.filename, termos: termosEncontrados });
    }
  }
  return achados;
}

function main() {
  const receitas = carregarReceitas();
  console.log(`\n📊 DIAGNÓSTICO — ${receitas.length} receitas em content/receitas/\n`);

  const duplicatasExatas = detectarDuplicatasExatas(receitas);
  const totalExatasRemover = duplicatasExatas.reduce((acc, g) => acc + (g.ocorrencias - 1), 0);
  console.log(`— Títulos exatamente duplicados: ${duplicatasExatas.length} grupos, ${totalExatasRemover} arquivos a mais além do original`);

  const quaseDuplicatas = detectarQuaseDuplicatas(receitas);
  const totalQuaseRemover = quaseDuplicatas.reduce((acc, g) => acc + g.candidatos_remover.length, 0);
  console.log(`— Grupos de quase-duplicatas (mesma assinatura de prato): ${quaseDuplicatas.length} grupos, ${totalQuaseRemover} candidatos a consolidar`);

  const colisoesSlug = detectarColisaoSlug(receitas);
  console.log(`— Colisões de slug (mesma URL /receita/<slug> para arquivos diferentes): ${colisoesSlug.length}`);

  const categorias = detectarContaminacaoCategoria(receitas);
  console.log(`— Receitas por categoria (via campo categorias da IA, casamento por palavra inteira):`);
  for (const [slug, info] of Object.entries(categorias)) {
    console.log(`   ${info.label}: ${info.total} receitas`);
  }

  const reusoImagem = detectarReusoImagem(receitas);
  const totalFotosReusadas = reusoImagem.reduce((acc, g) => acc + g.ocorrencias, 0);
  console.log(`— Fotos do Pexels reusadas em receitas diferentes: ${reusoImagem.length} fotos, ${totalFotosReusadas} receitas afetadas`);

  const alegacoesSaude = detectarAlegacoesSaude(receitas);
  console.log(`— Receitas com alegação de saúde não comprovada: ${alegacoesSaude.length}`);

  const relatorio = {
    gerado_em: new Date().toISOString(),
    total_receitas: receitas.length,
    duplicatas_exatas: { grupos: duplicatasExatas.length, arquivos_a_remover: totalExatasRemover, detalhe: duplicatasExatas },
    quase_duplicatas: { grupos: quaseDuplicatas.length, candidatos_a_remover: totalQuaseRemover, detalhe: quaseDuplicatas },
    colisoes_slug: colisoesSlug,
    contaminacao_categoria: categorias,
    reuso_imagem: { fotos_afetadas: reusoImagem.length, receitas_afetadas: totalFotosReusadas, detalhe: reusoImagem },
    alegacoes_saude: alegacoesSaude,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `diagnostico-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(outPath, JSON.stringify(relatorio, null, 2), "utf-8");
  console.log(`\n✅ Relatório completo salvo em ${path.relative(process.cwd(), outPath)}`);
  console.log(`   (dry-run — nada foi apagado ou modificado em content/receitas/)\n`);
}

main();
