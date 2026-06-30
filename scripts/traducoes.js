// Traduz termos brasileiros para inglês para melhor resultado de busca no Pexels
export const TRADUCOES = [
  [/bife acebolado/i, "beef steak with caramelized onions"],
  [/frango grelhado/i, "grilled chicken"],
  [/frango assado/i, "roasted chicken"],
  [/frango caipira/i, "rustic chicken stew"],
  [/frango xadrez/i, "chicken stir fry cashews"],
  [/coxas? de frango/i, "chicken thighs roasted"],
  [/strogonoff de frango|estrogonofe/i, "chicken stroganoff"],
  [/bolo de chocolate/i, "chocolate cake slice"],
  [/bolo de cenoura/i, "carrot cake"],
  [/bolo de milho/i, "corn cake"],
  [/bolo de banana/i, "banana bread cake"],
  [/bolo de fub[áa]/i, "cornmeal cake"],
  [/bolo de coco|bolo gelado de coco/i, "coconut cake"],
  [/p[ãa]o de queijo/i, "Brazilian cheese bread"],
  [/brigadeiro de pistache/i, "pistachio chocolate truffle"],
  [/brigadeiro/i, "Brazilian chocolate truffle"],
  [/pudim de tapioca/i, "tapioca pudding coconut"],
  [/pudim/i, "Brazilian flan caramel"],
  [/mousse de maracuj[áa]/i, "passion fruit mousse"],
  [/cocada/i, "coconut candy dessert"],
  [/quindim/i, "Brazilian coconut custard"],
  [/canjica/i, "Brazilian corn pudding"],
  [/curau/i, "Brazilian corn pudding"],
  [/pav[êe]/i, "Brazilian layered dessert"],
  [/compota de goiaba/i, "guava compote cheese"],
  [/doce de leite/i, "dulce de leche"],
  [/beijinho/i, "Brazilian coconut candy"],
  [/feij[ãa]o tropeiro/i, "Brazilian beans bacon sausage"],
  [/tutu de feij[ãa]o/i, "Brazilian mashed beans"],
  [/caldo de feij[ãa]o/i, "Brazilian bean soup"],
  [/arroz de forno/i, "baked rice casserole"],
  [/arroz carreteiro/i, "Brazilian rice beef"],
  [/farofa/i, "Brazilian toasted cassava flour"],
  [/escondidinho/i, "Brazilian beef mashed potato casserole"],
  [/carne assada/i, "Brazilian pot roast beef"],
  [/almôndegas|almondegas/i, "meatballs tomato sauce"],
  [/picanha/i, "Brazilian picanha grilled beef"],
  [/costela/i, "slow cooked pork ribs"],
  [/moqueca/i, "Brazilian fish coconut stew"],
  [/bob[óo] de camar[ãa]o/i, "Brazilian shrimp coconut stew"],
  [/vatap[áa]/i, "Brazilian shrimp peanut stew"],
  [/risoto de camar[ãa]o/i, "shrimp risotto"],
  [/risoto de funghi/i, "mushroom risotto"],
  [/til[áa]pia/i, "baked tilapia fish"],
  [/salm[ãa]o/i, "grilled salmon"],
  [/peixe grelhado/i, "grilled fish fillet"],
  [/bolinho de bacalhau/i, "Portuguese codfish cakes"],
  [/macarr[ãa]o ao molho branco/i, "pasta white sauce chicken"],
  [/macarr[ãa]o/i, "pasta dish"],
  [/lasanha/i, "lasagna baked"],
  [/espaguete/i, "spaghetti pasta"],
  [/nhoque/i, "gnocchi"],
  [/polenta/i, "polenta creamy"],
  [/torta de frango/i, "chicken pie"],
  [/torta de legumes/i, "vegetable tart"],
  [/empad[ãa]o/i, "Brazilian chicken pie"],
  [/quiche/i, "quiche"],
  [/omelete/i, "omelette egg"],
  [/sopa de legumes|sopa colorida/i, "vegetable soup"],
  [/sopa creme de ab[óo]bora/i, "pumpkin cream soup"],
  [/caldo verde/i, "Portuguese green soup"],
  [/sopa de cebola/i, "French onion soup"],
  [/sopa de mandioca/i, "cassava soup"],
  [/creme de milho/i, "cream of corn soup"],
  [/salada caesar/i, "Caesar salad chicken"],
  [/salada de macarr[ãa]o/i, "pasta salad"],
  [/salpic[ãa]o/i, "Brazilian chicken salad"],
  [/tabul[ée]/i, "tabbouleh salad"],
  [/vinagrete/i, "Brazilian salsa tomato"],
  [/cookies/i, "homemade cookies"],
  [/vitamina/i, "fruit smoothie"],
  [/suco/i, "fresh fruit juice"],
  [/coxinha/i, "Brazilian chicken croquette"],
];

export function traduzirTitulo(titulo) {
  for (const [regex, traducao] of TRADUCOES) {
    if (regex.test(titulo)) return traducao + " food photography";
  }
  // Fallback: remove termos genéricos e adiciona "food"
  const limpo = titulo
    .replace(/receita|caseiro|caseira|simples|f[áa]cil|r[áa]pido|cremoso|cremosa|crocante|delicioso|deliciosa|gourmet|tradicional|brasileiro|brasileira|com|de|e|ao|na|no|para|–|-/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 4)
    .join(" ");
  return limpo + " Brazilian food dish";
}
