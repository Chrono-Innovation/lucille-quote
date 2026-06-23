"use client";

import React, { useState } from "react";
import type { AssumptionGroup } from "@/lib/parse-assumptions";

// Minimal inline renderer: **bold** + `code`.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-[0.85em] px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function AssumptionsPanel({ groups }: { groups: AssumptionGroup[] }) {
  const [open, setOpen] = useState(false);

  if (groups.length === 0) return null;

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section className="mt-6 sm:mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Assumptions &amp; Constraints
          </span>
        </span>
        <span className="text-xs font-normal px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full shrink-0">
          {total} items
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-6 pb-6 pt-1 space-y-5">
          {groups.map((group) => (
            <div key={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
                {group.heading}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <span className="text-zinc-300 dark:text-zinc-600 select-none shrink-0">•</span>
                    <span className="break-words">{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
