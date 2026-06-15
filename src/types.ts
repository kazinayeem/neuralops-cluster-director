export type GPU_NodeType = "H100" | "B200" | "A100" | "L40S";

export type GPU_NodeStatus = "OPTIMAL" | "OVERCLOCK" | "HEATING" | "COOLDOWN" | "STABLE" | "MAINTENANCE";

export interface GPU_Node {
  id: number;
  name: string;
  type: GPU_NodeType;
  status: GPU_NodeStatus;
  utilization: number; // %
  temp: number; // °C
  fanSpeed: number; // %
  vramUsed: number; // GB
  vramTotal: number; // GB
  powerDraw: number; // W
  clockSpeed: number; // MHz
  efficiency: number; // FLOPS/W rating (0-100)
  activeTask: string;
  alerts: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  actionsTriggered?: OrchestratorAction[];
  insightsGenerated?: string[];
}

export interface OrchestratorAction {
  type: "REDISTRIBUTE" | "COOL_DOWN" | "OVERCLOCK" | "MAINTENANCE" | "LOAD_SIMULATION" | "NONE";
  nodeId: number | null;
  intensity: number;
  reason: string;
  status?: "pending" | "applied" | "failed";
}

export interface ClusterMetricsHistory {
  timestamp: string;
  flops: number; // TFLOPS
  temperature: number; // avg °C
  co2Footprint: number; // relative kg/h
  memoryPressure: number; // avg %
  powerUsage: number; // kW
}

export interface ClusterStatusSummary {
  totalNodes: number;
  activeWorkloads: number;
  totalVramUsed: number;
  totalVramTotal: number;
  totalFlops: number; // Peak TFlops
  efficiencyScore: number; // Overall %
  powerTotal: number; // kW
}
