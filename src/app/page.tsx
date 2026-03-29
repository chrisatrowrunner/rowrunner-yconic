import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-500/20 mb-4">
          <svg
            className="w-10 h-10 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        <span className="text-brand-500">Row</span>Runner
      </h1>
      <p className="text-xl text-slate-400 max-w-md mb-2">
        In-seat food ordering for live sporting events.
      </p>
      <p className="text-slate-500 max-w-sm mb-10">
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
          className="px-8 py-3 bg-stadium-medium hover:bg-stadium-light text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          Runner Login
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-500 mb-1">10.5%</div>
          <div className="text-sm text-slate-500">Fan-side service fee</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-500 mb-1">$0</div>
          <div className="text-sm text-slate-500">Cost to venues & vendors</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-500 mb-1">100%</div>
          <div className="text-sm text-slate-500">Tips go to runners</div>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-slate-600">
        RowRunner &mdash; Yconic Hackathon 2026 &mdash; Christopher dos Reis
      </footer>
    </div>
  );
}
