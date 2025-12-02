
export interface Node {
  id: string;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  status: 'default' | 'current' | 'accepted' | 'rejected';
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface LogStep {
  message: string;
  edgeId?: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export type ViewState = 'home' | 'visualizer' | 'pseudocode' | 'code' | 'complexity' | 'practice';
