import { redirect } from "next/navigation";
import { getSessionEstablishment } from "@/lib/auth";
import GarcomFlow from "./GarcomFlow";

export const dynamic = "force-dynamic";

export default async function GarcomPage() {
  const session = await getSessionEstablishment();
  if (!session) redirect("/onboarding");

  return <GarcomFlow establishmentName={session.establishmentName} />;
}
