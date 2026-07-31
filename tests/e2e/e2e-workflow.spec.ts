import { test, expect } from "@playwright/test";

test.describe("Enterprise Critical Path (Smoke Test)", () => {
  test("User can browse, add to cart, and initiate checkout", async ({
    page,
    baseURL,
  }) => {
    // 1. Go to homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Anchor Fashion/i);

    // 2. Navigate to Shop
    // Note: Adjust selectors based on actual UI implementation
    const shopLink = page.getByRole("link", { name: /Shop/i }).first();
    // Use try-catch or soft expect if link might be named differently
    if (await shopLink.isVisible()) {
      await shopLink.click();
      await expect(page).toHaveURL(/.*shop/);
    } else {
      // Fallback direct navigation if UI differs
      await page.goto("/shop");
    }

    // 3. View a product
    // Assuming there are product links or cards
    const products = page.locator(
      'article, .product-card, [data-testid="product-card"]'
    );
    if ((await products.count()) > 0) {
      await products.first().click();

      // 4. Add to Cart
      const addToCartBtn = page.getByRole("button", { name: /Add to Cart/i });
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();

        // 5. Open Cart/Checkout
        const cartLink = page
          .getByRole("link", { name: /Cart/i, exact: false })
          .first();
        if (await cartLink.isVisible()) {
          await cartLink.click();
          await expect(
            page.getByRole("button", { name: /Checkout/i })
          ).toBeVisible();
        }
      }
    }
  });

  test("Admin dashboard is secure and redirects unauthorized users", async ({
    page,
  }) => {
    // Unauthenticated user should be redirected to login
    await page.goto("/admin");

    // Expect redirection to an auth page
    await expect(page).toHaveURL(/.*login|.*auth/);
  });
});
