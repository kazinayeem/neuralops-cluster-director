import React, { useState } from "react";
import { ClusterMetricsHistory, ClusterStatusSummary } from "../types";
import { BarChart3, TrendingUp, Cpu, Thermometer, Zap, ShieldCheck } from "lucide-react";

interface ClusterAnalysisPanelProps {
  metricsHistory: ClusterMetricsHistory[];
  metricsSummary: ClusterStatusSummary;
}

export default function ClusterAnalysisPanel({
  metricsHistory,
  metricsSummary
}: ClusterAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<"flops" | "temp" | "power">("flops");

  // Custom SVG simple line charts to guarantee complete, lightweight rendering
  const width = 500;
  const height = 140;
  const paddingX = 40;
  const paddingY = 20;

  // Retrieve values depending on tab
  const getChartPoints = () => {
    if (metricsHistory.length === 0) return "";
    
    // Determine min/max values
    let values: number[] = [];
    if (activeTab === "flops") {
      values = metricsHistory.map(m => m.flops);
    } else if (activeTab === "temp") {
      values = metricsHistory.map(m => m.temperature);
    } else {
      values = metricsHistory.map(m => m.powerUsage);
    }

    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05 || 1;
    const range = maxVal - minVal;

    // Create polyline coordinate points string
    const pointsList = metricsHistory.map((metric, i) => {
      const val = values[i];
      const x = paddingX + (i * (width - paddingX * 2)) / (metricsHistory.length - 1);
      const y = height - paddingY - ((val - minVal) * (height - paddingY * 2)) / range;
      return `${x},${y}`;
    });

    return pointsList.join(" ");
  };

  const getChartFilledPath = () => {
    const polyPoints = getChartPoints();
    if (!polyPoints) return "";
    // Draw polygon down to base line to fill the area under the curve
    return `${polyPoints} ${width - paddingX},${height - paddingY} ${paddingX},${height - paddingY}`;
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden electric-glow flex flex-col p-4 bg-brand-bg/40 h-full">
      {/* Tab selection */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-brand-cyan" />
          <span className="font-display font-semibold text-sm tracking-wider text-[#e1e2ec]">Telemetry Analysis</span>
        </div>
        <div className="flex gap-1.5 font-mono text-[10px]">
          <button
            onClick={() => setActiveTab("flops")}
            className={`px-2 py-0.5 rounded transition-all ${activeTab === "flops" ? "bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan font-bold" : "text-[#c2c6d6]/65 hover:bg-white/5"}`}
          >
            TFLOPS
          </button>
          <button
            onClick={() => setActiveTab("temp")}
            className={`px-2 py-0.5 rounded transition-all ${activeTab === "temp" ? "bg-brand-orange/15 border border-brand-orange/30 text-brand-orange font-bold" : "text-[#c2c6d6]/65 hover:bg-white/5"}`}
          >
            THERMALS
          </button>
          <button
            onClick={() => setActiveTab("power")}
            className={`px-2 py-0.5 rounded transition-all ${activeTab === "power" ? "bg-brand-electric/15 border border-brand-electric/30 text-brand-electric font-bold" : "text-[#c2c6d6]/65 hover:bg-white/5"}`}
          >
            POWER KW
          </button>
        </div>
      </div>

      {/* Summary grid indicators */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Total compute Gflops */}
        <div className="bg-[#181d28]/45 p-2 rounded border border-white/5 text-left">
          <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
            <Cpu className="w-3 h-3 text-brand-cyan" /> COMPUTE POWER
          </div>
          <div className="text-sm font-display font-bold text-[#e1e2ec] mt-0.5 mt-1 glow-text-cyan flex items-baseline gap-1">
            {metricsSummary.totalFlops.toFixed(0)} <span className="text-[10px] font-mono font-medium text-white/50">TFLOPS</span>
          </div>
        </div>

        {/* Global Efficiency Score */}
        <div className="bg-[#181d28]/45 p-2 rounded border border-white/5 text-left">
          <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-brand-success" /> EFFICIENCY
          </div>
          <div className="text-sm font-display font-bold text-brand-success mt-1 flex items-baseline gap-1">
            {metricsSummary.efficiencyScore.toFixed(0)}% <span className="text-[9px] font-mono font-normal text-white/50">OP_RATIO</span>
          </div>
        </div>

        {/* Total Kilowatts */}
        <div className="bg-[#181d28]/45 p-2 rounded border border-white/5 text-left">
          <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand-orange" /> POWER CEILING
          </div>
          <div className="text-sm font-display font-bold text-[#e1e2ec] mt-1 flex items-baseline gap-1">
            {metricsSummary.powerTotal.toFixed(2)} <span className="text-[9px] font-mono font-normal text-white/50">kW</span>
          </div>
        </div>

        {/* Co2 footprint delta */}
        <div className="bg-[#181d28]/45 p-2 rounded border border-white/5 text-left">
          <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-brand-cyan" /> CO2 SAVINGS
          </div>
          <div className="text-sm font-display font-bold text-[#adc6ff] mt-1 flex items-baseline gap-1">
            -{(metricsSummary.powerTotal * 0.42 * 0.1).toFixed(2)} <span className="text-[9px] font-mono font-normal text-white/50">kg/h</span>
          </div>
        </div>
      </div>

      {/* Main SVG Chart Visualizer */}
      <div className="relative flex-1 min-h-[140px] flex items-center justify-center bg-black/20 p-2 rounded-lg border border-white/5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradientFlops" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradientTemp" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffb786" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffb786" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradientPower" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#adc6ff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#adc6ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={(height) / 2} x2={width - paddingX} y2={(height) / 2} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255, 255, 255, 0.1)" />

          {/* Connection polygon area fill */}
          {activeTab === "flops" && (
            <polygon points={getChartFilledPath()} fill="url(#chartGradientFlops)" />
          )}
          {activeTab === "temp" && (
            <polygon points={getChartFilledPath()} fill="url(#chartGradientTemp)" />
          )}
          {activeTab === "power" && (
            <polygon points={getChartFilledPath()} fill="url(#chartGradientPower)" />
          )}

          {/* Polyline line curve overlay */}
          <polyline
            fill="none"
            stroke={activeTab === "flops" ? "#4cd7f6" : activeTab === "temp" ? "#ffb786" : "#adc6ff"}
            strokeWidth="2.5"
            points={getChartPoints()}
            className="transition-all duration-500"
          />

          {/* Dynamic nodes / points over line graph */}
          {getChartPoints().split(" ").map((pt, idx) => {
            if (!pt) return null;
            const [xVal, yVal] = pt.split(",");
            return (
              <circle
                key={`dot-${idx}`}
                cx={xVal}
                cy={yVal}
                r="3.5"
                fill="#131722"
                stroke={activeTab === "flops" ? "#4cd7f6" : activeTab === "temp" ? "#ffb786" : "#adc6ff"}
                strokeWidth="2"
                className="hover:scale-150 transition-all cursor-pointer"
              >
                <title>{`T-${metricsHistory.length - 1 - idx} hours`}</title>
              </circle>
            );
          })}
        </svg>

        {/* Mini watermark */}
        <div className="absolute top-2 right-2 text-[8px] font-mono text-white/20 select-none">
          SECURE_ENCRYPTED_TELEMETRY // R-NODE_SYS
        </div>
      </div>
    </div>
  );
}
