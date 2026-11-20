import { expect, test } from "@playwright/test";

test.describe("Navegação pública e proteção de rotas", () => {
  test("a página inicial abre com a chamada principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero-heading")).toBeVisible();
  });

  test("visitante que abre o painel é levado ao login (RF02)", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("button", { name: /Entrar na minha conta/ })
    ).toBeVisible();
  });

  test("a busca lista os comércios cadastrados (RF06)", async ({ page }) => {
    await page.goto("/explorar");
    await expect(
      page.getByText("Barbearia Vintage do Bairro").first()
    ).toBeVisible();
  });
});
