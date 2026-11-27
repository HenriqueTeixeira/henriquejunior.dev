# Manutenção

Rotinas para manter https://henriquejunior.dev no ar. O [README](../README.md) explica a estrutura, o uso local e a esteira. As escolhas por trás disso estão em [decisoes.md](decisoes.md).

## Publicar uma mudança

1. Crie uma branch `feature/<assunto>` a partir da `develop`.
2. Abra um PR para a `develop`. A esteira valida o código, roda os testes e publica um preview com a URL da branch.
3. Confira o preview e faça o merge.
4. Para publicar no domínio, abra um PR da `develop` para a `main` e faça o merge.
5. Aprove o job **Deploy em produção** em *Actions*, no environment `production`.
6. O job confere o site publicado no fim. Se ele ficar vermelho, veja [Quando algo falha](#quando-algo-falha).

Conteúdo novo segue o mesmo caminho. O README, na seção "Conteúdo", lista o front matter de cada tipo.

## Antes de cada lançamento

Confira estes pontos no preview da `develop`. A esteira já cobre os testes, mas não cobre o que é decisão sua.

- [ ] Os textos estão corretos e não há nada confidencial de terceiros ou de empregadores.
- [ ] O que deve ir ao ar não está marcado com `exemplo: true`.
- [ ] As seções do menu são as esperadas. Em produção, seção sem conteúdo real some.
- [ ] Se nome, posicionamento ou marca mudaram, `npm run og` foi rodado e `public/og.png` foi atualizado.
- [ ] Se algo novo passou a coletar dados, `/privacidade/` foi revisada.

Para ver localmente o que a produção mostra:

```powershell
$env:SITE_AMBIENTE = 'producao'; npm run build:site; Remove-Item Env:SITE_AMBIENTE
```

## Depois de publicar

- **Checagem automática:** o job de deploy confere status, conteúdo, cabeçalhos de segurança e página 404. A checagem diária repete isso todo dia às 06:17 (Belém).
- **Analytics:** no painel da Cloudflare, em *Analytics & Logs → Web Analytics*, o site `henriquejunior.dev` deve passar a receber visitas.
- **Script duplicado:** o site do Web Analytics foi criado com injeção automática ligada. Se o HTML publicado tiver dois scripts `beacon.min.js`, desligue a injeção automática no painel. O script do build já basta.

Para contar os scripts no HTML publicado:

```powershell
(Invoke-WebRequest https://henriquejunior.dev/).Content -split 'beacon.min.js' | Measure-Object | ForEach-Object { $_.Count - 1 }
```

## Quando algo falha

| Sintoma | O que fazer |
|---|---|
| Teste, axe ou Lighthouse vermelho no PR | Corrija a causa. Não baixe as metas nem desligue o teste para passar |
| `npm audit` reprova | Atualize a dependência; o Dependabot costuma abrir o PR. Se não houver correção, avalie o risco antes de seguir |
| `checar:placeholders` reprova | Sobrou um `[PREENCHER` no build de produção: preencha o campo ou marque o item com `exemplo: true` |
| Deploy falha com conflito de mudanças remotas no Worker | Alguém mudou o Worker pelo painel. Veja o que mudou, leve a mudança para `cloudflare.config.ts` se for para ficar e rode o job de novo |
| Deploy falha por token | O token pode ter expirado ou perdido permissão. Gere outro no painel com as mesmas permissões e troque o secret `CLOUDFLARE_API_TOKEN` nos environments `production` e `preview` |
| Checagem do site publicado vermelha | Abra o site e veja o log do job, que mostra os cabeçalhos recebidos. Se a versão nova estiver quebrada, volte a anterior (abaixo) |
| Checagem diária vermelha sem deploy | O site caiu ou foi mudado por fora da esteira. Confira o painel da Cloudflare e o histórico de deploys do Worker |

### Voltar uma versão

1. **Caminho normal:** reverta o commit na `develop` com `git revert`, abra os PRs até a `main` e aprove o deploy. O histórico fica limpo e a esteira valida a volta.
2. **Emergência:** no painel da Cloudflare, abra o Worker `henriquejunior-dev`, vá em *Deployments* e volte para a versão anterior. Depois faça o caminho normal: o próximo deploy da `main` sobrescreve a volta feita pelo painel.

## Rotinas

| Quando | O quê |
|---|---|
| Toda semana | Revisar os PRs do Dependabot (actions e npm). `cf` e `wrangler` vêm agrupados. Faça o merge só com a esteira verde |
| Todo mês | Conferir se a checagem diária está verde e se o Web Analytics recebe dados |
| A cada 6 meses | Reler `/privacidade/` e o `sobre.json`. Atualizar `compatibilityDate` em `cloudflare.config.ts`, testando no preview |
| Quando o token expirar | Gerar outro com o menor privilégio e trocar o secret nos dois environments |
| Depois de semanas sem problemas de HTTPS | Aumentar o HSTS (issue #9). O preload é difícil de desfazer: decida com calma |

## Segredos

- O repositório não guarda segredos. Os únicos ficam nos environments do GitHub: `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`.
- O token do Web Analytics em `site.json` é público por design: ele aparece no HTML de qualquer visitante.
- Um token vazado deve ser revogado no painel da Cloudflare primeiro e trocado no GitHub depois.

## Backlog

As ideias para depois estão nas issues do repositório: formulário de contato, staging com Access, e-mail no domínio, versão em inglês, Labs, newsletter, subdomínios de produtos, HSTS de 1 ano e o conteúdo que falta (Sobre, LinkedIn, foto).
