// Dados estruturados Schema.org (JSON-LD) de cada página, montados no build.

/** Pessoa dona do site: só fatos configurados em site.json (sem cargo inventado). */
function pessoa(site) {
  return {
    "@type": "Person",
    "@id": `${site.url}/#pessoa`,
    name: site.nome,
    url: site.url,
    description: site.posicionamento,
    sameAs: site.redes.filter((rede) => rede.url).map((rede) => rede.url),
  };
}

/** Trilha a partir da URL: Início › seção (rótulo do menu) › página. */
function trilha(site, url, titulo) {
  const partes = url.split("/").filter(Boolean);
  if (!partes.length) return null;
  const itens = [{ nome: "Início", url: "/" }];
  const secao = site.navegacao.find((item) => item.url === `/${partes[0]}/`);
  if (secao) itens.push({ nome: secao.rotulo, url: secao.url });
  if (partes.length > 1 || !secao) itens.push({ nome: titulo, url });
  return {
    "@type": "BreadcrumbList",
    itemListElement: itens.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.nome, item: site.url + item.url })),
  };
}

/** Grafo JSON-LD da página, já serializado e seguro para ir dentro de <script>. */
export function esquema({ site, page, titulo, resumo, subtitulo, tipo, imagem }) {
  // Página que não será gerada (permalink false) ainda passa pelo render: nada a descrever.
  if (!page.url) return "{}";
  const url = site.url + page.url;
  const grafo = [pessoa(site)];

  if (page.url === "/") {
    grafo.push({ "@type": "WebSite", "@id": `${site.url}/#site`, url: site.url, name: site.nome, inLanguage: site.idioma, publisher: { "@id": `${site.url}/#pessoa` } });
  }
  if (tipo === "artigo") {
    grafo.push({
      "@type": "Article",
      headline: titulo,
      description: subtitulo || resumo,
      datePublished: page.date.toISOString().slice(0, 10),
      inLanguage: site.idioma,
      url,
      image: imagem,
      author: { "@id": `${site.url}/#pessoa` },
    });
  }
  if (tipo === "produto") {
    grafo.push({ "@type": "SoftwareApplication", name: titulo, description: resumo, url, author: { "@id": `${site.url}/#pessoa` } });
  }
  if (tipo === "projeto") {
    grafo.push({ "@type": "CreativeWork", name: titulo, description: resumo, url, creator: { "@id": `${site.url}/#pessoa` } });
  }
  const migalhas = trilha(site, page.url, titulo);
  if (migalhas) grafo.push(migalhas);

  return JSON.stringify({ "@context": "https://schema.org", "@graph": grafo }).replace(/</g, "\u003c");
}
