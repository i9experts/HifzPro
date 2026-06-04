// lib/whatsapp-templates.ts
// HifzPro WhatsApp Message Templates
// Bilingual: Urdu (primary for Pakistani parents) + English

const GRADE_LABELS: Record<string, { en: string; ur: string; emoji: string }> = {
  EXCELLENT: { en: "Excellent",  ur: "بہت اچھا",  emoji: "⭐" },
  GOOD:      { en: "Good",       ur: "اچھا",      emoji: "✅" },
  WEAK:      { en: "Weak",       ur: "کمزور",     emoji: "⚠️" },
  REPEAT:    { en: "Repeat",     ur: "دوبارہ",    emoji: "🔄" },
};

function formatDate(date: Date, lang: "ur" | "en" = "ur"): string {
  if (lang === "ur") {
    return date.toLocaleDateString("ur-PK", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }
  return date.toLocaleDateString("en-PK", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ──────────────────────────────────────────────────────────
// 1. DAILY SABAQ SUMMARY
// ──────────────────────────────────────────────────────────
export function dailySabaqMessage(data: {
  studentName:    string;
  instituteName:  string;
  ustadhName:     string;
  date:           Date;
  sabaq?:         { juz: number; pageFrom: number; pageTo: number; grade: string; mistakes: number };
  sabqi?:         { juz: number; pageFrom: number; pageTo: number; grade: string };
  manzil?:        { juzFrom: number; juzTo: number; grade: string };
  manzilHealth?:  number;
  notes?:         string;
  lang?:          "ur" | "en";
}): string {
  const { studentName, instituteName, ustadhName, date, sabaq, sabqi, manzil, manzilHealth, notes, lang = "ur" } = data;

  if (lang === "ur") {
    let msg = `🌿 *HifzPro — آج کی رپورٹ*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *طالب علم:* ${studentName}\n`;
    msg += `📅 *تاریخ:* ${formatDate(date, "ur")}\n`;
    msg += `🏫 *ادارہ:* ${instituteName}\n\n`;

    if (sabaq) {
      const g = GRADE_LABELS[sabaq.grade] || GRADE_LABELS.GOOD;
      msg += `📖 *سبق (نیا سبق)*\n`;
      msg += `   جز ${sabaq.juz} · صفحہ ${sabaq.pageFrom}–${sabaq.pageTo}\n`;
      msg += `   درجہ: ${g.ur} ${g.emoji}\n`;
      if (sabaq.mistakes > 0) msg += `   غلطیاں: ${sabaq.mistakes}\n`;
      msg += `\n`;
    }

    if (sabqi) {
      const g = GRADE_LABELS[sabqi.grade] || GRADE_LABELS.GOOD;
      msg += `🔁 *سبقی (حالیہ مراجعہ)*\n`;
      msg += `   جز ${sabqi.juz} · صفحہ ${sabqi.pageFrom}–${sabqi.pageTo}\n`;
      msg += `   درجہ: ${g.ur} ${g.emoji}\n\n`;
    }

    if (manzil) {
      const g = GRADE_LABELS[manzil.grade] || GRADE_LABELS.GOOD;
      msg += `💚 *منزل (پرانی مراجعہ)*\n`;
      msg += `   جز ${manzil.juzFrom}–${manzil.juzTo}\n`;
      msg += `   درجہ: ${g.ur} ${g.emoji}\n\n`;
    }

    if (manzilHealth !== undefined) {
      const healthEmoji = manzilHealth >= 75 ? "💚" : manzilHealth >= 55 ? "🟡" : "🔴";
      msg += `📊 *منزل صحت:* ${Math.round(manzilHealth)}% ${healthEmoji}\n`;
      if (manzilHealth < 60) msg += `   ⚠️ *توجہ:* منزل پر زیادہ توجہ دینے کی ضرورت ہے\n`;
      msg += `\n`;
    }

    if (notes) msg += `📝 *استاذ کے نوٹس:* ${notes}\n\n`;

    msg += `👨‍🏫 *استاذ:* ${ustadhName}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🌐 _HifzPro — حفظ کی ذہین نگرانی_\n`;
    msg += `_www.hifzpro.com_`;

    return msg;
  }

  // English version
  let msg = `🌿 *HifzPro — Daily Report*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Student:* ${studentName}\n`;
  msg += `📅 *Date:* ${formatDate(date, "en")}\n`;
  msg += `🏫 *Institute:* ${instituteName}\n\n`;

  if (sabaq) {
    const g = GRADE_LABELS[sabaq.grade] || GRADE_LABELS.GOOD;
    msg += `📖 *Sabaq (New Lesson)*\n`;
    msg += `   Juz ${sabaq.juz} · Pages ${sabaq.pageFrom}–${sabaq.pageTo}\n`;
    msg += `   Grade: ${g.en} ${g.emoji}`;
    if (sabaq.mistakes > 0) msg += ` · Mistakes: ${sabaq.mistakes}`;
    msg += `\n\n`;
  }

  if (sabqi) {
    const g = GRADE_LABELS[sabqi.grade] || GRADE_LABELS.GOOD;
    msg += `🔁 *Sabqi (Recent Revision)*\n`;
    msg += `   Juz ${sabqi.juz} · Pages ${sabqi.pageFrom}–${sabqi.pageTo}\n`;
    msg += `   Grade: ${g.en} ${g.emoji}\n\n`;
  }

  if (manzil) {
    const g = GRADE_LABELS[manzil.grade] || GRADE_LABELS.GOOD;
    msg += `💚 *Manzil (Long-term Revision)*\n`;
    msg += `   Juz ${manzil.juzFrom}–${manzil.juzTo}\n`;
    msg += `   Grade: ${g.en} ${g.emoji}\n\n`;
  }

  if (manzilHealth !== undefined) {
    const healthEmoji = manzilHealth >= 75 ? "💚" : manzilHealth >= 55 ? "🟡" : "🔴";
    msg += `📊 *Manzil Health:* ${Math.round(manzilHealth)}% ${healthEmoji}\n\n`;
  }

  if (notes) msg += `📝 *Ustadh's Notes:* ${notes}\n\n`;

  msg += `👨‍🏫 *Ustadh:* ${ustadhName}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `🌐 _HifzPro — Intelligent Hifz Management_`;

  return msg;
}

// ──────────────────────────────────────────────────────────
// 2. ABSENCE ALERT
// ──────────────────────────────────────────────────────────
export function absenceAlertMessage(data: {
  studentName:   string;
  instituteName: string;
  date:          Date;
  reason?:       string;
  lang?:         "ur" | "en";
}): string {
  const { studentName, instituteName, date, reason, lang = "ur" } = data;

  if (lang === "ur") {
    let msg = `🔔 *HifzPro — غیر حاضری اطلاع*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *طالب علم:* ${studentName}\n`;
    msg += `📅 *تاریخ:* ${formatDate(date, "ur")}\n`;
    msg += `🏫 *ادارہ:* ${instituteName}\n\n`;
    msg += `❌ *آپ کا بچہ آج حلقے میں غیر حاضر تھا۔*\n`;
    if (reason) msg += `📋 *وجہ:* ${reason}\n`;
    msg += `\nاگر یہ غلط ہے تو براہ کرم ادارے سے رابطہ کریں۔\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_HifzPro — www.hifzpro.com_`;
    return msg;
  }

  let msg = `🔔 *HifzPro — Absence Alert*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Student:* ${studentName}\n`;
  msg += `📅 *Date:* ${formatDate(date, "en")}\n\n`;
  msg += `❌ *Your child was absent from the Halqa today.*\n`;
  if (reason) msg += `📋 *Reason:* ${reason}\n`;
  msg += `\nIf this is incorrect, please contact the institute.\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_HifzPro — www.hifzpro.com_`;
  return msg;
}

// ──────────────────────────────────────────────────────────
// 3. MANZIL HEALTH ALERT
// ──────────────────────────────────────────────────────────
export function manzilHealthAlertMessage(data: {
  studentName:   string;
  instituteName: string;
  score:         number;
  lang?:         "ur" | "en";
}): string {
  const { studentName, instituteName, score, lang = "ur" } = data;

  if (lang === "ur") {
    let msg = `⚠️ *HifzPro — منزل صحت انتباہ*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *طالب علم:* ${studentName}\n`;
    msg += `🏫 *ادارہ:* ${instituteName}\n\n`;
    msg += `📊 *منزل صحت:* ${Math.round(score)}% 🔴\n\n`;
    msg += `⚠️ آپ کے بچے کی منزل کی صحت کم ہو رہی ہے۔\n`;
    msg += `گھر میں اضافی مراجعہ کی ضرورت ہے۔\n\n`;
    msg += `کریں:\n`;
    msg += `✅ روزانہ کم از کم ایک جز کی مراجعہ\n`;
    msg += `✅ سونے سے پہلے مشق کریں\n`;
    msg += `✅ استاذ سے رہنمائی لیں\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_HifzPro — www.hifzpro.com_`;
    return msg;
  }

  let msg = `⚠️ *HifzPro — Manzil Health Alert*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Student:* ${studentName}\n\n`;
  msg += `📊 *Manzil Health:* ${Math.round(score)}% 🔴\n\n`;
  msg += `Your child's Manzil retention is declining.\n`;
  msg += `Extra home revision is recommended.\n\n`;
  msg += `✅ Revise at least 1 Juz daily at home\n`;
  msg += `✅ Practice before sleeping\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_HifzPro — www.hifzpro.com_`;
  return msg;
}

// ──────────────────────────────────────────────────────────
// 4. TEST RESULT
// ──────────────────────────────────────────────────────────
export function testResultMessage(data: {
  studentName:   string;
  instituteName: string;
  testType:      string;
  result:        string;
  score?:        number;
  juzFrom?:      number;
  juzTo?:        number;
  date:          Date;
  notes?:        string;
  lang?:         "ur" | "en";
}): string {
  const { studentName, instituteName, testType, result, score, juzFrom, juzTo, date, notes, lang = "ur" } = data;
  const passed = result === "PASS";

  if (lang === "ur") {
    let msg = `📝 *HifzPro — امتحان نتیجہ*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *طالب علم:* ${studentName}\n`;
    msg += `📅 *تاریخ:* ${formatDate(date, "ur")}\n\n`;
    msg += `📋 *امتحان:* ${testType.replace(/_/g," ")}\n`;
    if (juzFrom) msg += `📖 *حصہ:* جز ${juzFrom}${juzTo&&juzTo!==juzFrom?`–${juzTo}`:""}\n`;
    msg += `\n${passed ? "✅ *نتیجہ: پاس* 🎉" : "❌ *نتیجہ: فیل*"}\n`;
    if (score !== undefined) msg += `📊 *اسکور:* ${score}%\n`;
    if (notes) msg += `\n📝 *نوٹس:* ${notes}\n`;
    if (passed) msg += `\nماشاءاللہ! بہت اچھی کارکردگی۔\n`;
    else msg += `\nمزید محنت اور مراجعہ کی ضرورت ہے۔\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_HifzPro — www.hifzpro.com_`;
    return msg;
  }

  let msg = `📝 *HifzPro — Test Result*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Student:* ${studentName}\n`;
  msg += `📅 *Date:* ${formatDate(date, "en")}\n\n`;
  msg += `📋 *Test:* ${testType.replace(/_/g," ")}\n`;
  if (juzFrom) msg += `📖 *Scope:* Juz ${juzFrom}${juzTo&&juzTo!==juzFrom?`–${juzTo}`:""}\n`;
  msg += `\n${passed ? "✅ *Result: PASS* 🎉" : "❌ *Result: FAIL*"}\n`;
  if (score !== undefined) msg += `📊 *Score:* ${score}%\n`;
  if (notes) msg += `\n📝 *Notes:* ${notes}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_HifzPro — www.hifzpro.com_`;
  return msg;
}

// ──────────────────────────────────────────────────────────
// 5. WEEKLY PROGRESS REPORT
// ──────────────────────────────────────────────────────────
export function weeklyReportMessage(data: {
  studentName:       string;
  instituteName:     string;
  weekStart:         Date;
  weekEnd:           Date;
  totalLessons:      number;
  daysPresent:       number;
  totalDays:         number;
  juzCompleted:      number;
  currentJuz:        number;
  manzilHealth:      number;
  lang?:             "ur" | "en";
}): string {
  const { studentName, instituteName, weekStart, weekEnd, totalLessons, daysPresent, totalDays, juzCompleted, currentJuz, manzilHealth, lang = "ur" } = data;
  const attendancePct = Math.round((daysPresent / totalDays) * 100);

  if (lang === "ur") {
    let msg = `📊 *HifzPro — ہفتہ وار رپورٹ*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *طالب علم:* ${studentName}\n`;
    msg += `📅 *ہفتہ:* ${weekStart.toLocaleDateString("ur-PK",{month:"short",day:"numeric"})} — ${weekEnd.toLocaleDateString("ur-PK",{month:"short",day:"numeric"})}\n\n`;
    msg += `📖 *اس ہفتے کے اسباق:* ${totalLessons}\n`;
    msg += `📅 *حاضری:* ${daysPresent}/${totalDays} (${attendancePct}%)\n`;
    msg += `📍 *موجودہ جز:* جز ${currentJuz}\n`;
    msg += `💚 *منزل صحت:* ${Math.round(manzilHealth)}% ${manzilHealth>=75?"💚":manzilHealth>=55?"🟡":"🔴"}\n\n`;
    if (manzilHealth < 60) msg += `⚠️ منزل پر توجہ دینے کی ضرورت ہے\n\n`;
    if (attendancePct < 70) msg += `⚠️ حاضری بہتر کریں\n\n`;
    msg += `جزاکم اللہ خیراً 🤲\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_HifzPro — www.hifzpro.com_`;
    return msg;
  }

  let msg = `📊 *HifzPro — Weekly Report*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Student:* ${studentName}\n`;
  msg += `📅 *Week:* ${weekStart.toLocaleDateString("en-PK",{month:"short",day:"numeric"})} – ${weekEnd.toLocaleDateString("en-PK",{month:"short",day:"numeric"})}\n\n`;
  msg += `📖 *Lessons This Week:* ${totalLessons}\n`;
  msg += `📅 *Attendance:* ${daysPresent}/${totalDays} (${attendancePct}%)\n`;
  msg += `📍 *Current Juz:* ${currentJuz}\n`;
  msg += `💚 *Manzil Health:* ${Math.round(manzilHealth)}%\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_HifzPro — www.hifzpro.com_`;
  return msg;
}

// ──────────────────────────────────────────────────────────
// 6. WELCOME MESSAGE (on enrolment)
// ──────────────────────────────────────────────────────────
export function welcomeMessage(data: {
  guardianName:   string;
  studentName:    string;
  instituteName:  string;
  enrollmentNumber: string;
  program:        string;
  ustadhName?:    string;
  lang?:          "ur" | "en";
}): string {
  const { guardianName, studentName, instituteName, enrollmentNumber, program, ustadhName, lang = "ur" } = data;

  const programLabels: Record<string,{ur:string;en:string}> = {
    HIFZ:    {ur:"حفظ القرآن", en:"Hifz ul Quran"},
    NAZRA:   {ur:"ناظرہ",      en:"Nazrah"},
    TAJWEED: {ur:"تجوید",      en:"Tajweed"},
    GIRDAAN: {ur:"گردان",      en:"Girdaan"},
  };
  const prog = programLabels[program] || programLabels.HIFZ;

  if (lang === "ur") {
    let msg = `🌿 *HifzPro میں خوش آمدید*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `السلام علیکم ${guardianName}!\n\n`;
    msg += `آپ کے بچے *${studentName}* کا ${instituteName} میں داخلہ ہو گیا ہے۔\n\n`;
    msg += `📋 *تفصیلات:*\n`;
    msg += `🎫 رول نمبر: ${enrollmentNumber}\n`;
    msg += `📖 پروگرام: ${prog.ur}\n`;
    if (ustadhName) msg += `👨‍🏫 استاذ: ${ustadhName}\n`;
    msg += `\n💬 آپ کو ہر روز اسباق کی رپورٹ اس نمبر پر ملے گی۔\n`;
    msg += `\nاللہ کریم آپ کے بچے کو قرآن کا حافظ بنائے۔ آمین 🤲\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_HifzPro — www.hifzpro.com_`;
    return msg;
  }

  let msg = `🌿 *Welcome to HifzPro*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `As-salamu Alaykum ${guardianName}!\n\n`;
  msg += `*${studentName}* has been enrolled at ${instituteName}.\n\n`;
  msg += `🎫 Enrollment #: ${enrollmentNumber}\n`;
  msg += `📖 Program: ${prog.en}\n`;
  if (ustadhName) msg += `👨‍🏫 Ustadh: ${ustadhName}\n`;
  msg += `\n💬 You will receive daily lesson reports on this number.\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_HifzPro — www.hifzpro.com_`;
  return msg;
}

// ──────────────────────────────────────────────────────────
// 7. TEST MESSAGE
// ──────────────────────────────────────────────────────────
export function testConnectionMessage(instituteName: string): string {
  return `✅ *HifzPro WhatsApp Connected!*\n\n🏫 ${instituteName}\n\nYour WhatsApp integration is working correctly. Daily Sabaq reports, attendance alerts, and test results will be sent to parents automatically.\n\n_HifzPro — www.hifzpro.com_`;
}
