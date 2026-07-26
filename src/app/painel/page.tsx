import NavTabs from "@/components/NavTabs";

const RANKING = [
  { name: "João Silva", total: "R$ 2.450,00" },
  { name: "Maria Oliveira", total: "R$ 1.980,00" },
  { name: "Carlos Lima", total: "R$ 1.750,00" },
  { name: "Juliana Costa", total: "R$ 1.420,00" },
  { name: "Bruno Santos", total: "R$ 1.230,00" },
];

const BIRTHDAYS = [
  { name: "Fernanda Pereira", date: "23/07" },
  { name: "Rafael Martins", date: "25/07" },
  { name: "Lucas Almeida", date: "28/07" },
  { name: "Camila Souza", date: "30/07" },
];

const NPS_POINTS = [50, 42, 34, 44, 26, 18]; // y-coordinates, lower = higher NPS
const NPS_LABELS = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"];

export default function PainelPage() {
  const linePoints = NPS_POINTS.map((y, i) => `${i * 64},${y}`).join(" ");

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Painel do estabelecimento</span>
        <h2>O que o dono do restaurante vê</h2>
        <p>
          Visão gerencial com os indicadores gerados pela plataforma:
          satisfação, recorrência, conversão da roleta e clientes que
          merecem atenção.
        </p>
      </div>

      <div className="dash">
        <div className="kpis">
          <div className="kpi"><div className="l">Clientes ativos</div><div className="v">1.284</div><div className="d up">↑ 12,5%</div></div>
          <div className="kpi"><div className="l">Clientes inativos</div><div className="v">312</div><div className="d down">↓ 8,3%</div></div>
          <div className="kpi"><div className="l">NPS</div><div className="v">72</div><div className="d up">↑ 6 pts</div></div>
          <div className="kpi"><div className="l">Avaliações</div><div className="v">2.185</div><div className="d up">↑ 18,7%</div></div>
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
                aria-label="Gráfico de evolução do NPS de dezembro a maio, subindo de 64 para 72 pontos"
              >
                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="320" cy="18" r="4" fill="var(--accent)" />
              </svg>
              <div className="axis">
                {NPS_LABELS.map((l) => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Conversão da roleta</h3>
            <div className="panel-sub">1.000 participações no período</div>
            <div className="donut-wrap">
              <div className="donut-center">
                <div
                  className="donut"
                  style={{ background: "conic-gradient(var(--accent) 0% 18.6%, var(--border) 18.6% 100%)" }}
                />
                <span><span className="pct">18,6%</span></span>
              </div>
              <div className="donut-legend">
                <div className="legend-row"><span className="swatch" style={{ background: "var(--accent)" }} />Convertidas — 186</div>
                <div className="legend-row"><span className="swatch" style={{ background: "var(--border)" }} />Não convertidas — 814</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid">
          <div className="panel">
            <h3>Ranking de maiores consumidores</h3>
            <div className="panel-sub">Total gasto no período</div>
            <div className="table-scroll">
              <table>
                <thead><tr><th></th><th>Cliente</th><th style={{ textAlign: "right" }}>Total</th></tr></thead>
                <tbody>
                  {RANKING.map((r, i) => (
                    <tr key={r.name}>
                      <td><span className="rank">{i + 1}</span></td>
                      <td>{r.name}</td>
                      <td className="num">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <h3>Aniversariantes do mês</h3>
            <div className="panel-sub">Julho</div>
            <div className="bday-list">
              {BIRTHDAYS.map((b) => (
                <div className="bday-row" key={b.name}>
                  🎂 {b.name} <span className="d">{b.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer>
        Protótipo estático com dados fictícios, para validar fluxo e
        usabilidade antes de conectar ao Supabase.
      </footer>
    </div>
  );
}
