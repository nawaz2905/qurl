"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/v1/signin" : "/api/v1/signup";
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Authentication failed");

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", email);
        router.push("/dashboard");
      } else {
        setIsLogin(true);
        setError("Account created! Please sign in.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-20 z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -ml-32 -mb-20 z-0" />

      <div className="max-w-md w-full animate-in fade-in zoom-in duration-700 relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="flex items-center gap-4 mb-10 group">
            <div className="w-10 h-7 bg-primary rounded-lg transform -skew-x-12 shadow-[0_8px_16px_rgba(242,106,27,0.3)] flex items-center justify-center transition-transform group-hover:scale-110">
               <div className="w-2 h-2 bg-white rounded-full opacity-40 animate-pulse" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-gray-900 group-hover:text-primary transition-colors">Qurl<span className="text-primary font-bold">.ai</span></span>
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm font-bold text-gray-400 opacity-60">
            {isLogin ? "Secure your links today." : "Join the AI-powered protection network."}
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[48px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 opacity-70">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-6 py-5 bg-white/80 border border-gray-100 rounded-[24px] text-base font-bold text-gray-800 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 opacity-70">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-6 py-5 bg-white/80 border border-gray-100 rounded-[24px] text-base font-bold text-gray-800 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`p-5 rounded-2xl text-xs font-bold border flex gap-3 items-start animate-in fade-in slide-in-from-top-2 ${
                error.includes("created") ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
              }`}>
                <span className="shrink-0">{error.includes("created") ? "Success" : "Warning"}</span>
                <span>{error}</span>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-5 bg-primary text-white text-sm font-black rounded-[24px] shadow-[0_12px_24px_-8px_rgba(242,106,27,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(242,106,27,0.5)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                 <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                 </div>
              ) : isLogin ? "Sign In to Workspace" : "Create My Account"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black text-gray-400 hover:text-primary transition-all uppercase tracking-[0.1em] px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group">
            <span className="group-hover:-translate-x-1 transition-transform">{"<-"}</span> Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}





