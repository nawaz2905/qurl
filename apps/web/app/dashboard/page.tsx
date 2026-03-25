"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";


const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${active
      ? "bg-[#df5b3e]/10 text-[#df5b3e] shadow-sm"
      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}>
    <div className={`w-5 h-5 ${active ? "text-[#df5b3e]" : "text-gray-400"}`}>{icon}</div>
    <span>{label}</span>
  </div>
);

const BottomNavItem = ({ icon, label, danger = false }: { icon: React.ReactNode; label: string; danger?: boolean }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 ${danger
    ? "text-red-400 hover:bg-red-50 hover:text-red-600"
    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
    }`}>
    <div className="w-5 h-5 opacity-70">{icon}</div>
    <span>{label}</span>
  </div>
);


const ResultCard = ({ title, value, subValue, type = "default", children }: {
  title: string;
  value?: string | number;
  subValue?: string;
  type?: "default" | "error" | "success" | "warning";
  children?: React.ReactNode;
}) => {
  const typeStyles = {
    default: "bg-white border-gray-100",
    error: "bg-red-50/50 border-red-100 text-red-700",
    success: "bg-green-50/50 border-green-100 text-green-700",
    warning: "bg-amber-50/50 border-amber-100 text-amber-700"
  };

  return (
    <div className={`p-6 rounded-2xl border ${typeStyles[type]} shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{title}</div>
      {value !== undefined && <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{value}</div>}
      {subValue && <div className="text-xs font-bold opacity-80">{subValue}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("My Links");

  const fetchLinks = useCallback(async (tokenToUse: string) => {
    setFetching(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/links", {
        headers: {
          "Authorization": `Bearer ${tokenToUse}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error("Failed to fetch links", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchLinks(savedToken);
    } else {
      setFetching(false);
    }
  }, [fetchLinks]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/v1/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ url: inputUrl })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to create link");

      setResult(data);
      setInputUrl("");
      fetchLinks(token); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setLinks([]);
    setResult(null);
    setShowForm(false);
  };

  if (!token && !fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-6">
        <div className="w-16 h-16 bg-[#df5b3e]/10 rounded-2xl flex items-center justify-center mb-6 text-[#df5b3e]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Access Denied</h2>
        <p className="text-gray-500 mb-8 font-bold text-center">Please log in to your account to access your dashboard.</p>
        <Link href="/" className="px-8 py-3 bg-[#df5b3e] text-white font-black rounded-xl shadow-lg shadow-[#df5b3e]/20 hover:scale-105 active:scale-95 transition-all">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fcfcfc] font-sans selection:bg-[#df5b3e]/20 text-left">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col bg-white shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 mb-6">
          <div className="w-7 h-5 bg-[#df5b3e] rounded-md transform -skew-x-12 shadow-lg shadow-[#df5b3e]/20" />
          <span className="font-black text-xl tracking-tight text-gray-900">Qurl<span className="text-gray-300 font-normal">.ai</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem active={activeTab === "My Links"} onClick={() => setActiveTab("My Links")} label="My Links" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
          {/* <NavItem active={activeTab === "Security"} onClick={() => setActiveTab("Security")} label="Security" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} /> */}
          <NavItem active={activeTab === "Analytics"} onClick={() => setActiveTab("Analytics")} label="Analytics" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
          {/* <NavItem active={activeTab === "API Access"} onClick={() => setActiveTab("API Access")} label="API Access" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} /> */}
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1 text-left">
          <BottomNavItem label="Upgrade Account" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
          <BottomNavItem label="Billing & Plan" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
          <div onClick={logout}><BottomNavItem danger label="Sign Out" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>} /></div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-50 bg-white/80 backdrop-blur-md flex items-center px-8 shrink-0 sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          {/* Top-Middle Search Bar */}
          <div className="flex-[2] max-w-xl mx-auto px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-[#df5c3e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search your links..."
                className="w-full pl-11 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold text-black focus:outline-none focus:ring-4 focus:ring-[#df5b3e]/5 focus:border-[#df5b3e]/20 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="w-10 h-10 rounded-xl bg-[#df5b3e]/10 flex items-center justify-center font-black text-[#df5b3e] border border-[#df5b3e]/20 cursor-pointer hover:bg-[#df5b3e]/20 transition-all">
              NS
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 flex flex-col bg-[#fcfcfc] overflow-y-auto">
          {activeTab === "My Links" ? (
            <div className="flex-1 flex flex-col">
              {/* Header Block */}
              <div className="px-10 py-10 flex justify-between items-center shrink-0 text-left">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My link</h1>
                  <p className="text-sm font-bold text-gray-400 opacity-60">Shorten, protect and analyze your digital assets.</p>
                </div>
                <button
                  onClick={() => { setShowForm(true); setResult(null); }}
                  className="px-6 py-3 bg-[#df5b3e]/10 flex items-center justify-center font-black text-[#df5b3e] border border-[#df5b3e]/20 cursor-pointer hover:bg-[#df5b3e]/20 transition-all gap-3 active:scale-95 rounded-2xl"
                  /*  bg-[#df5b3e]/10 flex items-center justify-center font-black text-[#df5b3e] border border-[#df5b3e]/20 cursor-pointer hover:bg-[#df5b3e]/20 transition-all
                  bg-[#df5b3e] border-2 border-gray-900 text-gray-900 text-sm font-black rounded-xl hover:bg-gray-50 transition-all flex items-center
                  */
                >
                  + new links
                </button>
              </div>

              {/* Main Area Wrapper */}
              <div className="flex-1 px-10 pb-10 flex flex-col min-h-0 text-left relative">
                {!showForm && !result && links.length === 0 && !fetching ? (
                  
                  <div className="w-full flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center mb-8 border border-gray-100">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">No Links Found</h3>
                    <p className="text-sm text-gray-400 mb-10 leading-relaxed font-bold max-w-sm">Start protecting your traffic by creating your first secure short link.</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-10 py-4 bg-white border-2 border-gray-900 text-gray-900 text-sm font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                    >
                      Add link
                    </button>
                  </div>
                ) : showForm && !result ? (
                 
                  <div className="w-full flex-1 flex flex-col items-center justify-start p-10 px-20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="max-w-xl w-full flex flex-col items-center bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl shadow-black/5">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-8 border border-gray-100">
                        <span className="text-3xl text-gray-300 font-black">+</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tight text-center">New Secure Link</h3>
                      <form onSubmit={handleShorten} className="w-full space-y-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Target URL</label>
                          <input
                            type="url"
                            required
                            autoFocus
                            placeholder="url"
                            className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl text-base font-bold text-black focus:outline-none focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900/20 transition-all font-mono"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-6 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-10 py-4 bg-white border-2 border-gray-900 text-gray-900 text-sm font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                          >
                            cancel
                          </button>
                          <button
                            disabled={loading}
                            className="flex-1 py-4 bg-gray-900 text-white text-sm font-black rounded-2xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-black/20"
                          >
                            {loading ? "short and protect..." : "short and protect"}
                          </button>
                        </div>
                      </form>
                      {error && <div className="mt-8 p-4 bg-red-50 text-red-500 text-xs font-black rounded-xl border border-red-100 italic">⚠️ {error}</div>}
                    </div>
                  </div>
                ) : result ? (
                  /* Success View */
                  <div className="w-full flex flex-col p-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left">
                    <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="text-left font-bold">
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Link Protected</h3>
                          <p className="text-xs text-gray-400">Analysis completed successfully.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowForm(false); setResult(null); setInputUrl(""); }}
                        className="px-5 py-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Back to history
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <ResultCard
                        title="Fraud Score"
                        value={result.fraudScore}
                        subValue={result.fraudScore > 50 ? "⚠️ High Threat Risk" : "✅ Safe Traffic"}
                        type={result.fraudScore > 50 ? "error" : result.fraudScore > 20 ? "warning" : "success"}
                      />
                      <ResultCard title="Short Identity" value={result.shortCode}>
                        <button
                          onClick={() => navigator.clipboard.writeText(result.shortlink)}
                          className="w-full py-3 bg-white border border-gray-100 text-gray-900 text-xs font-black rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                        >
                          Copy Link
                        </button>
                      </ResultCard>
                      <ResultCard title="Redirection">
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="text-xs font-bold text-gray-500 line-clamp-1 break-all flex items-center gap-2">
                            <span className="opacity-40">Targeting:</span> {result.originalUrl}
                          </div>
                          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                            <span className="opacity-40">Cached in:</span> Redis
                          </div>
                        </div>
                      </ResultCard>
                      <ResultCard title="Hit Count" value={result.clicks} subValue="Real-time tracking" />
                    </div>

                    {/* Single Big Reasons Card */}
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-left w-full">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 px-2">Reasons</div>
                      <div className="space-y-4">
                        {result.fraudInfo?.reasons?.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            {result.fraudInfo.reasons.map((reason: string, i: number) => (
                              <div key={i} className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <span className="text-amber-500 text-bold ">.</span>
                                <span className="text-base font-black text-gray-900 leading-tight">{reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-sm font-bold text-gray-400 italic">This URL passed all AI and rule-based security checks.</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Default fallback if on My Links but no state matches */
                  <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">
                    No active link session. Use "new links" to start.
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "Analytics" ? (
            <div className="flex-1 flex flex-col">
              {/* Analytics Header */}
              <div className="px-10 py-10 text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Analytics</h1>
                <p className="text-sm font-bold text-gray-400 opacity-60">Track your link performance and security insights.</p>
              </div>

              {/* Link List View */}
              <div className="flex-1 px-10 pb-10 overflow-x-auto  ">
                <div className="bg-orange-100 transition-all border border-gray-100 rounded-[32px] overflow-hidden shadow-sm animate-in fade-in duration-500">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Link</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Short Code</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Safety</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hits</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold">
                      {links.map((link) => (
                        <tr key={link.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-5 min-w-[200px]">
                            <div className="text-sm text-gray-900 truncate max-w-xs">{link.originalUrl}</div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#df5b3e] font-mono">{link.shortCode}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(`http://localhost:5000/${link.shortCode}`)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 bg-gray-100 rounded-lg hover:bg-[#df5b3e]/10 hover:text-[#df5b3e] transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" /></svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tight ${link.fraudScore > 50 ? 'bg-red-50 text-red-500' :
                              link.fraudScore > 20 ? 'bg-amber-50 text-amber-500' :
                                'bg-green-50 text-green-500'
                              }`}>
                              {link.fraudScore}% {link.fraudScore > 50 ? 'RISK' : 'SAFE'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-sm text-gray-500">{link.clicks || 0}</span>
                          </td>
                          <td className="px-8 py-5 text-right text-xs text-gray-400">
                            {new Date(link.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fetching && (
                    <div className="flex justify-center p-12">
                      <div className="w-6 h-6 border-2 border-[#df5b3e]/20 border-t-[#df5b3e] rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination Footer */}
              <footer className="h-16 border-t border-gray-50 bg-white shadow-sm flex items-center justify-between px-10 shrink-0">
                <div className="text-[10px] font-black text-black uppercase tracking-widest">
                  Navigation • Page 1 of {Math.ceil(links.length / 10) || 1}
                </div>
                <div className="flex gap-3">
                  <button disabled className="px-5 py-2 text-[10px] font-black text-black border border-gray-100 rounded-xl uppercase tracking-widest disabled:opacity-50">
                    Previous
                  </button>
                  <button disabled={links.length <= 10} className="px-5 py-2 text-[10px] font-black text-gray-300 border border-gray-100 rounded-xl uppercase tracking-widest disabled:opacity-50">
                    Next
                  </button>
                </div>
              </footer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 font-bold">
              Tab "{activeTab}" under construction.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
