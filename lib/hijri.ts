// lib/hijri.ts
// Hijri (Islamic) calendar utilities using the browser/Node Intl API
// Uses Umm al-Qura calendar — the official Islamic calendar of Saudi Arabia,
// widely used across Pakistan and the Muslim world.
// No external dependency required — works natively in Node 18+ and modern browsers.

// ── Month names ──
export const HIJRI_MONTHS: { en: string; ar: string; ur: string; significance?: string }[] = [
  { en: "Muharram",      ar: "مُحَرَّم",       ur: "محرم",         significance: "Sacred month · Ashura on 10th" },
  { en: "Safar",         ar: "صَفَر",          ur: "صفر",          },
  { en: "Rabi ul Awwal", ar: "رَبِيع الأَوَّل",  ur: "ربیع الاول",   significance: "Birth of Prophet ﷺ on 12th" },
  { en: "Rabi ul Akhir", ar: "رَبِيع الآخِر",   ur: "ربیع الثانی",  },
  { en: "Jumada ul Ula", ar: "جُمَادَى الأُولَى", ur: "جمادی الاول",  },
  { en: "Jumada ul Akhira",ar:"جُمَادَى الآخِرَة",ur:"جمادی الثانی", },
  { en: "Rajab",         ar: "رَجَب",          ur: "رجب",          significance: "Sacred month · Isra & Miraj on 27th" },
  { en: "Sha'ban",       ar: "شَعْبَان",        ur: "شعبان",        significance: "Night of Blessings on 15th" },
  { en: "Ramadan",       ar: "رَمَضَان",        ur: "رمضان",        significance: "Month of fasting · Laylat ul Qadr on 27th" },
  { en: "Shawwal",       ar: "شَوَّال",         ur: "شوال",         significance: "Eid ul Fitr on 1st" },
  { en: "Dhul Qa'dah",   ar: "ذُو الْقَعْدَة",  ur: "ذوالقعدہ",    significance: "Sacred month" },
  { en: "Dhul Hijjah",   ar: "ذُو الْحِجَّة",   ur: "ذوالحجہ",     significance: "Eid ul Adha on 10th · Hajj days" },
];

export interface HijriDate {
  year:        number;
  month:       number; // 1-12
  day:         number;
  weekday:     number; // 0=Sun
  monthNameEn: string;
  monthNameAr: string;
  monthNameUr: string;
  significance?: string;
}

// ── Core converter — Gregorian → Hijri ──
export function toHijri(date: Date = new Date()): HijriDate {
  try {
    // Use Intl API with islamic-umalqura calendar
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day:     "numeric",
      month:   "numeric",
      year:    "numeric",
      weekday: "short",
    }).formatToParts(date);

    const get = (type: string) => parts.find(p => p.type === type)?.value || "0";
    const year  = parseInt(get("year"));
    const month = parseInt(get("month"));
    const day   = parseInt(get("day"));
    const monthInfo = HIJRI_MONTHS[month - 1] || HIJRI_MONTHS[0];

    return {
      year, month, day,
      weekday:     date.getDay(),
      monthNameEn: monthInfo.en,
      monthNameAr: monthInfo.ar,
      monthNameUr: monthInfo.ur,
      significance: monthInfo.significance,
    };
  } catch {
    // Fallback for environments where islamic-umalqura isn't supported
    return fallbackToHijri(date);
  }
}

// ── Format Hijri date as string ──
export function formatHijri(
  date: Date = new Date(),
  lang: "en" | "ar" | "ur" = "en"
): string {
  try {
    if (lang === "ar") {
      return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric", month: "long", year: "numeric",
      }).format(date);
    }
    const h = toHijri(date);
    if (lang === "ur") {
      return `${h.day} ${h.monthNameUr} ${h.year}ھ`;
    }
    return `${h.day} ${h.monthNameEn} ${h.year} AH`;
  } catch {
    const h = toHijri(date);
    return `${h.day} ${h.monthNameEn} ${h.year} AH`;
  }
}

// ── Get just the Hijri year ──
export function hijriYear(date: Date = new Date()): number {
  return toHijri(date).year;
}

// ── Bilingual formatted date (for certificates) ──
export function formatHijriBilingual(date: Date = new Date()): {
  hijri: string; hijriAr: string; gregorian: string;
} {
  const h = toHijri(date);
  return {
    hijri:     `${h.day} ${h.monthNameEn} ${h.year} AH`,
    hijriAr:   formatHijri(date, "ar"),
    gregorian: date.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }),
  };
}

// ── Get all days in a Hijri month (returns Gregorian Date objects) ──
export function getHijriMonthDays(hijriYear: number, hijriMonth: number): {
  date: Date; hijri: HijriDate; isCurrentMonth: boolean;
}[] {
  // Find a date in the middle of the target Hijri month to anchor our search
  // We'll scan forward/backward from an estimated Gregorian date
  const estimated = hijriToGregorianApprox(hijriYear, hijriMonth, 15);
  
  const days: { date: Date; hijri: HijriDate; isCurrentMonth: boolean }[] = [];
  
  // Scan 45 days around the estimated date to find all days in this Hijri month
  const start = new Date(estimated);
  start.setDate(start.getDate() - 20);
  
  let inMonth  = false;
  let dayCount = 0;
  
  for (let i = 0; i < 45; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const h = toHijri(d);
    
    if (h.year === hijriYear && h.month === hijriMonth) {
      days.push({ date: d, hijri: h, isCurrentMonth: true });
      inMonth = true;
      dayCount++;
    } else if (inMonth) {
      break; // Past the end of this month
    }
  }
  
  return days;
}

// ── Build a calendar grid for a Hijri month (6 weeks × 7 days) ──
export interface CalendarDay {
  date:          Date;
  hijri:         HijriDate;
  isCurrentMonth: boolean;
  isToday:       boolean;
  events:        IslamicEvent[];
}

export function buildHijriCalendarGrid(
  hijriYear: number,
  hijriMonth: number
): CalendarDay[] {
  const monthDays = getHijriMonthDays(hijriYear, hijriMonth);
  if (monthDays.length === 0) return [];
  
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const todayH   = toHijri(today);
  
  const firstDay = monthDays[0].date;
  const lastDay  = monthDays[monthDays.length - 1].date;
  
  // Pad to start of week (Sunday)
  const startPad = firstDay.getDay();
  const grid: CalendarDay[] = [];
  
  // Previous month padding
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() - (i + 1));
    const h = toHijri(d);
    grid.push({ date: d, hijri: h, isCurrentMonth: false, isToday: false, events: [] });
  }
  
  // Current month
  for (const day of monthDays) {
    const isToday = day.date.toDateString() === today.toDateString();
    grid.push({
      date: day.date,
      hijri: day.hijri,
      isCurrentMonth: true,
      isToday,
      events: getIslamicEvents(day.hijri.month, day.hijri.day),
    });
  }
  
  // Next month padding to complete the grid
  const endPad = 7 - (grid.length % 7 === 0 ? 7 : grid.length % 7);
  if (endPad < 7) {
    for (let i = 1; i <= endPad; i++) {
      const d = new Date(lastDay);
      d.setDate(lastDay.getDate() + i);
      const h = toHijri(d);
      grid.push({ date: d, hijri: h, isCurrentMonth: false, isToday: false, events: [] });
    }
  }
  
  return grid;
}

// ── Islamic events ──
export interface IslamicEvent {
  name:   string;
  nameAr: string;
  nameUr: string;
  type:   "holiday" | "significant" | "ramadan" | "hajj";
  color:  string;
}

const ISLAMIC_EVENTS: { month: number; day: number; event: IslamicEvent }[] = [
  { month: 1,  day: 1,  event: { name: "Islamic New Year",    nameAr: "رأس السنة الهجرية", nameUr: "اسلامی نیا سال",      type: "holiday",     color: "#0D5C3A" }},
  { month: 1,  day: 10, event: { name: "Ashura",              nameAr: "عاشوراء",            nameUr: "یوم عاشورہ",          type: "significant", color: "#7c3aed" }},
  { month: 3,  day: 12, event: { name: "Eid Milad un Nabi",   nameAr: "المولد النبوي",      nameUr: "عید میلاد النبیﷺ",    type: "holiday",     color: "#C4882A" }},
  { month: 7,  day: 27, event: { name: "Isra & Miraj",        nameAr: "الإسراء والمعراج",   nameUr: "شب معراج",            type: "significant", color: "#0369a1" }},
  { month: 8,  day: 15, event: { name: "Shab-e-Barat",        nameAr: "ليلة البراءة",       nameUr: "شب برات",             type: "significant", color: "#7c3aed" }},
  { month: 9,  day: 1,  event: { name: "Ramadan Begins",      nameAr: "بداية رمضان",        nameUr: "رمضان کا آغاز",       type: "ramadan",     color: "#10B981" }},
  { month: 9,  day: 27, event: { name: "Laylat ul Qadr",      nameAr: "ليلة القدر",         nameUr: "شب قدر",              type: "ramadan",     color: "#10B981" }},
  { month: 10, day: 1,  event: { name: "Eid ul Fitr",         nameAr: "عيد الفطر",          nameUr: "عید الفطر",           type: "holiday",     color: "#C4882A" }},
  { month: 12, day: 8,  event: { name: "Hajj begins",         nameAr: "بداية الحج",         nameUr: "حج کا آغاز",          type: "hajj",        color: "#b45309" }},
  { month: 12, day: 9,  event: { name: "Day of Arafah",       nameAr: "يوم عرفة",           nameUr: "یوم عرفہ",            type: "hajj",        color: "#b45309" }},
  { month: 12, day: 10, event: { name: "Eid ul Adha",         nameAr: "عيد الأضحى",         nameUr: "عید الاضحیٰ",         type: "holiday",     color: "#C4882A" }},
];

export function getIslamicEvents(month: number, day: number): IslamicEvent[] {
  return ISLAMIC_EVENTS
    .filter(e => e.month === month && e.day === day)
    .map(e => e.event);
}

export function getAllEventsForYear(hijriYear: number): {
  date: Date; event: IslamicEvent; hijriDay: number; hijriMonth: number;
}[] {
  return ISLAMIC_EVENTS.map(({ month, day, event }) => ({
    date:       hijriToGregorianApprox(hijriYear, month, day),
    event,
    hijriDay:   day,
    hijriMonth: month,
  }));
}

// ── Navigate Hijri months ──
export function prevHijriMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function nextHijriMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

// ── Approximate Hijri → Gregorian conversion ──
// Used internally to estimate the Gregorian date for a Hijri date.
// Based on the Kuwaiti algorithm approximation.
export function hijriToGregorianApprox(hYear: number, hMonth: number, hDay: number): Date {
  const N = hDay + Math.ceil(29.5001 * (hMonth - 1)) +
    (hYear - 1) * 354 +
    Math.floor((3 + 11 * hYear) / 30) + 1948440 - 385;
  
  let J = N;
  if (N > 2299160) {
    const alpha = Math.floor((N - 1867216.25) / 36524.25);
    J = N + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = J + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day   = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year  = month > 2 ? C - 4716 : C - 4715;
  
  const date  = new Date(year, month - 1, day);
  date.setFullYear(year); // Handle years < 100
  return date;
}

// ── Fallback Hijri conversion (without Intl.DateTimeFormat support) ──
function fallbackToHijri(date: Date): HijriDate {
  // Simplified Julian Day Number algorithm
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l  = jd - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j  = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
              Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
              Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day   = l3 - Math.floor((709 * month) / 24);
  const year  = 30 * n + j - 30;
  
  const monthInfo = HIJRI_MONTHS[month - 1] || HIJRI_MONTHS[0];
  return {
    year, month, day,
    weekday:     date.getDay(),
    monthNameEn: monthInfo.en,
    monthNameAr: monthInfo.ar,
    monthNameUr: monthInfo.ur,
    significance: monthInfo.significance,
  };
}

// ── Check if date is in Ramadan ──
export function isRamadan(date: Date = new Date()): boolean {
  return toHijri(date).month === 9;
}

// ── Get current Hijri date (convenience) ──
export function getCurrentHijri(): HijriDate {
  return toHijri(new Date());
}

// ── Format for display in UI (short form) ──
export function hijriShort(date: Date = new Date()): string {
  const h = toHijri(date);
  return `${h.day} ${h.monthNameEn.split(" ")[0]} ${h.year}H`;
}
