export type NodeTweakData = {
  nodeUUID: string;
  inputs: string[];
};

export type NodeDiffData = {
  uiInputs: string[];
  anchors: { [key: string]: "connection" | "value" }; // anchorId -> changeType
};
