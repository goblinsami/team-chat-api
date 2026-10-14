import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { workspaceRequest, type Workspace } from "@/lib/workspaces";
import { WorkspaceChannels } from "./workspace-channels";
import { InviteMember } from "./invite-member";

type Props = { params: Promise<{ workspaceId: string }> };

async function WorkspaceContent({ params }: Props) {
  const { workspaceId } = await params;
  const id = Number(workspaceId);
  if (!/^\d+$/.test(workspaceId) || !Number.isSafeInteger(id) || id < 1) notFound();
  const result = await workspaceRequest("GET");
  if (result.status === 401) redirect("/auth");
  if (!result.data) {
    return <main><p role="alert">No se pudo cargar el workspace.</p><Link href="/dashboard">Volver al dashboard</Link></main>;
  }
  const workspace = (result.data as Workspace[]).find((item) => item.id === id);
  if (!workspace) notFound();
  const channels = workspace.channels ?? [];
  return (
    <main>
      <h1>{workspace.name}</h1>
      <InviteMember workspaceId={id} />
      <WorkspaceChannels key={id} workspaceId={id} channels={channels} />
      <p><Link href="/dashboard">Volver al dashboard</Link></p>
    </main>
  );
}

export default function WorkspacePage(props: Props) {
  return <Suspense fallback={<p>Cargando workspace…</p>}><WorkspaceContent {...props} /></Suspense>;
}
