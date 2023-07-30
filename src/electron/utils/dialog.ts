import { dialog } from "electron";
import type { SaveDialogOptions, OpenDialogOptions, BrowserWindow } from "electron";

export const showSaveDialog = async (
  options: SaveDialogOptions,
  browserWindow?: BrowserWindow
): Promise<string | undefined> => {
  if (browserWindow) {
    return (await dialog.showSaveDialog(browserWindow, options)).filePath;
  } else {
    return (await dialog.showSaveDialog(options)).filePath;
  }
};

export const showOpenDialog = async (
  options: OpenDialogOptions,
  browserWindow?: BrowserWindow
): Promise<string[] | undefined> => {
  if (browserWindow) {
    return (await dialog.showOpenDialog(browserWindow, options)).filePaths;
  } else {
    return (await dialog.showOpenDialog(options)).filePaths;
  }
};
