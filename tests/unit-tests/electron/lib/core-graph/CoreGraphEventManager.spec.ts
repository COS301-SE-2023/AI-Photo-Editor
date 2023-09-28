import expect from "expect";
import {
  CoreGraphEvent,
  CoreGraphEventManager,
} from "../../../../../src/electron/lib/core-graph/CoreGraphEventManger";
import { CoreGraphManager } from "../../../../../src/electron/lib/core-graph/CoreGraphManager";
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import {
  MinAnchor,
  NodeInstance,
} from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import { NodeUIParent } from "../../../../../src/shared/ui/NodeUITypes";
import exp from "constants";

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
    graphClientApi: {
      graphRemoved: jest.fn(),
    },
    mediaClientApi: {
      outputNodesChanged: jest.fn(),
    }
  },
} as any;

jest.mock("chokidar", () => ({
  default: {
    watch: jest.fn(() => {
      return {
        on: jest.fn(),
      };
    }),
  },
}));

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
    }),
  },
  ipcMain: {
    on: jest.fn(),
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

jest.mock("electron-store", () => ({
  default: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

jest.mock("ws", () => {
  return {
    WebSocketServer: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
      };
    }),
  };
});

jest.mock("../../../../../src/electron/lib/plugins/PluginManager");
describe("Test Core Graph Event Manager", () => {
  let blix: Blix;
  let graph_manager: CoreGraphManager;
  let graph: CoreGraph;
  let nodeA: NodeInstance;
  let nodeB: NodeInstance;
  // const errorOccurred = (test: string, error?: string) => {
  //     console.log(`\u001b[31mAn error occured!!!\n\u001b[0mTest: ${test}\nError: ${error}\n`);
  // };
  beforeEach(() => {
    // INIT
    blix = new Blix();
    blix.init(mainWindow);
    graph_manager = new CoreGraphManager(blix.toolbox, mainWindow);
    // SETUP GRAPH
    graph = new CoreGraph();
    graph_manager.addGraph(graph);
    const inputA: MinAnchor = {
      type: "string",
      displayName: `Test-plugin.Node-A.0`,
      identifier: `inA`,
    };
    const outputA: MinAnchor = {
      type: "string",
      displayName: `Test-plugin.Node-A.1`,
      identifier: `outA`,
    };
    nodeA = new NodeInstance(
        `Node-A`,
        `Test-plugin`,
        "folder",
        `Node-A`,
        `This is node A`,
        `fa-duotone fa-bell`,
        [inputA],
        [outputA],
        undefined,
        null,
        { "numberA": {
            label: "numberA",
            defaultValue: "0",
            componentId: "numberA",
            triggerUpdate: true
        }},
        undefined
      );

    const inputB: MinAnchor = {
      type: "string",
      displayName: `Test-plugin.Node-B.0`,
      identifier: `inB`,
    };
    const outputB: MinAnchor = {
      type: "string",
      displayName: `Test-plugin.Node-B.1`,
      identifier: `outB`,
    };
    nodeB = new NodeInstance(
        `Node-B`,
        `Test-plugin`,
        "folder",
        `Node-B`,
        `This is node B`,
        `fa-duotone fa-bell`,
        [inputB],
        [outputB],
        undefined,
        new NodeUIParent("label",null),
        { "numberB": {
            label: "numberB",
            defaultValue: "0",
            componentId: "numberB",
            triggerUpdate: true
        }},
        undefined
      );

    // SETUP TOOLBOX
    blix.toolbox.addInstance(
      new NodeInstance(
        `Node-A`,
        `Test-plugin`,
        "folder",
        `Node-A`,
        `This is node A`,
        `fa-duotone fa-bell`,
        [inputA],
        [outputA],
        undefined,
        null,
        { "numberA": {
            label: "numberA",
            defaultValue: "0",
            componentId: "numberA",
            triggerUpdate: true
        }},
        undefined
      )
    );
    blix.toolbox.addInstance(
      new NodeInstance(
        `Node-B`,
        `Test-plugin`,
        "folder",
        `Node-B`,
        `This is node B`,
        `fa-duotone fa-bell`,
        [inputB],
        [outputB],
        undefined,
        new NodeUIParent("label",null),
        { "numberB": {
            label: "numberB",
            defaultValue: "0",
            componentId: "numberB",
            triggerUpdate: true
        }},
        undefined
      )
    );
  });

  test("Roll forwards limit", () => {
    const res = graph_manager.redoEvent(graph.uuid);
    expect(res.status).toBe("error");
  });

  test("Roll backwards limit", () => {
    const res = graph_manager.undoEvent(graph.uuid);
    expect(res.status).toBe("error");
  })

  test("Resting event manager", () => {
    expect(() => {
        const event_manager = new CoreGraphEventManager();
        event_manager.reset();
    }).not.toThrow("some error");
  })

  test("Adding a Node", () => {
    const addRes = graph_manager.addNode(graph.uuid, nodeA, { x: 0, y: 0 }, 1);
    expect(addRes.status).toBe("success");
    if (addRes.status === "success") {
      // Undo - Remove the node
      const undoRes = graph_manager.undoEvent(graph.uuid);
      expect(undoRes.status).toBe("success");
      // Check node is removed
      if (addRes.data) expect(graph.getNodes[addRes.data.nodeId]).toBeUndefined();
      // Redo - Add the node
      const redoRes = graph_manager.redoEvent(graph.uuid);
      expect(redoRes.status).toBe("success");
      // Node was added back
      expect(Object.values(graph.getNodes)[0]).toBeDefined();
    }
  });

  test("Removing a Node", () => {
    const addRes = graph_manager.addNode(graph.uuid, nodeA, { x: 0, y: 0 }, 1);
    expect(addRes.status).toBe("success");
    expect(addRes.data).toBeDefined();
    if (addRes.status === "success" && addRes.data) {
      // Node exists
      expect(graph.getNodes[addRes.data.nodeId]).toBeDefined();
      // Remove Node
      const removeRes = graph_manager.removeNode(graph.uuid, addRes.data.nodeId, 1);
      expect(removeRes.status).toBe("success");
      if (removeRes.status === "success") {
        // Node Removed
        expect(graph.getNodes[addRes.data.nodeId]).toBeUndefined();
        // Undo - Add the node
        const undoRes = graph_manager.undoEvent(graph.uuid);
        expect(undoRes.status).toBe("success");
        // Check node is added back
        expect(Object.values(graph.getNodes)).toBeDefined();
        // Redo - Remove the node
        const redoRes = graph_manager.redoEvent(graph.uuid);
        expect(redoRes.status).toBe("success");
        // Check node is removed again
        expect(Object.values(graph.getNodes)[0]).toBeUndefined();
      }
    }
  });

  test("Adding an edge", () => {
    const pos = { x: 0, y: 0 };
    const addNodeARes = graph_manager.addNode(graph.uuid, nodeA, pos, 1);
    const addNodeBRes = graph_manager.addNode(graph.uuid, nodeB, pos, 1);

    expect(addNodeARes.status).toBe("success");
    expect(addNodeARes.data).toBeDefined();
    expect(addNodeBRes.status).toBe("success");
    expect(addNodeBRes.data).toBeDefined();
    if (addNodeARes.status === "success" && addNodeBRes.status === "success") {
      expect(addNodeARes.data).toBeDefined();
      expect(addNodeBRes.data).toBeDefined();
      if (addNodeARes.data && addNodeBRes.data) {
        const nodes = graph.getNodes;
        const anchorARes = nodes[addNodeARes.data.nodeId].findAnchorUUID("outA");
        const anchorBRes = nodes[addNodeBRes.data.nodeId].findAnchorUUID("inB");
        expect(anchorARes.status).toBe("success");
        expect(anchorBRes.status).toBe("success");
        if (anchorARes.status === "success" && anchorBRes.status === "success") {
          expect(anchorARes.data).toBeDefined();
          expect(anchorBRes.data).toBeDefined();
          if (anchorARes.data && anchorBRes.data) {
            // Add edge
            const addEdgeRes = graph_manager.addEdge(
              graph.uuid,
              anchorARes.data.anchorUUID,
              anchorBRes.data.anchorUUID,
              1
            );
            expect(addEdgeRes.status).toBe("success");
            if (addEdgeRes.status === "success" && addEdgeRes.data) {
              // Edge should be added
              const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
              expect(edge).toBeDefined();
              expect(graph.getEdgeDest[anchorBRes.data.anchorUUID].uuid).toBe(edge.uuid);
              expect(edge.uuid).toBe(addEdgeRes.data.edgeId);
              expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
              expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
              expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
              // Undo - Remove the edge
              const undoRes = graph_manager.undoEvent(graph.uuid);
              expect(undoRes.status).toBe("success");
              // Edge should be removed
              expect(graph.getEdgeDest[addEdgeRes.data.edgeId]).toBeUndefined();
              expect(graph.getEdgeSrc[edge.getAnchorFrom]).toBeUndefined();
              // Redo - Add the edge
              const redoRes = graph_manager.redoEvent(graph.uuid);
              expect(redoRes.status).toBe("success");
              expect(redoRes.data).toBeDefined();
              // Edge should be added again
              if (redoRes.status === "success" && redoRes.data) {
                const edge = Object.values(graph.getEdgeDest)[0];
                expect(edge).toBeDefined();
                expect(anchorARes.data.anchorUUID).toBe(edge.getAnchorFrom);
                expect(anchorBRes.data.anchorUUID).toBe(edge.getAnchorTo);
                expect(graph.getEdgeSrc[edge.getAnchorFrom]).toBeDefined();
                expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
                expect(graph.getEdgeDest[edge.getAnchorTo]).toBeDefined();
                expect(graph.getEdgeDest[edge.getAnchorTo].uuid).toBe(edge.uuid);
              }
            }
          }
        }
      }
    }
  });

  test("Changing UiInput of node", () => {
    const addRes = graph_manager.addNode(graph.uuid, nodeA, { x: 0, y: 0 }, 1);
    expect(addRes.status).toBe("success");
    if (addRes.status === "success") {
      expect(addRes.data).toBeDefined();
      if (addRes.data) {
        // Update uiInput of node and create event
        const oldinputs = graph.getAllUIInputs[addRes.data.nodeId].getInputs;
        expect(oldinputs["numberA"]).toBeDefined();
        oldinputs["numberA"] = 1;
        const updateRes = graph_manager.updateUIInputs(graph.uuid, addRes.data.nodeId, { inputs: oldinputs, changes: ["numberA"] }, 1);
        expect(updateRes.status).toBe("success"); 
        const interRes = graph_manager.handleNodeInputInteraction(graph.uuid, addRes.data.nodeId, { id: "numberA", value: 1 });
        expect(interRes.status).toBe("success");

        // Undo
        const undoRes = graph_manager.undoEvent(graph.uuid);
        expect(undoRes.status).toBe("success");
        // Redo
        const redoRes = graph_manager.redoEvent(graph.uuid);
        expect(redoRes.status).toBe("success");
        // Remove and add node so trigger update of ui change event
        const removeRes = graph_manager.removeNode(graph.uuid, addRes.data.nodeId, 1);
        expect(removeRes.status).toBe("success");
        if (removeRes.status === "success") {
            // Node Removed
            expect(graph.getNodes[addRes.data.nodeId]).toBeUndefined();
            // Undo - Add the node
            const undoRes = graph_manager.undoEvent(graph.uuid);
            expect(undoRes.status).toBe("success");
            // Check node is added back
            expect(Object.values(graph.getNodes)).toBeDefined();

            const newNode = Object.values(graph.getNodes)[0];
            // Update uiInput of node and create event
            const oldinputs = graph.getAllUIInputs[newNode.uuid].getInputs;
            expect(oldinputs["numberA"]).toBeDefined();
            oldinputs["numberA"] = 2;
            const updateRes = graph_manager.updateUIInputs(graph.uuid, newNode.uuid, { inputs: oldinputs, changes: ["numberA"] }, 1);
            expect(updateRes.status).toBe("success"); 
            const interRes = graph_manager.handleNodeInputInteraction(graph.uuid, newNode.uuid, { id: "numberA", value: 2 });
            expect(interRes.status).toBe("success");
        }
      }
    }
  });

  test("Removing an edge", () => {
    const pos = { x: 0, y: 0 };
    const addNodeARes = graph_manager.addNode(graph.uuid, nodeA, pos, 1);
    const addNodeBRes = graph_manager.addNode(graph.uuid, nodeB, pos, 1);

    expect(addNodeARes.status).toBe("success");
    expect(addNodeARes.data).toBeDefined();
    expect(addNodeBRes.status).toBe("success");
    expect(addNodeBRes.data).toBeDefined();
    if (addNodeARes.status === "success" && addNodeBRes.status === "success") {
      expect(addNodeARes.data).toBeDefined();
      expect(addNodeBRes.data).toBeDefined();
      if (addNodeARes.data && addNodeBRes.data) {
        const nodes = graph.getNodes;
        const anchorARes = nodes[addNodeARes.data.nodeId].findAnchorUUID("outA");
        const anchorBRes = nodes[addNodeBRes.data.nodeId].findAnchorUUID("inB");
        expect(anchorARes.status).toBe("success");
        expect(anchorBRes.status).toBe("success");
        if (anchorARes.status === "success" && anchorBRes.status === "success") {
          expect(anchorARes.data).toBeDefined();
          expect(anchorBRes.data).toBeDefined();
          if (anchorARes.data && anchorBRes.data) {
            // Add edge
            const addEdgeRes = graph_manager.addEdge(
              graph.uuid,
              anchorARes.data.anchorUUID,
              anchorBRes.data.anchorUUID,
              1
            );
            expect(addEdgeRes.status).toBe("success");
            if (addEdgeRes.status === "success" && addEdgeRes.data) {
              // Edge should be added
              const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
              expect(edge).toBeDefined();
              expect(graph.getEdgeDest[anchorBRes.data.anchorUUID].uuid).toBe(edge.uuid);
              expect(edge.uuid).toBe(addEdgeRes.data.edgeId);
              expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
              expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
              expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
              // Remove edge
              const removeEdgeRes = graph_manager.removeEdge(
                graph.uuid,
                anchorBRes.data.anchorUUID,
                1
              );
              expect(removeEdgeRes.status).toBe("success");
              if (removeEdgeRes.status === "success") {
                expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeUndefined();
                expect(graph.getEdgeSrc[anchorBRes.data.anchorUUID]).toBeUndefined();
                // Undo - Add Edge Back
                const undoRes = graph_manager.undoEvent(graph.uuid);
                expect(undoRes.status).toBe("success");
                // Edge should be added
                const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
                expect(edge).toBeDefined();
                expect(graph.getEdgeDest[anchorBRes.data.anchorUUID].uuid).toBe(edge.uuid);
                expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
                expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
                expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
                // Redo - Remove Edge
                const redoRes = graph_manager.redoEvent(graph.uuid);
                expect(redoRes.status).toBe("success");
                if (redoRes.status === "success") {
                  expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeUndefined();
                  expect(graph.getEdgeDest[anchorBRes.data.anchorUUID]).toBeUndefined();
                }
              }
            }
          }
        }
      }
    }
  });

  test("Remove nodeA with edges", () => {
    const pos = { x: 0, y: 0 };
    const addNodeARes = graph_manager.addNode(graph.uuid, nodeA, pos, 1);
    const addNodeBRes = graph_manager.addNode(graph.uuid, nodeB, pos, 1);

    expect(addNodeARes.status).toBe("success");
    expect(addNodeARes.data).toBeDefined();
    expect(addNodeBRes.status).toBe("success");
    expect(addNodeBRes.data).toBeDefined();
    if (addNodeARes.status === "success" && addNodeBRes.status === "success") {
      expect(addNodeARes.data).toBeDefined();
      expect(addNodeBRes.data).toBeDefined();
      if (addNodeARes.data && addNodeBRes.data) {
        const nodes = graph.getNodes;
        const anchorARes = nodes[addNodeARes.data.nodeId].findAnchorUUID("outA");
        const anchorBRes = nodes[addNodeBRes.data.nodeId].findAnchorUUID("inB");
        expect(anchorARes.status).toBe("success");
        expect(anchorBRes.status).toBe("success");
        if (anchorARes.status === "success" && anchorBRes.status === "success") {
          expect(anchorARes.data).toBeDefined();
          expect(anchorBRes.data).toBeDefined();
          if (anchorARes.data && anchorBRes.data) {
            // Add edge
            const addEdgeRes = graph_manager.addEdge(
              graph.uuid,
              anchorARes.data.anchorUUID,
              anchorBRes.data.anchorUUID,
              1
            );
            expect(addEdgeRes.status).toBe("success");
            if (addEdgeRes.status === "success" && addEdgeRes.data) {
              // Edge should be added
              const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
              expect(edge).toBeDefined();
              expect(graph.getEdgeDest[anchorBRes.data.anchorUUID].uuid).toBe(edge.uuid);
              expect(edge.uuid).toBe(addEdgeRes.data.edgeId);
              expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
              expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
              expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
              // Remove Node
              const removeNodeRes = graph_manager.removeNode(
                graph.uuid,
                addNodeARes.data.nodeId,
                1
              );
              expect(removeNodeRes.status).toBe("success");
              if (removeNodeRes.status === "success") {
                // Node Should be removed
                expect(graph.getNodes[addNodeARes.data.nodeId]).toBeUndefined();
                expect(Object.keys(graph.getNodes).length).toBe(1);
                // Edge should be removed
                expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeUndefined();
                expect(graph.getEdgeDest[anchorBRes.data.anchorUUID]).toBeUndefined();
                // Undo - Add node and its edges
                const undoRes = graph_manager.undoEvent(graph.uuid);
                expect(undoRes.status).toBe("success");
                if (undoRes.status === "success") {
                  // Check for node
                  const newNode =
                    Object.keys(graph.getNodes)[0] === addNodeBRes.data.nodeId
                      ? Object.values(graph.getNodes)[1]
                      : Object.values(graph.getNodes)[0];
                  expect(newNode).toBeDefined();
                  expect(newNode.getName).toBe("Node-A");
                  const newAnchorA = newNode.findAnchorUUID("outA");
                  expect(newAnchorA.status).toBe("success");
                  if (newAnchorA.status === "success") {
                    expect(newAnchorA.data).toBeDefined();
                    if (newAnchorA.data) {
                      // Check for edge
                      expect(graph.getEdgeSrc[newAnchorA.data.anchorUUID]).toBeDefined();
                      expect(graph.getEdgeSrc[newAnchorA.data.anchorUUID]).toContain(
                        anchorBRes.data.anchorUUID
                      );
                      expect(graph.getEdgeDest[anchorBRes.data.anchorUUID]).toBeDefined();
                      const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
                      expect(edge).toBeDefined();
                      expect(edge.getAnchorFrom).toBe(newAnchorA.data.anchorUUID);
                      expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
                      // Redo - Remove Node and its edges
                      const redoRes = graph_manager.redoEvent(graph.uuid);
                      expect(redoRes.status).toBe("success");
                      if (redoRes.status === "success") {
                        // Node should be removed
                        expect(graph.getNodes[newNode.uuid]).toBeUndefined();
                        expect(Object.keys(graph.getNodes).length).toBe(1);
                        // Edge should be removed
                        expect(graph.getEdgeSrc[newAnchorA.data.anchorUUID]).toBeUndefined();
                        expect(graph.getEdgeDest[anchorBRes.data.anchorUUID]).toBeUndefined();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  test("Remove nodeB with edges", () => {
    const pos = { x: 0, y: 0 };
    const addNodeARes = graph_manager.addNode(graph.uuid, nodeA, pos, 1);
    const addNodeBRes = graph_manager.addNode(graph.uuid, nodeB, pos, 1);

    expect(addNodeARes.status).toBe("success");
    expect(addNodeARes.data).toBeDefined();
    expect(addNodeBRes.status).toBe("success");
    expect(addNodeBRes.data).toBeDefined();
    if (addNodeARes.status === "success" && addNodeBRes.status === "success") {
      expect(addNodeARes.data).toBeDefined();
      expect(addNodeBRes.data).toBeDefined();
      if (addNodeARes.data && addNodeBRes.data) {
        const nodes = graph.getNodes;
        const anchorARes = nodes[addNodeARes.data.nodeId].findAnchorUUID("outA");
        const anchorBRes = nodes[addNodeBRes.data.nodeId].findAnchorUUID("inB");
        expect(anchorARes.status).toBe("success");
        expect(anchorBRes.status).toBe("success");
        if (anchorARes.status === "success" && anchorBRes.status === "success") {
          expect(anchorARes.data).toBeDefined();
          expect(anchorBRes.data).toBeDefined();
          if (anchorARes.data && anchorBRes.data) {
            // Add edge
            const addEdgeRes = graph_manager.addEdge(
              graph.uuid,
              anchorARes.data.anchorUUID,
              anchorBRes.data.anchorUUID,
              1
            );
            expect(addEdgeRes.status).toBe("success");
            if (addEdgeRes.status === "success" && addEdgeRes.data) {
              // Edge should be added
              const edge = graph.getEdgeDest[anchorBRes.data.anchorUUID];
              expect(edge).toBeDefined();
              expect(graph.getEdgeDest[anchorBRes.data.anchorUUID].uuid).toBe(edge.uuid);
              expect(edge.uuid).toBe(addEdgeRes.data.edgeId);
              expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
              expect(edge.getAnchorTo).toBe(anchorBRes.data.anchorUUID);
              expect(graph.getEdgeSrc[edge.getAnchorFrom]).toContain(edge.getAnchorTo);
              // Remove Node
              const removeNodeRes = graph_manager.removeNode(
                graph.uuid,
                addNodeBRes.data.nodeId,
                1
              );
              expect(removeNodeRes.status).toBe("success");
              if (removeNodeRes.status === "success") {
                // Node Should be removed
                expect(graph.getNodes[addNodeBRes.data.nodeId]).toBeUndefined();
                expect(Object.keys(graph.getNodes).length).toBe(1);
                // Edge should be removed
                expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeUndefined();
                expect(graph.getEdgeDest[anchorBRes.data.anchorUUID]).toBeUndefined();
                // Undo - Add node and its edges
                const undoRes = graph_manager.undoEvent(graph.uuid);
                expect(undoRes.status).toBe("success");
                if (undoRes.status === "success") {
                  // Check for node
                  const newNode =
                    Object.keys(graph.getNodes)[0] === addNodeARes.data.nodeId
                      ? Object.values(graph.getNodes)[1]
                      : Object.values(graph.getNodes)[0];
                  expect(newNode).toBeDefined();
                  expect(newNode.getName).toBe("Node-B");
                  const newAnchorB = newNode.findAnchorUUID("inB");
                  expect(newAnchorB.status).toBe("success");
                  if (newAnchorB.status === "success") {
                    expect(newAnchorB.data).toBeDefined();
                    if (newAnchorB.data) {
                      // Check for edge
                      expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeDefined();
                      expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toContain(
                        newAnchorB.data.anchorUUID
                      );
                      expect(graph.getEdgeDest[newAnchorB.data.anchorUUID]).toBeDefined();
                      const edge = graph.getEdgeDest[newAnchorB.data.anchorUUID];
                      expect(edge).toBeDefined();
                      expect(edge.getAnchorFrom).toBe(anchorARes.data.anchorUUID);
                      expect(edge.getAnchorTo).toBe(newAnchorB.data.anchorUUID);
                      // Redo - Remove Node and its edges
                      const redoRes = graph_manager.redoEvent(graph.uuid);
                      expect(redoRes.status).toBe("success");
                      if (redoRes.status === "success") {
                        // Node should be removed
                        expect(graph.getNodes[newNode.uuid]).toBeUndefined();
                        expect(Object.keys(graph.getNodes).length).toBe(1);
                        // Edge should be removed
                        expect(graph.getEdgeSrc[anchorARes.data.anchorUUID]).toBeUndefined();
                        expect(graph.getEdgeDest[newAnchorB.data.anchorUUID]).toBeUndefined();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });


});
