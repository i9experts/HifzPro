"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HifzMark from "@/components/ui/HifzMark";
import { HomeIcon, UserIcon, GraduationCapIcon, ChatIcon, SignOutIcon } from "@/components/ui/Icons";
import { colors } from "@/lib/tokens";

const NAV = [
  { href: "/dashboard/teacher", icon: HomeIcon, label: "Dashboard", exact: true },
  { href: "/dashboard/teacher/profile", icon: UserIcon, label: "My Profile" },
  { href: "/dashboard/teacher/students", icon: GraduationCapIcon, label: "My Students" },
  { href: "/dashboard/teacher/inquiries", icon: ChatIcon, label: "Inquiries" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export default function TeacherPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <div className="hp-teacher-shell" style={{ minHeight: "100vh", background: colors.n50 }}>
      <aside className="hp-teacher-sidebar" style={{ background: colors.primaryDark }}>
        <div className="hp-teacher-brand">
          <HifzMark size={26} />
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>HifzPro</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10.5 }}>Teacher Portal</div>
          </div>
        </div>

        <nav className="hp-teacher-nav">
          {NAV.map(item => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="hp-teacher-navlink" style={{
                color: active ? "white" : "rgba(255,255,255,0.65)",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: active ? `3px solid ${colors.gold}` : "3px solid transparent",
              }}>
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={handleSignOut} className="hp-teacher-signout" style={{
          color: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <SignOutIcon size={16} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="hp-teacher-main">{children}</main>

      {/* NOTE: do not interpolate JS values (e.g. ${fonts.heading}) inside this
          style jsx block — in this app, dynamic interpolation inside a
          `layout.tsx` file's <style jsx> reproducibly hangs the webpack/SWC
          compile (confirmed by bisection). Static CSS only; font-family is
          hardcoded to match lib/tokens.ts's `fonts.heading`. */}
      <style jsx>{`
        .hp-teacher-shell { display: flex; font-family: 'DM Sans', sans-serif; }
        .hp-teacher-sidebar {
          width: 216px; flex-shrink: 0; min-height: 100vh;
          display: flex; flex-direction: column; position: sticky; top: 0;
        }
        .hp-teacher-brand { display: flex; align-items: center; gap: 10px; padding: 18px 18px 16px; }
        .hp-teacher-nav { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; flex: 1; }
        .hp-teacher-navlink {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; text-decoration: none;
        }
        .hp-teacher-signout {
          display: flex; align-items: center; gap: 10px; padding: 14px 18px; background: transparent; border: none;
          font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; text-align: left;
        }
        .hp-teacher-main { flex: 1; min-width: 0; }

        @media (max-width: 760px) {
          .hp-teacher-shell { flex-direction: column; }
          .hp-teacher-sidebar { width: 100%; min-height: auto; position: static; flex-direction: column; }
          .hp-teacher-brand { padding: 12px 14px; justify-content: space-between; }
          .hp-teacher-nav {
            flex-direction: row; flex-wrap: nowrap; gap: 4px; padding: 6px 8px;
            overflow-x: auto; -webkit-overflow-scrolling: touch;
          }
          .hp-teacher-navlink { flex-shrink: 0; white-space: nowrap; border-left: none !important; }
          .hp-teacher-signout { padding: 10px 14px; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
