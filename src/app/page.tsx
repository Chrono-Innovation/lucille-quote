import { redirect } from "next/navigation";
import { discoverEstimates } from "@/lib/parse-phases";

export default function Home() {
  const estimates = discoverEstimates();
  const latest = estimates[estimates.length - 1]?.label ?? "v1";
  redirect(`/${latest}`);
}
