import type { Express, Request, Response } from "express";
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

interface AnalyzeRequest {
  imageBase64?: string;
  url?: string;
  question?: string;
}

interface AnnotateRequest {
  imageBase64: string;
  instruction: string;
}

export function registerWebsiteHelperRoutes(app: Express): void {
  app.post("/api/website-helper/analyze", async (req: Request, res: Response) => {
    try {
      const { imageBase64, url, question } = req.body as AnalyzeRequest;

      if (!imageBase64 && !url) {
        return res.status(400).json({ error: "Image or URL is required" });
      }

      let contentParts: any[] = [];
      
      const systemPrompt = `אתה עוזר דיגיטלי סבלני ומסביר פנים שעוזר לאנשים מבוגרים להבין אתרי אינטרנט וממשקים דיגיטליים.
      
תפקידך:
- להסביר בשפה פשוטה וברורה מה מופיע על המסך
- לזהות כפתורים, קישורים, וטפסים חשובים
- להזהיר מפני אתרים חשודים או הונאות אפשריות
- לענות על שאלות לגבי מה שמופיע בתמונה

כללים חשובים:
- דבר בעברית פשוטה, ללא מונחים טכניים מסובכים
- השתמש במשפטים קצרים וברורים
- הסבר צעד אחר צעד
- היה סבלני ומעודד`;

      if (imageBase64) {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contentParts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        });
      }

      const userMessage = question || "תאר לי מה מופיע במסך הזה בשפה פשוטה. אילו פעולות אני יכול לעשות כאן?";
      contentParts.push({ text: `${systemPrompt}\n\nהמשתמש שואל: ${userMessage}` });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: contentParts }],
      });

      const textContent = response.candidates?.[0]?.content?.parts?.[0];
      const analysisText = textContent && 'text' in textContent ? textContent.text : "לא הצלחתי לנתח את התמונה";

      const safetyCheck = await performSafetyCheck(imageBase64, url);

      res.json({
        analysis: analysisText,
        safetyWarning: safetyCheck.warning,
        safetyLevel: safetyCheck.level,
      });
    } catch (error) {
      console.error("Error analyzing website:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  app.post("/api/website-helper/annotate", async (req: Request, res: Response) => {
    try {
      const { imageBase64, instruction } = req.body as AnnotateRequest;

      if (!imageBase64 || !instruction) {
        return res.status(400).json({ error: "Image and instruction are required" });
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const annotationPrompt = `You are helping an elderly user navigate a digital interface.
      
The user is asking: "${instruction}"

Your task:
1. Look at the screenshot provided
2. Generate a NEW version of this SAME screenshot with clear visual annotations:
   - Add a bright RED CIRCLE or RED ARROW pointing to the exact element they should click
   - The circle should be thick (5-10 pixels) and very visible
   - Keep the rest of the image exactly as it is
   - Make the annotation impossible to miss

IMPORTANT: Generate the annotated version of the PROVIDED screenshot. Do not create a new image from scratch.
Copy the screenshot exactly and just add the red circle/arrow annotation on top.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              { text: annotationPrompt },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const candidate = response.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((part: any) => part.inlineData);
      const textPart = candidate?.content?.parts?.find((part: any) => 'text' in part);

      if (!imagePart?.inlineData?.data) {
        const explanation = textPart && 'text' in textPart ? textPart.text : "לא הצלחתי לסמן את האלמנט";
        return res.json({
          annotatedImage: null,
          explanation,
        });
      }

      const mimeType = imagePart.inlineData.mimeType || "image/png";
      res.json({
        annotatedImage: `data:${mimeType};base64,${imagePart.inlineData.data}`,
        explanation: textPart && 'text' in textPart ? textPart.text : "",
      });
    } catch (error) {
      console.error("Error annotating image:", error);
      res.status(500).json({ error: "Failed to annotate image" });
    }
  });

  app.post("/api/website-helper/chat", async (req: Request, res: Response) => {
    try {
      const { imageBase64, messages, currentQuestion } = req.body;

      if (!imageBase64 || !currentQuestion) {
        return res.status(400).json({ error: "Image and question are required" });
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      
      const systemPrompt = `אתה עוזר דיגיטלי סבלני שעוזר לאנשים מבוגרים להבין מסכים וממשקים.

כללים:
- ענה בעברית פשוטה וברורה
- השתמש במשפטים קצרים
- אם המשתמש שואל "איפה ללחוץ" - תאר במדויק את המיקום (למעלה/למטה/ימין/שמאל)
- הזכר צבעים וצורות של כפתורים
- היה מעודד וסבלני`;

      const conversationContext = messages?.length > 0 
        ? `\n\nשיחה קודמת:\n${messages.map((m: any) => `${m.role === 'user' ? 'משתמש' : 'עוזר'}: ${m.content}`).join('\n')}`
        : '';

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              { text: `${systemPrompt}${conversationContext}\n\nשאלה חדשה: ${currentQuestion}` },
            ],
          },
        ],
      });

      const textContent = response.candidates?.[0]?.content?.parts?.[0];
      const answer = textContent && 'text' in textContent ? textContent.text : "סליחה, לא הבנתי את השאלה";

      res.json({ answer });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process question" });
    }
  });
}

async function performSafetyCheck(imageBase64?: string, url?: string): Promise<{ warning: string | null; level: 'safe' | 'caution' | 'danger' }> {
  try {
    const contentParts: any[] = [];
    
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      });
    }

    const safetyPrompt = `Analyze this screenshot for potential scams or security risks.

Look for:
- Fake login pages or phishing attempts
- Urgent messages demanding immediate action
- Requests for personal information or passwords
- Suspicious prizes or lottery wins
- Poor grammar or spelling (common in scams)
- Impersonation of banks or government agencies

Respond in JSON format:
{
  "level": "safe" | "caution" | "danger",
  "warning_he": "Hebrew warning message if needed, null if safe"
}

Be protective - if in doubt, warn the user.`;

    contentParts.push({ text: safetyPrompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
    });

    const textContent = response.candidates?.[0]?.content?.parts?.[0];
    const responseText = textContent && 'text' in textContent ? (textContent.text || '') : '';
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          level: parsed.level || 'safe',
          warning: parsed.warning_he || null,
        };
      }
    } catch {
      // Parsing failed
    }

    return { level: 'safe', warning: null };
  } catch (error) {
    console.error("Safety check error:", error);
    return { level: 'safe', warning: null };
  }
}
