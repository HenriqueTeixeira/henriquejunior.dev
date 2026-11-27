// Gera public/og.png (1200×630), a imagem de compartilhamento, com as fontes do próprio site.
// Uso: npm run og. Rodar de novo só quando nome, posicionamento ou marca mudarem.
import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const fonte = (arquivo) => readFileSync(arquivo).toString("base64");
const geist = fonte("node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2");
const mono = fonte("node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2");
const escapar = (texto) => texto.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const [p1 = "", p2 = "", p3 = ""] = site.posicionamento.split(" ").map(escapar);

const prompt = (comando) =>
  `<div><span class="v">henrique@junior</span><span class="d">:</span><span class="a">~</span>$ ${comando}</div>`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face{font-family:Geist;src:url(data:font/woff2;base64,${geist}) format("woff2");font-weight:100 900}
@font-face{font-family:Mono;src:url(data:font/woff2;base64,${mono}) format("woff2");font-weight:100 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0A0A0B;padding:48px;font-family:Mono,monospace;color:#FAFAFA}
.janela{height:100%;border:2px solid #3F3F46;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;background:#0A0A0B}
.barra{height:56px;background:#1C1C1F;display:flex;align-items:center;gap:12px;padding:0 24px;position:relative}
.barra i{width:16px;height:16px;border-radius:50%;display:block}
.barra b{position:absolute;left:0;right:0;text-align:center;font-weight:400;font-size:20px;color:#A1A1AA}
.corpo{flex:1;padding:40px 48px;display:flex;flex-direction:column;justify-content:center;gap:14px;font-size:28px;line-height:1.35}
.v{color:#4ADE80}.d{color:#A1A1AA}.a{color:#60A5FA}
h1{font-family:Geist,sans-serif;font-size:84px;font-weight:700;letter-spacing:-0.035em;line-height:1.05;margin-bottom:10px}
.pos{font-size:36px;margin-bottom:10px}
.cursor{display:inline-block;width:17px;height:32px;vertical-align:-5px;background:#818CF8}
.url{margin-left:auto;color:#A1A1AA;font-size:22px}
</style></head><body><div class="janela">
<div class="barra"><i style="background:#F87171"></i><i style="background:#FACC15"></i><i style="background:#4ADE80"></i><b>henrique@junior: ~</b></div>
<div class="corpo">
${prompt("whoami")}
<h1>${escapar(site.nome)}</h1>
${prompt("cat posicionamento.txt")}
<div class="pos"><span style="color:#22D3EE">${p1}</span> <span style="color:#F472B6">${p2}</span> <span style="color:#FACC15">${p3}</span></div>
<div style="display:flex;align-items:center"><span class="v">henrique@junior</span><span class="d">:</span><span class="a">~</span>$&nbsp;<span class="cursor"></span><span class="url">${escapar(new URL(site.url).host)}</span></div>
</div></div></body></html>`;

const navegador = await chromium.launch(process.env.PW_CANAL ? { channel: process.env.PW_CANAL } : {});
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
await pagina.setContent(html);
await pagina.evaluate(() => document.fonts.ready);
await pagina.screenshot({ path: "public/og.png" });
await navegador.close();
console.log("public/og.png gerado");
