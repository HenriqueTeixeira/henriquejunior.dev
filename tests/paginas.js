// Lista as páginas geradas em dist/: toda página nova entra nos testes sem mudar código.
import { readdirSync } from "node:fs";
import path from "node:path";

function html(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) return item.name === "assets" ? [] : html(caminho);
    return item.name.endsWith(".html") ? [caminho] : [];
  });
}

export const paginas = html("dist")
  .map((arquivo) => "/" + path.relative("dist", arquivo).split(path.sep).join("/"))
  .map((url) => url.replace(/index\.html$/, ""))
  .filter((url) => url !== "/404.html")
  .sort();
