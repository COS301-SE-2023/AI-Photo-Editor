export type NodeTweakData = {
  nodeUUID: string;
  inputs: string[];
};

export type NodeDiffData = {
  uiInputs: string[];
  anchors: { anchorId: string; change: "connection" | "value" }[];
};
