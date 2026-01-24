export interface JourneyStep {
  text: string;
  textHe?: string;
  trainerNote?: string;
  trainerNoteHe?: string;
  image?: any;
}

export interface Journey {
  id: string;
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  steps: JourneyStep[];
}

export const stepImages: Record<string, any> = {
  "send-voice-0": require("../../assets/grandchildren-guides/send-voice-step-0.png"),
  "send-voice-1": require("../../assets/grandchildren-guides/send-voice-step-1.png"),
  "send-voice-2": require("../../assets/grandchildren-guides/send-voice-step-2.png"),
  "send-voice-3": require("../../assets/grandchildren-guides/send-voice-step-3.png"),
  "send-emoji-0": require("../../assets/grandchildren-guides/send-emoji-step-0.png"),
  "send-emoji-1": require("../../assets/grandchildren-guides/send-emoji-step-1.png"),
  "send-emoji-2": require("../../assets/grandchildren-guides/send-emoji-step-2.png"),
  "send-emoji-3": require("../../assets/grandchildren-guides/send-emoji-step-3.png"),
  "share-photo-0": require("../../assets/grandchildren-guides/share-photo-step-0.png"),
  "share-photo-1": require("../../assets/grandchildren-guides/share-photo-step-1.png"),
  "share-photo-2": require("../../assets/grandchildren-guides/share-photo-step-2.png"),
  "share-photo-3": require("../../assets/grandchildren-guides/share-photo-step-3.png"),
  "video-chat-0": require("../../assets/grandchildren-guides/video-chat-step-0.png"),
  "video-chat-1": require("../../assets/grandchildren-guides/video-chat-step-1.png"),
  "video-chat-2": require("../../assets/grandchildren-guides/video-chat-step-2.png"),
  "video-chat-3": require("../../assets/grandchildren-guides/video-chat-step-3.png"),
  "group-chat-0": require("../../assets/grandchildren-guides/group-chat-step-0.png"),
  "group-chat-1": require("../../assets/grandchildren-guides/group-chat-step-1.png"),
  "group-chat-2": require("../../assets/grandchildren-guides/group-chat-step-2.png"),
  "group-chat-3": require("../../assets/grandchildren-guides/group-chat-step-3.png"),
};

export function getStepImage(journeyId: string, stepIndex: number): any {
  return stepImages[`${journeyId}-${stepIndex}`];
}

export const grandchildrenJourneys: Journey[] = [
  {
    id: "send-voice",
    title: "Send a Voice Message",
    titleHe: "שליחת הודעה קולית",
    description: "Your voice is warmer than text",
    descriptionHe: "הקול שלך חם יותר מטקסט",
    steps: [
      {
        text: "Open WhatsApp and find your grandchild's chat. Tap on their name to open the conversation.",
        textHe: "פתח את הוואטסאפ ומצא את השיחה עם הנכד/ה. הקש על שמם כדי לפתוח את השיחה.",
        trainerNote: "Voice messages are easier than typing and feel more personal.",
        trainerNoteHe: "הודעות קוליות קלות יותר מהקלדה ומרגישות אישיות יותר.",
      },
      {
        text: "Find the microphone button on the right side of the message box. Press and HOLD it with your finger.",
        textHe: "מצא את כפתור המיקרופון בצד ימין של תיבת ההודעה. לחץ והחזק אותו עם האצבע.",
        trainerNote: "Important: They need to keep holding the button while speaking.",
        trainerNoteHe: "חשוב: צריך להמשיך להחזיק את הכפתור בזמן הדיבור.",
      },
      {
        text: "While holding the button, speak your message clearly. Say something like 'Hi, thinking of you!'",
        textHe: "תוך כדי לחיצה על הכפתור, דבר את ההודעה שלך בבהירות. אמור משהו כמו 'היי, חשבתי עליך!'",
        trainerNote: "Encourage them to smile while speaking - grandchildren can hear it!",
        trainerNoteHe: "עודד אותם לחייך בזמן הדיבור - הנכדים יכולים לשמוע את זה!",
      },
      {
        text: "When you finish speaking, lift your finger. The message will be sent automatically!",
        textHe: "כשסיימת לדבר, הרם את האצבע. ההודעה תישלח אוטומטית!",
        trainerNote: "If they make a mistake, they can swipe left to cancel before releasing.",
        trainerNoteHe: "אם טעו, אפשר להחליק שמאלה לביטול לפני שמרימים את האצבע.",
      },
    ],
  },
  {
    id: "send-emoji",
    title: "Send Emoji Reactions",
    titleHe: "שליחת תגובות אימוג'י",
    description: "React with hearts and smiles",
    descriptionHe: "הגיבו עם לבבות וחיוכים",
    steps: [
      {
        text: "When your grandchild sends you a photo or message, you can react with a quick emoji!",
        textHe: "כשהנכד/ה שולחים לך תמונה או הודעה, אתה יכול להגיב עם אימוג'י מהיר!",
        trainerNote: "Emoji reactions are quick ways to show love without typing.",
        trainerNoteHe: "תגובות אימוג'י הן דרכים מהירות להראות אהבה בלי להקליד.",
      },
      {
        text: "Press and hold on the message or photo for 2 seconds. A row of emoji will appear above it.",
        textHe: "לחץ והחזק על ההודעה או התמונה למשך 2 שניות. שורה של אימוג'י תופיע מעליה.",
        trainerNote: "Common options include heart, thumbs up, laughing, surprised, sad, and prayer hands.",
        trainerNoteHe: "האפשרויות הנפוצות כוללות לב, אגודל למעלה, צוחק, מופתע, עצוב וידיים מתפללות.",
      },
      {
        text: "Tap on the heart emoji to show love, or choose any other emoji you like.",
        textHe: "הקש על אימוג'י הלב כדי להראות אהבה, או בחר כל אימוג'י אחר שאתה אוהב.",
        trainerNote: "The heart is the most popular choice for family messages.",
        trainerNoteHe: "הלב הוא הבחירה הפופולרית ביותר להודעות משפחתיות.",
      },
      {
        text: "Your grandchild will see a small heart appear on their message. They'll know you love it!",
        textHe: "הנכד/ה יראו לב קטן מופיע על ההודעה שלהם. הם ידעו שאתה אוהב את זה!",
        trainerNote: "Reactions help maintain connection even when too busy to type.",
        trainerNoteHe: "תגובות עוזרות לשמור על קשר גם כשעסוקים מדי להקליד.",
      },
    ],
  },
  {
    id: "share-photo",
    title: "Share Photos from Your Day",
    titleHe: "שתפו תמונות מהיום שלכם",
    description: "Stay connected through pictures",
    descriptionHe: "הישארו בקשר דרך תמונות",
    steps: [
      {
        text: "Open the camera app and take a photo of something from your day - your garden, lunch, or a walk.",
        textHe: "פתח את אפליקציית המצלמה וצלם תמונה של משהו מהיום שלך - הגינה, ארוחת צהריים או טיול.",
        trainerNote: "Simple everyday photos help grandchildren feel connected to your life.",
        trainerNoteHe: "תמונות יומיומיות פשוטות עוזרות לנכדים להרגיש מחוברים לחייך.",
      },
      {
        text: "Open WhatsApp and go to your grandchild's chat. Tap the plus (+) or camera icon next to the message box.",
        textHe: "פתח את הוואטסאפ ועבור לשיחה עם הנכד/ה. הקש על הפלוס (+) או סמל המצלמה ליד תיבת ההודעה.",
        trainerNote: "The icon location may vary slightly between phone types.",
        trainerNoteHe: "מיקום הסמל עשוי להשתנות מעט בין סוגי טלפונים.",
      },
      {
        text: "Choose 'Gallery' or 'Photos' to find the picture you just took. Tap on it to select it.",
        textHe: "בחר 'גלריה' או 'תמונות' כדי למצוא את התמונה שצילמת. הקש עליה כדי לבחור אותה.",
        trainerNote: "Recent photos appear first at the top of the gallery.",
        trainerNoteHe: "תמונות אחרונות מופיעות ראשונות בראש הגלריה.",
      },
      {
        text: "Add a short message like 'Look what I found!' then tap the send button (green arrow).",
        textHe: "הוסף הודעה קצרה כמו 'תראו מה מצאתי!' ואז הקש על כפתור השליחה (חץ ירוק).",
        trainerNote: "A caption makes the photo more meaningful and starts a conversation.",
        trainerNoteHe: "כיתוב הופך את התמונה למשמעותית יותר ופותח שיחה.",
      },
    ],
  },
  {
    id: "video-chat",
    title: "Start a Video Call",
    titleHe: "התחילו שיחת וידאו",
    description: "See each other face to face",
    descriptionHe: "ראו אחד את השני פנים אל פנים",
    steps: [
      {
        text: "Open WhatsApp and find your grandchild's name in your chat list. Tap to open their conversation.",
        textHe: "פתח את הוואטסאפ ומצא את שם הנכד/ה ברשימת השיחות שלך. הקש כדי לפתוח את השיחה.",
        trainerNote: "Video calls work best with good lighting and WiFi connection.",
        trainerNoteHe: "שיחות וידאו עובדות הכי טוב עם תאורה טובה וחיבור WiFi.",
      },
      {
        text: "Look at the top right corner. You'll see a video camera icon. Tap on it once.",
        textHe: "הסתכל בפינה הימנית העליונה. תראה סמל של מצלמת וידאו. הקש עליו פעם אחת.",
        trainerNote: "Make sure the phone is upright so your face fills the screen nicely.",
        trainerNoteHe: "וודא שהטלפון זקוף כדי שהפנים שלך ימלאו את המסך יפה.",
      },
      {
        text: "Wait for your grandchild to answer. You'll see yourself in a small box and them in the big screen.",
        textHe: "חכה שהנכד/ה יענו. תראה את עצמך בתיבה קטנה ואותם במסך הגדול.",
        trainerNote: "Encourage them to wave and smile when the call connects!",
        trainerNoteHe: "עודד אותם לנופף ולחייך כשהשיחה מתחברת!",
      },
      {
        text: "To end the call, tap the red phone button at the bottom of the screen.",
        textHe: "לסיום השיחה, הקש על כפתור הטלפון האדום בתחתית המסך.",
        trainerNote: "Video calls are the next best thing to being there in person.",
        trainerNoteHe: "שיחות וידאו הן הדבר הכי קרוב לנוכחות אישית.",
      },
    ],
  },
  {
    id: "group-chat",
    title: "Stay Active in Family Group",
    titleHe: "הישארו פעילים בקבוצת המשפחה",
    description: "Join the family conversation",
    descriptionHe: "הצטרפו לשיחה המשפחתית",
    steps: [
      {
        text: "Open WhatsApp and find your family group. It might have a name like 'Family' or 'The Cohens' with many members.",
        textHe: "פתח את הוואטסאפ ומצא את קבוצת המשפחה שלך. יכול להיות שיש לה שם כמו 'משפחה' או 'הכהנים' עם הרבה חברים.",
        trainerNote: "Group chats have a group icon instead of a profile photo.",
        trainerNoteHe: "לשיחות קבוצתיות יש סמל קבוצה במקום תמונת פרופיל.",
      },
      {
        text: "Read through the recent messages by scrolling up. You can see what everyone has been sharing.",
        textHe: "קרא את ההודעות האחרונות על ידי גלילה למעלה. אתה יכול לראות מה כולם שיתפו.",
        trainerNote: "Encourage them to check the group at least once a day.",
        trainerNoteHe: "עודד אותם לבדוק את הקבוצה לפחות פעם ביום.",
      },
      {
        text: "React to photos and messages with hearts by pressing and holding. This shows you're paying attention!",
        textHe: "הגב לתמונות ולהודעות עם לבבות על ידי לחיצה ארוכה. זה מראה שאתה שם לב!",
        trainerNote: "Even small reactions make family members feel appreciated.",
        trainerNoteHe: "גם תגובות קטנות גורמות לבני המשפחה להרגיש מוערכים.",
      },
      {
        text: "Share something yourself - a photo, voice message, or just 'Good morning!' to start the day.",
        textHe: "שתף משהו בעצמך - תמונה, הודעה קולית, או רק 'בוקר טוב!' כדי להתחיל את היום.",
        trainerNote: "Being active in the group strengthens the family bond.",
        trainerNoteHe: "להיות פעיל בקבוצה מחזק את הקשר המשפחתי.",
      },
    ],
  },
];
