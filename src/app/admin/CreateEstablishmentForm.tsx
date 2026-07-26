"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

export default function CreateEstablishmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(randomPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; email: string; password: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/establishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ establishmentName: name.trim(), ownerEmail: email.trim(), ownerPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar");
      setResult({ slug: data.establishment.slug, email: data.owner.email, password: data.owner.password });
      setName("");
      setEmail("");
      setPassword(randomPassword());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="card" style={{ marginTop: 10 }}>
        <div className="eyebrow" style={{ color: "var(--good)" }}>Criado com sucesso</div>
        <p style={{ fontSize: ".85rem", margin: "8px 0" }}>
          Repasse essas credenciais ao dono do restaurante (WhatsApp, e-mail — fora do app):
        </p>
        <div className="kv-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="kv"><div className="n" style={{ fontSize: ".95rem" }}>{result.email}</div><div className="l">e-mail de login</div></div>
          <div className="kv"><div className="n" style={{ fontSize: ".95rem" }}>{result.password}</div><div className="l">senha temporária</div></div>
          <div className="kv"><div className="n" style={{ fontSize: ".85rem" }}>/cliente?e={result.slug}</div><div className="l">link público do cliente</div></div>
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 12, width: "100%" }} onClick={() => setResult(null)}>
          Criar outro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
      <div>
        <div className="field-label">Nome do estabelecimento</div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurante Sabor & Arte" required />
      </div>
      <div>
        <div className="field-label">E-mail do dono</div>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dono@restaurante.com" required />
      </div>
      <div>
        <div className="field-label">Senha temporária</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <button type="button" className="btn btn-ghost" onClick={() => setPassword(randomPassword())}>Gerar</button>
        </div>
      </div>
      {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Criando..." : "Criar estabelecimento + login do dono"}
      </button>
    </form>
  );
}
