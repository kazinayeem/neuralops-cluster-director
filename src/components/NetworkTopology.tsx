import React from "react";
import { GPU_Node } from "../types";
import { Network, Activity, Cpu, ShieldAlert, Zap, Thermometer } from "lucide-react";
import { motion } from "motion/react";

interface NetworkTopologyProps {
  nodes: GPU_Node[];
  selectedNodeId: number | null;
  onSelectNode: (id: number) => void;
  clusterPower: number;
  avgTemp: number;
}

export default function NetworkTopology({
  nodes,
  selectedNodeId,
  onSelectNode,
  clusterPower,
  avgTemp
}: NetworkTopologyProps) {
  // Circular coordinates for the 8 nodes in our SVG spider topology
  const svgSize = 600;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const radius = 200;

  return (
    <div className="relative w-full h-full glass-panel rounded-xl overflow-hidden electric-glow flex flex-col p-4 bg-brand-bg/40">
      {/* Top indicator ribbon */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-brand-cyan animate-pulse" />
          <span className="font-display font-semibold text-sm tracking-widest text-[#e1e2ec] uppercase">
            Cluster Core Interconnect (SLI-LANE ×32)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#adc6ff]">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-brand-cyan" /> {(clusterPower * 1000).toFixed(0)}W draw
          </span>
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-brand-orange" /> {avgTemp.toFixed(1)}°C avg
          </span>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[380px] lg:min-h-[420px]">
        {/* Full Interactive Interconnect SVG */}
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full max-w-[480px] h-auto drop-shadow-[0_0_30px_rgba(76,215,246,0.1)]"
        >
          {/* Custom Gradients definitions */}
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0b0e15" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="linkActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#adc6ff" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="linkStressed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#adc6ff" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Central Orchestrator Core Pulse Ring */}
          <circle
            cx={cx}
            cy={cy}
            r="80"
            fill="url(#centerGlow)"
            className="animate-pulse"
          />

          {/* Spoke lanes (Central hub to outlying nodes) */}
          {nodes.map((node, i) => {
            const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);
            const isHeating = node.temp > 78;
            const isOverclock = node.status === "OVERCLOCK";

            return (
              <g key={`link-${node.id}`} className="group/link">
                {/* Visual backline */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={nx}
                  y2={ny}
                  stroke={isHeating ? "#f87171" : isOverclock ? "#ffb786" : "#adc6ff"}
                  strokeOpacity={selectedNodeId === node.id ? 0.9 : 0.25}
                  strokeWidth={selectedNodeId === node.id ? 3 : 1.5}
                  className="transition-all duration-300"
                />

                {/* Animated data transit particles */}
                <circle r={isOverclock ? 4 : 3} fill={isHeating ? "#f87171" : "#4cd7f6"} className="glow-text-cyan">
                  <animateMotion
                    path={`M ${cx} ${cy} L ${nx} ${ny}`}
                    dur={`${4 - (node.utilization / 30)}s`}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* High utilization back-pulse particles */}
                {node.utilization > 70 && (
                  <circle r="2.5" fill="#ffb786">
                    <animateMotion
                      path={`M ${nx} ${ny} L ${cx} ${cy}`}
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Central Core Element */}
          <g transform={`translate(${cx - 40}, ${cy - 40})`} className="cursor-pointer">
            {/* Hexagonal central node */}
            <polygon
              points="40,2 78,22 78,62 40,82 2,62 2,22"
              fill="#131722"
              stroke="#4cd7f6"
              strokeWidth="3"
              className="filter drop-shadow-[0_0_12px_rgba(76,215,246,0.5)]"
            />
            {/* Custom logo letter "M" with a cyan dot as seen in Image 3 */}
            <path
              d="M 22 55 L 22 28 L 34 44 L 40 44 L 52 28 L 52 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="37" cy="48" r="6" fill="#4cd7f6" className="animate-ping" />
            <circle cx="37" cy="48" r="5" fill="#4cd7f6" />
          </g>

          {/* Round label over central node */}
          <text
            x={cx}
            y={cy + 36}
            textAnchor="middle"
            fill="#e1e2ec"
            className="font-display text-[9px] font-bold tracking-widest fill-[#adc6ff]"
          >
            NEURALOPS CORE
          </text>

          {/* GPU Outlying Node Modules */}
          {nodes.map((node, i) => {
            const angle = (i * 2 * Math.PI) / nodes.length - Math.PI / 2;
            const nx = cx + radius * Math.cos(angle);
            const ny = cy + radius * Math.sin(angle);
            const isSelected = selectedNodeId === node.id;
            const isHot = node.temp > 78;

            // Status determined color
            let statusWireColor = "stroke-[#adc6ff]";
            let statusFillColor = "fill-[#131722]";
            let glowFilter = "drop-shadow-[0_0_5px_rgba(173,198,255,0.3)]";

            if (node.status === "OVERCLOCK") {
              statusWireColor = "stroke-brand-orange";
              glowFilter = "drop-shadow-[0_0_8px_rgba(255,183,134,0.7)]";
            } else if (isHot) {
              statusWireColor = "stroke-brand-danger";
              glowFilter = "drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]";
            } else if (node.status === "COOLDOWN") {
              statusWireColor = "stroke-brand-cyan";
              glowFilter = "drop-shadow-[0_0_6px_rgba(76,215,246,0.6)]";
            } else if (node.status === "MAINTENANCE") {
              statusWireColor = "stroke-neutral-500";
              glowFilter = "none";
            }

            return (
              <g
                key={`node-module-${node.id}`}
                transform={`translate(${nx - 24}, ${ny - 24})`}
                className="cursor-pointer select-none"
                onClick={() => onSelectNode(node.id)}
              >
                {/* Node Hex Outer Capsule */}
                <polygon
                  points="24,2 46,14 46,38 24,50 2,38 2,14"
                  fill="#111520"
                  className={`${isSelected ? "stroke-[#4cd7f6] stroke-[3.5]" : `${statusWireColor} stroke-2`} ${isHot ? "animate-pulse" : ""} transition-all duration-300`}
                  filter={isSelected ? "drop-shadow-[0_0_12px_rgba(76,215,246,0.7)]" : glowFilter}
                />

                {/* Micro GPU Board visual details */}
                <line x1="10" y1="20" x2="38" y2="20" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <line x1="12" y1="24" x2="36" y2="24" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                <rect x="18" y="14" width="12" height="12" rx="1.5" fill="#1b2130" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

                {/* Small indicator light inside each node */}
                <circle
                  cx="24"
                  cy="20"
                  r={isSelected ? "3.5" : "2.5"}
                  fill={isHot ? "#f87171" : node.status === "OVERCLOCK" ? "#ffb786" : node.status === "MAINTENANCE" ? "#6b7280" : "#34d399"}
                  className="transition-all duration-300"
                />

                {/* Node ID label */}
                <text
                  x="24"
                  y="40"
                  textAnchor="middle"
                  className="font-mono text-[9px] font-bold fill-[#e1e2ec] pointer-events-none"
                >
                  N-0{node.id}
                </text>

                {/* Hover overlay details */}
                <title>{`${node.name} (${node.type})\nTemp: ${node.temp}°C\nLoad: ${node.utilization}%`}</title>
              </g>
            );
          })}
        </svg>

        {/* Dynamic scanlines over the topology to give high-fidelity telemetry screen style */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] scanlines rounded-lg"></div>

        {/* Floating observability overlay cards inside topology */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none bg-brand-bg/65 backdrop-blur-md p-2 rounded border border-white/5 text-[10px] font-mono select-none">
          <div className="text-brand-cyan uppercase font-bold tracking-wider">TOPOLOGY NET</div>
          <div className="text-[#c2c6d6]">PROT: RDMA over Converged Ethernet</div>
          <div className="text-[#c2c6d6]">FRAME RATE: 144Hz real-time</div>
          <div className="text-[#c2c6d6]">BUS WIDTH: NVLink Gen5 x8</div>
        </div>

        <div className="absolute bottom-2 right-2 flex flex-col gap-1 pointer-events-none bg-brand-bg/65 backdrop-blur-md p-2 rounded border border-white/5 text-[10px] font-mono text-right select-none">
          <div className="text-[#adc6ff] uppercase font-bold tracking-wider flex items-center gap-1 justify-end">
            <Activity className="w-3 h-3 text-[#34d399]" /> LINK STATES
          </div>
          <div className="text-brand-success">8/8 CHANNELS NOMINAL</div>
          <div className="text-[#c2c6d6]">SYS DURATION: UP 214h 42m</div>
        </div>
      </div>

      {/* Cluster Node state checklist bar */}
      <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-4 gap-1 text-[11px] font-mono">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <button
              key={`node-btn-${node.id}`}
              onClick={() => onSelectNode(node.id)}
              className={`flex items-center justify-between p-1 rounded transition-colors text-left ${isSelected ? "bg-[#adc6ff]/15 border border-[#adc6ff]/30 text-white" : "bg-[#181d28]/40 hover:bg-[#181d28]/80 text-[#c2c6d6] border border-transparent"}`}
            >
              <span className="truncate">N-0{node.id}</span>
              <span
                className={`w-2 h-2 rounded-full ${node.temp > 78 ? "bg-brand-danger animate-ping" : node.status === "OVERCLOCK" ? "bg-brand-orange" : node.status === "MAINTENANCE" ? "bg-neutral-500" : "bg-brand-success"}`}
              ></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
