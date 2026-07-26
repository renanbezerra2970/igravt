import NavTabs from "@/components/NavTabs";
import { getOrCreateDemoEstablishment } from "@/lib/demo-establishment";
import { getDashboardSummary } from "@/lib/dashboard";

// Consulta o Supabase a cada acesso — não faz sentido pré-renderizar em
// build time um painel cujo dado principal é "o que aconteceu agora".
export const dynamic = "force-dynamic";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PainelPage() {
  const establishment = await getOrCreateDemoEstablishment();
  const summary = await getDashboardSummary(establishment.id);

  const trendMax = Math.max(...summary.npsTrend.map((p) => p.score ?? 0), 1);
  const trendMin = Math.min(...summary.npsTrend.map((p) => p.score ?? 0), 0);
  const range = Math.max(trendMax - trendMin, 1);
  const linePoints = summary.npsTrend
    .map((p, i) => {
      const y = p.score === null ? 45 : 80 - ((p.score - trendMin) / range) * 70;
      return `${i * 64},${y.toFixed(1)}`;
    })
    .join(" ");

  const conversionPct = summary.rouletteConversionPct ?? 0;

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Painel do estabelecimento · {establishment.name}</span>
        <h2>O que o dono do restaurante vê</h2>
        <p>
          Dados reais do Supabase — ainda vão aparecer baixos ou zerados até
          vocês gerarem uso de verdade pelas telas de Garçom e Cliente.
        </p>
      </div>

      <div className="dash">
        <div className="kpis">
          <div className="kpi"><div className="l">Clientes ativos</div><div className="v">{summary.activeCustomers}</div><div className="d">últimos 90 dias</div></div>
          <div className="kpi"><div className="l">Clientes inativos</div><div className="v">{summary.inactiveCustomers}</div><div className="d">sem visita recente</div></div>
          <div className="kpi"><div className="l">NPS</div><div className="v">{summary.npsScore ?? "—"}</div><div className="d">{summary.npsResponseCount} respostas</div></div>
          <div className="kpi"><div className="l">Giros na roleta</div><div className="v">{summary.rouletteSpinCount}</div><div className="d">total registrado</div></div>
        </div>

        <div className="dash-grid">
          <div className="panel">
            <h3>Evolução do NPS</h3>
            <div className="panel-sub">Últimos 6 meses</div>
            <div className="spark-wrap">
              <svg
                viewBox="0 0 320 90"
                width="100%"
                height="90"
                preserveAspectRatio="none"
                role="img"
                aria-label="Gráfico de evolução do NPS nos últimos 6 meses"
              >
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="var(--data)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="axis">
                {summary.npsTrend.map((p) => <span key={p.label}>{p.label}</span>)}
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Conversão da roleta</h3>
            <div className="panel-sub">Giros por resposta de NPS</div>
            <div className="donut-wrap">
              <div className="donut-center">
                <div
                  className="donut"
                  style={{ background: `conic-gradient(var(--data) 0% ${conversionPct}%, var(--border) ${conversionPct}% 100%)` }}
                />
                <span><span className="pct">{conversionPct.toLocaleString("pt-BR")}%</span></span>
              </div>
              <div className="donut-legend">
                <div className="legend-row"><span className="swatch" style={{ background: "var(--data)" }} />Giros — {summary.rouletteSpinCount}</div>
                <div className="legend-row"><span className="swatch" style={{ background: "var(--border)" }} />Respostas NPS — {summary.npsResponseCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="panel">
            <h3>Ranking de maiores consumidores</h3>
            <div className="panel-sub">Total gasto registrado</div>
            {summary.ranking.length === 0 ? (
              <p style={{ color: "var(--text-soft)", fontSize: ".85rem", marginTop: 10 }}>
                Ainda sem lançamentos — use a tela do Garçom pra gerar o primeiro.
              </p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead><tr><th></th><th>Cliente</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
                  <tbody>
                    {summary.ranking.map((r, i) => (
                      <tr key={r.name + i}>
                        <td><span className={`rank${i === 1 ? " n2" : i === 2 ? " n3" : ""}`}>{i + 1}</span></td>
                        <td>{r.name}</td>
                        <td className="num">{formatCents(r.totalCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="panel">
            <h3>Aniversariantes do mês</h3>
            <div className="panel-sub">{new Date().toLocaleDateString("pt-BR", { month: "long" })}</div>
            {summary.birthdaysThisMonth.length === 0 ? (
              <p style={{ color: "var(--text-soft)", fontSize: ".85rem", marginTop: 10 }}>
                Nenhum aniversariante cadastrado neste mês ainda.
              </p>
            ) : (
              <div className="bday-list">
                {summary.birthdaysThisMonth.map((b, i) => (
                  <div className="bday-row" key={b.name + i}>
                    🎂 {b.name} <span className="d">{String(b.day).padStart(2, "0")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer>
        Dados reais do Supabase (estabelecimento &quot;{establishment.name}&quot;) — WhatsApp de verdade ainda não está conectado.
      </footer>
    </div>
  );
}
