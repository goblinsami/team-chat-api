import { cookies } from "next/headers";

export type Message = { id: number; text: string; user: { name: string } };
type MessagePage = { data: Message[]; nextCursor: number | null };

export async function getMessages(channelId: number, cursor?: number): Promise<{ status: number; data: MessagePage | null }> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return { status: 401, data: null };
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) return { status: 503, data: null };
  try {
    const query = new URLSearchParams({ take: "20" });
    if (cursor !== undefined) query.set("cursor", String(cursor));
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/channels/${channelId}/messages?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { status: response.status, data: null };
    const data = await response.json();
    if (!Array.isArray(data.data) || !data.data.every((message: Message) =>
      message && Number.isInteger(message.id) && typeof message.text === "string" && typeof message.user?.name === "string") ||
      !(data.nextCursor === null || Number.isSafeInteger(data.nextCursor))) {
      return { status: 502, data: null };
    }
    return { status: response.status, data };
  } catch {
    return { status: 502, data: null };
  }
}
