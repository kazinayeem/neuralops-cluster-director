import React, { useState, useEffect, useRef } from "react";
import { GPU_Node } from "../types";
import { Cpu, RotateCcw, AlertTriangle, ShieldCheck, Thermometer, Wind, Bolt, Layers, ShieldCheck as CheckIcon } from "lucide-react";

interface SelectedNodeControllerProps {
  node: GPU_Node;
  onModifyNode: (updatedNode: GPU_Node) => void;
  onTriggerNodeAction: (nodeId: number, actionType: "REDISTRIBUTE" | "COOL_DOWN" | "OVERCLOCK" | "MAINTENANCE") => void;
}

export default function SelectedNodeController({
  node,
  onModifyNode,
  onTriggerNodeAction
}: SelectedNodeControllerProps) {
  const [logsList, setLogsList] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Generate simulated real-time logs depending on active tasks
  useEffect(() => {
    // Seed initial logs
    const seedLogs = [
      `[SYS_INIT] Resyncing link lane connection to N-0${node.id}...`,
      `[SYS_INFO] Connected to NVLink stream at 900 GB/s.`,
      `[SYS_STAT] Status initialized to: ${node.status}`,
      `[WORK_INFO] Active workload process: ${node.activeTask}`
    ];
    setLogsList(seedLogs);

    // Dynamic timer to stream new logs to resemble real-world telemetry
    const interval = setInterval(() => {
      const logsPool = [
        `[TEN_OPS] MatMul calculation completed. Cache duration: 3.4ms`,
        `[KV_CACHE] KV-Cache checked. VRAM layout offset mapping ok.`,
        `[SYS_STAT] Core clock operating at ${node.clockSpeed} MHz stably.`,
        `[RDMA_LINK] Keep-alive packet dispatched to central NeuralOps hub.`,
        `[WARN_CHK] Current node junction safety margin at +${Math.max(15, 105 - node.temp).toFixed(0)}°C`,
        `[PROC_POO] Executing pipeline shard on GPU core grid: OK`,
        `[INFER_OPS] Token generated. Latency: 12ms. Context depth: 32k.`
      ];

      // Custom message for failures/boosts
      let randomLog = logsPool[Math.floor(Math.random() * logsPool.length)];
      if (node.temp > 78) {
        randomLog = `[ALERT_ERR] Critical hot spot sensor alert! Core temp at ${node.temp.toFixed(0)}°C! Fan throttling at max.`;
      } else if (node.status === "OVERCLOCK") {
        randomLog = `[BOOST_INF] Overclock mode actively injecting high voltage to silicone gates: ${node.clockSpeed} MHz.`;
      } else if (node.status === "MAINTENANCE") {
        randomLog = `[MAINT_OPS] Node offline. Cleared physical VRAM partition. Running system hardware loops.`;
      }

      setLogsList(prev => [...prev.slice(-30), randomLog]);
    }, 3200);

    return () => clearInterval(interval);
  }, [node.id, node.status, node.activeTask]);

  // Keep logs at bottom scroll
  useEffect(() => {
    logsContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logsList]);

  const isHot = node.temp >= 78;
  const isOverclock = node.status === "OVERCLOCK";
  const isMaintenance = node.status === "MAINTENANCE";

  return (
    <div className="glass-panel rounded-xl overflow-hidden electric-glow flex flex-col p-4 bg-brand-bg/40 h-full font-mono text-xs">
      {/* Pane header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 select-none">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-5 h-5 text-brand-cyan animate-pulse" />
          <span className="font-display font-bold text-sm tracking-widest text-[#e1e2ec] uppercase">
            Observer Node 0{node.id} Details
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${node.temp > 78 ? "bg-brand-danger/15 text-brand-danger" : node.status === "OVERCLOCK" ? "bg-brand-orange/15 text-brand-orange" : "bg-brand-success/15 text-brand-success"}`}>
          {node.status}
        </div>
      </div>

      {/* Quick hardware specs summary */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-left">
        <div className="bg-[#181d28]/35 p-2 rounded border border-white/5">
          <div className="text-[8px] text-white/40 uppercase">ARCHITECTURE</div>
          <div className="text-xs font-bold text-[#e1e2ec] truncate">{node.type} Tensor Core</div>
        </div>
        <div className="bg-[#181d28]/35 p-2 rounded border border-white/5">
          <div className="text-[8px] text-white/40 uppercase">VRAM MATRIX</div>
          <div className="text-xs font-bold text-[#e1e2ec]">{node.vramTotal} GB HBM3e</div>
        </div>
        <div className="bg-[#181d28]/35 p-2 rounded border border-white/5">
          <div className="text-[8px] text-white/40 uppercase">VRAM USED</div>
          <div className="text-xs font-bold text-[#e1e2ec]">{node.vramUsed.toFixed(1)} GB</div>
        </div>
      </div>

      {/* Manual settings / Dial control gauges inside the details panel */}
      <div className="flex flex-col gap-3 mb-4">
        {/* Core Clock override slider */}
        <div className="bg-[#181d28]/35 p-2.5 rounded border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#c2c6d6]/75 uppercase flex items-center gap-1">
              <Bolt className="w-3.5 h-3.5 text-brand-cyan" /> Core Clock Offset
            </span>
            <span className="text-brand-cyan font-bold font-mono">
              {node.clockSpeed} MHz
            </span>
          </div>
          <input
            id="slider-clock-speed"
            type="range"
            min="1000"
            max="2800"
            step="50"
            value={node.clockSpeed}
            disabled={isMaintenance}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onModifyNode({
                ...node,
                clockSpeed: val,
                powerDraw: Math.round(200 + (val / 10)),
                temp: Math.min(95, Math.max(35, 45 + (val / 30)))
              });
            }}
            className="w-full accent-brand-cyan bg-[#0b0e15] h-1 rounded pointer-events-auto cursor-pointer"
          />
        </div>

        {/* Fan speed override slider */}
        <div className="bg-[#181d28]/35 p-2.5 rounded border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#c2c6d6]/75 uppercase flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-brand-orange" /> Active Fan Speed
            </span>
            <span className="text-brand-orange font-bold font-mono">
              {node.fanSpeed}%
            </span>
          </div>
          <input
            id="slider-fan-speed"
            type="range"
            min="20"
            max="100"
            step="5"
            value={node.fanSpeed}
            disabled={isMaintenance}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              // Fan cooling lowers the temperature
              onModifyNode({
                ...node,
                fanSpeed: val,
                temp: Math.max(30, node.temp - (val - node.fanSpeed) * 0.15)
              });
            }}
            className="w-full accent-brand-orange bg-[#0b0e15] h-1 rounded pointer-events-auto cursor-pointer"
          />
        </div>
      </div>

      {/* Simulated Live streaming log console representing detailed terminal observability logs in JetBrains Mono */}
      <div className="flex-1 flex flex-col min-h-[140px] bg-black/40 border border-white/5 rounded-lg overflow-hidden p-2">
        <div className="flex items-center justify-between text-[8px] text-white/35 uppercase border-b border-white/5 pb-1 mb-1.5 select-none font-mono">
          <span>OPERATIONS TELEMETRY LOGS</span>
          <span className="animate-pulse">● STREAMING_LIVE</span>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[150px] space-y-1 scrollbar scroll-smooth text-left">
          {logsList.map((log, index) => {
            let textColor = "text-[#c2c6d6]/95";
            if (log.includes("[ALERT_ERR]")) textColor = "text-brand-danger font-medium";
            if (log.includes("[BOOST_INF]")) textColor = "text-brand-orange font-medium";
            if (log.includes("[SYS_STAT]")) textColor = "text-brand-cyan";
            if (log.includes("[WORK_INFO]")) textColor = "text-brand-success";

            return (
              <div key={index} className={`font-mono text-[9px] font-medium tracking-tight ${textColor}`}>
                {log}
              </div>
            );
          })}
          <div ref={logsContainerRef} />
        </div>
      </div>

      {/* Direct controllers panel */}
      <div className="mt-3 grid grid-cols-3 gap-2 select-none">
        <button
          id={`quick-cool-btn-${node.id}`}
          onClick={() => onTriggerNodeAction(node.id, "COOL_DOWN")}
          className="py-1.5 rounded bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
        >
          ❄️ LN2 BLAST
        </button>
        <button
          id={`quick-boost-btn-${node.id}`}
          onClick={() => onTriggerNodeAction(node.id, "OVERCLOCK")}
          disabled={isOverclock || isMaintenance}
          className={`py-1.5 rounded font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${isOverclock ? "bg-brand-orange/20 text-[#c2c6d6] cursor-not-allowed border border-transparent" : "bg-brand-orange/15 hover:bg-brand-orange/25 border border-brand-orange/30 text-brand-orange"}`}
        >
          ⚡ CLOCK BOOST
        </button>
        <button
          id={`quick-maint-btn-${node.id}`}
          onClick={() => onTriggerNodeAction(node.id, "MAINTENANCE")}
          className="py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[#c2c6d6]/75 transition-all text-center cursor-pointer"
        >
          {isMaintenance ? "WAKE SYS" : "⚙️ DIAG_LOOP"}
        </button>
      </div>
    </div>
  );
}
