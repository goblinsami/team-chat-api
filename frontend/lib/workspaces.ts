import { cookies } from "next/headers";

export type Channel = { id: number; name: string };
export type Workspace = { id: number; name: string; channels?: Channel[] };

export async function workspaceRequest(method: "GET" | "POST", name?: string, workspaceId?: number) {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return { status: 401, data: null };
  const baseUrl = process.env.BACKEND_URL;
  if (!baseUrl) return { status: 503, data: null };
  try {
    const path = workspaceId === undefined ? "/workspaces" : `/workspaces/${workspaceId}/channels`;
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify({ name }) } : {}),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return { status: response.status, data: null };
    const data = await response.json();
    const valid = (item: Workspace) => item && Number.isInteger(item.id) && typeof item.name === "string";
    if (method === "GET" ? !Array.isArray(data) || !data.every(valid) : !valid(data)) {
      return { status: 502, data: null };
    }
    return { status: response.status, data };
  } catch {
    return { status: 502, data: null };
  }
}
