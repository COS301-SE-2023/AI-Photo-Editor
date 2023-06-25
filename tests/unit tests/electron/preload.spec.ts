import { api } from "../../../src/electron/preload";
import { ipcRenderer } from "electron";
import { IEditPhoto } from "../../../src/electron/lib/interfaces";

jest.mock("electron", () => ({
  ipcMain: {
    on: jest.fn((event) => {
      return event;
    }),
  },
  ipcRenderer: {
    send: jest.fn((event, data: IEditPhoto) => {
      if (data) {
        expect(data.brightness).toBe(0);
        expect(data.saturation).toBe(0);
        expect(data.hue).toBe(0);
        expect(data.rotate).toBe(0);
        expect(data.shadow).toBe(0);
      }
    }),
    on: jest.fn((event, callback) => {
      expect(callback()).toBe("correct");
    }),
  },
  contextBridge: {
    exposeInMainWorld: jest.fn(),
  },
}));

let data: IEditPhoto;

describe("Preload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    data = {
      brightness: 0,
      saturation: 0,
      hue: 0,
      rotate: 0,
      shadow: 0,
    };
  });

  // Testing send
  test("Should send to channel editPhoto", () => {
    api.send("editPhoto", data);
    expect(ipcRenderer.send).toBeCalledWith("editPhoto", data);
  });

  test("Should not send to channel random", () => {
    api.send("random", data);
    expect(ipcRenderer.send).toBeCalledTimes(0);
  });

  test("Should send wrong data to channel export-image", () => {
    data = {
      brightness: 0,
      saturation: 1,
      hue: 0,
      rotate: 0,
      shadow: 0,
    };
    try {
      api.send("export-image", data);
    } catch {
      expect(ipcRenderer.send).toBeCalledWith("export-image", data);
    }
  });

  // Testing receive
  test("Should listen on channel editPhoto", () => {
    api.receive("editPhoto", () => {
      return "correct";
    });
    expect(ipcRenderer.on).toHaveBeenCalledWith("editPhoto", expect.anything());
  });

  test("Should not listen on channel random", () => {
    api.receive("random", () => {
      return "correct";
    });
    expect(ipcRenderer.on).toHaveBeenCalledTimes(0);
  });

  test("Should send wrong function to channel export-image", () => {
    try {
      api.receive("export-image", () => {
        return "wrong";
      });
    } catch {
      expect(ipcRenderer.on).toBeCalledWith("export-image", expect.anything());
    }
  });
});
