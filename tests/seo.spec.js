import { test, expect } from "@playwright/test";
import { paginas } from "./paginas.js";

const dominio = "https://henriquejunior.dev";

// Metadados de busca e compartilhamento em toda página indexável.
for (const url of paginas) {
  test(`metadados de ${url}`, async ({ page }) => {
    await page.goto(url);
    const meta = (seletor) => page.locator(seletor).getAttribute("content");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", dominio + url);
    expect(await meta('meta[name="description"]')).toBeTruthy();
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[property="og:url"]')).toBe(dominio + url);
    expect(await meta('meta[property="og:image"]')).toBe(`${dominio}/og.png`);
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");

    const jsonld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    const tipos = jsonld["@graph"].map((item) => item["@type"]);
    expect(tipos).toContain("Person");
    if (url !== "/") expect(tipos).toContain("BreadcrumbList");
  });
}

test("sitemap lista exatamente as páginas indexáveis", async ({ request }) => {
  const resposta = await request.get("/sitemap.xml");
  expect(resposta.status()).toBe(200);
  const locs = [...(await resposta.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => loc.replace(dominio, "")).sort();
  expect(locs).toEqual(paginas);
});

test("robots.txt aponta o sitemap", async ({ request }) => {
  const texto = await (await request.get("/robots.txt")).text();
  expect(texto).toContain(`Sitemap: ${dominio}/sitemap.xml`);
});

test("analytics fica fora do build de preview", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
  const csp = (await request.get("/")).headers()["content-security-policy"];
  expect(csp).not.toContain("cloudflareinsights");
});
