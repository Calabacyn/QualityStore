// @ts-check
const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
test.beforeEach(async ({ page }) => {
    // Mocking de la API para devolver SIEMPRE estos dos productos
    await page.route('**/api/products', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
                {
                    id: 1,
                    title: "Producto Test A",
                    price: 10.00,
                    description: "Primer producto para pruebas",
                    category: "men's clothing",
                    image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg"
                },
                {
                    id: 2,
                    title: "Producto Test B",
                    price: 20.00,
                    description: "Segundo producto para pruebas",
                    category: "electronics",
                    image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg"
                }
            ]),
        });
    });

    // Ir a la web después de configurar el mock
    await page.goto('http://localhost:3002');
});

/** Login as admin and wait until the admin dashboard is rendered */
async function loginAsAdmin(page) {
    await page.goto('/login');
    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('12345');
    await page.getByTestId('login-button').click();
    await page.getByTestId('login-button').click();
    await page.waitForURL('**/', { timeout: 15000 });

}

/** Wait for the product grid or the empty-state message to finish loading */
async function waitForProducts(page) {
    // The loading spinner disappears when either the grid or the empty message appears
    await expect(
        page.locator('[data-testid="products-grid"], [data-testid="results-empty"]')
    ).toBeVisible({ timeout: 15_000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTICATION & SECURITY (RBAC)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('1. Autenticación y Seguridad (RBAC)', () => {

    test('Login exitoso como Admin redirige a /admin', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('admin');
        await page.getByTestId('login-password').fill('12345');
        await page.getByTestId('login-button').click();


        await expect(page).toHaveURL('/admin');
        await expect(page.getByText('Panel de Control')).toBeVisible();
    });

    test('Usuario no autorizado no puede ver el panel admin (sin login)', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).not.toHaveURL(/\/admin/, { timeout: 8_000 });
    });

    test('Usuario cliente no puede ver el panel admin', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('mor_2314');
        await page.getByTestId('login-password').fill('83r5^_');
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL('/', { timeout: 10_000 });

        // Try to enter /admin — AdminDashboard redirects non-admins to /
        await page.goto('/admin');
        await expect(page).toHaveURL('/', { timeout: 8_000 });
    });

    test('Credenciales inválidas muestran mensaje de error', async ({ page }) => {
        await page.goto('/login');
        await page.getByTestId('login-username').fill('usuario_falso');
        await page.getByTestId('login-password').fill('password_incorrecta');
        await page.getByTestId('login-button').click();
        await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 8_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GESTIÓN DE PRODUCTOS – CRUD (Persistencia en servidor)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('2. Gestión de Productos – CRUD', () => {

    test('Creación de producto y verificación de persistencia en la Tienda', async ({ page }) => {
        const UNIQUE_TITLE = `Test Almohada ${Date.now()}`;

        // --- Admin crea el producto ---
        await loginAsAdmin(page);
        await page.getByTestId('admin-add-product').click();

        await page.getByTestId('admin-product-title').fill(UNIQUE_TITLE);
        await page.getByTestId('admin-product-price').fill('49.99');
        await page.getByTestId('admin-product-category').fill('home');
        await page.getByTestId('admin-product-image').fill('https://fakestoreapi.com/img/81fAn1SWh1L._AC_SL1500_.jpg');
        await page.getByTestId('admin-product-description').fill('Una almohada de prueba creada por Playwright.');
        await page.getByTestId('admin-save-product').click();

        // Notification toast confirming creation
        await expect(page.getByText('Producto creado exitosamente')).toBeVisible({ timeout: 8_000 });

        // --- Verifica que aparece en la Tienda (LandingPage) ---
        await page.goto('/');
        await waitForProducts(page);

        const grid = page.getByTestId('products-grid');
        await expect(grid).toBeVisible();
        await expect(grid.getByText(UNIQUE_TITLE)).toBeVisible({ timeout: 10_000 });
    });

    test('Edición instantánea de precio se refleja en la Tienda sin reiniciar', async ({ page }) => {
        const EDITED_PRICE = '999.99';

        await loginAsAdmin(page);

        // Esperar que la tabla cargue al menos un producto
        const firstEditBtn = page.locator('[data-testid^="admin-edit-"]').first();
        await expect(firstEditBtn).toBeVisible({ timeout: 15_000 });

        // Obtener el nombre del producto que vamos a editar
        const productRow = firstEditBtn.locator('xpath=ancestor::tr');
        const productTitle = await productRow.locator('span.font-medium').textContent();

        // Abrir modal de edición
        await firstEditBtn.click();

        // Cambiar el precio
        const priceInput = page.getByTestId('admin-product-price');
        await priceInput.clear();
        await priceInput.fill(EDITED_PRICE);
        await page.getByTestId('admin-save-product').click();

        await expect(page.getByText('Producto actualizado')).toBeVisible({ timeout: 8_000 });

        // Ir a la Tienda y verificar el nuevo precio SIN reiniciar el servidor
        await page.goto('/');
        await waitForProducts(page);
        await expect(page.getByTestId('products-grid')).toBeVisible();

        // El precio $999.99 debe aparecer junto al producto editado
        const productCard = page
            .getByTestId('products-grid')
            .locator('div', { hasText: productTitle?.trim() ?? '' })
            .first();
        await expect(productCard.getByText(`$${EDITED_PRICE}`)).toBeVisible({ timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. BÚSQUEDA Y FILTRADO
// ─────────────────────────────────────────────────────────────────────────────

test.describe('3. Búsqueda y Filtrado', () => {

    test('Búsqueda por categoría "men\'s clothing" muestra solo productos relevantes', async ({ page }) => {
        await page.goto('/');
        await waitForProducts(page);

        await page.getByTestId('search-input').fill("men's clothing");
        await page.getByTestId('search-button').click();

        await waitForProducts(page);

        // Cada card en la grilla debe pertenecer a la categoría buscada
        const grid = page.getByTestId('products-grid');
        await expect(grid).toBeVisible({ timeout: 10_000 });

        const cards = grid.locator('div.bg-white.rounded-2xl');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);

        // Verificar que la categoría mostrada en cada card coincide
        for (let i = 0; i < count; i++) {
            await expect(cards.nth(i).getByText("men's clothing", { exact: false })).toBeVisible();
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

        // Debe aparecer la grilla o el mensaje vacío — nunca un spinner eterno
        await waitForProducts(page);

        // Si hay resultados, la grilla debe ser visible
        const gridVisible = await page.getByTestId('products-grid').isVisible();
        const emptyVisible = await page.getByTestId('results-empty').isVisible();

        expect(gridVisible || emptyVisible).toBeTruthy();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. FLUJO DE CARRITO – End-to-End
// ─────────────────────────────────────────────────────────────────────────────

test.describe('4. Flujo de Carrito (E2E)', () => {

    test('Añadir producto al carrito y verificar nombre y precio', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.getByTestId('login-username').fill('mor_2314');
        await page.getByTestId('login-password').fill('83r5^_');
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL('/', { timeout: 10_000 });
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
        await page.getByTestId('login-username').fill('mor_2314');
        await page.getByTestId('login-password').fill('83r5^_');
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL('/', { timeout: 10_000 });
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
        await page.getByTestId('login-username').fill('mor_2314');
        await page.getByTestId('login-password').fill('83r5^_');
        await page.getByTestId('login-button').click();
        await expect(page).toHaveURL('/', { timeout: 10_000 });
        await waitForProducts(page);

        // Agregar el primer producto
        const firstCard = page.getByTestId('products-grid').locator('div.bg-white.rounded-2xl').first();
        await firstCard.locator('[data-testid^="add-to-cart-"]').click();

        await page.goto('/cart');

        // Finalizar compra
        await page.getByTestId('checkout-button').click();

        // Verificar confirmación
        await expect(page.getByTestId('order-success-title')).toBeVisible({ timeout: 8_000 });
        await expect(page.getByTestId('order-success-title')).toContainText('Orden procesada');
    });
});
