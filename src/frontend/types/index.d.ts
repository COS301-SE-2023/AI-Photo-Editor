export interface GraphStore {
  nodes: GraphNode[];
}

export interface GraphNode {
  id: string;
  name: string;
  slider: GraphSlider | null;
}

export interface GraphSlider {
  min: number;
  max: number;
  step: number;
  fixed: number;
  value: number;
}
