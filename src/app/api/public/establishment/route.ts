import { NextResponse } from "next/server";
import { getEstablishmentBySlug } from "@/lib/establishment";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug é obrigatório" }, { status: 400 });
  }

  const establishment = await getEstablishmentBySlug(slug);
  if (!establishment) {
    return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ establishment });
}
