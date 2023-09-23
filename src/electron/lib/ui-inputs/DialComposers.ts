// Dial components are special readonly UI inputs that provide plugins
// special access to certain internal structures within Blix.

import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { INodeUIInputs, NodeDiffData, NodeTweakData } from "../../../shared/types";
import { NodeUI, NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../shared/ui/NodeUITypes";

type Composer<T> = (deps: ComposerDependencies, leaf: NodeUILeaf) => T;

export type ComposerDependencies = {
  nodeUUID: UUID;
  uiInputs: string[];
  uiInputChanges: string[];
};

// This dict defines how all dial UI inputs are initialized
const composers: { [key in NodeUIComponent]?: Composer<any> } = {
  TweakDial: (deps: ComposerDependencies) => {
    return {
      nodeUUID: deps.nodeUUID,
      inputs: deps.uiInputs,
    } as NodeTweakData;
  },
  DiffDial: (deps: ComposerDependencies) => {
    return {
      uiInputs: [],
      anchors: {},
    } as NodeDiffData;
  },
};

export type PopulateDialsResult = {
  dials: { [key: string]: NodeUIComponent };
  filledInputs: { [key: string]: any };
};
const EMPTYPOPULATEDIALSRESULT = { dials: {}, filledInputs: {} };

// Recursively initialize special data-provider UI inputs
export function populateDials(
  ui: NodeUI | null,
  dependencies: ComposerDependencies
): PopulateDialsResult {
  if (!ui) return EMPTYPOPULATEDIALSRESULT;

  if (ui.type === "parent") {
    let res = EMPTYPOPULATEDIALSRESULT;
    for (const child of ui.params) {
      const { dials: childDials, filledInputs: childFilledInputs } = populateDials(
        child as NodeUIParent,
        dependencies
      );
      // res = { ...res, ...populateDials(child as NodeUIParent, dependencies) };
      res = {
        dials: { ...res.dials, ...childDials },
        filledInputs: { ...res.filledInputs, ...childFilledInputs },
      };
    }
    return res;
  } else if (ui.type === "leaf") {
    const leafUI = ui as NodeUILeaf;

    const init = composers[leafUI.category];
    if (!init) return EMPTYPOPULATEDIALSRESULT;

    return {
      dials: { [leafUI.label]: leafUI.category },
      filledInputs: { [leafUI.label]: init(dependencies, leafUI) },
    };
  }

  return EMPTYPOPULATEDIALSRESULT;
}

export function getDialUpdatesOnUIInputsChanged(
  nodeUIInputs: INodeUIInputs,
  dials: { [key: string]: NodeUIComponent }
) {
  const res: { [key: string]: any } = {};
  const dialIds = Object.keys(dials);
  const changes = nodeUIInputs.changes.filter((change) => !dialIds.includes(change));

  dialIds.forEach((id) => {
    if (dials[id] === NodeUIComponent.DiffDial) {
      res[id] = { uiInputs: changes, anchors: {} } as NodeDiffData;
    }
  });

  return res;
}
