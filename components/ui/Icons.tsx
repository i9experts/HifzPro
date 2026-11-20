// components/ui/Icons.tsx
// Minimal stroke-style line icons (currentColor) — used in place of emoji
// in professional/portal-style chrome (sidebars, nav, stat labels).
import React from "react";

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function base(children: React.ReactNode, { size = 18, strokeWidth = 1.8, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}
      style={{ display: "block", flexShrink: 0 }}>
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return base(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1h3.5v-6h4v6H17.5a1 1 0 0 0 1-1v-9" /></>, props);
}
export function UserIcon(props: IconProps) {
  return base(<><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" /></>, props);
}
export function GraduationCapIcon(props: IconProps) {
  return base(<><path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" /><path d="M6 11.6v4c0 1.4 2.7 2.9 6 2.9s6-1.5 6-2.9v-4" /><path d="M20.5 10v5.5" /></>, props);
}
export function ChatIcon(props: IconProps) {
  return base(<path d="M4 5h16v11H8l-4 4V5Z" />, props);
}
export function SignOutIcon(props: IconProps) {
  return base(<><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" /><path d="M14 16l5-4-5-4" /><path d="M19 12H9" /></>, props);
}
export function ArrowLeftIcon(props: IconProps) {
  return base(<><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></>, props);
}
export function MenuIcon(props: IconProps) {
  return base(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>, props);
}
