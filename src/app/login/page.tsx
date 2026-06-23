import Image from "next/image";
import LoginForm from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 overflow-hidden">
      {/* Decorative shapes */}
      <img src="/shapes/star-blue.png" alt="" width={160} height={160} className="absolute top-[8%] right-[4%] opacity-10 pointer-events-none select-none" aria-hidden="true" />
      <img src="/shapes/hourglass-yellow.png" alt="" width={120} height={131} className="absolute bottom-[10%] left-[3%] opacity-10 pointer-events-none select-none" aria-hidden="true" />
      <img src="/shapes/pendulum.png" alt="" width={90} height={126} className="absolute top-[12%] left-[7%] opacity-[0.08] pointer-events-none select-none hidden sm:block" aria-hidden="true" />
      <img src="/shapes/mayan-blue.png" alt="" width={130} height={130} className="absolute bottom-[6%] right-[5%] opacity-[0.08] pointer-events-none select-none hidden sm:block" aria-hidden="true" />
      <img src="/shapes/clock-yellow.png" alt="" width={80} height={58} className="absolute top-[5%] left-[35%] opacity-[0.06] pointer-events-none select-none hidden sm:block" aria-hidden="true" />
      <img src="/shapes/dimensions.png" alt="" width={100} height={85} className="absolute bottom-[4%] left-[30%] opacity-[0.06] pointer-events-none select-none hidden sm:block" aria-hidden="true" />
      <img src="/shapes/star-red.png" alt="" width={70} height={70} className="absolute top-[40%] right-[3%] opacity-[0.06] pointer-events-none select-none hidden lg:block" aria-hidden="true" />
      <img src="/shapes/integration.png" alt="" width={80} height={80} className="absolute top-[45%] left-[3%] opacity-[0.06] pointer-events-none select-none hidden lg:block" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/chrono-logo.png"
            alt="Chrono Innovation"
            width={164}
            height={40}
            className="dark:brightness-0 dark:invert"
            priority
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 text-center mb-1">
            Sign in
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-6">
            Lucille — PO Management System
          </p>
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
