"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Phase } from "@/lib/parse-phases";

type Owner = "chrono" | "sm360";

// Stable URL token from task name, not array index — reordering tasks in the
// source doesn't repoint existing shared links.
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

/** Task-level cross-phase dependencies. Key depends on values. */
const TASK_DEPS: Record<string, string[]> = {};

function getTransitiveTaskDeps(taskKey: string): Set<string> {
  const result = new Set<string>();
  const stack = [...(TASK_DEPS[taskKey] ?? [])];
  while (stack.length > 0) {
    const dep = stack.pop()!;
    if (result.has(dep)) continue;
    result.add(dep);
    stack.push(...(TASK_DEPS[dep] ?? []));
  }
  return result;
}

function getTransitiveTaskDependents(taskKey: string): Set<string> {
  const result = new Set<string>();
  const stack = [taskKey];
  while (stack.length > 0) {
    const key = stack.pop()!;
    for (const [k, deps] of Object.entries(TASK_DEPS)) {
      if (deps.includes(key) && !result.has(k)) {
        result.add(k);
        stack.push(k);
      }
    }
  }
  return result;
}

function parseDeps(dep: string): number[] {
  if (!dep || dep === "Mandatory") return [];
  return dep
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
}

// Styled, accessible tri-state checkbox. Stays a real native <input> (keyboard,
// focus, role/state) but hides its native box via appearance-none and draws the
// check/dash as a React-controlled SVG overlay — React already knows both the
// checked and indeterminate props, so no CSS :indeterminate hack is needed. The
// DOM `indeterminate` property is still set via ref so assistive tech reports it.
function IndeterminateCheckbox({ checked, indeterminate, disabled, onChange, onClick, size = "md" }: {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  size?: "sm" | "md";
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const box = size === "md" ? "w-5 h-5" : "w-4 h-4";
  const mark = size === "md" ? "w-3.5 h-3.5" : "w-3 h-3";
  const filled = checked || indeterminate;

  return (
    <span className={`relative inline-flex items-center justify-center ${box} shrink-0`}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        onClick={onClick}
        className={`peer appearance-none ${box} m-0 rounded-md border transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
          ${disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer"}
          ${filled
            ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
            : "bg-transparent border-zinc-300 dark:border-zinc-600"}
          ${!disabled && !filled ? "hover:border-blue-500 dark:hover:border-blue-400" : ""}`}
      />
      {filled && (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          className={`pointer-events-none absolute text-white ${mark}`}
        >
          {indeterminate ? (
            <path d="M4 8h8" strokeWidth={2} strokeLinecap="round" />
          ) : (
            <path d="M3.5 8.5l3 3 6-6.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      )}
    </span>
  );
}

function useBypassRestrictions(
  phases: Phase[],
  selectedPhases: Set<number>,
  setSelectedTasks: React.Dispatch<React.SetStateAction<Set<string>>>
) {
  const [bypassed, setBypassed] = useState(false);
  const phasesRef = useRef(phases);
  const selectedRef = useRef(selectedPhases);
  phasesRef.current = phases;
  selectedRef.current = selectedPhases;
  console.log('Bypass restrictions hook initialized. Bypassed:', bypassed);
  useEffect(() => {
    console.log('Setting up global bypass function');
    (window as any).__unlockAll = () => {
      setBypassed((prev) => {
        const next = !prev;
        if (next) {
          setSelectedTasks((prevTasks) => {
            const seeded = new Set(prevTasks);
            for (const p of phasesRef.current) {
              if (!selectedRef.current.has(p.phase)) continue;
              p.tasks.forEach((t, i) => {
                if (!t.optional) seeded.add(`${p.phase}-${i}`);
              });
            }
            return seeded;
          });
        }
        console.log(
          next
            ? "%c🔓 All restrictions removed — every item is now toggleable"
            : "%c🔒 Restrictions restored",
          "color: #f59e0b; font-weight: bold; font-size: 14px"
        );
        return next;
      });
    };
    return () => { 
      console.log('Cleaning up global bypass function');
      delete (window as any).__unlockAll; 
    };
  }, [setSelectedTasks]);
  return bypassed;
}

export default function PhaseSelector({ phases }: { phases: Phase[] }) {
  const { depMap, dependentMap } = useMemo(() => {
    const depMap = new Map<number, Set<number>>();
    const dependentMap = new Map<number, Set<number>>();

    for (const p of phases) {
      depMap.set(p.phase, new Set(parseDeps(p.dependency)));
    }

    for (const [phase, deps] of depMap) {
      for (const dep of deps) {
        if (!dependentMap.has(dep)) dependentMap.set(dep, new Set());
        dependentMap.get(dep)!.add(phase);
      }
    }

    return { depMap, dependentMap };
  }, [phases]);

  const cycleGroups = useMemo(() => {
    const groups = new Map<number, Set<number>>();
    for (const p of phases) {
      if (groups.has(p.phase)) continue;
      const reachable = new Set<number>();
      const stack = [...(depMap.get(p.phase) ?? [])];
      while (stack.length > 0) {
        const d = stack.pop()!;
        if (reachable.has(d)) continue;
        reachable.add(d);
        for (const t of depMap.get(d) ?? []) stack.push(t);
      }
      const group = new Set<number>();
      for (const r of reachable) {
        const rReachable = new Set<number>();
        const rStack = [...(depMap.get(r) ?? [])];
        while (rStack.length > 0) {
          const d = rStack.pop()!;
          if (rReachable.has(d)) continue;
          rReachable.add(d);
          for (const t of depMap.get(d) ?? []) rStack.push(t);
        }
        if (rReachable.has(p.phase)) group.add(r);
      }
      if (group.size > 0) {
        group.add(p.phase);
        for (const member of group) groups.set(member, group);
      }
    }
    return groups;
  }, [phases, depMap]);

  const getAllDeps = useCallback(
    (phase: number): Set<number> => {
      const result = new Set<number>();
      const stack = [...(depMap.get(phase) ?? [])];
      while (stack.length > 0) {
        const dep = stack.pop()!;
        if (result.has(dep)) continue;
        result.add(dep);
        for (const t of depMap.get(dep) ?? []) stack.push(t);
      }
      return result;
    },
    [depMap]
  );

  const getAllDependents = useCallback(
    (phase: number): Set<number> => {
      const result = new Set<number>();
      const stack = [...(dependentMap.get(phase) ?? [])];
      while (stack.length > 0) {
        const dep = stack.pop()!;
        if (result.has(dep)) continue;
        result.add(dep);
        for (const t of dependentMap.get(dep) ?? []) stack.push(t);
      }
      return result;
    },
    [dependentMap]
  );

  // Phase-level selection. Default = full scope (every phase). The mount-time
  // URL-hydration effect overrides this when p/t/o params are present.
  const [selectedPhases, setSelectedPhases] = useState<Set<number>>(() => {
    return new Set(phases.map((p) => p.phase));
  });

  // Optional task selection (keys: "phaseNum-taskIdx"). Default = every optional
  // task selected (mirrors selectAll), so a fresh no-params load shows full scope.
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(() => {
    const allOptional = new Set<string>();
    for (const p of phases) {
      p.tasks.forEach((t, i) => {
        if (t.optional) allOptional.add(`${p.phase}-${i}`);
      });
    }
    return allOptional;
  });

  // Ownership. Default everything = chrono. sm360Phases = phase-level flips.
  // taskOwners = explicit per-task overrides (either direction).
  const [sm360Phases, setSm360Phases] = useState<Set<number>>(new Set());
  const [taskOwners, setTaskOwners] = useState<Map<string, Owner>>(new Map());

  const effectiveTaskOwner = useCallback(
    (phase: number, key: string): Owner =>
      taskOwners.get(key) ?? (sm360Phases.has(phase) ? "sm360" : "chrono"),
    [taskOwners, sm360Phases]
  );

  // --- URL sync: index-key ↔ name-slug maps -------------------------------
  // Internal keys are index-based (`${phase}-${idx}`) — fragile for sharing.
  // URL uses name-slugs; translate at the boundary. Within-phase collisions get ~N.
  const { taskKeyToSlug, slugToTaskKey, taskKeyOptional } = useMemo(() => {
    const k2s = new Map<string, string>();
    const s2k = new Map<string, string>();
    const opt = new Map<string, boolean>();
    for (const p of phases) {
      const seen = new Map<string, number>();
      p.tasks.forEach((t, i) => {
        const base = `${p.phase}:${slugify(t.name)}`;
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const slug = n === 0 ? base : `${base}~${n}`;
        const key = `${p.phase}-${i}`;
        k2s.set(key, slug);
        s2k.set(slug, key);
        opt.set(key, !!t.optional);
      });
    }
    return { taskKeyToSlug: k2s, slugToTaskKey: s2k, taskKeyOptional: opt };
  }, [phases]);

  // hydrated MUST be state, not a ref — gates the write effect so the mount-read
  // commits before any write can run with stale default state.
  const [hydrated, setHydrated] = useState(false);

  // READ — once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pRaw = params.get("p");
    const tRaw = params.get("t");
    const oRaw = params.get("o");

    if (pRaw !== null) {
      setSelectedPhases(new Set(
        pRaw.split(",").map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))
      ));
    }
    if (tRaw !== null) {
      const sel = new Set<string>();
      const owners = new Map<string, Owner>();
      for (const tok of tRaw.split(",").filter(Boolean)) {
        const bar = tok.lastIndexOf("|");
        const slug = bar === -1 ? tok : tok.slice(0, bar);
        const flag = bar === -1 ? "" : tok.slice(bar + 1);
        const key = slugToTaskKey.get(slug);
        if (!key) continue;
        if (taskKeyOptional.get(key)) sel.add(key);
        if (flag === "s") owners.set(key, "sm360");
        else if (flag === "c") owners.set(key, "chrono");
      }
      setSelectedTasks(sel);
      setTaskOwners(owners);
    }
    if (oRaw !== null) {
      setSm360Phases(new Set(
        oRaw.split(",").map((s) => parseInt(s, 10)).filter((n) => !isNaN(n))
      ));
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WRITE — on every change
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    params.set("p", [...selectedPhases].sort((a, b) => a - b).join(","));

    const tokens: string[] = [];
    for (const p of phases) {
      if (!selectedPhases.has(p.phase)) continue;
      p.tasks.forEach((t, i) => {
        const key = `${p.phase}-${i}`;
        const slug = taskKeyToSlug.get(key);
        if (!slug) return;
        const inScope = !t.optional || selectedTasks.has(key);
        if (!inScope) return;
        const ovr = taskOwners.get(key);
        const flag = ovr ? (ovr === "sm360" ? "|s" : "|c") : "";
        if (t.optional && selectedTasks.has(key)) tokens.push(`${slug}${flag}`);
        else if (flag) tokens.push(`${slug}${flag}`); // non-optional, carries override
      });
    }
    tokens.sort();
    params.set("t", tokens.join(","));
    params.set("o", [...sm360Phases].sort((a, b) => a - b).join(","));

    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [hydrated, selectedPhases, selectedTasks, sm360Phases, taskOwners, phases, taskKeyToSlug]);
  // -------------------------------------------------------------------------

  const [copied, setCopied] = useState(false);

  // Presentational-only: hides all price values (headline + per-phase column).
  // Default false = prices visible. Not synced to URL.
  const [pricesHidden, setPricesHidden] = useState(false);

  // Presentational-only: which phases are collapsed (task rows hidden). Empty =
  // all expanded (default). Not synced to URL.
  const [collapsedPhases, setCollapsedPhases] = useState<Set<number>>(new Set());

  const toggleCollapse = useCallback((phase: number) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase); else next.add(phase);
      return next;
    });
  }, []);

  // Copies the current URL — the write effect keeps it in sync with selection,
  // so the link captures scope + owners exactly as they are now.
  const copyShareUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      return; // clipboard blocked (insecure context / denied) — no-op
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const bypassed = useBypassRestrictions(phases, selectedPhases, setSelectedTasks);

  // Tri-state "select-all for this group" toggle for the phase header. If the
  // phase is fully checked -> deselect the whole phase (cascade dependents, drop
  // its task keys). Otherwise (unchecked OR indeterminate) -> select the full
  // phase: add it, cascade its deps, and fill ALL its optional task keys so it
  // becomes fully checked. bypassed skips the dependency cascades (same as
  // togglePhase).
  const togglePhaseFull = useCallback(
    (phase: number) => {
      const phaseObj = phases.find((p) => p.phase === phase);
      const optionalKeys: string[] = [];
      if (phaseObj) {
        phaseObj.tasks.forEach((t, i) => {
          if (t.optional) optionalKeys.push(`${phase}-${i}`);
        });
      }
      const isSelected = selectedPhases.has(phase);
      const allOptionalSelected =
        optionalKeys.length === 0 || optionalKeys.every((k) => selectedTasks.has(k));
      const isChecked = isSelected && allOptionalSelected;

      if (isChecked) {
        // Deselect the entire phase.
        setSelectedPhases((prev) => {
          const next = new Set(prev);
          next.delete(phase);
          if (!bypassed) {
            for (const dep of getAllDependents(phase)) next.delete(dep);
          }
          return next;
        });
        setSelectedTasks((prev) => {
          const next = new Set(prev);
          const removed: string[] = [];
          for (const key of prev) {
            if (parseInt(key.split("-")[0], 10) === phase) {
              next.delete(key);
              removed.push(key);
            }
          }
          if (!bypassed) {
            for (const key of removed) {
              for (const dep of getTransitiveTaskDependents(key)) next.delete(dep);
            }
          }
          return next;
        });
      } else {
        // Select the full phase (fill all optional tasks).
        setSelectedPhases((prev) => {
          const next = new Set(prev);
          next.add(phase);
          if (!bypassed) {
            for (const dep of getAllDeps(phase)) next.add(dep);
          }
          return next;
        });
        setSelectedTasks((prev) => {
          const next = new Set(prev);
          for (const key of optionalKeys) next.add(key);
          return next;
        });
      }
    },
    [phases, selectedPhases, selectedTasks, getAllDeps, getAllDependents, bypassed]
  );

  const toggleTask = useCallback((phaseNum: number, taskIdx: number) => {
    const key = `${phaseNum}-${taskIdx}`;
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        if (!bypassed) {
          for (const dep of getTransitiveTaskDependents(key)) next.delete(dep);
        }
      } else {
        next.add(key);
        if (!bypassed) {
          for (const dep of getTransitiveTaskDeps(key)) next.add(dep);
        }
      }
      return next;
    });
  }, [bypassed]);

  useEffect(() => {
    if (bypassed) return;
    const neededPhases = new Set<number>();
    for (const key of selectedTasks) {
      neededPhases.add(parseInt(key.split("-")[0], 10));
    }
    let needsUpdate = false;
    for (const p of neededPhases) {
      if (!selectedPhases.has(p)) { needsUpdate = true; break; }
    }
    if (!needsUpdate) return;
    setSelectedPhases((prev) => {
      const next = new Set(prev);
      for (const p of neededPhases) {
        if (!next.has(p)) {
          next.add(p);
          for (const dep of getAllDeps(p)) next.add(dep);
        }
      }
      return next;
    });
  }, [selectedTasks, selectedPhases, getAllDeps, bypassed]);

  const mandatoryPhases = useMemo(
    () => bypassed ? new Set<number>() : new Set(phases.filter((p) => p.dependency === "Mandatory").map((p) => p.phase)),
    [phases, bypassed]
  );

  const { lockedPhases, lockedBy } = useMemo(() => {
    if (bypassed) return { lockedPhases: new Set<number>(), lockedBy: new Map<number, Set<number>>() };

    const lockedBy = new Map<number, Set<number>>();
    const locked = new Set(mandatoryPhases);

    for (const phase of selectedPhases) {
      for (const dep of depMap.get(phase) ?? []) {
        if (selectedPhases.has(dep)) {
          const group = cycleGroups.get(phase);
          if (group && group.has(dep)) continue;
          locked.add(dep);
          if (!lockedBy.has(dep)) lockedBy.set(dep, new Set());
          lockedBy.get(dep)!.add(phase);
        }
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (const phase of locked) {
        for (const dep of depMap.get(phase) ?? []) {
          if (selectedPhases.has(dep) && !locked.has(dep)) {
            const group = cycleGroups.get(phase);
            if (group && group.has(dep)) continue;
            locked.add(dep);
            if (!lockedBy.has(dep)) lockedBy.set(dep, new Set());
            lockedBy.get(dep)!.add(phase);
            changed = true;
          }
        }
      }
    }

    return { lockedPhases: locked, lockedBy };
  }, [selectedPhases, depMap, mandatoryPhases, cycleGroups, bypassed]);

  const phaseNames = useMemo(
    () => new Map(phases.map((p) => [p.phase, p.name])),
    [phases]
  );

  // Task-level locking: which optional tasks are locked because another selected task depends on them
  const lockedTasksBy = useMemo(() => {
    if (bypassed) return new Map<string, Set<string>>();
    const locked = new Map<string, Set<string>>();
    for (const key of selectedTasks) {
      for (const dep of getTransitiveTaskDeps(key)) {
        if (!locked.has(dep)) locked.set(dep, new Set());
        locked.get(dep)!.add(key);
      }
    }
    return locked;
  }, [selectedTasks, bypassed]);

  const taskLabels = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of phases) {
      p.tasks.forEach((t, i) => {
        const short = t.name.length > 40 ? t.name.slice(0, 37) + "…" : t.name;
        map.set(`${p.phase}-${i}`, `Phase ${p.phase}: ${short}`);
      });
    }
    return map;
  }, [phases]);

  const selectAllRequired = () => {
    setSelectedPhases(new Set(phases.filter((p) => !p.optional).map((p) => p.phase)));
    setSelectedTasks(new Set());
  };

  const selectAll = () => {
    setSelectedPhases(new Set(phases.map((p) => p.phase)));
    const allOptional = new Set<string>();
    for (const p of phases) {
      p.tasks.forEach((t, i) => {
        if (t.optional) allOptional.add(`${p.phase}-${i}`);
      });
    }
    setSelectedTasks(allOptional);
  };

  const clearAll = () => {
    setSelectedPhases(bypassed ? new Set() : new Set(mandatoryPhases));
    setSelectedTasks(new Set());
  };

  const HOURLY_RATE = 165;

  // Selection-INDEPENDENT fixed loaded price per task (key `${phase}-${idx}`).
  // Computed once from the full dataset so the full-scope prices sum to EXACTLY
  // the spreadsheet's full-scope total. With fixed per-task prices, the headline
  // total and every phase cost become plain sums of in-scope task prices, so
  // removing a feature drops the total by exactly that feature's displayed price.
  const taskLoadedPrice = useMemo(() => {
    const RATE = HOURLY_RATE;

    // Each task's high-range dev cost, plus the full-scope anchor (ALL tasks, as
    // if every one were selected & chrono-owned) using the SAME spreadsheet formula.
    const taskDevCost = new Map<string, number>();
    let anchorDevHoursHigh = 0;
    for (const p of phases) {
      p.tasks.forEach((t, i) => {
        const hoursHigh = Math.ceil(t.hours * 1.45);
        anchorDevHoursHigh += hoursHigh;
        taskDevCost.set(`${p.phase}-${i}`, hoursHigh * RATE);
      });
    }

    const anchorDevCost = anchorDevHoursHigh * RATE;
    const anchorPmCost = Math.ceil(anchorDevHoursHigh * 0.2) * RATE;
    const anchorQaCost = Math.ceil(anchorDevCost * 0.15);
    const anchorTotal = anchorDevCost + anchorPmCost + anchorQaCost;

    const L = anchorDevCost === 0 ? 0 : anchorTotal / anchorDevCost;

    // Exact loaded price per task, then largest-remainder rounding so the rounded
    // integer prices sum to EXACTLY anchorTotal.
    const result = new Map<string, number>();
    const remainders: { key: string; frac: number }[] = [];
    let allocated = 0;
    for (const [key, devCost] of taskDevCost) {
      const exact = devCost * L;
      const floor = Math.floor(exact);
      result.set(key, floor);
      remainders.push({ key, frac: exact - floor });
      allocated += floor;
    }

    let leftover = anchorTotal - allocated;
    remainders.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < remainders.length && leftover > 0; i++) {
      result.set(remainders[i].key, result.get(remainders[i].key)! + 1);
      leftover--;
    }

    return result;
  }, [phases, HOURLY_RATE]);

  // Selection-INDEPENDENT full-scope working days: timeline as if every task
  // across all phases were selected & chrono-owned, using the SAME high-range
  // formula as totals.workingDays. Drives the timeline progress bar denominator
  // so a full-scope selection reads as 100%.
  const fullScopeWorkingDays = useMemo(() => {
    let fullDevHoursHigh = 0;
    for (const p of phases) {
      for (const t of p.tasks) {
        fullDevHoursHigh += Math.ceil(t.hours * 1.45);
      }
    }
    const fullTotalHoursHigh =
      fullDevHoursHigh + Math.ceil(fullDevHoursHigh * 0.2) + Math.ceil(fullDevHoursHigh * 0.15);
    return fullTotalHoursHigh / (1.5 * 8);
  }, [phases]);

  const totals = useMemo(() => {
    let requiredHours = 0;
    let optionalHours = 0;
    // Total = plain sum of the fixed loaded prices of every in-scope task. With
    // fixed per-task prices, the headline reconciles exactly with the per-phase
    // column and removing a feature drops the total by exactly its displayed price.
    let totalCost = 0;
    // High-range (145% contingency) dev hours of in-scope tasks — drives the
    // simple timeline estimate below. Per-task ceiling matches taskLoadedPrice.
    let devHoursHigh = 0;

    for (const p of phases) {
      if (!selectedPhases.has(p.phase)) continue;
      p.tasks.forEach((t, i) => {
        const key = `${p.phase}-${i}`;
        const effectiveOpt = bypassed || t.optional;
        if (effectiveTaskOwner(p.phase, key) === "sm360") return;
        const inScope = !effectiveOpt || selectedTasks.has(key) || lockedTasksBy.has(key);
        if (!inScope) return;
        if (!effectiveOpt) {
          requiredHours += t.hours;
        } else {
          optionalHours += t.hours;
        }
        totalCost += taskLoadedPrice.get(key) ?? 0;
        devHoursHigh += Math.ceil(t.hours * 1.45);
      });
    }

    const devHours = requiredHours + optionalHours;

    // Simple timeline derived directly from in-scope high-range effort — no
    // per-phase scheduling. Mirrors the source spreadsheet's timeline math.
    const FTE = 1.5;
    const pmHoursHigh = Math.ceil(devHoursHigh * 0.2);
    const qaHoursHigh = Math.ceil(devHoursHigh * 0.15);
    const totalHoursHigh = devHoursHigh + pmHoursHigh + qaHoursHigh;
    const workingDays = totalHoursHigh / (FTE * 8); // 8 productive hours/day
    const weeks = workingDays / 5;

    const totalTasks = phases.reduce((s, p) => s + p.tasks.length, 0);
    let selectedTaskCount = 0;
    for (const p of phases) {
      if (!selectedPhases.has(p.phase)) continue;
      p.tasks.forEach((t, i) => {
        const key = `${p.phase}-${i}`;
        const effectiveOpt = bypassed || t.optional;
        if (!effectiveOpt || selectedTasks.has(key) || lockedTasksBy.has(key)) selectedTaskCount++;
      });
    }

    return {
      phaseCount: phases.filter((p) => selectedPhases.has(p.phase)).length,
      selectedTaskCount,
      totalTasks,
      requiredHours,
      optionalHours,
      devHours,
      totalCost,
      workingDays,
      weeks,
    };
  }, [selectedPhases, selectedTasks, lockedTasksBy, phases, taskLoadedPrice, bypassed, effectiveTaskOwner]);

  // Per-phase "loaded" cost: plain sum of the fixed loaded prices of that phase's
  // in-scope, chrono-owned tasks (same inclusion predicate as totals). Task prices
  // are already integers summing to the full-scope total, so the column sums
  // exactly to totals.totalCost with no scaling or extra rounding pass.
  const phaseLoadedCost = useMemo(() => {
    const result = new Map<number, number>();
    for (const p of phases) {
      if (!selectedPhases.has(p.phase)) continue;
      let phaseCost = 0;
      p.tasks.forEach((t, i) => {
        const key = `${p.phase}-${i}`;
        const effectiveOpt = bypassed || t.optional;
        if (effectiveTaskOwner(p.phase, key) === "sm360") return;
        const inScope = !effectiveOpt || selectedTasks.has(key) || lockedTasksBy.has(key);
        if (!inScope) return;
        phaseCost += taskLoadedPrice.get(key) ?? 0;
      });
      result.set(p.phase, phaseCost);
    }
    return result;
  }, [phases, selectedPhases, selectedTasks, lockedTasksBy, bypassed, effectiveTaskOwner, taskLoadedPrice]);

  const timelineBarPct =
    fullScopeWorkingDays > 0 ? Math.min(100, (totals.workingDays / fullScopeWorkingDays) * 100) : 0;

  const summaryContent = (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
        <span>Phases</span>
        <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
          {totals.phaseCount} / {phases.length}
        </span>
      </div>
      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
        <span>Tasks</span>
        <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
          {totals.selectedTaskCount} / {totals.totalTasks}
        </span>
      </div>

      {/* <hr className="border-zinc-200 dark:border-zinc-700" />

      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
        <span>Required (dev)</span>
        <span className="font-mono">{totals.requiredHours.toLocaleString()} hrs</span>
      </div>
      {totals.optionalHours > 0 && (
        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
          <span>Optional (dev)</span>
          <span className="font-mono">{totals.optionalHours.toLocaleString()} hrs</span>
        </div>
      )}
      <div className="flex justify-between text-zinc-900 dark:text-zinc-100 font-medium">
        <span>Development</span>
        <span className="font-mono">{totals.devHours.toLocaleString()} hrs</span>
      </div>
      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
        <span>PM (20%)</span>
        <span className="font-mono">{totals.pmHours.toLocaleString()} hrs</span>
      </div>
      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
        <span>QA (15%)</span>
        <span className="font-mono">{totals.qaHours.toLocaleString()} hrs</span>
      </div>

      <hr className="border-zinc-200 dark:border-zinc-700" /> */}

      {/* <div className="flex justify-between text-base font-semibold text-zinc-900 dark:text-zinc-100">
        <span>Total Hours</span>
        <span className="font-mono">{totals.totalHours.toLocaleString()} hrs</span>
      </div> */}
      <div className="flex justify-between text-lg font-bold pt-1 text-zinc-900 dark:text-zinc-100">
        <span>Estimated Cost</span>
        <span className="font-mono text-blue-600 dark:text-blue-400">
          {pricesHidden ? "•••" : `$${totals.totalCost.toLocaleString()}`}
        </span>
      </div>
      {/* <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>With 15% provisional</span>
        <span className="font-mono">${totals.costWithProvisional.toLocaleString()}</span>
      </div> */}

      <hr className="border-zinc-200 dark:border-zinc-700" />

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3 mt-1 space-y-2">
        <div className="flex items-center gap-1.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400"
          >
            <circle cx="8" cy="8" r="6.25" />
            <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Timeline Estimate
          </h3>
        </div>

        <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
          {totals.workingDays > 0 ? `~${totals.weeks.toFixed(1)} weeks` : "—"}
        </div>

        <div
          className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden"
          role="progressbar"
          aria-label="Selected timeline relative to full scope"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(timelineBarPct)}
        >
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
            style={{ width: `${timelineBarPct}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="lg:order-2 lg:w-80 shrink-0">
        <div className="lg:sticky lg:top-8 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 sm:p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Estimate Summary</h2>
          {summaryContent}
        </div>
      </div>

      <div className="flex-1 min-w-0 lg:order-1">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          {bypassed && (
            <span className="px-3 py-2 text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-300 dark:border-amber-700">
              🔓 All restrictions bypassed
            </span>
          )}
          <button
            onClick={selectAllRequired}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Required Only
          </button>
          <button
            onClick={selectAll}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
          >
            Full Scope
          </button>
          <button
            onClick={clearAll}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setPricesHidden((h) => !h)}
            aria-pressed={pricesHidden}
            aria-label={pricesHidden ? "Show prices" : "Hide prices"}
            title={pricesHidden ? "Show all prices" : "Hide all prices"}
            className="ml-auto text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 inline-flex items-center gap-1.5 px-2 py-2 transition-colors"
          >
            {pricesHidden ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Show prices
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                Hide prices
              </>
            )}
          </button>
          <button
            onClick={copyShareUrl}
            title="Copies a link to the current selection. The link captures the scope and owners exactly as they are now — later changes won't update an already-shared link."
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
              copied
                ? "bg-green-600 text-white"
                : "text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Link copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 -mt-2 mb-4 sm:mb-6">
          Share copies a link to your current selection. It captures the scope and owners
          at the moment you click — later changes won&apos;t update an already-shared link.
        </p>

        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-left text-zinc-700 dark:text-zinc-200">
                <th className="p-2 sm:p-3 w-8 sm:w-10"></th>
                <th className="p-2 sm:p-3">Name</th>
                <th className="p-2 sm:p-3 w-12 text-center hidden sm:table-cell">Size</th>
                <th className="p-2 sm:p-3 w-24 text-right">Cost</th>
                <th className="p-2 sm:p-3 w-28 hidden md:table-cell">Dep.</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((phase) => {
                    const isPhaseSelected = selectedPhases.has(phase.phase);
                    const isLocked = lockedPhases.has(phase.phase);
                    const optionalTaskIndices: number[] = [];
                    phase.tasks.forEach((t, i) => { if (t.optional) optionalTaskIndices.push(i); });
                    const hasOptional = optionalTaskIndices.length > 0;
                    const allOptionalSelected =
                      !hasOptional || optionalTaskIndices.every((i) => selectedTasks.has(`${phase.phase}-${i}`));
                    const phaseChecked = isPhaseSelected && allOptionalSelected;
                    const phaseIndeterminate = isPhaseSelected && hasOptional && !allOptionalSelected;
                    const isCollapsed = collapsedPhases.has(phase.phase);

                    return (
                    <React.Fragment key={phase.phase}>
                      <tr
                        onClick={() => toggleCollapse(phase.phase)}
                        aria-expanded={!isCollapsed}
                        className={`border-t border-zinc-300 dark:border-zinc-600 transition-colors cursor-pointer ${
                          isLocked
                            ? "bg-blue-50/60 dark:bg-blue-950/20"
                            : isPhaseSelected
                              ? "bg-blue-50/40 dark:bg-blue-950/20"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        <td className="p-2 sm:p-3">
                          <IndeterminateCheckbox
                            checked={phaseChecked}
                            indeterminate={phaseIndeterminate}
                            disabled={isLocked}
                            onChange={() => togglePhaseFull(phase.phase)}
                            onClick={(e) => e.stopPropagation()}
                            size="md"
                          />
                        </td>
                        <td className="p-2 sm:p-3 font-semibold text-zinc-900 dark:text-zinc-100">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className={`inline-block align-middle mr-1.5 w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                          >
                            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="font-mono text-zinc-500 dark:text-zinc-400 mr-2 text-xs">
                            {phase.phase}.
                          </span>
                          {phase.name}
                          <span className="flex flex-wrap items-center gap-1 mt-0.5">
                            {phase.optional && (
                              <span className="inline-block text-xs font-normal px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                                Optional Phase
                              </span>
                            )}
                            {mandatoryPhases.has(phase.phase) && (
                              <span className="inline-block text-xs font-normal px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">
                                Mandatory
                              </span>
                            )}
                            {isLocked && !mandatoryPhases.has(phase.phase) && lockedBy.has(phase.phase) && (
                              <>
                                <span className="hidden sm:inline-block text-xs font-normal px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                                  Required by {[...lockedBy.get(phase.phase)!]
                                    .sort((a, b) => a - b)
                                    .map((n) => `#${n} ${phaseNames.get(n)}`)
                                    .join(", ")}
                                </span>
                                <span className="sm:hidden inline-block text-xs font-normal px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                                  Req. by {[...lockedBy.get(phase.phase)!]
                                    .sort((a, b) => a - b)
                                    .map((n) => `#${n}`)
                                    .join(", ")}
                                </span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 hidden sm:table-cell"></td>
                        <td className="p-2 sm:p-3 text-right font-mono text-xs whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                          {isPhaseSelected
                            ? pricesHidden
                              ? "•••"
                              : `$${(phaseLoadedCost.get(phase.phase) ?? 0).toLocaleString()}`
                            : <span className="text-zinc-400 dark:text-zinc-500">—</span>}
                        </td>
                        <td className="p-2 sm:p-3 text-xs text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                          {phase.dependency || "—"}
                        </td>
                      </tr>

                      {!isCollapsed && phase.tasks.map((task, taskIdx) => {
                        const taskKey = `${phase.phase}-${taskIdx}`;
                        const isTaskDepLocked = !bypassed && lockedTasksBy.has(taskKey);
                        const effectiveOptional = bypassed || task.optional;
                        const isTaskActive = isPhaseSelected && (!effectiveOptional || selectedTasks.has(taskKey) || isTaskDepLocked);
                        const isTaskToggleable = isPhaseSelected && effectiveOptional && !isTaskDepLocked;
                        const isTaskLocked = isPhaseSelected && (!effectiveOptional || isTaskDepLocked);

                        return (
                          <tr
                            key={taskIdx}
                            onClick={() => isTaskToggleable && toggleTask(phase.phase, taskIdx)}
                            className={`border-t border-zinc-100 dark:border-zinc-800 transition-colors ${
                              !isPhaseSelected
                                ? "opacity-40"
                                : isTaskLocked
                                  ? "bg-blue-50/30 dark:bg-blue-950/10"
                                  : isTaskActive
                                    ? "bg-blue-50/20 dark:bg-blue-950/10 cursor-pointer"
                                    : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                            }`}
                          >
                            <td className="p-2 sm:p-3 pl-4 sm:pl-6">
                              <IndeterminateCheckbox
                                checked={isTaskActive}
                                indeterminate={false}
                                disabled={!isTaskToggleable}
                                onChange={() => isTaskToggleable && toggleTask(phase.phase, taskIdx)}
                                onClick={(e) => e.stopPropagation()}
                                size="sm"
                              />
                            </td>
                            <td className="p-2 sm:p-3 pl-6 sm:pl-10 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm">
                              <span className="break-words">{task.name}</span>
                              <span className="flex flex-wrap items-center gap-1 mt-0.5">
                                {task.optional && !isTaskDepLocked && (
                                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                                    Optional
                                  </span>
                                )}
                                {isTaskDepLocked && (
                                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full">
                                    Req. by {[...lockedTasksBy.get(taskKey)!]
                                      .map((k) => taskLabels.get(k) ?? k)
                                      .join(", ")}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="p-2 sm:p-3 text-center text-xs text-zinc-400 dark:text-zinc-500 hidden sm:table-cell">
                              {task.size}
                            </td>
                            <td className="p-2 sm:p-3 text-right"></td>
                            <td className="hidden md:table-cell"></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
