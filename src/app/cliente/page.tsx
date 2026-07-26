"use client";

import { useMemo, useState } from "react";
import NavTabs from "@/components/NavTabs";

const TOTAL_STEPS = 6;

const PRIZES = [
  { label: "10% OFF", color: "#C9723A" },
  { label: "Sobremesa Grátis", color: "#4A2E44" },
  { label: "5% OFF", color: "#7E9F35" },
  { label: "Bebida Grátis", color: "#9C551F" },
  { label: "15% OFF", color: "#C9723A" },
  { label: "Brinde Surpresa", color: "#4A2E44" },
];
const SEG = 360 / PRIZES.length;
const TARGET_INDEX = 4; // "15% OFF" — matches the coupon shown on the prize screen

export default function ClientePage() {
  const [step, setStep] = useState(0);
  const [nps, setNps] = useState<number | null>(9);
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);
  const [rotation, setRotation] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const restart = () => {
    setStep(0);
    setSpun(false);
    setSpinning(false);
    setRotation(0);
  };

  const gradient = useMemo(
    () => PRIZES.map((p, i) => `${p.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(","),
    []
  );

  const spin = () => {
    if (spun) return;
    setSpinning(true);
    const targetCenter = TARGET_INDEX * SEG + SEG / 2;
    setRotation(360 * 5 + (360 - targetCenter));
    setTimeout(() => {
      setSpun(true);
      setSpinning(false);
    }, 3300);
  };

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head">
        <span className="eyebrow">Jornada do cliente</span>
        <h2>Do WhatsApp ao prêmio</h2>
        <p>
          O que o consumidor vê depois que a conta é fechada: cadastro
          rápido, pesquisa de satisfação e recompensa garantida na roleta.
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
                <div className="chat-from">iGravt · via WhatsApp</div>
                <div className="chat-bubble">
                  Oi, João! 🎉 Você ganhou <b>86 pontos</b> no Restaurante
                  Sabor &amp; Arte. Toque aqui pra ver seu saldo e responder
                  uma perguntinha rápida.
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={next}>Abrir</button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="field-label">Cadastro rápido</div>
                <p style={{ fontSize: ".8rem", color: "var(--text-soft)", margin: "2px 0 8px" }}>
                  Só confirme seu nome — o WhatsApp já identificamos.
                </p>
                <input type="text" value="João Silva" readOnly />
                <input type="tel" value="(11) 99999-9999" readOnly style={{ marginTop: 8 }} />
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={next}>Continuar</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="points-earned">
                  <div className="big">186</div>
                  <div className="sub">pontos disponíveis</div>
                </div>
                <div className="kv-grid">
                  <div className="kv"><div className="n">R$ 1,86</div><div className="l">em benefícios</div></div>
                  <div className="kv"><div className="n">8</div><div className="l">visitas</div></div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={next}>Avaliar minha visita</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="field-label">
                  De 0 a 10, o quanto você indicaria o Sabor &amp; Arte a um amigo?
                </div>
                <div className="nps-row" style={{ marginTop: 10 }}>
                  {Array.from({ length: 11 }).map((_, v) => (
                    <button
                      key={v}
                      type="button"
                      className={`nps-btn${nps === v ? " selected" : ""}`}
                      onClick={() => setNps(v)}
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
                <textarea readOnly defaultValue="Atendimento ótimo, só demorou um pouco a sobremesa." />
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={next}>Enviar e girar a roleta</button>
                </div>
              </>
            )}

            {step === 4 && (
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

                {!spun && (
                  <button className="btn btn-primary" onClick={spin} disabled={spinning}>
                    {spinning ? "Girando..." : "Girar a roleta"}
                  </button>
                )}
                {spun && (
                  <>
                    <div className="spin-result">
                      <div className="eyebrow">você ganhou</div>
                      <div className="prize">{PRIZES[TARGET_INDEX].label}</div>
                    </div>
                    <button className="btn btn-primary" onClick={next}>Ver meu cupom</button>
                  </>
                )}
              </div>
            )}

            {step === 5 && (
              <>
                <div style={{ textAlign: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: "1.6rem" }}>🎉</div>
                  <h3 style={{ fontSize: "1.05rem", marginTop: 6 }}>Parabéns, João!</h3>
                </div>
                <div className="coupon">
                  <div style={{ fontSize: ".72rem", color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Seu cupom
                  </div>
                  <div className="code">IGRAVT15OFF</div>
                  <div style={{ fontSize: ".78rem", color: "var(--text-soft)", marginTop: 4 }}>
                    15% OFF na próxima visita
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
            <div><dt>NPS na hora</dt><dd>Pesquisa curta, respondida ainda dentro do calor da experiência.</dd></div>
            <div><dt>Recompensa garantida</dt><dd>A roleta não tem opção de &quot;perder&quot; — sempre há um prêmio configurado pelo estabelecimento.</dd></div>
            <div><dt>Retenção</dt><dd>Cupom salvo incentiva o retorno dentro da validade.</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
