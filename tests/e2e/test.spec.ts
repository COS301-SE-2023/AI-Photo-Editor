import { _electron as electron } from "playwright";
import { test, expect } from "@playwright/test";
import { join } from "path";

test('example test', async () => {
  // const electronApp = await electron.launch({ args: [join(__dirname, "..", "..", "src", "index.ts")] })
  const electronApp = await electron.launch({ args: ['.'],
  // executablePath: '/home/klairgo/Documents/Documents/University of Pretoria/Year 3/Semester 1/COS 301/Capstone Project/Code/AI-Photo-Editor/dist/linux-unpacked/blix'
})
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
  const html = await window.innerText('div');
  await window.getByText('Item').click({position: { x: 0, y: 0 } });
  await window.screenshot({ path: 'intro.png' })

  // close app
  await electronApp.close()
})