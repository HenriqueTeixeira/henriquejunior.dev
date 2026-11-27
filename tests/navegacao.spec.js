import { test, expect } from "@playwright/test";
import { paginas } from "./paginas.js";

// Erros de console (inclusive violação de CSP) reprovam a página.
function vigiarConsole(page) {
  const erros = [];
  page.on("console", (msg) => msg.type() === "error" && erros.push(msg.text()));
  page.on("pageerror", (erro) => erros.push(erro.message));
  return erros;
}

for (const url of paginas) {
  test.describe(`página ${url}`, () => {
    test("carrega sem erros e com a estrutura básica", async ({ page }) => {
      const erros = vigiarConsole(page);
      const resposta = await page.goto(url);
      expect(resposta.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      expect(await page.title()).not.toBe("");
      expect(erros).toEqual([]);
    });

    test("sem rolagem horizontal", async ({ page }) => {
      await page.goto(url);
      const excesso = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(excesso).toBeLessThanOrEqual(0);
    });

    test("links internos respondem", async ({ page, request }) => {
      await page.goto(url);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href")))]);
      for (const href of hrefs) {
        const resposta = await request.get(href.split("#")[0]);
        expect(resposta.status(), href).toBe(200);
      }
    });
  });
}

test("link para pular ao conteúdo é o primeiro foco", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const pular = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(pular).toBeFocused();
  await expect(pular).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("tema alterna, fica salvo e segue o sistema sem escolha", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  const botao = page.getByRole("button", { name: "Usar tema escuro" });
  await expect(html).not.toHaveAttribute("data-theme", /.+/);

  await botao.click();
  await expect(html).toHaveAttribute("data-theme", "escuro");
  await expect(page.getByRole("button", { name: "Usar tema claro" })).toBeVisible();
  // A troca de cor tem transição: espera a cor final.
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(10, 10, 11)");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "escuro");
});

test("tema escuro do sistema é respeitado", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(fundo).toBe("rgb(10, 10, 11)");
  await expect(page.getByRole("button", { name: "Usar tema claro" })).toBeVisible();
});

test("página inexistente responde 404 com a página personalizada", async ({ page }) => {
  const resposta = await page.goto(`/nao-existe-${Date.now()}`);
  expect(resposta.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute("href", "/");
});

test("movimento reduzido desliga as transições", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duracao = await page.evaluate(() => getComputedStyle(document.body).transitionDuration);
  expect(duracao.split(",").every((d) => parseFloat(d) <= 0.001)).toBe(true);
});
