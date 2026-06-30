import Link from "next/link";
import type { ReceitaMeta } from "@/lib/receitas";

const EMOJI_MAP: [string, string][] = [
  ["bolo","🎂"],["cookie","🍪"],["torta","🥧"],["frango","🍗"],["peixe","🐟"],
  ["carne","🥩"],["sopa","🍲"],["massa","🍝"],["macarrão","🍝"],["salada","🥗"],
  ["arroz","🍚"],["feijão","🫘"],["ovo","🍳"],["doce","🍮"],["pudim","🍮"],
  ["vitamina","🥤"],["suco","🍹"],["pão","🍞"],["pizza","🍕"],["risoto","🍚"],
];
function emoji(titulo: string) {
  const t = titulo.toLowerCase();
  for (const [k, e] of EMOJI_MAP) if (t.includes(k)) return e;
  return "🍽️";
}

export default function RecipeCard({ receita }: { receita: ReceitaMeta }) {
  return (
    <Link
      href={`/receita/${receita.slug}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden flex"
    >
      <div className="w-28 h-28 bg-orange-50 flex-shrink-0 overflow-hidden">
        {receita.image ? (
          <img
            src={receita.image}
            alt={receita.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
            {emoji(receita.titulo)}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col justify-center min-w-0">
        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors mb-1">
          {receita.titulo}
        </h3>
        <div className="flex gap-2 text-xs text-gray-400 flex-wrap">
          <span>⏱️ {receita.tempo_preparo}</span>
          <span>·</span>
          <span>{receita.dificuldade}</span>
        </div>
      </div>
    </Link>
  );
}
