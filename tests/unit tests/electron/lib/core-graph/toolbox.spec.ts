import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUI, NodeUIParent } from "../../../../../src/electron/lib/core-graph/ToolboxRegistry";
import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import exp from "constants";



// jest.mock("fs", () => ({
//   readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
//   readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
//   existsSync: jest.fn(),
// }));

// jest.mock("../../../src/electron/lib/exposed-functions");

// const ipcMainEventMock: IpcMainEvent = {
//   sender: {
//     send: jest.fn((channel) => {
//       return channel;
//     }),
//   },
// } as any;

// jest.mock("electron", () => ({
//   ipcMain: {
//     on: jest.fn((event, callback) => {
//       if (event === "open-file-dialog") {
//         callback(ipcMainEventMock);
//       }
//       callback();
//       return event;
//     }),
//   },
//   dialog: {
//     showOpenDialog: jest.fn(() => {
//       return {
//         canceled: true,
//         filePaths: "hello",
//       };
//     }),
//     showSaveDialog: jest.fn(() => {
//       return {
//         canceled: true,
//         filePaths: "hello",
//       };
//     }),
//   },
//   ipcMainEvent: {
//     sender: {
//       send: jest.fn(),
//     },
//   },
// }));

// const mainWindow: BrowserWindow = {
//   webContents: {
//     send: jest.fn((channel) => {
//       return channel;
//     }),
//   },
// } as any;

describe("Test Nodes", () => {
  let node : NodeInstance;

  const inputs: InputAnchorInstance[] = [];
  const outputs: OutputAnchorInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
  });

  // test("Should attatch eventListeners", () => {
  //   expect(ipcMain.on).toBeCalledTimes(5);
  // });

  // Check editFileHandler
  test("getId should be defined", () => {
    expect(node.id).toBeDefined();
  });

  test("getSignature should return the correct signature", () => {
    expect(node.getSignature).toEqual("Jake.Shark");
  });

  test("getDescription should return the correct description", () => {
    expect(node.getDescription).toEqual("This is the Jake plugin");
  });

  test("getTitle should return the correct Title", () => {
    expect(node.getTitle).toEqual("The Jake plugin");
  });

  test("getIcon should return the correct icon", () => {
    expect(node.getIcon).toEqual("1149");
  });

  test("getInputAnchorInstances should return the correct inputs", () => {
    expect(node.getInputAnchorInstances).toEqual(inputs);
  });

  test("getOutputAnchorInstances should return the correct outputs", () => {
    expect(node.getOutputAnchorInstances).toEqual(outputs);
  });

  test("getFunction should return the correct function", () => {
    expect(node.getFunction()).toEqual("");
  });

  test("getUI should return ui", () => {
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    expect(nod.getUI).toEqual(null);
  });

  test("setUI should set ui", () => {
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    const nodeUI = new NodeUIParent("ui",null);
    nod.setUI(nodeUI);
    expect(nod.getUI?.label).toEqual("ui");
  });

  test("setTitle should set title", () => {
    node.setTitle("Rip Jake")
    expect(node.getTitle).toEqual("Rip Jake");
  });

  test("setDescription should set description", () => {
    node.setDescription("This is not the Jake Plugin")
    expect(node.getDescription).toEqual("This is not the Jake Plugin");
  });


  test("setIcon should set icon", () => {
    node.setIcon("1150")
    expect(node.getIcon).toEqual("1150");
  });

  test("setFunction should set function", () => {
    node.setFunction(() => {
      return "Shark2";
    });

    expect(node.getFunction()).toStrictEqual("Shark2");

  });


  // test("editFileHandler should send to correct channel", () => {
  //   handlers.selectedFilePath = "/test/path";
  //   handlers.editFileHandler();
  //   expect(mainWindow.webContents.send).toHaveBeenLastCalledWith(
  //     "chosenFile",
  //     "mocked_base64_string"
  //   );
  // });

  // test("editFileHandler should not send to channel", () => {
  //   handlers.selectedFilePath = "";
  //   handlers.editFileHandler();
  //   expect(mainWindow.webContents.send).toHaveBeenCalledTimes(1);
  // });

  // // Check chooseFileHandler
  // test("chooseFileHandler should attach to correct channel", () => {
  //   handlers.chooseFileHandler();
  //   expect(ipcMain.on).toBeCalledWith("chooseFile", expect.anything());
  // });

  // test("chooseFileHandler should send to correct channel", () => {
  //   handlers.selectedFilePath = "/test/path";
  //   handlers.chooseFileHandler();
  //   expect(mainWindow.webContents.send).toHaveBeenLastCalledWith(
  //     "chosenFile",
  //     "mocked_base64_string"
  //   );
  //   expect(mainWindow.webContents.send).toHaveBeenCalledTimes(2);
  // });

  // // Check clearFileHandler
  // test("clearFileHandler should attach to correct channel", () => {
  //   handlers.clearFileHandler();
  //   expect(ipcMain.on).toBeCalledWith("clear-file", expect.anything());
  // });

  // test("clearFileHandler should clear selectedPath", () => {
  //   handlers.selectedFilePath = "/test/path";
  //   handlers.clearFileHandler();
  //   expect(handlers.selectedFilePath).toBe("");
  // });

  // // Check openFileDialogHandler
  // test("openFileDialogHandler should attach to correct channel", () => {
  //   handlers.openFileDialogHandler();
  //   expect(ipcMain.on).lastReturnedWith("open-file-dialog");
  // });

  // // Check exportSavedEditedImageHandler

  // test("exportSaveEditedImageHandler should attach to correct channel", () => {
  //   handlers.exportSaveEditedImageHandler();
  //   expect(ipcMain.on).lastReturnedWith("export-image");
  // });
});
