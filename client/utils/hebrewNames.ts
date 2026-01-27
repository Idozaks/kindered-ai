type Gender = "male" | "female" | "ambiguous";

interface HebrewNameEntry {
  name: string;
  gender: Gender;
}

const HEBREW_NAMES_DATABASE: HebrewNameEntry[] = [
  { name: "אברהם", gender: "male" },
  { name: "יצחק", gender: "male" },
  { name: "יעקב", gender: "male" },
  { name: "משה", gender: "male" },
  { name: "דוד", gender: "male" },
  { name: "שלמה", gender: "male" },
  { name: "יוסף", gender: "male" },
  { name: "בנימין", gender: "male" },
  { name: "דניאל", gender: "male" },
  { name: "אליהו", gender: "male" },
  { name: "שמואל", gender: "male" },
  { name: "אהרון", gender: "male" },
  { name: "יונתן", gender: "male" },
  { name: "עמוס", gender: "male" },
  { name: "רפאל", gender: "male" },
  { name: "מיכאל", gender: "male" },
  { name: "גבריאל", gender: "male" },
  { name: "אורי", gender: "male" },
  { name: "עידו", gender: "male" },
  { name: "רון", gender: "male" },
  { name: "אייל", gender: "male" },
  { name: "נתן", gender: "male" },
  { name: "עומר", gender: "male" },
  { name: "איתן", gender: "male" },
  { name: "נועם", gender: "ambiguous" },
  { name: "אלון", gender: "male" },
  { name: "יובל", gender: "ambiguous" },
  { name: "אסף", gender: "male" },
  { name: "עדי", gender: "ambiguous" },
  { name: "שי", gender: "ambiguous" },
  { name: "ליאור", gender: "ambiguous" },
  { name: "שחר", gender: "ambiguous" },
  { name: "טל", gender: "ambiguous" },
  { name: "גל", gender: "ambiguous" },
  { name: "חן", gender: "ambiguous" },
  { name: "ים", gender: "ambiguous" },
  { name: "דור", gender: "ambiguous" },
  { name: "רז", gender: "ambiguous" },
  { name: "סתו", gender: "ambiguous" },
  { name: "ארז", gender: "male" },
  { name: "נדב", gender: "male" },
  { name: "זיו", gender: "male" },
  { name: "בועז", gender: "male" },
  { name: "עמית", gender: "ambiguous" },
  { name: "שרה", gender: "female" },
  { name: "רבקה", gender: "female" },
  { name: "רחל", gender: "female" },
  { name: "לאה", gender: "female" },
  { name: "מרים", gender: "female" },
  { name: "חנה", gender: "female" },
  { name: "דבורה", gender: "female" },
  { name: "רות", gender: "female" },
  { name: "אסתר", gender: "female" },
  { name: "נעמי", gender: "female" },
  { name: "תמר", gender: "female" },
  { name: "עדנה", gender: "female" },
  { name: "יעל", gender: "female" },
  { name: "מיכל", gender: "female" },
  { name: "שירה", gender: "female" },
  { name: "נועה", gender: "female" },
  { name: "מאיה", gender: "female" },
  { name: "דנה", gender: "female" },
  { name: "עינת", gender: "female" },
  { name: "אורית", gender: "female" },
  { name: "גלית", gender: "female" },
  { name: "רונית", gender: "female" },
  { name: "דורית", gender: "female" },
  { name: "ענת", gender: "female" },
  { name: "שרון", gender: "ambiguous" },
  { name: "אלה", gender: "female" },
  { name: "ליאת", gender: "female" },
  { name: "הילה", gender: "female" },
  { name: "איילת", gender: "female" },
  { name: "נטע", gender: "female" },
  { name: "קרן", gender: "female" },
  { name: "שלי", gender: "female" },
  { name: "הדר", gender: "ambiguous" },
  { name: "אביב", gender: "ambiguous" },
  { name: "עופר", gender: "male" },
  { name: "עמיר", gender: "male" },
  { name: "גיא", gender: "male" },
  { name: "מתן", gender: "male" },
  { name: "יאיר", gender: "male" },
  { name: "נריה", gender: "male" },
  { name: "הראל", gender: "male" },
  { name: "עילי", gender: "male" },
  { name: "יהודה", gender: "male" },
  { name: "חיים", gender: "male" },
  { name: "אריה", gender: "male" },
  { name: "צבי", gender: "male" },
  { name: "זאב", gender: "male" },
  { name: "ברוך", gender: "male" },
  { name: "יעקב", gender: "male" },
  { name: "אפרים", gender: "male" },
  { name: "מנחם", gender: "male" },
  { name: "פנחס", gender: "male" },
  { name: "שמעון", gender: "male" },
  { name: "ראובן", gender: "male" },
  { name: "לוי", gender: "male" },
  { name: "בלה", gender: "female" },
  { name: "צילה", gender: "female" },
  { name: "פנינה", gender: "female" },
  { name: "זהבה", gender: "female" },
  { name: "רבקה", gender: "female" },
  { name: "שושנה", gender: "female" },
  { name: "בתיה", gender: "female" },
  { name: "שמחה", gender: "female" },
  { name: "ברכה", gender: "female" },
  { name: "טובה", gender: "female" },
  { name: "צפורה", gender: "female" },
  { name: "רחמה", gender: "female" },
  { name: "יהודית", gender: "female" },
  { name: "שפרה", gender: "female" },
  { name: "פועה", gender: "female" },
  { name: "סימה", gender: "female" },
  { name: "Abraham", gender: "male" },
  { name: "Isaac", gender: "male" },
  { name: "Jacob", gender: "male" },
  { name: "Moses", gender: "male" },
  { name: "David", gender: "male" },
  { name: "Solomon", gender: "male" },
  { name: "Joseph", gender: "male" },
  { name: "Benjamin", gender: "male" },
  { name: "Daniel", gender: "male" },
  { name: "Samuel", gender: "male" },
  { name: "Michael", gender: "male" },
  { name: "Gabriel", gender: "male" },
  { name: "Jonathan", gender: "male" },
  { name: "Moshe", gender: "male" },
  { name: "Avi", gender: "male" },
  { name: "Yossi", gender: "male" },
  { name: "Sarah", gender: "female" },
  { name: "Rebecca", gender: "female" },
  { name: "Rachel", gender: "female" },
  { name: "Leah", gender: "female" },
  { name: "Miriam", gender: "female" },
  { name: "Hannah", gender: "female" },
  { name: "Deborah", gender: "female" },
  { name: "Ruth", gender: "female" },
  { name: "Esther", gender: "female" },
  { name: "Naomi", gender: "female" },
  { name: "Tamar", gender: "female" },
  { name: "Maya", gender: "female" },
  { name: "Dana", gender: "female" },
  { name: "Noa", gender: "female" },
  { name: "Shira", gender: "female" },
  { name: "Yael", gender: "female" },
  { name: "Chen", gender: "ambiguous" },
  { name: "Gal", gender: "ambiguous" },
  { name: "Tal", gender: "ambiguous" },
  { name: "Noam", gender: "ambiguous" },
  { name: "Lior", gender: "ambiguous" },
  { name: "Shachar", gender: "ambiguous" },
  { name: "Yuval", gender: "ambiguous" },
  { name: "Adi", gender: "ambiguous" },
  { name: "Shai", gender: "ambiguous" },
  { name: "Hadar", gender: "ambiguous" },
  { name: "Aviv", gender: "ambiguous" },
  { name: "Amit", gender: "ambiguous" },
  { name: "Dor", gender: "ambiguous" },
  { name: "Raz", gender: "ambiguous" },
  { name: "Sharon", gender: "ambiguous" },
];

export function predictGenderFromName(name: string): Gender {
  const normalizedName = name.trim().toLowerCase();
  
  const match = HEBREW_NAMES_DATABASE.find(
    entry => entry.name.toLowerCase() === normalizedName || 
             entry.name === name
  );
  
  if (match) {
    return match.gender;
  }
  
  if (normalizedName.endsWith("ה") || 
      normalizedName.endsWith("ת") || 
      normalizedName.endsWith("ית") ||
      normalizedName.endsWith("a") ||
      normalizedName.endsWith("it") ||
      normalizedName.endsWith("ah")) {
    return "female";
  }
  
  return "ambiguous";
}

export function isAmbiguousName(name: string): boolean {
  return predictGenderFromName(name) === "ambiguous";
}

export function getGenderedGreeting(gender: "male" | "female" | null, greeting: string): string {
  if (!gender) return greeting;
  
  const genderedReplacements: Record<string, { male: string; female: string }> = {
    "ברוך הבא": { male: "ברוך הבא", female: "ברוכה הבאה" },
    "יקר": { male: "יקר", female: "יקרה" },
    "חביב": { male: "חביב", female: "חביבה" },
    "מוכן": { male: "מוכן", female: "מוכנה" },
    "צריך": { male: "צריך", female: "צריכה" },
    "רוצה": { male: "רוצה", female: "רוצה" },
    "יכול": { male: "יכול", female: "יכולה" },
    "קח": { male: "קח", female: "קחי" },
    "בוא": { male: "בוא", female: "בואי" },
    "שמור": { male: "שמור", female: "שמרי" },
    "לחץ": { male: "לחץ", female: "לחצי" },
    "נסה": { male: "נסה", female: "נסי" },
    "תלחץ": { male: "תלחץ", female: "תלחצי" },
    "תנסה": { male: "תנסה", female: "תנסי" },
    "תקרא": { male: "תקרא", female: "תקראי" },
    "תכתוב": { male: "תכתוב", female: "תכתבי" },
  };
  
  let result = greeting;
  for (const [key, values] of Object.entries(genderedReplacements)) {
    if (result.includes(key)) {
      result = result.replace(key, values[gender]);
    }
  }
  
  return result;
}

export function getGenderedYouForm(gender: "male" | "female" | null): string {
  if (gender === "male") return "אתה";
  if (gender === "female") return "את";
  return "את/ה";
}

export function getGenderedPossessive(gender: "male" | "female" | null, word: string): string {
  if (gender === "male") return `${word}ך`;
  if (gender === "female") return `${word}ך`;
  return `${word}ך`;
}
