export interface QuizQuestion {
  id: string;
  category: "smartphone" | "whatsapp" | "safety";
  questionHe: string;
  questionEn: string;
  optionsHe: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationHe: string;
  explanationEn: string;
  icon: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1_smartphone",
    category: "smartphone",
    questionHe: "איך מחזירים את הטלפון למסך הבית?",
    questionEn: "How do you return to the home screen on a phone?",
    optionsHe: [
      "לוחצים על כפתור הבית או מחליקים למעלה מלמטה",
      "מכבים את הטלפון ומדליקים מחדש",
      "סוגרים את המכסה של הטלפון",
      "לוחצים על כפתור עוצמת הקול",
    ],
    optionsEn: [
      "Press home button or swipe up from bottom",
      "Turn off and restart the phone",
      "Close the phone cover",
      "Press the volume button",
    ],
    correctIndex: 0,
    explanationHe: "לחיצה על כפתור הבית או החלקה למעלה מלמטה מחזירה למסך הראשי",
    explanationEn: "Pressing home or swiping up returns to main screen",
    icon: "home",
  },
  {
    id: "q2_whatsapp",
    category: "whatsapp",
    questionHe: "איך שולחים הודעה בוואטסאפ?",
    questionEn: "How do you send a message in WhatsApp?",
    optionsHe: [
      "כותבים ולוחצים על החץ הירוק",
      "כותבים ולוחצים על כפתור הבית",
      "מכבים את הטלפון",
      "מחליקים את ההודעה ימינה",
    ],
    optionsEn: [
      "Type and tap the green arrow",
      "Type and press the home button",
      "Turn off the phone",
      "Swipe the message right",
    ],
    correctIndex: 0,
    explanationHe: "אחרי שכותבים הודעה, לוחצים על החץ הירוק כדי לשלוח",
    explanationEn: "After typing, tap the green arrow to send",
    icon: "send",
  },
  {
    id: "q3_safety",
    category: "safety",
    questionHe: "קיבלת הודעה מספר לא מוכר שמבקש פרטי בנק. מה עושים?",
    questionEn: "You received a message from unknown number asking for bank details. What do you do?",
    optionsHe: [
      "לא עונים ומוחקים את ההודעה - זו הונאה!",
      "שולחים את הפרטים כי זה דחוף",
      "מתקשרים למספר ומבקשים הסבר",
      "שואלים את השכנים מה לעשות",
    ],
    optionsEn: [
      "Don't reply and delete - it's a scam!",
      "Send the details because it's urgent",
      "Call the number and ask for explanation",
      "Ask neighbors what to do",
    ],
    correctIndex: 0,
    explanationHe: "הבנק לעולם לא יבקש פרטים בהודעה! זו תמיד הונאה",
    explanationEn: "Banks never ask for details via message! It's always a scam",
    icon: "shield",
  },
  {
    id: "q4_whatsapp",
    category: "whatsapp",
    questionHe: "איך שולחים תמונה בוואטסאפ?",
    questionEn: "How do you send a photo in WhatsApp?",
    optionsHe: [
      "לוחצים על סמל המצלמה או האטב ובוחרים תמונה",
      "כותבים 'תמונה' בהודעה",
      "מנערים את הטלפון חזק",
      "לוחצים על כפתור הבית שלוש פעמים",
    ],
    optionsEn: [
      "Tap camera or clip icon and select photo",
      "Type 'photo' in message",
      "Shake the phone hard",
      "Press home button three times",
    ],
    correctIndex: 0,
    explanationHe: "לוחצים על סמל המצלמה או האטב בצד שמאל של שורת ההודעה",
    explanationEn: "Tap camera or clip icon on the left of message bar",
    icon: "camera",
  },
  {
    id: "q5_safety",
    category: "safety",
    questionHe: "מה סיסמה בטוחה?",
    questionEn: "What is a secure password?",
    optionsHe: [
      "שילוב של אותיות, מספרים וסימנים מיוחדים",
      "שם וולד או תאריך לידה",
      "123456",
      "אותה סיסמה לכל האתרים",
    ],
    optionsEn: [
      "Mix of letters, numbers, and special symbols",
      "Pet name or birthday",
      "123456",
      "Same password for all sites",
    ],
    correctIndex: 0,
    explanationHe: "סיסמה בטוחה משלבת אותיות גדולות וקטנות, מספרים וסימנים",
    explanationEn: "Secure password combines uppercase, lowercase, numbers and symbols",
    icon: "lock",
  },
];

export const getShuffledQuestions = () => {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
};
