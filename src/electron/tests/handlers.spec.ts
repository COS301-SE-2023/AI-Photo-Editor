import  Handlers  from "../lib/handlers"
import { ipcMain, BrowserWindow } from "electron";


jest.mock('electron', () => ({
    ipcMain: {
        on: jest.fn((channel: string, func: any) => channel)
    },
    BrowserWindow: jest.fn().mockImplementation(() => {
    }),
}));


describe('Test Handlers', () => {
    let handlers: Handlers;
    let browser: BrowserWindow;

    beforeAll(async () => {
        browser = new BrowserWindow();
        handlers = new Handlers(browser);
    })

    test("Should attatch eventListeners", () => {
        expect(ipcMain.on).toBeCalledTimes(4);
    })

    test("Should send response to frontend", () => {
        expect(BrowserWindow).toBeCalledTimes(1);
    })

    test("chooseFileHandler should attatch to correct channel", () => {
        expect(ipcMain.on).lastReturnedWith("export-image")
    })

    test("editFileHandler should attatch to correct channel", () => {
        handlers.editFileHandler();
        expect(ipcMain.on).lastReturnedWith("editPhoto");
    })

    test("editFileHandler should attatch to correct channel", () => {
        handlers.chooseFileHandler();
        expect(ipcMain.on).lastReturnedWith("chooseFile");
    })

    test("editFileHandler should attatch to correct channel", () => {
        handlers.openFileDialogHandler();
        expect(ipcMain.on).lastReturnedWith("open-file-dialog");
    })

  });