import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { workspaceRequest, type Workspace } from "@/lib/workspaces";
import { CreateMessage } from "./create-message";
import { getMessages } from "@/lib/messages";
import { LiveMessages } from "./live-messages";

type Props = {
  params: Promise<{ workspaceId: string; channelId: string }>;
  searchParams: Promise<{ cursor?: string | string[] }>;
};

async function ChannelContent({ params, searchParams }: Props) {
  const { workspaceId, channelId } = await params;
  const workspaceNumber = Number(workspaceId);
  const channelNumber = Number(channelId);
  if (!/^\d+$/.test(workspaceId) || !/^\d+$/.test(channelId) ||
      !Number.isSafeInteger(workspaceNumber) || workspaceNumber < 1 ||
      !Number.isSafeInteger(channelNumber) || channelNumber < 1) notFound();

  const result = await workspaceRequest("GET");
  if (result.status === 401) redirect("/auth");
  if (!result.data) {
    return (
      <main>
        <p role="alert">No se pudo cargar el canal.</p>
        <Link href={`/workspaces/${workspaceNumber}`}>Volver al workspace</Link>
      </main>
    );
  }
  const workspace = (result.data as Workspace[]).find((item) => item.id === workspaceNumber);
  const channel = workspace?.channels?.find((item) => item.id === channelNumber);
  if (!workspace || !channel) notFound();
  const { cursor: rawCursor } = await searchParams;
  const cursor = rawCursor === undefined ? undefined : Number(rawCursor);
  if (rawCursor !== undefined && (typeof rawCursor !== "string" || !/^\d+$/.test(rawCursor) || !Number.isSafeInteger(cursor) || cursor! < 1)) notFound();
  const messages = await getMessages(channel.id, cursor);
  if (messages.status === 401) redirect("/auth");
  const channelPath = `/workspaces/${workspace.id}/channels/${channel.id}`;

  return (
    <main>
      <h1>{channel.name}</h1>
      <p>Workspace: {workspace.name}</p>
      <CreateMessage channelId={channel.id} />
      <section aria-labelledby="messages-title">
        <h2 id="messages-title">Mensajes</h2>
        {!messages.data ? <p role="alert">No se pudieron cargar los mensajes. <Link href={channelPath}>Reintentar</Link></p>
          : <LiveMessages key={channel.id} channelId={channel.id} initialMessages={messages.data.data} />}
        {messages.data?.nextCursor && <p><Link href={`${channelPath}?cursor=${messages.data.nextCursor}`}>Ver mensajes anteriores</Link></p>}
        {cursor !== undefined && <p><Link href={channelPath}>Ver mensajes recientes</Link></p>}
      </section>
      <p><Link href={`/workspaces/${workspace.id}`}>Volver al workspace</Link></p>
      <p><Link href="/dashboard">Volver al dashboard</Link></p>
    </main>
  );
}

export default function ChannelPage(props: Props) {
  return <Suspense fallback={<p>Cargando canal…</p>}><ChannelContent {...props} /></Suspense>;
}
