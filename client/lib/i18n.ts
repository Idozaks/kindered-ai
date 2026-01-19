import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Kindred AI",
      tagline: "Your Patient Digital Companion",
      dashboard: {
        greeting: "Hello, Friend",
        subtitle: "How can I help you today?",
      },
      tools: {
        grandchild: {
          title: "Grandchild Mode",
          description: "Live help with your screen",
        },
        navigator: {
          title: "Decision Navigator",
          description: "Break down complex tasks",
        },
        letter: {
          title: "Letter Helper",
          description: "Understand any document",
        },
        mirror: {
          title: "Mirror World",
          description: "Practice before doing",
        },
      },
      settings: {
        title: "Settings",
        language: "Language",
        highContrast: "High Contrast Mode",
        fontSize: "Text Size",
        narrator: "Narrator Mode",
        privacy: "Privacy Shield",
        privacyDesc: "Automatically pause when detecting sensitive information",
      },
      common: {
        back: "Back",
        next: "Next",
        done: "Done",
        cancel: "Cancel",
        start: "Start",
        end: "End Session",
        retry: "Try Again",
        loading: "Loading...",
        tapToSpeak: "Tap to speak",
        listening: "Listening...",
      },
      grandchildMode: {
        title: "Grandchild Mode",
        ready: "I'm here to help!",
        watching: "I can see your screen",
        hint: "Tell me what you need help with",
      },
      navigator: {
        title: "Decision Navigator",
        placeholder: "What would you like to accomplish?",
        examples: "Examples:",
        example1: "Renew my passport",
        example2: "Pay a bill online",
        example3: "Schedule a doctor appointment",
        stepComplete: "Step completed!",
        doriAdvice: "Dori's Advice",
        practiceButton: "Practice in Sandbox",
      },
      letterHelper: {
        title: "Letter Helper",
        upload: "Take a photo or upload",
        analyzing: "Reading your document...",
        whatIsIt: "What is this?",
        urgency: "How urgent?",
        summary: "In simple words",
        actions: "What to do",
        urgencyHigh: "Urgent - Act soon",
        urgencyMedium: "Important - This week",
        urgencyLow: "Not urgent",
      },
      mirrorWorld: {
        title: "Practice Zone",
        intro: "Practice any task safely here",
        selectTask: "Choose what to practice",
        tasks: {
          grocery: "Order Groceries",
          videocall: "Make a Video Call",
          email: "Send an Email",
        },
        success: "Great job! You did it!",
        tryAgain: "Let's try again",
      },
    },
  },
  he: {
    translation: {
      appName: "קינדרד AI",
      tagline: "המלווה הדיגיטלי הסבלני שלך",
      dashboard: {
        greeting: "שלום, חבר",
        subtitle: "במה אוכל לעזור לך היום?",
      },
      tools: {
        grandchild: {
          title: "מצב נכד",
          description: "עזרה חיה עם המסך שלך",
        },
        navigator: {
          title: "נווט החלטות",
          description: "פירוק משימות מורכבות",
        },
        letter: {
          title: "עוזר מכתבים",
          description: "הבנת כל מסמך",
        },
        mirror: {
          title: "עולם המראה",
          description: "תרגול לפני ביצוע",
        },
      },
      settings: {
        title: "הגדרות",
        language: "שפה",
        highContrast: "מצב ניגודיות גבוהה",
        fontSize: "גודל טקסט",
        narrator: "מצב קריין",
        privacy: "מגן פרטיות",
        privacyDesc: "השהייה אוטומטית בזיהוי מידע רגיש",
      },
      common: {
        back: "חזרה",
        next: "הבא",
        done: "סיום",
        cancel: "ביטול",
        start: "התחלה",
        end: "סיום פגישה",
        retry: "נסה שוב",
        loading: "טוען...",
        tapToSpeak: "הקש לדיבור",
        listening: "מאזין...",
      },
      grandchildMode: {
        title: "מצב נכד",
        ready: "אני כאן לעזור!",
        watching: "אני רואה את המסך שלך",
        hint: "ספר לי במה אתה צריך עזרה",
      },
      navigator: {
        title: "נווט החלטות",
        placeholder: "מה תרצה להשיג?",
        examples: "דוגמאות:",
        example1: "לחדש את הדרכון",
        example2: "לשלם חשבון באינטרנט",
        example3: "לקבוע תור לרופא",
        stepComplete: "השלב הושלם!",
        doriAdvice: "העצה של דורי",
        practiceButton: "תרגול בסביבה בטוחה",
      },
      letterHelper: {
        title: "עוזר מכתבים",
        upload: "צלם תמונה או העלה",
        analyzing: "קורא את המסמך שלך...",
        whatIsIt: "מה זה?",
        urgency: "כמה דחוף?",
        summary: "במילים פשוטות",
        actions: "מה לעשות",
        urgencyHigh: "דחוף - לפעול בקרוב",
        urgencyMedium: "חשוב - השבוע",
        urgencyLow: "לא דחוף",
      },
      mirrorWorld: {
        title: "אזור תרגול",
        intro: "תרגל כל משימה בבטחה כאן",
        selectTask: "בחר מה לתרגל",
        tasks: {
          grocery: "להזמין מצרכים",
          videocall: "לבצע שיחת וידאו",
          email: "לשלוח אימייל",
        },
        success: "כל הכבוד! עשית את זה!",
        tryAgain: "בוא ננסה שוב",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "he",
  fallbackLng: "he",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
