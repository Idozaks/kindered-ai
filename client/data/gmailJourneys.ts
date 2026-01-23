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
  "read-email-0": require("../../assets/gmail-guides/read-email-step-0.png"),
  "read-email-1": require("../../assets/gmail-guides/read-email-step-1.png"),
  "read-email-2": require("../../assets/gmail-guides/read-email-step-2.png"),
  "read-email-3": require("../../assets/gmail-guides/read-email-step-3.png"),
  "read-email-4": require("../../assets/gmail-guides/read-email-step-4.png"),
  "send-email-0": require("../../assets/gmail-guides/send-email-step-0.png"),
  "send-email-1": require("../../assets/gmail-guides/send-email-step-1.png"),
  "send-email-2": require("../../assets/gmail-guides/send-email-step-2.png"),
  "send-email-3": require("../../assets/gmail-guides/send-email-step-3.png"),
  "send-email-4": require("../../assets/gmail-guides/send-email-step-4.png"),
  "send-email-5": require("../../assets/gmail-guides/send-email-step-5.png"),
  "attach-photo-0": require("../../assets/gmail-guides/attach-photo-step-0.png"),
  "attach-photo-1": require("../../assets/gmail-guides/attach-photo-step-1.png"),
  "attach-photo-2": require("../../assets/gmail-guides/attach-photo-step-2.png"),
  "attach-photo-3": require("../../assets/gmail-guides/attach-photo-step-3.png"),
  "attach-photo-4": require("../../assets/gmail-guides/attach-photo-step-4.png"),
  "search-email-0": require("../../assets/gmail-guides/search-email-step-0.png"),
  "search-email-1": require("../../assets/gmail-guides/search-email-step-1.png"),
  "search-email-2": require("../../assets/gmail-guides/search-email-step-2.png"),
  "search-email-3": require("../../assets/gmail-guides/search-email-step-3.png"),
  "delete-email-0": require("../../assets/gmail-guides/delete-email-step-0.png"),
  "delete-email-1": require("../../assets/gmail-guides/delete-email-step-1.png"),
  "delete-email-2": require("../../assets/gmail-guides/delete-email-step-2.png"),
  "delete-email-3": require("../../assets/gmail-guides/delete-email-step-3.png"),
  "reply-email-0": require("../../assets/gmail-guides/reply-email-step-0.png"),
  "reply-email-1": require("../../assets/gmail-guides/reply-email-step-1.png"),
  "reply-email-2": require("../../assets/gmail-guides/reply-email-step-2.png"),
  "reply-email-3": require("../../assets/gmail-guides/reply-email-step-3.png"),
  "reply-email-4": require("../../assets/gmail-guides/reply-email-step-4.png"),
};

export function getStepImage(journeyId: string, stepIndex: number): any {
  return stepImages[`${journeyId}-${stepIndex}`];
}

export const gmailJourneys: Journey[] = [
  {
    id: "read-email",
    title: "Read an Email",
    titleHe: "קריאת אימייל",
    description: "Learn to open and read emails",
    descriptionHe: "למד איך לפתוח ולקרוא אימיילים",
    steps: [
      {
        text: "Find the Gmail icon on your home screen. It looks like a colorful envelope with red, yellow, green, and blue. Tap it once.",
        textHe: "מצא את סמל Gmail במסך הבית שלך. הוא נראה כמו מעטפה צבעונית באדום, צהוב, ירוק וכחול. הקש עליו פעם אחת.",
        trainerNote: "Help them locate the Gmail app icon if needed.",
        trainerNoteHe: "עזור להם למצוא את סמל האפליקציה אם צריך.",
      },
      {
        text: "You are now in your Inbox. This is your list of emails. New emails appear at the top.",
        textHe: "אתה עכשיו בתיבת הדואר הנכנס. זו רשימת האימיילים שלך. אימיילים חדשים מופיעים למעלה.",
        trainerNote: "Point out that unread emails appear in bold.",
        trainerNoteHe: "ציין שאימיילים שלא נקראו מופיעים בהדגשה.",
      },
      {
        text: "Look for the email you want to read. Bold text means it's a new, unread email.",
        textHe: "חפש את האימייל שאתה רוצה לקרוא. טקסט מודגש אומר שזה אימייל חדש שלא נקרא.",
        trainerNote: "Show the difference between read and unread emails.",
        trainerNoteHe: "הראה את ההבדל בין אימיילים שנקראו לכאלה שלא.",
      },
      {
        text: "Tap on the email to open it. You will see the full message.",
        textHe: "הקש על האימייל כדי לפתוח אותו. תראה את ההודעה המלאה.",
        trainerNote: "Wait for the email to fully load.",
        trainerNoteHe: "חכה שהאימייל ייטען במלואו.",
      },
      {
        text: "To go back to your Inbox, tap the back arrow at the top-left corner.",
        textHe: "כדי לחזור לתיבת הדואר, הקש על חץ החזרה בפינה העליונה.",
        trainerNote: "On some phones, you can also swipe from the left edge.",
        trainerNoteHe: "בטלפונים מסוימים, אפשר גם להחליק מהקצה.",
      },
    ],
  },
  {
    id: "send-email",
    title: "Send an Email",
    titleHe: "שליחת אימייל",
    description: "Write and send a new email",
    descriptionHe: "כתוב ושלח אימייל חדש",
    steps: [
      {
        text: "Open Gmail by tapping the colorful envelope icon.",
        textHe: "פתח את Gmail על ידי הקשה על סמל המעטפה הצבעונית.",
        trainerNote: "Same as the first step in reading email.",
        trainerNoteHe: "אותו דבר כמו השלב הראשון בקריאת אימייל.",
      },
      {
        text: "In the bottom-right corner, look for a colorful pencil button or a button that says 'Compose'. Tap it.",
        textHe: "בפינה הימנית התחתונה, חפש כפתור עיפרון צבעוני או כפתור שכתוב עליו 'חיבור'. הקש עליו.",
        trainerNote: "The compose button may look like a plus sign or pencil.",
        trainerNoteHe: "כפתור החיבור עשוי להיראות כמו סימן פלוס או עיפרון.",
      },
      {
        text: "In the 'To' field, type the email address of the person you want to send to.",
        textHe: "בשדה 'אל', הקלד את כתובת האימייל של האדם שאתה רוצה לשלוח לו.",
        trainerNote: "Make sure to type the email address correctly.",
        trainerNoteHe: "וודא שהכתובת מוקלדת נכון.",
      },
      {
        text: "Tap the 'Subject' field and write what the email is about in a few words.",
        textHe: "הקש על שדה 'נושא' וכתוב במילים ספורות על מה האימייל.",
        trainerNote: "A clear subject helps the recipient understand the email.",
        trainerNoteHe: "נושא ברור עוזר לנמען להבין את האימייל.",
      },
      {
        text: "Tap in the big space below and write your message.",
        textHe: "הקש באזור הגדול למטה וכתוב את ההודעה שלך.",
        trainerNote: "Help with typing if needed.",
        trainerNoteHe: "עזור בהקלדה אם צריך.",
      },
      {
        text: "When you're done, tap the Send button - it looks like a paper airplane at the top.",
        textHe: "כשסיימת, הקש על כפתור השליחה - הוא נראה כמו מטוס נייר למעלה.",
        trainerNote: "The email will be sent immediately.",
        trainerNoteHe: "האימייל יישלח מיד.",
      },
    ],
  },
  {
    id: "attach-photo",
    title: "Send an Email with a Photo",
    titleHe: "שליחת אימייל עם תמונה",
    description: "Attach and send photos via email",
    descriptionHe: "צרף ושלח תמונות באימייל",
    steps: [
      {
        text: "Start writing a new email by tapping the colorful pencil button.",
        textHe: "התחל לכתוב אימייל חדש על ידי הקשה על כפתור העיפרון הצבעוני.",
        trainerNote: "Same as composing a new email.",
        trainerNoteHe: "אותו דבר כמו לכתוב אימייל חדש.",
      },
      {
        text: "Fill in the 'To' field, 'Subject', and write your message.",
        textHe: "מלא את שדה 'אל', 'נושא', וכתוב את ההודעה שלך.",
        trainerNote: "You can add the photo at any point.",
        trainerNoteHe: "אפשר להוסיף את התמונה בכל שלב.",
      },
      {
        text: "Look for a paperclip icon at the top of the screen. Tap it to attach a file.",
        textHe: "חפש סמל אטב בחלק העליון של המסך. הקש עליו כדי לצרף קובץ.",
        trainerNote: "The attachment icon may vary slightly.",
        trainerNoteHe: "סמל הצירוף עשוי להשתנות מעט.",
      },
      {
        text: "Choose 'Attach file' or 'Insert from Drive'. Then tap 'Gallery' or 'Photos' to find your picture.",
        textHe: "בחר 'צרף קובץ' או 'הכנס מ-Drive'. ואז הקש על 'גלריה' או 'תמונות' כדי למצוא את התמונה שלך.",
        trainerNote: "Help navigate to their photos if needed.",
        trainerNoteHe: "עזור לנווט לתמונות שלהם אם צריך.",
      },
      {
        text: "Tap the photo you want to send. It will be attached to your email. Then tap Send.",
        textHe: "הקש על התמונה שאתה רוצה לשלוח. היא תצורף לאימייל שלך. ואז הקש על שלח.",
        trainerNote: "Large photos may take a moment to attach.",
        trainerNoteHe: "תמונות גדולות עשויות לקחת רגע להיצרף.",
      },
    ],
  },
  {
    id: "search-email",
    title: "Search for an Email",
    titleHe: "חיפוש אימייל",
    description: "Find old emails quickly",
    descriptionHe: "מצא אימיילים ישנים במהירות",
    steps: [
      {
        text: "Open Gmail and look at the top of your Inbox.",
        textHe: "פתח את Gmail והסתכל בחלק העליון של תיבת הדואר.",
        trainerNote: "The search bar is always at the top.",
        trainerNoteHe: "שורת החיפוש תמיד נמצאת למעלה.",
      },
      {
        text: "Tap the search bar that says 'Search in mail' or shows a magnifying glass.",
        textHe: "הקש על שורת החיפוש שכתוב בה 'חפש בדואר' או מציגה זכוכית מגדלת.",
        trainerNote: "The keyboard will appear.",
        trainerNoteHe: "המקלדת תופיע.",
      },
      {
        text: "Type what you're looking for: a person's name, a word from the email, or a topic.",
        textHe: "הקלד את מה שאתה מחפש: שם של אדם, מילה מהאימייל, או נושא.",
        trainerNote: "Even partial words can work.",
        trainerNoteHe: "גם מילים חלקיות יכולות לעבוד.",
      },
      {
        text: "Tap Search or the magnifying glass on your keyboard. Gmail will show all matching emails.",
        textHe: "הקש על חפש או על הזכוכית המגדלת במקלדת. Gmail יציג את כל האימיילים התואמים.",
        trainerNote: "Results appear with the search term highlighted.",
        trainerNoteHe: "התוצאות מופיעות עם מילת החיפוש מודגשת.",
      },
    ],
  },
  {
    id: "delete-email",
    title: "Delete Unwanted Emails",
    titleHe: "מחיקת אימיילים לא רצויים",
    description: "Remove junk and old emails",
    descriptionHe: "הסר אימיילים זבל וישנים",
    steps: [
      {
        text: "Open Gmail and find the email you want to delete.",
        textHe: "פתח את Gmail ומצא את האימייל שאתה רוצה למחוק.",
        trainerNote: "You can delete from the list or after opening.",
        trainerNoteHe: "אפשר למחוק מהרשימה או אחרי פתיחה.",
      },
      {
        text: "Tap and hold your finger on the email for a moment. A checkmark will appear.",
        textHe: "הקש והחזק את האצבע על האימייל לרגע. סימן וי יופיע.",
        trainerNote: "This selects the email without opening it.",
        trainerNoteHe: "זה בוחר את האימייל בלי לפתוח אותו.",
      },
      {
        text: "Look at the top of the screen. Tap the trash can icon.",
        textHe: "הסתכל בחלק העליון של המסך. הקש על סמל פח האשפה.",
        trainerNote: "The email moves to Trash immediately.",
        trainerNoteHe: "האימייל עובר לאשפה מיד.",
      },
      {
        text: "The email is now in your Trash. It will be permanently deleted in 30 days.",
        textHe: "האימייל עכשיו באשפה. הוא יימחק לצמיתות בעוד 30 יום.",
        trainerNote: "You can recover it from Trash if needed.",
        trainerNoteHe: "אפשר לשחזר אותו מהאשפה אם צריך.",
      },
    ],
  },
  {
    id: "reply-email",
    title: "Reply to an Email",
    titleHe: "מענה לאימייל",
    description: "Respond to emails you receive",
    descriptionHe: "הגב לאימיילים שאתה מקבל",
    steps: [
      {
        text: "Open the email you want to reply to by tapping on it.",
        textHe: "פתח את האימייל שאתה רוצה לענות עליו על ידי הקשה עליו.",
        trainerNote: "Read the email first to understand the context.",
        trainerNoteHe: "קרא את האימייל קודם כדי להבין את ההקשר.",
      },
      {
        text: "At the bottom of the email, look for a 'Reply' button or an arrow pointing left.",
        textHe: "בתחתית האימייל, חפש כפתור 'השב' או חץ שמצביע שמאלה.",
        trainerNote: "There may also be 'Reply All' for group emails.",
        trainerNoteHe: "אולי יש גם 'השב לכולם' לאימיילים קבוצתיים.",
      },
      {
        text: "Tap 'Reply'. A new message box will open with the original email below.",
        textHe: "הקש על 'השב'. תיבת הודעה חדשה תיפתח עם האימייל המקורי למטה.",
        trainerNote: "The 'To' field is already filled in.",
        trainerNoteHe: "שדה 'אל' כבר ממולא.",
      },
      {
        text: "Type your response in the message area.",
        textHe: "הקלד את התשובה שלך באזור ההודעה.",
        trainerNote: "Your reply appears above the original message.",
        trainerNoteHe: "התשובה שלך מופיעה מעל ההודעה המקורית.",
      },
      {
        text: "Tap the Send button (paper airplane) to send your reply.",
        textHe: "הקש על כפתור השליחה (מטוס נייר) כדי לשלוח את התשובה שלך.",
        trainerNote: "The conversation will be grouped together.",
        trainerNoteHe: "השיחה תקובץ יחד.",
      },
    ],
  },
];
