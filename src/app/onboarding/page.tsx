"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar estabelecimento");
      router.push("/painel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell" style={{ maxWidth: 460, paddingTop: 60 }}>
      <div className="scene-head">
        <span className="eyebrow">Quase lá</span>
        <h2>Como se chama seu estabelecimento?</h2>
        <p>Isso cria o espaço isolado onde ficam seus clientes, pontos e campanhas.</p>
      </div>

      <form onSubmit={submit} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="field-label">Nome do estabelecimento</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Restaurante Sabor & Arte"
            required
          />
        </div>
        {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Criando..." : "Criar estabelecimento"}
        </button>
      </form>
    </div>
  );
}
