import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-brightcove-edit';
const CONFIG = {
  accountId: 'acc-123',
  playerId: 'player-abc',
  videoId: 'video-xyz',
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('When config is not set', () => {
  test('Shows placeholder', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.placeholder).toBeVisible();
    await expect(edit.player).not.toBeVisible();
  });

  test('Form inputs are enabled for initial configuration', async ({
    page,
  }) => {
    const edit = new Edit(page);
    await edit.focus();
    await expect(edit.accountIdInput).toBeEnabled();
    await expect(edit.playerIdInput).toBeEnabled();
    await expect(edit.videoIdInput).toBeEnabled();
  });

  test('Saving valid config configures the player', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.accountIdInput.fill(CONFIG.accountId);
    await edit.playerIdInput.fill(CONFIG.playerId);
    await edit.videoIdInput.fill(CONFIG.videoId);
    await edit.saveBtn.click();
    await expect(edit.player).toBeVisible();
    await expect(edit.placeholder).not.toBeVisible();
  });

  test('Requires all three ids', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.accountIdInput.fill(CONFIG.accountId);
    await edit.saveBtn.click();
    await expect(
      edit.topToolbar.getByText('The field is required.').first(),
    ).toBeVisible();
    await expect(edit.player).not.toBeVisible();
  });
});

test.describe('When config is set', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, CONFIG);
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Shows player', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.player).toBeVisible();
    await expect(edit.placeholder).not.toBeVisible();
  });

  test('Form inputs are disabled until Edit is clicked', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await expect(edit.accountIdInput).toBeDisabled();
    await edit.editBtn.click();
    await expect(edit.accountIdInput).toBeEnabled();
    await expect(edit.playerIdInput).toBeEnabled();
    await expect(edit.videoIdInput).toBeEnabled();
  });

  test('Cancel reverts pending edits', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.editBtn.click();
    await edit.videoIdInput.fill('changed-video');
    await edit.cancelBtn.click();
    await expect(edit.videoIdInput).toHaveValue(CONFIG.videoId);
  });

  test('Shows error state when Brightcove script fails to load', async ({
    page,
  }) => {
    const edit = new Edit(page);
    await expect(edit.errorMessage).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Readonly mode', () => {
  test('Hides config prompt when empty', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await edit.focus();
    await expect(edit.placeholder).toBeVisible();
    await expect(
      edit.el.getByText('Use toolbar to set the video parameters'),
    ).not.toBeVisible();
  });

  test('Keeps player visible when configured', async ({ page }) => {
    await elementClient.update(ELEMENT_ID, CONFIG);
    await page.reload({ waitUntil: 'networkidle' });
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.player).toBeVisible();
  });
});
