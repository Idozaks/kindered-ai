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

// Separate client for TTS using user's own API key for better quality
const ttsAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
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

// Helper to generate TTS audio (non-blocking)
async function generateTTSAudio(text: string): Promise<{audioBase64: string, mimeType: string} | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  
  try {
    const response = await ttsAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: "user" as const, parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (audioData?.data) {
      return { audioBase64: pcmToWav(audioData.data, 24000, 1, 16), mimeType: "audio/wav" };
    }
  } catch (error) {
    console.log("TTS generation failed:", error);
  }
  return null;
}

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

    const systemPrompt = `אתה עוזר ישראלי שמסביר מסמכים לקשישים. אתה מדבר רק עברית. אסור לך להשתמש באנגלית בכלל.

ענה בפורמט JSON:
{
  "type": "כתוב כאן את סוג המסמך בעברית בלבד",
  "urgency": "high" או "medium" או "low",
  "summary": "כתוב כאן הסבר בעברית בלבד. הסבר במילים פשוטות מה המסמך הזה ומה צריך לעשות. 2-3 משפטים.",
  "actions": ["כתוב פעולה ראשונה בעברית", "כתוב פעולה שנייה בעברית"]
}

דחיפות:
- high = צריך לשלם או לפעול מיד
- medium = צריך לטפל השבוע  
- low = מידע בלבד

חשוב מאוד: כל מה שאתה כותב חייב להיות בעברית. אסור אנגלית. גם ה-type, גם ה-summary, גם ה-actions - הכל בעברית בלבד.

דוגמה נכונה:
{
  "type": "חשבון ארנונה",
  "urgency": "medium",
  "summary": "זה חשבון הארנונה השנתי שלך מעיריית ראש העין. הסכום לתשלום הוא 2,666 שקל. יש לשלם עד סוף החודש.",
  "actions": ["לבדוק את הסכום", "לשלם בבנק או באתר העירייה"]
}`;

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
    
    // Helper to build result and generate TTS in parallel
    const buildResult = (parsed: any) => ({
      type: parsed.type || "מסמך",
      urgency: parsed.urgency || "low",
      summary: parsed.summary || "לא הצלחתי לנתח את המסמך במלואו.",
      actions: Array.isArray(parsed.actions) ? parsed.actions : ["עיין במסמך בזהירות"],
    });

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
      const result = buildResult(parsed);
      
      // Return result immediately - TTS will be fetched separately by client
      res.json(result);
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

// Helper function to convert PCM to WAV
function pcmToWav(pcmBase64: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const wavBuffer = Buffer.alloc(fileSize);
  
  // RIFF header
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(fileSize - 8, 4);
  wavBuffer.write('WAVE', 8);
  
  // fmt chunk
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);
  
  return wavBuffer.toString('base64');
}

// Text-to-Speech using Gemini TTS model
router.post("/tts", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check if user has provided their own API key
    if (!process.env.GEMINI_API_KEY) {
      console.log("TTS: No GEMINI_API_KEY, using fallback");
      return res.json({ fallback: true, text });
    }

    console.log("TTS: Generating audio for text:", text.substring(0, 50) + "...");

    // Use the dedicated TTS model with user's API key
    const response = await ttsAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          role: "user" as const,
          parts: [{ text: text }],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede",
            },
          },
        },
      },
    });

    console.log("TTS: Response received, checking for audio data...");

    // Get audio data from response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (audioData?.data) {
      console.log("TTS: Audio data received, mimeType:", audioData.mimeType);
      
      // Convert PCM to WAV for browser compatibility
      const wavBase64 = pcmToWav(audioData.data, 24000, 1, 16);
      
      res.json({ 
        audioBase64: wavBase64,
        mimeType: "audio/wav"
      });
    } else {
      console.log("TTS: No audio data in response, using fallback");
      console.log("TTS: Response structure:", JSON.stringify(response.candidates?.[0]?.content?.parts?.[0], null, 2)?.substring(0, 200));
      res.json({ fallback: true, text });
    }
  } catch (error: any) {
    console.error("TTS error:", error?.message || error);
    console.error("TTS error details:", JSON.stringify(error, null, 2)?.substring(0, 500));
    // Return fallback flag so client can use expo-speech
    res.json({ fallback: true, text: req.body.text });
  }
});

// Letter Helper Chat - follow-up questions about document
router.post("/letter-chat", async (req, res) => {
  try {
    const { message, documentContext, imageBase64 } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemPrompt = `אתה עוזר ישראלי חביב שעוזר לקשישים להבין מסמכים. דבר בעברית פשוטה וברורה.
    
הקשר המסמך: ${documentContext || "לא ידוע"}

ענה בעברית פשוטה ובהירה. השתמש במילים יומיומיות. אל תשתמש במונחים מקצועיים.
אם המשתמש שואל על משהו שלא קשור למסמך, עזור לו בכל זאת בצורה חמה ואדיבה.`;

    const contents = imageBase64
      ? [
          {
            role: "user" as const,
            parts: [
              { text: message },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            ],
          },
        ]
      : [
          {
            role: "user" as const,
            parts: [{ text: message }],
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

    const text = response.text || "סליחה, לא הצלחתי להבין. נסה לשאול שוב.";
    res.json({ response: text });
  } catch (error: any) {
    console.error("Letter chat error:", error?.message || error);
    res.status(500).json({ 
      error: "Chat failed",
      response: "סליחה, יש בעיה. נסה שוב.",
    });
  }
});

export default router;
