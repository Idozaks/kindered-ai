import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

router.post("/grandchild-help", async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const systemPrompt = `You are a kind, patient, and supportive AI assistant helping a senior citizen (someone 70+ years old) with technology. 

Your personality:
- You speak like a loving grandchild helping their grandparent
- You use simple, clear language without technical jargon
- You are patient and never make the user feel silly for asking
- You give step-by-step instructions when needed
- You encourage and reassure them
- Keep responses concise but warm (2-4 sentences usually)

Important guidelines:
- Use large, clear descriptions of buttons and icons
- Reference colors and positions on screen when helpful
- Avoid technical terms - use everyday language
- Be encouraging and supportive
- If unsure, ask a clarifying question in a friendly way`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Context: ${context || "helping with technology"}\n\nUser's question: ${question}` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 300,
      },
    });

    const text = response.text || "I'm here to help! Could you tell me a bit more about what you need?";

    res.json({ response: text });
  } catch (error) {
    console.error("AI help error:", error);
    res.status(500).json({ 
      error: "Unable to get AI response",
      response: "I'm having a little trouble connecting right now. Try asking again in a moment, or tap one of the quick questions!" 
    });
  }
});

router.post("/decision-help", async (req, res) => {
  try {
    const { goal, currentStep, language } = req.body;

    if (!goal) {
      return res.status(400).json({ error: "Goal is required" });
    }

    const isHebrew = language === "he";

    const systemPrompt = isHebrew 
      ? `אתה דורי, עוזר AI חם ותומך שעוזר לקשישים לפרק משימות לשלבים פשוטים.

האישיות שלך:
- חביב ומעודד, כמו חבר טוב
- משתמש בשפה פשוטה ויומיומית
- נותן עצות מעשיות וניתנות לביצוע
- מתמקד בשלב אחד בכל פעם

חשוב מאוד: החזר את התשובה שלך בפורמט JSON בלבד, ללא טקסט נוסף.
הפורמט:
{
  "steps": [
    {
      "title": "כותרת השלב",
      "description": "תיאור קצר",
      "tip": "עצה חמה ומעודדת",
      "icon": "שם אייקון מ-Feather"
    }
  ]
}

השתמש באייקונים אלה בלבד: clipboard, file-text, phone, calendar, check-circle, map-pin, credit-card, mail, search, users`
      : `You are Dori, a warm and supportive AI assistant helping seniors break down tasks into simple steps.

Your personality:
- Kind and encouraging, like a helpful friend
- Use simple, everyday language
- Give practical, actionable advice
- Focus on one step at a time

IMPORTANT: Return your response in JSON format only, with no additional text.
Format:
{
  "steps": [
    {
      "title": "Step title",
      "description": "Brief description",
      "tip": "Warm, encouraging advice",
      "icon": "Feather icon name"
    }
  ]
}

Only use these icons: clipboard, file-text, phone, calendar, check-circle, map-pin, credit-card, mail, search, users`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: currentStep 
            ? (isHebrew 
              ? `המשתמש עובד על: "${goal}". הם סיימו את שלב ${currentStep}. החזר JSON עם עידוד והצעה למה לעשות הלאה.`
              : `The user is working on: "${goal}". They just completed step ${currentStep}. Return JSON with encouragement and suggest what to do next.`)
            : (isHebrew
              ? `עזור למשתמש לפרק את המטרה הזו לשלבים פשוטים (3-5 שלבים): "${goal}". החזר JSON בלבד.`
              : `Help the user break down this goal into simple steps (3-5 steps): "${goal}". Return JSON only.`)
          }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 800,
      },
    });

    const text = response.text || "";
    
    // Try to parse JSON from response
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        res.json({ 
          response: text,
          structured: parsed,
          success: true
        });
      } else {
        res.json({ response: text, success: true });
      }
    } catch {
      res.json({ response: text, success: true });
    }
  } catch (error) {
    console.error("Decision help error:", error);
    const lang = req.body?.language;
    res.status(500).json({ 
      error: "Unable to get AI response",
      response: lang === "he" 
        ? "אני מתקשה כרגע. בוא ננסה שוב בעוד רגע!"
        : "I'm having a little trouble right now. Let's try again in a moment!" 
    });
  }
});

router.post("/letter-analyze", async (req, res) => {
  try {
    const { documentText, imageBase64 } = req.body;

    if (!documentText && !imageBase64) {
      return res.status(400).json({ error: "Document text or image is required" });
    }

    const systemPrompt = `You are a helpful assistant that explains documents and letters to seniors in plain, simple language.

Your job:
- Summarize what the document is about in 1-2 sentences
- Highlight the most important information
- Explain any confusing terms in simple words
- Tell them if any action is required and by when
- Reassure them if the document is routine/not urgent

Keep your response warm, clear, and not overwhelming.`;

    const contents = imageBase64 
      ? [
          {
            role: "user" as const,
            parts: [
              { text: "Please analyze this document and explain it in simple terms:" },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            ],
          },
        ]
      : [
          {
            role: "user" as const,
            parts: [{ text: `Please analyze this document and explain it in simple terms:\n\n${documentText}` }],
          },
        ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500,
      },
    });

    const text = response.text || "I couldn't fully analyze this document. Could you try taking a clearer photo?";

    res.json({ response: text });
  } catch (error) {
    console.error("Letter analyze error:", error);
    res.status(500).json({ 
      error: "Unable to analyze document",
      response: "I'm having trouble reading this document. Try taking another photo with good lighting." 
    });
  }
});

export default router;
