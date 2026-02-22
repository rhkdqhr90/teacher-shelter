import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Next.js Boilerplate/);
  });

  test('should display the hero section', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { name: /Next.js Production Boilerplate/i });
    await expect(heading).toBeVisible();
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.goto('/');

    // Check Get Started button
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await expect(getStartedButton).toBeVisible();
    await expect(getStartedButton).toHaveAttribute('href', '/dashboard');

    // Check Login button
    const loginButton = page.getByRole('link', { name: /login/i });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveAttribute('href', '/login');
  });

  test('should display tech stack cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Next.js 15')).toBeVisible();
    await expect(page.getByText('React 19')).toBeVisible();
    await expect(page.getByText('TypeScript 5')).toBeVisible();
    await expect(page.getByText('Tailwind CSS v4')).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');
    const featuresHeading = page.getByRole('heading', { name: /features/i });
    await expect(featuresHeading).toBeVisible();
  });
});
