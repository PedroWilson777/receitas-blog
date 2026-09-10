#!/usr/bin/env node
/**
 * Aplica o plano gerado por plano-consolidacao.mjs: MOVE (não apaga) os
 * arquivos marcados como "remover" pra fora de content/receitas/, guardando
 * em outputs/removidos-consolidacao-<data>/ — zero data loss, tudo
 * recuperável sem depender só do git.
 *
 * NÃO commita, NÃO faz push, NÃO mexe no site no ar.
 *
 * Uso: node scripts/aplicar-consolidacao.mjs outputs/plano-consolidacao-2026-09-03.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "../content/receitas");
const OUT_DIR = path.join(__dirname, "../outputs");

const planoPath = process.argv[2];
if (!planoPath) {
  console.error("Uso: node scripts/aplicar-consolidacao.mjs <caminho-do-plano.json>");
  process.exit(1);
}

const plano = JSON.parse(fs.readFileSync(planoPath, "utf-8"));
const data = new Date().toISOString().slice(0, 10);
const BACKUP_DIR = path.join(OUT_DIR, `removidos-consolidacao-${data}`);
fs.mkdirSync(BACKUP_DIR, { recursive: true });

let movidos = 0;
let faltando = 0;
const log = [];

for (const grupo of plano.plano) {
  for (const item of grupo.remover) {
    const origem = path.join(CONTENT_DIR, item.arquivo);
    const destino = path.join(BACKUP_DIR, item.arquivo);
    if (!fs.existsSync(origem)) {
      faltando++;
      continue;
    }
    fs.renameSync(origem, destino);
    movidos++;
    log.push({ arquivo: item.arquivo, titulo: item.titulo, redirect_para: item.redirect_para });
  }
}

fs.writeFileSync(path.join(BACKUP_DIR, "_log-remocao.json"), JSON.stringify(log, null, 2), "utf-8");

const restantes = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx")).length;

console.log(`\n✅ ${movidos} arquivos movidos pra ${path.relative(process.cwd(), BACKUP_DIR)}/`);
if (faltando) console.log(`⚠️  ${faltando} arquivos do plano não foram encontrados (já tinham sido removidos?)`);
console.log(`📦 Receitas restantes em content/receitas/: ${restantes}`);
console.log(`\n(nada foi commitado — revise com "git status" antes de decidir o próximo passo)\n`);
