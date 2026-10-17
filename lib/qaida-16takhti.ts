// lib/qaida-16takhti.ts
//
// The traditional 16-Takhti (lesson-board) breakdown of the Noorani Qaida,
// as taught in Pakistani/South Asian madrasas — the same curriculum
// structure used across mainstream Qaida primers. Each Takhti's drill
// content below is standard, uncontroversial reference material (the
// Arabic alphabet, the 14 Quranic Huroof-e-Muqatta'at, and well-known
// Quranic word examples for each tajweed feature) — not reproduced from
// any single publisher's artwork.
//
// Builds on the makhraj/rule reference already in lib/qaida-content.ts.

import { ARABIC_LETTERS } from "./qaida-content";

export type TakhtiContentType = "letters" | "words";

export interface TakhtiItem {
  text:    string;
  sub?:    string; // transliteration or short label, shown under the item
}

export interface Takhti {
  number:      number;        // 1-16
  title:       string;
  titleUrdu:   string;
  titleArabic: string;
  description: string;
  contentType: TakhtiContentType;
  contentLabel: string;       // e.g. "The 29 isolated Arabic letters..."
  items:       TakhtiItem[];
}

export const TAKHTIS: Takhti[] = [
  {
    number: 1, title: "Mufradat", titleUrdu: "مفردات", titleArabic: "مفردات",
    description: "The isolated Arabic letters, each with its correct articulation point (makhraj).",
    contentType: "letters",
    contentLabel: "The 29 isolated Arabic letters and their correct articulation points (makhraj).",
    items: ARABIC_LETTERS.map(l => ({ text: l.letter, sub: l.transliteration })),
  },
  {
    number: 2, title: "Murakkabat", titleUrdu: "مرکبات", titleArabic: "مرکبات",
    description: "Letters joined together without vowels, to practice recognizing their joined (initial/medial/final) forms.",
    contentType: "words",
    contentLabel: "Joined-letter combinations, read without vowel sounds.",
    items: [
      { text: "بت" }, { text: "تث" }, { text: "ثج" }, { text: "جح" }, { text: "حخ" },
      { text: "خد" }, { text: "ذر" }, { text: "رز" }, { text: "زس" }, { text: "سش" },
      { text: "شص" }, { text: "صض" }, { text: "ضط" }, { text: "طظ" }, { text: "ظع" },
      { text: "عغ" }, { text: "غف" }, { text: "فق" }, { text: "قك" }, { text: "كل" },
      { text: "لم" }, { text: "من" }, { text: "نو" }, { text: "وه" }, { text: "هي" },
    ],
  },
  {
    number: 3, title: "Huroof-e-Muqatta'at", titleUrdu: "حروف مقطعات", titleArabic: "الحروف المقطعات",
    description: "The 14 distinct disjointed-letter combinations that open 29 Surahs of the Quran.",
    contentType: "words",
    contentLabel: "The 14 Huroof-e-Muqatta'at combinations, as they appear at the start of their Surahs.",
    items: [
      { text: "الم", sub: "Alif Lam Meem" }, { text: "المص", sub: "Alif Lam Meem Sad" },
      { text: "الر", sub: "Alif Lam Ra" }, { text: "المر", sub: "Alif Lam Meem Ra" },
      { text: "كهيعص", sub: "Kaf Ha Ya Ain Sad" }, { text: "طه", sub: "Ta Ha" },
      { text: "طسم", sub: "Ta Seen Meem" }, { text: "طس", sub: "Ta Seen" },
      { text: "يس", sub: "Ya Seen" }, { text: "ص", sub: "Sad" },
      { text: "حم", sub: "Ha Meem" }, { text: "عسق", sub: "Ain Seen Qaf" },
      { text: "ق", sub: "Qaf" }, { text: "ن", sub: "Noon" },
    ],
  },
  {
    number: 4, title: "Harakaat", titleUrdu: "حرکات", titleArabic: "الحرکات",
    description: "The three short vowel marks — Zabar (Fatha), Zer (Kasra), and Pesh (Damma) — that give a consonant its sound.",
    contentType: "words",
    contentLabel: "Letters carrying each of the three short vowel marks.",
    items: [
      { text: "بَ", sub: "Fatha (Zabar)" }, { text: "تَ", sub: "Fatha" }, { text: "جَ", sub: "Fatha" },
      { text: "بِ", sub: "Kasra (Zer)" }, { text: "تِ", sub: "Kasra" }, { text: "جِ", sub: "Kasra" },
      { text: "بُ", sub: "Damma (Pesh)" }, { text: "تُ", sub: "Damma" }, { text: "جُ", sub: "Damma" },
    ],
  },
  {
    number: 5, title: "Tanween", titleUrdu: "تنوین", titleArabic: "التنوین",
    description: "Doubling a harakah at the end of a word adds an 'n' sound — used to mark indefinite nouns.",
    contentType: "words",
    contentLabel: "The three Tanween forms: Fathatain, Kasratain, Dammatain.",
    items: [
      { text: "كِتَابًا", sub: "Fathatain" }, { text: "عَلِيمًا", sub: "Fathatain" },
      { text: "كِتَابٍ", sub: "Kasratain" }, { text: "عَلِيمٍ", sub: "Kasratain" },
      { text: "كِتَابٌ", sub: "Dammatain" }, { text: "عَلِيمٌ", sub: "Dammatain" },
    ],
  },
  {
    number: 6, title: "Mashq Harakaat-o-Tanween", titleUrdu: "مشق حرکات و تنوین", titleArabic: "مشق الحرکات والتنوین",
    description: "Practice combining short vowels and Tanween together in short words.",
    contentType: "words",
    contentLabel: "Mixed-practice words combining Harakaat and Tanween.",
    items: [
      { text: "بَتٍ" }, { text: "جَدًا" }, { text: "رَبٌّ" }, { text: "عِلْمًا" },
      { text: "سَلَامٌ" }, { text: "كِتَابٌ" }, { text: "هُدًى" }, { text: "نُورًا" },
    ],
  },
  {
    number: 7, title: "Khari Zabar, Khari Zer, Ulta Pesh", titleUrdu: "کھڑی زبر، کھڑی زیر، الٹا پیش", titleArabic: "الفتحة والکسرة والضمة القائمة",
    description: "Vertical/inverted vowel marks that produce an elongated sound without writing a separate madd letter.",
    contentType: "words",
    contentLabel: "Words carrying Khari Zabar (vertical fatha), Khari Zer, or Ulta Pesh.",
    items: [
      { text: "هَٰذَا", sub: "Khari Zabar" }, { text: "ذَٰلِكَ", sub: "Khari Zabar" },
      { text: "الرَّحْمَٰن", sub: "Khari Zabar" }, { text: "لَٰكِنَّ", sub: "Khari Zabar" },
    ],
  },
  {
    number: 8, title: "Madd-o-Leen", titleUrdu: "مد و لین", titleArabic: "المد واللین",
    description: "The three Madd (elongation) letters — Alif, Waw, Ya — plus the Leen letters, when they carry sukoon after a matching vowel.",
    contentType: "words",
    contentLabel: "Madd letter and Leen letter examples.",
    items: [
      { text: "قَالَ", sub: "Alif madd" }, { text: "كَانَ", sub: "Alif madd" },
      { text: "يَقُولُ", sub: "Waw madd" }, { text: "نُوحِيهَا", sub: "Waw madd" },
      { text: "قِيلَ", sub: "Ya madd" }, { text: "فِيهِ", sub: "Ya madd" },
      { text: "قَوْل", sub: "Leen (Waw)" }, { text: "بَيْت", sub: "Leen (Ya)" },
    ],
  },
  {
    number: 9, title: "Mashq Harakaat (Madd-o-Leen)", titleUrdu: "مشق حرکات (مد و لین)", titleArabic: "مشق المد واللین",
    description: "Practice reading words that combine short vowels with Madd and Leen letters.",
    contentType: "words",
    contentLabel: "Practice words combining Harakaat with Madd-o-Leen.",
    items: [
      { text: "قَالَ" }, { text: "يَقُولُ" }, { text: "قِيلَ" }, { text: "قَوْل" },
      { text: "بَيْت" }, { text: "خَوْف" }, { text: "سَمَاءِ" }, { text: "فِيهِ" },
    ],
  },
  {
    number: 10, title: "Sukoon (Jazm)", titleUrdu: "سکون (جزم)", titleArabic: "السکون",
    description: "A letter with sukoon carries no vowel of its own — it is pronounced with a crisp, quick stop.",
    contentType: "words",
    contentLabel: "Words with letters carrying Sukoon.",
    items: [
      { text: "يَنْصُرُ" }, { text: "أَحْمَدْ" }, { text: "مِنْ" }, { text: "قُلْ" },
      { text: "اَلْحَمْدُ" }, { text: "أَنْعَمْتَ" },
    ],
  },
  {
    number: 11, title: "Mashq Sukoon", titleUrdu: "مشق سکون", titleArabic: "مشق السکون",
    description: "Extended practice reading words with Sukoon in different positions.",
    contentType: "words",
    contentLabel: "Practice words with Sukoon.",
    items: [
      { text: "يَنْصُرُ" }, { text: "أَحْمَدْ" }, { text: "مِنْ" }, { text: "قُلْ" },
      { text: "يَعْلَمُ" }, { text: "أَنْزَلْنَا" }, { text: "مَنْ" }, { text: "عِنْدَ" },
    ],
  },
  {
    number: 12, title: "Tashdeed", titleUrdu: "تشدید", titleArabic: "الشدة",
    description: "A doubled letter, marked with Shaddah — pronounced once, but held/emphasized for the weight of two letters.",
    contentType: "words",
    contentLabel: "Words with a Shaddah (Tashdeed).",
    items: [
      { text: "رَبَّ" }, { text: "الْحَقُّ" }, { text: "إِيَّاكَ" }, { text: "الشَّمْس" }, { text: "النَّاس" },
    ],
  },
  {
    number: 13, title: "Mashq Tashdeed", titleUrdu: "مشق تشدید", titleArabic: "مشق الشدة",
    description: "Extended practice reading doubled (Shaddah) letters.",
    contentType: "words",
    contentLabel: "Practice words with Tashdeed.",
    items: [
      { text: "رَبَّ" }, { text: "الْحَقُّ" }, { text: "إِيَّاكَ" }, { text: "النَّاس" },
      { text: "الشَّمْس" }, { text: "رَبَّنَا" }, { text: "مُحَمَّد" }, { text: "عَدُوٌّ" },
    ],
  },
  {
    number: 14, title: "Mashq Tashdeed ma' Sukoon", titleUrdu: "مشق تشدید مع سکون", titleArabic: "مشق الشدة مع السکون",
    description: "Practice words that combine a Shaddah with a nearby Sukoon.",
    contentType: "words",
    contentLabel: "Practice words combining Tashdeed and Sukoon.",
    items: [
      { text: "النَّجْم" }, { text: "الْحَقّ" }, { text: "رَبِّهِمْ" }, { text: "مِنْهُمْ" },
      { text: "عَنْهُمْ" }, { text: "الْحَمْدُ لِلَّهِ" },
    ],
  },
  {
    number: 15, title: "Tashdeed ma' Madd-o-Leen", titleUrdu: "تشدید مع مد و لین", titleArabic: "الشدة مع المد واللین",
    description: "Practice words that combine a Shaddah with Madd or Leen letters.",
    contentType: "words",
    contentLabel: "Practice words combining Tashdeed with Madd-o-Leen.",
    items: [
      { text: "الضَّالِّينَ" }, { text: "الطَّوَاف" }, { text: "جَاءُوا" }, { text: "السَّمَاء" }, { text: "الْمَلَائِكَة" },
    ],
  },
  {
    number: 16, title: "Tashdeed ba'd Huroof-e-Madd", titleUrdu: "تشدید بعد حروفِ مد", titleArabic: "الشدة بعد حروف المد",
    description: "Madd Lazim words — a Shaddah immediately following a Madd letter, held for the full 6 counts.",
    contentType: "words",
    contentLabel: "Madd Lazim words: Tashdeed directly after a Madd letter.",
    items: [
      { text: "الْحَاقَّة" }, { text: "الطَّامَّة" }, { text: "الصَّاخَّة" }, { text: "الضَّالِّينَ" }, { text: "دَابَّة" },
    ],
  },
];

export const TOTAL_TAKHTIS = TAKHTIS.length;
