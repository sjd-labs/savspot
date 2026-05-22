import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Legal Pages', () => {
  test('privacy policy page loads with heading', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // The H1 is unique; the long-form policy also has H2/H3 subheadings
    // that mention privacy (e.g. "Privacy questions"), so we scope to level 1.
    await expect(
      page.getByRole('heading', { level: 1, name: /privacy/i }),
    ).toBeVisible();
  });

  test('privacy page has content', async ({ page }) => {
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');

    // Page should have substantive content (not just a heading)
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Should contain privacy-related text
    const bodyText = await mainContent.textContent();
    expect(bodyText!.length).toBeGreaterThan(50);
  });

  test('terms of service page loads with heading', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    // The H1 is unique; the long-form ToS also has H2/H3 subheadings
    // that mention "Terms" (e.g. "Changes to these Terms"), so we scope
    // to level 1.
    await expect(
      page.getByRole('heading', { level: 1, name: /terms/i }),
    ).toBeVisible();
  });

  test('terms page has content', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');

    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    const bodyText = await mainContent.textContent();
    expect(bodyText!.length).toBeGreaterThan(50);
  });
});
