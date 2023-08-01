import { TileRegistry,TileInstance } from "../../../../../src/electron/lib/registries/TileRegistry";


describe("Test TileRegistry", () => {
  let tileRegistry : TileRegistry;
  let tileInstance : TileInstance;



    beforeEach(() => {
      tileRegistry = new TileRegistry();
      tileInstance = new TileInstance("plugin.name","plugin","description","icon");
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
