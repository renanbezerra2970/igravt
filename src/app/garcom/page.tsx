"use client";

import { useState } from "react";
import NavTabs from "@/components/NavTabs";

const TOTAL_STEPS = 4;

type Customer = {
  id: string;
  name: string | null;
  whatsapp_number: string;
  points_balance: number;
  visits_count: number;
  last_visit_at: string | null;
};

export default function GarcomPage() {
  const [step, setStep] = useState(0);
  const [whatsapp, setWhatsapp] = useState("(11) 99999-9999");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("86,50");
  const [note, setNote] = useState("");
  const [customer, setCustomer] = useState<Customer | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ pointsAwarded: number; name: string } | null>(null);

  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const resetAll = () => {
    setStep(1);
    setWhatsapp("");
    setName("");
    setAmount("");
    setNote("");
    setCustomer(undefined);
    setConfirmation(null);
    setError(null);
  };

  const searchCustomer = async () => {
    if (!whatsapp.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customers/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: whatsapp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao buscar cliente");
      setCustomer(data.customer);
      setName(data.customer?.name ?? "");
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const parsedAmount = Number(amount.replace(",", "."));
  const previewPoints = Number.isFinite(parsedAmount) ? Math.floor(parsedAmount) : 0;

  const confirmConsumption = async () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError("Informe um valor válido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/consumption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: whatsapp.trim(),
          name: name.trim() || undefined,
          amount: parsedAmount,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao lançar consumo");
      setConfirmation({ pointsAwarded: data.pointsAwarded, name: name.trim() || "Cliente" });
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head">
        <span className="eyebrow">Fluxo do garçom</span>
        <h2>Lançar consumo em 3 toques</h2>
        <p>
          Ligado ao Supabase de verdade: buscar/criar cliente pelo WhatsApp e
          gravar o lançamento cria dados reais que aparecem no Painel.
        </p>
        <div className="stepline">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <i key={i} className={i <= step ? "done" : ""} />
          ))}
        </div>
      </div>

      <div className="stage">
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            {step === 0 && (
              <div className="login-card">
                <div className="logo-block">
                  <div className="mark">iGravt</div>
                  <div className="tag">Relacionamento que traz clientes de volta</div>
                </div>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div className="field-label">Usuário</div>
                    <input type="text" value="sabor.arte" readOnly />
                  </div>
                  <div>
                    <div className="field-label">Senha</div>
                    <input type="text" value="••••••••" readOnly />
                  </div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => setStep(1)}>Entrar</button>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="phone-header"><span className="back">←</span> Identificar Cliente</div>
                <div className="field-label">Buscar cliente por WhatsApp</div>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={searchCustomer}
                  disabled={loading || !whatsapp.trim()}
                >
                  {loading ? "Buscando..." : "Buscar cliente"}
                </button>
                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}

                {customer !== undefined && (
                  <div className="card" style={{ marginTop: 14 }}>
                    <div className="client-card">
                      <div className="avatar">{(customer?.name ?? "??").slice(0, 2).toUpperCase()}</div>
                      <div className="client-meta">
                        <b>{customer?.name ?? "Cliente novo"}</b>
                        {customer ? "Cliente cadastrado" : "Sem cadastro ainda — informe o nome no próximo passo"}
                      </div>
                    </div>
                    {customer && (
                      <div className="kv-grid">
                        <div className="kv"><div className="n">{customer.points_balance}</div><div className="l">Pontos</div></div>
                        <div className="kv"><div className="n">{customer.visits_count}</div><div className="l">Visitas</div></div>
                        <div className="kv">
                          <div className="n">
                            {customer.last_visit_at ? new Date(customer.last_visit_at).toLocaleDateString("pt-BR") : "—"}
                          </div>
                          <div className="l">Última visita</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" disabled={customer === undefined} onClick={() => setStep(2)}>
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="phone-header"><span className="back">←</span> Lançar Consumo</div>
                {!customer && (
                  <>
                    <div className="field-label">Nome do cliente</div>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" style={{ marginBottom: 10 }} />
                  </>
                )}
                <div className="field-label">Valor total gasto (R$)</div>
                <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.3rem" }} />
                <div className="card" style={{ marginTop: 14 }}>
                  <div style={{ fontSize: ".78rem", color: "var(--text-soft)" }}>Pontos a conceder</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)" }}>
                    {previewPoints} pontos
                  </div>
                  <div style={{ fontSize: ".74rem", color: "var(--text-soft)", marginTop: 2 }}>
                    R$ 1,00 gasto = 1 ponto
                  </div>
                </div>
                <div className="field-label" style={{ marginTop: 12 }}>Observação (opcional)</div>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex: aniversário" />
                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={confirmConsumption} disabled={loading}>
                    {loading ? "Confirmando..." : "Confirmar lançamento"}
                  </button>
                </div>
              </>
            )}

            {step === 3 && confirmation && (
              <>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--good)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: "1.05rem" }}>Lançamento confirmado</h3>
                  <p style={{ color: "var(--text-soft)", fontSize: ".85rem", maxWidth: 220 }}>
                    {confirmation.name} ganhou {confirmation.pointsAwarded} pontos. (Notificação via WhatsApp ainda simulada — falta conectar o provedor.)
                  </p>
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={resetAll}>Novo cliente</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sidenote">
          <span className="eyebrow">O que este passo mostra</span>
          <dl>
            <div><dt>Login</dt><dd>Ainda simulado — autenticação real de equipe é o próximo passo.</dd></div>
            <div><dt>Identificação</dt><dd>Busca real no Supabase pelo número de WhatsApp.</dd></div>
            <div><dt>Lançamento</dt><dd>Grava consumption_records e atualiza o saldo de pontos de verdade.</dd></div>
            <div><dt>Notificação</dt><dd>Ainda simulada — depende de conectar um provedor de WhatsApp Business API.</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
