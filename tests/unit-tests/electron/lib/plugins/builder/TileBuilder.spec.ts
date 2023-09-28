
import { Slider } from "blix_svelvet";
import {TileBuilder, TileUIBuilder, forTesting} from "../../../../../../src/electron/lib/plugins/builders/TileBuilder"
import { TileInstance } from "../../../../../../src/electron/lib/registries/TileRegistry";
import { TileUI, TileUIParent, UIComponentConfig, UIComponentProps,TileUIComponent, TileUILeaf } from "../../../../../../src/shared/ui/TileUITypes";

describe("Test TileBuilder", () => {
    let tileBuilder : TileBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    tileBuilder = new TileBuilder("testing-plugin", "cool tile 6");
  });

  test("Initial build", () => {
    const build : TileInstance = tileBuilder.build;

    const expectedBuild : TileInstance = new TileInstance(
         "cool tile 6",
         "testing-plugin",
         "cool tile 6",
         "",
         "",
         {},
         {},
    );

    expect(build).toEqual(expectedBuild);

    tileBuilder.reset();
    expect(tileBuilder.build).toEqual(expectedBuild);

  });

  test("Getters and setters", () => {
    tileBuilder.setDescription("Hello world");

    tileBuilder.addIcon("Iconicus");
    tileBuilder.setTitle("This is a title");

    const tileUIBuilder = new TileUIBuilder();
    tileBuilder.setUI(tileUIBuilder);

    expect(tileBuilder.build.description).toEqual("Hello world");
    expect(tileBuilder.build.icon).toEqual("Iconicus");
    expect(tileBuilder.build.displayName).toEqual("This is a title");
    expect(tileBuilder.build.ui).toEqual(tileUIBuilder.getUI());
    expect(tileBuilder.build.uiConfigs).toEqual(tileUIBuilder.getUIConfigs());

    expect(tileBuilder.createUIBuilder()).toBeDefined();
    expect(tileBuilder.addUIElement()).toReturn;
  });
});

describe("Test TileUIBuilder", () => {
    let tileUIBuilder : TileUIBuilder;

    beforeEach(() => {
        jest.clearAllMocks();
        tileUIBuilder = new TileUIBuilder();
    })

    test("Initial build", () => {
        expect(tileUIBuilder.main).toBeDefined();
        expect(tileUIBuilder.sidebar).toBe(null);
        expect(tileUIBuilder.statusbar).toBe(null);
        expect(tileUIBuilder.getUIConfigs()).toEqual({});
    });

    test("Getters and setters", () => {
        expect(tileUIBuilder.build).toBe(null);
        expect(tileUIBuilder.main).toBeInstanceOf(TileUIParent);
        expect(tileUIBuilder.main).toBeDefined();
        expect(tileUIBuilder.sidebar).toBe(null);
        expect(tileUIBuilder.statusbar).toBe(null);
    });

    test("Add UI element", () => {
        const tileUIBuilder2 = new TileUIBuilder();

        const UI = tileUIBuilder2.getUI();
        const UIConfigs = tileUIBuilder2.getUIConfigs();


        tileUIBuilder.addLayout(tileUIBuilder2);

        expect(tileUIBuilder.main).toBeDefined();

        expect(tileUIBuilder.main.childUis?.ui).toEqual(UI);
        expect(tileUIBuilder.main.childUis?.uiConfigs).toEqual(UIConfigs);


        expect(tileUIBuilder.addSidebar("below")).toBe(tileUIBuilder)
        expect(tileUIBuilder.sidebar).toBeDefined();
        expect(tileUIBuilder.sidebar?.component.location).toBe("below");

        expect(tileUIBuilder.addStatusbar("below")).toBe(tileUIBuilder)
        expect(tileUIBuilder.sidebar).toBeDefined();
        expect(tileUIBuilder.sidebar?.component.location).toBe("below");

        expect(tileUIBuilder.sidebar?.uiConfigs).toEqual({});
    })

    test("Add UI element with configs", () => {
        tileUIBuilder.addSidebar("below");

        const uiCompontentConfig : UIComponentConfig = {
            label: "Hello",
            componentId: "world",
            defaultValue: "!",
            updatesBackend: true,
        }

        const uiComponentProps : UIComponentProps = {
            "Hello": "world",
        }

        const leaf = new TileUILeaf(tileUIBuilder.sidebar?.component!, TileUIComponent.Button, "world", [uiComponentProps])

        tileUIBuilder.sidebar?.addButton(uiCompontentConfig, uiComponentProps);
        expect(tileUIBuilder.sidebar?.component.params).toHaveLength(1);
        expect(tileUIBuilder.sidebar?.component.params[0]).toEqual(leaf);
        expect(tileUIBuilder.sidebar?.uiConfigs["world"]).toEqual(uiCompontentConfig);
    })

    test("Add slider UI element with configs", () => {
        tileUIBuilder.addSidebar("below");

        const uiCompontentConfig : UIComponentConfig = {
            label: "Hello",
            componentId: "world",
            defaultValue: "!",
            updatesBackend: true,
        }

        const uiComponentProps : UIComponentProps = {
            "Hello": "world",
        }

        const leaf = new TileUILeaf(tileUIBuilder.sidebar?.component!, TileUIComponent.Slider, "world", [uiComponentProps])

        tileUIBuilder.sidebar?.addSlider(uiCompontentConfig, uiComponentProps);
        expect(tileUIBuilder.sidebar?.component.params).toHaveLength(1);
        expect(tileUIBuilder.sidebar?.component.params[0]).toEqual(leaf);
        expect(tileUIBuilder.sidebar?.uiConfigs["world"]).toEqual(uiCompontentConfig);
    })

    test("Add Dropdown UI element with configs", () => {
        tileUIBuilder.addSidebar("below");

        const uiCompontentConfig : UIComponentConfig = {
            label: "Hello",
            componentId: "world",
            defaultValue: "!",
            updatesBackend: true,
        }

        const uiComponentProps : UIComponentProps = {
            "Hello": "world",
        }

        const leaf = new TileUILeaf(tileUIBuilder.sidebar?.component!, TileUIComponent.Dropdown, "world", [uiComponentProps])

        tileUIBuilder.sidebar?.addDropdown(uiCompontentConfig, uiComponentProps);
        expect(tileUIBuilder.sidebar?.component.params).toHaveLength(1);
        expect(tileUIBuilder.sidebar?.component.params[0]).toEqual(leaf);
        expect(tileUIBuilder.sidebar?.uiConfigs["world"]).toEqual(uiCompontentConfig);
    })

    test("Add TextInput UI element with configs", () => {
        tileUIBuilder.addSidebar("below");

        const uiCompontentConfig : UIComponentConfig = {
            label: "Hello",
            componentId: "world",
            defaultValue: "!",
            updatesBackend: true,
        }

        const uiComponentProps : UIComponentProps = {
            "Hello": "world",
        }

        const leaf = new TileUILeaf(tileUIBuilder.sidebar?.component!, TileUIComponent.TextInput, "world", [uiComponentProps])

        tileUIBuilder.sidebar?.addTextInput(uiCompontentConfig, uiComponentProps);
        expect(tileUIBuilder.sidebar?.component.params).toHaveLength(1);
        expect(tileUIBuilder.sidebar?.component.params[0]).toEqual(leaf);
        expect(tileUIBuilder.sidebar?.uiConfigs["world"]).toEqual(uiCompontentConfig);
    })

    test("For testing", () => {
    const tileUIBuilder2 = new TileUIBuilder();
    
    const result = forTesting();

    expect(result(TileUIComponent.Button).substring(0,7)).toBe(`${TileUIComponent.Button.toString()}-${Math.floor(Math.random() * 16 ** 6).toString(16)}`.substring(0,7))
        
    })
});