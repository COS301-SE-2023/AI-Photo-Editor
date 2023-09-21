import { TileRegistry,TileInstance } from "../../../../../src/electron/lib/registries/TileRegistry";
import { Blix } from "../../../../../src/electron/lib/Blix";

jest.mock("electron", () => ({
  app: {
    getPath: jest.fn((path) => {
      return "test/electron";
    }),
    getName: jest.fn(() => {
      return "TestElectron";
    }),
    getVersion: jest.fn(() => {
      return "v1.1.1";
    }),
    getAppPath: jest.fn(() => {
      return "test/electron";
    })
  },
  ipcMain: {
    on: jest.fn()
  }
}));


describe("Test TileInstance", () => {
  describe("Test TileRegistry", () => {
    let tileRegistry : TileRegistry;
    let tileInstance : TileInstance;
    let blix : Blix;
  
  
  
      beforeEach(() => {
        blix = new Blix();
        tileRegistry = new TileRegistry(blix);
        tileInstance = new TileInstance("plugin.name","plugin","Hello","description","icon",{});
      });
  
      test("Test constructor", () => {
          expect(tileRegistry).toBeDefined();
          expect(tileInstance).toBeDefined();
      })
  
      test("Test addInstance and getRegistry", () => {
          tileRegistry.addInstance(tileInstance);
          expect(tileRegistry.getRegistry()[tileInstance.id].id).toBe("plugin.plugin.name");
      });
  });

  // describe("Test TileRegistry", () => {
  //   let tileRegistry : TileRegistry;
  //   let tileInstance : TileInstance;
  //   let blix : Blix;
  
  
  
  //     beforeEach(() => {
  //       blix = new Blix();
  //       tileRegistry = new TileRegistry(blix);
  //       tileInstance = new TileInstance("plugin.name","plugin","Hello","description","icon",{});
  //     });
  
  //     test("Test constructor", () => {
  //         expect(tileRegistry).toBeDefined();
  //         expect(tileInstance).toBeDefined();
  //     })
  
  //     test("Test addInstance and getRegistry", () => {
  //         tileRegistry.addInstance(tileInstance);
  //         expect(tileRegistry.getRegistry()[tileInstance.id].id).toBe("plugin.name");
  //     });
  // });
});


