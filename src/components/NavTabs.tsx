"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const ROUTES = [
  { href: "/garcom", label: "Garçom" },
  { href: "/cliente", label: "Cliente" },
  { href: "/painel", label: "Painel" },
];

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="topbar">
      <Link href="/" className="brand" style={{ textDecoration: "none" }}>
        <span className="brand-mark">iGravt</span>
        <span className="brand-sub">MVP em validação</span>
      </Link>
      <div role="tablist" aria-label="Telas do app" className="tabs">
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
      {email === undefined ? null : email ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="proto-flag">{email}</span>
          <button className="btn-linklike" onClick={signOut}>Sair</button>
        </div>
      ) : (
        <Link href="/login" className="btn-linklike">Entrar</Link>
      )}
    </div>
  );
}
