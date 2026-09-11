import type { ReceitaMeta } from "./receitas";

export interface Categoria {
  label: string;
  slug: string;
  sinonimos: string[];
  emoji: string;
}

// Sinônimos que a IA usa livremente no campo `categorias` de cada receita.
// Casamento é por PALAVRA INTEIRA dentro desse campo — nunca por substring no
// título. Isso corrige a contaminação de categoria (ex: "batata doce" virando
// sobremesa só porque "doce" aparece dentro da palavra composta, ou frango
// pra diabéticos entrando em Doces).
export const CATEGORIAS: Categoria[] = [
  { label: "Bolos", slug: "bolos", sinonimos: ["bolo", "bolos", "cupcake", "cupcakes"], emoji: "🎂" },
  { label: "Carnes", slug: "carnes", sinonimos: ["carne", "carnes", "bovina", "bovino", "suina", "suino", "picanha", "costela", "bife"], emoji: "🥩" },
  { label: "Frango", slug: "frango", sinonimos: ["frango", "galinha", "aves", "ave"], emoji: "🍗" },
  { label: "Peixes", slug: "peixes", sinonimos: ["peixe", "peixes", "camarao", "camaroes", "frutos do mar", "mariscos", "tilapia", "salmao", "bacalhau", "moqueca", "vatapa", "bobo"], emoji: "🐟" },
  { label: "Sopas", slug: "sopas", sinonimos: ["sopa", "sopas", "caldo", "caldos", "creme"], emoji: "🍲" },
  { label: "Massas", slug: "massas", sinonimos: ["massa", "massas", "macarrao", "espaguete", "lasanha", "nhoque", "risoto", "fettuccine"], emoji: "🍝" },
  { label: "Doces", slug: "doces", sinonimos: ["doce", "doces", "sobremesa", "sobremesas", "confeitaria", "brigadeiro", "pudim", "mousse", "cocada", "quindim", "beijinho", "doceria"], emoji: "🍮" },
  { label: "Saladas", slug: "saladas", sinonimos: ["salada", "saladas", "vinagrete", "tabule"], emoji: "🥗" },
  { label: "Lanches", slug: "lanches", sinonimos: ["lanche", "lanches", "sanduiche", "coxinha", "salgado", "salgados", "empada", "empadao"], emoji: "🥪" },
];

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Casa por PALAVRA INTEIRA (fronteira \b) dentro da frase de categoria da IA
// — "frango assado" bate com o sinônimo "frango", mas "chave"/"suave" não
// batem com "ave" porque não há fronteira de palavra ali. Nunca compara
// contra o título: é isso que evita "batata doce" (ingrediente) contaminar
// Doces, já que o ingrediente nunca aparece no campo `categorias` da IA.
function contemPalavra(frase: string, sinonimo: string): boolean {
  const regex = new RegExp(`\\b${sinonimo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`);
  return regex.test(normalizar(frase));
}

export function getCategoria(slug: string): Categoria | undefined {
  const slugNorm = normalizar(slug);
  return CATEGORIAS.find((c) => c.slug === slugNorm);
}

export function receitaPertenceCategoria(receita: ReceitaMeta, categoria: Categoria): boolean {
  return receita.categorias.some((c) => categoria.sinonimos.some((s) => contemPalavra(c, s)));
}
