// @ts-check
import { chromium } from 'playwright';
import assert from 'node:assert';
import path from 'node:path';

(async () => {
  const pathToExtension = path.dirname(new URL(import.meta.url).pathname);
  const context = await chromium.launchPersistentContext('', {
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
    devtools: true,
  });
  const devtools = context.pages().find(page => page.url().includes('devtools://devtools/bundled/devtools_app.html'))
  assert(devtools);
  const page = context.pages().find(page => page.url().includes('about:blank'))
  assert(page);

  // open DevTools in new tab (without that clicking on the Demo Panel tab is hard)
  await devtools.getByRole('button', { name: 'Customize and control DevTools' }).click();
  await devtools.getByRole('button', { name: 'Undock into separate window' }).click();
  await devtools.getByRole('tab', { name: 'DemoPanel' }).click();
  // here could you potentially also wait for the extension ID to be present in the URL
  const devtoolsPanel = devtools.frameLocator('iframe[src*="panel.html"]');

  await page.goto('https://example.com');
  await page.screenshot({ path: 'before.png' });
  await devtoolsPanel.getByText('Insert button to send a message from page to devtools').click();
  await page.screenshot({ path: 'after.png' });
  await page.getByRole('button', { name: 'Send message to DevTools' }).click();
  await devtoolsPanel.locator('body').screenshot({ path: 'after-panel.png' });
  await context.close();
})()