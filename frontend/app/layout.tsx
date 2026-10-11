import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Team Chat", description: "Un espacio para conversar con tu equipo." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
