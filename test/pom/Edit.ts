import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export interface BrightcoveIds {
  accountId: string;
  playerId: string;
  videoId: string;
}

export class IdsDialog extends pom.TailorDialog {
  readonly accountIdInput: Locator;
  readonly playerIdInput: Locator;
  readonly videoIdInput: Locator;
  readonly submitBtn: Locator;
  readonly saveBtn: Locator;

  constructor(edit: pom.EditPanel, title: string) {
    super(edit.el, title);
    this.accountIdInput = this.body.getByLabel('Account ID');
    this.playerIdInput = this.body.getByLabel('Player ID');
    this.videoIdInput = this.body.getByLabel('Video ID');
    this.submitBtn = this.action('Submit');
    this.saveBtn = this.action('Save');
  }

  async fill({ accountId, playerId, videoId }: BrightcoveIds) {
    await this.accountIdInput.fill(accountId);
    await this.playerIdInput.fill(playerId);
    await this.videoIdInput.fill(videoId);
  }
}

export class Edit extends pom.EditPanel {
  readonly root: Locator;
  readonly placeholder: Locator;
  readonly emptyState: Locator;
  readonly enterIdsBtn: Locator;
  readonly player: Locator;
  readonly errorMessage: Locator;
  readonly actionsRow: Locator;
  readonly changeIdsBtn: Locator;
  readonly removeBtn: Locator;
  readonly addDialog: IdsDialog;
  readonly changeDialog: IdsDialog;

  constructor(page: Page) {
    super(page);
    this.root = this.editor.locator('.tce-video');
    this.placeholder = this.editor.getByText('Brightcove Video component');
    this.emptyState = this.root.getByText('Add a Brightcove video');
    this.enterIdsBtn = this.root.getByRole('button', { name: 'Enter IDs' });
    this.player = this.editor.locator('.brightcove-player');
    this.errorMessage = this.player.getByText("This video couldn't be loaded");
    this.actionsRow = this.root.locator('.position-sticky');
    this.changeIdsBtn = this.actionsRow.getByRole('button', {
      name: 'Change IDs',
    });
    this.removeBtn = this.actionsRow.getByRole('button', { name: 'Remove' });
    this.addDialog = new IdsDialog(this, 'Add a Brightcove video');
    this.changeDialog = new IdsDialog(this, 'Change IDs');
  }

  async openAddDialog() {
    await this.enterIdsBtn.click();
    await this.addDialog.waitForOpen();
  }

  async openChangeDialog() {
    await this.focus();
    await this.changeIdsBtn.click();
    await this.changeDialog.waitForOpen();
  }
}
