"use client";

import { useState } from "react";
import NavTabs from "@/components/NavTabs";

const TOTAL_STEPS = 4;

export default function GarcomPage() {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const reset = () => setStep(1);

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head">
        <span className="eyebrow">Fluxo do garçom</span>
        <h2>Lançar consumo em 3 toques</h2>
        <p>
          Simulação da tela usada no salão: login do atendente, identificação
          do cliente pelo WhatsApp e lançamento do valor da conta.
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
                  <button className="btn btn-primary" onClick={next}>Entrar</button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="field-label">Buscar cliente por WhatsApp</div>
                <input type="tel" value="(11) 99999-9999" readOnly />
                <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={next}>
                  Buscar cliente
                </button>
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="client-card">
                    <div className="avatar">JS</div>
                    <div className="client-meta">
                      <b>João Silva</b>
                      Cliente cadastrado
                    </div>
                  </div>
                  <div className="kv-grid">
                    <div className="kv"><div className="n">186</div><div className="l">Pontos</div></div>
                    <div className="kv"><div className="n">8</div><div className="l">Visitas</div></div>
                    <div className="kv"><div className="n">12/05</div><div className="l">Última visita</div></div>
                    <div className="kv"><div className="n">20/08</div><div className="l">Aniversário</div></div>
                  </div>
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={next}>Continuar</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field-label">Valor total gasto (R$)</div>
                <input type="text" value="86,50" readOnly style={{ fontSize: "1.3rem" }} />
                <div className="card" style={{ marginTop: 14 }}>
                  <div style={{ fontSize: ".78rem", color: "var(--text-soft)" }}>Pontos a conceder</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)" }}>
                    86 pontos
                  </div>
                  <div style={{ fontSize: ".74rem", color: "var(--text-soft)", marginTop: 2 }}>
                    R$ 1,00 gasto = 1 ponto
                  </div>
                </div>
                <div className="field-label" style={{ marginTop: 12 }}>Observação (opcional)</div>
                <input type="text" value="Aniversário" readOnly />
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={prev}>Voltar</button>
                  <button className="btn btn-primary" onClick={next}>Confirmar lançamento</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--good)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: "1.05rem" }}>Lançamento confirmado</h3>
                  <p style={{ color: "var(--text-soft)", fontSize: ".85rem", maxWidth: 220 }}>
                    João Silva foi notificado via WhatsApp e ganhou 86 pontos.
                  </p>
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" onClick={reset}>Novo cliente</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="sidenote">
          <span className="eyebrow">O que este passo mostra</span>
          <dl>
            <div><dt>Login</dt><dd>Acesso do atendente à plataforma no salão, sem fricção.</dd></div>
            <div><dt>Identificação</dt><dd>Busca do histórico do cliente pelo número de WhatsApp — sem cartão físico.</dd></div>
            <div><dt>Lançamento</dt><dd>Pontuação calculada automaticamente sobre o valor da conta.</dd></div>
            <div><dt>Notificação</dt><dd>Cliente recebe os pontos direto no WhatsApp, sem app para instalar.</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
