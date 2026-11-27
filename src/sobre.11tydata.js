// A página Sobre só vai ao ar em produção quando tiver ao menos um campo real em sobre.json.
import { producao, temConteudo } from "../lib/conteudo.js";

export default {
  eleventyComputed: {
    permalink: (data) => (producao && !temConteudo(data.sobre) ? false : "/sobre/"),
  },
};
