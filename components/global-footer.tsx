import { headers } from "next/headers";
import { GlobalFooterClient } from "@/components/global-footer-client";

export async function GlobalFooter() {
  const host = (await headers()).get("host") ?? "";

  return <GlobalFooterClient host={host} />;
}
