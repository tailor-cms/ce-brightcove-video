import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Display extends pom.DisplayPanel {
  readonly root: Locator;
  readonly player: Locator;

  constructor(page: Page) {
    super(page);
    this.root = this.editor.locator('.tce-brightcove-video-root');
    this.player = this.editor.locator('.brightcove-player');
  }
}
