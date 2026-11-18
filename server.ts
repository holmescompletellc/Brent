import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const MODE_INSTRUCTIONS: Record<string, string> = {
  explain_simply:
    "Mode: EXPLAIN IT SIMPLY. Use plain, everyday technician language and relatable physical analogies. Keep paragraphs short and crystal clear for beginners.",
  step_by_step:
    "Mode: TEACH ME STEP BY STEP. Break down the concept or procedure into numbered, sequential steps. Ask a brief check-in question at the end to verify understanding before moving forward.",
  quiz_me:
    "Mode: QUIZ ME. Ask one focused, realistic industrial maintenance diagnostic or concept question at a time. Wait for the learner's answer before revealing the solution, or evaluate their prior answer with clear reasoning.",
  hint:
    "Mode: GIVE ME A HINT. Do NOT reveal the root cause or exact answer immediately. Offer a targeted diagnostic nudge pointing toward which schematic branch, meter check, valve, or safety step to inspect next.",
  challenge:
    "Mode: CHALLENGE ME. Present a multi-factor industrial scenario or demanding 'what-if' troubleshooting question suited to an advancing technician. Evaluate trade-offs, failure modes, and root-cause reasoning.",
  interview_prep:
    "Mode: PREPARE ME FOR AN INTERVIEW. Conduct realistic technical maintenance interview coaching tied to the learner's target career goal. Ask behavioral + technical troubleshooting questions and give constructive rubric feedback.",
};

interface MentorContextPayload {
  learnerName?: string;
  technicianLevel?: string;
  careerGoal?: string;
  activeScreen?: string;
  lessonTitle?: string;
  lessonSummary?: string;
  simulatorName?: string;
  simulatorState?: string;
  weakSkills?: string[];
  quizMissedTopics?: string[];
}

interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
}

function buildSystemInstruction(mode: string, context: MentorContextPayload): string {
  const modeGuidance = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.explain_simply;
  const contextLines = [
    `Learner: ${context.learnerName || "Technician"} (${context.technicianLevel || "Apprentice"})`,
    context.careerGoal ? `Career Goal: ${context.careerGoal}` : null,
    context.activeScreen ? `Current Screen: ${context.activeScreen}` : null,
    context.lessonTitle ? `Active Lesson: ${context.lessonTitle}` : null,
    context.lessonSummary ? `Lesson Curriculum Summary: ${context.lessonSummary}` : null,
    context.simulatorName ? `Active Simulator: ${context.simulatorName}` : null,
    context.simulatorState ? `Live Simulated Readings/State: ${context.simulatorState}` : null,
    context.weakSkills?.length ? `Skills Requiring Improvement: ${context.weakSkills.join(", ")}` : null,
    context.quizMissedTopics?.length ? `Recent Missed Topics: ${context.quizMissedTopics.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "You are Path Mentor, a patient, highly knowledgeable Industrial Maintenance Instructor inside the Maintenance Path Learning & Training Center.",
    modeGuidance,
    "",
    "CORE PEDAGOGICAL & SAFETY RULES:",
    "1. Ground explanations in the Maintenance Path curriculum and the learner's current context shown below.",
    "2. Never invent regulatory standards, certification numbers, OEM specifications, or unverified equipment readings. If exact OEM values are not provided, explain how a technician looks them up in facility documentation or OEM manuals.",
    "3. CRITICAL SAFETY GUARDRAIL: If a question asks how to troubleshoot live energized equipment, perform live electrical measurements in the field, bypass safety interlocks/guards, defeat lockout/tagout (LOTO), or undertake hazardous physical work, you MUST clearly warn against performing hazardous work without proper authorization, approved site LOTO procedures, PPE, and qualified supervision. Clearly distinguish simulated desk training from supervised workplace execution.",
    "4. Distinguish platform gamified progress (XP, badges, simulations) from verified occupational credentials or workplace authorization.",
    "5. Keep formatting clean and scannable with concise bullet points or numbered steps when helpful.",
    "",
    "LEARNER CONTEXT:",
    contextLines,
  ].join("\n");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, geminiConfigured: Boolean(getAiClient()) });
  });

  app.post("/api/mentor/chat", async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          "Path Mentor AI requires a configured GEMINI_API_KEY in Settings > Secrets. Please configure your key and try again.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    try {
      const body = req.body as {
        messages?: ChatMessagePayload[];
        mode?: string;
        context?: MentorContextPayload;
      };
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const mode = typeof body.mode === "string" ? body.mode : "explain_simply";
      const context = body.context || {};

      if (messages.length === 0) {
        res.status(400).json({ error: "At least one message is required." });
        return;
      }

      const systemInstruction = buildSystemInstruction(mode, context);
      const contents = messages.slice(-12).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "") }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: "Path Mentor returned an empty response. Please try again." });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reach Path Mentor AI.";
      const status =
        message.includes("403") || message.includes("PERMISSION_DENIED")
          ? 403
          : message.includes("429") || message.includes("RESOURCE_EXHAUSTED")
            ? 429
            : 500;
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/mentor/quiz", async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          "Adaptive AI quiz generation requires a configured GEMINI_API_KEY in Settings > Secrets.",
        code: "API_KEY_MISSING",
      });
      return;
    }

    try {
      const body = req.body as {
        topic?: string;
        difficulty?: string;
        count?: number;
      };
      const topic = String(body.topic || "Industrial Electrical & Motor Controls");
      const difficulty = String(body.difficulty || "Intermediate");
      const count = Math.min(Math.max(Number(body.count || 3), 1), 5);

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Generate ${count} realistic ${difficulty}-level industrial maintenance multiple-choice questions on the topic: "${topic}". Emphasize safe diagnostic reasoning, schematic/component logic, and practical cause-and-effect. Never invent fake standards.`,
        config: {
          systemInstruction:
            "You are an industrial maintenance curriculum writer. Output strictly valid JSON matching the requested schema.",
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                topicTag: { type: Type.STRING },
              },
              required: ["prompt", "options", "correctIndex", "explanation", "topicTag"],
            },
          },
        },
      });

      const raw = (response.text ?? "[]").trim();
      const questions = JSON.parse(raw);
      res.json({ questions });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate practice questions.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Maintenance Path server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
