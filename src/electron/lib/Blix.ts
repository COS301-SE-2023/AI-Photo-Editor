import { CommandRegistry } from "./registries/CommandRegistry";
import { ToolboxRegistry } from "./registries/ToolboxRegistry";
import { TileRegistry } from "./registries/TileRegistry";
import { ProjectManager } from "./projects/ProjectManager";
import type { MainWindow } from "./api/apis/WindowApi";
import { CoreGraphManager } from "./core-graph/CoreGraphManager";
import { CoreGraphInterpreter } from "./core-graph/CoreGraphInterpreter";
import { PluginManager } from "./plugins/PluginManager";
import {
  CoreGraphUpdateEvent,
  IPCGraphSubscriber,
  UIInputsGraphSubscriber,
  SystemGraphSubscriber,
  CoreGraphUpdateParticipant,
  MetadataGraphSubscriber,
} from "./core-graph/CoreGraphInteractors";
import type { UUID } from "../../shared/utils/UniqueEntity";
import type { GraphMetadata, UIGraph } from "../../shared/ui/UIGraph";
import { blixCommands } from "./BlixCommands";
import logger from "../utils/logger";
import { AiManager } from "./ai/AiManager";
// import { testStuffies } from "./core-graph/CoreGraphTesting";
import { NodeBuilder, NodeUIBuilder } from "./plugins/builders/NodeBuilder";
import type { MediaOutput } from "../../shared/types/media";
import { MediaManager } from "./media/MediaManager";
import { CoreGraph } from "./core-graph/CoreGraph";
import { MediaSubscriber } from "./media/MediaSubscribers";
import type { IGraphUIInputs } from "../../shared/types";

// Encapsulates the backend representation for
// the entire running Blix application
export class Blix {
  private _toolboxRegistry!: ToolboxRegistry;
  private _tileRegistry: TileRegistry;
  private _commandRegistry: CommandRegistry;
  private _graphManager!: CoreGraphManager;
  private _projectManager!: ProjectManager;
  private _pluginManager!: PluginManager;
  private _mainWindow!: MainWindow;
  private _aiManager!: AiManager;
  private _graphInterpreter!: CoreGraphInterpreter;
  private _mediaManager!: MediaManager;
  private _isReady = false;

  // private startTime: Date;

  // TODO: We'll need a layout registry as well which can save its state to a file
  // private layoutRegistry: LayoutRegistry;
  // private currentLayout: LayoutId;

  constructor() {
    // this.startTime = new Date();
    this._commandRegistry = new CommandRegistry(this);
    this._tileRegistry = new TileRegistry();
  }

  /**
   * Initializes the managers of the electron app after the Main Window has been
   * instantiated. **Do not** change the implementation so that it passes in the
   * window through the constructor.
   *
   * @param mainWindow
   */
  public async init(mainWindow: MainWindow) {
    this._mainWindow = mainWindow;
    this._toolboxRegistry = new ToolboxRegistry(mainWindow);
    this._graphInterpreter = new CoreGraphInterpreter(this._toolboxRegistry);

    // Create Output node
    const outputNodeBuilder = new NodeBuilder("blix", "output");
    const outputUIBuilder = outputNodeBuilder.createUIBuilder();
    outputUIBuilder.addButton(
      {
        componentId: "export",
        label: "Export",
        defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
        updatesBackend: false,
      },
      {}
    );
    outputUIBuilder.addTextInput(
      {
        componentId: "outputId",
        label: "Export",
        defaultValue: "default", // TODO: Make this a random id to start with
        updatesBackend: true,
      },
      {}
    );
    // .addDropdown("Orphanage", tempNodeBuilder.createUIBuilder()
    // .addLabel("Label1"));

    outputNodeBuilder.setTitle("Output");
    outputNodeBuilder.setDescription(
      "Dedicated output node which accepts data of any type, and returns the result to the system"
    );
    // tempNodeBuilder.define(({ input, from }: { input: MediaOutput; from: string }) => {
    outputNodeBuilder.define(
      (
        result: { [key: string]: any },
        inputUI: { [key: string]: any },
        requiredOutputs: string[]
      ) => {
        // mainWindow.apis.mediaClientApi.outputChanged(mediaOutput as MediaOutput);
        const mediaOutput: MediaOutput = result.mediaOutput;
        mediaOutput.outputId = inputUI.outputId;
        this._mediaManager.updateMedia(mediaOutput);
        return {};
      }
    );

    outputNodeBuilder.addInput("", "in", "In");
    outputNodeBuilder.setUI(outputUIBuilder);
    this._toolboxRegistry.addInstance(outputNodeBuilder.build);

    for (const command of blixCommands) {
      this.commandRegistry.addInstance(command);
    }

    // Load plugins before instantiating any managers
    this._pluginManager = new PluginManager(this);
    await this._pluginManager.loadBasePlugins();

    this._graphManager = new CoreGraphManager(this._toolboxRegistry, mainWindow);
    this._projectManager = new ProjectManager(mainWindow);

    this._mediaManager = new MediaManager(mainWindow, this._graphInterpreter, this._graphManager);

    this.initSubscribers();
    this._isReady = true;

    // testStuffies(this);
    this._aiManager = new AiManager(this.toolbox, this._graphManager, mainWindow);
  }

  private initSubscribers() {
    // ===== CORE GRAPH SUBSCRIBERS ===== //
    // Subscribes to graph updates and alerts the frontend
    const ipcGraphSubscriber = new IPCGraphSubscriber();
    ipcGraphSubscriber.listen = (graphId: UUID, newGraph: UIGraph) => {
      this.mainWindow?.apis.graphClientApi.graphChanged(graphId, newGraph);
    };
    this._graphManager.addAllSubscriber(ipcGraphSubscriber);

    // Subscribes to backend UI input updates and alerts the frontend
    const ipcUIInputsSubscriber = new UIInputsGraphSubscriber();
    ipcUIInputsSubscriber.setListenEvents([CoreGraphUpdateEvent.uiInputsUpdated]);
    ipcUIInputsSubscriber.setListenParticipants([
      CoreGraphUpdateParticipant.system,
      CoreGraphUpdateParticipant.ai,
    ]);

    ipcUIInputsSubscriber.listen = (graphId: UUID, newUIInputs: IGraphUIInputs) => {
      this.mainWindow?.apis.graphClientApi.uiInputsChanged(graphId, newUIInputs);
    };
    this._graphManager.addAllSubscriber(ipcUIInputsSubscriber);

    // Subscribes to all updates and alerts the media manager
    const mediaSubscriber = new SystemGraphSubscriber();
    mediaSubscriber.setListenEvents([
      CoreGraphUpdateEvent.graphUpdated,
      CoreGraphUpdateEvent.uiInputsUpdated,
    ]);
    mediaSubscriber.listen = (graphId: UUID, newGraph: CoreGraph) => {
      // this._graphInterpreter.run(this._graphManager.getGraph(graphId));
      this._mediaManager.onGraphUpdated(graphId);
    };
    this._graphManager.addAllSubscriber(mediaSubscriber);

    const metadataSubscriber = new MetadataGraphSubscriber();
    metadataSubscriber.setListenEvents([CoreGraphUpdateEvent.metadataUpdated]);
    metadataSubscriber.setListenParticipants([
      CoreGraphUpdateParticipant.system,
      CoreGraphUpdateParticipant.ai,
      CoreGraphUpdateParticipant.user,
    ]);
    metadataSubscriber.listen = (graphId: UUID, newMetadata: GraphMetadata) => {
      this.mainWindow?.apis.graphClientApi.metadataChanged(graphId, newMetadata);
    };
    this._graphManager.addAllSubscriber(metadataSubscriber);

    // ===== MEDIA SUBSCRIBERS ===== //
    // REMOVED: The MediaApi now handles creating MediaSubscribers directly
    // const ipcMediaSubscriber = new MediaSubscriber();
    // ipcMediaSubscriber.listen = (media: MediaOutput) => {
    //   this.mainWindow?.apis.mediaClientApi.outputChanged(media);
    // };
    // this._mediaManager.addSubscriber("default", ipcMediaSubscriber);
  }

  // TODO: Move these to a Utils.ts or something like that
  sendInformationMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "info" });
  }

  sendWarnMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "warn" });
  }

  sendErrorMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "error" });
  }

  sendSuccessMessage(message: string) {
    this._mainWindow.apis.utilClientApi.showToast({ message, type: "success" });
  }

  get toolbox(): ToolboxRegistry {
    return this._toolboxRegistry;
  }

  get tileRegistry(): TileRegistry {
    return this._tileRegistry;
  }

  get commandRegistry(): CommandRegistry {
    return this._commandRegistry;
  }

  get graphManager(): CoreGraphManager {
    return this._graphManager;
  }

  get pluginManager(): PluginManager {
    return this._pluginManager;
  }

  get projectManager(): ProjectManager {
    return this._projectManager;
  }

  get graphInterpreter(): CoreGraphInterpreter {
    return this._graphInterpreter;
  }

  get mediaManager(): MediaManager {
    return this._mediaManager;
  }

  get aiManager(): AiManager {
    return this._aiManager;
  }

  get mainWindow(): MainWindow | null {
    return this._mainWindow;
  }

  get isReady() {
    return this._isReady;
  }
}
