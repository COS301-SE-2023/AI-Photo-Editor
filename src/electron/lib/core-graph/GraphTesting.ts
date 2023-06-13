// == DEV == //
import { CoreGraph } from "./Graph";
import { InputAnchorInstance, OutputAnchorInstance, NodeInstance } from "./ToolboxRegistry";

import logger from "../../utils/logger";

export function testGraph() {
  // Create Node
  const inputs: InputAnchorInstance[] = [];
  const outputs: OutputAnchorInstance[] = [];
  inputs.push(
    new InputAnchorInstance("number", "signature", "input_anchor1"),
    new InputAnchorInstance("number", "signature", "input_anchor2")
  );
  outputs.push(
    new OutputAnchorInstance("number", "signature", "output_anchor1"),
    new OutputAnchorInstance("number", "signature", "output_anchor2")
  );

  const tempNodes: NodeInstance[] = [];
  for (let i = 0; i < 6; i++) {
    tempNodes.push(
      new NodeInstance(`hello-plugin/node${i}`, `node${i}`, `node${i}`, `node${i}`, inputs, outputs)
    );
  }

  // =====================================
  // 1 -> 2
  // 2 -> 3
  // Add 3 -> 1 = Cycle
  // =====================================

  const g1: CoreGraph = new CoreGraph();

  g1.addNode(tempNodes[0]);
  g1.addNode(tempNodes[1]);
  g1.addNode(tempNodes[2]);

  const nodes = g1.getNodes;
  const actualNode1 = Object.values(nodes)[0];
  const actualNode2 = Object.values(nodes)[1];
  const actualNode3 = Object.values(nodes)[2];

  logger.info(
    g1.addEdge(
      Object.values(actualNode1.getAnchors)[2].getUUID,
      Object.values(actualNode2.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g1.addEdge(
      Object.values(actualNode2.getAnchors)[2].getUUID,
      Object.values(actualNode3.getAnchors)[0].getUUID
    )
  );
  // Add defective edge
  logger.info(
    g1.addEdge(
      Object.values(actualNode3.getAnchors)[2].getUUID,
      Object.values(actualNode1.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // No cycle detected
  // true
  // No cycle detected
  // true
  // Cycle detected!
  // false

  // =====================================

  logger.info("\n");

  // =====================================
  // 1 -> 2
  // 1 -> 3
  // 3 -> 4
  // 4 -> 6
  // 5 -> 6
  // 2 -> 5 = No Cycle
  // =====================================

  const g2: CoreGraph = new CoreGraph();

  g2.addNode(tempNodes[0]);
  g2.addNode(tempNodes[1]);
  g2.addNode(tempNodes[2]);
  g2.addNode(tempNodes[3]);
  g2.addNode(tempNodes[4]);
  g2.addNode(tempNodes[5]);

  const g2Nodes = g2.getNodes;
  const g2Node1 = Object.values(g2Nodes)[0];
  const g2Node2 = Object.values(g2Nodes)[1];
  const g2Node3 = Object.values(g2Nodes)[2];
  const g2Node4 = Object.values(g2Nodes)[3];
  const g2Node5 = Object.values(g2Nodes)[4];
  const g2Node6 = Object.values(g2Nodes)[5];

  logger.info(
    g2.addEdge(
      Object.values(g2Node1.getAnchors)[2].getUUID,
      Object.values(g2Node2.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g2.addEdge(
      Object.values(g2Node1.getAnchors)[2].getUUID,
      Object.values(g2Node3.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g2.addEdge(
      Object.values(g2Node3.getAnchors)[2].getUUID,
      Object.values(g2Node4.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g2.addEdge(
      Object.values(g2Node4.getAnchors)[2].getUUID,
      Object.values(g2Node6.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g2.addEdge(
      Object.values(g2Node5.getAnchors)[2].getUUID,
      Object.values(g2Node6.getAnchors)[0].getUUID
    )
  );

  // Add non-defective edge
  logger.info(
    g2.addEdge(
      Object.values(g2Node2.getAnchors)[2].getUUID,
      Object.values(g2Node5.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true

  // =====================================

  logger.info("\n");

  // =====================================
  // 1 -> 2 / anchor 1
  // 1 -> 2 / anchor 2
  // 2 -> 1 = Cycle
  // =====================================

  const g3: CoreGraph = new CoreGraph();

  g3.addNode(tempNodes[0]);
  g3.addNode(tempNodes[1]);

  const g3Nodes = g3.getNodes;
  const g3Node1 = Object.values(g3Nodes)[0];
  const g3Node2 = Object.values(g3Nodes)[1];

  logger.info(
    g3.addEdge(
      Object.values(g3Node1.getAnchors)[2].getUUID,
      Object.values(g3Node2.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g3.addEdge(
      Object.values(g3Node1.getAnchors)[3].getUUID,
      Object.values(g3Node2.getAnchors)[1].getUUID
    )
  );
  // Add defective edge
  logger.info(
    g3.addEdge(
      Object.values(g3Node2.getAnchors)[2].getUUID,
      Object.values(g3Node1.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // No cycle detected
  // true
  // No cycle detected
  // true
  // Cycle detected!
  // false

  // =====================================

  logger.info("\n");

  // =====================================
  // 1 -> 2 / anchor 1
  // 1 -> 2 / anchor 1
  // 2 -> 1 = Cycle
  // =====================================

  const g4: CoreGraph = new CoreGraph();

  g4.addNode(tempNodes[0]);
  g4.addNode(tempNodes[1]);

  const g4Nodes = g4.getNodes;
  const g4Node1 = Object.values(g4Nodes)[0];
  const g4Node2 = Object.values(g4Nodes)[1];

  logger.info(
    g4.addEdge(
      Object.values(g4Node1.getAnchors)[2].getUUID,
      Object.values(g4Node2.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g4.addEdge(
      Object.values(g4Node1.getAnchors)[2].getUUID,
      Object.values(g4Node2.getAnchors)[1].getUUID
    )
  );
  // Add defective edge
  logger.info(
    g4.addEdge(
      Object.values(g4Node2.getAnchors)[2].getUUID,
      Object.values(g4Node1.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // No cycle detected
  // true
  // No cycle detected
  // true
  // Cycle detected!
  // false

  // =====================================

  logger.info("\n");

  // =====================================
  // 1 -> 1 = Cycle
  // =====================================

  const g5: CoreGraph = new CoreGraph();

  g5.addNode(tempNodes[0]);

  const g5Nodes = g5.getNodes;
  const g5Node1 = Object.values(g5Nodes)[0];

  logger.info(
    g5.addEdge(
      Object.values(g5Node1.getAnchors)[2].getUUID,
      Object.values(g5Node1.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // Cycle detected!
  // false

  // =====================================

  logger.info("\n");

  // =====================================
  // 2 -> 3
  // 3 -> 4
  // 3 -> 1
  // 4 -> 1
  // 4 -> 5
  // 5 -> 1
  // 1 -> 2 = Cycle
  // =====================================

  const g6: CoreGraph = new CoreGraph();

  g6.addNode(tempNodes[0]);
  g6.addNode(tempNodes[1]);
  g6.addNode(tempNodes[2]);
  g6.addNode(tempNodes[3]);
  g6.addNode(tempNodes[4]);

  const g6Nodes = g6.getNodes;
  const g6Node1 = Object.values(g6Nodes)[0];
  const g6Node2 = Object.values(g6Nodes)[1];
  const g6Node3 = Object.values(g6Nodes)[2];
  const g6Node4 = Object.values(g6Nodes)[3];
  const g6Node5 = Object.values(g6Nodes)[4];

  logger.info(
    g6.addEdge(
      Object.values(g6Node2.getAnchors)[2].getUUID,
      Object.values(g6Node3.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g6.addEdge(
      Object.values(g6Node3.getAnchors)[2].getUUID,
      Object.values(g6Node4.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g6.addEdge(
      Object.values(g6Node3.getAnchors)[2].getUUID,
      Object.values(g6Node1.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g6.addEdge(
      Object.values(g6Node4.getAnchors)[2].getUUID,
      Object.values(g6Node1.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g6.addEdge(
      Object.values(g6Node4.getAnchors)[2].getUUID,
      Object.values(g6Node5.getAnchors)[0].getUUID
    )
  );
  logger.info(
    g6.addEdge(
      Object.values(g6Node5.getAnchors)[2].getUUID,
      Object.values(g6Node1.getAnchors)[0].getUUID
    )
  );
  // Add defective edge
  logger.info(
    g6.addEdge(
      Object.values(g6Node1.getAnchors)[2].getUUID,
      Object.values(g6Node2.getAnchors)[0].getUUID
    )
  );

  // Expected output:
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // No cycle detected
  // true
  // Cycle detected!
  // false

  // =====================================
}
