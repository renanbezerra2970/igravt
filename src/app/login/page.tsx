"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/painel";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push(next);
      router.refresh();
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
          <Image src="/logo.png" alt="iGravt" width={56} height={56} priority />
          <div className="mark">iGravt</div>
          <div className="tag">Entrar no painel do seu estabelecimento</div>
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

          <div className="btn-row" style={{ marginTop: 4 }}>
            <button type="submit" className="btn btn-gold" disabled={loading} style={{ flex: 1 }}>
              {loading ? "Aguarde..." : "Entrar"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", fontSize: ".8rem", color: "rgba(255,255,255,.65)", marginTop: 16 }}>
          Login liberado pela equipe iGravt. Ainda não recebeu o seu?
          Fale com quem te apresentou a plataforma.
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
