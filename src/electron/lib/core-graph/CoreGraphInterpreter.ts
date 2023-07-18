import { CoreGraph, Node, Anchor, AnchorIO } from "./CoreGraph";
import { TestGraph } from "./CoreGraphTesting";
import logger from "./../../utils/logger";
import { UUID } from "@shared/utils/UniqueEntity";
import { ToolboxRegistry } from "lib/registries/ToolboxRegistry";

/*
Assumptions:
  - The OutputNode array is already defined and populated. (when adding nodes)
  - Functions in nodes have two parameters: (input: T[], anchor: number) (anchor: which tells the user which anchor is being used sothat the correct value can be returned)
  - Every node returns an array of output values
*/

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
  private toolboxRegistry: ToolboxRegistry;
  private monads: { [key: string]: Monad<number> } = {};
  private context: { [key: string]: any };

  // constructor(coreGraph: CoreGraph){
  //     this.coreGraph = coreGraph;
  // }

  public run() {
    const test = new TestGraph();
    this.coreGraph = test.interpreterTest();

    this.coreGraph.getOutputNodes.forEach((uuid) => {
      try {
        // this.traverse(this.coreGraph.getNodes[uuid], 0).catch((err) => {
        //   logger.error(err);
        // });
      } catch (err) {
        logger.error(err);
      }
    });

    // const monad = Monad.of("hello");
    // const newMonad = monad.bind((value) => Monad.of(value + "bey"));
    // console.log(newMonad.getValue());
    //
    // const anotherMonad = monad.bind((value) => newMonad.bind((value2) => Monad.of(value + value2)));
    // console.log(anotherMonad.getValue());
  }

  // USING MONADS

  // public traverse<T>(curr: Node, input: T): Monad<T> {
  //   // For each anchor in the current node
  //   const currMonad = Monad.of(curr.execute(input));

  //   for (const anchor in curr.getAnchors) {
  //     // Only check input anchors
  //     if (this.coreGraph.getAnchors[anchor].getIOType !== AnchorIO.output) {
  //       if (anchor in this.coreGraph.getEdgeDest) {
  //         // Bind the next monad to curr
  //         return currMonad.bind((value) =>
  //           this.traverse(
  //             this.coreGraph.getAnchors[this.coreGraph.getEdgeDest[anchor].getAnchorFrom].getParent,
  //             value
  //           )
  //         );
  //       }
  //     }
  //   }
  //   // Last node / monad in the chain
  //   return currMonad;
  // }

  // USING PROMISES

  public async traverse<T>(curr: Node, anhcorIn: UUID): Promise<T> {
    const inputPromises: Promise<T>[] = [];

    // Get all input values
    for (const anchor in curr.getAnchors) {
      // Only check input anchors
      if (this.coreGraph.getAnchors[anchor].ioType !== AnchorIO.output) {
        // If input was given
        if (anchor in this.coreGraph.getEdgeDest) {
          inputPromises.push(
            this.traverse(
              this.coreGraph.getAnchors[this.coreGraph.getEdgeDest[anchor].getAnchorFrom].parent,
              this.coreGraph.getAnchors[this.coreGraph.getEdgeDest[anchor].getAnchorFrom].anchorId
            )
          );
        }
      }
    }

    // Resolve all input values (functions)
    const inputs: T[] = await Promise.all(inputPromises).catch((err) => {
      throw err;
    });
    // const output: T = await Promise.resolve(curr.execute(inputs, anhcorIn));
    const output: T = await Promise.resolve(
      this.toolboxRegistry.getNodeInstance(curr.getSignature).func({ inputs, anhcorIn })
    );

    return output;
  }
}
