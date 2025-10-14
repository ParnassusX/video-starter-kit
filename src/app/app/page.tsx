import { cookies } from "next/headers";
import { PROJECT_PLACEHOLDER } from "@/data/schema";
import { App } from "@/components/main";

export default async function IndexPage() {
  const cookieStore = await cookies();
  const lastProjectId = cookieStore.get("__aivs_lastProjectId");
  return <App projectId={lastProjectId?.value ?? PROJECT_PLACEHOLDER.id} />;
}
