import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should load the login page successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check for the main heading
    await expect(page.locator('h1')).toContainText('Welcome back');
    
    // Check for email and password fields
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should load the registration page successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Check for the main heading
    await expect(page.locator('h1')).toContainText('Join MLA Academy');
    
    // Check for full name, email, institution, and password fields
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="institution"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });
});
