import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";
import { join } from "path";
import { waitForDebugger } from "inspector";
import exp from "constants";


test('E2E testing blix', async () => {
const electronApp = await electron.launch({ args: ['.']})
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged
  })
  electronApp.on('window', async (page) => {
    const filename = page.url()?.split('/').pop()
    console.log(`Window opened: ${filename}`)

    // capture errors
    page.on('pageerror', (error) => {
      console.error(error)
    })
    // capture console messages
    page.on('console', (msg) => {
      console.log(msg.text())
    })
  })

  // expect(isPackaged).toBe(false);

  // Wait for the first BrowserWindow to open
  // and return its Page object
  const window = await electronApp.firstWindow();

  // await window.keyboard.press('Escape', {delay: 4000});
  await window.locator('.darkenBackground').click({delay: 500, position: {x: 100, y: 100}});
  // await window.locator('svg').first().click();

  expect((await window.getByTitle('Untitled').allInnerTexts()).at(0)).toBe("Untitled-1");

  const graph = window.locator('section').first();
  await graph.click({button: 'right'});

  // Check plugin menu
  const plugin = window.getByText('blix');
  expect(((await plugin.allInnerTexts()).at(2))).toBe("Blix");
  expect((await window.getByText('Blink').allInnerTexts()).at(0)).toBe("Blink");
  expect((await window.getByText('GLFX').allInnerTexts()).at(0)).toBe("GLFX");
  expect((await window.getByText('Input').allInnerTexts()).at(0)).toBe("Input");
  expect((await window.getByText('Logic').allInnerTexts()).at(0)).toBe("Logic");
  expect((await window.getByText('Math').allInnerTexts()).at(0)).toBe("Math");

  // Check add node to graph
  await (await plugin.all()).at(2)?.click();
  await (await window.getByText('Output').all()).at(2)?.click();
  await window.getByText('Output').first().click({button: 'right'});

  expect((await window.locator('Output').allInnerTexts()).at(0)).toBe(undefined);

  // Check add graph
  await window.getByText('Graph').click();
  expect((await window.getByText('Graph', { exact: true }).allInnerTexts()).length).toBe(2);
  await window.getByTitle('Add Graph').getByRole('img').click();
  expect((await window.getByText('Graph', { exact: true }).allInnerTexts()).length).toBe(2);

  // Connect edges
  await graph.click({button: 'right', position: {x: 100, y: 100}});
  await (await plugin.all()).at(2)?.click();
  await window.getByText('Output').click();
  await graph.click({button: 'right', position: {x: 300, y: 600}, delay: 200});
  await (await window.getByText('Input').all()).at(1)?.click({delay: 200});
  await window.getByText('Number').click();

  await window.locator('css=div.svelvet-anchor').nth(1).dragTo(window.locator('css=div.svelvet-anchor').first());

  expect((await window.locator('css=div.output.normal').allInnerTexts()).at(0)).toBe("0");

  // close app
  await electronApp.close()
})