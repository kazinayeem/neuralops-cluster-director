import React, { useState, useEffect } from "react";
import { GPU_Node, ChatMessage, OrchestratorAction, ClusterMetricsHistory, ClusterStatusSummary } from "./types";
import WaveBackground from "./components/WaveBackground";
import NetworkTopology from "./components/NetworkTopology";
import GPU_Card_Grid from "./components/GPU_Card_Grid";
import AICopilotConsole from "./components/AI_Copilot_Console";
import SelectedNodeController from "./components/SelectedNodeController";
import ClusterAnalysisPanel from "./components/ClusterAnalysisPanel";

import { Activity, ShieldCheck, HelpCircle, HardDrive, RefreshCw, Cpu, Database, Compass, Lock, Sliders, AlertCircle, Sparkles } from "lucide-react";

// initial 8 active-duty GPU nodes across B200, H100, A100, L40S hardware platforms
const INITIAL_NODES: GPU_Node[] = [
  {
    id: 1,
    name: "N-Core-01",
    type: "B200",
    status: "STABLE",
    utilization: 82,
    temp: 61,
    fanSpeed: 65,
    vramUsed: 142.4,
    vramTotal: 192,
    powerDraw: 510,
    clockSpeed: 2100,
    efficiency: 85,
    activeTask: "DeepSeek-V3 Inference",
    alerts: []
  },
  {
    id: 2,
    name: "N-Core-02",
    type: "B200",
    status: "STABLE",
    utilization: 94,
    temp: 72,
    fanSpeed: 75,
    vramUsed: 181.0,
    vramTotal: 192,
    powerDraw: 640,
    clockSpeed: 2150,
    efficiency: 88,
    activeTask: "Llama-3-70B Finetune",
    alerts: []
  },
  {
    id: 3,
    name: "N-Edge-01",
    type: "H100",
    status: "HEATING",
    utilization: 98,
    temp: 84, // Starts high to seed an active thermal alert!
    fanSpeed: 100,
    vramUsed: 78.5,
    vramTotal: 80,
    powerDraw: 380,
    clockSpeed: 1750,
    efficiency: 72,
    activeTask: "StableDiffusion-XL Batch",
    alerts: ["THERMAL_THROTTLE_LIMIT_WARNED_95C"]
  },
  {
    id: 4,
    name: "N-Edge-02",
    type: "H100",
    status: "STABLE",
    utilization: 45,
    temp: 54,
    fanSpeed: 50,
    vramUsed: 32.1,
    vramTotal: 80,
    powerDraw: 260,
    clockSpeed: 1500,
    efficiency: 79,
    activeTask: "Whisper Speech Transcription",
    alerts: []
  },
  {
    id: 5,
    name: "N-Quant-01",
    type: "A100",
    status: "COOLDOWN",
    utilization: 15,
    temp: 41,
    fanSpeed: 40,
    vramUsed: 12.4,
    vramTotal: 40,
    powerDraw: 140,
    clockSpeed: 1200,
    efficiency: 91,
    activeTask: "Thread scaling optimization loop",
    alerts: []
  },
  {
    id: 6,
    name: "N-Quant-02",
    type: "A100",
    status: "STABLE",
    utilization: 76,
    temp: 59,
    fanSpeed: 60,
    vramUsed: 36.8,
    vramTotal: 40,
    powerDraw: 295,
    clockSpeed: 1410,
    efficiency: 81,
    activeTask: "Qwen-2.5-Coder-32B Batch",
    alerts: []
  },
  {
    id: 7,
    name: "N-Core-03",
    type: "L40S",
    status: "MAINTENANCE", // Seeds maintenance status safely
    utilization: 0,
    temp: 34,
    fanSpeed: 20,
    vramUsed: 0,
    vramTotal: 48,
    powerDraw: 45,
    clockSpeed: 950,
    efficiency: 99,
    activeTask: "Hardware diagnostic diagnostics sweep",
    alerts: ["SYS_CACHE_RETRY_BURST"]
  },
  {
    id: 8,
    name: "N-Core-04",
    type: "L40S",
    status: "STABLE",
    utilization: 62,
    temp: 51,
    fanSpeed: 55,
    vramUsed: 22.4,
    vramTotal: 48,
    powerDraw: 195,
    clockSpeed: 1350,
    efficiency: 84,
    activeTask: "Synthetic Load Diagnostics",
    alerts: []
  }
];

export default function App() {
  const [nodes, setNodes] = useState<GPU_Node[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(3); // Default selects Node 3 for warm alert observation
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Historical telemetry log data (hours back)
  const [metricsHistory, setMetricsHistory] = useState<ClusterMetricsHistory[]>([
    { timestamp: "06:00", flops: 1412, temperature: 54, co2Footprint: 14.5, memoryPressure: 45, powerUsage: 1.84 },
    { timestamp: "07:00", flops: 1485, temperature: 56, co2Footprint: 15.2, memoryPressure: 49, powerUsage: 1.95 },
    { timestamp: "08:00", flops: 1610, temperature: 62, co2Footprint: 16.8, memoryPressure: 55, powerUsage: 2.12 },
    { timestamp: "09:00", flops: 1890, temperature: 69, co2Footprint: 18.1, memoryPressure: 64, powerUsage: 2.45 },
    { timestamp: "10:00", flops: 1945, temperature: 66, co2Footprint: 17.4, memoryPressure: 61, powerUsage: 2.38 },
    { timestamp: "11:00", flops: 1730, temperature: 60, co2Footprint: 15.9, memoryPressure: 56, powerUsage: 2.05 }
  ]);

  // Messages log
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "NeuralOps Core Link Online. Synchronized with 8 distributed silicone tensor nodes. Standing by for administrative optimization protocols.",
      timestamp: "10:22 AM"
    }
  ]);

  // Real-time metric poll simulation loops - keeps charts and node dashboard fresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-modulate nodes values within safe parameters to simulate physical telemetry
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.status === "MAINTENANCE") {
            return {
              ...node,
              utilization: 0,
              temp: Math.max(30, node.temp - 0.25),
              powerDraw: 45,
              vramUsed: 0
            };
          }

          // Fluctuations
          let utilDelta = (Math.random() - 0.5) * 5;
          let tempDelta = (Math.random() - 0.5) * 1.5;

          // If overclocking, clock remains high, power is elevated, temperature rises
          let nextStatus = node.status;
          let nextTemp = node.temp + tempDelta;
          let nextClock = node.clockSpeed;
          let nextPower = node.powerDraw;

          if (node.status === "OVERCLOCK") {
            nextTemp = Math.min(88, nextTemp + 0.3); // overclock rises heat
            nextPower = Math.round(node.powerDraw + (Math.random() - 0.5) * 10);
          } else if (node.status === "COOLDOWN") {
            nextTemp = Math.max(42, nextTemp - 0.8); // cooldown sinks heat
            if (nextTemp < 55) {
              nextStatus = "STABLE";
            }
          }

          // Check if node temp bursts safety limit to set hot warn flags
          let alerts = [...node.alerts];
          if (nextTemp >= 78) {
            nextStatus = "HEATING";
            if (!alerts.includes("THERMAL_THROTTLE_LIMIT_WARNED_95C")) {
              alerts.push("THERMAL_THROTTLE_LIMIT_WARNED_95C");
            }
          } else {
            alerts = alerts.filter(a => a !== "THERMAL_THROTTLE_LIMIT_WARNED_95C");
            if (nextStatus === "HEATING") {
              nextStatus = "STABLE";
            }
          }

          // Bound utilization
          let nextUtil = Math.round(Math.min(100, Math.max(0, node.utilization + utilDelta)));
          if (nextStatus === "COOLDOWN") {
            nextUtil = Math.min(nextUtil, 40); // limit load on cooldown
          }

          return {
            ...node,
            status: nextStatus,
            utilization: nextUtil,
            temp: parseFloat(nextTemp.toFixed(1)),
            powerDraw: Math.round(Math.max(100, Math.min(750, nextPower + (nextUtil / 15)))),
            alerts
          };
        })
      );

      // Periodically inject fresh line graph indices to metrics history
      setMetricsHistory((prev) => {
        const last = prev[prev.length - 1];
        const nextMin = parseInt(last.timestamp.split(":")[1]) + 5;
        const nextHour = (parseInt(last.timestamp.split(":")[0]) + Math.floor(nextMin / 60)) % 24;
        const padHour = nextHour.toString().padStart(2, "0");
        const padMin = (nextMin % 60).toString().padStart(2, "0");

        // Calculate dynamic averages based on current nodes
        return [
          ...prev.slice(1),
          {
            timestamp: `${padHour}:${padMin}`,
            flops: Math.round(1500 + Math.random() * 500),
            temperature: Math.round(45 + Math.random() * 25),
            co2Footprint: parseFloat((15 + Math.random() * 3).toFixed(1)),
            memoryPressure: Math.round(50 + Math.random() * 20),
            powerUsage: parseFloat((1.9 + Math.random() * 0.7).toFixed(2))
          }
        ];
      });

    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Compute calculated sums
  const calculateClusterSummary = (): ClusterStatusSummary => {
    let activeWorkloads = 0;
    let totalVramUsed = 0;
    let totalVramTotal = 0;
    let totalFlops = 0;
    let powerTotal = 0;
    let efficiencySums = 0;

    nodes.forEach((n) => {
      if (n.utilization > 5) activeWorkloads++;
      totalVramUsed += n.vramUsed;
      totalVramTotal += n.vramTotal;
      totalFlops += (n.utilization * 2.8) + (n.clockSpeed / 12);
      powerTotal += n.powerDraw;
      efficiencySums += n.efficiency;
    });

    return {
      totalNodes: nodes.length,
      activeWorkloads,
      totalVramUsed: parseFloat(totalVramUsed.toFixed(1)),
      totalVramTotal,
      totalFlops: parseFloat(totalFlops.toFixed(0)),
      efficiencyScore: Math.round(efficiencySums / nodes.length),
      powerTotal: parseFloat((powerTotal / 1000).toFixed(2))
    };
  };

  const metricsSummary = calculateClusterSummary();

  const handleSelectNode = (id: number) => {
    setSelectedNodeId(id);
  };

  // Modify individual node properties directly via manual sliders
  const handleModifyNode = (updatedNode: GPU_Node) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  // Trigger explicit physical override actions (fan cool, overclock spike) on individual node
  const handleTriggerNodeAction = (
    nodeId: number,
    actionType: "REDISTRIBUTE" | "COOL_DOWN" | "OVERCLOCK" | "MAINTENANCE"
  ) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;

        if (actionType === "COOL_DOWN") {
          // Blast coolant on node
          return {
            ...n,
            status: "COOLDOWN",
            temp: Math.max(38, n.temp - 25),
            fanSpeed: 100,
            powerDraw: Math.round(n.powerDraw * 0.7),
            alerts: n.alerts.filter((a) => a !== "THERMAL_THROTTLE_LIMIT_WARNED_95C")
          };
        } else if (actionType === "OVERCLOCK") {
          // Boost core clocks to max limits
          return {
            ...n,
            status: "OVERCLOCK",
            clockSpeed: 2600,
            utilization: 100,
            temp: Math.min(94, n.temp + 12),
            powerDraw: Math.round(n.powerDraw * 1.35)
          };
        } else if (actionType === "MAINTENANCE") {
          // Toggle node system state
          const nextMaint = n.status === "MAINTENANCE" ? "STABLE" : "MAINTENANCE";
          return {
            ...n,
            status: nextMaint,
            utilization: nextMaint === "MAINTENANCE" ? 0 : 50,
            temp: nextMaint === "MAINTENANCE" ? 34 : 52,
            vramUsed: nextMaint === "MAINTENANCE" ? 0 : 16.0,
            alerts: nextMaint === "MAINTENANCE" ? [] : n.alerts
          };
        } else if (actionType === "REDISTRIBUTE") {
          // Transfer workloads to lower nodes
          return {
            ...n,
            status: "STABLE",
            utilization: 45,
            vramUsed: Math.max(5, n.vramUsed - 20)
          };
        }
        return n;
      })
    );

    // Append alert event logs to system chat window for transparency
    const eventTime = new Date().toLocaleTimeString();
    const alertMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "system",
      content: `[CORE_CTRL] Explicit directive sent: ${actionType} triggered on Node ${nodeId}. Diagnostic link recalibrating...`,
      timestamp: eventTime
    };
    handleNewChatMessage(alertMsg);
  };

  // AI Orchestration Recommendations application engine
  const handleApplyAIAction = (actions: OrchestratorAction[]) => {
    let logsApplied: string[] = [];
    setNodes((currentNodes) => {
      return currentNodes.map((node) => {
        // Look for matching action targeting this specific node or global
        const matchAction = actions.find((a) => a.nodeId === node.id || a.nodeId === null);
        if (!matchAction) return node;

        logsApplied.push(`${matchAction.type} applied on Node ${node.id} (${matchAction.reason})`);

        if (matchAction.type === "COOL_DOWN") {
          return {
            ...node,
            status: "COOLDOWN",
            temp: Math.max(38, node.temp - 20),
            fanSpeed: 95,
            vramUsed: Math.round(node.vramUsed * 0.9),
            alerts: node.alerts.filter((a) => a !== "THERMAL_THROTTLE_LIMIT_WARNED_95C")
          };
        } else if (matchAction.type === "OVERCLOCK") {
          return {
            ...node,
            status: "OVERCLOCK",
            clockSpeed: 2500,
            utilization: 95,
            temp: Math.min(92, node.temp + 10),
            powerDraw: Math.round(node.powerDraw * 1.3)
          };
        } else if (matchAction.type === "REDISTRIBUTE") {
          // Level workloads out
          return {
            ...node,
            utilization: Math.round(node.utilization * 0.7),
            vramUsed: Math.round(node.vramUsed * 0.7)
          };
        } else if (matchAction.type === "MAINTENANCE") {
          return {
            ...node,
            status: "MAINTENANCE",
            utilization: 0,
            temp: 33,
            vramUsed: 0
          };
        } else if (matchAction.type === "LOAD_SIMULATION") {
          return {
            ...node,
            utilization: 90,
            vramUsed: Math.min(node.vramTotal - 2, node.vramUsed + 24),
            activeTask: "Llama-3-70B Synthetic Workload"
          };
        }
        return node;
      });
    });

    // Notify user via console log
    const eventTime = new Date().toLocaleTimeString();
    const systemNotice: ChatMessage = {
      id: Math.random().toString(),
      role: "system",
      content: `[ORCHESTRATOR_DISPATCH] AI Directives Successfully Commited to Cluster:\n${logsApplied.length > 0 ? logsApplied.join("\n") : "No action alterations required."}`,
      timestamp: eventTime
    };
    handleNewChatMessage(systemNotice);
  };

  const handleNewChatMessage = (msg: ChatMessage) => {
    setChatHistory((prev) => [...prev, msg].slice(-15)); // Cap chat logs history limits to prevent memory slow down
  };

  const handleManualClusterReset = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNodes(INITIAL_NODES);
      setSelectedNodeId(3);
      setIsRefreshing(false);
      
      const resetMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "system",
        content: "[SYSTEM_RESET] Recalibrated all silicon nodes to cold state default matrices. Logs cleared.",
        timestamp: new Date().toLocaleTimeString()
      };
      handleNewChatMessage(resetMsg);
    }, 700);
  };

  // Selected Node Object reference lookup
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const avgTemp = nodes.reduce((sum, n) => sum + n.temp, 0) / nodes.length;

  return (
    <div className="relative min-h-screen text-slate-200 font-sans selection:bg-brand-[#adc6ff]/30 selection:text-white flex flex-col pt-safe px-4 pb-4">
      {/* Immersive flowing noise WebGL space canvas */}
      <WaveBackground />

      {/* Main Grid Scanline screen overlay (gives that perfect high-fidelity monitoring CRT look) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025] scanlines z-50"></div>

      {/* Navigation & Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-3 border-b border-white/5 z-20 bg-brand-bg/10 backdrop-blur-sm mb-4">
        <div className="flex items-center gap-2.5">
          {/* Logo container matching Image 3 with a blue circle inside white M */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-electric via-[#3b82f6] to-brand-cyan p-0.5 flex items-center justify-center shadow-lg cyan-glow select-none">
            <div className="w-full h-full bg-[#131722]/90 rounded-[10px] flex items-center justify-center relative">
              <svg viewBox="0 0 80 80" className="w-7 h-7">
                <path
                  d="M 22 55 L 22 28 L 34 44 L 40 44 L 52 28 L 52 55"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="37" cy="48" r="6" fill="#4cd7f6" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="font-display font-semibold text-base tracking-widest text-white uppercase flex items-center gap-1.5 leading-tight">
              NEURALOPS <span className="text-brand-cyan glow-text-cyan font-normal font-mono text-xs">DIRECTOR</span>
            </h1>
            <p className="text-[10px] font-mono text-[#c2c6d6]/50 tracking-wider">SECURE AUTO-PILOT INDUSTRIAL GPU TELEMETRY SYSTEM</p>
          </div>
        </div>

        {/* Global operational stats indicators */}
        <div className="hidden md:flex items-center gap-5 text-right font-mono text-[10.5px]">
          <div>
            <div className="text-white/40 text-[8px] uppercase">RDMA TRANSIT RATE</div>
            <div className="text-brand-cyan tracking-wider font-bold">1.44 Pb/s LANES</div>
          </div>
          <div className="border-l border-white/5 h-6"></div>
          <div>
            <div className="text-white/40 text-[8px] uppercase">EMBEDDED CORES (FLOPS)</div>
            <div className="text-brand-success tracking-wider font-bold">{(metricsSummary.totalFlops * 8.5).toFixed(0)} T-FLOPS</div>
          </div>
          <div className="border-l border-white/5 h-6"></div>
          <div>
            <div className="text-white/40 text-[8px] uppercase">UTC SECURITY STATE</div>
            <div className="text-brand-cyan tracking-wider font-bold uppercase flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-ping"></span> SEC_ONLINE
            </div>
          </div>
        </div>

        {/* Refresh / Reset buttons */}
        <div className="flex items-center gap-2">
          <button
            id="recalibrate-cluster-btn"
            onClick={handleManualClusterReset}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-white/5 border border-white/15 text-xs text-[#c2c6d6] hover:bg-white/10 hover:text-white transition-all font-mono tracking-wider cursor-pointer font-bold uppercase disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "SYNCING..." : "RECALIBRATE CORE"}
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 z-10">
        
        {/* LEFT COLUMN: Controls & AI Copilot Panel (Grid Span 4) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          {/* AI Copilot Control Pane */}
          <div className="flex-1 min-h-[300px]">
            <AICopilotConsole
              nodesState={nodes}
              onApplyAIAction={handleApplyAIAction}
              chatHistory={chatHistory}
              onAddChatMessage={handleNewChatMessage}
            />
          </div>

          {/* Selected Observer Node details Slider control pane */}
          <div className="flex-1 min-h-[280px]">
            <SelectedNodeController
              node={selectedNode}
              onModifyNode={handleModifyNode}
              onTriggerNodeAction={handleTriggerNodeAction}
            />
          </div>
        </section>

        {/* RIGHT COLUMN: Intersections, Charts & Hardware node cards (Grid Span 8) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Top Panel: Interconnect topology & Analytics Bento panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Real-time centralized cluster link visualizer (Image 2 representation) */}
            <div className="md:col-span-7 min-h-[400px]">
              <NetworkTopology
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
                clusterPower={metricsSummary.powerTotal}
                avgTemp={avgTemp}
              />
            </div>

            {/* Quick telemetry trends chart panels */}
            <div className="md:col-span-5 flex flex-col">
              <ClusterAnalysisPanel
                metricsHistory={metricsHistory}
                metricsSummary={metricsSummary}
              />
            </div>
          </div>

          {/* Grid of the 8 Glowing Node Cards resembling Image 1 */}
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3 select-none">
              <Database className="w-4 h-4 text-brand-cyan animate-pulse" />
              <h2 className="font-display font-semibold text-xs tracking-widest text-[#e1e2ec] uppercase">
                Active Cluster Nodes Grid Model (8 Distributed Silicone Blades)
              </h2>
            </div>
            <GPU_Card_Grid
              nodes={nodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              onTriggerNodeAction={handleTriggerNodeAction}
            />
          </div>

        </section>

      </main>

      {/* Footer credits bar */}
      <footer className="w-full max-w-7xl mx-auto py-3 mt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-[#c2c6d6]/40 z-20 bg-brand-bg/10 backdrop-blur-xs select-none">
        <div>
          NEURALOPS GPU CLUSTER CONTROLLER CORE VERSION v3.45.2 // RD-LINK SECURED
        </div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span>PCIe-Gen5 OVERPASS x128</span>
          <span>RDMA_ACTIVE</span>
          <span>CRAFTED FOR NVIDIA CLUSTERING ARCHITECTURES</span>
        </div>
      </footer>
    </div>
  );
}
