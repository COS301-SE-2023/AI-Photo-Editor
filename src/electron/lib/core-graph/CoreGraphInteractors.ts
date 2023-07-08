import { UIGraph } from "../../../shared/ui/UIGraph";
import { type UUID } from "../../../shared/utils/UniqueEntity";
import { CoreGraph } from "./CoreGraph";

// Implement this interface to communicate with a CoreGraph instance
export abstract class CoreGraphSubscriber<T> {
  // Index of the subscriber in CoreGraphManager's _subscribers list
  protected _subscriberIndex = -1;
  protected _notifyee?: (graphId: UUID, newGraph: T) => void; // Callback when graph changes

  public set listen(notifyee: (graphId: UUID, newGraph: T) => void) {
    this._notifyee = notifyee;
  }

  public set subscriberIndex(index: number) {
    this._subscriberIndex = index;
  }

  public get subscriberIndex() {
    return this._subscriberIndex;
  }

  // Calls _notifyee with the new graph state
  // Perform representation conversion here (e.g. CoreGraph -> UIGraph)
  abstract onGraphChanged(graphId: UUID, graphData: CoreGraph): void;
}

export abstract class CoreGraphUpdater {
  protected _updaterIndex = -1;
}

export class IPCGraphSubscriber extends CoreGraphSubscriber<UIGraph> {
  onGraphChanged(graphId: UUID, graphData: CoreGraph): void {
    // TODO: Convert graph (is semi-done on frontend/graph)
    const uiGraph: UIGraph = new UIGraph("");
    if (this._notifyee) this._notifyee(graphId, uiGraph);
  }
}
