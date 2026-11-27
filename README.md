# henriquejunior.dev

Site pessoal e vitrine de produtos de Henrique Junior, publicado em https://henriquejunior.dev.

Site estático gerado pelo [Eleventy](https://www.11ty.dev/) e servido pela Cloudflare (Workers + Static Assets), sem servidor próprio e sem JavaScript de terceiros no navegador.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/` | Fonte do site: páginas (`*.njk`), dados e layouts |
| `src/_data/site.json` | Identidade, navegação e redes. Item de menu com `"visivel": false` fica escondido |
| `src/_data/textos.json` | Textos da interface por idioma (hoje só `pt-BR`) |
| `src/_includes/` | Layout base e componentes (cabeçalho, rodapé) |
| `src/assets/css/tokens.css` | Design system: cores, tipografia, espaçamento, forma e movimento; temas claro e escuro |
| `src/assets/css/site.css` | Base, layout e componentes, só com os tokens |
| `src/assets/js/` | `tema.js` (aplica o tema antes da pintura) e `site.js` (botão de tema e menu) |
| `public/` | Copiado sem mudança para a raiz do site: `_headers`, `robots.txt`, `favicon.svg` |
| `dist/` | Saída do Eleventy (não versionada), publicada pela Cloudflare |
| `eleventy.config.js` | Configuração do Eleventy, ícones Lucide embutidos no build e fontes |
| `cloudflare.config.ts` | Worker, domínio próprio, `workers.dev` desligado |
| `tests/` | Testes Playwright (navegação, temas, responsividade) e axe (acessibilidade) |
| `lighthouserc.json` | Metas do Lighthouse: 95 ou mais em todas as categorias |
| `scripts/servir.mjs` | Servidor local de `dist/` com os cabeçalhos do `_headers`, usado pelos testes |
| `scripts/checar-site.sh` | Confere o site publicado: status, conteúdo, cabeçalhos de segurança e 404 |
| `.github/workflows/deploy.yml` | Esteira: validação e testes em todo PR e push; preview; deploy só na `main` |
| `.github/workflows/checagem-diaria.yml` | Roda `scripts/checar-site.sh` todo dia, mesmo sem deploy |
| `.github/dependabot.yml` | Atualização semanal de actions e dependências |

## Uso local

Requer Node 22.18 ou superior (versão em `.node-version`).

```powershell
npm ci
```

Servidor de desenvolvimento do Eleventy, com recarga automática, em http://localhost:8080:

```powershell
npm run dev
```

Build completo (Eleventy e Cloudflare) e deploy simulado, sem credenciais e sem enviar nada:

```powershell
npm run build
```

```powershell
npm run check
```

Testes (rodam contra `dist/`; gere antes com `npm run build:site`):

```powershell
npm test
```

```powershell
npm run lighthouse
```

Se o download do Chromium do Playwright for bloqueado pela rede, use o Chrome instalado na máquina:

```powershell
$env:PW_CANAL = 'chrome'; npm test
```

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'; npm run lighthouse
```

## Fluxo de branches

`feature/*` → PR para `develop` → PR de `develop` para `main`. Só a `main` publica em https://henriquejunior.dev. As duas branches são protegidas: mudança só por PR, com a validação verde.

## Esteira

1. **validar** (PR e push): `npm ci`, `npm audit`, build e deploy simulado. Não recebe secrets.
1. **testes de interface** (PR e push): Playwright em celular, tablet e desktop; axe (WCAG 2.2 AA) nos temas claro e escuro; Lighthouse com mínimo de 95 em desempenho, acessibilidade, boas práticas e SEO. O deploy em produção depende dele.
2. **preview** (push na `develop` e PRs de branches deste repositório): publica uma versão de preview da Cloudflare, sem tocar no domínio, e roda `scripts/checar-site.sh` contra ela. A `develop` tem sempre a mesma URL; cada branch de PR ganha a sua. A URL aparece no resumo da execução e no environment `preview`. PRs vindos de fork não recebem secrets nem preview.
3. **deploy** (push na `main`): roda no environment `production` do GitHub, que guarda os secrets, só aceita a `main` e exige aprovação. Depois de publicar, roda `scripts/checar-site.sh` contra o domínio; se o site ou os cabeçalhos não estiverem certos, a esteira fica vermelha.
4. **checagem diária** (agendada, 06:17 em Belém): repete a conferência do site sem fazer deploy e sem secrets. Detecta site fora do ar ou alterado por fora da esteira; se falhar, o GitHub avisa por e-mail. Também pode ser disparada à mão em *Actions → Checagem diária → Run workflow*.

Secrets dos environments `production` e `preview` (os mesmos nos dois):

| Secret | Conteúdo |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token de API com o menor privilégio necessário |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare |

Nunca coloque tokens no código nem em arquivos `.env` versionados.

## Segurança

- CSP estrita: script, estilo, imagem, fonte e conexões só do próprio site; nada inline.
- Fontes (Geist e JetBrains Mono) e ícones (Lucide) servidos pelo próprio site: nenhum dado do visitante vai a terceiros.
- HSTS começa curto (1 dia); aumente depois de confirmar o HTTPS em todo o domínio.
- `workers.dev` desligado: o site responde só no domínio próprio.
- Actions fixadas por SHA, `permissions: contents: read` e checkout sem credenciais persistidas.
