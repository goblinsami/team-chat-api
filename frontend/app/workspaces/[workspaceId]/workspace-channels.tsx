"use client";

import { useState } from "react";
import Link from "next/link";
import type { Channel } from "@/lib/workspaces";
import { CreateChannel } from "./create-channel";

export function WorkspaceChannels({ workspaceId, channels }: { workspaceId: number; channels: Channel[] }) {
  const [created, setCreated] = useState<Channel[]>([]);
  const allChannels = [...channels, ...created.filter((item) => !channels.some((channel) => channel.id === item.id))];
  return (
    <>
      <CreateChannel workspaceId={workspaceId} onCreated={(channel) => setCreated((items) => [...items, channel])} />
      <h2>Canales</h2>
      {allChannels.length === 0 ? <p>Todavía no hay canales.</p> : (
        <ul>{allChannels.map((channel) => <li key={channel.id}><Link href={`/workspaces/${workspaceId}/channels/${channel.id}`}>{channel.name}</Link></li>)}</ul>
      )}
    </>
  );
}
