import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "../db";
import { userEvaluations, learningPaths } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

interface QuizAnswer {
  questionId: string;
  category: "smartphone" | "whatsapp" | "safety";
  selectedOption: number;
  isCorrect: boolean;
}

interface EvaluationRequest {
  answers: QuizAnswer[];
  userId?: string;
  sessionId?: string;
}

router.post("/", async (req, res) => {
  try {
    const { answers, userId, sessionId }: EvaluationRequest = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers are required" });
    }

    const smartphoneAnswers = answers.filter((a) => a.category === "smartphone");
    const whatsappAnswers = answers.filter((a) => a.category === "whatsapp");
    const safetyAnswers = answers.filter((a) => a.category === "safety");

    const calculateScore = (categoryAnswers: QuizAnswer[]) => {
      if (categoryAnswers.length === 0) return 0;
      const correct = categoryAnswers.filter((a) => a.isCorrect).length;
      return Math.round((correct / categoryAnswers.length) * 100);
    };

    const smartphoneScore = calculateScore(smartphoneAnswers);
    const whatsappScore = calculateScore(whatsappAnswers);
    const digitalSafetyScore = calculateScore(safetyAnswers);
    const overallScore = Math.round(
      (smartphoneScore + whatsappScore + digitalSafetyScore) / 3
    );

    const prompt = `You are an AI learning path advisor for seniors (70+) learning technology.

Based on these quiz scores:
- Smartphone Navigation: ${smartphoneScore}%
- WhatsApp Usage: ${whatsappScore}%
- Digital Safety: ${digitalSafetyScore}%
- Overall: ${overallScore}%

Determine the best learning path for this user. Choose ONE path from these options:
1. "beginner" - For users scoring 0-40% overall. Focus on smartphone basics first.
2. "whatsapp_focus" - For users who scored low on WhatsApp but okay on other areas.
3. "safety_focus" - For users who need to learn about digital safety and scams.
4. "intermediate" - For users scoring 40-70%. Ready for more advanced features.
5. "advanced" - For users scoring 70%+ who want to master technology.

Respond in this exact JSON format:
{
  "recommendedPath": "path_id_here",
  "reasoning": "Brief Hebrew explanation why this path fits (2-3 sentences)",
  "strengths": ["strength1_he", "strength2_he"],
  "areasToImprove": ["area1_he", "area2_he"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 500,
      },
    });

    let aiResult;
    try {
      const text = response.text || "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        recommendedPath: overallScore < 40 ? "beginner" : overallScore < 70 ? "intermediate" : "advanced",
        reasoning: "בהתבסס על התוצאות שלך",
        strengths: [],
        areasToImprove: [],
      };
    } catch {
      aiResult = {
        recommendedPath: overallScore < 40 ? "beginner" : overallScore < 70 ? "intermediate" : "advanced",
        reasoning: "בהתבסס על התוצאות שלך",
        strengths: [],
        areasToImprove: [],
      };
    }

    const [evaluation] = await db
      .insert(userEvaluations)
      .values({
        userId: userId || null,
        sessionId: sessionId || `guest_${Date.now()}`,
        smartphoneScore,
        whatsappScore,
        digitalSafetyScore,
        overallScore,
        answers: answers,
        recommendedPath: aiResult.recommendedPath,
      })
      .returning();

    const learningPathData = getLearningPathDetails(aiResult.recommendedPath);

    res.json({
      success: true,
      evaluation: {
        id: evaluation.id,
        scores: {
          smartphone: smartphoneScore,
          whatsapp: whatsappScore,
          safety: digitalSafetyScore,
          overall: overallScore,
        },
        recommendedPath: {
          id: aiResult.recommendedPath,
          ...learningPathData,
        },
        reasoning: aiResult.reasoning,
        strengths: aiResult.strengths,
        areasToImprove: aiResult.areasToImprove,
      },
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({ error: "Failed to process evaluation" });
  }
});

function getLearningPathDetails(pathId: string) {
  const paths: Record<string, any> = {
    beginner: {
      titleHe: "מתחילים בטכנולוגיה",
      titleEn: "Technology Beginners",
      descriptionHe: "נלמד את הבסיס של שימוש בסמארטפון בקצב נוח",
      icon: "smartphone",
      color: "#4CAF50",
      journeys: ["ai_what_is", "whatsapp_read_messages", "gmail_read_email"],
    },
    whatsapp_focus: {
      titleHe: "מאסטר וואטסאפ",
      titleEn: "WhatsApp Master",
      descriptionHe: "נלמד להשתמש בוואטסאפ בביטחון מלא",
      icon: "message-circle",
      color: "#25D366",
      journeys: ["whatsapp_read_messages", "whatsapp_send_text", "whatsapp_send_photo", "whatsapp_video_call"],
    },
    safety_focus: {
      titleHe: "בטיחות דיגיטלית",
      titleEn: "Digital Safety",
      descriptionHe: "נלמד להגן על עצמנו באינטרנט",
      icon: "shield",
      color: "#FF5722",
      journeys: ["ai_staying_safe", "whatsapp_privacy", "whatsapp_group_safety"],
    },
    intermediate: {
      titleHe: "מתקדמים בטכנולוגיה",
      titleEn: "Technology Intermediate",
      descriptionHe: "נרחיב את הידע ונלמד תכונות מתקדמות",
      icon: "trending-up",
      color: "#2196F3",
      journeys: ["ai_how_to_ask", "gmail_send_email", "gmail_attach_photo"],
    },
    advanced: {
      titleHe: "מומחי טכנולוגיה",
      titleEn: "Technology Experts",
      descriptionHe: "נשלוט במיומנויות מתקדמות",
      icon: "award",
      color: "#9C27B0",
      journeys: ["ai_image_generation", "ai_document_reading", "grandchildren_tips"],
    },
  };

  return paths[pathId] || paths.beginner;
}

export default router;
