#!/usr/bin/env node
/**
 * Autorização Pinterest — rodar UMA VEZ na máquina local para obter o refresh token
 *
 * Pré-requisitos:
 *   1. Conta Pinterest Business (gratuita) — pinterest.com/business/create
 *   2. App criado em developers.pinterest.com/apps (acesso trial já serve)
 *   3. No app, adicionar redirect URI: http://localhost:8085/callback
 *
 * Uso:
 *   set PINTEREST_APP_ID=xxx
 *   set PINTEREST_APP_SECRET=xxx
 *   npm run pinterest:auth
 *
 * Depois copie o refresh token exibido para os GitHub Secrets do repositório:
 *   PINTEREST_APP_ID / PINTEREST_APP_SECRET / PINTEREST_REFRESH_TOKEN
 */

import http from "http";

const API = "https://api.pinterest.com/v5";
const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = "boards:read,boards:write,pins:read,pins:write";

const { PINTEREST_APP_ID, PINTEREST_APP_SECRET } = process.env;

if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET) {
  console.error("❌ Defina PINTEREST_APP_ID e PINTEREST_APP_SECRET antes de rodar.");
  console.error('   Windows:  set PINTEREST_APP_ID=xxx && set PINTEREST_APP_SECRET=xxx');
  process.exit(1);
}

const authUrl =
  `https://www.pinterest.com/oauth/?response_type=code` +
  `&client_id=${PINTEREST_APP_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get("code");
  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Erro: código não recebido</h1>");
    return;
  }

  try {
    const basic = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");
    const tokenRes = await fetch(`${API}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) throw new Error(`${tokenRes.status} ${await tokenRes.text()}`);
    const data = await tokenRes.json();

    console.log("\n✅ Autorizado com sucesso!\n");
    console.log("Adicione estes GitHub Secrets no repositório (Settings → Secrets → Actions):\n");
    console.log(`  PINTEREST_APP_ID        = ${PINTEREST_APP_ID}`);
    console.log(`  PINTEREST_APP_SECRET    = (o secret do app)`);
    console.log(`  PINTEREST_REFRESH_TOKEN = ${data.refresh_token}`);
    console.log(`\n(access token de teste, expira em ${Math.round((data.expires_in ?? 0) / 86400)} dias: ${data.access_token})\n`);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>✅ Pinterest autorizado!</h1><p>Volte ao terminal — o refresh token está lá. Pode fechar esta aba.</p>");
  } catch (err) {
    console.error("❌ Falha na troca do código por token:", err.message);
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>Erro na autorização</h1><p>Veja o terminal.</p>");
  } finally {
    setTimeout(() => server.close(() => process.exit(0)), 500);
  }
});

server.listen(PORT, () => {
  console.log("🔑 Abra esta URL no navegador e autorize o app:\n");
  console.log(authUrl);
  console.log(`\nAguardando o redirecionamento em ${REDIRECT_URI} ...`);
});
