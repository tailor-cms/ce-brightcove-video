import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly placeholder: Locator;
  readonly player: Locator;
  readonly errorMessage: Locator;
  readonly accountIdInput: Locator;
  readonly playerIdInput: Locator;
  readonly videoIdInput: Locator;
  readonly editBtn: Locator;
  readonly saveBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.placeholder = this.editor.getByText('Brightcove Video component');
    this.player = this.editor.locator('.brightcove-player');
    this.errorMessage = this.player.getByText('Error loading media!');
    this.accountIdInput = this.topToolbar.getByLabel('Account Id');
    this.playerIdInput = this.topToolbar.getByLabel('Player Id');
    this.videoIdInput = this.topToolbar.getByLabel('Video Id');
    this.editBtn = this.topToolbar.getByRole('button', { name: 'Edit' });
    this.saveBtn = this.topToolbar.getByRole('button', { name: 'Save' });
    this.cancelBtn = this.topToolbar.getByRole('button', { name: 'Cancel' });
  }

  async focus() {
    await this.editor.click({ position: { x: 0, y: 0 } });
  }
}
