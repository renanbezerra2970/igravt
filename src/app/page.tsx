import Link from "next/link";
import NavTabs from "@/components/NavTabs";

export default function Home() {
  return (
    <div className="shell">
      <NavTabs />

      <div className="hero">
        <span className="eyebrow">Protótipo do projeto</span>
        <h1 style={{ fontSize: "2rem", marginTop: 6 }}>
          As três telas que sustentam o iGravt
        </h1>
        <p>
          Um fluxo para o garçom lançar o consumo, a jornada que o cliente
          recebe pelo WhatsApp e o painel que o estabelecimento usa para
          acompanhar recorrência e satisfação. Já gravando dados reais no
          Supabase — só o envio de WhatsApp de verdade ainda é simulado.
        </p>
      </div>

      <div className="route-grid">
        <Link href="/garcom" className="route-card">
          <div className="k">🧾</div>
          <h3>Garçom</h3>
          <p>Identificar cliente pelo WhatsApp e lançar o valor da conta.</p>
        </Link>
        <Link href="/cliente" className="route-card">
          <div className="k">🎡</div>
          <h3>Cliente</h3>
          <p>Cadastro rápido, pesquisa NPS e roleta de recompensas.</p>
        </Link>
        <Link href="/painel" className="route-card">
          <div className="k">📊</div>
          <h3>Painel</h3>
          <p>KPIs, NPS, ranking de consumidores e aniversariantes.</p>
        </Link>
      </div>

      <footer>
        Código no GitHub, deploy contínuo pela Vercel, dados reais no
        Supabase. Falta conectar um provedor de WhatsApp Business API para
        o envio de mensagens deixar de ser simulado.
      </footer>
    </div>
  );
}
