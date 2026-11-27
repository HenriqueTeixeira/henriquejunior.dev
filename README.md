# henriquejunior.dev

Site pessoal e vitrine de produtos de Henrique Junior, publicado em https://henriquejunior.dev.

Site estático gerado pelo [Eleventy](https://www.11ty.dev/) e servido pela Cloudflare (Workers + Static Assets), sem servidor próprio e sem JavaScript de terceiros no navegador.

- [Manutenção](docs/manutencao.md): publicar, conferir, voltar versão e rotinas.
- [Decisões de arquitetura](docs/decisoes.md): o que foi escolhido e por quê.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/` | Fonte do site: páginas (`*.njk`), dados e layouts |
| `src/_data/site.json` | Identidade, apresentação, navegação, contato e redes. Item de menu com `"ativo": false` some; item ligado a uma coleção só aparece com conteúdo |
| `src/_data/sobre.json`, `areas.json`, `catalogo.json` | Página Sobre, áreas de atuação da Home e listas fixas (categorias, tipos de projeto, status de produto) |
| `src/projetos/`, `src/produtos/`, `src/insights/` | Um arquivo Markdown por projeto, produto ou artigo |
| `lib/conteudo.js` | Regra de publicação: o que vai ao ar em produção |
| `src/_data/textos.json` | Textos da interface por idioma (hoje só `pt-BR`) |
| `src/_includes/` | Layouts (base, projeto, produto, artigo) e componentes |
| `src/assets/css/tokens.css` | Design system: cores, tipografia, espaçamento, forma e movimento; temas claro e escuro |
| `src/assets/css/site.css`, `paginas.css` | Base, cabeçalho e terminal; seções, listagens e páginas internas. Só usam os tokens |
| `src/assets/js/` | `tema.js` (aplica o tema antes da pintura) e `site.js` (botão de tema e menu) |
| `public/` | Copiado sem mudança para a raiz do site: `robots.txt`, `favicon.svg` (monograma) e `og.png` (imagem de compartilhamento) |
| `src/_headers.njk` | Cabeçalhos de segurança (CSP e outros), gerados no build: só a produção libera o Cloudflare Web Analytics |
| `src/sitemap.njk` | `sitemap.xml` com as páginas geradas e indexáveis |
| `lib/esquema.js` | Dados estruturados Schema.org (Person, WebSite, Article, SoftwareApplication, CreativeWork, BreadcrumbList) |
| `dist/` | Saída do Eleventy (não versionada), publicada pela Cloudflare |
| `eleventy.config.js` | Configuração do Eleventy, ícones Lucide embutidos no build e fontes |
| `cloudflare.config.ts` | Worker, domínio próprio, `workers.dev` desligado |
| `tests/` | Testes Playwright (navegação, temas, responsividade) e axe (acessibilidade) |
| `lighthouserc.json` | Metas do Lighthouse: 95 ou mais em todas as categorias |
| `scripts/servir.mjs` | Servidor local de `dist/` com os cabeçalhos do `_headers`, usado pelos testes |
| `scripts/checar-site.sh` | Confere o site publicado: status, conteúdo, cabeçalhos de segurança e 404 |
| `scripts/checar-placeholders.mjs` | Reprova o build de produção se sobrar algum `[PREENCHER` |
| `scripts/gerar-og.mjs` | Gera `public/og.png` (1200×630) com `npm run og`; rodar de novo quando nome, posicionamento ou marca mudarem |
| `.github/workflows/deploy.yml` | Esteira: validação e testes em todo PR e push; preview; deploy só na `main` |
| `.github/workflows/checagem-diaria.yml` | Roda `scripts/checar-site.sh` todo dia, mesmo sem deploy |
| `.github/dependabot.yml` | Atualização semanal de actions e dependências |
| `docs/` | Guia de manutenção e registro de decisões |
| `LICENSE` | Licenças: MIT para o código; conteúdo e identidade reservados |

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

## Conteúdo

Nenhuma mudança de código é necessária para publicar conteúdo novo.

- **Projeto:** crie `src/projetos/<slug>.md`. Front matter: `titulo`, `resumo`, `categoria` e `tipo` (chaves de `catalogo.json`), `date`, `status`, `tecnologias`, `links` e `destaque: true` para aparecer na Home. O corpo segue o estudo de caso com títulos `##` (Contexto, Problema, Objetivos, Minha participação, Estratégia, Solução, Resultados, Aprendizados). Use `src/projetos/henriquejunior-dev.md` como modelo.
- **Produto:** crie `src/produtos/<slug>.md` com `titulo`, `resumo`, `categoria`, `status` (chave de `catalogo.json`), `problema`, `publico`, `funcionalidades` e `links` (`acesso`, `documentacao`, `privacidade`).
- **Artigo:** crie `src/insights/<slug>.md` com `titulo`, `subtitulo`, `categoria` e `date`. O tempo de leitura, o sumário (títulos `##`) e os artigos relacionados (mesma categoria) são calculados.
- **Sobre:** preencha `src/_data/sobre.json`.

### Exemplos e placeholders

Item com `exemplo: true` e campo vazio do `sobre.json` aparecem nos previews e no ambiente local, marcados como `[PREENCHER: …]`, para mostrar o layout. No build de produção (`SITE_AMBIENTE=producao`) eles somem, e uma seção sem nenhum item real some do menu, da Home e das URLs. A esteira roda `npm run checar:placeholders` nesse build e reprova se algum placeholder escapar.

Para ver localmente como fica em produção:

```powershell
$env:SITE_AMBIENTE = 'producao'; npm run build:site; Remove-Item Env:SITE_AMBIENTE
```

## SEO, analytics e privacidade

- Toda página tem `canonical`, Open Graph, cartão do X/Twitter (imagem `public/og.png`) e JSON-LD. Previews e `workers.dev` continuam com `X-Robots-Tag: noindex`.
- O Cloudflare Web Analytics usa o token público de `site.json` (`analytics.token`), que não é segredo: ele aparece no HTML. O script e a liberação na CSP só entram no build de produção. Para desligar, deixe o token `null`.
- A página `/privacidade/` descreve o tratamento de dados (hospedagem, estatísticas sem cookies, tema salvo no navegador). Revise-a se algo novo passar a coletar dados, como um formulário.

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

## Licença

O código é MIT. Textos, nome, marca, monograma e imagem de compartilhamento têm todos os direitos reservados. Detalhes e licenças de terceiros (fontes Geist e JetBrains Mono, ícones Lucide) em [LICENSE](LICENSE).
