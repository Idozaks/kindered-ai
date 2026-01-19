import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

interface StepImageConfig {
  journeyId: string;
  stepIndex: number;
  prompt: string;
}

const whatsappStepPrompts: StepImageConfig[] = [
  // Journey 1: Read a Message
  {
    journeyId: "read-message",
    stepIndex: 0,
    prompt: "Minimalist illustration of a smartphone home screen with a green WhatsApp icon highlighted with a glowing circle, finger about to tap it, clean flat design, senior-friendly large icons, soft pastel background, no text or labels"
  },
  {
    journeyId: "read-message",
    stepIndex: 1,
    prompt: "Simple illustration of WhatsApp chat list screen showing conversation bubbles with profile pictures, clean interface design, large readable layout, soft colors, senior-friendly UI mockup, no text or readable names"
  },
  {
    journeyId: "read-message",
    stepIndex: 2,
    prompt: "Illustration of WhatsApp chat list with one conversation highlighted showing a notification badge dot, simple clean design, large touch targets, soft pastel colors, senior-friendly interface, no readable text"
  },
  {
    journeyId: "read-message",
    stepIndex: 3,
    prompt: "Simple illustration of a finger tapping on a chat conversation item in a messaging app, clean flat design, large touch target highlighted, soft colors, senior-friendly UI, no text"
  },
  {
    journeyId: "read-message",
    stepIndex: 4,
    prompt: "Illustration of WhatsApp conversation screen with message bubbles, arrow indicating upward scrolling motion, clean simple design, senior-friendly large elements, soft pastel colors, no readable text"
  },
  {
    journeyId: "read-message",
    stepIndex: 5,
    prompt: "Simple illustration of WhatsApp screen with back arrow button highlighted at top, finger pointing to it, clean flat design, senior-friendly large icons, soft pastel background, no text"
  },

  // Journey 2: Send a Text Message
  {
    journeyId: "send-text",
    stepIndex: 0,
    prompt: "Minimalist illustration showing WhatsApp app icon being opened, clean flat design, green accent colors, senior-friendly large icons, soft background, no text"
  },
  {
    journeyId: "send-text",
    stepIndex: 1,
    prompt: "Illustration of WhatsApp interface showing new message button highlighted, speech bubble icon with green accent, clean simple design, large touch targets, senior-friendly UI, no text"
  },
  {
    journeyId: "send-text",
    stepIndex: 2,
    prompt: "Simple illustration of messaging app with text input box at bottom highlighted, keyboard appearing, clean flat design, senior-friendly large elements, soft colors, no readable text"
  },
  {
    journeyId: "send-text",
    stepIndex: 3,
    prompt: "Illustration of fingers typing on smartphone keyboard with message bubble forming above, simple clean design, senior-friendly large keys, soft pastel colors, no readable text"
  },
  {
    journeyId: "send-text",
    stepIndex: 4,
    prompt: "Illustration of WhatsApp message screen with green send arrow button highlighted, finger about to tap it, clean flat design, large touch targets, senior-friendly UI, no text"
  },
  {
    journeyId: "send-text",
    stepIndex: 5,
    prompt: "Simple illustration of sent message appearing on right side of chat screen with checkmarks, clean design, WhatsApp green accent, senior-friendly large elements, no readable text"
  },

  // Journey 3: Send a Photo
  {
    journeyId: "send-photo",
    stepIndex: 0,
    prompt: "Illustration of WhatsApp chat conversation open and ready, clean simple interface design, senior-friendly large elements, soft pastel colors, no readable text"
  },
  {
    journeyId: "send-photo",
    stepIndex: 1,
    prompt: "Simple illustration of attachment button (paperclip or plus icon) highlighted in messaging app, finger pointing to it, clean flat design, senior-friendly large icons, no text"
  },
  {
    journeyId: "send-photo",
    stepIndex: 2,
    prompt: "Illustration of attachment menu with camera icon highlighted, clean simple popup design, large touch targets, senior-friendly icons, soft colors, no text labels"
  },
  {
    journeyId: "send-photo",
    stepIndex: 3,
    prompt: "Simple illustration of camera viewfinder with large round capture button at bottom, clean minimal design, senior-friendly large button, soft colors, no text"
  },
  {
    journeyId: "send-photo",
    stepIndex: 4,
    prompt: "Illustration of photo preview screen with green send arrow and X cancel button, clean simple design, large touch targets, senior-friendly UI, no text"
  },
  {
    journeyId: "send-photo",
    stepIndex: 5,
    prompt: "Illustration of attachment menu showing gallery or photos option highlighted, grid of photo thumbnails below, clean design, senior-friendly large icons, no text"
  },
  {
    journeyId: "send-photo",
    stepIndex: 6,
    prompt: "Simple illustration of photo selection screen with one photo selected (checkmark), send button visible, clean flat design, senior-friendly large elements, no text"
  },

  // Journey 4: Make a Video Call
  {
    journeyId: "video-call",
    stepIndex: 0,
    prompt: "Minimalist illustration of WhatsApp opening with good wifi signal indicator, clean flat design, senior-friendly large icons, soft colors, no text"
  },
  {
    journeyId: "video-call",
    stepIndex: 1,
    prompt: "Simple illustration of finger tapping on a contact name in chat list, clean design, large touch targets, senior-friendly UI, soft pastel colors, no readable text"
  },
  {
    journeyId: "video-call",
    stepIndex: 2,
    prompt: "Illustration of WhatsApp conversation header with video camera icon highlighted, finger pointing to it, clean flat design, senior-friendly large icons, no text"
  },
  {
    journeyId: "video-call",
    stepIndex: 3,
    prompt: "Illustration of video call connecting screen with small self-view camera preview, ringing animation, clean simple design, senior-friendly large elements, no text"
  },
  {
    journeyId: "video-call",
    stepIndex: 4,
    prompt: "Simple illustration of active video call showing two people faces in split screen, connected state, clean minimal design, senior-friendly, no text"
  },
  {
    journeyId: "video-call",
    stepIndex: 5,
    prompt: "Illustration of video call screen with red end call button highlighted at bottom, finger about to tap it, clean flat design, senior-friendly large button, no text"
  },

  // Journey 5: Family Groups & Safety
  {
    journeyId: "family-groups",
    stepIndex: 0,
    prompt: "Illustration of WhatsApp chat list showing a group conversation with multiple profile pictures, clean simple design, senior-friendly large elements, soft colors, no readable text"
  },
  {
    journeyId: "family-groups",
    stepIndex: 1,
    prompt: "Simple illustration of group chat with multiple colored message bubbles from different people, eye icons showing visibility, clean design, senior-friendly, no text"
  },
  {
    journeyId: "family-groups",
    stepIndex: 2,
    prompt: "Illustration of group chat message input area with send button, similar to regular chat, clean flat design, senior-friendly large elements, no text"
  },
  {
    journeyId: "family-groups",
    stepIndex: 3,
    prompt: "Warning style illustration with crossed out icons for ID card, bank card, and password lock, clean simple safety design, senior-friendly icons, red warning accent, no text"
  },
  {
    journeyId: "family-groups",
    stepIndex: 4,
    prompt: "Illustration of suspicious link message with warning triangle, question mark bubble, clean safety-focused design, senior-friendly large icons, orange caution colors, no text"
  },
  {
    journeyId: "family-groups",
    stepIndex: 5,
    prompt: "Comforting illustration of person talking to family member about phone concern, speech bubbles, warm supportive feeling, clean simple design, senior-friendly, no text"
  },

  // Journey 6: Privacy Settings
  {
    journeyId: "privacy-settings",
    stepIndex: 0,
    prompt: "Illustration of WhatsApp three-dot menu being tapped with settings option highlighted, clean flat design, senior-friendly large icons, soft colors, no text"
  },
  {
    journeyId: "privacy-settings",
    stepIndex: 1,
    prompt: "Simple illustration of settings menu with privacy option highlighted with lock icon, clean design, senior-friendly large touch targets, soft colors, no text"
  },
  {
    journeyId: "privacy-settings",
    stepIndex: 2,
    prompt: "Illustration of profile photo privacy setting with contacts-only option selected, checkmark indicator, clean simple design, senior-friendly, no text"
  },
  {
    journeyId: "privacy-settings",
    stepIndex: 3,
    prompt: "Illustration of last seen privacy setting with toggle options, contacts only highlighted, clean flat design, senior-friendly large elements, no text"
  },
  {
    journeyId: "privacy-settings",
    stepIndex: 4,
    prompt: "Simple illustration of groups privacy setting showing contacts-only option, shield icon, clean design, senior-friendly large elements, soft colors, no text"
  },
  {
    journeyId: "privacy-settings",
    stepIndex: 5,
    prompt: "Illustration of silence unknown callers toggle switch being turned on, phone with mute icon, clean simple design, senior-friendly large elements, no text"
  },

  // Journey 7: Leave a Group
  {
    journeyId: "leave-group",
    stepIndex: 0,
    prompt: "Illustration of group chat being opened from chat list, group icon with multiple people, clean flat design, senior-friendly large elements, soft colors, no text"
  },
  {
    journeyId: "leave-group",
    stepIndex: 1,
    prompt: "Simple illustration of finger tapping on group name header at top of chat, clean design, large touch target highlighted, senior-friendly UI, no text"
  },
  {
    journeyId: "leave-group",
    stepIndex: 2,
    prompt: "Illustration of group info screen scrolled to bottom with exit group option visible, exit door icon, clean simple design, senior-friendly, no text"
  },
  {
    journeyId: "leave-group",
    stepIndex: 3,
    prompt: "Simple illustration of confirmation dialog with exit button being tapped, clean flat design, senior-friendly large buttons, soft colors, no text"
  },
  {
    journeyId: "leave-group",
    stepIndex: 4,
    prompt: "Peaceful illustration of successfully leaving group with checkmark, wave goodbye icon, clean simple design, relieved feeling, senior-friendly, no text"
  },
];

async function generateImage(prompt: string): Promise<string> {
  console.log("Generating image with prompt:", prompt.substring(0, 50) + "...");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }

  return imagePart.inlineData.data;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAllImages() {
  const outputDir = path.resolve(process.cwd(), "assets", "whatsapp-guides");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating ${whatsappStepPrompts.length} images...`);
  console.log(`Output directory: ${outputDir}`);

  const results: { journeyId: string; stepIndex: number; filename: string }[] = [];

  for (let i = 0; i < whatsappStepPrompts.length; i++) {
    const config = whatsappStepPrompts[i];
    const filename = `${config.journeyId}-step-${config.stepIndex}.png`;
    const filepath = path.join(outputDir, filename);

    if (fs.existsSync(filepath)) {
      console.log(`[${i + 1}/${whatsappStepPrompts.length}] Skipping existing: ${filename}`);
      results.push({ journeyId: config.journeyId, stepIndex: config.stepIndex, filename });
      continue;
    }

    try {
      console.log(`[${i + 1}/${whatsappStepPrompts.length}] Generating: ${filename}`);
      
      const base64Data = await generateImage(config.prompt);
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(filepath, buffer);
      
      console.log(`  ✓ Saved: ${filename} (${buffer.length} bytes)`);
      results.push({ journeyId: config.journeyId, stepIndex: config.stepIndex, filename });

      if (i < whatsappStepPrompts.length - 1) {
        await sleep(2000);
      }
    } catch (error) {
      console.error(`  ✗ Failed: ${filename}`, error);
      await sleep(5000);
    }
  }

  const mappingPath = path.join(outputDir, "image-mapping.json");
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\nImage mapping saved to: ${mappingPath}`);
  console.log(`Generated ${results.length} images successfully.`);
}

generateAllImages().catch(console.error);
