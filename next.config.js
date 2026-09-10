import fs from "fs";
import path from "path";

// Mapa slug-antigo → slug-canônico gerado por scripts/gerar-redirects.mjs a
// partir da consolidação de duplicatas de 2026-09 (ver outputs/plano-consolidacao-*.json).
const redirectsPath = path.join(process.cwd(), "redirects.json");
const receitaRedirects = fs.existsSync(redirectsPath)
  ? Object.entries(JSON.parse(fs.readFileSync(redirectsPath, "utf-8"))).map(([origem, destino]) => ({
      source: `/receita/${origem}`,
      destination: `/receita/${destino}`,
      permanent: true,
    }))
  : [];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Incremental Static Regeneration — revalida as páginas a cada hora
  // novas receitas aparecem sem precisar rebuild completo
  async redirects() {
    return receitaRedirects;
  },
};

export default nextConfig;
