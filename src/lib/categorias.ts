import type { ReceitaMeta } from "./receitas";

export interface Categoria {
  label: string;
  slug: string;
  keyword: string;
  emoji: string;
}

export const CATEGORIAS: Categoria[] = [
  { label: "Bolos", slug: "bolos", keyword: "bolo", emoji: "🎂" },
  { label: "Carnes", slug: "carnes", keyword: "carne", emoji: "🥩" },
  { label: "Frango", slug: "frango", keyword: "frango", emoji: "🍗" },
  { label: "Peixes", slug: "peixes", keyword: "peixe", emoji: "🐟" },
  { label: "Sopas", slug: "sopas", keyword: "sopa", emoji: "🍲" },
  { label: "Massas", slug: "massas", keyword: "massa", emoji: "🍝" },
  { label: "Doces", slug: "doces", keyword: "doce", emoji: "🍮" },
  { label: "Saladas", slug: "saladas", keyword: "salada", emoji: "🥗" },
  { label: "Lanches", slug: "lanches", keyword: "lanche", emoji: "🥪" },
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function getCategoria(slug: string): Categoria | undefined {
  const slugNorm = normalizar(slug);
  return CATEGORIAS.find((c) => c.slug === slugNorm) ?? { label: slug, slug: slugNorm, keyword: slugNorm, emoji: "🍽️" };
}

export function receitaPertenceCategoria(receita: ReceitaMeta, categoria: Categoria): boolean {
  const keyword = normalizar(categoria.keyword);
  if (normalizar(receita.titulo).includes(keyword)) return true;
  return receita.categorias.some((c) => normalizar(c).includes(keyword));
}

// Hash estável só pra dar uma ordem "popular" diferente da ordem por data,
// sem depender de analytics real (ainda não temos tracking de buscas).
function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function ordenarPorPopularidade(receitas: ReceitaMeta[]): ReceitaMeta[] {
  return [...receitas].sort((a, b) => hashSlug(a.slug) - hashSlug(b.slug));
}
