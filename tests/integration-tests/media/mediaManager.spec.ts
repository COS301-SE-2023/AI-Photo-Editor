
import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../src/electron/lib/registries/ToolboxRegistry";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { Blix } from "../../../src/electron/lib/Blix";
import { CoreGraphImporter } from "../../../src/electron/lib/core-graph/CoreGraphImporter";
import { CoreGraph } from "../../../src/electron/lib/core-graph/CoreGraph";
import { CoreGraphExporter, GraphToJSON } from "../../../src/electron/lib/core-graph/CoreGraphExporter";
import { MediaManager } from "../../../src/electron/lib/media/MediaManager";
import { CoreGraphInterpreter } from "../../../src/electron/lib/core-graph/CoreGraphInterpreter";
import { CoreGraphManager } from "../../../src/electron/lib/core-graph/CoreGraphManager";
import type { MediaOutput } from "../../../src/shared/types/media";
import { CoreGraphUpdateParticipant } from "../../../src/electron/lib/core-graph/CoreGraphInteractors";
import { MediaSubscriber } from "../../../src/electron/lib/media/MediaSubscribers";
import { measureMemory } from "vm";
import { TypeclassRegistry } from "../../../src/electron/lib/registries/TypeclassRegistry";

jest.mock('@electron/remote', () => ({ exec: jest.fn() }));

const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn(),
    toolboxClientApi: {
      registryChanged: jest.fn(),
    },
    commandClientApi: {
      registryChanged: jest.fn(),
    },
    projectClientApi: {
        onProjectCreated: jest.fn(),
        onProjectChanged: jest.fn()
    },
    graphClientApi: {
        graphChanged: jest.fn(),
        graphRemoved: jest.fn()
    },
    utilClientApi: {
        showToast: jest.fn()
    }
    
  }
} as any;

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
}));


jest.mock("chokidar", () => ({
  default: {
    watch: jest.fn(() => {
      return {
        on: jest.fn()
      }
    }),
  }
}));

jest.mock("../../../src/electron/lib/projects/ProjectManager");

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
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));


describe("Test graph importer", () => {

    let mediaManager: MediaManager;
    let blix: Blix;
    let typeRegistry: TypeclassRegistry

    beforeEach(async() => {
        blix = new Blix();
        await blix.init(mainWindow);
        typeRegistry = new TypeclassRegistry(blix);
        mediaManager = new MediaManager(typeRegistry, blix.graphInterpreter, blix.graphManager);
    });

    test("Media manager should be defined", () => {
        expect(mediaManager).toBeDefined();
    });

    test("Media should update", () => {
        const data: MediaOutput = {
            content: 123,
            dataType: "test",
            graphUUID: "test1233",
            outputId: "test123",
            outputNodeUUID: "test123",
        };
        mediaManager.updateMedia(data);
        expect(mediaManager.getMedia("test123")).toEqual(data);
    });

    test("Media should dispatch event on change", () => {
        jest.spyOn(blix.graphInterpreter, "run");

        const data: MediaOutput = {
            content: 123,
            dataType: "test",
            graphUUID: "test1233",
            outputId: "test123",
            outputNodeUUID: "test123",
        };

        const graph = new CoreGraph();
        blix.graphManager.addGraph(graph);

        blix.graphManager.addNode(graph.uuid, blix.toolbox.getRegistry()["blix.output"], { x: 0, y: 0 }, CoreGraphUpdateParticipant.user);


        //mediaManager.onGraphUpdated(graph.uuid);

        expect(blix.graphInterpreter.run).toBeCalledTimes(1);

    });

    test("Should add subscriber", () => {

        const data: MediaOutput = {
            content: 123,
            dataType: "test",
            graphUUID: "test1233",
            outputId: "test123",
            outputNodeUUID: "test123",
        };


        const subscriber = new MediaSubscriber();

        jest.spyOn(MediaSubscriber.prototype, "onMediaChanged")

        mediaManager.addSubscriber("test123", subscriber);
        mediaManager.updateMedia(data);

        expect(MediaSubscriber.prototype.onMediaChanged).toBeCalledWith(data);

    });

    test("Should remove subscriber", () => {

        const data: MediaOutput = {
            content: 123,
            dataType: "test",
            graphUUID: "test1233",
            outputId: "test123",
            outputNodeUUID: "test123",
        };

        const subscriber = new MediaSubscriber();

        subscriber.listen = jest.fn();

        mediaManager.addSubscriber("test123", subscriber);
        mediaManager.removeSubscriber("test123", subscriber.uuid);

        expect(mediaManager.getMedia("test123")).toBe(undefined);

    });


});