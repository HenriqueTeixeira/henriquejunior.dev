// Regras de publicação compartilhadas pelos arquivos de dados das páginas.
import { readdirSync, readFileSync } from "node:fs";

export const producao = process.env.SITE_AMBIENTE === "producao";

/** Quantos itens de src/<pasta>/ vão ao ar neste build (exemplos não contam em produção). */
export function itensPublicaveis(pasta) {
  return readdirSync(`src/${pasta}`)
    .filter((arquivo) => arquivo.endsWith(".md"))
    .filter((arquivo) => !(producao && /^exemplo:\s*true\s*$/m.test(readFileSync(`src/${pasta}/${arquivo}`, "utf8"))))
    .length;
}

/** A página de listagem só existe quando a seção tem itens. */
export const listagem = (pasta) => ({
  eleventyComputed: {
    permalink: () => (itensPublicaveis(pasta) ? `/${pasta}/` : false),
  },
});

/** sobre.json tem ao menos um campo preenchido (chaves com "_" são notas). */
export const temConteudo = (sobre) =>
  Object.entries(sobre).some(([chave, valor]) => !chave.startsWith("_") && (Array.isArray(valor) ? valor.length : valor));
