// == DEV == //
import { CoreGraph, GraphToJSON } from "./Graph";
import { InputAnchorInstance, NodeInstance, OutputAnchorInstance } from "./ToolboxRegistry";

import logger from "../../utils/logger";

export class TestGraph {
  inputs: InputAnchorInstance[] = [];
  outputs: OutputAnchorInstance[] = [];
  tempNodes: NodeInstance[] = [];

  constructor() {
    this.inputs.push(
      new InputAnchorInstance("number", "signature", "input_anchor1"),
      new InputAnchorInstance("number", "signature", "input_anchor2"),
      new InputAnchorInstance("number", "signature", "input_anchor3")
    );
    this.outputs.push(
      new OutputAnchorInstance("number", "signature", "output_anchor1"),
      new OutputAnchorInstance("number", "signature", "output_anchor2")
    );

    // for (let i = 1; i < 7; i++) {
    //   this.tempNodes.push(
    // new NodeInstance(
    //   `hello-plugin/node${i}`,
    //   `node${i}`,
    //   `node${i}`,
    //   `node${i}`,
    //   this.inputs,
    //   this.outputs
    // )
    //   );
    // }
  }

  public test1() {
    // =====================================
    // 1 -> 2
    // 2 -> 3
    // Add 3 -> 1 = Cycle
    // =====================================

    const g1: CoreGraph = new CoreGraph();

    g1.addNode(this.tempNodes[0]);
    g1.addNode(this.tempNodes[1]);
    g1.addNode(this.tempNodes[2]);

    const nodes = g1.getNodes;
    const actualNode1 = Object.values(nodes)[0];
    const actualNode2 = Object.values(nodes)[1];
    const actualNode3 = Object.values(nodes)[2];

    logger.info(
      g1.addEdge(
        Object.values(actualNode1.getAnchors)[3].uuid,
        Object.values(actualNode2.getAnchors)[0].uuid
      )
    );
    logger.info(
      g1.addEdge(
        Object.values(actualNode2.getAnchors)[3].uuid,
        Object.values(actualNode3.getAnchors)[0].uuid
      )
    );
    // Add defective edge
    logger.info(
      g1.addEdge(
        Object.values(actualNode3.getAnchors)[3].uuid,
        Object.values(actualNode1.getAnchors)[0].uuid
      )
    );

    // Expected output:
    // No cycle detected
    // true
    // No cycle detected
    // true
    // Cycle detected!
    // false

    const json: GraphToJSON = g1.toJSONObject();
    logger.info(JSON.stringify(json, null, 2));

    // =====================================

    logger.info("\n");
  }

  public test2() {
    // =====================================
    // 1 -> 2
    // 1 -> 3
    // 3 -> 4
    // 4 -> 6
    // 5 -> 6
    // 2 -> 5 = No Cycle
    // =====================================

    const g2: CoreGraph = new CoreGraph();

    g2.addNode(this.tempNodes[0]);
    g2.addNode(this.tempNodes[1]);
    g2.addNode(this.tempNodes[2]);
    g2.addNode(this.tempNodes[3]);
    g2.addNode(this.tempNodes[4]);
    g2.addNode(this.tempNodes[5]);

    const g2Nodes = g2.getNodes;
    const g2Node1 = Object.values(g2Nodes)[0];
    const g2Node2 = Object.values(g2Nodes)[1];
    const g2Node3 = Object.values(g2Nodes)[2];
    const g2Node4 = Object.values(g2Nodes)[3];
    const g2Node5 = Object.values(g2Nodes)[4];
    const g2Node6 = Object.values(g2Nodes)[5];

    logger.info(
      g2.addEdge(
        Object.values(g2Node1.getAnchors)[3].uuid,
        Object.values(g2Node2.getAnchors)[0].uuid
      )
    );
    logger.info(
      g2.addEdge(
        Object.values(g2Node1.getAnchors)[3].uuid,
        Object.values(g2Node3.getAnchors)[0].uuid
      )
    );
    logger.info(
      g2.addEdge(
        Object.values(g2Node3.getAnchors)[3].uuid,
        Object.values(g2Node4.getAnchors)[0].uuid
      )
    );
    logger.info(
      g2.addEdge(
        Object.values(g2Node4.getAnchors)[3].uuid,
        Object.values(g2Node6.getAnchors)[0].uuid
      )
    );
    logger.info(
      g2.addEdge(
        Object.values(g2Node5.getAnchors)[3].uuid,
        Object.values(g2Node6.getAnchors)[0].uuid
      )
    );

    // Add non-defective edge
    logger.info(
      g2.addEdge(
        Object.values(g2Node2.getAnchors)[3].uuid,
        Object.values(g2Node5.getAnchors)[0].uuid
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
  }

  public test3() {
    // =====================================

    // 1 -> 2 / anchor 1
    // 1 -> 2 / anchor 2
    // 2 -> 1 = Cycle
    // =====================================

    const g3: CoreGraph = new CoreGraph();

    g3.addNode(this.tempNodes[0]);
    g3.addNode(this.tempNodes[1]);

    const g3Nodes = g3.getNodes;
    const g3Node1 = Object.values(g3Nodes)[0];
    const g3Node2 = Object.values(g3Nodes)[1];

    logger.info(
      g3.addEdge(
        Object.values(g3Node1.getAnchors)[3].uuid,
        Object.values(g3Node2.getAnchors)[0].uuid
      )
    );
    logger.info(
      g3.addEdge(
        Object.values(g3Node1.getAnchors)[4].uuid,
        Object.values(g3Node2.getAnchors)[1].uuid
      )
    );
    // Add defective edge
    logger.info(
      g3.addEdge(
        Object.values(g3Node2.getAnchors)[3].uuid,
        Object.values(g3Node1.getAnchors)[0].uuid
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
  }

  public test4() {
    // =====================================
    // 1 -> 2 / anchor 1
    // 1 -> 2 / anchor 1
    // 2 -> 1 = Cycle
    // =====================================

    const g4: CoreGraph = new CoreGraph();

    g4.addNode(this.tempNodes[0]);
    g4.addNode(this.tempNodes[1]);

    const g4Nodes = g4.getNodes;
    const g4Node1 = Object.values(g4Nodes)[0];
    const g4Node2 = Object.values(g4Nodes)[1];

    logger.info(
      g4.addEdge(
        Object.values(g4Node1.getAnchors)[3].uuid,
        Object.values(g4Node2.getAnchors)[0].uuid
      )
    );
    logger.info(
      g4.addEdge(
        Object.values(g4Node1.getAnchors)[3].uuid,
        Object.values(g4Node2.getAnchors)[1].uuid
      )
    );
    // Add defective edge
    logger.info(
      g4.addEdge(
        Object.values(g4Node2.getAnchors)[3].uuid,
        Object.values(g4Node1.getAnchors)[0].uuid
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
  }

  public test5() {
    // =====================================
    // 1 -> 1 = Cycle
    // =====================================

    const g5: CoreGraph = new CoreGraph();

    g5.addNode(this.tempNodes[0]);

    const g5Nodes = g5.getNodes;
    const g5Node1 = Object.values(g5Nodes)[0];

    logger.info(
      g5.addEdge(
        Object.values(g5Node1.getAnchors)[3].uuid,
        Object.values(g5Node1.getAnchors)[0].uuid
      )
    );

    // Expected output:
    // Cycle detected!
    // false

    // =====================================

    logger.info("\n");
  }

  public test6() {
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

    g6.addNode(this.tempNodes[0]);
    g6.addNode(this.tempNodes[1]);
    g6.addNode(this.tempNodes[2]);
    g6.addNode(this.tempNodes[3]);
    g6.addNode(this.tempNodes[4]);

    const g6Nodes = g6.getNodes;
    const g6Node1 = Object.values(g6Nodes)[0];
    const g6Node2 = Object.values(g6Nodes)[1];
    const g6Node3 = Object.values(g6Nodes)[2];
    const g6Node4 = Object.values(g6Nodes)[3];
    const g6Node5 = Object.values(g6Nodes)[4];

    logger.info(
      g6.addEdge(
        Object.values(g6Node2.getAnchors)[3].uuid,
        Object.values(g6Node3.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node4.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node5.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node5.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[0].uuid
      )
    );
    // Add defective edge
    logger.info(
      g6.addEdge(
        Object.values(g6Node1.getAnchors)[3].uuid,
        Object.values(g6Node2.getAnchors)[0].uuid
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
  }

  public test7() {
    // =====================================

    // Testing removing edges

    // =====================================

    const g6: CoreGraph = new CoreGraph();

    g6.addNode(this.tempNodes[0]);
    g6.addNode(this.tempNodes[1]);
    g6.addNode(this.tempNodes[2]);
    g6.addNode(this.tempNodes[3]);
    g6.addNode(this.tempNodes[4]);

    const g6Nodes = g6.getNodes;
    const g6Node1 = Object.values(g6Nodes)[0];
    const g6Node2 = Object.values(g6Nodes)[1];
    const g6Node3 = Object.values(g6Nodes)[2];
    const g6Node4 = Object.values(g6Nodes)[3];
    const g6Node5 = Object.values(g6Nodes)[4];

    logger.info(
      g6.addEdge(
        Object.values(g6Node2.getAnchors)[3].uuid,
        Object.values(g6Node3.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node4.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[1].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node5.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node5.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[2].uuid
      )
    );

    // const edges = g6.getEdgeDest;
    // const edges2 = g6.getEdgeSrc;
    // for(const key in edges){
    //   logger.info(key);
    // }
    logger.info(`Length Dest: ${Object.values(g6.getEdgeDest).length}`);
    logger.info(`Length Src: ${Object.values(g6.getEdgeSrc).length}`);
    // const edge1 = Object.values(edges)[0].getAnchorTo;
    // const edge2 = Object.values(edges)[1].getAnchorTo;
    // const edge3 = Object.values(edges)[2].getAnchorTo;
    // const edge4 = Object.values(edges)[3].getAnchorTo;
    // const edge5 = Object.values(edges)[4].getAnchorTo;
    // const edge6 = Object.values(edges)[5].getAnchorTo;

    // logger.info(g6.removeEdge(edge3));
    // logger.info(g6.removeEdge(edge4));
    // logger.info(g6.removeEdge(edge6));

    logger.info(`Length Dest: ${Object.values(g6.getEdgeDest).length}`);
    logger.info(`Length Src: ${Object.values(g6.getEdgeSrc).length}`);

    // const edges2 = g6.getEdgeDest;
    // for(const key in edges2){
    //   logger.info(key);
    // }
  }

  public test8() {
    // =====================================

    // Testing removing nodes

    // =====================================

    const g6: CoreGraph = new CoreGraph();

    g6.addNode(this.tempNodes[0]);
    g6.addNode(this.tempNodes[1]);
    g6.addNode(this.tempNodes[2]);
    g6.addNode(this.tempNodes[3]);
    g6.addNode(this.tempNodes[4]);

    const g6Nodes = g6.getNodes;
    const g6Node1 = Object.values(g6Nodes)[0];
    const g6Node2 = Object.values(g6Nodes)[1];
    const g6Node3 = Object.values(g6Nodes)[2];
    const g6Node4 = Object.values(g6Nodes)[3];
    const g6Node5 = Object.values(g6Nodes)[4];

    logger.info(
      g6.addEdge(
        Object.values(g6Node2.getAnchors)[3].uuid,
        Object.values(g6Node3.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node4.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node3.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[1].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node4.getAnchors)[3].uuid,
        Object.values(g6Node5.getAnchors)[0].uuid
      )
    );
    logger.info(
      g6.addEdge(
        Object.values(g6Node5.getAnchors)[3].uuid,
        Object.values(g6Node1.getAnchors)[2].uuid
      )
    );

    // const edges = g6.getEdgeDest;
    // const edges2 = g6.getEdgeSrc;

    // const edge1 = Object.values(edges)[2].getAnchorTo;

    logger.info("\n");

    // for(const node in g6.getNodes){
    //   logger.info(g6.getNodes[node].getName)
    //   logger.info(g6.getNodes[node].getAnchors)
    //   logger.info("\n")
    // }

    // for(const edge in g6.getEdgeSrc) {
    //   for(const item in g6.getEdgeSrc[edge]){
    //     logger.info("From:" + edge)
    //     logger.info("To: " + g6.getEdgeSrc[edge][item])
    //   }
    //   logger.info("\n")

    // }

    // for(const edge in g6.getEdgeDest){
    //   logger.info(g6.getEdgeDest[edge].getAnchorTo)
    // }

    // const temp = g6.getNodes;
    // const nodeToDelete = Object.values(temp)[0]; // node4

    // for(const node in g6.getNodes){
    //   logger.info(g6.getNodes[node].getName)
    //   logger.info(g6.getNodes[node].getAnchors)
    //   logger.info("\n")
    // }

    // g6.removeNode(nodeToDelete.uuid);

    // const edges = g6.getEdgeDest;
    // const edge6 = Object.values(edges)[5].getAnchorTo;
    // logger.info(g6.removeEdge(edge6));

    // logger.info(`Length Dest: ${Object.values(g6.getEdgeDest).length}`);
    // logger.info(`Length Src: ${Object.values(g6.getEdgeSrc).length}`);
    // logger.info(`Length Node: ${Object.values(g6.getNodes).length}`);

    // for(const node in g6.getNodes){
    //   logger.info(g6.getNodes[node].getName)
    //   logger.info(g6.getNodes[node].getAnchors)
    //   logger.info("\n")
    // }

    // const ancs = g6.getAnchors;
    // logger.info(Object.values(g6.getAnchors).length);

    // for(const node in g6.getNodes){
    //   logger.info(g6.getNodes[node].getName)
    //   logger.info(g6.getNodes[node].getAnchors)
    //   logger.info("\n")
    // }

    // for(const edge in g6.getEdgeSrc) {
    //   for(const item in g6.getEdgeSrc[edge]){
    //     logger.info("From:" + edge)
    //     logger.info("To: " + g6.getEdgeSrc[edge][item])
    //   }
    //   logger.info("\n")

    // }

    // for(const edge in g6.getEdgeDest){
    //   logger.info(g6.getEdgeDest[edge].getAnchorTo)
    // }

    // logger.info(Object.values(g6.getAnchors).length)

    // for(const node in g6.getNodes){
    //   logger.info(g6.getNodes[node].getName)
    //   logger.info(g6.getNodes[node].getAnchors)
    //   logger.info("\n")
    // }

    // logger.info(g6.getEdgeDest)

    // const nodes = g6.getNodes;
    // for(const node in g6.getNodes){
    //   logger.info(nodes[node].getName)
    // }

    // const src = g6.getEdgeSrc;
    // logger.info(src);

    const json: GraphToJSON = g6.toJSONObject();
    logger.info(JSON.stringify(json, null, 2));
  }

  public main() {
    // this.test1();
    // this.test2();
    // this.test3();
    // this.test4();
    // this.test5();
    // this.test6();
    // this.test7();
    this.test8();
  }
}
