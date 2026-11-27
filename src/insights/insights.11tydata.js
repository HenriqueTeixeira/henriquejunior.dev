// Padrões de toda página em src/insights/. Itens com "exemplo: true" só existem fora da produção.
import { producao } from "../../lib/conteudo.js";

export default {
  layout: "layouts/artigo.njk",
  eleventyComputed: {
    permalink: (data) => (producao && data.exemplo ? false : `/insights/${data.page.fileSlug}/`),
  },
};
