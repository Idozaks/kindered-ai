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
    const { question, context, language, history, imageBase64 } = req.body;

    if (!question && !imageBase64) {
      return res.status(400).json({ error: "Question or image is required" });
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
6. אם המשתמש שולח תמונה, תאר מה אתה רואה ועזור לו להבין את התוכן.
7. בסוף התשובה שלך, הוסף תמיד בדיוק 3 שאלות המשך קצרות ורלוונטיות שהמשתמש עשוי לרצות לשאול.
8. הפרד את השאלות מהתשובה שלך באמצעות השורה "---SUGGESTIONS---" ואז כל שאלה בשורה חדשה.`
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
- If the user sends an image, describe what you see and help them understand the content
- At the end of your response, always add exactly 3 short and relevant follow-up questions the user might want to ask.
- Separate the questions from your answer using the line "---SUGGESTIONS---" and then each question on a new line.`;

    const userParts: any[] = [];
    
    if (question) {
      userParts.push({ text: `Context: ${context || "helping with technology"}\n\nUser's question: ${question}` });
    }
    
    if (imageBase64) {
      userParts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
      if (!question) {
        userParts.unshift({ text: isHebrew ? "מה אתה רואה בתמונה הזו? עזור לי להבין אותה." : "What do you see in this image? Help me understand it." });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...(history || []).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        {
          role: "user",
          parts: userParts,
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
    const { documentText, imageBase64, mimeType = "image/jpeg" } = req.body;

    if (!documentText && !imageBase64) {
      return res.status(400).json({ error: "Document text or image is required" });
    }

    // Check if this is a PDF - PDFs should be uploaded as photos instead
    let extractedText = documentText;
    const isPdf = mimeType === "application/pdf";
    
    if (isPdf) {
      return res.status(400).json({ 
        error: "PDF not supported",
        response: "Please take a photo of your document instead of uploading a PDF. Photos work better for analyzing letters and documents."
      });
    }

    const systemPrompt = `CRITICAL: YOU MUST RESPOND ONLY IN HEBREW. ALL TEXT VALUES IN THE JSON MUST BE IN HEBREW LANGUAGE.

אתה עוזר שמסביר מסמכים ומכתבים לקשישים בשפה פשוטה וברורה בעברית.

חובה לענות בפורמט JSON בדיוק כך (כל הערכים בעברית!):
{
  "type": "סוג המסמך בעברית (לדוגמה: דף חשבון בנק, חשבון חשמל, מכתב רפואי, הודעה מהממשלה)",
  "urgency": "high" או "medium" או "low",
  "summary": "הסבר בעברית - חם וברור ב-2-3 משפטים על מה המסמך הזה ומה זה אומר לאדם. השתמש במילים פשוטות בעברית.",
  "actions": ["פעולה בעברית 1", "פעולה בעברית 2", "פעולה בעברית 3"]
}

הנחיות לדחיפות:
- "high": תשלום בקרוב, מועד אחרון חוקי, תור לרופא, דורש פעולה מיידית
- "medium": צריך לטפל תוך שבוע, חשוב אבל לא דחוף
- "low": מידע בלבד, דף חשבון רגיל, אין צורך בפעולה

שמור על הסבר חם, ברור ולא מציף. הרגע אותם אם המסמך הוא שגרתי.
חשוב: קרא את התוכן האמיתי של המסמך בזהירות. אל תניח הנחות.

MANDATORY: The "type", "summary", and "actions" fields MUST be written in Hebrew only. Do not use English.
חובה מוחלטת: כתוב הכל בעברית בלבד!`;

    // Use vision capabilities for images
    const contents = imageBase64
      ? [
          {
            role: "user" as const,
            parts: [
              { text: "נא לנתח את המסמך הזה ולהסביר אותו במילים פשוטות בעברית:" },
              { inlineData: { mimeType, data: imageBase64 } },
            ],
          },
        ]
      : [
          {
            role: "user" as const,
            parts: [{ text: `נא לנתח את המסמך הזה ולהסביר אותו במילים פשוטות בעברית:\n\n${extractedText}` }],
          },
        ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 2000,
      },
    });

    const text = response.text || "";
    console.log("AI response text:", text.substring(0, 500));
    
    // Try to parse as JSON
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = text.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
      
      // Try to find JSON object
      const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonStr = jsonObjectMatch[0];
      }
      
      console.log("Extracted JSON:", jsonStr.substring(0, 300));
      const parsed = JSON.parse(jsonStr);
      
      res.json({ 
        type: parsed.type || "מסמך",
        urgency: parsed.urgency || "low",
        summary: parsed.summary || "לא הצלחתי לנתח את המסמך במלואו.",
        actions: Array.isArray(parsed.actions) ? parsed.actions : ["עיין במסמך בזהירות"],
      });
    } catch (parseError: any) {
      console.error("JSON parse error:", parseError.message);
      console.error("Raw text was:", text.substring(0, 500));
      
      // Try to extract fields manually from partial/malformed response
      const typeMatch = text.match(/"type"\s*:\s*"([^"]+)"/);
      const urgencyMatch = text.match(/"urgency"\s*:\s*"([^"]+)"/);
      const summaryMatch = text.match(/"summary"\s*:\s*"([^"]+)"/);
      
      if (typeMatch || summaryMatch) {
        res.json({ 
          type: typeMatch?.[1] || "מסמך",
          urgency: urgencyMatch?.[1] || "low",
          summary: summaryMatch?.[1] || "ניתחתי את המסמך שלך. אנא עיין בו בזהירות.",
          actions: ["עיין במסמך בזהירות"],
        });
      } else {
        res.json({ 
          type: "מסמך",
          urgency: "low",
          summary: "ניתחתי את המסמך שלך אבל הייתה בעיה בעיבוד התשובה. נסה שוב בבקשה.",
          actions: ["נסה להעלות את המסמך שוב"],
        });
      }
    }
  } catch (error: any) {
    console.error("Letter analyze error:", error?.message || error);
    console.error("Full error:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: "Unable to analyze document",
      response: "קשה לי לקרוא את המסמך הזה. נסה לצלם תמונה נוספת עם תאורה טובה.",
      debug: error?.message 
    });
  }
});

export default router;
