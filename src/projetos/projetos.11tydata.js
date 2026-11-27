// Padrões de toda página em src/projetos/. Itens com "exemplo: true" só existem fora da produção.
import { producao } from "../../lib/conteudo.js";

export default {
  layout: "layouts/projeto.njk",
  eleventyComputed: {
    permalink: (data) => (producao && data.exemplo ? false : `/projetos/${data.page.fileSlug}/`),
  },
};
