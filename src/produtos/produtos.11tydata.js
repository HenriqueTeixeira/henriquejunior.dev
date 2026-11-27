// Padrões de toda página em src/produtos/. Itens com "exemplo: true" só existem fora da produção.
import { producao } from "../../lib/conteudo.js";

export default {
  layout: "layouts/produto.njk",
  eleventyComputed: {
    permalink: (data) => (producao && data.exemplo ? false : `/produtos/${data.page.fileSlug}/`),
  },
};
