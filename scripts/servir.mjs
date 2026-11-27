// Servidor estático mínimo da pasta dist/ para os testes, sem dependências.
// Imita a Cloudflare no que os testes precisam: URLs limpas, 404.html com status 404 e
// os cabeçalhos do bloco "/*" do _headers (a CSP real vale nos testes).
// Uso: node scripts/servir.mjs [porta]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const raiz = path.resolve("dist");
const porta = Number(process.argv[2] ?? 4173);

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
};

async function cabecalhosGlobais() {
  const texto = await readFile(path.join(raiz, "_headers"), "utf8").catch(() => "");
  const cabecalhos = {};
  let noBloco = false;
  for (const linha of texto.split(/\r?\n/)) {
    if (/^\S/.test(linha)) noBloco = linha.trim() === "/*";
    else if (noBloco && linha.includes(":")) {
      const [nome, ...valor] = linha.trim().split(":");
      cabecalhos[nome.trim()] = valor.join(":").trim();
    }
  }
  return cabecalhos;
}

async function arquivo(caminho) {
  const info = await stat(caminho).catch(() => null);
  if (info?.isFile()) return caminho;
  if (info?.isDirectory()) return arquivo(path.join(caminho, "index.html"));
  return null;
}

const globais = await cabecalhosGlobais();

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const pedido = path.normalize(path.join(raiz, decodeURIComponent(url.pathname)));
  const dentro = pedido.startsWith(raiz) ? await arquivo(pedido) : null;
  const encontrado = dentro && path.basename(dentro) !== "_headers" ? dentro : null;
  const alvo = encontrado ?? path.join(raiz, "404.html");

  res.writeHead(encontrado ? 200 : 404, {
    ...globais,
    "Content-Type": tipos[path.extname(alvo)] ?? "application/octet-stream",
  });
  res.end(await readFile(alvo));
}).listen(porta, () => console.log(`dist/ em http://localhost:${porta}`));
