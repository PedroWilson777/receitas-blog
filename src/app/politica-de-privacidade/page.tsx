export const metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade do Sabores da Vovó — como usamos cookies, dados de navegação e anúncios de terceiros.",
};

export default function PoliticaDePrivacidade() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-orange">
      <h1>Política de Privacidade</h1>
      <p className="text-gray-500">Última atualização: junho de 2026</p>

      <p>
        O Sabores da Vovó (saboresdavovo.com.br) respeita a sua privacidade. Esta página explica
        quais informações coletamos, como usamos e quais escolhas você tem.
      </p>

      <h2>1. Quem somos</h2>
      <p>
        Sabores da Vovó é um blog de receitas caseiras brasileiras. Não pedimos cadastro, login
        ou qualquer dado pessoal para você ler as receitas publicadas no site.
      </p>

      <h2>2. Cookies e tecnologias semelhantes</h2>
      <p>
        Este site pode usar cookies próprios e de terceiros para melhorar a experiência de
        navegação e exibir anúncios relevantes. Cookies são pequenos arquivos armazenados no seu
        navegador.
      </p>

      <h2>3. Publicidade — Google AdSense</h2>
      <p>
        Usamos (ou pretendemos usar) o Google AdSense para exibir anúncios. O Google e seus
        parceiros podem usar cookies para veicular anúncios com base em visitas anteriores suas
        a este e a outros sites. Você pode desativar a publicidade personalizada visitando as{" "}
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
          Configurações de Anúncios do Google
        </a>
        . Para mais detalhes sobre como o Google usa dados de sites parceiros, consulte a{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          política de privacidade do Google
        </a>
        .
      </p>

      <h2>4. Dados de navegação</h2>
      <p>
        Como a maioria dos sites, podemos coletar automaticamente informações não identificáveis
        como tipo de navegador, páginas visitadas e tempo de permanência, usadas apenas para
        entender como o site é usado e melhorá-lo.
      </p>

      <h2>5. Links externos</h2>
      <p>
        Este site pode conter links para outros sites. Não nos responsabilizamos pelas práticas
        de privacidade desses sites externos.
      </p>

      <h2>6. Contato</h2>
      <p>
        Dúvidas sobre esta política podem ser enviadas pelo nosso{" "}
        <a href="/sobre">canal de contato</a>.
      </p>
    </div>
  );
}
