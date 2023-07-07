import { CoreGraph, Node, Anchor, AnchorIO } from "./CoreGraph";
import { TestGraph } from "./CoreGraphTesting";
import logger from "./../../utils/logger";

class Monad<T> {
  private value: T;

  private constructor(value: T) {
    this.value = value;
  }

  static of<T>(value: T): Monad<T> {
    return new Monad<T>(value);
  }

  bind<U>(fn: (value: T) => Monad<U>): Monad<U> {
    return fn(this.value);
  }

  getValue(): T {
    return this.value;
  }
}

export class CoreGraphInterpreter {
  private coreGraph: CoreGraph;
  private monads: { [key: string]: Monad<number> } = {};
  private context: { [key: string]: any };

  // constructor(coreGraph: CoreGraph){
  //     this.coreGraph = coreGraph;
  // }

  public run() {
    const test = new TestGraph();
    this.coreGraph = test.interpreterTest();
    // Need to add all output nodes to a list and iterate through them.
    this.monads.first = this.traverse(this.coreGraph.getNodes[this.coreGraph.getOutputNodes[0]], 0);
    this.monads.second = this.traverse(
      this.coreGraph.getNodes[this.coreGraph.getOutputNodes[1]],
      0
    );

    logger.info(this.monads.first.getValue());
    logger.info(this.monads.second.getValue());
    // const monad = Monad.of("hello");
    // const newMonad = monad.bind((value) => Monad.of(value + "bey"));
    // console.log(newMonad.getValue());
    //
    // const anotherMonad = monad.bind((value) => newMonad.bind((value2) => Monad.of(value + value2)));
    // console.log(anotherMonad.getValue());
  }

  public traverse<T>(curr: Node, input: T): Monad<T> {
    // For each anchor in the current node
    const currMonad = Monad.of(curr.execute(input));

    for (const anchor in curr.getAnchors) {
      // Only check input anchors
      if (this.coreGraph.getAnchors[anchor].getIOType !== AnchorIO.output) {
        if (anchor in this.coreGraph.getEdgeDest) {
          // Bind the next monad to curr
          return currMonad.bind((value) =>
            this.traverse(
              this.coreGraph.getAnchors[this.coreGraph.getEdgeDest[anchor].getAnchorFrom].getParent,
              value
            )
          );
        }
      }
    }
    // Last node / monad in the chain
    return currMonad;
  }
}
