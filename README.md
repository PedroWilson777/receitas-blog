# 🍳 Receitas da Vovó — Blog Automático

Blog de culinária que gera e publica receitas originais automaticamente a cada 30 minutos usando Claude API.

## Como funciona

1. **GitHub Actions** roda o script a cada 30 min
2. **Claude (Haiku)** gera uma receita original com SEO e Schema.org
3. O script faz commit do arquivo `.mdx` novo
4. **Vercel** detecta o commit e faz deploy automático em ~30s
5. **Google** indexa a nova página com Rich Results (card de receita)

## Setup

### 1. Clone e instale
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Crie `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Configure o GitHub Secret
No GitHub → Settings → Secrets → Actions:
- `ANTHROPIC_API_KEY` = sua chave da Anthropic

### 4. Deploy no Vercel
- Conecte o repositório no [vercel.com](https://vercel.com)
- Deploy automático a cada push

### 5. Gerar receita manualmente
```bash
npm run gerar
```

## Monetização

1. **Google AdSense**: cadastre em [adsense.google.com](https://adsense.google.com), substitua `ca-pub-XXXXXXXX` no `layout.tsx`
2. **Afiliados**: adicione links de afiliado do Americanas/Submarino nos ingredientes

## Custo estimado

| Item | Custo mensal |
|------|-------------|
| Claude Haiku (1.440 receitas/mês) | ~R$ 10-15 |
| Vercel (hobby) | Grátis |
| GitHub Actions | Grátis |
| **Total** | **~R$ 15/mês** |
