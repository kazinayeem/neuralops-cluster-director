import React from "react";
import { GPU_Node } from "../types";
import { Cpu, Zap, Thermometer, Wind, AlertTriangle, Play, RefreshCw, Bolt } from "lucide-react";
import { motion } from "motion/react";

interface GPU_Card_GridProps {
  nodes: GPU_Node[];
  selectedNodeId: number | null;
  onSelectNode: (id: number) => void;
  onTriggerNodeAction: (nodeId: number, actionType: "REDISTRIBUTE" | "COOL_DOWN" | "OVERCLOCK" | "MAINTENANCE") => void;
}

export default function GPU_Card_Grid({
  nodes,
  selectedNodeId,
  onSelectNode,
  onTriggerNodeAction
}: GPU_Card_GridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const isHot = node.temp >= 78;
        const isOverclock = node.status === "OVERCLOCK";
        const isMaintenance = node.status === "MAINTENANCE";

        // Card aesthetic configurations based on state
        let borderAccent = "border-white/5";
        let glowAccent = "";
        let ledColor = "bg-brand-success";
        let topBarGradient = "from-[#adc6ff]/10 to-transparent";

        if (isSelected) {
          borderAccent = "border-brand-cyan";
          glowAccent = "cyan-glow shadow-brand-cyan/25";
          ledColor = "bg-brand-cyan";
          topBarGradient = "from-brand-cyan/25 to-transparent";
        } else if (isHot) {
          borderAccent = "border-brand-danger";
          glowAccent = "danger-glow shadow-brand-danger/25";
          ledColor = "bg-brand-danger";
          topBarGradient = "from-brand-danger/30 to-transparent";
        } else if (isOverclock) {
          borderAccent = "border-brand-orange";
          glowAccent = "electric-glow shadow-brand-orange/20";
          ledColor = "bg-brand-orange animate-ping";
          topBarGradient = "from-brand-orange/25 to-transparent";
        } else if (isMaintenance) {
          borderAccent = "border-neutral-700";
          ledColor = "bg-neutral-600";
          topBarGradient = "from-neutral-700/10 to-transparent";
        }

        return (
          <div
            key={`node-card-${node.id}`}
            id={`node-card-id-${node.id}`}
            onClick={() => onSelectNode(node.id)}
            className={`relative flex flex-col rounded-xl overflow-hidden glass-panel border transition-all duration-300 cursor-pointer ${borderAccent} ${glowAccent} hover:border-[#adc6ff]/40 bg-brand-bg/35`}
          >
            {/* Background Visual Design Elements resembling Image 1 GPU nodes */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none"></div>

            {/* Micro circuit lanes pattern matching Image 1 */}
            <div className="absolute top-12 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#adc6ff]/5 to-transparent pointer-events-none"></div>

            {/* Glowing active bar */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${topBarGradient}`}></div>

            {/* Card Header */}
            <div className="p-3 pb-2 flex items-center justify-between border-b border-white/5 bg-brand-panel/30 z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${ledColor} filter blur-[1px]`}></div>
                <div>
                  <h3 className="font-display font-semibold text-xs tracking-wider text-[#e1e2ec] flex items-center gap-1">
                    {node.name}
                    <span className="text-[9px] font-mono font-medium px-1 bg-white/5 rounded text-brand-cyan select-none">
                      {node.type}
                    </span>
                  </h3>
                  <p className="text-[9px] font-mono text-[#c2c6d6]/60">NODE_0{node.id} // SYS_ONLINE</p>
                </div>
              </div>

              {/* Warnings/Alert banner */}
              {node.alerts.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-brand-danger animate-pulse bg-brand-danger/10 px-1.5 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="font-mono text-[9px] font-bold">WARN</span>
                </div>
              )}
            </div>

            {/* Card Analytics Dashboard */}
            <div className="p-3 flex-1 flex flex-col gap-2 z-10">
              {/* VRAM usage and bar - essential for LLM performance */}
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-[#c2c6d6]/75">VRAM Utility</span>
                  <span className="text-white font-medium">
                    {node.vramUsed.toFixed(1)} / {node.vramTotal} GB ({Math.round((node.vramUsed / node.vramTotal) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-brand-bg/80 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${isHot ? "from-[#ef4444] to-[#f87171]" : isOverclock ? "from-[#f59e0b] to-brand-orange" : "from-brand-cyan to-[#adc6ff]"}`}
                    style={{ width: `${(node.vramUsed / node.vramTotal) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Central stats grid */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {/* Temp */}
                <div className="bg-[#181d28]/60 p-1.5 rounded border border-white/[0.03] flex items-center gap-1.5 justify-start">
                  <Thermometer className={`w-4 h-4 ${isHot ? "text-brand-danger" : "text-brand-orange"}`} />
                  <div>
                    <div className="text-[8px] font-mono text-white/50 uppercase">TEMP</div>
                    <div className="text-xs font-mono font-bold text-[#e1e2ec]" id={`node-temp-${node.id}`}>
                      {node.temp.toFixed(0)}°C
                    </div>
                  </div>
                </div>

                {/* Utilization */}
                <div className="bg-[#181d28]/60 p-1.5 rounded border border-white/[0.03] flex items-center gap-1.5 justify-start">
                  <Cpu className="w-4 h-4 text-brand-cyan" />
                  <div>
                    <div className="text-[8px] font-mono text-white/50 uppercase">COMPUTE</div>
                    <div className="text-xs font-mono font-bold text-[#e1e2ec]">
                      {node.utilization}%
                    </div>
                  </div>
                </div>

                {/* Clockspeed */}
                <div className="bg-[#181d28]/60 p-1.5 rounded border border-white/[0.03] flex items-center gap-1.5 justify-start">
                  <Bolt className="w-4 h-4 text-brand-electric" />
                  <div>
                    <div className="text-[8px] font-mono text-white/50 uppercase">CLOCK</div>
                    <div className="text-xs font-mono font-bold text-[#e1e2ec]">
                      {(node.clockSpeed / 1000).toFixed(2)} GHz
                    </div>
                  </div>
                </div>

                {/* Power draw */}
                <div className="bg-[#181d28]/60 p-1.5 rounded border border-white/[0.03] flex items-center gap-1.5 justify-start">
                  <Zap className="w-4 h-4 text-[#fbbf24]" />
                  <div>
                    <div className="text-[8px] font-mono text-white/50 uppercase">POWER</div>
                    <div className="text-xs font-mono font-bold text-[#e1e2ec]">
                      {node.powerDraw}W
                    </div>
                  </div>
                </div>
              </div>

              {/* Active neural workload */}
              <div className="bg-brand-bg/50 p-2 rounded border border-white/5 flex items-center gap-2 mt-1">
                <Wind className={`w-3.5 h-3.5 ${isMaintenance ? "text-neutral-500" : "text-brand-cyan"}`} />
                <div className="truncate flex-1">
                  <div className="text-[8px] font-mono text-white/40 uppercase">ACTIVE DISPATCH TASK</div>
                  <div className="text-[10px] font-mono font-bold text-brand-success truncate">
                    {node.activeTask}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action button overlay bottom drawer - visible on hover/selection */}
            <div className="px-3 py-2 border-t border-white/5 bg-[#141822]/85 flex items-center justify-between gap-1 z-10 font-mono text-[10px]">
              {isMaintenance ? (
                <button
                  id={`action-wake-node-${node.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerNodeAction(node.id, "REDISTRIBUTE");
                  }}
                  className="flex-1 py-1 px-1 rounded bg-[#adc6ff]/15 hover:bg-[#adc6ff]/35 text-white font-medium text-center transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" /> WAKE NODE
                </button>
              ) : (
                <>
                  <button
                    id={`action-overclock-${node.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerNodeAction(node.id, "OVERCLOCK");
                    }}
                    disabled={isOverclock}
                    className={`flex-1 py-1 px-1 rounded text-center font-bold font-display transition-all ${isOverclock ? "bg-brand-orange/40 text-white cursor-not-allowed" : "bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 border border-[#fbbf24]/30 text-[#fbbf24]"}`}
                  >
                    ⚡ BOOST
                  </button>
                  <button
                    id={`action-cool-${node.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerNodeAction(node.id, "COOL_DOWN");
                    }}
                    className="flex-1 py-1 px-1 rounded text-center border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/20 transition-all font-bold font-display"
                  >
                    ❄️ COLD
                  </button>
                  <button
                    id={`action-maint-${node.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerNodeAction(node.id, "MAINTENANCE");
                    }}
                    className="py-1 px-1.5 rounded text-center border border-white/10 text-[#c2c6d6]/65 hover:bg-white/10 transition-all"
                    title="Toggle Maintenance Mode"
                  >
                    ⚙️
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
