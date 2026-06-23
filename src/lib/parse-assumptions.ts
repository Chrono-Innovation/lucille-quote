import { readFileSync } from "fs";
import { join } from "path";

export interface AssumptionGroup {
  heading: string;
  items: string[];
}

export function parseAssumptions(file = "project-estimate-v1.md"): AssumptionGroup[] {
  const content = readFileSync(join(process.cwd(), "data", file), "utf-8");
  const lines = content.split("\n");

  const startIdx = lines.findIndex((l) =>
    l.trim().startsWith("## Assumptions & Constraints")
  );
  if (startIdx === -1) return [];

  const groups: AssumptionGroup[] = [];
  let current: AssumptionGroup | null = null;

  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("## ")) break; // next top-level section → stop

    if (line.startsWith("### ")) {
      current = { heading: line.replace(/^###\s+/, "").trim(), items: [] };
      groups.push(current);
      continue;
    }

    if (!current) continue;

    // numbered (`1.`) or bulleted (`-`/`*`) list item
    const item = line.replace(/^\d+\.\s+/, "").replace(/^[-*]\s+/, "");
    if (item && item !== line) current.items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}
