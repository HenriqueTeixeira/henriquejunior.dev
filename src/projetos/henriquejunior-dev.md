---
titulo: henriquejunior.dev
resumo: Este site. Um site pessoal estático, seguro e verificado por testes, publicado na Cloudflare com esteira no GitHub.
categoria: pessoal
tipo: pessoal
status: Em construção
date: 2026-11-26
destaque: true
tecnologias: [Eleventy, Cloudflare Workers, GitHub Actions, Playwright, axe, Lighthouse CI]
links:
  - rotulo: Código no GitHub
    url: https://github.com/HenriqueTeixeira/henriquejunior.dev
---

## Contexto

Eu precisava de um lugar próprio para reunir trajetória, projetos, produtos e ideias, sem depender de plataformas de terceiros e sem manter servidor.

## Problema

Sites pessoais costumam nascer rápido e envelhecer mal: dependências demais, nenhum teste, segurança esquecida e publicação manual. O desafio era fazer algo pequeno, mas com o mesmo cuidado de um sistema em produção.

## Objetivos

- Site estático, rápido e acessível, com metas verificadas por testes e não presumidas.
- Conteúdo separado da interface: um projeto ou produto novo é um arquivo Markdown.
- Publicação automática, com revisão e aprovação antes de ir ao ar.
- Segurança desde a primeira versão, sem segredos no código.

## Minha participação

Concepção, decisões de produto, arquitetura e segurança, revisão e aprovação de cada mudança. A implementação foi feita em par com um assistente de IA (Claude Code), sempre com revisão humana.

## Estratégia

Começar pela base — repositório, esteira, proteções e previews — antes de qualquer página. Depois a fundação técnica (gerador, design system e testes), a marca e, por fim, o conteúdo. Cada etapa entra por pull request, passa pelos testes e ganha uma URL de preview.

## Solução

- **Eleventy** gera HTML puro a partir de Markdown e JSON; nenhum framework vai para o navegador.
- **Cloudflare Workers com Static Assets** serve o site; previews de cada branch ficam em URLs próprias, sem indexação.
- **GitHub Actions** valida, testa e publica. Produção só aceita a branch `main` e exige aprovação manual.
- **Política de segurança de conteúdo (CSP)** restrita: só recursos do próprio domínio, fontes servidas pelo site e ícones embutidos no build.
- **Tema terminal** com temas claro e escuro, respeitando a preferência do sistema e o movimento reduzido.

## Resultados

- Testes de navegação e acessibilidade (WCAG 2.2 AA, com axe) em celular, tablet e desktop, nos dois temas, a cada pull request.
- Lighthouse com nota mínima de 95 em desempenho, acessibilidade, boas práticas e SEO como condição para a esteira passar.
- Checagem diária do site publicado: status, conteúdo e cabeçalhos de segurança.

## Aprendizados

Automatizar a verificação cedo saiu mais barato do que corrigir depois: os testes pegaram problemas de contraste e de política de segurança antes de chegarem ao ar.
