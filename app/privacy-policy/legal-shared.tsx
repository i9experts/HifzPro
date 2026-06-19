"use client";
import React from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";

interface TocItem {
  label: string;
  id: string;
}

interface LegalPageProps {
  breadcrumb: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  effectiveLine: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function LegalPage({
  breadcrumb,
  eyebrow,
  title,
  subtitle,
  effectiveLine,
  toc,
  children,
}: LegalPageProps) {
  return (
    <>
      <MarketingNav />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/">Home</Link>
          <span className="mx-2">/</span>
          <span>{breadcrumb}</span>
        </nav>
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-purple-600 mb-2">{eyebrow}</p>
          <h1 className="text-3xl font-bold mb-3">{title}</h1>
          <p className="text-gray-600 mb-2">{subtitle}</p>
          <p className="text-sm text-gray-500">{effectiveLine}</p>
        </header>
        <div className="flex gap-10">
          <aside className="hidden md:block w-56 shrink-0">
            <nav className="sticky top-8">
              <ul className="space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-gray-600 hover:text-purple-600">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <article className="prose prose-gray max-w-none flex-1">{children}</article>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
