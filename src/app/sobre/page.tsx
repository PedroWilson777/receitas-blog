export const metadata = {
  title: "Sobre",
  description: "Conheça o Sabores da Vovó — receitas caseiras brasileiras simples, testadas e feitas com carinho.",
};

export default function Sobre() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-orange">
      <h1>Sobre o Sabores da Vovó</h1>

      <p>
        O <strong>Sabores da Vovó</strong> nasceu da vontade de reunir receitas caseiras
        brasileiras simples, gostosas e fáceis de seguir — do jeitinho que a vovó faria, mas
        explicadas passo a passo pra qualquer pessoa conseguir cozinhar bem em casa.
      </p>

      <p>
        Publicamos novas receitas com frequência, sempre testadas para terem ingredientes
        acessíveis, modo de preparo claro e dicas práticas do chef em cada uma.
      </p>

      <h2>Nosso compromisso</h2>
      <p>
        Buscamos sempre oferecer conteúdo original e útil, com informações de preparo, porções e
        valores nutricionais aproximados em cada receita.
      </p>

      <h2>Contato</h2>
      <p>
        Encontrou algum erro em uma receita ou tem alguma sugestão? Escreva para{" "}
        <a href="mailto:pedrow993@gmail.com">pedrow993@gmail.com</a>.
      </p>

      <p>
        Veja também nossa{" "}
        <a href="/politica-de-privacidade">Política de Privacidade</a>.
      </p>
    </div>
  );
}
