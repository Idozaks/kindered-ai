import { Router, Request, Response } from "express";
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

const LIVE_MODEL = "gemini-2.0-flash-live-001";

function pcmToWav(pcmBase64: string, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const headerSize = 44;
  const fileSize = headerSize + dataSize;

  const wavBuffer = Buffer.alloc(fileSize);
  
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(fileSize - 8, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20);
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(wavBuffer, 44);
  
  return wavBuffer.toString('base64');
}

function createSystemInstruction(userName?: string, userGender?: string, context?: string): string {
  const genderPronoun = userGender === "female" ? "את" : "אתה";
  const genderGreeting = userGender === "female" ? "יקרה" : "יקר";

  return `אתה דורי, עוזר קולי חביב ותומך לקשישים בני 70+.

האישיות שלך:
- ${userName ? `אתה מדבר עם ${userName} ${genderGreeting}.` : "אתה מדבר עם משתמש יקר."}
- אתה סבלני, חם ומעודד כמו נכד אוהב.
- דבר בעברית פשוטה וברורה.
- תשובות קצרות וממוקדות (2-3 משפטים).
- השתמש בטון רך ומרגיע.

הנחיות:
- ענה תמיד בעברית בלבד.
- אם ${genderPronoun} שואל שאלה טכנית, הסבר בפשטות.
- אם ${genderPronoun} נשמע מודאג, הרגע אותו.
- בסוף התשובה, הזמן אותו להמשיך לשאול.

הקשר נוכחי: ${context || "שיחה כללית"}`;
}

router.post("/voice-turn", async (req: Request, res: Response) => {
  try {
    const { audioBase64, userName, userGender, context } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: "Audio data is required" });
    }

    const systemInstruction = createSystemInstruction(userName, userGender, context);
    
    const audioChunks: string[] = [];
    let textResponse = "";
    let sessionClosed = false;

    const responsePromise = new Promise<{ audioChunks: string[], textResponse: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!sessionClosed) {
          reject(new Error("Session timeout"));
        }
      }, 30000);

      ai.live.connect({
        model: LIVE_MODEL,
        callbacks: {
          onopen: () => {
            console.log("Live session opened");
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioChunks.push(part.inlineData.data);
                }
                if (part.text) {
                  textResponse += part.text;
                }
              }
            }
            if (message.serverContent?.turnComplete) {
              clearTimeout(timeout);
              sessionClosed = true;
              resolve({ audioChunks, textResponse });
            }
          },
          onerror: (error) => {
            clearTimeout(timeout);
            console.error("Live session error:", error);
            reject(error);
          },
          onclose: () => {
            clearTimeout(timeout);
            if (!sessionClosed) {
              sessionClosed = true;
              resolve({ audioChunks, textResponse });
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Aoede" },
            },
          },
        },
      }).then((session) => {
        session.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: audioBase64,
          },
        });
        session.sendClientContent({ turnComplete: true });
      }).catch(reject);
    });

    const result = await responsePromise;

    if (result.audioChunks.length > 0) {
      const combinedPcm = Buffer.concat(result.audioChunks.map(chunk => Buffer.from(chunk, 'base64')));
      const wavBase64 = pcmToWav(combinedPcm.toString('base64'), 24000, 1, 16);
      
      res.json({
        audioBase64: wavBase64,
        mimeType: "audio/wav",
        text: result.textResponse,
        success: true,
      });
    } else {
      res.json({
        text: result.textResponse || "סליחה, לא הצלחתי לשמוע. נסה שוב.",
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Live voice error:", error?.message || error);
    res.status(500).json({
      error: "Voice processing failed",
      fallback: true,
      text: "יש בעיה בחיבור. נסה שוב בעוד רגע.",
    });
  }
});

router.post("/voice-text", async (req: Request, res: Response) => {
  try {
    const { text, userName, userGender, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const systemInstruction = createSystemInstruction(userName, userGender, context);
    
    const audioChunks: string[] = [];
    let textResponse = "";
    let sessionClosed = false;

    const responsePromise = new Promise<{ audioChunks: string[], textResponse: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!sessionClosed) {
          reject(new Error("Session timeout"));
        }
      }, 30000);

      ai.live.connect({
        model: LIVE_MODEL,
        callbacks: {
          onopen: () => {
            console.log("Live session opened for text");
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioChunks.push(part.inlineData.data);
                }
                if (part.text) {
                  textResponse += part.text;
                }
              }
            }
            if (message.serverContent?.turnComplete) {
              clearTimeout(timeout);
              sessionClosed = true;
              resolve({ audioChunks, textResponse });
            }
          },
          onerror: (error) => {
            clearTimeout(timeout);
            console.error("Live session error:", error);
            reject(error);
          },
          onclose: () => {
            clearTimeout(timeout);
            if (!sessionClosed) {
              sessionClosed = true;
              resolve({ audioChunks, textResponse });
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Aoede" },
            },
          },
        },
      }).then((session) => {
        session.sendClientContent({
          turns: [{ role: "user", parts: [{ text }] }],
          turnComplete: true,
        });
      }).catch(reject);
    });

    const result = await responsePromise;

    if (result.audioChunks.length > 0) {
      const combinedPcm = Buffer.concat(result.audioChunks.map(chunk => Buffer.from(chunk, 'base64')));
      const wavBase64 = pcmToWav(combinedPcm.toString('base64'), 24000, 1, 16);
      
      res.json({
        audioBase64: wavBase64,
        mimeType: "audio/wav",
        text: result.textResponse,
        success: true,
      });
    } else {
      res.json({
        text: result.textResponse || "סליחה, נסה שוב.",
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Live voice-text error:", error?.message || error);
    res.status(500).json({
      error: "Voice processing failed",
      fallback: true,
      text: "יש בעיה בחיבור. נסה שוב בעוד רגע.",
    });
  }
});

export default router;
