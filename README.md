# site-pessoal

Página pessoal estática publicada em https://henriquejunior.dev, na Cloudflare (Workers + Static Assets).

Projeto de estudo: esteira no GitHub Actions e controles de segurança pensados para produção.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `public/` | Arquivos do site (HTML, CSS, `robots.txt`) |
| `public/_headers` | Cabeçalhos de segurança (CSP, HSTS e outros) |
| `cloudflare.config.ts` | Worker, domínio próprio, `workers.dev` desligado |
| `.github/workflows/deploy.yml` | Esteira: validação em todo PR e push; deploy só na `main` |
| `.github/workflows/checagem-diaria.yml` | Roda `scripts/checar-site.sh` todo dia, mesmo sem deploy |
| `scripts/checar-site.sh` | Confere o site publicado: status, conteúdo, cabeçalhos de segurança e 404 |
| `.github/dependabot.yml` | Atualização semanal de actions e dependências |

## Uso local

Requer Node 22.18 ou superior (versão em `.node-version`).

```powershell
npm ci
```

```powershell
npm run dev
```

```powershell
npm run build
```

```powershell
npm run check
```

`npm run check` simula o deploy sem credenciais e sem enviar nada à Cloudflare.

## Fluxo de branches

`feature/*` → PR para `develop` → PR de `develop` para `main`. Só a `main` publica em https://henriquejunior.dev. As duas branches são protegidas: mudança só por PR, com a validação verde.

## Esteira

1. **validar** (PR e push): `npm ci`, `npm audit`, build e deploy simulado. Não recebe secrets.
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

- CSP estrita: a página não usa script nem estilo inline.
- HSTS começa curto (1 dia); aumente depois de confirmar o HTTPS em todo o domínio.
- `workers.dev` desligado: o site responde só no domínio próprio.
- Actions fixadas por SHA, `permissions: contents: read` e checkout sem credenciais persistidas.
