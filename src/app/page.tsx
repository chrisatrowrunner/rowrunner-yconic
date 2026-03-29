import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="RowRunner"
          width={200}
          height={200}
          className="object-contain mx-auto"
          priority
        />
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        <span className="text-brand-400">Row</span>Runner
      </h1>
      <p className="text-xl text-slate-300 max-w-md mb-2">
        In-seat food ordering for live sporting events.
      </p>
      <p className="text-slate-400 max-w-sm mb-10">
        No lines. No missing the game. Scan the QR code at your seat to get started.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/order?venue=rifc&section=112&row=H&seat=14"
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
        >
          Try Demo Order
        </Link>
        <Link
          href="/runner/login"
          className="px-8 py-3 bg-stadium-medium hover:bg-stadium-light text-slate-200 font-semibold rounded-xl border border-brand-700/50 transition-colors"
        >
          Runner Login
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-400 mb-1">10.5%</div>
          <div className="text-sm text-slate-400">Fan-side service fee</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-400 mb-1">$0</div>
          <div className="text-sm text-slate-400">Cost to venues & vendors</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-400 mb-1">100%</div>
          <div className="text-sm text-slate-400">Tips go to runners</div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-slate-600">
        RowRunner &mdash; Yconic Hackathon 2026 &mdash; Christopher dos Reis
      </footer>
    </div>
  );
}
