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

## Esteira

1. **validar** (PR e push): `npm ci`, `npm audit`, build e deploy simulado. Não recebe secrets.
2. **deploy** (push na `main`): roda no environment `production` do GitHub, que guarda os secrets e pode exigir aprovação. Depois de publicar, roda `scripts/checar-site.sh` contra o domínio; se o site ou os cabeçalhos não estiverem certos, a esteira fica vermelha.

Secrets do environment `production`:

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
