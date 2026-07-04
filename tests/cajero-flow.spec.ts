import { test, expect } from "@playwright/test";

test.describe("Flujo Básico de la Plataforma", () => {
  test("debería cargar la página de inicio (landing) con el título correcto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/WashMaster/i);
  });

  test("debería redirigir al login y mostrar el formulario", async ({ page }) => {
    await page.goto("/login");
    const heading = page.locator("h1");
    await expect(heading).toContainText(/WashMaster/i);
    
    // Verificar que los campos de correo y contraseña estén en la página
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
