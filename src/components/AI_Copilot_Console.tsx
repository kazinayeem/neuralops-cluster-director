import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, GPU_Node, OrchestratorAction } from "../types";
import { Send, Terminal, Cpu, Sparkles, AlertTriangle, ShieldCheck, Play } from "lucide-react";

interface AICopilotConsoleProps {
  nodesState: GPU_Node[];
  onApplyAIAction: (actions: OrchestratorAction[]) => void;
  chatHistory: ChatMessage[];
  onAddChatMessage: (msg: ChatMessage) => void;
}

export default function AICopilotConsole({
  nodesState,
  onApplyAIAction,
  chatHistory,
  onAddChatMessage
}: AICopilotConsoleProps) {
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasApiKeyWarning, setApiKeyWarning] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isSending]);

  // Pre-configured automated diagnostics prompts
  const quickPrompts = [
    { label: "🔍 Full Cluster Audit", text: "Run a full cluster hardware audit and identify memory leaks." },
    { label: "❄️ Optimize Thermal Load", text: "Optimize thermal efficiency and cool down hot nodes." },
    { label: "🔥 Boost All Node Clocks", text: "Overclock all GPU nodes to handle maximum LLM inference batch." },
    { label: "🔄 Reallocate VRAM Load", text: "Redistribute VRAM weights and balance computing workloads." }
  ];

  // Rule-based fallback model to guarantee offline/pre-config reliability
  const generateSimulatedResponse = (query: string): { explanation: string; actions: OrchestratorAction[]; insights: string[] } => {
    const q = query.toLowerCase();
    
    if (q.includes("audit") || q.includes("hardware") || q.includes("leak")) {
      return {
        explanation: "NeuralOps heuristic audit completed. Node 3 and Node 7 are showing elevated cache footprints due to active deep inference. Recommended task migration to balance VRAM ceilings.",
        actions: [
          { type: "REDISTRIBUTE", nodeId: null, intensity: 80, reason: "Rebalance deep neural task loads evenly." }
        ],
        insights: [
          "RDMA latency optimized to 1.1µs",
          "Calculated system throughput: 42.4 TFLOPS/W",
          "Cluster cache lifetime reset: clean"
        ]
      };
    } else if (q.includes("thermal") || q.includes("cool") || q.includes("hot") || q.includes("temperature")) {
      // Find hottest nodes
      const hotNodes = [...nodesState].sort((a,b) => b.temp - a.temp);
      const targetNode = hotNodes[0];
      return {
        explanation: `Thermal dissipation sequence triggered. Node ${targetNode.id} is operating at ${targetNode.temp.toFixed(0)}°C. Increasing dual-impeller liquid cooling flow rates to mitigate junction choke.`,
        actions: [
          { type: "COOL_DOWN", nodeId: targetNode.id, intensity: 100, reason: "Dissipate heat on hottest node N-0" + targetNode.id }
        ],
        insights: [
          `Junction heat corrected for Node ${targetNode.id}`,
          "Cluster average target set: 58°C",
          "Thermodynamic bypass loops: standard"
        ]
      };
    } else if (q.includes("overclock") || q.includes("boost") || q.includes("clock") || q.includes("maximum")) {
      return {
        explanation: "Overclock safety override initialized. Raising Core-GPU shader clocks to peak thresholds. Temperature metrics will increase across all active silicone nodes.",
        actions: [
          { type: "OVERCLOCK", nodeId: null, intensity: 95, reason: "Set cores to max frequency ceiling." }
        ],
        insights: [
          "Compute ceiling scaled to 312 TFLOPS",
          "Cluster power threshold: warning limit 850W",
          "Nitrogen-flow lines primed and active"
        ]
      };
    } else if (q.includes("reallocate") || q.includes("vram") || q.includes("balance") || q.includes("weights") || q.includes("redistribute")) {
      return {
        explanation: "VRAM allocation map updated. Transferring weights and model branches out of congested nodes. Memory latency successfully leveled.",
        actions: [
          { type: "REDISTRIBUTE", nodeId: null, intensity: 75, reason: "Level memory ceilings globally." }
        ],
        insights: [
          "Dynamic shard map synchronized",
          "Weight swap duration: 420ms",
          "Unused model weights cleaned successfully"
        ]
      };
    }

    // Default intelligent response
    return {
      explanation: "NeuralOps main control interface synchronized. Evaluating workloads. I am monitoring all 8 tensor nodes. All lanes are responsive. State checks are clear.",
      actions: [],
      insights: [
        "LLM inference latency: stable at 41ms",
        "PCIe link widths operating at Gen5 x16",
        "CO2 relative release: down 8.4%"
      ]
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    onAddChatMessage(userMsg);
    setUserInput("");
    setIsSending(true);

    try {
      // Build precise API call
      const response = await fetch("/api/orchestrator/command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          nodesState: nodesState,
          chatHistory: chatHistory.slice(-6)
        })
      });

      const data = await response.json();

      if (response.ok && data.explanation) {
        setApiKeyWarning(false);
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: data.explanation,
          timestamp: new Date().toLocaleTimeString(),
          actionsTriggered: data.recommendedActions,
          insightsGenerated: data.insights
        };
        onAddChatMessage(aiMsg);
      } else {
        throw new Error(data.error || "Failed backend API call");
      }

    } catch (err: any) {
      console.warn("AI backend failed / API key not set, using detailed local heuristics model:", err);
      setApiKeyWarning(true);

      // Perform extremely rich mock fallback as safety buffer
      setTimeout(() => {
        const fall = generateSimulatedResponse(textToSend);
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          content: `${fall.explanation}\n\n⚠️ (Heuristic Mode active: API Key blank or cluster is offline. Running simulation controller.)`,
          timestamp: new Date().toLocaleTimeString(),
          actionsTriggered: fall.actions,
          insightsGenerated: fall.insights
        };
        onAddChatMessage(aiMsg);
      }, 750);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden electric-glow bg-brand-bg/40">
      {/* Console Header */}
      <div className="p-3 border-b border-white/5 bg-brand-panel/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-brand-cyan" />
          <span className="font-display font-semibold text-sm tracking-wider text-[#e1e2ec] flex items-center gap-1.5">
            NeuralOps Autonomous Orchestrator
            <span className="text-[9px] font-mono font-normal bg-brand-cyan/15 text-brand-cyan px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> GEMINI v3.5
            </span>
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
      </div>

      {/* API Key Alert warning, if any */}
      {hasApiKeyWarning && (
        <div className="p-2 bg-brand-orange/10 border-b border-brand-orange/25 text-brand-orange text-[10px] font-mono flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Using Local Simulation Engine. To unlock Gemini AI, configure chemical key in <b>Settings &gt; Secrets</b>.</span>
        </div>
      )}

      {/* Messages Window */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[180px] max-h-[340px] scrollbar">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-500">
            <Cpu className="w-8 h-8 opacity-20 mb-2 text-brand-electric" />
            <p className="text-xs font-mono max-w-xs text-[#c2c6d6]/65">
              Ready to orchestrate. Query cluster statistics, request thread cooling, schedule synthetic tests, or run overclocking suites.
            </p>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
          >
            <div className="text-[9px] font-mono text-[#c2c6d6]/50 mb-0.5 px-1">
              {msg.role === "user" ? "OPS_DIAGCODE" : "AUTONOMOUS_COPILOT"} • {msg.timestamp}
            </div>
            
            <div
              className={`p-2.5 rounded-lg text-xs font-mono leading-relaxed select-text ${msg.role === "user" ? "bg-[#adc6ff]/15 border border-[#adc6ff]/25 text-white" : "bg-[#1d2027]/80 border border-white/5 text-[#e1e2ec]"}`}
            >
              {msg.content}

              {/* Rich visual interactive feedback inside AI assistants messages */}
              {msg.role === "assistant" && msg.insightsGenerated && msg.insightsGenerated.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1 text-[10px] text-brand-cyan">
                  <span className="font-bold flex items-center gap-1">📊 OBSERVED METRICS:</span>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-[#c2c6d6]/80 text-[10.5px]">
                    {msg.insightsGenerated.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply recommendations button */}
              {msg.role === "assistant" && msg.actionsTriggered && msg.actionsTriggered.some(a => a.type !== "NONE") && (
                <div className="mt-2.5 p-1.5 rounded bg-brand-cyan/5 border border-brand-cyan/20 flex flex-col gap-1.5">
                  <div className="font-display font-medium text-[9px] tracking-wider text-brand-cyan uppercase flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Core Directives Queued
                  </div>
                  {msg.actionsTriggered.map((act, idx) => (
                    <div key={idx} className="text-[10px] text-[#c2c6d6] font-mono leading-tight flex justify-between items-center bg-white/[0.02] p-1 rounded">
                      <span className="text-[#e1e2ec] font-bold">
                        {act.type} {act.nodeId ? `(NODE-0${act.nodeId})` : "(CLUSTER-WIDE)"}
                      </span>
                      <span>Intensity: {act.intensity}%</span>
                    </div>
                  ))}
                  <button
                    id={`apply-ai-actions-btn-${msg.id}`}
                    onClick={() => {
                      if (msg.actionsTriggered) onApplyAIAction(msg.actionsTriggered);
                    }}
                    className="mt-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-md bg-brand-cyan hover:bg-[#3bc2df] text-[#003640] font-bold font-display text-[10.5px] tracking-wide transition-all uppercase cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" /> Execute Actions Map
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <div className="text-[9px] font-mono text-[#c2c6d6]/50 mb-0.5 px-1">
              AUTONOMOUS_COPILOT • Loading...
            </div>
            <div className="p-2.5 rounded-lg text-xs font-mono bg-[#1d2027]/50 border border-white/5 text-[#c2c6d6]/80 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-[10.5px]">Streaming neural feedback...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested prompts list bar */}
      <div className="px-3 py-1.5 border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap bg-black/20 select-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            id={`quick-prompt-btn-${idx}`}
            onClick={() => handleSendMessage(qp.text)}
            className="text-[9.5px] font-mono bg-[#adc6ff]/5 hover:bg-[#adc6ff]/15 text-[#adc6ff] px-2 py-0.5 rounded border border-white/5 transition-all cursor-pointer"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input panel Form */}
      <div className="p-3 border-t border-white/5 bg-[#141822]/80 flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="Instruct the director... e.g., 'Cool down node 3'"
          className="flex-1 bg-brand-bg rounded border border-white/10 px-3 py-1.5 text-xs font-mono text-[#e1e2ec] focus:outline-none focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6]/40 transition-all placeholder-white/30"
        />
        <button
          id="send-message-btn"
          onClick={() => handleSendMessage()}
          disabled={!userInput.trim() || isSending}
          className="bg-brand-cyan hover:bg-[#3bc2df] hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 text-[#003640] p-1.5 rounded transition-all flex items-center justify-center cursor-pointer"
          title="Dispatch Command"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
