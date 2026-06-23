import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export interface Task {
  name: string;
  size: string;
  hours: number;
  optional: boolean;
}

export interface Phase {
  phase: number;
  name: string;
  dependency: string;
  tasks: Task[];
  totalHours: number;
  optional: boolean;
}

export interface EstimateVersion {
  /** filename, e.g. "project-estimate-v1.md" */
  file: string;
  /** short tab label, e.g. "v1" */
  label: string;
  /** longer description from the doc's Status line */
  status: string;
}

const DATA_DIR = join(process.cwd(), "data");

/** Discover all estimate markdown files, sorted by version. */
export function discoverEstimates(): EstimateVersion[] {
  const files = readdirSync(DATA_DIR)
    .filter((f) => /^project-estimate-v\d+\.md$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/v(\d+)/)![1], 10);
      const nb = parseInt(b.match(/v(\d+)/)![1], 10);
      return na - nb;
    });

  return files.map((file) => {
    const version = file.match(/v(\d+)/)![1];
    let status = "";
    const content = readFileSync(join(DATA_DIR, file), "utf-8");
    const statusLine = content
      .split("\n")
      .find((l) => l.trim().startsWith("**Status:**"));
    if (statusLine) {
      status = statusLine.replace(/\*\*Status:\*\*/, "").trim();
    }
    return { file, label: `v${version}`, status };
  });
}

export function parsePhases(file = "project-estimate-v1.md"): Phase[] {
  const mdPath = join(DATA_DIR, file);
  const content = readFileSync(mdPath, "utf-8");
  const lines = content.split("\n");

  const tableStartIdx = lines.findIndex((l) =>
    l.includes("## Phase Summary Table")
  );
  if (tableStartIdx === -1) {
    throw new Error("Phase Summary Table not found in markdown");
  }

  const phases: Phase[] = [];

  for (let i = tableStartIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (phases.length > 0 && !line.startsWith("|")) break;
    if (!line.startsWith("|")) continue;
    if (line.includes("Phase") && line.includes("Name")) continue;
    if (line.includes("---")) continue;

    const cells = line.split("|").map((c) => c.trim()).slice(1, -1);
    if (cells.length < 6) continue;

    const phaseNum = parseInt(cells[0], 10);
    if (isNaN(phaseNum)) continue;

    const rawName = cells[1];
    const isOptional = rawName.includes("⭐");
    const name = rawName.replace(/\s*⭐\s*/, "").trim();
    const totalHours = parseFloat(cells[4].replace(/,/g, ""));

    phases.push({
      phase: phaseNum,
      name,
      dependency: cells[2],
      tasks: [],
      totalHours,
      optional: isOptional,
    });
  }

  // Parse per-phase task tables from the detailed breakdown sections
  for (const phase of phases) {
    const sectionPattern = new RegExp(`^###\\s+Phase\\s+${phase.phase}[:\\s]`);
    const sectionIdx = lines.findIndex((l) => sectionPattern.test(l.trim()));
    if (sectionIdx === -1) continue;

    let inTable = false;
    for (let i = sectionIdx + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("### ") || line.startsWith("## ")) break;

      if (!line.startsWith("|")) {
        if (inTable) break;
        continue;
      }

      if (line.includes("Task") && line.includes("Size")) {
        inTable = true;
        continue;
      }
      if (line.includes("---")) continue;

      const cells = line.split("|").map((c) => c.trim()).slice(1, -1);
      if (cells.length < 3) continue;

      const rawTaskName = cells[0];
      const taskOptional = rawTaskName.includes("⭐") || phase.optional;
      const taskName = rawTaskName.replace(/\s*⭐\s*/, "").trim();
      const size = cells[1];
      const hours = parseFloat(cells[2].replace(/,/g, ""));

      if (isNaN(hours)) continue;

      phase.tasks.push({
        name: taskName,
        size,
        hours,
        optional: taskOptional,
      });
    }
  }

  return phases;
}
