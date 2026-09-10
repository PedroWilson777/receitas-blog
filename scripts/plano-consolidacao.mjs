#!/usr/bin/env node
/**
 * Gera o PLANO de consolidação de duplicatas — só decide, não apaga nada.
 *
 * Agrupa receitas pela mesma "assinatura de prato" (ver diagnostico.mjs) e
 * escolhe uma canônica por grupo com critério de pontuação:
 *   - penaliza receita com alegação de saúde não comprovada
 *   - penaliza receita cuja foto é reaproveitada em >50 receitas no site
 *   - desempate final: mais antiga
 *
 * Saída: outputs/plano-consolidacao-<data>.json com, por grupo:
 *   - qual arquivo/slug mantém (canônica)
 *   - quais arquivos seriam removidos e viram redirect 301 pro canônico
 * Também escreve outputs/redirects-<data>.json (mapa slug-antigo → slug-canônico)
 * pronto pra virar next.config.js quando o plano for aprovado.
 *
 * NÃO apaga, NÃO edita content/receitas/, NÃO commita, NÃO faz redirect de verdade.
 *
 * Uso: node scripts/plano-consolidacao.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "../content/receitas");
const OUT_DIR = path.join(__dirname, "../outputs");

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
const LIMIAR_FOTO_SUPERUSADA = 50;

function normalizar(texto) {
  return String(texto ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
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
function temAlegacaoSaude(r) {
  const texto = normalizar([r.title, r.descricao, r.dicas, r.variacoes, r.ingredientes, r.passos].join(" "));
  return HEALTH_TERMS.some((t) => texto.includes(normalizar(t)));
}

function carregarReceitas() {
  const arquivos = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  return arquivos.map((filename) => {
    const filepath = path.join(DIR, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { data } = matter(raw);
    return {
      filename,
      filepath,
      title: data.title ?? "",
      slug: data.slug ?? filename.replace(/\.mdx?$/, ""),
      date: data.date ?? "",
      image: data.image ?? "",
      descricao: data.description ?? "",
      dicas: data.dicas ?? "",
      variacoes: data.variacoes ?? "",
      ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes.join(" ") : "",
      passos: Array.isArray(data.passos) ? data.passos.join(" ") : "",
      sig: assinatura(data.title ?? ""),
    };
  });
}

function pontuar(r, usoFoto) {
  let score = 0;
  const motivos = [];
  if (temAlegacaoSaude(r)) {
    score -= 10;
    motivos.push("alegação de saúde não comprovada");
  }
  const usos = usoFoto.get(idDaFoto(r.image)) ?? 1;
  if (usos > LIMIAR_FOTO_SUPERUSADA) {
    score -= 5;
    motivos.push(`foto reaproveitada em ${usos} receitas`);
  }
  return { score, motivos };
}

function main() {
  const receitas = carregarReceitas();

  // Conta reuso de foto no corpus inteiro, antes de decidir qualquer coisa
  const usoFoto = new Map();
  for (const r of receitas) {
    const id = idDaFoto(r.image);
    usoFoto.set(id, (usoFoto.get(id) ?? 0) + 1);
  }

  const grupos = new Map();
  for (const r of receitas) {
    if (!grupos.has(r.sig)) grupos.set(r.sig, []);
    grupos.get(r.sig).push(r);
  }

  const plano = [];
  const redirects = {};
  let totalRemover = 0;

  for (const [sig, itens] of grupos) {
    if (!sig || itens.length < 2) continue;

    const pontuados = itens.map((r) => ({ r, ...pontuar(r, usoFoto) }));
    pontuados.sort((a, b) => b.score - a.score || a.r.date.localeCompare(b.r.date) || a.r.filename.localeCompare(b.r.filename));

    const [canonica, ...resto] = pontuados;
    totalRemover += resto.length;

    for (const item of resto) {
      redirects[item.r.slug] = canonica.r.slug;
    }

    plano.push({
      assinatura: sig,
      ocorrencias: itens.length,
      manter: {
        arquivo: canonica.r.filename,
        titulo: canonica.r.title,
        slug: canonica.r.slug,
        data: canonica.r.date,
        score: canonica.score,
        motivo_score: canonica.motivos.length ? canonica.motivos : ["sem penalidade — mais antiga do grupo"],
      },
      remover: resto.map(({ r, score, motivos }) => ({
        arquivo: r.filename,
        titulo: r.title,
        slug: r.slug,
        data: r.date,
        score,
        motivo_score: motivos.length ? motivos : ["nenhum, perdeu no desempate por data"],
        redirect_para: canonica.r.slug,
      })),
    });
  }

  plano.sort((a, b) => b.ocorrencias - a.ocorrencias);

  // Slugs que sobrariam duplicados mesmo depois da consolidação (edge case a resolver manualmente)
  const slugsCanonicos = new Map();
  for (const g of plano) {
    const s = g.manter.slug;
    if (!slugsCanonicos.has(s)) slugsCanonicos.set(s, []);
    slugsCanonicos.get(s).push(g.assinatura);
  }
  const colisoesResiduais = [...slugsCanonicos.entries()].filter(([, sigs]) => sigs.length > 1);

  console.log(`\n📋 PLANO DE CONSOLIDAÇÃO (dry-run — nada foi alterado)\n`);
  console.log(`Total de receitas hoje: ${receitas.length}`);
  console.log(`Grupos com duplicata: ${plano.length}`);
  console.log(`Arquivos que seriam removidos (viram 301 → canônica): ${totalRemover}`);
  console.log(`Receitas restantes depois da consolidação: ${receitas.length - totalRemover}`);
  if (colisoesResiduais.length) {
    console.log(`\n⚠️  ${colisoesResiduais.length} slug(s) canônico(s) colidindo entre grupos diferentes — precisa de decisão manual:`);
    for (const [slug, sigs] of colisoesResiduais) console.log(`   ${slug}: ${sigs.join(" | ")}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const data = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(OUT_DIR, `plano-consolidacao-${data}.json`),
    JSON.stringify({ gerado_em: new Date().toISOString(), total_receitas: receitas.length, grupos: plano.length, arquivos_a_remover: totalRemover, colisoes_residuais: colisoesResiduais, plano }, null, 2),
    "utf-8"
  );
  fs.writeFileSync(
    path.join(OUT_DIR, `redirects-${data}.json`),
    JSON.stringify(redirects, null, 2),
    "utf-8"
  );
  console.log(`\n✅ Plano salvo em outputs/plano-consolidacao-${data}.json`);
  console.log(`✅ Mapa de redirects salvo em outputs/redirects-${data}.json`);
  console.log(`   (nada foi apagado — este é o plano pra você revisar antes de eu aplicar)\n`);
}

main();
