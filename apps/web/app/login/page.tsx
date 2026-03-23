"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Authentication failed");

      if (isLogin) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setIsLogin(true);
        setError("Account created! Please sign in.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-8 h-6 bg-[#df5b3e] rounded-md transform -skew-x-12 shadow-lg" />
            <span className="font-black text-2xl tracking-tight text-gray-900">Qurl<span className="text-gray-300 font-normal">.ai</span></span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-sm font-bold text-gray-400">
            {isLogin ? "Secure your links today." : "Join the AI-powered protection network."}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-[32px] p-10 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#df5b3e]/5 focus:border-[#df5b3e]/20 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#df5b3e]/5 focus:border-[#df5b3e]/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-xs font-black italic border ${
                error.includes("created") ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-500 border-red-100"
              }`}>
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-4 bg-[#df5b3e] text-white text-sm font-black rounded-2xl hover:bg-[#c84d34] transition-all active:scale-[0.98] shadow-lg shadow-[#df5b3e]/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black text-gray-400 hover:text-[#df5b3e] transition-colors uppercase tracking-widest"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-xs font-bold text-gray-300 hover:text-gray-500 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
