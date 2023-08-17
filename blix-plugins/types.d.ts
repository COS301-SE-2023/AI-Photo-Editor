/// <reference types="node" />
declare module "electron/utils/logger" {
    import * as log from "electron-log";
    const logger: log.ElectronLog & {
        default: log.ElectronLog;
    };
    export default logger;
}
declare module "electron/lib/registries/Registry" {
    export interface Registry {
        addInstance(instance: RegistryInstance): void;
        getRegistry(): {
            [key: string]: RegistryInstance;
        };
    }
    export interface RegistryInstance {
        get id(): string;
    }
}
declare module "shared/types/layout" {
    export interface LayoutPanel {
        panels?: LayoutPanel[];
        content?: PanelType;
    }
    export type PanelType = "graph" | "media" | "debug" | "webview" | "shortcutSettings";
}
declare module "shared/utils/UniqueEntity" {
    export type UUID = string;
    export class UniqueEntity {
        private readonly _uuid;
        constructor();
        get uuid(): string;
        private static genUUID;
    }
}
declare module "shared/types/project" {
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { LayoutPanel } from "shared/types/layout";
    export interface SharedProject {
        id: UUID;
        name?: string;
        layout?: LayoutPanel;
        graphs?: UUID[];
    }
}
declare module "shared/ui/NodeUITypes" {
    export type UIComponentConfig = {
        label: string;
        componentId: string;
        defaultValue: unknown;
        triggerUpdate: boolean;
    };
    export type UIComponentProps = {
        [key: string]: unknown;
    };
    export abstract class NodeUI {
        parent: NodeUI | null;
        label: string;
        readonly params: any[];
        readonly type: string;
        constructor(parent: NodeUI | null, label: string, params: any[], type: string);
    }
    export class NodeUIParent extends NodeUI {
        constructor(label: string, parent: NodeUIParent | null);
    }
    export class NodeUILeaf extends NodeUI {
        readonly parent: NodeUIParent;
        readonly category: NodeUIComponent;
        readonly label: string;
        readonly params: UIComponentProps[];
        constructor(parent: NodeUIParent, category: NodeUIComponent, label: string, params: UIComponentProps[]);
    }
    export enum NodeUIComponent {
        Button = "Button",
        Slider = "Slider",
        Knob = "Knob",
        Label = "Label",
        Radio = "Radio",
        Dropdown = "Dropdown",
        Accordion = "Accordion",
        NumberInput = "NumberInput",
        TextInput = "TextInput",
        Checkbox = "Checkbox",
        ColorPicker = "ColorPicker",
        FilePicker = "FilePicker"
    }
}
declare module "shared/ui/ToolboxTypes" {
    import { NodeUI, type UIComponentConfig } from "shared/ui/NodeUITypes";
    export type NodeSignature = string;
    export class IAnchor {
        readonly type: string;
        readonly id: string;
        readonly displayName: string;
        constructor(type: string, id: string, displayName: string);
    }
    export class INode {
        readonly signature: NodeSignature;
        readonly title: string;
        readonly description: string;
        readonly icon: string;
        readonly inputs: IAnchor[];
        readonly outputs: IAnchor[];
        readonly ui: NodeUI | null;
        readonly uiConfigs: {
            [key: string]: UIComponentConfig;
        };
        constructor(signature: NodeSignature, title: string, description: string, icon: string, inputs: IAnchor[], outputs: IAnchor[], ui: NodeUI | null, uiConfigs: {
            [key: string]: UIComponentConfig;
        });
    }
}
declare module "shared/ui/UIGraph" {
    import type { UIValue } from "shared/types/index";
    import { type UUID } from "shared/utils/UniqueEntity";
    import { type NodeSignature } from "shared/ui/ToolboxTypes";
    import { type Writable } from "svelte/store";
    import type { NodeUI, UIComponentConfig } from "shared/ui/NodeUITypes";
    export type GraphUUID = UUID;
    export type GraphNodeUUID = UUID;
    export type GraphEdgeUUID = UUID;
    export type GraphAnchorUUID = UUID;
    export type GraphMetadata = {
        displayName: string;
    };
    export class UIGraph {
        uuid: GraphUUID;
        nodes: {
            [key: GraphNodeUUID]: GraphNode;
        };
        edges: {
            [key: GraphAnchorUUID]: GraphEdge;
        };
        metadata: GraphMetadata;
        constructor(uuid: GraphUUID);
        updateNodes(): void;
    }
    export class GraphNode {
        readonly uuid: GraphNodeUUID;
        displayName: string;
        signature: NodeSignature;
        styling?: NodeStylingStore;
        inputUIValues: UIValueStore;
        anchorUUIDs: {
            [key: string]: GraphAnchorUUID;
        };
        constructor(uuid: GraphNodeUUID, pos?: SvelvetCanvasPos);
    }
    export class GraphEdge {
        readonly uuid: GraphEdgeUUID;
        readonly nodeUUIDFrom: GraphNodeUUID;
        readonly nodeUUIDTo: GraphNodeUUID;
        readonly anchorIdFrom: GraphAnchorUUID;
        readonly anchorIdTo: GraphAnchorUUID;
        label: string;
        constructor(uuid: GraphEdgeUUID, nodeUUIDFrom: GraphNodeUUID, nodeUUIDTo: GraphNodeUUID, anchorIdFrom: GraphAnchorUUID, anchorIdTo: GraphAnchorUUID);
    }
    export type SvelvetCanvasPos = {
        x: number;
        y: number;
    };
    export class NodeStylingStore {
        pos: Writable<SvelvetCanvasPos>;
        width: Writable<number>;
        height: Writable<number>;
    }
    export class UIValueStore {
        inputs: {
            [key: string]: Writable<UIValue>;
        };
    }
    export function constructUIValueStore(ui: NodeUI, uiConfigs: {
        [key: string]: UIComponentConfig;
    }): UIValueStore;
    export class GraphAnchor {
        uuid: GraphAnchorUUID;
        type: string;
        constructor(uuid: GraphAnchorUUID, type: string);
    }
}
declare module "shared/types/graph" {
    import type { NodeUI } from "shared/ui/NodeUITypes";
    import type { GraphUUID } from "shared/ui/UIGraph";
    import type { GraphNodeUUID } from "shared/ui/UIGraph";
    export interface IAnchor {
        type: string;
        signature: string;
        displayName: string;
    }
    export interface INode {
        signature: string;
        title: string;
        description: string;
        icon: string;
        inputs: IAnchor[];
        outputs: IAnchor[];
        ui: NodeUI | null;
    }
    export type UIValue = unknown;
    export type IGraphUIInputs = {
        [key: GraphNodeUUID]: INodeUIInputs;
    };
    export interface INodeUIInputs {
        inputs: {
            [key: string]: UIValue;
        };
        changes: string[];
    }
    export type QueryResponse<S = unknown, E = unknown> = {
        status: "error";
        message: string;
        data?: E;
    } | {
        status: "success";
        message?: string;
        data?: S;
    };
    export interface SharedGraph {
        uuid: GraphUUID;
        displayName: string;
    }
}
declare module "shared/types/command" {
    export interface ICommand {
        id: string;
        name: string;
        description: string;
        icon: string;
    }
}
declare module "shared/types/util" {
    export type ToastType = "success" | "error" | "info" | "warn";
}
declare module "shared/types/setting" {
    export interface UserSettingsCategory {
        id: string;
        title: string;
        subtitle?: string;
        settings: Setting[];
    }
    export interface UserSetting {
        id: string;
        title: string;
        subtitle?: string;
        secret?: boolean;
        type: "dropdown" | "password" | "text" | "toggle";
    }
    export interface InputSetting extends UserSetting {
        type: "password" | "text";
        placeholder?: string;
        value: string;
    }
    export interface DropdownSetting extends UserSetting {
        type: "dropdown";
        options: string[];
        value: string;
    }
    export interface ToggleSetting extends UserSetting {
        type: "toggle";
        value: boolean;
    }
    export type Setting = DropdownSetting | InputSetting | ToggleSetting;
}
declare module "shared/types/index" {
    export * from "shared/types/layout";
    export * from "shared/types/project";
    export * from "shared/types/graph";
    export * from "shared/types/command";
    export * from "shared/types/util";
    export * from "shared/types/setting";
}
declare module "electron/lib/registries/CommandRegistry" {
    import type { Registry } from "electron/lib/registries/Registry";
    import type { ICommand } from "shared/types/index";
    import { Blix } from "electron/lib/Blix";
    export type CommandContext = Blix;
    export interface Command {
        id: string;
        handler: CommandHandler;
        description?: CommandDescription | null;
    }
    export type CommandHandler = (ctx: CommandContext, params?: any) => void;
    export interface CommandDescription {
        readonly name: string;
        readonly description: string;
        readonly icon?: string;
    }
    export class CommandRegistry implements Registry {
        private readonly blix;
        private registry;
        constructor(blix: Blix);
        addInstance(instance: Command): void;
        getRegistry(): {
            [x: string]: Command;
        };
        getCommands(): ICommand[];
        runCommand(id: string, params?: any): Promise<void>;
    }
}
declare module "electron/lib/api/apis/WindowApi" {
    import type { BrowserWindow } from "electron";
    import type { AwaitedType } from "electron-affinity/main";
    /**
     * Binds the window APIs to the main process for every window.
     *
     * When creating a new window API add it to this method.
     *
     * @param window The the window to bind the APIs to
     */
    export function bindMainWindowApis(window: BrowserWindow): Promise<BrowserWindow & {
        apis: {
            commandClientApi: import("electron-affinity/main").WindowApiBinding<CommandClientApi>;
            toolboxClientApi: import("electron-affinity/main").WindowApiBinding<ToolboxClientApi>;
            graphClientApi: import("electron-affinity/main").WindowApiBinding<GraphClientApi>;
            projectClientApi: import("electron-affinity/main").WindowApiBinding<ProjectClientApi>;
            utilClientApi: import("electron-affinity/main").WindowApiBinding<UtilClientApi>;
            mediaClientApi: import("electron-affinity/main").WindowApiBinding<MediaClientApi>;
        };
    }>;
    export type MainWindow = AwaitedType<typeof bindMainWindowApis>;
}
declare module "electron/lib/registries/ToolboxRegistry" {
    import type { Registry, RegistryInstance } from "electron/lib/registries/Registry";
    import { NodeUIParent, type UIComponentConfig } from "shared/ui/NodeUITypes";
    import { INode, type NodeSignature } from "shared/ui/ToolboxTypes";
    import type { MainWindow } from "electron/lib/api/apis/WindowApi";
    export class ToolboxRegistry implements Registry {
        readonly mainWindow?: MainWindow;
        private registry;
        constructor(mainWindow?: MainWindow);
        addInstance(instance: NodeInstance): void;
        getRegistry(): {
            [key: string]: NodeInstance;
        };
        getINodes(): INode[];
        getNodeInstance(signature: NodeSignature): NodeInstance;
    }
    export type MinAnchor = {
        type: string;
        identifier: string;
        displayName: string;
    };
    export type NodeFunc = (input: {
        [key: string]: any;
    }, uiInputs: {
        [key: string]: any;
    }, requiredOutputs: string[]) => {
        [key: string]: any;
    };
    export class NodeInstance implements RegistryInstance {
        readonly name: string;
        readonly plugin: string;
        readonly displayName: string;
        readonly description: string;
        readonly icon: string;
        readonly func: NodeFunc;
        readonly ui: NodeUIParent | null;
        readonly uiConfigs: {
            [key: string]: UIComponentConfig;
        };
        readonly inputs: InputAnchorInstance[];
        readonly outputs: OutputAnchorInstance[];
        constructor(name: string, // Unique identifier for the node within the plugin
        plugin: string, displayName: string, description: string, icon: string, inputs: MinAnchor[], outputs: MinAnchor[], func?: NodeFunc, ui?: NodeUIParent | null, uiConfigs?: {
            [key: string]: UIComponentConfig;
        });
        get id(): string;
        get signature(): NodeSignature;
        get getFunction(): any;
    }
    export type AnchorType = string;
    interface AnchorInstance {
        readonly type: AnchorType;
        readonly id: string;
        readonly displayName: string;
    }
    export class InputAnchorInstance implements AnchorInstance {
        readonly type: AnchorType;
        readonly id: string;
        readonly displayName: string;
        constructor(type: AnchorType, id: string, // The lowercase anchor identifier name; must be unique within the node!
        displayName: string);
    }
    export class OutputAnchorInstance implements AnchorInstance {
        readonly type: AnchorType;
        readonly id: string;
        readonly displayName: string;
        constructor(type: AnchorType, id: string, displayName: string);
    }
    export function checkEdgeDataTypesCompatible(sourceDataType: string, targetDataType: string): boolean;
}
declare module "electron/lib/registries/TileRegistry" {
    import type { Registry, RegistryInstance } from "electron/lib/registries/Registry";
    export class TileRegistry implements Registry {
        private registry;
        addInstance(instance: TileInstance): void;
        getRegistry(): {
            [key: string]: TileInstance;
        };
    }
    export class TileInstance implements RegistryInstance {
        private readonly signature;
        private readonly name;
        private readonly description;
        private readonly icon;
        constructor(signature: string, name: string, description: string, icon: string);
        get id(): string;
    }
}
declare module "shared/types/media" {
    import { type UUID } from "shared/utils/UniqueEntity";
    export type MediaOutputId = string;
    export interface MediaOutput {
        outputId: MediaOutputId;
        outputNodeUUID: UUID;
        graphUUID: UUID;
        content: any;
        dataType: string;
    }
}
declare module "electron/lib/core-graph/CoreGraph" {
    import { type UUID, UniqueEntity } from "shared/utils/UniqueEntity";
    import { type AnchorType, InputAnchorInstance, NodeInstance, OutputAnchorInstance } from "electron/lib/registries/ToolboxRegistry";
    import type { NodeToJSON } from "electron/lib/core-graph/CoreGraphExporter";
    import { type NodeSignature } from "shared/ui/ToolboxTypes";
    import type { INodeUIInputs, QueryResponse, UIValue } from "shared/types/index";
    import { type GraphMetadata } from "shared/ui/UIGraph";
    export type AnchorUUID = UUID;
    export class CoreGraphStore extends UniqueEntity {
        private graphs;
        constructor(graphs: {
            [key: UUID]: CoreGraph;
        });
        createGraph(): UUID;
    }
    export class CoreGraph extends UniqueEntity {
        private nodes;
        private anchors;
        private edgeDest;
        private edgeSrc;
        private outputNodes;
        private metadata;
        private uiInputs;
        private static nodeTracker;
        constructor();
        exportNodesAndEdges(): NodesAndEdgesGraph;
        get getNodes(): {
            [key: string]: Node;
        };
        get getOutputNodes(): {
            [key: string]: string;
        };
        get getAnchors(): {
            [key: string]: Anchor;
        };
        get getEdgeDest(): {
            [key: string]: Edge;
        };
        get getEdgeSrc(): {
            [key: string]: string[];
        };
        get getAllUIInputs(): {
            [key: string]: CoreNodeUIInputs;
        };
        get getMetadata(): {
            displayName: string;
        };
        getUIInputs(nodeUUID: UUID): {
            [key: string]: UIValue;
        } | null;
        addNode(node: NodeInstance): QueryResponse<{
            nodeId: UUID;
            inputs: string[];
            outputs: string[];
            inputValues: Record<string, unknown>;
        }>;
        addEdge(anchorIdA: UUID, anchorIdB: UUID): QueryResponse<{
            edgeId: UUID;
        }>;
        updateUIInputs(nodeUUID: UUID, nodeUIInputs: INodeUIInputs): QueryResponse;
        getUpdatedUIInputs(nodeUUID: UUID, changedUIInputs: Record<string, unknown>): {
            status: "error";
            message: string;
            data?: undefined;
        } | {
            status: "success";
            data: INodeUIInputs;
            message?: undefined;
        };
        checkForDuplicateEdges(ancFrom: Anchor, ancTo: Anchor): boolean;
        checkForCycles(ancFrom: Anchor, ancTo: Anchor): boolean;
        removeNode(nodeToDelete: UUID): QueryResponse;
        removeEdge(anchorTo: AnchorUUID): QueryResponse;
        setNodePos(node: UUID, pos: {
            x: number;
            y: number;
        }): QueryResponse;
        updateMetadata(updatedMetadata: Partial<GraphMetadata>): {
            status: "error";
            message: string;
        } | {
            status: "success";
            message: string;
        };
        private copy;
    }
    interface AiAnchors {
        inputAnchors: string[];
        outputAnchors: string[];
    }
    export class Node extends UniqueEntity {
        private readonly name;
        private readonly plugin;
        private anchors;
        private styling?;
        constructor(name: string, // The name id of the node in the plugin
        plugin: string, // The name id of the plugin that defined the node
        inputAnchors: InputAnchorInstance[], // Input anchors attatched to node
        outputAnchors: OutputAnchorInstance[]);
        returnAnchors(): AiAnchors;
        setStyling(styling: NodeStyling): void;
        get getAnchors(): {
            [key: string]: Anchor;
        };
        get getName(): string;
        get getPlugin(): string;
        get getSignature(): NodeSignature;
        get getStyling(): NodeStyling;
        exportJSON(): NodeToJSON;
    }
    export enum AnchorIO {
        input = 0,
        output = 1
    }
    export class Anchor extends UniqueEntity {
        readonly parent: Node;
        readonly ioType: AnchorIO;
        readonly anchorId: string;
        readonly type: AnchorType;
        readonly displayName: string;
        constructor(parent: Node, ioType: AnchorIO, anchorId: string, type: AnchorType, displayName: string);
        getAnchorId(): string;
    }
    class Edge extends UniqueEntity {
        private anchorFrom;
        private anchorTo;
        constructor(anchorFrom: UUID, anchorTo: UUID);
        get getAnchorFrom(): string;
        get getAnchorTo(): string;
    }
    export class NodeStyling {
        private position;
        private size;
        constructor(position: {
            x: number;
            y: number;
        }, size: {
            w: number;
            h: number;
        });
        get getPosition(): {
            x: number;
            y: number;
        };
        get getSize(): {
            w: number;
            h: number;
        };
    }
    export class CoreNodeUIInputs {
        private readonly inputs;
        constructor(nodeUIInpust: INodeUIInputs);
        get getInputs(): {
            [key: string]: unknown;
        };
    }
    export interface GraphRepresentation {
        readonly graphId: UUID;
    }
    export class NodesAndEdgesGraph implements GraphRepresentation {
        readonly graphId: UUID;
        readonly nodes: {
            [key: UUID]: ReducedNode;
        };
        readonly edges: {
            [key: UUID]: ReducedEdge;
        };
        constructor(graphId: UUID, nodes: {
            [key: UUID]: ReducedNode;
        }, edges: {
            [key: UUID]: ReducedEdge;
        });
    }
    export class ReducedNode {
        readonly id: UUID;
        readonly signature: `${string}.${string}`;
        readonly styling: NodeStyling;
        readonly inputs: {
            [key: UUID]: ReducedAnchor;
        };
        readonly outputs: {
            [key: UUID]: ReducedAnchor;
        };
        constructor(id: UUID, signature: `${string}.${string}`, styling: NodeStyling, inputs: {
            [key: UUID]: ReducedAnchor;
        }, outputs: {
            [key: UUID]: ReducedAnchor;
        });
    }
    export class ReducedEdge {
        readonly id: UUID;
        readonly nodeUUIDFrom: UUID;
        readonly nodeUUIDTo: UUID;
        readonly anchorIdFrom: string;
        readonly anchorIdTo: string;
        constructor(id: UUID, nodeUUIDFrom: UUID, nodeUUIDTo: UUID, anchorIdFrom: string, anchorIdTo: string);
    }
    export class ReducedAnchor {
        readonly id: string;
        readonly type: AnchorType;
        readonly displayName: string;
        constructor(id: string, type: AnchorType, displayName: string);
    }
    export class NodeOutToNodeIn implements GraphRepresentation {
        graphId: UUID;
        constructor(graphId: UUID);
    }
}
declare module "electron/lib/core-graph/CoreGraphExporter" {
    import type { UIValue } from "shared/types/index";
    import { CoreGraph } from "electron/lib/core-graph/CoreGraph";
    import { NodeStyling } from "electron/lib/core-graph/CoreGraph";
    /**
     * This class is used to export a CoreGraph to external representations
     */
    export class CoreGraphExporter<T> {
        private exporter;
        constructor(exporter: ExportStrategy<T>);
        exportGraph(graph: CoreGraph): T;
    }
    interface ExportStrategy<T> {
        export(graph: CoreGraph): T;
    }
    export type GraphToJSON = {
        nodes: NodeToJSON[];
        edges: EdgeToJSON[];
    };
    export type NodeToJSON = {
        signature: string;
        styling: NodeStyling | null;
    };
    export type AnchorToJSON = {
        parent: number;
        id: string;
    };
    export type EdgeToJSON = {
        anchorFrom: AnchorToJSON;
        anchorTo: AnchorToJSON;
    };
    export class GraphFileExportStrategy implements ExportStrategy<GraphToJSON> {
        export(graph: CoreGraph): GraphToJSON;
        nodesToJSON(graph: CoreGraph): NodeToJSON[];
        edgesToJSON(graph: CoreGraph): EdgeToJSON[];
    }
    export class YamlExportStrategy implements ExportStrategy<string> {
        export(graph: CoreGraph): string;
    }
    export type LLMGraph = {
        graph: {
            nodes: {
                id: string;
                signature: string;
                inputs: {
                    id: string;
                    type: string;
                }[];
                outputs: {
                    id: string;
                    type: string;
                }[];
                inputValues: Record<string, UIValue>;
            }[];
            edges: {
                id: string;
                input: string;
                output: string;
            }[];
        };
        nodeMap: Record<string, string>;
        edgeMap: Record<string, string>;
        anchorMap: Record<string, string>;
    };
    export class LLMExportStrategy implements ExportStrategy<LLMGraph> {
        export(graph: CoreGraph): LLMGraph;
    }
}
declare module "electron/lib/projects/CoreProject" {
    import { UniqueEntity } from "shared/utils/UniqueEntity";
    import type { SharedProject, LayoutPanel } from "shared/types/index";
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { PathLike } from "fs";
    import type { GraphToJSON } from "electron/lib/core-graph/CoreGraphExporter";
    export class CoreProject extends UniqueEntity {
        private _name;
        private _graphs;
        private _location;
        constructor(name: string);
        rename(name: string): boolean;
        /**
         * Adds a graph to a project
         *
         * @param id ID of graph to be added
         */
        addGraph(id: UUID): void;
        /**
         * Removes a graph from a project
         *
         * @param id ID of graph to be removed
         */
        removeGraph(id: UUID): boolean;
        get name(): string;
        get location(): PathLike;
        set location(value: PathLike);
        get graphs(): string[];
        /**
         * Reduces the the state of the core project to be used by frontend. Might
         * need to figure out how this can be better implemented since it feels a bit
         * sus to have a frontend and backend data model which is very similar.
         *
         * @returns A reduced version of the CoreProject for the frontend
         */
        toSharedProject(): SharedProject;
    }
    export interface ProjectFile {
        layout: LayoutPanel;
        graphs: GraphToJSON[];
    }
}
declare module "electron/lib/projects/ProjectManager" {
    import { CoreProject } from "electron/lib/projects/CoreProject";
    import type { PathLike } from "fs";
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { MainWindow } from "electron/lib/api/apis/WindowApi";
    export class ProjectManager {
        private _projects;
        private _mainWindow;
        constructor(mainWindow: MainWindow);
        /**
         *	Creates a new CoreProject with the given name and a starter layout.
         *
         *	@param name The name of the project.
         *
         *	@returns The newly created project.
         */
        createProject(name?: string): CoreProject;
        /**
         * This function will load a project that is stored on a user's device.
         *
         * @param fileName Project name derived from file name
         * @param fileContent Project file content
         * @param path Path to project file
         * @returns UUID of new CoreProject
         */
        loadProject(fileName: string, path: PathLike): UUID;
        getProject(id: UUID): CoreProject | null;
        removeProject(uuid: UUID): void;
        getOpenProjects(): CoreProject[];
        renameProject(uuid: UUID, name: string): boolean;
        onProjectCreated(projectId: UUID): void;
        onProjectChanged(projectId: UUID): void;
        onProjectRemoved(projectId: UUID): void;
        /**
         * Adds a graph to a project.
         *
         * @param projectId - The UUID of the project to add the graph to.
         * @param graphId - The UUID of the graph to add.
         */
        addGraph(projectId: UUID, graphId: UUID): boolean;
        removeGraph(graphId: UUID): void;
    }
}
declare module "electron/lib/core-graph/CoreGraphInteractors" {
    import { type GraphMetadata } from "shared/ui/UIGraph";
    import { type IGraphUIInputs } from "shared/types/index";
    import { UIGraph } from "shared/ui/UIGraph";
    import { type UUID } from "shared/utils/UniqueEntity";
    import { CoreGraph } from "electron/lib/core-graph/CoreGraph";
    export enum CoreGraphUpdateEvent {
        graphUpdated = 0,
        uiInputsUpdated = 1,
        metadataUpdated = 2
    }
    export enum CoreGraphUpdateParticipant {
        system = 0,
        user = 1,
        ai = 2
    }
    export abstract class CoreGraphSubscriber<T> {
        protected _subscriberIndex: number;
        protected _notifyee?: (graphId: UUID, newGraph: T) => void;
        protected listenEvents: Set<CoreGraphUpdateEvent>;
        protected listenParticipants: Set<CoreGraphUpdateParticipant>;
        set listen(notifyee: (graphId: UUID, newGraph: T) => void);
        set subscriberIndex(index: number);
        get subscriberIndex(): number;
        addListenParticipants(participants: CoreGraphUpdateParticipant[]): void;
        setListenParticipants(participants: CoreGraphUpdateParticipant[]): void;
        getSubscriberParticipants(): Set<CoreGraphUpdateParticipant>;
        addListenEvents(events: CoreGraphUpdateEvent[]): void;
        setListenEvents(events: CoreGraphUpdateEvent[]): void;
        getSubscriberEvents(): Set<CoreGraphUpdateEvent>;
        abstract onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
    }
    export abstract class CoreGraphUpdater {
        protected _updaterIndex: number;
    }
    export class UIInputsGraphSubscriber extends CoreGraphSubscriber<IGraphUIInputs> {
        onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
    }
    export class IPCGraphSubscriber extends CoreGraphSubscriber<UIGraph> {
        onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
    }
    export class SystemGraphSubscriber extends CoreGraphSubscriber<CoreGraph> {
        onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
    }
    export class MetadataGraphSubscriber extends CoreGraphSubscriber<GraphMetadata> {
        onGraphChanged(graphId: string, graphData: CoreGraph): void;
    }
}
declare module "electron/lib/core-graph/CoreGraphImporter" {
    import { type UUID } from "shared/utils/UniqueEntity";
    import { ToolboxRegistry } from "electron/lib/registries/ToolboxRegistry";
    import { CoreGraph } from "electron/lib/core-graph/CoreGraph";
    import { type AnchorToJSON, type GraphToJSON } from "electron/lib/core-graph/CoreGraphExporter";
    export class CoreGraphImporter {
        private _toolbox;
        constructor(toolbox: ToolboxRegistry);
        /**
         * This will decide how the graph must be imported according to its format.
         * The casting is dumby for now until types are created for future formats.
         *
         *
         * @param format
         * @param data
         * @returns
         */
        import(format: string, data: string | GraphToJSON): CoreGraph;
        importJSON(json: GraphToJSON): CoreGraph;
        findCorrectAnchor(graph: CoreGraph, nodes: {
            [key: UUID]: UUID;
        }, anchor: AnchorToJSON): UUID;
    }
}
declare module "electron/lib/core-graph/CoreGraphManager" {
    import { type UUID } from "shared/utils/UniqueEntity";
    import type { MainWindow } from "electron/lib/api/apis/WindowApi";
    import { CoreGraph } from "electron/lib/core-graph/CoreGraph";
    import { CoreGraphSubscriber, CoreGraphUpdateEvent, CoreGraphUpdateParticipant } from "electron/lib/core-graph/CoreGraphInteractors";
    import { ToolboxRegistry } from "electron/lib/registries/ToolboxRegistry";
    import { NodeInstance } from "electron/lib/registries/ToolboxRegistry";
    import type { INodeUIInputs, QueryResponse } from "shared/types/index";
    import { type GraphMetadata } from "shared/ui/UIGraph";
    export class CoreGraphManager {
        private _graphs;
        private _subscribers;
        private _toolbox;
        private readonly _mainWindow;
        private _outputIds;
        constructor(toolbox: ToolboxRegistry, mainWindow?: MainWindow);
        addGraph(coreGraph: CoreGraph): void;
        addNode(graphUUID: UUID, node: NodeInstance, participant: CoreGraphUpdateParticipant): QueryResponse<{
            nodeId: UUID;
            inputs: string[];
            outputs: string[];
        }>;
        addEdge(graphUUID: UUID, anchorA: UUID, anchorB: UUID, participant: CoreGraphUpdateParticipant): QueryResponse<{
            edgeId: UUID;
        }>;
        removeNode(graphUUID: UUID, nodeUUID: UUID, participant: CoreGraphUpdateParticipant): QueryResponse;
        removeEdge(graphUUID: UUID, anchorTo: UUID, participant: CoreGraphUpdateParticipant): QueryResponse;
        updateUIInputs(graphUUID: UUID, nodeUUID: UUID, nodeUIInputs: INodeUIInputs, participant: CoreGraphUpdateParticipant): QueryResponse;
        setPos(graphUUID: UUID, nodeUUID: UUID, x: number, y: number, participant: CoreGraphUpdateParticipant): QueryResponse;
        createGraph(): UUID;
        loadGraph(graph: CoreGraph): void;
        getGraph(uuid: UUID): CoreGraph;
        getSubscribers(graphUUID: UUID): CoreGraphSubscriber<any>[];
        deleteGraphs(uuids: UUID[]): boolean[];
        getAllGraphUUIDs(): string[];
        updateGraphMetadata(graphUUID: UUID, updatedMetadata: Partial<GraphMetadata>, participant: CoreGraphUpdateParticipant): {
            status: "success";
            message: string;
        } | {
            status: "error";
            message: string;
        };
        onGraphUpdated(graphUUID: UUID, events: Set<CoreGraphUpdateEvent>, participant: CoreGraphUpdateParticipant): void;
        addAllSubscriber(subscriber: CoreGraphSubscriber<any>): void;
        addSubscriber(graphUUID: UUID, subscriber: CoreGraphSubscriber<any>): void;
        removeSubscriber(): void;
    }
}
declare module "frontend/lib/PanelNode" {
    import type { LayoutPanel, PanelType } from "@shared/types/index";
    export abstract class PanelNode {
        static panelCounter: number;
        constructor(id?: number);
        parent: PanelGroup | null;
        index: number;
        id: number;
        size?: number;
    }
    export class PanelGroup extends PanelNode {
        static groupCounter: number;
        constructor(name?: string, id?: number);
        name: string;
        panels: PanelNode[];
        removePanel(i: number): void;
        setPanel(panel: PanelNode, i: number): void;
        addPanel(content: PanelType, i: number): void;
        addPanelGroup(panelGroup: PanelGroup, i: number): void;
        getPanel(i: number): PanelNode;
        updateParent(_current: PanelGroup): void;
        print(indent?: number): string;
        recurseParent(): void;
        saveLayout(): LayoutPanel;
    }
    export class PanelLeaf extends PanelNode {
        content: PanelType;
        constructor(content: PanelType);
    }
    /**
     * This store house the last panel clicked by the user.
     */
    class FocusedPanelStore {
        private readonly store;
        focusOnPanel(id: number): void;
        get subscribe(): (this: void, run: import("svelte/store").Subscriber<number>, invalidate?: (value?: number) => void) => import("svelte/store").Unsubscriber;
    }
    export const focusedPanelStore: FocusedPanelStore;
}
declare module "frontend/lib/Project" {
    import type { UUID } from "@shared/utils/UniqueEntity";
    import { PanelGroup } from "frontend/lib/PanelNode";
    import type { LayoutPanel } from "@shared/types/index";
    export interface UIProject {
        readonly id: UUID;
        readonly name: string;
        readonly layout: PanelGroup;
        readonly graphs: UUID[];
    }
    export function constructLayout(layout: LayoutPanel): PanelGroup;
    export const layoutTemplate: LayoutPanel;
}
declare module "frontend/lib/stores/ProjectStore" {
    import { type Readable } from "svelte/store";
    import { type UUID } from "@shared/utils/UniqueEntity";
    import { type UIProject } from "frontend/lib/Project";
    import type { SharedProject } from "@shared/types";
    type ProjectsStoreState = {
        projects: UIProject[];
        activeProject: UIProject | null;
    };
    /**
     * TODO: Still a bit conflicted about this store. Biggest issue that if I change
     * the store so that it stores individual project stores then the ProjectsStore
     * will not be notified if the state of the individual project stores get
     * changed somewhere else in the app. I see two options to fix this issue:
     *
     * 1. Create writable ProjectStore but only expose the subscribe method to the
     * outside world to almost make it readable. Then force update of these
     * stores through the ProjectsStore.
     *
     * 2. Create some sort of proxy store so that only part of the state can be
     * subscribed to. This probably not going to be so easy.
     *
     * 3. Just leave the current implementation as is. The derived project store
     * subscribers will get notified every time the ProjectStore updates.
     */
    class ProjectsStore {
        private readonly store;
        /**
         * Adds a project to the store. Use when project is created in the backend
         * and UI has show the new state.
         */
        handleProjectCreated(projectState: SharedProject, setAsActive?: boolean): void;
        /**
         * Updates the frontend project store whenever a change to a project has been
         * somewhere else in the system.
         *
         * @param changeState Object containing changed project state
         */
        handleProjectChanged(changedState: SharedProject): void;
        /**
         * Removes a project from the store. Use when project is closed in the
         * backend and UI has to reflect the new state.
         *
         * @param id ID of specific Project
         */
        handleProjectRemoved(projectId: UUID): void;
        /**
         * Creates a new project in the backend.
         */
        createProject(): Promise<void>;
        /**
         * Closes an open project in the backend and removes it from the the store.
         *
         * @param id ID of specific Project
         */
        closeProject(projectId: UUID): Promise<void>;
        /**
         * Changes the current active project to be reflected on the UI.
         *
         * @param id ID of specific Project
         */
        setActiveProject(id: UUID): void;
        /**
         * DISCLAIMER: At the moment this actually does not return an independent
         * readable store. If some data is changed in this main store then all the
         * derived stores will be notified as well even if their state did not
         * necessarily change.
         *
         *
         * Returns a readable **Project** store which was derived from the
         * **ProjectsStore**. This store can be used independently and will not be
         * notified if the **ProjectsStore** is updated. A notification will only be
         * sent if the state of a specific project is updated.
         *
         * @param id ID of specific Project
         * @returns Derived readable ProjectStore
         */
        getProjectStore(id: UUID): Readable<UIProject | null>;
        getReactiveActiveProjectGraphIds(): Readable<string[]>;
        get subscribe(): (this: void, run: import("svelte/store").Subscriber<ProjectsStoreState>, invalidate?: (value?: ProjectsStoreState) => void) => import("svelte/store").Unsubscriber;
        private getNextActiveProject;
        get activeProjectGraphIds(): Readable<UUID[]>;
    }
    export const projectsStore: ProjectsStore;
}
declare module "frontend/lib/stores/CommandStore" {
    import type { ICommand } from "@shared/types";
    interface CommandStore {
        commands: ICommand[];
    }
    export const commandStore: {
        subscribe: (this: void, run: import("svelte/store").Subscriber<CommandStore>, invalidate?: (value?: CommandStore) => void) => import("svelte/store").Unsubscriber;
        addCommands: (cmds: any[]) => Promise<void>;
        runCommand: (id: string, args?: Record<string, any>) => Promise<any>;
        refreshStore: (results: ICommand[]) => void;
    };
}
declare module "electron/lib/core-graph/CoreGraphInterpreter" {
    import { CoreGraph, Node, Anchor } from "electron/lib/core-graph/CoreGraph";
    import { type UUID } from "shared/utils/UniqueEntity";
    import { ToolboxRegistry } from "electron/lib/registries/ToolboxRegistry";
    export class CoreGraphInterpreter {
        private toolboxRegistry;
        constructor(toolboxRegistry: ToolboxRegistry);
        run(graph: CoreGraph, node: UUID): Promise<void>;
        traverse<T>(graph: CoreGraph, curr: Node, anchorIn: Anchor): Promise<{
            [key: string]: T;
        }>;
    }
}
declare module "electron/utils/dialog" {
    import type { SaveDialogOptions, OpenDialogOptions, BrowserWindow } from "electron";
    export const showSaveDialog: (options: SaveDialogOptions, browserWindow?: BrowserWindow) => Promise<string | undefined>;
    export const showOpenDialog: (options: OpenDialogOptions, browserWindow?: BrowserWindow) => Promise<string[] | undefined>;
}
declare module "electron/lib/projects/ProjectCommands" {
    import type { Command, CommandContext } from "electron/lib/registries/CommandRegistry";
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { LayoutPanel } from "shared/types/index";
    export type SaveProjectArgs = {
        projectId: UUID;
        layout?: LayoutPanel;
        projectPath?: string;
    };
    type ExportMedia = {
        type: string;
        data?: string;
    };
    export type CommandResponse = {
        success: true;
        message?: string;
    } | {
        success: false;
        error?: string;
    };
    export const saveProjectCommand: Command;
    export const saveProjectAsCommand: Command;
    export const openProjectCommand: Command;
    export const exportMediaCommand: Command;
    export const projectCommands: Command[];
    /**
     * This function saves a project to a specified path. If the project already has
     * a path, the project will be overwritten at that path. If the project does not
     * have a path, the user will be prompted to choose a path to save the project
     * to.
     *
     *
     * @param id Project to be exported
     * @param pathToProject Optional path used if project has specifically been
     * specified to be saved to a certain path
     */
    export function saveProject(ctx: CommandContext, args: SaveProjectArgs): Promise<CommandResponse>;
    /**
     * This function saves a project to a specified path. If the project already has
     * a path, the project will be overwritten.
     *
     * @param id Project to be saved
     */
    export function saveProjectAs(ctx: CommandContext, args: SaveProjectArgs): Promise<{
        success: true;
        message?: string;
    } | {
        success: false;
        error?: string;
    } | {
        success: boolean;
        error: string;
    }>;
    /**
     * This function provides a dialog box for a user to select one or multiple
     * blix project files to open in their current editor window. It also then
     * loads the graphs for the projects.
     *
     * @returns Nothing
     */
    export function openProject(ctx: CommandContext): Promise<void>;
    export function exportMedia(ctx: CommandContext, args: ExportMedia): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
}
declare module "electron/lib/core-graph/CoreGraphCommands" {
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { Command, CommandContext } from "electron/lib/registries/CommandRegistry";
    import type { CommandResponse } from "electron/lib/projects/ProjectCommands";
    type CreateGraphArgs = {
        projectId: UUID;
        name?: string;
    };
    export const createGraphCommand: Command;
    export const deleteGraphCommand: Command;
    export function createGraph(ctx: CommandContext, args: CreateGraphArgs): Promise<CommandResponse>;
    export const coreGraphCommands: Command[];
}
declare module "electron/lib/BlixCommands" {
    import { type Command } from "electron/lib/registries/CommandRegistry";
    export const blixCommands: Command[];
}
declare module "electron/lib/ai/ai-cookbook" {
    import { z } from "zod";
    import type { CoreGraphManager } from "electron/lib/core-graph/CoreGraphManager";
    import { type LLMGraph } from "electron/lib/core-graph/CoreGraphExporter";
    import { NodeInstance } from "electron/lib/registries/ToolboxRegistry";
    import { type NodeSignature } from "shared/ui/ToolboxTypes";
    import type { UUID } from "shared/utils/UniqueEntity";
    import type { QueryResponse } from "shared/types/index";
    export const addNodeSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"addNode">;
        args: z.ZodObject<{
            signature: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            signature?: string;
        }, {
            signature?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "addNode";
        args?: {
            signature?: string;
        };
    }, {
        type?: "function";
        name?: "addNode";
        args?: {
            signature?: string;
        };
    }>;
    export type AddNodeConfig = z.infer<typeof addNodeSchema>;
    export const removeNodeSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"removeNode">;
        args: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "removeNode";
        args?: {
            id?: string;
        };
    }, {
        type?: "function";
        name?: "removeNode";
        args?: {
            id?: string;
        };
    }>;
    export type RemoveNodeConfig = z.infer<typeof removeNodeSchema>;
    export const addEdgeSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"addEdge">;
        args: z.ZodObject<{
            output: z.ZodString;
            input: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            output?: string;
            input?: string;
        }, {
            output?: string;
            input?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "addEdge";
        args?: {
            output?: string;
            input?: string;
        };
    }, {
        type?: "function";
        name?: "addEdge";
        args?: {
            output?: string;
            input?: string;
        };
    }>;
    export type AddEdgeConfig = z.infer<typeof addEdgeSchema>;
    export const removeEdgeSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"removeEdge">;
        args: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "removeEdge";
        args?: {
            id?: string;
        };
    }, {
        type?: "function";
        name?: "removeEdge";
        args?: {
            id?: string;
        };
    }>;
    export type RemoveEdgeConfig = z.infer<typeof removeEdgeSchema>;
    export const updateInputValuesSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"updateInputValues">;
        args: z.ZodObject<{
            nodeId: z.ZodString;
            changedInputValues: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        }, {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "updateInputValues";
        args?: {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        };
    }, {
        type?: "function";
        name?: "updateInputValues";
        args?: {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        };
    }>;
    export type UpdateInputValuesConfig = z.infer<typeof updateInputValuesSchema>;
    export const updateInputValueSchema: z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"updateInputValue">;
        args: z.ZodObject<{
            nodeId: z.ZodString;
            inputValueId: z.ZodString;
            newInputValue: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        }, {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "updateInputValue";
        args?: {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        };
    }, {
        type?: "function";
        name?: "updateInputValue";
        args?: {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        };
    }>;
    export type UpdateInputValueConfig = z.infer<typeof updateInputValueSchema>;
    export const exitResponseSchema: z.ZodObject<{
        type: z.ZodLiteral<"exit">;
        message: z.ZodString;
        logs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type?: "exit";
        message?: string;
        logs?: string[];
    }, {
        type?: "exit";
        message?: string;
        logs?: string[];
    }>;
    export type ExitResponse = z.infer<typeof exitResponseSchema>;
    export const errorResponseSchema: z.ZodObject<{
        type: z.ZodLiteral<"error">;
        error: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "error";
        error?: string;
        message?: string;
    }, {
        type?: "error";
        error?: string;
        message?: string;
    }>;
    export type ErrorResponse = z.infer<typeof errorResponseSchema>;
    export const debugResponseSchema: z.ZodObject<{
        type: z.ZodLiteral<"debug">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "debug";
        message?: string;
    }, {
        type?: "debug";
        message?: string;
    }>;
    export type DebugResponse = z.infer<typeof debugResponseSchema>;
    export const responseSchema: z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"addNode">;
        args: z.ZodObject<{
            signature: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            signature?: string;
        }, {
            signature?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "addNode";
        args?: {
            signature?: string;
        };
    }, {
        type?: "function";
        name?: "addNode";
        args?: {
            signature?: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"removeNode">;
        args: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "removeNode";
        args?: {
            id?: string;
        };
    }, {
        type?: "function";
        name?: "removeNode";
        args?: {
            id?: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"addEdge">;
        args: z.ZodObject<{
            output: z.ZodString;
            input: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            output?: string;
            input?: string;
        }, {
            output?: string;
            input?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "addEdge";
        args?: {
            output?: string;
            input?: string;
        };
    }, {
        type?: "function";
        name?: "addEdge";
        args?: {
            output?: string;
            input?: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"removeEdge">;
        args: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id?: string;
        }, {
            id?: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "removeEdge";
        args?: {
            id?: string;
        };
    }, {
        type?: "function";
        name?: "removeEdge";
        args?: {
            id?: string;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"updateInputValues">;
        args: z.ZodObject<{
            nodeId: z.ZodString;
            changedInputValues: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        }, {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "updateInputValues";
        args?: {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        };
    }, {
        type?: "function";
        name?: "updateInputValues";
        args?: {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        name: z.ZodLiteral<"updateInputValue">;
        args: z.ZodObject<{
            nodeId: z.ZodString;
            inputValueId: z.ZodString;
            newInputValue: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        }, {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        }>;
    }, "strip", z.ZodTypeAny, {
        type?: "function";
        name?: "updateInputValue";
        args?: {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        };
    }, {
        type?: "function";
        name?: "updateInputValue";
        args?: {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"exit">;
        message: z.ZodString;
        logs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type?: "exit";
        message?: string;
        logs?: string[];
    }, {
        type?: "exit";
        message?: string;
        logs?: string[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"error">;
        error: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "error";
        error?: string;
        message?: string;
    }, {
        type?: "error";
        error?: string;
        message?: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"debug">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "debug";
        message?: string;
    }, {
        type?: "debug";
        message?: string;
    }>]>;
    export type Response = z.infer<typeof responseSchema>;
    export type ResponseFunctions = ExtractResponseFunctions<Response>;
    type ExtractResponseFunctions<T> = T extends {
        type: "function";
    } ? T : never;
    /**
     * Cooks a response object to be sent to the ai
     * @param data Data to be sent to the ai
     * @returns Cooked response object
     * */
    export function cookUnsafeResponse(data: any): {
        type?: "function";
        name?: "addNode";
        args?: {
            signature?: string;
        };
    } | {
        type?: "function";
        name?: "removeNode";
        args?: {
            id?: string;
        };
    } | {
        type?: "function";
        name?: "addEdge";
        args?: {
            output?: string;
            input?: string;
        };
    } | {
        type?: "function";
        name?: "removeEdge";
        args?: {
            id?: string;
        };
    } | {
        type?: "function";
        name?: "updateInputValues";
        args?: {
            nodeId?: string;
            changedInputValues?: Record<string, string | number>;
        };
    } | {
        type?: "function";
        name?: "updateInputValue";
        args?: {
            nodeId?: string;
            inputValueId?: string;
            newInputValue?: string | number;
        };
    } | {
        type?: "exit";
        message?: string;
        logs?: string[];
    } | {
        type?: "error";
        error?: string;
        message?: string;
    } | {
        type?: "debug";
        message?: string;
    };
    /**
     * Calls addNode from coreGraphManager to add a node to the graph
     * @param graphManager CoreGraphManager instance
     * @param toolboxRegistry ToolboxRegistry instance
     * @param graphId Id of the graph to which the node is to be added
     * @param args zod object that contains the arguments for the addNode function :
     * {
     * signature : string
     * }
     * @returns Returns response from the graphManager
     * */
    export function addNode(graphManager: CoreGraphManager, registry: {
        [key: NodeSignature]: NodeInstance;
    }, graphId: UUID, args: AddNodeConfig["args"]): QueryResponse<{
        nodeId: string;
        inputs: string[];
        outputs: string[];
    }>;
    /**
     * Calls removeNode from coreGraphManager to remove a node from the graph, id of node is provided.
     * @param graphManager CoreGraphManager instance
     * @param graphId Id of the graph from which the node is to be removed
     * @param args zod object that contains the arguments for the removeNode function :
     * {
     * id : string
     * }
     * @returns Returns response from the graphManager
     * */
    export function removeNode(graphManager: CoreGraphManager, graphId: UUID, args: RemoveNodeConfig["args"]): QueryResponse;
    /**
     *
     * Calls addEdge from coreGraphManager to add an edge to the graph
     * @param graphManager CoreGraphManager instance
     * @param graphId Id of the graph to which the edge is to be added
     * @param args zod object that contains the arguments for the addEdge function :
     * {
     * output : string
     * input : string
     * }
     *
     * @returns Returns response from the graphManager
     * */
    export function addEdge(graphManager: CoreGraphManager, graphId: UUID, args: AddEdgeConfig["args"]): QueryResponse<{
        edgeId: string;
    }>;
    /**
     *
     * Calls removeEdge from coreGraphManager to remove an edge from the graph, id of edge is provided.
     * @param graphManager CoreGraphManager instance
     * @param graphId Id of the graph from which the edge is to be removed
     * @param args zod object that contains the arguments for the removeEdge function :
     * {
     * id : string
     * }
     *
     * @returns Returns response from the graphManager
     * */
    export function removeEdge(graphManager: CoreGraphManager, graphId: UUID, args: RemoveEdgeConfig["args"]): QueryResponse;
    export function updateInputValues(graphManager: CoreGraphManager, graphId: string, args: UpdateInputValuesConfig["args"]): {
        status: "error";
        message: string;
    };
    export function updateInputValue(graphManager: CoreGraphManager, graphId: string, args: UpdateInputValueConfig["args"]): {
        status: "error";
        message: string;
        data?: unknown;
    } | {
        status: "success";
        message?: string;
        data?: unknown;
    } | {
        status: string;
        message: string;
    };
    interface Edge {
        id: string;
        input: string;
        output: string;
    }
    /**
     * Finds an edge object based on its id
     * @param edges Interface that holds edge id, input anchor id and output anchor id
     * @param id Id of the edge to be found
     * @returns The edge that was found, or returns undefined
     * */
    export function findEdgeById(edges: Edge[], id: string): Edge | undefined;
    /**
     * Returns an error response object
     * @param message Error message to be sent
     * @returns Error response object
     * */
    export function errorResponse(message: string): {
        status: "error";
        message: string;
        data?: unknown;
    };
    /**
     * Returns a debug response object
     * @param message Debug message to be sent
     * @returns Debug response object
     * */
    export function getGraph(graphManager: CoreGraphManager, id: UUID): LLMGraph;
    /**
     * Returns a debug response object
     * @param message Debug message to be sent
     * @returns Debug response object
     * */
    export function truncId(arr: string[]): string[];
    export function splitStringIntoJSONObjects(input: string): any[];
}
declare module "electron/utils/settings" {
    type UnencryptedSecrets = Record<string, string>;
    const settings: any;
    export function setSecret(key: string, value: string): void;
    export function getSecret(key: string): string;
    /**
     * Decrypts all the secrets
     *
     * @returns Decrypted secrets
     */
    export function getSecrets(): UnencryptedSecrets;
    /**
     *
     * @param value Base64 encrypted string
     * @returns Unencrypted string
     */
    export function decryptWithSafeStorage(value: string): string;
    export function clearSecret(key: string): void;
    export default settings;
}
declare module "electron/lib/ai/AiManager" {
    import { ToolboxRegistry } from "electron/lib/registries/ToolboxRegistry";
    import { CoreGraphManager } from "electron/lib/core-graph/CoreGraphManager";
    import type { AddNodeConfig, RemoveNodeConfig, AddEdgeConfig, RemoveEdgeConfig, UpdateInputValueConfig, UpdateInputValuesConfig } from "electron/lib/ai/ai-cookbook";
    import { type MainWindow } from "electron/lib/api/apis/WindowApi";
    import type { ToastType } from "shared/types/index";
    const supportedLanguageModels: {
        readonly OpenAI: "OpenAI";
    };
    type Values<T> = T[keyof T];
    type SupportedLanguageModel = Values<typeof supportedLanguageModels>;
    /**
     *
     * Manages ai by storing context and handling prompt input
     * @param toolbox This is the blix toolbox registry that contains all the nodes
     * @param graphManager This is the graph manager that manages the current graph
     * @param childProcess This is the child process that runs the python script
     *
     * */
    export class AiManager {
        private _mainWindow?;
        private graphManager;
        private toolboxRegistry;
        /**
         *
         * Initializes context of ai with all the nodes in the toolbox and the graph
         * @param toolbox This is the blix toolbox registry that contains all the nodes
         * @param graphManager This is the graph manager that manages the current graph
         *
         * */
        constructor(toolbox: ToolboxRegistry, graphManager: CoreGraphManager, mainWindow?: MainWindow);
        getSupportedModels(): {
            readonly OpenAI: "OpenAI";
        };
        pluginContext(): string[];
        /**
         * This function will retrieve a key from the electron storage.
         * If the user had set a key it will be returned otherwise they will be alerted.
         *
         * @param model The model specified by the user
         * @param displayError Boolean used to decide if notifications must been sent to the user.
         * @returns An object that specifies if the user had a previous key for the model and their other saved keys
         */
        retrieveKey(model: SupportedLanguageModel, displayError?: boolean): string;
        handleNotification(message: string, type: ToastType, autohide?: boolean): void;
        /**
         * Sends prompt to ai and returns response
         * @param prompt Prompt to send to ai
         * @param graphId Id of the graph to send to ai
         * @returns Response from ai
         * */
        sendPrompt(prompt: string, graphId: string, model?: SupportedLanguageModel): Promise<void>;
        executeMagicWand(config: AddNodeConfig | RemoveNodeConfig | AddEdgeConfig | RemoveEdgeConfig | UpdateInputValueConfig | UpdateInputValuesConfig, graphId: string): {
            status: "success";
            message?: string;
            data?: unknown;
        } | {
            status: string;
            message: string;
        };
        private handleApiErrorResponse;
        private findPythonScriptPath;
    }
}
declare module "electron/lib/plugins/builders/PluginContextBuilder" {
    export interface PluginContextBuilder {
        get build(): any;
    }
}
declare module "electron/lib/plugins/builders/NodeBuilder" {
    import { type PluginContextBuilder } from "electron/lib/plugins/builders/PluginContextBuilder";
    import { type NodeFunc, NodeInstance } from "electron/lib/registries/ToolboxRegistry";
    import { NodeUIParent, type UIComponentProps, type UIComponentConfig } from "shared/ui/NodeUITypes";
    export class NodeBuilder implements PluginContextBuilder {
        private partialNode;
        constructor(plugin: string, name: string);
        get build(): NodeInstance;
        /**
         *
         * @param title Title of the node
         *
         * */
        setTitle(title: string): void;
        setDescription(description: string): void;
        /**
         *
         * @param icon Icon to be displayed on the node
         *
         */
        addIcon(icon: string): void;
        /**
         * @param type type of input
         * @param identifier  Unique identifier for the node
         * @param displayName Node name to display
         */
        addInput(type: string, identifier: string, displayName: string): void;
        /**
         *
         * @param type type of output
         * @param identifier  Unique identifier for the node
         * @param displayName Node name to display
         */
        addOutput(type: string, identifier: string, displayName: string): void;
        /**
         * Creates a new nodeUIBuilder for the node
         * @returns NodeUIBuilder
         */
        createUIBuilder(): NodeUIBuilder;
        define(code: NodeFunc): void;
        /**
         *
         * Sets the nodeUIBuilder for the node
         * @param ui NodeUIBuilder that will be used to build the UI
         * */
        setUI(ui: NodeUIBuilder): void;
    }
    /**
     *
     * Builds the nodes's ui through restricted interface
     *
     * */
    export class NodeUIBuilder {
        private node;
        private uiConfigs;
        constructor();
        addKnob(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the button
         * @param param Parameter for the button
         * @returns callback to this NodeUIBuilder
         * */
        addButton(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the slider
         * @param min Minimum value for the slider
         * @param max Maximum value for the slider
         * @param step Change in value for the slider
         * @param defautlVal Default value
         * @returns callback to this NodeUIBuilder
         */
        addSlider(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        addDropdown(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        addRadio(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the accordion
         * @param builder NodeUIBuilder for the accordion
         * @returns callback to this NodeUIBuilder
         * */
        addAccordion(config: UIComponentConfig, builder: NodeUIBuilder): NodeUIBuilder;
        /**
         * @param label Label for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addFilePicker(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addTextInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addNumberInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addImageInput(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        /**
         * @param label Label for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addColorPicker(config: UIComponentConfig, props: UIComponentProps): NodeUIBuilder;
        getUI(): NodeUIParent;
        getUIConfigs(): {
            [key: string]: UIComponentConfig;
        };
        /**
         * @param label Label for the text input
         * @props props Parameter for the text input
         * @returns callback to this NodeUIBuilder
         * */
        addLabel(config: UIComponentConfig, props: UIComponentProps): this;
    }
}
declare module "electron/lib/media/MediaSubscribers" {
    import { type MediaOutput } from "shared/types/media";
    import { UniqueEntity } from "shared/utils/UniqueEntity";
    export class MediaSubscriber extends UniqueEntity {
        protected _notifyee?: (media: MediaOutput) => void;
        constructor();
        set listen(notifyee: (media: MediaOutput) => void);
        onMediaChanged(mediaOutput: MediaOutput): void;
    }
}
declare module "electron/lib/media/MediaManager" {
    import { type MainWindow } from "electron/lib/api/apis/WindowApi";
    import { MediaSubscriber } from "electron/lib/media/MediaSubscribers";
    import { CoreGraphInterpreter } from "electron/lib/core-graph/CoreGraphInterpreter";
    import { type UUID } from "shared/utils/UniqueEntity";
    import { type MediaOutput, type MediaOutputId } from "shared/types/media";
    import { CoreGraphManager } from "electron/lib/core-graph/CoreGraphManager";
    export class MediaManager {
        private media;
        private _mainWindow;
        private _graphInterpreter;
        private _graphManager;
        private _subscribers;
        constructor(mainWindow: MainWindow, graphInterpreter: CoreGraphInterpreter, graphManager: CoreGraphManager);
        updateMedia(mediaOutput: MediaOutput): void;
        getMedia(mediaOutputId: MediaOutputId): MediaOutput;
        onGraphUpdated(graphUUID: UUID): void;
        onMediaUpdated(mediaId: MediaOutputId): void;
        computeMedia(graphUUID: UUID, nodeUUID: UUID): Promise<void>;
        removeSubscriber(mediaId: MediaOutputId, subscriberUUID: UUID): void;
        addSubscriber(mediaId: MediaOutputId, subscriber: MediaSubscriber): void;
    }
}
declare module "electron/lib/Blix" {
    import { CommandRegistry } from "electron/lib/registries/CommandRegistry";
    import { ToolboxRegistry } from "electron/lib/registries/ToolboxRegistry";
    import { TileRegistry } from "electron/lib/registries/TileRegistry";
    import { ProjectManager } from "electron/lib/projects/ProjectManager";
    import type { MainWindow } from "electron/lib/api/apis/WindowApi";
    import { CoreGraphManager } from "electron/lib/core-graph/CoreGraphManager";
    import { CoreGraphInterpreter } from "electron/lib/core-graph/CoreGraphInterpreter";
    import { PluginManager } from "electron/lib/plugins/PluginManager";
    import { AiManager } from "electron/lib/ai/AiManager";
    import { MediaManager } from "electron/lib/media/MediaManager";
    export class Blix {
        private _toolboxRegistry;
        private _tileRegistry;
        private _commandRegistry;
        private _graphManager;
        private _projectManager;
        private _pluginManager;
        private _mainWindow;
        private _aiManager;
        private _graphInterpreter;
        private _mediaManager;
        private _isReady;
        constructor();
        /**
         * Initializes the managers of the electron app after the Main Window has been
         * instantiated. **Do not** change the implementation so that it passes in the
         * window through the constructor.
         *
         * @param mainWindow
         */
        init(mainWindow: MainWindow): Promise<void>;
        private initSubscribers;
        sendInformationMessage(message: string): void;
        sendWarnMessage(message: string): void;
        sendErrorMessage(message: string): void;
        sendSuccessMessage(message: string): void;
        get toolbox(): ToolboxRegistry;
        get tileRegistry(): TileRegistry;
        get commandRegistry(): CommandRegistry;
        get graphManager(): CoreGraphManager;
        get pluginManager(): PluginManager;
        get projectManager(): ProjectManager;
        get graphInterpreter(): CoreGraphInterpreter;
        get mediaManager(): MediaManager;
        get aiManager(): AiManager;
        get mainWindow(): MainWindow | null;
        get isReady(): boolean;
    }
}
declare module "electron/lib/plugins/PluginManager" {
    import { type PathLike } from "fs";
    import { Blix } from "electron/lib/Blix";
    export class PluginManager {
        private blix;
        private loadedPlugins;
        constructor(blix: Blix);
        get pluginPaths(): any[];
        watchPlugins(): void;
        loadPlugins(): void;
        /**
         * Loads the base plugins that come packaged with Blix. This method may need
         * modification to also load installed plugins in the userData directory.
         */
        loadBasePlugins(): Promise<void>;
        loadPlugin(plugin: string, path: string): Promise<void>;
    }
    export interface PackageData {
        name: string;
        displayName: string;
        description: string;
        version: string;
        author: string;
        repository: string;
        contributes: {
            commands: [{
                command: string;
                title: string;
            }];
            nodes: [{
                id: string;
                name: string;
                icon: string;
            }];
        };
        main: PathLike;
        renderer: PathLike;
        devDependencies: {
            [key: string]: string;
        };
    }
}
declare module "electron/lib/plugins/Plugin" {
    import type { PathLike } from "fs";
    import type { PackageData } from "electron/lib/plugins/PluginManager";
    import { Blix } from "electron/lib/Blix";
    import type { Command } from "electron/lib/registries/CommandRegistry";
    import { NodeBuilder } from "electron/lib/plugins/builders/NodeBuilder";
    export type PluginSignature = string;
    export class Plugin {
        private packageData;
        private pluginDir;
        private main;
        private hasRequiredSelf;
        constructor(packageData: PackageData, pluginDir: PathLike, main: PathLike);
        get name(): string;
        get displayName(): string;
        get mainPath(): string;
        get pluginPath(): string;
        requireSelf(blix: Blix): void;
    }
    export class PluginContext {
        get blixVersion(): string;
    }
    export class NodePluginContext extends PluginContext {
        private _nodeBuilder;
        constructor();
        get nodeBuilder(): NodeBuilder;
        instantiate(plugin: string, name: string): NodeBuilder;
    }
    export class CommandPluginContext extends PluginContext {
        private plugin;
        private name;
        private displayName;
        private description;
        private icon;
        private command;
        private blix;
        constructor(name: string, plugin: string, blix: Blix);
        setDescription(description: string): void;
        setIcon(icon: string): void;
        addCommand(command: any): void;
        setDisplayName(displayName: string): void;
        getBlix(): Blix;
        create(): Command;
    }
}
