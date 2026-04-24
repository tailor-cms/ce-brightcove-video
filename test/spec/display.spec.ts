import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Display } from '../pom';

const ELEMENT_ID = 'test-brightcove-display';
const CONFIG = {
  accountId: 'acc-123',
  playerId: 'player-abc',
  videoId: 'video-xyz',
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await elementClient.reset(ELEMENT_ID);
  await elementClient.resetState(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Empty state', () => {
  test('Renders placeholder when config is missing', async ({ page }) => {
    const display = new Display(page);
    await expect(display.placeholder).toBeVisible();
    await expect(display.player).not.toBeVisible();
  });
});

test.describe('Configured state', () => {
  test('Renders the Brightcove player', async ({ page }) => {
    await elementClient.update(ELEMENT_ID, CONFIG);
    await page.reload({ waitUntil: 'networkidle' });
    const display = new Display(page);
    await expect(display.player).toBeVisible();
  });
});
