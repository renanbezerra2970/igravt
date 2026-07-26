"use client";

import { useMemo, useState } from "react";
import NavTabs from "@/components/NavTabs";

const TOTAL_STEPS = 6;

const PRIZES = [
  { label: "10% OFF", color: "#C9A227" },
  { label: "Sobremesa Grátis", color: "#6D4FD6" },
  { label: "5% OFF", color: "#E2C568" },
  { label: "Bebida Grátis", color: "#1C2745" },
  { label: "15% OFF", color: "#C9A227" },
  { label: "Brinde Surpresa", color: "#6D4FD6" },
];
const SEG = 360 / PRIZES.length;

type Customer = {
  id: string;
  name: string | null;
  whatsapp_number: string;
  points_balance: number;
  visits_count: number;
};

export default function ClientePage() {
  const [step, setStep] = useState(0);
  const [whatsapp, setWhatsapp] = useState("(11) 99999-9999");
  const [name, setName] = useState("João Silva");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(9);
  const [comment, setComment] = useState("");
  const [npsResponseId, setNpsResponseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStep(0);
    setCustomer(null);
    setNpsResponseId(null);
    setSpun(false);
    setSpinning(false);
    setRotation(0);
    setPrizeIndex(null);
    setCouponCode(null);
    setError(null);
  };

  const openMessage = async () => {
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
      if (!res.ok) throw new Error(data.error ?? "Falha ao abrir");
      if (data.customer) {
        setCustomer(data.customer);
        setName(data.customer.name ?? name);
      }
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const confirmCadastro = async () => {
    setLoading(true);
    setError(null);
    try {
      if (customer) {
        setStep(2);
        return;
      }
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp: whatsapp.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao cadastrar");
      setCustomer(data.customer);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const submitNps = async () => {
    if (!customer || npsScore === null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/nps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, score: npsScore, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao enviar pesquisa");
      setNpsResponseId(data.npsResponseId);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  const gradient = useMemo(
    () => PRIZES.map((p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(","),
    []
  );

  const spin = async () => {
    if (spun || !customer) return;
    setSpinning(true);
    setError(null);
    try {
      const res = await fetch("/api/roulette/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, npsResponseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao girar a roleta");

      const idx = PRIZES.findIndex((p) => p.label === data.prizeLabel);
      const targetIndex = idx === -1 ? 0 : idx;
      const targetCenter = targetIndex * SEG + SEG / 2;
      setRotation(360 * 5 + (360 - targetCenter));
      setPrizeIndex(targetIndex);
      setCouponCode(data.couponCode);

      setTimeout(() => {
        setSpun(true);
        setSpinning(false);
      }, 3300);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setSpinning(false);
    }
  };

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head">
        <span className="eyebrow">Jornada do cliente</span>
        <h2>Do WhatsApp ao prêmio</h2>
        <p>
          Ligado ao Supabase de verdade — use o mesmo número lançado na tela
          do Garçom pra ver os pontos reais aparecerem aqui.
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
              <>
                <div className="chat-from">iGravt · via WhatsApp (simulado)</div>
                <div className="chat-bubble">
                  Oi! 🎉 Você ganhou pontos no Restaurante Sabor &amp; Arte.
                  Toque aqui pra ver seu saldo e responder uma perguntinha
                  rápida.
                </div>
                <div className="field-label" style={{ marginTop: 14 }}>Simular abertura pelo número</div>
                <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={openMessage} disabled={loading}>
                    {loading ? "Abrindo..." : "Abrir"}
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="phone-header">iGravt · Cadastro</div>
                <div className="field-label">Cadastro rápido</div>
                <p style={{ fontSize: ".8rem", color: "var(--text-soft)", margin: "2px 0 8px" }}>
                  {customer ? "Já reconhecemos você." : "Só confirme seu nome — o WhatsApp já identificamos."}
                </p>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} readOnly={!!customer} />
                <input type="tel" value={whatsapp} readOnly style={{ marginTop: 8 }} />
                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={confirmCadastro} disabled={loading}>
                    {loading ? "Confirmando..." : "Continuar"}
                  </button>
                </div>
              </>
            )}

            {step === 2 && customer && (
              <>
                <div className="phone-header">iGravt · Meus Pontos</div>
                <div className="points-earned">
                  <div className="big">{customer.points_balance}</div>
                  <div className="sub">pontos disponíveis</div>
                </div>
                <div className="kv-grid">
                  <div className="kv"><div className="n">R$ {(customer.points_balance / 100).toFixed(2).replace(".", ",")}</div><div className="l">em benefícios</div></div>
                  <div className="kv"><div className="n">{customer.visits_count}</div><div className="l">visitas</div></div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Avaliar minha visita</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="phone-header"><span className="back">←</span> Pesquisa</div>
                <div className="field-label">
                  De 0 a 10, o quanto você indicaria o Sabor &amp; Arte a um amigo?
                </div>
                <div className="nps-row" style={{ marginTop: 10 }}>
                  {Array.from({ length: 11 }).map((_, v) => (
                    <button
                      key={v}
                      type="button"
                      className={`nps-btn${npsScore === v ? " selected" : ""}`}
                      onClick={() => setNpsScore(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="nps-scale-labels">
                  <span>pouco provável</span>
                  <span>muito provável</span>
                </div>
                <div className="field-label" style={{ marginTop: 14 }}>O que podemos melhorar? (opcional)</div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escreva aqui..." />
                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={submitNps} disabled={loading || npsScore === null}>
                    {loading ? "Enviando..." : "Enviar e girar a roleta"}
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
              <div className="phone-header"><span className="back">←</span> Roleta de Prêmios</div>
              <div className="wheel-wrap">
                <div className="wheel-pin" />
                <div
                  className="wheel"
                  style={{
                    background: `conic-gradient(${gradient})`,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {PRIZES.map((p, i) => (
                    <div
                      key={p.label}
                      className="wheel-label"
                      style={{ transform: `rotate(${i * SEG + SEG / 2}deg)` }}
                    >
                      {p.label}
                    </div>
                  ))}
                  <div className="wheel-hub">🎁</div>
                </div>

                {error && <p style={{ color: "var(--bad)", fontSize: ".8rem" }}>{error}</p>}

                {!spun && (
                  <button className="btn btn-primary" onClick={spin} disabled={spinning}>
                    {spinning ? "Girando..." : "Girar a roleta"}
                  </button>
                )}
                {spun && prizeIndex !== null && (
                  <>
                    <div className="spin-result">
                      <div className="eyebrow">você ganhou</div>
                      <div className="prize">{PRIZES[prizeIndex].label}</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setStep(5)}>Ver meu cupom</button>
                  </>
                )}
              </div>
              </>
            )}

            {step === 5 && prizeIndex !== null && (
              <>
                <div className="phone-header">iGravt · Seu Prêmio</div>
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: "1.6rem" }}>🎉</div>
                  <h3 style={{ fontSize: "1.05rem", marginTop: 6 }}>Parabéns, {name.split(" ")[0]}!</h3>
                </div>
                <div className="coupon">
                  <div style={{ fontSize: ".72rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Seu cupom
                  </div>
                  <div className="code">{couponCode}</div>
                  <div style={{ fontSize: ".78rem", color: "var(--text-soft)", marginTop: 4 }}>
                    {PRIZES[prizeIndex].label}
                  </div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={restart}>Recomeçar</button>
                  <button className="btn btn-primary">Salvar cupom</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sidenote">
          <span className="eyebrow">O que este passo mostra</span>
          <dl>
            <div><dt>Fricção mínima</dt><dd>Cadastro exige só a confirmação — o número já veio do WhatsApp.</dd></div>
            <div><dt>NPS na hora</dt><dd>Gravado de verdade no Supabase, aparece no Painel.</dd></div>
            <div><dt>Recompensa garantida</dt><dd>Prêmio sorteado no servidor entre as recompensas cadastradas — sempre há um prêmio.</dd></div>
            <div><dt>Cupom real</dt><dd>Código gerado e salvo no banco a cada giro.</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
