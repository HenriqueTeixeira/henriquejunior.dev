import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { paginas } from "./paginas.js";

// WCAG 2.2 nível AA, nos dois temas, em todas as páginas e na 404.
const regras = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const url of [...paginas, "/404.html"]) {
  for (const tema of ["claro", "escuro"]) {
    test(`acessibilidade de ${url} no tema ${tema}`, async ({ page }) => {
      await page.addInitScript((valor) => localStorage.setItem("tema", valor), tema);
      await page.goto(url);
      const resultado = await new AxeBuilder({ page }).withTags(regras).analyze();
      const resumo = resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
      expect(resumo).toEqual([]);
    });
  }
}
