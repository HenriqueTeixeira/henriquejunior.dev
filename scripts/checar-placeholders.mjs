// Reprova o build de produção se algum placeholder "[PREENCHER" chegou ao HTML gerado.
// Em produção, exemplos e campos vazios já são omitidos; isto pega o que escapou dessa regra.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function arquivos(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    return item.isDirectory() ? arquivos(caminho) : /\.(html|xml|txt)$/.test(item.name) ? [caminho] : [];
  });
}

const encontrados = arquivos("dist").filter((arquivo) => readFileSync(arquivo, "utf8").includes("[PREENCHER"));
if (encontrados.length) {
  console.error(`Placeholder no build de produção:\n${encontrados.map((a) => `  ${a}`).join("\n")}`);
  process.exit(1);
}
console.log("Nenhum placeholder no build.");
