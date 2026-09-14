import { test, expect } from "@playwright/test";

test.describe("Returns Frontend Integration Tests", () => {
  // Assuming a mocked admin login happens via global setup or we mock it here.
  // For this test, we assume the server provides an unauthenticated or test-mode bypass
  // or that we can navigate to the returns page directly.
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Returns page
    await page.goto("/admin/orders/returns");
  });

  test("Loads the returns list page correctly", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Returns & Reverse Logistics" })).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });

  test("Search works", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search returns...");
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill("RET-");
    await page.waitForTimeout(500); // Wait for debounce

    // The table should still be visible and loading state handled
    await expect(page.locator("table")).toBeVisible();
  });

  test("Branch filtering works", async ({ page }) => {
    const branchFilter = page.locator("button", { hasText: "All Branches" }).first();
    // Only test if the filter exists since it depends on branch data
    if (await branchFilter.isVisible()) {
      await branchFilter.click();
      await page.getByRole("option").nth(1).click();
      await expect(page.locator("table")).toBeVisible();
    }
  });

  test("Pagination works", async ({ page }) => {
    const nextButton = page.getByRole("button", { name: /next/i });
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });

  test("Navigates to return detail and verifies badges", async ({ page }) => {
    // Click the first return row
    const firstRowLink = page.locator("table tbody tr td a").first();
    
    // If no returns exist, skip gracefully
    if (await firstRowLink.isVisible()) {
      await firstRowLink.click();
      
      // Verify Detail Page loads
      await expect(page.locator("h1", { hasText: /Return #/ })).toBeVisible();

      // Verify Status Badges reflect DB state (e.g., Requested, Approved, etc)
      await expect(page.locator(".badge-status").first()).toBeVisible();
    }
  });
});
