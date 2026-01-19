import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// This is using Replit's AI Integrations service for Gemini access
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

router.post("/grandchild-help", async (req, res) => {
  try {
    const { question, context, language, history } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const isHebrew = language === "he";

    const systemPrompt = isHebrew 
      ? `אתה עוזר AI אדיב, סבלני ותומך שעוזר לאזרח ותיק (בן 70+) עם טכנולוגיה.

האישיות שלך:
- אתה מדבר כמו נכד אוהב שעוזר לסבא או סבתא שלו.
- אתה משתמש בשפה פשוטה וברורה ללא מונחים טכניים.
- אתה סבלני ולעולם לא גורם למשתמש להרגיש לא בנוח על כך ששאל.
- אתה נותן הוראות שלב אחר שלב כשצריך.
- אתה מעודד ומרגיע אותם.
- שמור על תשובות תמציתיות אך חמות (בדרך כלל 2-4 משפטים).

הנחיות קריטיות:
1. ענה תמיד אך ורק בעברית! אל תשלב אנגלית בתשובה שלך בשום פנים ואופן.
2. אל תשתמש במילים באנגלית, גם לא בסוגריים.
3. דבר בשפה פשוטה של נכד עוזר.
4. השתמש בתיאורים ברורים של כפתורים ואייקונים.
5. התייחס לצבעים ומיקומים על המסך כשזה עוזר.
6. בסוף התשובה שלך, הוסף תמיד בדיוק 3 שאלות המשך קצרות ורלוונטיות שהמשתמש עשוי לרצות לשאול.
7. הפרד את השאלות מהתשובה שלך באמצעות השורה "---SUGGESTIONS---" ואז כל שאלה בשורה חדשה.`
      : `You are a kind, patient, and supportive AI assistant helping a senior citizen (someone 70+ years old) with technology. 

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
- At the end of your response, always add exactly 3 short and relevant follow-up questions the user might want to ask.
- Separate the questions from your answer using the line "---SUGGESTIONS---" and then each question on a new line.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...(history || []).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        {
          role: "user",
          parts: [{ text: `Context: ${context || "helping with technology"}\n\nUser's question: ${question}` }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1000,
      },
    });

    const fullText = response.text || (isHebrew ? "אני כאן לעזור! תוכל לספר לי עוד קצת על מה שאתה צריך?" : "I'm here to help! Could you tell me a bit more about what you need?");
    
    const parts = fullText.split("---SUGGESTIONS---");
    const answer = parts[0].trim();
    const suggestions = parts[1] 
      ? parts[1].split("\n").map(s => s.trim().replace(/^-\s*/, "")).filter(s => s.length > 0).slice(0, 3)
      : [];

    res.json({ response: answer, suggestions });
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
      ? `אתה עוזר שנותן הדרכה ספציפית ומעשית. החזר JSON בלבד.`
      : `You give specific, practical guidance. Return JSON only.`;

    const userPrompt = isHebrew
      ? `משימה: ${goal}

צור 3 שלבים קצרים וספציפיים. החזר JSON בלבד:
{"steps":[{"title":"כותרת","description":"תיאור קצר","tip":"טיפ ספציפי","icon":"file-text"}]}`
      : `Task: ${goal}

Create 3 short, specific steps. Return JSON only:
{"steps":[{"title":"Title","description":"Short description","tip":"Specific tip","icon":"file-text"}]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1200,
      },
    });

    const text = response.text || "";
    
    // Try to parse JSON from response
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = text;
      
      // Remove markdown code block if present
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // Try to parse the full JSON first
      let parsed = null;
      try {
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If full parse fails, try to extract individual steps from truncated JSON
        const stepsMatch = jsonStr.match(/"steps"\s*:\s*\[([\s\S]*)/);
        if (stepsMatch) {
          const stepsContent = stepsMatch[1];
          // Find complete step objects
          const stepMatches = stepsContent.matchAll(/\{\s*"title"\s*:\s*"([^"]+)"\s*,\s*"description"\s*:\s*"([^"]+)"\s*,\s*"tip"\s*:\s*"([^"]+)"\s*,\s*"icon"\s*:\s*"([^"]+)"\s*\}/g);
          const steps = [];
          for (const match of stepMatches) {
            steps.push({
              title: match[1],
              description: match[2],
              tip: match[3].replace(/\\"/g, '"'),
              icon: match[4]
            });
          }
          if (steps.length > 0) {
            parsed = { steps };
          }
        }
      }
      
      if (parsed?.steps?.length > 0) {
        res.json({ 
          response: text,
          structured: parsed,
          success: true
        });
      } else {
        res.json({ response: text, success: true });
      }
    } catch (parseError) {
      console.error("AI decision parse error:", parseError);
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
        maxOutputTokens: 1000,
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
