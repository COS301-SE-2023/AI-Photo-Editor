
import { Typeclass, TypeclassRegistry } from "../../../../../src/electron/lib/registries/TypeclassRegistry";
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MediaDisplayType } from "../../../../../src/shared/types";

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

jest.mock('ws', () => {
  return {
    WebSocketServer:  jest.fn().mockImplementation(() => {
      return {
        on: jest.fn()
      }
    }
    )
  }
});

jest.mock('../../../../../src/electron/lib/plugins/PluginManager')

describe("Test TypeClassRegistry", () => {
    
    let typeclassRegistry : TypeclassRegistry;
    let blix : Blix;

    beforeEach(() => {
        blix = new Blix();
        typeclassRegistry = new TypeclassRegistry(blix);
    });


    test("Test constructor", () => {
        expect(typeclassRegistry).toBeDefined();
    });

    test("Test addInstance and getRegistry", () => {
        const invalidType = undefined as unknown as Typeclass;
        expect(typeclassRegistry.addInstance(invalidType)).toReturn;
        expect(typeclassRegistry.getTypeclasses().length).toBe(0);

        expect(typeclassRegistry.addInstance({id: "number", description: "test",subtypes: [], mediaDisplayConfig: (data: string) => ({
            displayType: MediaDisplayType.TextBox,
            props: {
              content: data,
            },
            contentProp: "content",
          }),
        })).toReturn;
        expect(typeclassRegistry.getTypeclasses().length).toBe(0);


        expect(typeclassRegistry.getRegistry()).toEqual(typeclassRegistry["typeclasses"])
    });

    test("Test converters functionality", () => {
        typeclassRegistry.addConverter("number", "string", (data: number) => {
            return data.toString();
        });

        expect(typeclassRegistry.resolveConversion("number", "string")).toBeDefined(); // else returns null
    });

});