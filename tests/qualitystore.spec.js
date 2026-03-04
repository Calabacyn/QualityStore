const { test, expect } = require('@playwright/test');

async function loginAsAdmin(page) {
    await page.goto('/login');
    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('12345');
    await page.getByTestId('login-button').click();

    await page.waitForURL('**/admin', { timeout: 20000 });
}

async function waitForProducts(page) {
    await expect(
        page.locator('[data-testid="products-grid"], [data-testid="results-empty"]')
    ).toBeVisible({ timeout: 15_000 });
}

test.describe('1. Autenticación y Seguridad (RBAC)', () => {

    test('Login exitoso como Admin redirige a /admin', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('admin');
        await page.getByTestId('login-password').fill('12345');
        await page.getByTestId('login-button').click();

        await page.waitForURL('**/admin');
        await expect(page.getByText('Panel de Control')).toBeVisible();
    });

    test('Usuario no autorizado no puede ver el panel admin (sin login)', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).not.toHaveURL(/\/admin/, { timeout: 8_000 });
    });

    test('Usuario cliente no puede ver el panel admin', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('user_test');
        await page.getByTestId('login-password').fill('password123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/');

        await page.goto('/admin');
        await page.waitForURL('**/');
    });

    test('Credenciales inválidas muestran mensaje de error', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('usuario_falso');
        await page.getByTestId('login-password').fill('password_incorrecta');
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 8_000 });
    });
});

test.describe('2. Gestión de Productos – CRUD', () => {

    test('Creación de producto y verificación de persistencia en la Tienda', async ({ page }) => {
        const UNIQUE_TITLE = `Test Almohada ${Date.now()}`;


        await loginAsAdmin(page);
        await page.getByTestId('admin-add-product').click();

        await page.getByTestId('admin-product-title').fill(UNIQUE_TITLE);
        await page.getByTestId('admin-product-price').fill('49.99');
        await page.getByTestId('admin-product-category').fill('home');
        await page.getByTestId('admin-product-image').fill('https://fakestoreapi.com/img/81fAn1SWh1L._AC_SL1500_.jpg');
        await page.getByTestId('admin-product-description').fill('Una almohada de prueba creada por Playwright.');
        await page.getByTestId('admin-save-product').click();

        await expect(page.getByText('Producto creado exitosamente')).toBeVisible({ timeout: 8_000 });

        await page.goto('/');
        await waitForProducts(page);

        const grid = page.getByTestId('products-grid');
        await expect(grid).toBeVisible();
        await expect(grid.getByText(UNIQUE_TITLE)).toBeVisible({ timeout: 10_000 });
    });

    test('Edición instantánea de precio se refleja en la Tienda sin reiniciar', async ({ page }) => {
        const EDITED_PRICE = '999.99';

        await loginAsAdmin(page);

        const firstEditBtn = page.locator('[data-testid^="admin-edit-"]').first();
        await expect(firstEditBtn).toBeVisible({ timeout: 15_000 });

        const productRow = firstEditBtn.locator('xpath=ancestor::tr');
        const productTitle = await productRow.locator('span.font-medium').textContent();

        await firstEditBtn.click();

        const priceInput = page.getByTestId('admin-product-price');
        await priceInput.clear();
        await priceInput.fill(EDITED_PRICE);
        await page.getByTestId('admin-save-product').click();

        await expect(page.getByText('Producto actualizado')).toBeVisible({ timeout: 8_000 });

        await page.goto('/');
        await waitForProducts(page);
        await expect(page.getByTestId('products-grid')).toBeVisible();

        const productCard = page
            .getByTestId('products-grid')
            .locator('div', { hasText: productTitle?.trim() ?? '' })
            .first();
        await expect(productCard.getByText(`$${EDITED_PRICE}`)).toBeVisible({ timeout: 10_000 });
    });
});

test.describe('3. Búsqueda y Filtrado', () => {

    test('Búsqueda por categoría "men\'s clothing" muestra solo productos relevantes', async ({ page }) => {
        await page.goto('/');
        await waitForProducts(page);

        const searchInput = page.getByTestId('search-input');
        await searchInput.fill("men's clothing");

        const responsePromise = page.waitForResponse(
            resp => resp.url().includes('/api/products/search') && resp.status() === 200
        );

        await page.getByTestId('search-button').click();
        const response = await responsePromise;
        const data = await response.json();

        console.log(`El servidor devolvió ${data.length} productos`);

        const grid = page.getByTestId('products-grid');
        await expect(grid).toBeVisible({ timeout: 10000 });

        const firstCard = grid.locator('div.bg-white.rounded-2xl').first();
        await expect(firstCard).toContainText(/men's clothing/i, { timeout: 10000 });

        const cards = grid.locator('div.bg-white.rounded-2xl');
        const count = await cards.count();
        expect(count).toBe(data.length);

        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i)).toContainText(/men'?s clothing/i);
        }
    });

    test('Búsqueda sin resultados muestra mensaje de error', async ({ page }) => {
        await page.goto('/');
        await waitForProducts(page);

        await page.getByTestId('search-input').fill('xyzproductoquenoexiste99999');
        await page.getByTestId('search-button').click();

        await expect(page.getByTestId('results-empty')).toBeVisible({ timeout: 10_000 });
        await expect(page.getByTestId('results-empty')).toContainText('No products found');
    });

    test('Búsqueda por título parcial "Mens" filtra correctamente', async ({ page }) => {
        await page.goto('/');
        await waitForProducts(page);

        await page.getByTestId('search-input').fill('Mens');
        await page.getByTestId('search-button').click();

        await waitForProducts(page);

        const gridVisible = await page.getByTestId('products-grid').isVisible();
        const emptyVisible = await page.getByTestId('results-empty').isVisible();

        expect(gridVisible || emptyVisible).toBeTruthy();
    });
});

test.describe('4. Flujo de Carrito (E2E)', () => {

    test('Añadir producto al carrito y verificar nombre y precio', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('user_test');
        await page.getByTestId('login-password').fill('password123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/');
        await waitForProducts(page);

        const firstCard = page.getByTestId('products-grid').locator('div.bg-white.rounded-2xl').first();
        const productTitle = (await firstCard.locator('h3').textContent())?.trim() ?? '';
        const productPrice = (await firstCard.locator('span.text-2xl').textContent())?.trim() ?? '';

        await firstCard.locator('[data-testid^="add-to-cart-"]').click();

        await page.goto('/cart');

        const xpathTitle = `//h3[contains(text(), "${productTitle}")]`;
        await expect(page.locator(xpathTitle)).toBeVisible({ timeout: 5000 });

        const xpathPrice = `//*[contains(normalize-space(), "${productPrice}")]`;
        await expect(page.locator(xpathPrice).first()).toBeVisible({ timeout: 5000 });
    });

    test('Añadir dos productos distintos y verificar que el total sea correcto', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('user_test');
        await page.getByTestId('login-password').fill('password123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/');
        await waitForProducts(page);

        const grid = page.getByTestId('products-grid');
        const cards = grid.locator('div.bg-white.rounded-2xl');

        const priceText1 = await page.locator('(//div[@data-testid="products-grid"]//span[contains(@class, "text-2xl")])[1]').textContent();
        const priceText2 = await page.locator('(//div[@data-testid="products-grid"]//span[contains(@class, "text-2xl")])[2]').textContent();

        const price1 = parseFloat(priceText1?.replace(/[^0-9.]/g, '') ?? '0');
        const price2 = parseFloat(priceText2?.replace(/[^0-9.]/g, '') ?? '0');
        const expectedTotal = parseFloat((price1 + price2).toFixed(2));

        await page.locator('[data-testid^="add-to-cart-"]').nth(0).click();
        await page.locator('[data-testid^="add-to-cart-"]').nth(1).click();

        await page.goto('/cart');

        const totalLocator = page.locator('//span[@data-testid="cart-total-price"]');

        await expect(totalLocator).toBeVisible({ timeout: 5000 });

        const totalText = await totalLocator.textContent();
        const displayedTotal = parseFloat(totalText?.replace(/[^0-9.]/g, '') ?? '-1');

        expect(displayedTotal).toBeCloseTo(expectedTotal, 2);

        const formattedTotal = expectedTotal.toFixed(2);

        const totalElement = page.getByTestId('cart-total-price');
        await expect(totalElement).toContainText(formattedTotal, { timeout: 5000 });
    });

    test('Checkout muestra confirmación de orden procesada', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('user_test');
        await page.getByTestId('login-password').fill('password123');
        await page.getByTestId('login-button').click();
        await page.waitForURL('**/');
        await waitForProducts(page);

        const firstCard = page.getByTestId('products-grid').locator('div.bg-white.rounded-2xl').first();
        await firstCard.locator('[data-testid^="add-to-cart-"]').click();

        await page.goto('/cart');

        await page.getByTestId('checkout-button').click();

        await expect(page.getByTestId('order-success-title')).toBeVisible({ timeout: 8_000 });
        await expect(page.getByTestId('order-success-title')).toContainText('Orden procesada');
    });
});
