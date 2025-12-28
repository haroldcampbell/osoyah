import { type Locator } from '@playwright/test';

type ClickPage = {
  mouse: { click: (x: number, y: number) => Promise<void> };
};

export async function clickCardBackground(page: ClickPage, card: Locator): Promise<void> {
  await card.scrollIntoViewIfNeeded();
  const meta = card.locator('.card-meta');
  if (await meta.count()) {
    await meta.first().click();
    return;
  }
  const box = await card.boundingBox();
  if (!box) {
    throw new Error('Card bounding box missing.');
  }
  await page.mouse.click(box.x + box.width / 2, box.y + box.height - 6);
}
