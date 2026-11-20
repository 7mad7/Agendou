import { expect, test, type Page } from "@playwright/test";

// Usuários criados pelo seed de testes (db/seed.mjs)
const CLIENTE = { email: "cliente@teste.com", senha: "Teste1234" };
const COMERCIANTE = { email: "barbearia@teste.com", senha: "Teste1234" };

async function entrar(page: Page, email: string, senha: string) {
  await page.goto("/login");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(senha);
  await page.getByRole("button", { name: /Entrar na minha conta/ }).click();
}

test("comerciante entra e vê o painel do comércio (RF02, RF03)", async ({
  page,
}) => {
  await entrar(page, COMERCIANTE.email, COMERCIANTE.senha);
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Serviços Ativos")).toBeVisible();
});

test("cliente agenda um horário de ponta a ponta (RF05, RF06)", async ({
  page,
}) => {
  await entrar(page, CLIENTE.email, CLIENTE.senha);
  await expect(page).toHaveURL(/\/explorar/);

  await page
    .getByRole("link", { name: /Barbearia Vintage do Bairro/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/c\//);

  await page.getByRole("button", { name: /Corte Degradê \/ Social/ }).click();

  const datas = page
    .getByRole("listbox", { name: "Datas disponíveis para agendamento" })
    .getByRole("option");
  const horarios = page
    .getByRole("listbox", { name: "Horários livres para reserva" })
    .getByRole("option");

  // A partir de amanhã, procura o primeiro dia com horário livre (domingo é fechado)
  await expect(datas.first()).toBeVisible();
  const totalDatas = await datas.count();
  let encontrou = false;
  for (let i = 1; i < totalDatas && !encontrou; i++) {
    await datas.nth(i).click();
    await page.waitForTimeout(300);
    await page.waitForLoadState("networkidle");
    encontrou = (await horarios.count()) > 0;
  }
  expect(encontrou).toBe(true);

  // Escolher o horário já abre a janela de confirmação; o botão "Continuar"
  // da página só serve para reabri-la quando o cliente a fecha.
  await horarios.first().click();
  const confirmacao = page.getByRole("dialog");
  await expect(confirmacao).toBeVisible();
  await confirmacao
    .getByRole("button", { name: /Confirmar Agendamento Agora/ })
    .click();

  await expect(
    confirmacao.getByText("Seu horário foi reservado com sucesso!")
  ).toBeVisible();
});
