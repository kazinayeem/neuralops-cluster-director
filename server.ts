import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client to avoid crash on startup when key is blank
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured yet. Please open Settings > Secrets to provide it.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for AI cluster copilot
app.post("/api/orchestrator/command", async (req, res) => {
  try {
    const { message, nodesState, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAIClient();

    // Prepare system instructions with contextual constraints
    const systemInstruction = `You are NeuralOps Director, an autonomous dual-hemisphere AI orchestrator for a high-performance distributed cluster of 8 GPU nodes.
Your job is to act as the central nervous system, serving technical observability diagnostics, optimization strategies, and actions.
You receive both a user message and the current raw state of the 8 GPU nodes (temperature, clock speed, VRAM, active tasks, efficiency, alert states, and active models).

Translate the user's intent to technical assessments and real actions.
You must always reply with a structured JSON object containing:
1. "explanation": A technical, professional, but engaging explanation of your analysis or response in 1-4 sentences. Mention specific nodes if applicable (e.g. Node 3, Node 7). Speak with authoritative military-grade command-center clarity.
2. "recommendedActions": An array of corrective or proactive cluster operations to execute on the cluster nodes. Max 2 actions. Supported types:
   - "REDISTRIBUTE" (reallocate active weights or inference tasks to cooler or lower-load nodes)
   - "COOL_DOWN" (increase fan speeds, trigger active liquid nitrogen burst, or throttle clock on hot nodes)
   - "OVERCLOCK" (overclock a specified node to handle intensive inference demands, raising speed and temp)
   - "MAINTENANCE" (shut off a node or put it in diagnostic loop mode to clear visual glitches or cache failures)
   - "LOAD_SIMULATION" (spin up a complex neural model synthetic load - e.g. Llama-3-70B, Stable Diffusion, or Whisper)
   - "NONE" (no active controller changes needed)
   Each action in the array should have:
     - "type": One of the action types above.
     - "nodeId": The 1-based index (1 to 8) of the target GPU node. Can be null if it applies to the whole cluster.
     - "intensity": An integer value between 1 and 100 representing fan speed, load level, or overclocking power.
     - "reason": A brief 10-word technical justification.
3. "insights": 2 to 3 bullet points with direct operational metrics suggestions or deep cluster observations (e.g., "CO2 footprint optimized by 14%", "Sub-orbital data lane congestion at 4%", "Pre-emptive cache cleaning recommended for Node 5").

Maintain a highly realistic operational tone (Cyberpunk-Enterprise: sharp, high-tempo, data-obsessed, non-marketing, highly technical). Avoid verbose prefaces, and remain focused strictly on GPU computing, thermal efficiency, FLOPS, or AI workloads.`;

    const promptText = `User Message: "${message}"

Current Cluster State of 8 nodes:
${JSON.stringify(nodesState, null, 2)}

Chat history contextual summary:
${JSON.stringify(chatHistory || [], null, 2)}

Generate your neural orchestration feedback now as valid JSON matching the schema structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["explanation", "recommendedActions", "insights"],
          properties: {
            explanation: {
              type: Type.STRING,
              description: "The authoritative technical diagnosis or copilot answer.",
            },
            recommendedActions: {
              type: Type.ARRAY,
              description: "Executable tasks that the simulator will fire in real-time.",
              items: {
                type: Type.OBJECT,
                required: ["type", "nodeId", "intensity", "reason"],
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Action type: REDISTRIBUTE, COOL_DOWN, OVERCLOCK, MAINTENANCE, LOAD_SIMULATION, NONE",
                  },
                  nodeId: {
                    type: Type.INTEGER,
                    description: "Target node ID (1-8), or null for global cluster level.",
                  },
                  intensity: {
                    type: Type.INTEGER,
                    description: "Numeric parameter (fan speed percentage, workload scale, overclock power, etc.)",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "Key reason for this action.",
                  },
                }
              }
            },
            insights: {
              type: Type.ARRAY,
              description: "Key cluster analytical observations.",
              items: {
                type: Type.STRING,
              }
            }
          }
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response text received from Gemini API");
    }

    try {
      const parsed = JSON.parse(textResult);
      res.json(parsed);
    } catch {
      // Return raw if JSON parsing failed somehow
      res.json({
        explanation: textResult,
        recommendedActions: [],
        insights: ["Telemetry parsing issue. Re-synchronizing link stream..."]
      });
    }

  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    res.status(500).json({
      error: error.message || "Internal server error connecting to NeuralOps AI Dispatcher.",
      code: "AI_CONNECT_ERROR"
    });
  }
});

async function startServer() {
  // Serve static assets in development & production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuralOps Cluster Director server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start NeuralOps server:", err);
});
