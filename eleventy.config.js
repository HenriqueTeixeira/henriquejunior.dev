import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

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

export default function (config) {
  config.addPassthroughCopy({ public: "/" });
  config.addPassthroughCopy({ "src/assets": "assets" });
  config.addPassthroughCopy(fontes);

  config.addShortcode("icone", icone);

  // Navegação: só aparecem os itens ligados em site.json (seção sem conteúdo fica escondida).
  config.addFilter("visiveis", (itens) => itens.filter((item) => item.visivel));
  config.addFilter("ano", () => new Date().getFullYear());

  config.setServerOptions({ port: 8080 });
}

export const config = {
  dir: { input: "src", includes: "_includes", data: "_data", output: "dist" },
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
};
