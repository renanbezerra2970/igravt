import { requirePlatformAdmin } from "@/lib/platform-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import NavTabs from "@/components/NavTabs";
import CreateEstablishmentForm from "./CreateEstablishmentForm";

export const dynamic = "force-dynamic";

async function listEstablishments() {
  const { data: establishments, error } = await supabaseAdmin
    .from("establishments")
    .select("id, name, slug, plan, created_at, staff_members(user_id, role)")
    .order("created_at", { ascending: false });

  if (error || !establishments) return [];

  return Promise.all(
    establishments.map(async (e) => {
      const owner = e.staff_members?.find((s) => s.role === "owner");
      let ownerEmail: string | null = null;
      if (owner) {
        const { data } = await supabaseAdmin.auth.admin.getUserById(owner.user_id);
        ownerEmail = data.user?.email ?? null;
      }
      return {
        id: e.id,
        name: e.name,
        slug: e.slug,
        plan: e.plan,
        createdAt: e.created_at,
        ownerEmail,
        staffCount: e.staff_members?.length ?? 0,
      };
    })
  );
}

export default async function AdminPage() {
  await requirePlatformAdmin();
  const establishments = await listEstablishments();

  return (
    <div className="shell">
      <NavTabs />

      <div className="scene-head" style={{ maxWidth: 640 }}>
        <span className="eyebrow">Painel GRAVT · uso interno</span>
        <h2>Estabelecimentos</h2>
        <p>
          Só a equipe GRAVT cria estabelecimentos por aqui. Depois de criar,
          repasse o e-mail e a senha ao dono do restaurante — ele entra em{" "}
          <code>/login</code> com essas credenciais.
        </p>
      </div>

      <div className="dash-grid" style={{ alignItems: "start" }}>
        <div className="panel">
          <h3>Novo estabelecimento</h3>
          <div className="panel-sub">Cria a conta do dono junto</div>
          <CreateEstablishmentForm />
        </div>

        <div className="panel">
          <h3>Existentes</h3>
          <div className="panel-sub">{establishments.length} no total</div>
          {establishments.length === 0 ? (
            <p style={{ color: "var(--text-soft)", fontSize: ".85rem", marginTop: 10 }}>
              Nenhum estabelecimento ainda.
            </p>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Dono</th>
                    <th>Plano</th>
                    <th>Link do cliente</th>
                  </tr>
                </thead>
                <tbody>
                  {establishments.map((e) => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td style={{ fontSize: ".8rem", color: "var(--text-soft)" }}>{e.ownerEmail ?? "—"}</td>
                      <td style={{ fontSize: ".8rem" }}>{e.plan}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: ".76rem" }}>/cliente?e={e.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer>
        Acesso restrito à equipe GRAVT (tabela platform_admins) — donos de
        restaurante não veem esta tela.
      </footer>
    </div>
  );
}
