#!/usr/bin/env node
/**
 * Gera redirects.json (rastreado no git) a partir do plano de consolidação —
 * next.config.js lê esse arquivo pra criar os redirects 301 de verdade.
 *
 * Filtra pares onde o slug de origem é igual ao de destino (caso de colisão
 * de slug exata entre arquivos removidos e a canônica — não precisa de
 * redirect, a URL já aponta pro conteúdo certo assim que o arquivo duplicado
 * é removido).
 *
 * Uso: node scripts/gerar-redirects.mjs outputs/plano-consolidacao-2026-09-03.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const planoPath = process.argv[2];
if (!planoPath) {
  console.error("Uso: node scripts/gerar-redirects.mjs <caminho-do-plano.json>");
  process.exit(1);
}

const plano = JSON.parse(fs.readFileSync(planoPath, "utf-8"));

const mapa = new Map();
let semRedirectNecessario = 0;

for (const grupo of plano.plano) {
  for (const item of grupo.remover) {
    if (item.slug === item.redirect_para) {
      semRedirectNecessario++;
      continue; // mesma URL, arquivo duplicado removido já resolve
    }
    mapa.set(item.slug, item.redirect_para);
  }
}

const redirects = Object.fromEntries([...mapa.entries()].sort());

fs.writeFileSync(path.join(ROOT, "redirects.json"), JSON.stringify(redirects, null, 2) + "\n", "utf-8");

console.log(`✅ redirects.json gerado com ${mapa.size} redirects reais`);
console.log(`   (${semRedirectNecessario} pares ignorados — slug de origem já era igual ao canônico)`);
