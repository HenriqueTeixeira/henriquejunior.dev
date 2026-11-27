import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
// Produção esconde exemplos e placeholders; previews e ambiente local mostram tudo.
import { producao } from "./lib/conteudo.js";

const require = createRequire(import.meta.url);
const pastaIcones = path.dirname(require.resolve("lucide-static/icons/sun.svg"));

// Fontes servidas pelo próprio site: só o subconjunto latino (cobre o português) do eixo de peso.
const fontes = {
  "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2": "fontes/geist.woff2",
  "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2":
    "fontes/jetbrains-mono.woff2",
};

/** Ícone Lucide embutido no HTML durante o build: nenhum JS de terceiros chega ao navegador. */
function icone(nome, rotulo = "") {
  if (!/^[a-z0-9-]+$/.test(nome)) throw new Error(`Nome de ícone inválido: ${nome}`);
  const svg = readFileSync(path.join(pastaIcones, `${nome}.svg`), "utf8")
    .replace(/<!--[\s\S]*?-->\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/class="[^"]*"/, `class="icone icone-${nome}"`)
    .replace(/ width="24" height="24"/, ' width="20" height="20"');
  const acessibilidade = rotulo ? `role="img" aria-label="${rotulo}"` : 'aria-hidden="true" focusable="false"';
  return svg.replace("<svg", `<svg ${acessibilidade}`).trim();
}


/** Item que pode ir ao ar neste build: exemplos só aparecem fora da produção. */
const publicavel = (item) => !(producao && item.data.exemplo);

/** Slug sem acentos para âncoras de títulos. */
function slug(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Coleção de uma pasta de conteúdo, mais recente primeiro, sem os exemplos em produção. */
function colecao(pasta) {
  return (api) =>
    api
      .getFilteredByGlob(`src/${pasta}/*.md`)
      .filter(publicavel)
      .sort((a, b) => (b.data.ordem ?? 0) - (a.data.ordem ?? 0) || b.date - a.date);
}

export default function (config) {
  config.addGlobalData("producao", producao);

  config.addCollection("projetos", colecao("projetos"));
  config.addCollection("produtos", colecao("produtos"));
  config.addCollection("insights", colecao("insights"));
  // Sobre entra na navegação só quando a página é gerada (ver src/sobre.11tydata.js).
  config.addCollection("sobre", (api) => api.getFilteredByGlob("src/sobre.njk").filter((pagina) => pagina.url));

  // Títulos h2 e h3 do Markdown ganham id, para o sumário e links diretos.
  config.amendLibrary("md", (md) => {
    md.renderer.rules.heading_open = (tokens, i, opcoes, env, self) => {
      const token = tokens[i];
      if (["h2", "h3"].includes(token.tag)) token.attrSet("id", slug(tokens[i + 1].content));
      return self.renderToken(tokens, i, opcoes);
    };
  });

  config.addPassthroughCopy({ public: "/" });
  config.addPassthroughCopy({ "src/assets": "assets" });
  config.addPassthroughCopy(fontes);

  config.addShortcode("icone", icone);

  // Navegação: item desligado em site.json some; item ligado a uma coleção só aparece com conteúdo.
  config.addFilter("visiveis", (itens, colecoes) =>
    itens.filter((item) => item.ativo && (!item.colecao || (colecoes[item.colecao] ?? []).length > 0)),
  );
  config.addFilter("ano", () => new Date().getFullYear());
  config.addFilter("dataBr", (data) =>
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(data),
  );
  config.addFilter("dataIso", (data) => data.toISOString().slice(0, 10));
  // Leitura a 200 palavras por minuto, arredondada para cima.
  config.addFilter("leitura", (html) => Math.max(1, Math.ceil(String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200)));
  // Sumário: os h2 com id que o Markdown gerou.
  config.addFilter("sumario", (html) =>
    [...String(html).matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map(([, id, texto]) => ({ id, texto: texto.replace(/<[^>]+>/g, "") })),
  );
  config.addFilter("destaques", (itens, limite = 3) => itens.filter((item) => item.data.destaque).slice(0, limite));
  config.addFilter("relacionados", (itens, url, categoria, limite = 3) =>
    itens.filter((item) => item.url !== url && item.data.categoria === categoria).slice(0, limite),
  );
  config.addFilter("head", (itens, n) => itens.slice(0, n));
  config.addFilter("comCampo", (itens, campo, valor) => itens.filter((item) => item.data[campo] === valor));
  config.addFilter("porChave", (lista, chave) => lista.find((item) => item.chave === chave));

  config.setServerOptions({ port: 8080 });
}

export const config = {
  dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
