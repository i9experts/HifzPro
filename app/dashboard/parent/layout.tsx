"use client";
import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

// ── Child context so all pages share student data ──
interface Child { id: string; name: string; nameArabic?: string; photo?: string; program: string; enrollmentNumber?: string; }
interface ParentContextType {
  student:     any;
  children:    Child[];
  activeChild: string;
  setActiveChild: (id: string) => void;
  loading:     boolean;
  refresh:     () => void;
}
const ParentContext = createContext<ParentContextType>({
  student: null, children: [], activeChild: "", setActiveChild: () => {}, loading: true, refresh: () => {},
});
export const useParent = () => useContext(ParentContext);

const NAV_ITEMS = [
  { href: "/dashboard/parent",            icon: "🏠", iconActive: "🏠", label: "Home",       labelUr: "ہوم" },
  { href: "/dashboard/parent/diary",      icon: "📖", iconActive: "📖", label: "Diary",      labelUr: "ڈائری" },
  { href: "/dashboard/parent/attendance", icon: "📅", iconActive: "📅", label: "Attendance", labelUr: "حاضری" },
  { href: "/dashboard/parent/progress",   icon: "📊", iconActive: "📊", label: "Progress",   labelUr: "ترقی" },
  { href: "/dashboard/parent/contact",    icon: "📞", iconActive: "📞", label: "Contact",    labelUr: "رابطہ" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const [student,      setStudent]      = useState<any>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChild,  setActiveChild]  = useState("");
  const [loading,      setLoading]      = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const fetchData = (childId?: string) => {
    const url = childId ? `/api/parent/dashboard?studentId=${childId}` : "/api/parent/dashboard";
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudent(d.data.student);
          setChildrenList(d.data.children || []);
          if (d.data.student && !activeChild) setActiveChild(d.data.student.id);
        } else {
          window.location.href = "/signin";
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleChildSwitch = (id: string) => {
    setActiveChild(id);
    setShowSwitcher(false);
    setLoading(true);
    fetchData(id);
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <ParentContext.Provider value={{ student, children: childrenList, activeChild, setActiveChild: handleChildSwitch, loading, refresh: () => fetchData(activeChild) }}>
      <div style={{ minHeight: "100vh", background: "#f8fffe", maxWidth: 480, margin: "0 auto", position: "relative" }}>

        {/* Top bar */}
        <div style={{ background: colors.deep, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <HifzMark size={30} primary="#10B981" gold={colors.gold} />
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.gold, opacity: 0.8, letterSpacing: 1 }}>PARENT PORTAL</div>
            </div>
          </div>

          {/* Child switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {childrenList.length > 1 && (
              <button
                onClick={() => setShowSwitcher(!showSwitcher)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 6, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "white" }}>{student?.name?.charAt(0) || "?"}</span>
                </div>
                <span style={{ fontFamily: fonts.heading, fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{student?.name?.split(" ")[0] || "Child"}</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>▼</span>
              </button>
            )}
            <button onClick={handleSignOut} style={{ padding: "5px 10px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 10, cursor: "pointer", fontFamily: fonts.heading }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Child switcher dropdown */}
        {showSwitcher && (
          <div style={{ position: "fixed", top: 56, right: 16, background: colors.white, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: `1px solid ${colors.n200}`, zIndex: 100, minWidth: 200, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: colors.n50, borderBottom: `1px solid ${colors.n100}`, fontFamily: fonts.mono, fontSize: 9, color: colors.n500, letterSpacing: 1 }}>SWITCH CHILD</div>
            {childrenList.map(child => (
              <button key={child.id} onClick={() => handleChildSwitch(child.id)}
                style={{ width: "100%", padding: "12px 14px", border: "none", background: activeChild === child.id ? colors.green50 : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${colors.n100}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: activeChild === child.id ? colors.primary : colors.n200, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {child.photo
                    ? <img src={child.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    : <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: activeChild === child.id ? "white" : colors.n500 }}>{child.name.charAt(0)}</span>
                  }
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: activeChild === child.id ? colors.primary : colors.n800 }}>{child.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400 }}>{child.program}</div>
                </div>
                {activeChild === child.id && <span style={{ marginLeft: "auto", color: colors.primary, fontSize: 14 }}>✓</span>}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <div style={{ paddingBottom: 72 }}>
          {children}
        </div>

        {/* Bottom navigation */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: colors.white, borderTop: `1px solid ${colors.n200}`, display: "flex", zIndex: 50, boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/parent" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 4px 6px", textDecoration: "none", transition: "all 0.15s" }}>
                <div style={{ width: 40, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, background: isActive ? colors.green50 : "transparent", transition: "all 0.2s" }}>
                  <span style={{ fontSize: isActive ? 20 : 18 }}>{item.icon}</span>
                </div>
                <span style={{ fontFamily: fonts.heading, fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? colors.primary : colors.n400, marginTop: 1 }}>{item.label}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 9, color: isActive ? colors.primary : colors.n300, opacity: 0.8 }}>{item.labelUr}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </ParentContext.Provider>
  );
}
