# Decisões de arquitetura

Registro das escolhas que moldaram a primeira versão (novembro de 2026). Cada uma traz o motivo e o que ela custa. Antes de mudar uma delas, leia o motivo. Uma decisão nova ganha uma seção nova; não reescreva as antigas.

## 1. Site estático gerado pelo Eleventy

- **Decisão:** HTML gerado no build pelo Eleventy 3, com templates Nunjucks. Nada de framework de interface no navegador.
- **Motivo:** o site é conteúdo. Com HTML pronto, a página carrega rápido, tem pouco a quebrar e não depende de JavaScript para ser lida.
- **Custo:** qualquer interação nova (busca, formulário) exige código próprio ou um Worker.

## 2. Cloudflare Workers com Static Assets, pelo `cf` CLI

- **Decisão:**
  - O Worker `henriquejunior-dev` serve o conteúdo de `dist/`, configurado em `cloudflare.config.ts`.
  - O endereço `workers.dev` está desligado. As URLs de versão ficam ligadas para os previews.
- **Motivo:**
  - A Cloudflare recomenda Workers para projetos novos.
  - O domínio já está na conta.
  - Um formulário ou API futura pode ser um Worker no mesmo projeto, sem trocar de plataforma.
- **Custo:** o `cf` CLI ainda é beta (`1.0.0-rc.4`). O Dependabot atualiza `cf` e `wrangler` juntos, e toda atualização passa pela esteira.

## 3. Esteira no GitHub Actions com aprovação para produção

- **Decisão:**
  - Fluxo `feature/*` → `develop` → `main`.
  - Todo PR é validado e testado, e ganha um preview.
  - Só a `main` publica, pelo environment `production`, que exige aprovação manual.
  - Os secrets ficam nos environments, nunca no repositório.
- **Motivo:**
  - Nada chega ao domínio sem passar pelos testes e por uma decisão humana.
  - O token de produção fica fora do alcance de PRs.
- **Custo:** publicar leva dois PRs e uma aprovação, mesmo para uma correção de texto.

## 4. Conteúdo em Markdown e JSON, sem CMS

- **Decisão:**
  - Cada projeto, produto e artigo é um arquivo Markdown com front matter.
  - Os dados do site ficam em `src/_data/*.json`.
  - Os textos da interface ficam em `textos.json`, já separados por idioma.
- **Motivo:**
  - O conteúdo fica versionado junto do código e passa pela mesma revisão.
  - Não há servidor nem conta extra para manter.
- **Custo:** editar exige Git. Um CMS só se justifica se outra pessoa passar a publicar.

## 5. Placeholders só nos previews

- **Decisão:**
  - Itens `exemplo: true` e campos vazios aparecem nos previews como `[PREENCHER: …]`.
  - No build de produção (`SITE_AMBIENTE=producao`) eles somem, e a seção sem conteúdo real some do menu, da Home, do sitemap e das URLs.
  - `checar:placeholders` reprova o deploy se sobrar algum.
- **Motivo:**
  - O layout pode ser revisto antes de o conteúdo existir.
  - A produção não mostra nada inventado nem páginas vazias.
- **Custo:** as regras ficam em dois lugares (`lib/conteudo.js` e as coleções em `eleventy.config.js`). Os dois precisam mudar juntos.

## 6. Design system em tokens CSS e tema de terminal

- **Decisão:**
  - Cores, tipografia, espaço, forma e movimento ficam em `tokens.css`, com temas claro e escuro.
  - A identidade é um terminal Unix colorido em todo o site: prompt, diretórios no menu e janela de terminal na Home e no 404.
  - Os textos longos continuam em Geist, para a leitura.
- **Motivo:**
  - Uma marca reconhecível e coerente com o trabalho.
  - Os tokens mantêm o contraste AA nos dois temas e deixam trocar a paleta num só arquivo.
- **Custo:** cor nova precisa ter o contraste conferido nos dois temas. O axe cobre os textos, mas não decide se a cor combina.

## 7. Nada de terceiros no navegador

- **Decisão:**
  - As fontes Geist e JetBrains Mono são servidas pelo próprio site, só com o subconjunto latino.
  - Os ícones Lucide são embutidos no HTML durante o build.
  - O único script de fora é o do Web Analytics, e só em produção.
- **Motivo:**
  - Privacidade do visitante, desempenho e uma CSP simples.
- **Custo:** atualizar fonte ou ícone depende do pacote npm, não de um CDN.

## 8. Qualidade verificada por testes

- **Decisão:** Playwright em celular, tablet e desktop; axe (WCAG 2.2 AA) nos dois temas; Lighthouse com mínimo de 95 nas quatro categorias. Tudo roda em todo PR e bloqueia o deploy.
- **Motivo:** acessibilidade e desempenho são requisitos, e requisito sem teste se perde com o tempo.
- **Custo:** os testes rodam no build de preview, que não tem o script de analytics. O impacto dele na produção é medido à parte.

## 9. Segurança por cabeçalhos

- **Decisão:**
  - CSP estrita, sem script nem estilo inline, gerada no build a partir de `src/_headers.njk`.
  - HSTS curto no início (1 dia).
  - `X-Frame-Options`, `Permissions-Policy` e `COOP/CORP` restritivos.
  - Actions fixadas por SHA.
- **Motivo:** o site não tem login nem dados, mas o domínio carrega um nome. Os cabeçalhos impedem injeção, enquadramento e rebaixamento de HTTPS.
- **Custo:** todo recurso externo novo exige mudar a CSP. O HSTS longo com preload (issue #9) fica para depois de o HTTPS estar estável, porque é difícil de desfazer.

## 10. SEO gerado no build

- **Decisão:**
  - Toda página recebe `canonical`, Open Graph, cartão do X/Twitter e JSON-LD (Person, WebSite, Article, SoftwareApplication, CreativeWork, BreadcrumbList), montados em `lib/esquema.js`.
  - O sitemap sai das páginas geradas.
  - Previews recebem `noindex`.
- **Motivo:** os metadados ficam sempre de acordo com as páginas que existem, sem manutenção manual.
- **Custo:** os dados da pessoa (Person) ficam limitados ao que é público e confirmado: nome, URL, posicionamento e GitHub.

## 11. Cloudflare Web Analytics, só em produção

- **Decisão:**
  - Estatísticas sem cookies pelo Web Analytics da própria Cloudflare, aproveitando o site já criado na conta.
  - O script e a liberação na CSP só entram no build de produção.
  - A página `/privacidade/` explica o tratamento.
- **Motivo:**
  - Mostra o alcance sem banner de consentimento e sem mais um fornecedor.
  - Previews não contaminam os números.
- **Custo:**
  - O funcionamento só pode ser conferido em produção.
  - A injeção automática da conta está ligada; se ela passar a agir nas respostas do Worker, o script carrega duas vezes. O [guia de manutenção](manutencao.md#depois-de-publicar) diz como conferir.

## 12. Escopo da primeira versão

- **Decisão:**
  - Contato só por links; o formulário fica para o backlog (issue #2).
  - Labs desligado.
  - Nenhum projeto da SEFA na primeira versão.
  - LinkedIn, Sobre e foto entram quando houver conteúdo real.
- **Motivo:**
  - Lançar com o que é verdadeiro e está pronto.
  - Um formulário exige Worker, Turnstile e revisão de privacidade.
  - Trabalho institucional exige cuidado com confidencialidade.
- **Custo:** a primeira versão é enxuta: Início, Projetos, Contato e Privacidade, até o conteúdo crescer.

## 13. Licença dupla

- **Decisão:** o código sai com licença MIT. Os textos, o nome, a marca, o monograma e a imagem de compartilhamento têm todos os direitos reservados ([LICENSE](../LICENSE)). As licenças das fontes e dos ícones são publicadas junto com eles.
- **Motivo:** o código pode servir de modelo para outros, mas a identidade não pode ser copiada.
- **Custo:** como o arquivo tem duas partes, o GitHub não o reconhece como MIT puro.
