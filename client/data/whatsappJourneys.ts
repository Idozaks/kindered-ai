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
  "read-message-0": require("../../assets/whatsapp-guides/read-message-step-0.png"),
  "read-message-1": require("../../assets/whatsapp-guides/read-message-step-1.png"),
  "read-message-2": require("../../assets/whatsapp-guides/read-message-step-2.png"),
  "read-message-3": require("../../assets/whatsapp-guides/read-message-step-3.png"),
  "read-message-4": require("../../assets/whatsapp-guides/read-message-step-4.png"),
  "read-message-5": require("../../assets/whatsapp-guides/read-message-step-5.png"),
  "send-text-0": require("../../assets/whatsapp-guides/send-text-step-0.png"),
  "send-text-1": require("../../assets/whatsapp-guides/send-text-step-1.png"),
  "send-text-2": require("../../assets/whatsapp-guides/send-text-step-2.png"),
  "send-text-3": require("../../assets/whatsapp-guides/send-text-step-3.png"),
  "send-text-4": require("../../assets/whatsapp-guides/send-text-step-4.png"),
  "send-text-5": require("../../assets/whatsapp-guides/send-text-step-5.png"),
  "send-photo-0": require("../../assets/whatsapp-guides/send-photo-step-0.png"),
  "send-photo-1": require("../../assets/whatsapp-guides/send-photo-step-1.png"),
  "send-photo-2": require("../../assets/whatsapp-guides/send-photo-step-2.png"),
  "send-photo-3": require("../../assets/whatsapp-guides/send-photo-step-3.png"),
  "send-photo-4": require("../../assets/whatsapp-guides/send-photo-step-4.png"),
  "send-photo-5": require("../../assets/whatsapp-guides/send-photo-step-5.png"),
  "send-photo-6": require("../../assets/whatsapp-guides/send-photo-step-6.png"),
  "video-call-0": require("../../assets/whatsapp-guides/video-call-step-0.png"),
  "video-call-1": require("../../assets/whatsapp-guides/video-call-step-1.png"),
  "video-call-2": require("../../assets/whatsapp-guides/video-call-step-2.png"),
  "video-call-3": require("../../assets/whatsapp-guides/video-call-step-3.png"),
  "video-call-4": require("../../assets/whatsapp-guides/video-call-step-4.png"),
  "video-call-5": require("../../assets/whatsapp-guides/video-call-step-5.png"),
  "family-groups-0": require("../../assets/whatsapp-guides/family-groups-step-0.png"),
  "family-groups-1": require("../../assets/whatsapp-guides/family-groups-step-1.png"),
  "family-groups-2": require("../../assets/whatsapp-guides/family-groups-step-2.png"),
  "family-groups-3": require("../../assets/whatsapp-guides/family-groups-step-3.png"),
  "family-groups-4": require("../../assets/whatsapp-guides/family-groups-step-4.png"),
  "family-groups-5": require("../../assets/whatsapp-guides/family-groups-step-5.png"),
  "privacy-settings-0": require("../../assets/whatsapp-guides/privacy-settings-step-0.png"),
  "privacy-settings-1": require("../../assets/whatsapp-guides/privacy-settings-step-1.png"),
  "privacy-settings-2": require("../../assets/whatsapp-guides/privacy-settings-step-2.png"),
  "privacy-settings-3": require("../../assets/whatsapp-guides/privacy-settings-step-3.png"),
  "privacy-settings-4": require("../../assets/whatsapp-guides/privacy-settings-step-4.png"),
  "privacy-settings-5": require("../../assets/whatsapp-guides/privacy-settings-step-5.png"),
  "leave-group-0": require("../../assets/whatsapp-guides/leave-group-step-0.png"),
  "leave-group-1": require("../../assets/whatsapp-guides/leave-group-step-1.png"),
  "leave-group-2": require("../../assets/whatsapp-guides/leave-group-step-2.png"),
  "leave-group-3": require("../../assets/whatsapp-guides/leave-group-step-3.png"),
  "leave-group-4": require("../../assets/whatsapp-guides/leave-group-step-4.png"),
};

export function getStepImage(journeyId: string, stepIndex: number): any {
  return stepImages[`${journeyId}-${stepIndex}`];
}

export const whatsappJourneys: Journey[] = [
  {
    id: "read-message",
    title: "Read a Message",
    titleHe: "קריאת הודעה",
    description: "Learn to open and read messages",
    descriptionHe: "למד איך לפתוח ולקרוא הודעות",
    steps: [
      {
        text: "Find the WhatsApp icon on your home screen. It is green with a white telephone. Tap it once.",
        textHe: "מצא את סמל הוואטסאפ במסך הבית שלך. הוא ירוק עם טלפון לבן. הקש עליו פעם אחת.",
        trainerNote: "Help them locate the icon if needed.",
        trainerNoteHe: "עזור להם למצוא את הסמל אם צריך.",
      },
      {
        text: "You are now on Chats. This is your list of conversations.",
        textHe: "אתה נמצא עכשיו ב'צ'אטים'. זו רשימת השיחות שלך.",
        trainerNote: "Point out familiar names in the list.",
        trainerNoteHe: "הצבע על שמות מוכרים ברשימה.",
      },
      {
        text: "Look for the person's name. If you see a small number or dot next to it, there is a new message.",
        textHe: "חפש את שם האדם. אם אתה רואה מספר קטן או נקודה לידו, יש הודעה חדשה.",
        trainerNote: "The number shows how many unread messages.",
        trainerNoteHe: "המספר מראה כמה הודעות שלא נקראו יש.",
      },
      {
        text: "Tap their name once.",
        textHe: "הקש על שמם פעם אחת.",
        trainerNote: "Wait for the conversation to open.",
        trainerNoteHe: "חכה שהשיחה תיפתח.",
      },
      {
        text: "New messages are at the bottom of the screen. Slide your finger up to see older messages.",
        textHe: "הודעות חדשות נמצאות בתחתית המסך. החלק את האצבע למעלה כדי לראות הודעות ישנות יותר.",
        trainerNote: "Demonstrate the scrolling motion slowly.",
        trainerNoteHe: "הדגם את תנועת הגלילה לאט.",
      },
      {
        text: "Tap the back arrow at the top-left to return to the list of chats.",
        textHe: "הקש על חץ החזרה בפינה העליונה (בדרך כלל בצד ימין בעברית) כדי לחזור לרשימת הצ'אטים.",
        trainerNote: "On some phones, you can also swipe right.",
        trainerNoteHe: "בטלפונים מסוימים, אפשר גם להחליק ימינה.",
      },
    ],
  },
  {
    id: "send-text",
    title: "Send a Text Message",
    titleHe: "שליחת הודעת טקסט",
    description: "Write and send a simple message",
    descriptionHe: "כתוב ושלח הודעה פשוטה",
    steps: [
      {
        text: "Open WhatsApp and go to Chats.",
        textHe: "פתח את וואטסאפ ועבור לצ'אטים.",
        trainerNote: "Same as Journey 1, Step 1.",
        trainerNoteHe: "אותו דבר כמו שלב 1 במדריך הראשון.",
      },
      {
        text: "To reply, tap the person's name. To start a new chat, tap the green message button, then tap the person's name.",
        textHe: "כדי לענות, הקש על שם האדם. כדי להתחיל צ'אט חדש, הקש על כפתור ההודעה הירוק, ואז על שם האדם.",
        trainerNote: "The button may look like a speech bubble or plus sign.",
        trainerNoteHe: "הכפתור עשוי להיראות כמו בועת דיבור או סימן פלוס.",
      },
      {
        text: "At the bottom, tap the long white box. The keyboard appears.",
        textHe: "בתחתית, הקש על התיבה הלבנה הארוכה. המקלדת תופיע.",
        trainerNote: "This is the message input area.",
        trainerNoteHe: "זהו אזור הזנת ההודעה.",
      },
      {
        text: 'Type a short message, for example: "Hello, I can see your message."',
        textHe: 'הקלד הודעה קצרה, למשל: "שלום, אני רואה את ההודעה שלך."',
        trainerNote: "Help with typing if needed.",
        trainerNoteHe: "עזור בהקלדה אם צריך.",
      },
      {
        text: "Tap the green send arrow or paper airplane.",
        textHe: "הקש על חץ השליחה הירוק או על מטוס הנייר.",
        trainerNote: "It's on the right side of the text box.",
        trainerNoteHe: "זה נמצא בצד של תיבת הטקסט.",
      },
      {
        text: "Your message appears on the right side of the screen. That means it was sent.",
        textHe: "ההודעה שלך מופיעה בצד המסך. זה אומר שהיא נשלחה.",
        trainerNote: "Blue ticks mean it was read.",
        trainerNoteHe: "וי כחול אומר שההודעה נקראה.",
      },
    ],
  },
  {
    id: "send-photo",
    title: "Send a Photo",
    titleHe: "שליחת תמונה",
    description: "Share photos with family and friends",
    descriptionHe: "שתף תמונות עם משפחה וחברים",
    steps: [
      {
        text: "Open the chat with the person you want to send a photo to.",
        textHe: "פתח את הצ'אט עם האדם שאליו אתה רוצה לשלוח תמונה.",
        trainerNote: "Same as starting a conversation.",
        trainerNoteHe: "כמו להתחיל שיחה.",
      },
      {
        text: "Tap the paperclip or plus (+) next to the typing box.",
        textHe: "הקש על האטב או הפלוס (+) ליד תיבת ההקלדה.",
        trainerNote: "This opens the attachment menu.",
        trainerNoteHe: "זה פותח את תפריט הצירופים.",
      },
      {
        text: "To take a new photo: Tap Camera.",
        textHe: "כדי לצלם תמונה חדשה: הקש על 'מצלמה'.",
        trainerNote: "For existing photos, see next steps.",
        trainerNoteHe: "לתמונות קיימות, ראה את השלבים הבאים.",
      },
      {
        text: "Point the camera and tap the big round button to take the picture.",
        textHe: "כוון את המצלמה והקש על הכפתור העגול הגדול כדי לצלם.",
        trainerNote: "Hold the phone steady.",
        trainerNoteHe: "החזק את הטלפון יציב.",
      },
      {
        text: "If you like the photo, tap the green Send arrow. If not, tap X or Back and try again.",
        textHe: "אם אתה אוהב את התמונה, הקש על חץ השליחה הירוק. אם לא, הקש על X או חזור ונסה שוב.",
        trainerNote: "You can also add a caption before sending.",
        trainerNoteHe: "אפשר גם להוסיף כיתוב לפני השליחה.",
      },
      {
        text: "To send an existing photo: Tap the paperclip/plus again, then tap Gallery or Photos.",
        textHe: "כדי לשלוח תמונה קיימת: הקש שוב על האטב/פלוס, ואז על 'גלריה' או 'תמונות'.",
        trainerNote: "This shows your saved photos.",
        trainerNoteHe: "זה מציג את התמונות השמורות שלך.",
      },
      {
        text: "Tap the picture you want, then tap Send.",
        textHe: "הקש על התמונה שאתה רוצה, ואז על 'שלח'.",
        trainerNote: "You can select multiple photos.",
        trainerNoteHe: "אפשר לבחור כמה תמונות.",
      },
    ],
  },
  {
    id: "video-call",
    title: "Make a Video Call",
    titleHe: "ביצוע שיחת וידאו",
    description: "See and talk to someone face-to-face",
    descriptionHe: "ראה ודבר עם מישהו פנים אל פנים",
    steps: [
      {
        text: "Open WhatsApp and go to Chats.",
        textHe: "פתח את וואטסאפ ועבור לצ'אטים.",
        trainerNote: "Make sure you have good internet.",
        trainerNoteHe: "ודא שיש לך אינטרנט טוב.",
      },
      {
        text: "Tap the name of the person you want to see.",
        textHe: "הקש על שם האדם שאתה רוצה לראות.",
        trainerNote: "Open their conversation.",
        trainerNoteHe: "פתח את השיחה איתם.",
      },
      {
        text: "At the top-right, tap the video camera icon.",
        textHe: "בפינה העליונה, הקש על סמל מצלמת הווידאו.",
        trainerNote: "It looks like a small camera.",
        trainerNoteHe: "זה נראה כמו מצלמה קטנה.",
      },
      {
        text: "Wait while it rings. You will see your face on the screen.",
        textHe: "חכה בזמן שזה מחייג. תראה את הפנים שלך על המסך.",
        trainerNote: "Check that the camera shows your face clearly.",
        trainerNoteHe: "בדוק שהמצלמה מראה את הפנים שלך בבירור.",
      },
      {
        text: "When they answer, you will both see each other. Speak normally.",
        textHe: "כשהם יענו, שניכם תראו זה את זה. דברו כרגיל.",
        trainerNote: "Hold the phone at arm's length for best view.",
        trainerNoteHe: "החזק את הטלפון במרחק יד לתצוגה הטובה ביותר.",
      },
      {
        text: "To end the call, tap the red phone button.",
        textHe: "כדי לסיים את השיחה, הקש על כפתור הטלפון האדום.",
        trainerNote: "It's usually at the bottom of the screen.",
        trainerNoteHe: "זה בדרך כלל נמצא בתחתית המסך.",
      },
    ],
  },
  {
    id: "family-groups",
    title: "Family Groups & Safety",
    titleHe: "קבוצות משפחתיות ובטיחות",
    description: "Use groups safely and wisely",
    descriptionHe: "השתמש בקבוצות בצורה בטוחה וחכמה",
    steps: [
      {
        text: "On Chats, group conversations show more than one person. Tap the group name to open it.",
        textHe: "ב'צ'אטים', שיחות קבוצתיות מראות יותר מאדם אחד. הקש על שם הקבוצה כדי לפתוח אותה.",
        trainerNote: "Groups often have a family name or photo.",
        trainerNoteHe: "לקבוצות יש לרוב שם משפחה או תמונה.",
      },
      {
        text: "Anything you write in this group is seen by everyone in the group.",
        textHe: "כל מה שאתה כותב בקבוצה זו נראה על ידי כולם בקבוצה.",
        trainerNote: "Emphasize this is not private.",
        trainerNoteHe: "הדגש שזה לא פרטי.",
      },
      {
        text: "Use the typing box and send button like a normal chat.",
        textHe: "השתמש בתיבת ההקלדה ובכפתור השליחה כמו בצ'אט רגיל.",
        trainerNote: "Same process as sending a regular message.",
        trainerNoteHe: "אותו תהליך כמו שליחת הודעה רגילה.",
      },
      {
        text: "Do not share personal details like ID numbers, bank details, or passwords.",
        textHe: "אל תשתף פרטים אישיים כמו מספרי תעודת זהות, פרטי בנק או סיסמאות.",
        trainerNote: "Even in family groups, be careful.",
        trainerNoteHe: "גם בקבוצות משפחתיות, היה זהיר.",
      },
      {
        text: "Be careful with links that talk about prizes or special offers. Ask family before tapping.",
        textHe: "היה זהיר עם קישורים שמדברים על פרסים או הצעות מיוחדות. שאל את המשפחה לפני שאתה מקיש.",
        trainerNote: "Scammers often use tempting offers.",
        trainerNoteHe: "רמאים משתמשים לעיתים קרובות בהצעות מפתות.",
      },
      {
        text: "If someone in the group makes you uncomfortable, tell a family member or helper.",
        textHe: "אם מישהו בקבוצה גורם לך להרגיש לא בנוח, ספר לבן משפחה או לעוזר.",
        trainerNote: "They can help remove that person.",
        trainerNoteHe: "הם יכולים לעזור להסיר את אותו אדם.",
      },
    ],
  },
  {
    id: "privacy-settings",
    title: "Privacy Settings",
    titleHe: "הגדרות פרטיות",
    description: "Control who can see your information",
    descriptionHe: "שלוט במי יכול לראות את המידע שלך",
    steps: [
      {
        text: "In WhatsApp, tap the three dots (top-right), then tap Settings. On iPhone, tap Settings at the bottom.",
        textHe: "בוואטסאפ, הקש על שלוש הנקודות (למעלה), ואז על 'הגדרות'. באייפון, הקש על 'הגדרות' בתחתית.",
        trainerNote: "Guide to the Settings menu.",
        trainerNoteHe: "הנחיה לתפריט ההגדרות.",
      },
      {
        text: "Tap Privacy.",
        textHe: "הקש על 'פרטיות'.",
        trainerNote: "This controls who sees your info.",
        trainerNoteHe: "זה שולט במי רואה את המידע שלך.",
      },
      {
        text: "Tap Profile photo and choose My contacts.",
        textHe: "הקש על 'תמונת פרופיל' ובחר 'אנשי הקשר שלי'.",
        trainerNote: "Only people you know will see your photo.",
        trainerNoteHe: "רק אנשים שאתה מכיר יראו את התמונה שלך.",
      },
      {
        text: "Tap Last seen and online and choose My contacts or Nobody.",
        textHe: "הקש על 'נראה לאחרונה ומחובר' ובחר 'אנשי הקשר שלי' או 'אף אחד'.",
        trainerNote: "This hides when you were online.",
        trainerNoteHe: "זה מסתיר מתי היית מחובר.",
      },
      {
        text: "Tap Groups and choose My contacts so only your contacts can add you to groups.",
        textHe: "הקש על 'קבוצות' ובחר 'אנשי הקשר שלי' כדי שרק אנשי הקשר שלך יוכלו להוסיף אותך לקבוצות.",
        trainerNote: "Prevents strangers from adding you.",
        trainerNoteHe: "מונע מזרים להוסיף אותך.",
      },
      {
        text: "If unknown numbers bother you, turn on Silence unknown callers (if available).",
        textHe: "אם מספרים לא מוכרים מפריעים לך, הפעל את 'השתקת מתקשרים לא מוכרים' (אם זמין).",
        trainerNote: "This blocks spam calls.",
        trainerNoteHe: "זה חוסם שיחות ספאם.",
      },
    ],
  },
  {
    id: "leave-group",
    title: "Leave a Group",
    titleHe: "עזיבת קבוצה",
    description: "Exit a group you no longer want",
    descriptionHe: "צא מקבוצה שאתה כבר לא מעוניין בה",
    steps: [
      {
        text: "Open the group you want to leave.",
        textHe: "פתח את הקבוצה שאתה רוצה לעזוב.",
        trainerNote: "Find it in your Chats list.",
        trainerNoteHe: "מצא אותה ברשימת הצ'אטים שלך.",
      },
      {
        text: "Tap the group's name at the top.",
        textHe: "הקש על שם הקבוצה למעלה.",
        trainerNote: "This opens group information.",
        trainerNoteHe: "זה פותח את פרטי הקבוצה.",
      },
      {
        text: "Scroll to the bottom. Tap Exit group.",
        textHe: "גלול לתחתית. הקש על 'צא מהקבוצה'.",
        trainerNote: "You may need to scroll quite a bit.",
        trainerNoteHe: "אולי תצטרך לגלול לא מעט.",
      },
      {
        text: "Tap Exit again to confirm.",
        textHe: "הקש שוב על 'צא' כדי לאשר.",
        trainerNote: "This is the final step.",
        trainerNoteHe: "זהו השלב האחרון.",
      },
      {
        text: "You will no longer get messages from that group.",
        textHe: "לא תקבל יותר הודעות מהקבוצה הזו.",
        trainerNote: "You can be added back if someone invites you.",
        trainerNoteHe: "אפשר להוסיף אותך בחזרה אם מישהו יזמין אותך.",
      },
    ],
  },
];
