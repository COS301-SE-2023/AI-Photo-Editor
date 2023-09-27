
import { Typeclass, TypeclassRegistry } from "../../../../../src/electron/lib/registries/TypeclassRegistry";
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MediaDisplayType,MediaOutput,DisplayableMediaOutput } from "../../../../../src/shared/types";
import { type } from "os";
import exp from "constants";

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
        typeclassRegistry["converters"] = {};

        typeclassRegistry.addConverter("number", "string", (data: number) => {
            return data.toString();
        });

        expect(typeclassRegistry.resolveConversion("number", "string")).toBeDefined(); // else returns null

        typeclassRegistry.addConverter("boolean", "number", (data: boolean) => {
            return data ? 1 : 0;
        });

        console.log(typeclassRegistry.resolveConversion("boolean", "string")!(true))
        expect(typeclassRegistry.resolveConversion("boolean", "string")).toBeDefined(); // else returns null


        expect(typeclassRegistry.resolveConversion("number", "a",1)).toBe(null);

        expect(typeclassRegistry.checkTypesCompatible("number", "string")).toBe(true);

        expect(typeclassRegistry.checkTypesCompatible("number", "number")).toBe(true);

        expect(typeclassRegistry.checkTypesCompatible("number", "a")).toBe(false);

        expect(typeclassRegistry.getTypeclasses()).toEqual([]);
    });

    it("Test displayable Media Output", () => {

        console.log(typeclassRegistry["typeclasses"]["string"]);
       const output : MediaOutput = {
        outputId: "00000",
        outputNodeUUID: "12345",
        graphUUID: "67890",
        content: "test",
        dataType: "string"
       }

       const value = typeclassRegistry["typeclasses"]["string"];

       const expected = value.mediaDisplayConfig(output.content);

       const displayableMediaOutput : DisplayableMediaOutput = {
        ...output,
        display: expected,
       }

       expect(typeclassRegistry.getDisplayableMedia(output)).toBeDefined();
       expect(typeof typeclassRegistry.getDisplayableMedia(output)).toBe('object');
       expect(typeclassRegistry.getDisplayableMedia(output)).toEqual(displayableMediaOutput);

       output.dataType  = "unregisteredType";

       const newDisplayableMediaOutput : DisplayableMediaOutput = {
        ...output,
        display: {
            displayType: MediaDisplayType.TextBox,
            props: {
                content: `INVALID TYPE: ${output.dataType}\nCONTENT: ${JSON.stringify(output.content)}`,
                status: "error",
            },
            contentProp: null,
        },
        }

        expect(typeclassRegistry.getDisplayableMedia(output)).toBeDefined();
        expect(typeof typeclassRegistry.getDisplayableMedia(output)).toBe('object');
        expect(typeclassRegistry.getDisplayableMedia(output)).toEqual(newDisplayableMediaOutput);
    });


    it("Test renderer", () => {
        // console.log(typeclassRegistry["renderers"])
        expect(typeclassRegistry["renderers"]).toEqual({});  
        
        typeclassRegistry.addRenderer(`${'Hello'}/${'Bruh'}`, "test");
        expect(typeclassRegistry["renderers"]).toEqual({[`${'Hello'}/${'Bruh'}`]: "test"});


        typeclassRegistry.addRenderer(`${'Ano'}/${'Second'}`, "test2");
        expect(typeclassRegistry.getRendererSrc(`${'Ano'}/${'Second'}`)).toEqual("test2");
    });


    it("Test typeclassses ",() => { // they all return the same object with different prop
        expect(typeof typeclassRegistry["typeclasses"][""].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["number"].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["string"].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["boolean"].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["color"].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["image"].mediaDisplayConfig("")).toBe('object');
        expect(typeof typeclassRegistry["typeclasses"]["error"].mediaDisplayConfig("")).toBe('object');
    })

    it("Test base converters", () => {
        expect(typeclassRegistry["converters"].number.string(1)).toBe("1")
        expect(typeclassRegistry["converters"].string.number(1)).toBe(1)
        expect(typeclassRegistry["converters"].boolean.string(true)).toBe("true")
        expect(typeclassRegistry["converters"].string.boolean("true")).toBe(true)
        expect(typeclassRegistry["converters"].number.boolean(1)).toBe(true)

    })

})