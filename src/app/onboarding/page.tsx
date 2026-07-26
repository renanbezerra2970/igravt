import NavTabs from "@/components/NavTabs";

export default function OnboardingPage() {
  return (
    <div className="shell">
      <NavTabs />
      <div className="scene-head" style={{ maxWidth: 480 }}>
        <span className="eyebrow">Quase lá</span>
        <h2>Sua conta ainda não está vinculada a um estabelecimento</h2>
        <p>
          A criação de estabelecimentos é feita pela equipe iGravt. Se você
          já conversou com a gente, avise que sua conta foi criada e a
          liberação sai na hora — se ainda não conversou, é só chamar.
        </p>
      </div>
    </div>
  );
}
