import { TileRegistry,TileInstance } from "../../../../../src/electron/lib/registries/TileRegistry";
import { Blix } from "../../../../../src/electron/lib/Blix";


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
        expect(tileRegistry.getRegistry()[tileInstance.id].id).toBe("plugin.name");
    });
});
