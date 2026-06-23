import fs from "fs";
import path from "path";
import matter from "gray-matter";

const RECEITAS_DIR = path.join(process.cwd(), "content/receitas");

export interface ReceitaMeta {
  titulo: string;
  slug: string;
  descricao: string;
  date: string;
  tempo_preparo: string;
  dificuldade: string;
  categorias: string[];
}

export async function getAllReceitas(): Promise<ReceitaMeta[]> {
  if (!fs.existsSync(RECEITAS_DIR)) return [];

  const files = fs
    .readdirSync(RECEITAS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const receitas = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(RECEITAS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return {
        titulo: data.title ?? "",
        slug: data.slug ?? file.replace(/\.mdx?$/, ""),
        descricao: data.description ?? "",
        date: data.date ?? "",
        tempo_preparo: data.tempo_preparo ?? "",
        dificuldade: data.dificuldade ?? "",
        categorias: data.categorias ?? [],
      } as ReceitaMeta;
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // mais recentes primeiro

  return receitas;
}

export async function getReceita(slug: string) {
  if (!fs.existsSync(RECEITAS_DIR)) return null;

  const files = fs.readdirSync(RECEITAS_DIR);
  const file = files.find((f) => {
    const raw = fs.readFileSync(path.join(RECEITAS_DIR, f), "utf-8");
    const { data } = matter(raw);
    return data.slug === slug || f.replace(/\.mdx?$/, "").includes(slug);
  });

  if (!file) return null;

  const raw = fs.readFileSync(path.join(RECEITAS_DIR, file), "utf-8");
  const { data, content } = matter(raw);

  // Remove bloco export const schema = {...} do MDX antes de renderizar
  const cleanContent = content.replace(/export const schema = \{[\s\S]*?\}\n?/, "");

  return { frontmatter: data, content: cleanContent };
}
