import Link from "next/link";
import type { EstimateVersion } from "@/lib/parse-phases";

// Tab nav over estimate versions. Each tab is a route link (/v1, /v2). Switching
// version navigates — query (p/t/o scope) is version-specific so it's dropped.
export default function EstimateTabsNav({
  versions,
  active,
}: {
  versions: EstimateVersion[];
  active: string;
}) {
  if (versions.length <= 1) {
    const status = versions[0]?.status;
    return status ? (
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6">{status}</p>
    ) : null;
  }

  const current = versions.find((v) => v.label === active);

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 sm:mb-6 border-b border-zinc-200 dark:border-zinc-800">
        {versions.map((v) => {
          const isActive = v.label === active;
          return (
            <Link
              key={v.label}
              href={`/${v.label}`}
              title={v.status}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              {v.label}
            </Link>
          );
        })}
      </div>

      {current?.status && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 sm:mb-6 -mt-2">
          {current.status}
        </p>
      )}
    </div>
  );
}
