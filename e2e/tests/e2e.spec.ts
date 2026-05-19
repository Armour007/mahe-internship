import { test, expect } from '@playwright/test';

test('full agency flow with complex brief (mock or real providers)', async ({ page }) => {
  // Inject provider keys from env if provided (Playwright reads process.env)
  const openKey = process.env.OPENROUTER_KEY || '';
  const bytezKey = process.env.BYTEZ_KEY || '';

  if (openKey || bytezKey) {
    const cfg = {
      apiKey: '',
      model: 'gpt-4o-mini',
      openRouterConfig: { apiKey: openKey, baseUrl: 'https://api.openrouter.ai' },
      bytezConfig: { apiKey: bytezKey, baseUrl: 'https://api.bytez.ai' },
      providerPriority: openKey ? ['openrouter','bytez','local','gemini'] : ['bytez','local','gemini'],
      useLocalModel: false,
      economyMode: true,
      maxCompletionWords: 400
    };
    await page.addInitScript((cfg) => {
      localStorage.setItem('byok-config', JSON.stringify(cfg));
      localStorage.setItem('byok-wizard-seen', '1');
    }, cfg);
  }

  await page.goto('/');

  // Wait for header and ensure provider badge exists
  await page.waitForSelector('header');
  const badge = await page.locator('button:has-text("Provider:")').first();
  await expect(badge).toBeVisible();

  // For each sample brief button, inject and send, then expect a response in debug log
  const sampleButtons = await page.locator('button', { hasText: 'Studio' }).first();

  // Type a complex brief and send
  const brief = 'Comprehensive brand refresh: 3 logo concepts, hero copy, 6-email launch sequence, success metrics, 2-week milestone plan.';
  await page.fill('textarea[placeholder="Type project brief or paste notes..."]', brief);
  await page.click('button:has-text("Send")');

  // Wait for a response log entry to appear
  await page.waitForSelector('button:has-text("Total Est.")');
  // Basic assertion: modal or final output eventually opens or debug logs populated
  const logs = await page.locator('div').filter({ hasText: 'Project brief' }).first().count();
  // We mostly assert that the app did not crash and UI remains responsive
  expect(await page.locator('header').isVisible()).toBe(true);
});
