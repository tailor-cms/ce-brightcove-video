import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-brightcove-edit';
const CONFIG = {
  accountId: 'acc-123',
  playerId: 'player-abc',
  videoId: 'video-xyz',
};
const UPDATED_CONFIG = {
  accountId: 'acc-456',
  playerId: 'player-def',
  videoId: 'video-uvw',
};

test.beforeEach(async ({ page }) => {
  // Keep tests independent of the external Brightcove CDN; a failed script
  // load renders the player's error state.
  await page.route('**/players.brightcove.net/**', (route) => route.abort());
  await elementClient.reset(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('When config is not set', () => {
  test('Shows the empty state panel', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.emptyState).toBeVisible();
    await expect(edit.enterIdsBtn).toBeVisible();
    await expect(edit.placeholder).not.toBeVisible();
    await expect(edit.player).not.toBeVisible();
  });

  test('Enter IDs opens the dialog with empty fields', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    const dialog = edit.addDialog;
    await expect(dialog.accountIdInput).toHaveValue('');
    await expect(dialog.playerIdInput).toHaveValue('');
    await expect(dialog.videoIdInput).toHaveValue('');
    await expect(dialog.submitBtn).toBeVisible();
    await expect(dialog.saveBtn).not.toBeVisible();
  });

  test('Requires all three ids', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    const dialog = edit.addDialog;
    await dialog.submitBtn.click();
    await expect(dialog.body.getByText('Enter the account ID.')).toBeVisible();
    await expect(dialog.body.getByText('Enter the player ID.')).toBeVisible();
    await expect(dialog.body.getByText('Enter the video ID.')).toBeVisible();
    await dialog.accountIdInput.fill(CONFIG.accountId);
    await dialog.submitBtn.click();
    await expect(dialog.body.getByText('Enter the account ID.')).toHaveCount(0);
    await expect(dialog.body.getByText('Enter the video ID.')).toBeVisible();
    await expect(dialog.el).toBeVisible();
    await expect(edit.player).not.toBeVisible();
  });

  test('Rejects whitespace-only ids', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    const dialog = edit.addDialog;
    await dialog.fill({ ...CONFIG, videoId: '   ' });
    await dialog.submitBtn.click();
    await expect(dialog.body.getByText('Enter the video ID.')).toBeVisible();
    await expect(dialog.el).toBeVisible();
  });

  test('Submitting valid ids configures the player', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    await edit.addDialog.fill(CONFIG);
    await edit.addDialog.submitBtn.click();
    await edit.addDialog.waitForClose();
    await expect(edit.player).toBeVisible();
    await expect(edit.emptyState).not.toBeVisible();
    await page.reload();
    await expect(edit.player).toBeVisible();
    await expect(edit.emptyState).not.toBeVisible();
  });

  test('Trims ids on submit', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    await edit.addDialog.fill({ ...CONFIG, videoId: `  ${CONFIG.videoId}  ` });
    await edit.addDialog.submitBtn.click();
    await edit.addDialog.waitForClose();
    await edit.focus();
    await expect(edit.actionsRow).toContainText(`Video ${CONFIG.videoId}`);
  });

  test('Cancel leaves the element unconfigured', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openAddDialog();
    await edit.addDialog.fill(CONFIG);
    await edit.addDialog.cancel();
    await expect(edit.emptyState).toBeVisible();
    await expect(edit.player).not.toBeVisible();
    // Reopening starts from the stored (empty) values
    await edit.openAddDialog();
    await expect(edit.addDialog.accountIdInput).toHaveValue('');
  });
});

test.describe('When config is set', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, CONFIG);
    await page.reload();
  });

  test('Shows player', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.player).toBeVisible();
    await expect(edit.emptyState).not.toBeVisible();
    await expect(edit.placeholder).not.toBeVisible();
  });

  test('Shows actions only while focused', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.player).toBeVisible();
    await expect(edit.changeIdsBtn).not.toBeVisible();
    await expect(edit.removeBtn).not.toBeVisible();
    await edit.focus();
    await expect(edit.actionsRow).toContainText(`Video ${CONFIG.videoId}`);
    await expect(edit.changeIdsBtn).toBeVisible();
    await expect(edit.removeBtn).toBeVisible();
  });

  test('Change IDs pre-fills the dialog and saves', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openChangeDialog();
    const dialog = edit.changeDialog;
    await expect(dialog.accountIdInput).toHaveValue(CONFIG.accountId);
    await expect(dialog.playerIdInput).toHaveValue(CONFIG.playerId);
    await expect(dialog.videoIdInput).toHaveValue(CONFIG.videoId);
    await expect(dialog.saveBtn).toBeVisible();
    await expect(dialog.submitBtn).not.toBeVisible();
    await dialog.fill(UPDATED_CONFIG);
    await dialog.saveBtn.click();
    await dialog.waitForClose();
    await expect(edit.actionsRow).toContainText(
      `Video ${UPDATED_CONFIG.videoId}`,
    );
    await page.reload();
    await edit.openChangeDialog();
    await expect(dialog.accountIdInput).toHaveValue(UPDATED_CONFIG.accountId);
    await expect(dialog.playerIdInput).toHaveValue(UPDATED_CONFIG.playerId);
    await expect(dialog.videoIdInput).toHaveValue(UPDATED_CONFIG.videoId);
  });

  test('Cancel discards pending changes', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openChangeDialog();
    const dialog = edit.changeDialog;
    await dialog.videoIdInput.fill('changed-video');
    await dialog.cancel();
    await expect(edit.actionsRow).toContainText(`Video ${CONFIG.videoId}`);
    await edit.changeIdsBtn.click();
    await dialog.waitForOpen();
    await expect(dialog.videoIdInput).toHaveValue(CONFIG.videoId);
  });

  test('Change IDs requires all three ids', async ({ page }) => {
    const edit = new Edit(page);
    await edit.openChangeDialog();
    const dialog = edit.changeDialog;
    await dialog.playerIdInput.fill('');
    await dialog.saveBtn.click();
    await expect(dialog.body.getByText('Enter the player ID.')).toBeVisible();
    await expect(dialog.el).toBeVisible();
  });

  test('Remove returns to the empty state', async ({ page }) => {
    const edit = new Edit(page);
    await edit.focus();
    await edit.removeBtn.click();
    await expect(edit.emptyState).toBeVisible();
    await expect(edit.player).not.toBeVisible();
    await page.reload();
    await expect(edit.emptyState).toBeVisible();
    await edit.openAddDialog();
    await expect(edit.addDialog.accountIdInput).toHaveValue('');
  });

  test('Shows error state when Brightcove script fails to load', async ({
    page,
  }) => {
    const edit = new Edit(page);
    await expect(edit.errorMessage).toBeVisible();
  });
});

test.describe('Readonly mode', () => {
  test('Shows placeholder instead of the empty state', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.placeholder).toBeVisible();
    await expect(edit.emptyState).not.toBeVisible();
    await expect(edit.enterIdsBtn).not.toBeVisible();
  });

  test('Keeps player visible and hides actions when configured', async ({
    page,
  }) => {
    await elementClient.update(ELEMENT_ID, CONFIG);
    await page.reload();
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.player).toBeVisible();
    await edit.focus();
    await expect(edit.changeIdsBtn).not.toBeVisible();
    await expect(edit.removeBtn).not.toBeVisible();
  });
});
