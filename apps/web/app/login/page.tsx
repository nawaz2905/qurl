"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type AuthMode = "signin" | "signup";

const featurePoints = [
  "Create protected short links in seconds.",
  "Track clean analytics without bot noise.",
  "Keep link traffic verified with AI fraud checks.",
];

const trustStats = [
  { value: "2M+", label: "Links screened daily" },
  { value: "99.9%", label: "Traffic filtering uptime" },
  { value: "10k+", label: "Teams protected" },
];

export function AuthScreen({ initialMode = "signin" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isLogin = mode === "signin";

  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length > 0;

  const resetFormState = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setMessage(null);
    setShowPassword(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/v1/signin" : "/api/v1/signup";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Authentication failed");
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("rememberSession", rememberMe ? "true" : "false");
        router.push("/dashboard");
        return;
      }

      resetFormState("signin");
      setMessage({ type: "success", text: "Account created. Sign in with the same email and password." });
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "Authentication failed";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(242,106,27,0.18),_transparent_34%),linear-gradient(135deg,_#fff8f2_0%,_#fffef9_45%,_#eef6ff_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="relative mx-auto grid h-full max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white/65 shadow-[0_30px_80px_-30px_rgba(20,20,20,0.25)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-between border-b border-black/5 px-5 py-5 sm:px-8 sm:py-6 lg:border-b-0 lg:border-r">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-sm font-black tracking-[0.25em] text-gray-900 uppercase">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-950 text-sm text-white shadow-[0_12px_30px_-16px_rgba(0,0,0,0.9)]">
                Q
              </span>
              Qurl AI
            </Link>

            <div className="mt-6 max-w-lg">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                Secure access flow
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-gray-950 sm:text-4xl lg:text-5xl">
                {isLogin ? "Sign in without the noise." : "Create an account that feels effortless."}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 sm:text-base">
                {isLogin
                  ? "Get back to your dashboard, protected links, and live fraud insights with a fast, focused sign-in flow."
                  : "Start with a lightweight sign-up experience that keeps the form simple, the guidance clear, and the next step obvious."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div key={stat.label} className="rounded-[24px] border border-black/5 bg-white/75 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.7)]">
                  <div className="text-xl font-black tracking-tight text-gray-950">{stat.value}</div>
                  <div className="mt-1 text-xs leading-5 text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-gray-950/5 bg-gray-950 px-5 py-5 text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] sm:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-200/80">What this page should do</p>
            <ul className="mt-4 space-y-3">
              {featurePoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-xs leading-5 text-white/78 sm:text-sm">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-black text-orange-200">
                    OK
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="mx-auto w-full max-w-lg rounded-[28px] border border-black/5 bg-white/88 p-5 shadow-[0_24px_70px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">Account access</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-gray-950 sm:text-3xl">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:text-sm">
                  {isLogin
                    ? "Enter your email and password to continue."
                    : "Use your email and a strong password to get started."}
                </p>
              </div>

              <div className="inline-flex rounded-full border border-black/5 bg-[#f6f2ee] p-1">
                <button
                  type="button"
                  onClick={() => resetFormState("signin")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    isLogin ? "bg-white text-gray-950 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => resetFormState("signup")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                    !isLogin ? "bg-white text-gray-950 shadow-sm" : "text-gray-500"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="rounded-[20px] border border-black/8 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-primary/30 hover:bg-primary/5 sm:text-sm"
              >
                Continue with Google
              </button>
            </div>

            <div className="my-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 sm:text-xs">
              <span className="h-px flex-1 bg-gray-200" />
              or use email
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-bold text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-[20px] border border-black/8 bg-[#fcfaf8] px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    minLength={8}
                    maxLength={20}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isLogin ? "Enter your password" : "Create a password"}
                    className="w-full rounded-[20px] border border-black/8 bg-[#fcfaf8] px-4 py-3 pr-18 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/10 sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 sm:px-3 sm:text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {isLogin && (
                <label className="flex items-center gap-3 rounded-[20px] border border-black/5 bg-[#faf7f4] px-4 py-2.5 text-xs text-gray-600 sm:text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-primary"
                  />
                  Keep me signed in on this device
                </label>
              )}

              {message && (
                <div
                  className={`rounded-[20px] border px-4 py-2.5 text-xs leading-5 sm:text-sm ${
                    message.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="flex w-full items-center justify-center rounded-[22px] bg-gray-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-45 sm:text-sm"
              >
                {loading ? "Processing..." : isLogin ? "Sign in" : "Create account"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs leading-5 text-gray-500 sm:text-sm">
              {isLogin ? "Need a new account?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => resetFormState(isLogin ? "signup" : "signin")}
                className="font-bold text-gray-950 underline decoration-primary/50 underline-offset-4"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>

            <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/6 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
              <Link href="/" className="transition hover:text-gray-950">
                Back to home
              </Link>
              <span>Privacy-first access</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <AuthScreen initialMode="signin" />;
}





