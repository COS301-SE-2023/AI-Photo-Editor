import expect from "expect";
import Handlers from "../../../src/electron/lib/handlers";
import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  existsSync: jest.fn(),
}));

jest.mock("../../../src/electron/lib/exposed-functions");

const ipcMainEventMock: IpcMainEvent = {
  sender: {
    send: jest.fn((channel) => {
      return channel;
    }),
  },
} as any;

jest.mock("electron", () => ({
  ipcMain: {
    on: jest.fn((event, callback) => {
      if (event === "open-file-dialog") {
        callback(ipcMainEventMock);
      }
      callback();
      return event;
    }),
  },
  dialog: {
    showOpenDialog: jest.fn(() => {
      return {
        canceled: true,
        filePaths: "hello",
      };
    }),
    showSaveDialog: jest.fn(() => {
      return {
        canceled: true,
        filePaths: "hello",
      };
    }),
  },
  ipcMainEvent: {
    sender: {
      send: jest.fn(),
    },
  },
}));

const mainWindow: BrowserWindow = {
  webContents: {
    send: jest.fn((channel) => {
      return channel;
    }),
  },
} as any;

describe("Test Handlers", () => {
  let handlers: Handlers;

  beforeEach(() => {
    jest.clearAllMocks();
    handlers = new Handlers(mainWindow);
  });

  test("Should attatch eventListeners", () => {
    expect(ipcMain.on).toBeCalledTimes(5);
  });

  // Check editFileHandler
  test("editFileHandler should attach to correct channel", () => {
    handlers.editFileHandler();
    expect(ipcMain.on).toBeCalledWith("editPhoto", expect.anything());
  });

  test("editFileHandler should send to correct channel", () => {
    handlers.selectedFilePath = "/test/path";
    handlers.editFileHandler();
    expect(mainWindow.webContents.send).toHaveBeenLastCalledWith(
      "chosenFile",
      "mocked_base64_string"
    );
  });

  test("editFileHandler should not send to channel", () => {
    handlers.selectedFilePath = "";
    handlers.editFileHandler();
    expect(mainWindow.webContents.send).toHaveBeenCalledTimes(1);
  });

  // Check chooseFileHandler
  test("chooseFileHandler should attach to correct channel", () => {
    handlers.chooseFileHandler();
    expect(ipcMain.on).toBeCalledWith("chooseFile", expect.anything());
  });

  test("chooseFileHandler should send to correct channel", () => {
    handlers.selectedFilePath = "/test/path";
    handlers.chooseFileHandler();
    expect(mainWindow.webContents.send).toHaveBeenLastCalledWith(
      "chosenFile",
      "mocked_base64_string"
    );
    expect(mainWindow.webContents.send).toHaveBeenCalledTimes(2);
  });

  // Check clearFileHandler
  test("clearFileHandler should attach to correct channel", () => {
    handlers.clearFileHandler();
    expect(ipcMain.on).toBeCalledWith("clear-file", expect.anything());
  });

  test("clearFileHandler should clear selectedPath", () => {
    handlers.selectedFilePath = "/test/path";
    handlers.clearFileHandler();
    expect(handlers.selectedFilePath).toBe("");
  });

  // Check openFileDialogHandler
  test("openFileDialogHandler should attach to correct channel", () => {
    handlers.openFileDialogHandler();
    expect(ipcMain.on).lastReturnedWith("open-file-dialog");
  });

  // Check exportSavedEditedImageHandler

  test("exportSaveEditedImageHandler should attach to correct channel", () => {
    handlers.exportSaveEditedImageHandler();
    expect(ipcMain.on).lastReturnedWith("export-image");
  });
});
