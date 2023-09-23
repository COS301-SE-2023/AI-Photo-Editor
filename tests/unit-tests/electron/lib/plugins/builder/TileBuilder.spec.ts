
import {TileBuilder, TileUIBuilder, forTesting} from "../../../../../../src/electron/lib/plugins/builders/TileBuilder"
import { TileInstance } from "../../../../../../src/electron/lib/registries/TileRegistry";

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