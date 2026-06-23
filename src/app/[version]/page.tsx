import Image from "next/image";
import { notFound } from "next/navigation";
import { parsePhases, discoverEstimates } from "@/lib/parse-phases";
import { parseAssumptions } from "@/lib/parse-assumptions";
import { logoutAction } from "@/lib/auth-actions";
import PhaseSelector from "@/components/phase-selector";
import AssumptionsPanel from "@/components/assumptions-panel";
import EstimateTabsNav from "@/components/estimate-tabs";

export function generateStaticParams() {
  return discoverEstimates().map((e) => ({ version: e.label }));
}

export default async function VersionPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const estimates = discoverEstimates();
  const current = estimates.find((e) => e.label === version);
  if (!current) notFound();

  const phases = parsePhases(current.file);
  const assumptions = parseAssumptions(current.file);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* Nav bar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Image
            src="/chrono-logo.png"
            alt="Chrono Innovation"
            width={132}
            height={32}
            className="dark:brightness-0 dark:invert"
            priority
          />
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Hero section */}
      <header className="relative bg-gradient-to-b from-zinc-900 to-zinc-800 dark:from-zinc-900 dark:to-zinc-950 text-white overflow-hidden">
        {/* Decorative shapes */}
        <img src="/shapes/star-blue.png" alt="" width={140} height={140} className="absolute top-4 right-[6%] opacity-15 pointer-events-none select-none hidden sm:block" aria-hidden="true" />
        <img src="/shapes/pendulum.png" alt="" width={100} height={140} className="absolute bottom-2 right-[22%] opacity-10 pointer-events-none select-none hidden sm:block" aria-hidden="true" />
        <img src="/shapes/hourglass-yellow.png" alt="" width={90} height={98} className="absolute top-8 left-[4%] opacity-10 pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <img src="/shapes/mayan-blue.png" alt="" width={120} height={120} className="absolute -bottom-8 left-[12%] opacity-10 pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <img src="/shapes/clock-yellow.png" alt="" width={70} height={51} className="absolute top-1/2 right-[3%] opacity-10 pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <img src="/shapes/star-red.png" alt="" width={60} height={60} className="absolute bottom-6 left-[35%] opacity-[0.07] pointer-events-none select-none hidden sm:block" aria-hidden="true" />
        <img src="/shapes/dimensions.png" alt="" width={80} height={68} className="absolute top-4 left-[40%] opacity-[0.06] pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <p className="text-sm sm:text-base font-medium text-blue-400 mb-3">
            Lucille — PO Management System
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Internal Quote — Estimate Calculator
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Select phases to calculate total project effort. PM (20%) and QA
            (15%) are applied automatically.
          </p>
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 leading-relaxed max-w-3xl">
            This is a <strong className="text-zinc-200">high-level estimate</strong> for
            the <strong className="text-zinc-200">Purchase Order Management System</strong> phase,
            covering required and optional scope items across 8 areas.
            Optional items (⭐) can be deferred.
            An official quote will follow once the scope has been agreed upon.
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-hidden">
        <img src="/shapes/integration.png" alt="" width={90} height={90} className="absolute top-12 right-0 opacity-[0.06] pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <img src="/shapes/star-blue.png" alt="" width={70} height={70} className="absolute top-[40%] left-0 opacity-[0.06] pointer-events-none select-none hidden lg:block" aria-hidden="true" />
        <img src="/shapes/clock-yellow.png" alt="" width={60} height={44} className="absolute bottom-[30%] right-0 opacity-[0.05] pointer-events-none select-none hidden xl:block" aria-hidden="true" />
        <img src="/shapes/pendulum.png" alt="" width={50} height={70} className="absolute bottom-[10%] left-0 opacity-[0.05] pointer-events-none select-none hidden xl:block" aria-hidden="true" />
        <EstimateTabsNav versions={estimates} active={current.label} />
        <PhaseSelector key={current.label} phases={phases} />
        <AssumptionsPanel groups={assumptions} />
      </main>
    </div>
  );
}
