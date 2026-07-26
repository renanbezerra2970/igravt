"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ROUTES = [
  { href: "/garcom", label: "Garçom" },
  { href: "/cliente", label: "Cliente" },
  { href: "/painel", label: "Painel" },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <span className="brand-mark">iGravt</span>
        <span className="brand-sub">protótipo · Supabase real</span>
      </Link>
      <div role="tablist" aria-label="Telas do protótipo" className="tabs">
        {ROUTES.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className={`tab${pathname === r.href ? " active" : ""}`}
            aria-selected={pathname === r.href}
          >
            {r.label}
          </Link>
        ))}
      </div>
      <span className="proto-flag">sem WhatsApp real ainda</span>
    </div>
  );
}
