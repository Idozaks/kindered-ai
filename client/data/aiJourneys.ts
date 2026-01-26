export interface JourneyStep {
  text: string;
  textHe?: string;
  trainerNote?: string;
  trainerNoteHe?: string;
}

export interface Journey {
  id: string;
  title: string;
  titleHe?: string;
  description: string;
  descriptionHe?: string;
  icon: string;
  steps: JourneyStep[];
}

export const aiJourneys: Journey[] = [
  {
    id: "what-is-ai",
    title: "What is AI?",
    titleHe: "מה זה בינה מלאכותית?",
    description: "Understanding the basics of artificial intelligence",
    descriptionHe: "הבנת היסודות של בינה מלאכותית",
    icon: "cpu",
    steps: [
      {
        text: "AI (Artificial Intelligence) is like having a very smart assistant in your phone or computer. It can understand what you say and help you with many tasks.",
        textHe: "בינה מלאכותית (AI) היא כמו עוזר חכם מאוד בטלפון או במחשב שלך. היא יכולה להבין מה אתה אומר ולעזור לך במשימות רבות.",
        trainerNote: "Use simple analogies like 'a helpful friend who knows a lot'.",
        trainerNoteHe: "השתמש באנלוגיות פשוטות כמו 'חבר מועיל שיודע הרבה'.",
      },
      {
        text: "AI learns from millions of books, websites, and conversations. It's like someone who has read every book in the world and remembers everything.",
        textHe: "בינה מלאכותית לומדת ממיליוני ספרים, אתרי אינטרנט ושיחות. זה כמו מישהו שקרא כל ספר בעולם וזוכר הכל.",
        trainerNote: "Emphasize that AI doesn't actually 'think' but finds patterns.",
        trainerNoteHe: "הדגש שהבינה המלאכותית לא באמת 'חושבת' אלא מוצאת דפוסים.",
      },
      {
        text: "You can talk to AI just like talking to a person. Ask questions, share problems, or request help with anything - from writing letters to understanding documents.",
        textHe: "אפשר לדבר עם בינה מלאכותית בדיוק כמו לדבר עם אדם. שאל שאלות, שתף בעיות, או בקש עזרה בכל דבר - מכתיבת מכתבים ועד הבנת מסמכים.",
        trainerNote: "Demonstrate by asking a simple question.",
        trainerNoteHe: "הדגם על ידי שאילת שאלה פשוטה.",
      },
      {
        text: "AI is patient and never gets tired. You can ask the same question many times, and it will always try to help you understand better.",
        textHe: "בינה מלאכותית סבלנית ולעולם לא מתעייפת. אפשר לשאול את אותה שאלה הרבה פעמים, והיא תמיד תנסה לעזור לך להבין טוב יותר.",
        trainerNote: "This is especially important for seniors who may feel embarrassed to ask repeatedly.",
        trainerNoteHe: "זה חשוב במיוחד עבור קשישים שעשויים להרגיש מבוכה לשאול שוב.",
      },
      {
        text: "Remember: AI is a tool to help you, not to replace human connection. It's here to make technology easier for you!",
        textHe: "זכור: בינה מלאכותית היא כלי לעזור לך, לא להחליף קשר אנושי. היא כאן כדי להפוך את הטכנולוגיה לקלה יותר עבורך!",
        trainerNote: "End on a positive note about empowerment.",
        trainerNoteHe: "סיים בנימה חיובית על העצמה.",
      },
    ],
  },
  {
    id: "asking-ai-questions",
    title: "How to Ask Good Questions",
    titleHe: "איך לשאול שאלות טובות",
    description: "Learn to get better answers from AI",
    descriptionHe: "למד לקבל תשובות טובות יותר מבינה מלאכותית",
    icon: "help-circle",
    steps: [
      {
        text: "Be clear and specific. Instead of 'Help me', try 'Help me write a birthday message for my grandson'.",
        textHe: "היה ברור וספציפי. במקום 'עזור לי', נסה 'עזור לי לכתוב הודעת יום הולדת לנכד שלי'.",
        trainerNote: "Show examples of vague vs. specific questions.",
        trainerNoteHe: "הראה דוגמאות לשאלות מעורפלות לעומת ספציפיות.",
      },
      {
        text: "Give context. Tell the AI who it's for, what you need, and any important details. More information = better answers.",
        textHe: "תן הקשר. ספר לבינה המלאכותית למי זה מיועד, מה אתה צריך, וכל פרט חשוב. יותר מידע = תשובות טובות יותר.",
        trainerNote: "Use examples like 'My grandson is turning 10 and loves dinosaurs'.",
        trainerNoteHe: "השתמש בדוגמאות כמו 'הנכד שלי הופך ל-10 ואוהב דינוזאורים'.",
      },
      {
        text: "Don't be afraid to say 'I don't understand'. Ask the AI to explain in simpler words or give an example.",
        textHe: "אל תפחד לומר 'אני לא מבין'. בקש מהבינה המלאכותית להסביר במילים פשוטות יותר או לתת דוגמה.",
        trainerNote: "Encourage asking for clarification - there's no shame in it.",
        trainerNoteHe: "עודד לבקש הבהרה - אין בושה בזה.",
      },
      {
        text: "You can ask follow-up questions. If the first answer isn't quite right, say 'Can you try again?' or 'I meant something different'.",
        textHe: "אפשר לשאול שאלות המשך. אם התשובה הראשונה לא בדיוק נכונה, אמור 'אפשר לנסות שוב?' או 'התכוונתי למשהו אחר'.",
        trainerNote: "Show that conversations with AI can go back and forth.",
        trainerNoteHe: "הראה ששיחות עם בינה מלאכותית יכולות לנוע הלוך ושוב.",
      },
      {
        text: "Ask in your own language! You can speak or write in Hebrew, and the AI will respond in Hebrew too.",
        textHe: "שאל בשפה שלך! אפשר לדבר או לכתוב בעברית, והבינה המלאכותית תענה בעברית גם.",
        trainerNote: "This is especially important for Hebrew speakers.",
        trainerNoteHe: "זה חשוב במיוחד עבור דוברי עברית.",
      },
    ],
  },
  {
    id: "ai-image-generation",
    title: "Creating Pictures with AI",
    titleHe: "יצירת תמונות עם בינה מלאכותית",
    description: "How AI can create images from your words",
    descriptionHe: "איך בינה מלאכותית יכולה ליצור תמונות מהמילים שלך",
    icon: "image",
    steps: [
      {
        text: "AI can create pictures just by you describing what you want to see. It's like having a painter who draws whatever you ask for!",
        textHe: "בינה מלאכותית יכולה ליצור תמונות רק על ידי תיאור של מה שאתה רוצה לראות. זה כמו שיש לך צייר שמצייר כל מה שאתה מבקש!",
        trainerNote: "Show an example of describing something simple.",
        trainerNoteHe: "הראה דוגמה לתיאור משהו פשוט.",
      },
      {
        text: "Describe what you want in detail: 'A beautiful sunset over the sea with orange and purple colors' works better than just 'sunset'.",
        textHe: "תאר מה שאתה רוצה בפירוט: 'שקיעה יפה מעל הים עם צבעים כתומים וסגולים' עובד טוב יותר מסתם 'שקיעה'.",
        trainerNote: "More details = better results.",
        trainerNoteHe: "יותר פרטים = תוצאות טובות יותר.",
      },
      {
        text: "You can create: greeting cards for family, birthday pictures, beautiful scenery, or even pictures of things that don't exist!",
        textHe: "אפשר ליצור: כרטיסי ברכה למשפחה, תמונות יום הולדת, נופים יפים, או אפילו תמונות של דברים שלא קיימים!",
        trainerNote: "Give practical examples relevant to their life.",
        trainerNoteHe: "תן דוגמאות מעשיות הרלוונטיות לחייהם.",
      },
      {
        text: "Don't worry if the first picture isn't perfect. You can ask to try again with different words or say 'make it more colorful' or 'add a rainbow'.",
        textHe: "אל תדאג אם התמונה הראשונה לא מושלמת. אפשר לבקש לנסות שוב עם מילים שונות או לומר 'תעשה את זה יותר צבעוני' או 'תוסיף קשת'.",
        trainerNote: "Emphasize that experimentation is part of the fun.",
        trainerNoteHe: "הדגש שניסויים הם חלק מהכיף.",
      },
      {
        text: "AI-created pictures are great for personal use - share them with family in WhatsApp or use them as phone backgrounds!",
        textHe: "תמונות שנוצרו בבינה מלאכותית מעולות לשימוש אישי - שתף אותן עם המשפחה בוואטסאפ או השתמש בהן כרקעים לטלפון!",
        trainerNote: "Connect to practical applications they already use.",
        trainerNoteHe: "חבר ליישומים מעשיים שהם כבר משתמשים בהם.",
      },
    ],
  },
  {
    id: "ai-reading-documents",
    title: "AI Reads for You",
    titleHe: "בינה מלאכותית קוראת בשבילך",
    description: "Let AI help you understand complex texts",
    descriptionHe: "תן לבינה מלאכותית לעזור לך להבין טקסטים מורכבים",
    icon: "file-text",
    steps: [
      {
        text: "Received a confusing letter from the bank, doctor, or government? AI can read it and explain it in simple words.",
        textHe: "קיבלת מכתב מבלבל מהבנק, הרופא או הממשלה? בינה מלאכותית יכולה לקרוא אותו ולהסביר במילים פשוטות.",
        trainerNote: "This addresses a real pain point for many seniors.",
        trainerNoteHe: "זה מתייחס לנקודת כאב אמיתית עבור קשישים רבים.",
      },
      {
        text: "Just take a picture of the document with your phone. The AI can see what's written and understand it for you.",
        textHe: "פשוט צלם תמונה של המסמך עם הטלפון. הבינה המלאכותית יכולה לראות מה כתוב ולהבין את זה בשבילך.",
        trainerNote: "Demonstrate taking a photo of a document.",
        trainerNoteHe: "הדגם צילום של מסמך.",
      },
      {
        text: "AI will tell you: What is this document about? Is it urgent? What do you need to do about it?",
        textHe: "בינה מלאכותית תספר לך: על מה המסמך הזה? האם זה דחוף? מה אתה צריך לעשות לגבי זה?",
        trainerNote: "The three key questions people need answered.",
        trainerNoteHe: "שלוש השאלות המרכזיות שאנשים צריכים תשובות עליהן.",
      },
      {
        text: "You can ask follow-up questions like 'What does this word mean?' or 'When is the deadline?' and AI will explain.",
        textHe: "אפשר לשאול שאלות המשך כמו 'מה המילה הזו אומרת?' או 'מתי התאריך האחרון?' והבינה המלאכותית תסביר.",
        trainerNote: "Encourage curiosity and questions.",
        trainerNoteHe: "עודד סקרנות ושאלות.",
      },
      {
        text: "This feature is perfect for: Bank statements, medical letters, bills, government forms, and any official document that seems complicated.",
        textHe: "הפיצ'ר הזה מושלם עבור: דפי חשבון בנק, מכתבים רפואיים, חשבונות, טפסים ממשלתיים, וכל מסמך רשמי שנראה מסובך.",
        trainerNote: "List specific examples they encounter in daily life.",
        trainerNoteHe: "רשום דוגמאות ספציפיות שהם נתקלים בהן בחיי היום-יום.",
      },
    ],
  },
  {
    id: "ai-safety",
    title: "Staying Safe with AI",
    titleHe: "להישאר בטוחים עם בינה מלאכותית",
    description: "What AI can and cannot do",
    descriptionHe: "מה בינה מלאכותית יכולה ולא יכולה לעשות",
    icon: "shield",
    steps: [
      {
        text: "AI is helpful but it's not perfect. Sometimes it might make mistakes or not understand exactly what you meant.",
        textHe: "בינה מלאכותית מועילה אבל היא לא מושלמת. לפעמים היא עלולה לעשות טעויות או לא להבין בדיוק למה התכוונת.",
        trainerNote: "Set realistic expectations.",
        trainerNoteHe: "הגדר ציפיות ריאליסטיות.",
      },
      {
        text: "Never share personal passwords, credit card numbers, or ID numbers with AI. It doesn't need this information to help you.",
        textHe: "לעולם אל תשתף סיסמאות אישיות, מספרי כרטיס אשראי, או מספרי תעודת זהות עם בינה מלאכותית. היא לא צריכה מידע זה כדי לעזור לך.",
        trainerNote: "This is critical safety information.",
        trainerNoteHe: "זה מידע בטיחותי קריטי.",
      },
      {
        text: "For important decisions (medical, financial, legal), always check with a real professional. AI gives information, but a doctor or lawyer knows your specific situation.",
        textHe: "להחלטות חשובות (רפואיות, כספיות, משפטיות), תמיד בדוק עם איש מקצוע אמיתי. בינה מלאכותית נותנת מידע, אבל רופא או עורך דין מכירים את המצב הספציפי שלך.",
        trainerNote: "AI assists but doesn't replace professional advice.",
        trainerNoteHe: "בינה מלאכותית מסייעת אבל לא מחליפה ייעוץ מקצועי.",
      },
      {
        text: "If something AI says doesn't feel right or seems strange, trust your instincts. You can always ask a family member to double-check.",
        textHe: "אם משהו שבינה מלאכותית אומרת לא מרגיש נכון או נראה מוזר, סמוך על האינסטינקטים שלך. תמיד אפשר לבקש מבן משפחה לבדוק שוב.",
        trainerNote: "Empower them to trust their judgment.",
        trainerNoteHe: "העצם אותם לסמוך על שיקול דעתם.",
      },
      {
        text: "Remember: AI is a tool in YOUR hands. You control when to use it and when to ask for human help instead.",
        textHe: "זכור: בינה מלאכותית היא כלי בידיים שלך. אתה שולט מתי להשתמש בה ומתי לבקש עזרה אנושית במקום.",
        trainerNote: "End with empowerment message.",
        trainerNoteHe: "סיים עם מסר של העצמה.",
      },
    ],
  },
];
