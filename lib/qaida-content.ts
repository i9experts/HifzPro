// lib/qaida-content.ts
//
// Reference content for the Ustadh's Qaida / Tajweed module, following the
// standard Noorani Qaida lesson breakdown (the reference used by most
// Pakistani/South Asian madrasas) and the classical 5-category, 17-point
// Makharij al-Huruf (articulation point) classification taught in every
// mainstream Sunni tajweed curriculum.
//
// This is standard, uncontroversial reference material reproduced from
// well-established classical tajweed scholarship (Ibn al-Jazari's Makharij
// classification; the four Noon Sakin/Tanween rules; Lam Shamsiyya/
// Qamariyya; Qalqalah; Madd types; Waqf signs) — it is not tied to, or
// copied from, any single publisher's book or artwork.

export type MakhrajCategory = "JAWF" | "HALQ" | "LISAN" | "SHAFATAIN" | "KHAISHOOM";

export const MAKHRAJ_CATEGORIES: { id: MakhrajCategory; label: string; arabic: string; color: string; desc: string }[] = [
  { id: "JAWF",       label: "The Oral Cavity",  arabic: "الجوف",   color: "#7c3aed", desc: "The empty space in the mouth and throat — source of the 3 madd (elongation) letters." },
  { id: "HALQ",       label: "The Throat",       arabic: "الحلق",   color: "#dc2626", desc: "3 points: farthest (أقصى), middle (وسط), and nearest (أدنى) the mouth." },
  { id: "LISAN",      label: "The Tongue",       arabic: "اللسان",  color: "#0891b2", desc: "10 points, from the back of the tongue to its tip." },
  { id: "SHAFATAIN",  label: "The Two Lips",     arabic: "الشفتان", color: "#b45309", desc: "2 points, formed with the lips." },
  { id: "KHAISHOOM",  label: "The Nasal Cavity", arabic: "الخيشوم", color: "#0f766e", desc: "Source of ghunnah (nasalization) — not an independent letter." },
];

export interface ArabicLetter {
  letter:          string;
  name:            string;
  nameUrdu:        string;
  transliteration: string;
  makhraj:         MakhrajCategory;
  makhrajPoint:    string;   // e.g. "Tip of tongue with base of upper front teeth"
  group:           string;   // the traditional letter-grouping this letter belongs to, e.g. "طدت"
}

// The 29 symbols taught in Lesson 1, in the standard alphabetical order
// used by Noorani Qaida (hamza and the long/short forms of alif taught
// alongside the 28-letter alphabet).
export const ARABIC_LETTERS: ArabicLetter[] = [
  { letter: "ا", name: "Alif", nameUrdu: "الف", transliteration: "a",  makhraj: "JAWF",      makhrajPoint: "The oral cavity (as a madd/elongation letter, preceded by a fatha)", group: "مد" },
  { letter: "ب", name: "Ba",   nameUrdu: "بے",  transliteration: "b",  makhraj: "SHAFATAIN", makhrajPoint: "Between the two lips (closed)",                                    group: "بمو" },
  { letter: "ت", name: "Ta",   nameUrdu: "تے",  transliteration: "t",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue with the base of the upper front teeth",          group: "طدت" },
  { letter: "ث", name: "Tha",  nameUrdu: "ثے",  transliteration: "th", makhraj: "LISAN",     makhrajPoint: "Tip of the tongue between the upper and lower front teeth",         group: "ظثذ" },
  { letter: "ج", name: "Jim",  nameUrdu: "جیم", transliteration: "j",  makhraj: "LISAN",     makhrajPoint: "Middle of the tongue with the hard palate",                        group: "جشي" },
  { letter: "ح", name: "Ha",   nameUrdu: "حے",  transliteration: "ḥ",  makhraj: "HALQ",      makhrajPoint: "Middle of the throat",                                              group: "عح" },
  { letter: "خ", name: "Kha",  nameUrdu: "خے",  transliteration: "kh", makhraj: "HALQ",      makhrajPoint: "Nearest part of the throat to the mouth",                          group: "غخ" },
  { letter: "د", name: "Dal",  nameUrdu: "دال", transliteration: "d",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue with the base of the upper front teeth",          group: "طدت" },
  { letter: "ذ", name: "Dhal", nameUrdu: "ذال", transliteration: "dh", makhraj: "LISAN",     makhrajPoint: "Tip of the tongue between the upper and lower front teeth",         group: "ظثذ" },
  { letter: "ر", name: "Ra",   nameUrdu: "رے",  transliteration: "r",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue, slightly curled, with a light vibration",        group: "" },
  { letter: "ز", name: "Zay",  nameUrdu: "زے",  transliteration: "z",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue, close to the lower front teeth",                 group: "صزس" },
  { letter: "س", name: "Sin",  nameUrdu: "سین", transliteration: "s",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue, close to the lower front teeth",                 group: "صزس" },
  { letter: "ش", name: "Shin", nameUrdu: "شین", transliteration: "sh", makhraj: "LISAN",     makhrajPoint: "Middle of the tongue with the hard palate",                        group: "جشي" },
  { letter: "ص", name: "Sad",  nameUrdu: "صاد", transliteration: "ṣ",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue, close to the lower front teeth",                 group: "صزس" },
  { letter: "ض", name: "Dad",  nameUrdu: "ضاد", transliteration: "ḍ",  makhraj: "LISAN",     makhrajPoint: "Edge of the tongue (either side) with the upper molars",            group: "" },
  { letter: "ط", name: "Ta",   nameUrdu: "طے",  transliteration: "ṭ",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue with the base of the upper front teeth",          group: "طدت" },
  { letter: "ظ", name: "Za",   nameUrdu: "ظے",  transliteration: "ẓ",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue between the upper and lower front teeth",         group: "ظثذ" },
  { letter: "ع", name: "Ain",  nameUrdu: "عین", transliteration: "ʿ",  makhraj: "HALQ",      makhrajPoint: "Middle of the throat",                                              group: "عح" },
  { letter: "غ", name: "Ghain",nameUrdu: "غین", transliteration: "gh", makhraj: "HALQ",      makhrajPoint: "Nearest part of the throat to the mouth",                          group: "غخ" },
  { letter: "ف", name: "Fa",   nameUrdu: "فے",  transliteration: "f",  makhraj: "SHAFATAIN", makhrajPoint: "Inner edge of the lower lip with the tips of the upper front teeth", group: "" },
  { letter: "ق", name: "Qaf",  nameUrdu: "قاف", transliteration: "q",  makhraj: "LISAN",     makhrajPoint: "Back of the tongue with the soft palate (uvula)",                   group: "" },
  { letter: "ك", name: "Kaf",  nameUrdu: "کاف", transliteration: "k",  makhraj: "LISAN",     makhrajPoint: "Back of the tongue with the hard palate, just forward of Qaf",       group: "" },
  { letter: "ل", name: "Lam",  nameUrdu: "لام", transliteration: "l",  makhraj: "LISAN",     makhrajPoint: "Edge of the tongue (front section) with the gums above the front teeth", group: "" },
  { letter: "م", name: "Mim",  nameUrdu: "میم", transliteration: "m",  makhraj: "SHAFATAIN", makhrajPoint: "Between the two lips (closed)",                                    group: "بمو" },
  { letter: "ن", name: "Nun",  nameUrdu: "نون", transliteration: "n",  makhraj: "LISAN",     makhrajPoint: "Tip of the tongue, just behind the point of Lam",                   group: "" },
  { letter: "و", name: "Waw",  nameUrdu: "واؤ", transliteration: "w",  makhraj: "SHAFATAIN", makhrajPoint: "Rounding of the two lips (as a consonant); the oral cavity (as a madd letter, preceded by a damma)", group: "بمو" },
  { letter: "ه", name: "Ha",   nameUrdu: "ہے",  transliteration: "h",  makhraj: "HALQ",      makhrajPoint: "Farthest part of the throat, from the chest",                       group: "ءه" },
  { letter: "ء", name: "Hamza",nameUrdu: "ہمزہ",transliteration: "ʾ",  makhraj: "HALQ",      makhrajPoint: "Farthest part of the throat, from the chest",                       group: "ءه" },
  { letter: "ي", name: "Ya",   nameUrdu: "یے",  transliteration: "y",  makhraj: "LISAN",     makhrajPoint: "Middle of the tongue with the hard palate (as a consonant); the oral cavity (as a madd letter, preceded by a kasra)", group: "جشي" },
];

export interface RuleItem {
  name:        string;
  nameArabic:  string;
  letters?:    string[];
  example?:    string;
  desc:        string;
}

export type LessonContentType = "letters" | "combo" | "rules" | "practice" | "revision";

export interface QaidaLesson {
  title:       string;
  titleUrdu:   string;
  titleArabic: string;
  summary:     string;
  type:        LessonContentType;
  combo?:      { label: string; labelUrdu: string; examples: string[] }[];
  rules?:      RuleItem[];
  items?:      string[];
}

export const QAIDA_LESSONS: QaidaLesson[] = [
  {
    title: "Arabic Letters", titleUrdu: "حروفِ تہجی", titleArabic: "حروف",
    summary: "The 29 symbols of the Arabic alphabet, each with its correct articulation point (makhraj).",
    type: "letters",
  },
  {
    title: "Harakat", titleUrdu: "زبر، زیر، پیش", titleArabic: "حرکات",
    summary: "The three short vowel marks that give a consonant its sound.",
    type: "combo",
    combo: [
      { label: "Fatha (Zabar)", labelUrdu: "زبر", examples: ["بَ", "تَ", "جَ", "دَ", "رَ"] },
      { label: "Kasra (Zer)",   labelUrdu: "زیر", examples: ["بِ", "تِ", "جِ", "دِ", "رِ"] },
      { label: "Damma (Pesh)",  labelUrdu: "پیش", examples: ["بُ", "تُ", "جُ", "دُ", "رُ"] },
    ],
  },
  {
    title: "Tanwin", titleUrdu: "تنوین", titleArabic: "تنوین",
    summary: "Doubling a harakah at the end of a word adds an 'n' sound — used for indefinite nouns.",
    type: "combo",
    combo: [
      { label: "Fathatain",  labelUrdu: "دو زبر", examples: ["بًا", "كِتَابًا", "عَلِيمًا"] },
      { label: "Kasratain",  labelUrdu: "دو زیر",  examples: ["بٍ", "كِتَابٍ", "عَلِيمٍ"] },
      { label: "Dammatain",  labelUrdu: "دو پیش",  examples: ["بٌ", "كِتَابٌ", "عَلِيمٌ"] },
    ],
  },
  {
    title: "Madd Letters", titleUrdu: "حروفِ مد", titleArabic: "حروف مد",
    summary: "Three letters that elongate the preceding vowel by 2 counts when they carry sukoon.",
    type: "combo",
    combo: [
      { label: "Alif after Fatha", labelUrdu: "الف مدی", examples: ["قَالَ", "كَانَ", "سَمَاءِ"] },
      { label: "Waw after Damma",  labelUrdu: "واو مدی", examples: ["يَقُولُ", "نُوحِيهَا"] },
      { label: "Ya after Kasra",  labelUrdu: "یاء مدی", examples: ["قِيلَ", "فِيهِ"] },
    ],
  },
  {
    title: "Sukoon", titleUrdu: "سکون", titleArabic: "سکون",
    summary: "A letter with sukoon carries no vowel of its own — it is pronounced with a crisp, quick stop.",
    type: "combo",
    combo: [
      { label: "Sukoon examples", labelUrdu: "امثلہ", examples: ["يَنْصُرُ", "أَحْمَدْ", "مِنْ", "قُلْ"] },
    ],
  },
  {
    title: "Shaddah", titleUrdu: "شدہ", titleArabic: "شدة",
    summary: "A doubled letter — pronounced once, but held/emphasized for the weight of two letters.",
    type: "combo",
    combo: [
      { label: "Shaddah examples", labelUrdu: "امثلہ", examples: ["رَبَّ", "الْحَقُّ", "إِيَّاكَ"] },
    ],
  },
  {
    title: "Qalqalah", titleUrdu: "قلقلہ", titleArabic: "قلقلہ",
    summary: "A distinct echoing/bouncing sound produced on 5 letters when they carry sukoon.",
    type: "rules",
    rules: [
      { name: "Qalqalah Letters", nameArabic: "قطب جد", letters: ["ق", "ط", "ب", "ج", "د"], example: "يَقْطَعُ · أَحَطْتُ · يَجْعَلُ", desc: "Remembered by the mnemonic \"قطب جد\". Strongest at the end of a stopped word (waqf), lighter in the middle of a word." },
    ],
  },
  {
    title: "Laam Rules", titleUrdu: "لام", titleArabic: "أحكام اللام",
    summary: "The lam of \"ال\" (the definite article) is either pronounced or silent, depending on the letter after it.",
    type: "rules",
    rules: [
      { name: "Lam Shamsiyyah (Sun Letters)", nameArabic: "لام شمسیہ", letters: ["ت","ث","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ل","ن"], example: "الشَّمْس · النَّاس", desc: "The lam is silent and the following letter is doubled (shaddah)." },
      { name: "Lam Qamariyyah (Moon Letters)", nameArabic: "لام قمریہ", letters: ["ا","ب","ج","ح","خ","ع","غ","ف","ق","ك","م","و","ه","ي"], example: "الْقَمَر · الْحَمْد", desc: "The lam is pronounced clearly." },
    ],
  },
  {
    title: "Raa Rules", titleUrdu: "ر", titleArabic: "أحكام الراء",
    summary: "The letter ر is pronounced heavy (tafkhim) or light (tarqiq) depending on its vowel.",
    type: "rules",
    rules: [
      { name: "Tafkhim (Heavy)", nameArabic: "تفخیم", example: "رَبَّنَا · قُرْآن", desc: "Ra with fatha or damma, or sakin preceded by fatha/damma." },
      { name: "Tarqiq (Light)",  nameArabic: "ترقیق", example: "رِجَال · فِرْعَون", desc: "Ra with kasra, or sakin preceded by kasra (and not followed by an isti'la letter in the same word)." },
    ],
  },
  {
    title: "Noon Sakin & Tanwin", titleUrdu: "نون ساکن اور تنوین", titleArabic: "أحكام النون الساكنة والتنوین",
    summary: "Four rules governing نْ or tanwin, depending on the letter that follows.",
    type: "rules",
    rules: [
      { name: "Izhar (Clear)",         nameArabic: "اظہار حلقی", letters: ["ء","ه","ع","ح","غ","خ"], desc: "Pronounced clearly, with no nasalization — the following letters are all throat (halq) letters." },
      { name: "Idgham with Ghunnah",   nameArabic: "ادغام بالغنہ", letters: ["ي","ن","م","و"], desc: "Merged into the following letter, with a 2-count nasal hum (ghunnah)." },
      { name: "Idgham without Ghunnah",nameArabic: "ادغام بلا غنہ", letters: ["ل","ر"], desc: "Merged into the following letter, with no nasal hum." },
      { name: "Iqlab (Conversion)",    nameArabic: "اقلاب", letters: ["ب"], desc: "Converted to a light meem sound with ghunnah, in preparation for the following ب." },
      { name: "Ikhfa (Concealment)",   nameArabic: "اخفاء حقیقی", letters: ["ت","ث","ج","د","ذ","ز","س","ش","ص","ض","ط","ظ","ف","ق","ك"], desc: "Concealed — pronounced between a clear noon and a full merge, with ghunnah." },
    ],
  },
  {
    title: "Meem Sakin", titleUrdu: "میم ساکن", titleArabic: "أحكام الميم الساكنة",
    summary: "Three rules governing مْ, depending on the letter that follows.",
    type: "rules",
    rules: [
      { name: "Ikhfa Shafawi",  nameArabic: "اخفاء شفوی", letters: ["ب"], desc: "Lightly concealed, with ghunnah, lips barely touching." },
      { name: "Idgham Shafawi", nameArabic: "ادغام شفوی", letters: ["م"], desc: "Merged into the following meem, held with ghunnah." },
      { name: "Izhar Shafawi",  nameArabic: "اظہار شفوی", desc: "Pronounced clearly before every other letter — extra care is needed before و and ف, whose makhraj is close to the lips." },
    ],
  },
  {
    title: "Madd Rules", titleUrdu: "مد", titleArabic: "أحكام المد",
    summary: "How long to hold a madd letter, measured in counts (harakaat).",
    type: "rules",
    rules: [
      { name: "Madd Tabi'i (Natural)",        nameArabic: "مد طبیعی", example: "قَالَ · يَقُولُ", desc: "2 counts — no hamza or sukoon follows the madd letter." },
      { name: "Madd Muttasil (Connected)",    nameArabic: "مد متصل", example: "السَّمَاء · جَاءَ", desc: "4–5 counts (mandatory) — the hamza is in the same word as the madd letter." },
      { name: "Madd Munfasil (Separated)",    nameArabic: "مد منفصل", example: "قَالُوا آمَنَّا", desc: "4–5 counts (permissible) — the hamza begins the next word." },
      { name: "Madd 'Aarid Lis-Sukoon",       nameArabic: "مد عارض للسکون", example: "الرَّحِيمْ (at a stop)", desc: "2, 4, or 6 counts (reciter's choice) — the letter after the madd only becomes sakin because of stopping (waqf)." },
      { name: "Madd Lazim (Obligatory)",      nameArabic: "مد لازم", example: "الضَّالِّينَ · الْحَاقَّة", desc: "6 counts (mandatory) — the madd letter is followed by a permanent sukoon or shaddah in the same word." },
    ],
  },
  {
    title: "Waqf Rules", titleUrdu: "وقف", titleArabic: "علامات الوقف",
    summary: "Stop signs printed in the mushaf that guide where a reciter should or shouldn't pause.",
    type: "rules",
    rules: [
      { name: "Waqf Lazim (Must stop)",           nameArabic: "م",  desc: "A compulsory stop — continuing without pausing here changes the meaning." },
      { name: "La Waqf (Must not stop)",          nameArabic: "لا", desc: "Do not stop here; if you do, go back and re-read from before it." },
      { name: "Waqf Jaiz (Permissible)",          nameArabic: "ج",  desc: "Stopping or continuing are equally fine." },
      { name: "Al-Wasl Awla (Continuing preferred)", nameArabic: "صلی", desc: "Better to continue, though stopping is allowed." },
      { name: "Al-Waqf Awla (Stopping preferred)",  nameArabic: "قلی", desc: "Better to stop, though continuing is allowed." },
      { name: "Waqf al-Mu'anaqah (Paired dots)",  nameArabic: "⁘ ⁘", desc: "Stop at one of the two marked spots, never both and never neither." },
    ],
  },
  {
    title: "Practice Exercises", titleUrdu: "مشقی جملے", titleArabic: "تمرین",
    summary: "Combined word-reading practice, applying every rule learned so far.",
    type: "practice",
    items: ["بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", "قُلْ هُوَ اللَّهُ أَحَدٌ", "مِن شَرِّ مَا خَلَقَ", "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"],
  },
  {
    title: "Final Revision", titleUrdu: "حتمی نظرثانی", titleArabic: "المراجعة النہائیۃ",
    summary: "A checklist covering every lesson — confirm each is solid before moving the student into the Qur'an.",
    type: "revision",
    items: [
      "Correct makhraj for all 29 letters",
      "Harakat, tanwin, and madd letters read fluently",
      "Sukoon and shaddah pronounced correctly",
      "Qalqalah letters bounce clearly on sukoon",
      "Lam Shamsiyyah/Qamariyyah applied correctly",
      "Raa tafkhim/tarqiq applied correctly",
      "All 4 Noon Sakin/Tanwin rules and all 3 Meem Sakin rules applied correctly",
      "Madd counts held correctly for each madd type",
      "Waqf signs recognized and followed",
    ],
  },
];
