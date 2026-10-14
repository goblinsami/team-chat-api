import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { workspaceRequest, type Workspace } from "@/lib/workspaces";
import { CreateWorkspace } from "./create-workspace";

async function DashboardContent() {
  const result = await workspaceRequest("GET");
  if (result.status === 401) redirect("/auth");
  return (
    <main>
      <h1>Tu dashboard</h1>
      <CreateWorkspace />
      <h2>Tus workspaces</h2>
      {!result.data ? (
        <p role="alert">No se pudieron cargar los workspaces. <Link href="/dashboard">Reintentar</Link></p>
      ) : result.data.length === 0 ? (
        <p>Todavía no tienes workspaces.</p>
      ) : (
        <ul>{result.data.map((workspace: Workspace) => <li key={workspace.id}><Link href={`/workspaces/${workspace.id}`}>{workspace.name}</Link></li>)}</ul>
      )}
      <p><Link href="/">Volver al inicio</Link></p>
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<p>Cargando dashboard…</p>}><DashboardContent /></Suspense>;
}
