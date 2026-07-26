"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/painel";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push("/onboarding");
          router.refresh();
        } else {
          setInfo("Conta criada. Verifique seu e-mail para confirmar antes de entrar.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell" style={{ maxWidth: 420, paddingTop: 60 }}>
      <div className="login-card" style={{ margin: 0, borderRadius: 18, minHeight: "auto" }}>
        <div className="logo-block">
          <div className="mark">iGravt</div>
          <div className="tag">{mode === "login" ? "Entrar no painel do seu estabelecimento" : "Criar conta do estabelecimento"}</div>
        </div>

        <form onSubmit={submit} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div className="field-label">E-mail</div>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@estabelecimento.com" required />
          </div>
          <div>
            <div className="field-label">Senha</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
          </div>

          {error && <p style={{ color: "#e28a7a", fontSize: ".8rem" }}>{error}</p>}
          {info && <p style={{ color: "rgba(255,255,255,.85)", fontSize: ".8rem" }}>{info}</p>}

          <div className="btn-row" style={{ marginTop: 4 }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", fontSize: ".8rem", color: "rgba(255,255,255,.65)", marginTop: 16 }}>
          {mode === "login" ? (
            <>Ainda não tem conta? <button className="btn-linklike" onClick={() => setMode("signup")}>Criar estabelecimento</button></>
          ) : (
            <>Já tem conta? <button className="btn-linklike" onClick={() => setMode("login")}>Entrar</button></>
          )}
        </p>
      </div>

      <p style={{ textAlign: "center", marginTop: 18 }}>
        <Link href="/" style={{ fontSize: ".82rem", color: "var(--text-soft)" }}>← Voltar</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
