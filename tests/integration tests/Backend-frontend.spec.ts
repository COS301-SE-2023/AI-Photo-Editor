import { expect, test } from '@playwright/test'
import { ElectronApplication, Page, _electron as electron } from '@playwright/test'

let electronApp: ElectronApplication

test("launch app", async () => {

  electronApp = await electron.launch({
    args: ["./build/electron/index.js"],
  })
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    return app.isPackaged
  })

  expect(isPackaged).toBe(false)

  const window = await electronApp.firstWindow();

  console.log(window);

  console.log(await window.title());

  await electronApp.close();

})