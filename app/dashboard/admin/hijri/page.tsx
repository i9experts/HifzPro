"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";
import {
  toHijri, formatHijri, buildHijriCalendarGrid, HIJRI_MONTHS,
  prevHijriMonth, nextHijriMonth, getAllEventsForYear,
  getCurrentHijri, CalendarDay, IslamicEvent,
} from "@/lib/hijri";

const EVENT_TYPE_COLORS = {
  holiday:     { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  significant: { bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" },
  ramadan:     { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  hajj:        { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function EventBadge({ event }: { event: IslamicEvent }) {
  const c = EVENT_TYPE_COLORS[event.type];
  return (
    <div style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 4, padding: "1px 5px", fontSize: 9, fontFamily: fonts.heading, fontWeight: 700, lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
      {event.name}
    </div>
  );
}

function DayCell({ day, onClick, selected }: { day: CalendarDay; onClick: () => void; selected: boolean }) {
  const isFriday = day.date.getDay() === 5;
  const hasEvents = day.events.length > 0;

  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 72,
        padding: "6px 7px",
        borderRadius: 10,
        border: selected ? `2px solid ${colors.primary}` : day.isToday ? `2px solid ${colors.gold}` : "1px solid transparent",
        background: day.isToday ? "#fffbeb" : selected ? colors.green50 : day.isCurrentMonth ? "white" : colors.n50,
        cursor: "pointer",
        opacity: day.isCurrentMonth ? 1 : 0.4,
        transition: "all 0.15s",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}>

      {/* Hijri day number — primary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontFamily: fonts.heading, fontSize: 15, fontWeight: day.isToday ? 800 : 600,
          color: day.isToday ? colors.gold : isFriday ? colors.primary : colors.n800,
          lineHeight: 1,
        }}>
          {day.hijri.day}
        </span>
        {day.isToday && (
          <span style={{ fontFamily: fonts.mono, fontSize: 7, background: colors.gold, color: "white", borderRadius: 3, padding: "1px 4px" }}>TODAY</span>
        )}
      </div>

      {/* Gregorian day number — secondary */}
      <span style={{
        fontFamily: fonts.mono, fontSize: 9,
        color: isFriday ? colors.primary : colors.n400,
        opacity: 0.75,
      }}>
        {day.date.getDate()}
      </span>

      {/* Events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {day.events.slice(0, 2).map((e, i) => <EventBadge key={i} event={e} />)}
        {day.events.length > 2 && (
          <div style={{ fontSize: 9, color: colors.n400, fontFamily: fonts.body }}>+{day.events.length - 2} more</div>
        )}
      </div>
    </div>
  );
}

export default function HijriCalendarPage() {
  const today      = new Date();
  const todayHijri = toHijri(today);

  const [currentYear,  setCurrentYear]  = useState(todayHijri.year);
  const [currentMonth, setCurrentMonth] = useState(todayHijri.month);
  const [grid,         setGrid]         = useState<CalendarDay[]>([]);
  const [selectedDay,  setSelectedDay]  = useState<CalendarDay | null>(null);
  const [view,         setView]         = useState<"calendar" | "events">("calendar");
  const [loading,      setLoading]      = useState(true);
  const [lessonMap,    setLessonMap]    = useState<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    try {
      const g = buildHijriCalendarGrid(currentYear, currentMonth);
      setGrid(g);
      // Set selected to today if in current month
      const todayCell = g.find(d => d.isToday);
      if (todayCell) setSelectedDay(todayCell);
    } catch (e) {
      console.error("Calendar build error:", e);
    }
    setLoading(false);
  }, [currentYear, currentMonth]);

  // Fetch lesson counts for this month's date range
  useEffect(() => {
    if (grid.length === 0) return;
    const currentDays = grid.filter(d => d.isCurrentMonth);
    if (currentDays.length === 0) return;

    const from = currentDays[0].date.toISOString().split("T")[0];
    const to   = currentDays[currentDays.length - 1].date.toISOString().split("T")[0];

    fetch(`/api/admin/lessons/calendar?from=${from}&to=${to}`)
      .then(r => r.json())
      .then(d => { if (d.success) setLessonMap(d.data || {}); })
      .catch(() => {});
  }, [grid]);

  const handlePrev = () => {
    const { year, month } = prevHijriMonth(currentYear, currentMonth);
    setCurrentYear(year); setCurrentMonth(month);
  };
  const handleNext = () => {
    const { year, month } = nextHijriMonth(currentYear, currentMonth);
    setCurrentYear(year); setCurrentMonth(month);
  };
  const handleToday = () => {
    setCurrentYear(todayHijri.year);
    setCurrentMonth(todayHijri.month);
  };

  const monthInfo  = HIJRI_MONTHS[currentMonth - 1];
  const yearEvents = getAllEventsForYear(currentYear).filter(e => {
    const h = toHijri(e.date);
    return h.month === currentMonth;
  });

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>Hijri Calendar</div>
            <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 11, color: colors.gold, opacity: 0.8 }}>التقويم الهجري</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Today's Hijri date */}
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 12px", textAlign: "right" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 11, color: colors.white }}>{formatHijri(today, "en")}</div>
            <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 10, color: colors.gold, direction: "rtl" }}>{formatHijri(today, "ar")}</div>
          </div>
          <button onClick={handleSignOut} style={{ padding: "5px 12px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 6 }}>ISLAMIC CALENDAR</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: 0 }}>Hijri Calendar</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, marginTop: 4 }}>
            Today is <strong>{formatHijri(today, "en")}</strong> · <span style={{ fontFamily: "Scheherazade New,serif", fontSize: 14 }}>{formatHijri(today, "ar")}</span>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

          {/* ── Left: Calendar ── */}
          <div>
            {/* Month navigation */}
            <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: `1px solid ${colors.n200}`, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                <button onClick={handlePrev} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 16, color: colors.n600 }}>‹</button>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 26, color: colors.primary, lineHeight: 1 }}>{monthInfo?.ar}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.n800, marginTop: 2 }}>
                    {monthInfo?.en} {currentYear} AH
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n400 }}>{monthInfo?.ur}</div>
                  {monthInfo?.significance && (
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.primary, marginTop: 4, background: colors.green50, padding: "3px 12px", borderRadius: 20, display: "inline-block" }}>
                      ✦ {monthInfo.significance}
                    </div>
                  )}
                </div>

                <button onClick={handleNext} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${colors.n200}`, background: colors.n50, cursor: "pointer", fontSize: 16, color: colors.n600 }}>›</button>
              </div>

              {/* Today button */}
              {(currentYear !== todayHijri.year || currentMonth !== todayHijri.month) && (
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <button onClick={handleToday} style={{ padding: "5px 16px", borderRadius: 20, border: `1px solid ${colors.n200}`, background: colors.n50, color: colors.n600, fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>
                    ↩ Back to Today
                  </button>
                </div>
              )}
            </div>

            {/* Calendar grid */}
            <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
              {/* Weekday headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: colors.deep }}>
                {WEEKDAYS.map((d, i) => (
                  <div key={i} style={{
                    padding: "10px 4px", textAlign: "center",
                    fontFamily: fonts.heading, fontSize: 10, fontWeight: 700,
                    color: i === 5 ? colors.gold : "rgba(255,255,255,0.6)",
                  }}>
                    <div>{d}</div>
                    <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 9, opacity: 0.5, marginTop: 1 }}>{WEEKDAYS_AR[i]}</div>
                  </div>
                ))}
              </div>

              {/* Day cells */}
              {loading ? (
                <div style={{ padding: 48, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>Building calendar...</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, padding: 8 }}>
                  {grid.map((day, i) => {
                    const dateKey = day.date.toISOString().split("T")[0];
                    const lessonCount = lessonMap[dateKey] || 0;
                    return (
                      <div key={i} style={{ position: "relative" }}>
                        <DayCell
                          day={day}
                          onClick={() => setSelectedDay(day)}
                          selected={selectedDay?.date.toDateString() === day.date.toDateString()}
                        />
                        {/* Lesson dot */}
                        {lessonCount > 0 && day.isCurrentMonth && (
                          <div style={{ position: "absolute", bottom: 8, right: 7, width: 6, height: 6, borderRadius: "50%", background: colors.primary }} title={`${lessonCount} lessons`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { label: "Today",       bg: "#fffbeb",          border: colors.gold },
                { label: "Holiday",     bg: "#fef3c7",          border: "#fde68a" },
                { label: "Ramadan",     bg: colors.green50,     border: colors.green200 },
                { label: "Significant", bg: "#f5f3ff",          border: "#ddd6fe" },
                { label: "Hajj",        bg: "#fff7ed",          border: "#fed7aa" },
                { label: "Lessons ●",  bg: "transparent",      border: "transparent", dot: true },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {l.dot
                    ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.primary }} />
                    : <div style={{ width: 14, height: 14, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                  }
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{l.label}</span>
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.primary, padding: "2px 8px", background: colors.green50, borderRadius: 5 }}>Hijri</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n400, padding: "2px 8px", background: colors.n100, borderRadius: 5 }}>Gregorian</div>
              </div>
            </div>
          </div>

          {/* ── Right: Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Selected day detail */}
            {selectedDay && (
              <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
                <div style={{ background: `linear-gradient(135deg,${colors.deep},${colors.primary}88)`, padding: "16px 18px" }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 4 }}>SELECTED DATE</div>
                  <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 24, color: "white", direction: "rtl", textAlign: "left" }}>
                    {selectedDay.hijri.day} {selectedDay.hijri.monthNameAr} {selectedDay.hijri.year}
                  </div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                    {selectedDay.hijri.day} {selectedDay.hijri.monthNameEn} {selectedDay.hijri.year} AH
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gold, marginTop: 4 }}>
                    {selectedDay.date.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div style={{ padding: "14px 18px" }}>
                  {selectedDay.events.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {selectedDay.events.map((e, i) => {
                        const c = EVENT_TYPE_COLORS[e.type];
                        return (
                          <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: c.color }}>{e.name}</div>
                            <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 14, color: c.color, opacity: 0.8, direction: "rtl", textAlign: "left", marginTop: 2 }}>{e.nameAr}</div>
                            <div style={{ fontFamily: fonts.body, fontSize: 10, color: c.color, opacity: 0.7, marginTop: 2 }}>{e.nameUr}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400, textAlign: "center", padding: "8px 0" }}>No Islamic events this day</div>
                  )}
                </div>
              </div>
            )}

            {/* This month's events */}
            <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.n100}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>
                  {monthInfo?.en} Events
                </div>
                <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 14, color: colors.gold }}>{monthInfo?.ar}</div>
              </div>
              <div style={{ padding: "8px 12px" }}>
                {grid.filter(d => d.isCurrentMonth && d.events.length > 0).length === 0 ? (
                  <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400, padding: "12px 4px", textAlign: "center" }}>No Islamic events this month</div>
                ) : (
                  grid
                    .filter(d => d.isCurrentMonth && d.events.length > 0)
                    .map((d, i) => (
                      <div key={i} style={{ padding: "8px 4px", borderBottom: `1px solid ${colors.n100}`, cursor: "pointer" }} onClick={() => setSelectedDay(d)}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.primary }}>{d.hijri.day}</span>
                          </div>
                          <div>
                            <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>
                              {d.date.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short" })}
                            </div>
                            {d.events.map((e, j) => (
                              <div key={j} style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: EVENT_TYPE_COLORS[e.type].color }}>
                                {e.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Upcoming events across year */}
            <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.n100}` }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>Upcoming in {currentYear} AH</div>
              </div>
              <div style={{ padding: "8px 12px", maxHeight: 260, overflow: "auto" }}>
                {getAllEventsForYear(currentYear)
                  .filter(e => {
                    const h = toHijri(e.date);
                    return h.month > currentMonth || (h.month === currentMonth && h.month >= currentMonth);
                  })
                  .slice(0, 8)
                  .map((e, i) => {
                    const c = EVENT_TYPE_COLORS[e.event.type];
                    const h = toHijri(e.date);
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "8px 4px", borderBottom: `1px solid ${colors.n100}`, alignItems: "center" }}>
                        <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: c.color }}>{h.day}</div>
                          <div style={{ fontFamily: fonts.body, fontSize: 8, color: colors.n400 }}>{HIJRI_MONTHS[h.month-1]?.en.split(" ")[0]}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{e.event.name}</div>
                          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400 }}>
                            {e.date.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <span style={{ background: c.bg, color: c.color, padding: "2px 6px", borderRadius: 4, fontSize: 8, fontFamily: fonts.mono, fontWeight: 700, textTransform: "uppercase" }}>
                          {e.event.type}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick conversion */}
            <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, padding: "14px 16px" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800, marginBottom: 10 }}>Quick Conversion</div>
              <QuickConvert />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Quick Gregorian → Hijri converter widget ──
function QuickConvert() {
  const [input,  setInput]  = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState<ReturnType<typeof toHijri> | null>(null);

  useEffect(() => {
    if (!input) { setResult(null); return; }
    try {
      const d = new Date(input);
      if (isNaN(d.getTime())) { setResult(null); return; }
      setResult(toHijri(d));
    } catch { setResult(null); }
  }, [input]);

  return (
    <div>
      <input
        type="date"
        value={input}
        onChange={e => setInput(e.target.value)}
        style={{ width: "100%", padding: "9px 10px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, outline: "none", color: colors.n800, boxSizing: "border-box" }}
      />
      {result && (
        <div style={{ marginTop: 10, background: colors.green50, borderRadius: 10, padding: "10px 12px", border: `1px solid ${colors.green200}` }}>
          <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 20, color: colors.primary, direction: "rtl", textAlign: "left", marginBottom: 4 }}>
            {result.day} {result.monthNameAr} {result.year}
          </div>
          <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n700 }}>
            {result.day} {result.monthNameEn} {result.year} AH
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 2 }}>
            {result.day} {result.monthNameUr} {result.year}ھ
          </div>
          {result.significance && (
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.primary, marginTop: 6, opacity: 0.8 }}>✦ {result.significance}</div>
          )}
        </div>
      )}
    </div>
  );
}
