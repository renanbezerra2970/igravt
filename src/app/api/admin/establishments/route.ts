import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { createEstablishment } from "@/lib/establishment";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await isPlatformAdmin(user.id))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const establishmentName: string | undefined = body?.establishmentName?.trim();
  const ownerEmail: string | undefined = body?.ownerEmail?.trim();
  const ownerPassword: string | undefined = body?.ownerPassword;

  if (!establishmentName || !ownerEmail || !ownerPassword || ownerPassword.length < 6) {
    return NextResponse.json(
      { error: "Nome do estabelecimento, e-mail e senha (mín. 6 caracteres) são obrigatórios" },
      { status: 400 }
    );
  }

  const { data: created, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
  });

  if (userError || !created.user) {
    const message = userError?.message.includes("already been registered")
      ? "Já existe uma conta com esse e-mail. Use outro e-mail para o dono deste estabelecimento."
      : userError?.message ?? "Falha ao criar a conta do dono";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const establishment = await createEstablishment(establishmentName);

  const { error: staffError } = await supabaseAdmin.from("staff_members").insert({
    establishment_id: establishment.id,
    user_id: created.user.id,
    role: "owner",
  });

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  return NextResponse.json({
    establishment,
    owner: { email: ownerEmail, password: ownerPassword },
  });
}
