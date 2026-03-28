"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <div
    onClick={onClick}
    className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 cursor-pointer relative ${active
      ? "bg-primary/10 text-primary shadow-[0_10px_20px_-5px_rgba(242,106,27,0.15)] translate-x-1"
      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
      }`}>
    <div className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${active ? "text-primary" : "text-gray-400 opacity-70"}`}>{icon}</div>
    <span className="relative z-10">{label}</span>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full -ml-[1px]" />}
  </div>
);

const BottomNavItem = ({ icon, label, danger = false }: { icon: React.ReactNode; label: string; danger?: boolean }) => (
  <div className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-300 ${danger
    ? "text-red-400 hover:bg-red-50 hover:text-red-600 hover:translate-x-1"
    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
    }`}>
    <div className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>
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
  const shadowStyles = {
    default: "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border-transparent",
    error: "hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.15)] border-red-100",
    success: "hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.15)] border-green-100",
    warning: "hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)] border-amber-100"
  };

  const bgStyles = {
    default: "bg-white",
    error: "bg-red-50/30",
    success: "bg-green-50/30",
    warning: "bg-amber-50/30"
  };

  return (
    <div className={`p-8 rounded-[32px] border ${bgStyles[type]} ${shadowStyles[type]} shadow-sm transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4`}>
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 opacity-70">{title}</div>
      {value !== undefined && <div className="text-4xl font-black text-gray-900 mb-1.5 tracking-tighter">{value}</div>}
      {subValue && <div className={`text-xs font-bold ${type === 'error' ? 'text-red-600' : type === 'warning' ? 'text-amber-600' : type === 'success' ? 'text-green-600' : 'text-gray-500'}`}>{subValue}</div>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<any[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Analytics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const getInitials = (email: string | null) => {
    if (!email) return "??";
    const part = email.split('@')[0];
    if (!part) return "??";
    return part.slice(0, 2).toUpperCase();
  };

  const handleNavItemClick = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Sync state with localStorage
  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) setActiveTab(savedActiveTab);

    const savedResult = localStorage.getItem("result");
    if (savedResult) {
      try {
        setResult(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to parse saved result", e);
        localStorage.removeItem("result");
      }
    }

    const savedShowForm = localStorage.getItem("showForm");
    if (savedShowForm === "true") setShowForm(true);

    const savedUserEmail = localStorage.getItem("userEmail");
    if (savedUserEmail) setUserEmail(savedUserEmail);

    // Initial sidebar state based on screen width
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab) localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("result", JSON.stringify(result));
    } else {
      localStorage.removeItem("result");
    }
  }, [result]);

  useEffect(() => {
    localStorage.setItem("showForm", showForm.toString());
  }, [showForm]);

  const fetchLinks = useCallback(async (tokenToUse: string) => {
    setFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/links`, {
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
      const response = await fetch(`${API_BASE_URL}/api/v1/link`, {
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

  const handleDelete = async (id: string) => {
    if (!token) return;

    setFetching(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/link/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to delete link");

      // Immediate UI update for instant feedback
      setLinks((current) => current.filter((link) => link.id !== id));
      setResult(null);

      // ensure we have fresh data (optional)
      await fetchLinks(token);
    } catch (err: any) {
      console.error("Delete link failed", err);
      setError(err.message || "Failed to delete link");
    } finally {
      setFetching(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeTab");
    localStorage.removeItem("result");
    localStorage.removeItem("showForm");
    localStorage.removeItem("userEmail");
    router.push("/login");
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
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#fcfcfc] font-sans selection:bg-primary/20 text-left">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 border-r border-border-custom flex flex-col bg-white overflow-hidden shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 md:z-20 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-72 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-none"
      }`}>
        <div className="p-8 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-6 bg-primary rounded-lg transform -skew-x-12 shadow-[0_8px_16px_rgba(242,106,27,0.25)] flex items-center justify-center">
               <div className="w-2 h-2 bg-white rounded-full opacity-40 animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tight text-gray-900">Qurl<span className="text-primary font-bold">.ai</span></span>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem active={activeTab === "Analytics"} onClick={() => handleNavItemClick("Analytics")} label="Analytics" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
          <NavItem active={activeTab === "My Links"} onClick={() => handleNavItemClick("My Links")} label="My Links" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} />
        </nav>

        <div className="p-6 border-t border-gray-50 space-y-1 text-left">
          <BottomNavItem label="Upgrade Account" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>} />
          <BottomNavItem label="Billing & Plan" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
          <div onClick={logout}><BottomNavItem danger label="Sign Out" icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>} /></div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] relative">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -mr-40 -mt-40 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -ml-32 -mb-32 z-0" />

        {/* Top Navbar */}
        <header className="h-20 border-b border-border-custom bg-white/70 backdrop-blur-xl flex items-center px-10 shrink-0 sticky top-0 z-30 transition-all duration-300">
          <div className="flex-1 flex items-center gap-4">
            <div className="md:block">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-400 hover:text-gray-900 transition-all bg-gray-50 hover:bg-gray-100 p-2.5 rounded-xl shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>
          </div>

          {/* Top-Middle Search Bar */}
          <div className="flex-[2] max-w-2xl mx-auto px-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                placeholder="Search your links..."
                className="w-full pl-12 pr-6 py-3.5 bg-gray-50/80 border border-transparent rounded-[20px] text-sm font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all placeholder:text-gray-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
              />
            </div>
          </div>

          {/* Right-Side Navigation / Profile */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Free Plan</span>
              <span className="text-xs font-bold text-gray-900 tracking-tighter truncate max-w-[120px]">{userEmail?.split('@')[0] || "Guest"} Workspace</span>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm relative group cursor-pointer">
               <span className="text-sm font-black text-primary uppercase">{getInitials(userEmail)}</span>
               {/* Tooltip on hover */}
               <div className="absolute top-full right-0 mt-3 p-3 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[200px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated as</p>
                  <p className="text-xs font-bold text-gray-900 truncate">{userEmail}</p>
               </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto relative z-10">
          {activeTab === "Analytics" ? (
            <div className="flex-1 flex flex-col">
              {/* Header Block */}
              <div className="px-10 py-12 flex justify-between items-center shrink-0 text-left z-10">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Analytics</h1>
                  <p className="text-sm font-bold text-gray-400 opacity-60">Shorten, protect and analyze your digital assets.</p>
                </div>
                <button
                  onClick={() => { setShowForm(true); setResult(null); }}
                  className="px-8 py-3.5 bg-primary text-white flex items-center justify-center font-black text-sm rounded-2xl shadow-[0_12px_24px_-8px_rgba(242,106,27,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(242,106,27,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all gap-3 border border-primary/20"
                >
                  <span className="text-xl">+</span>
                  new link
                </button>
              </div>

              {/* Main Area Wrapper */}
              <div className="flex-1 px-10 pb-10 flex flex-col min-h-0 text-left relative">
                {!showForm && !result && links.length === 0 && !fetching ? (
                  
                  <div className="w-full flex-1 flex flex-col items-center justify-center p-20 text-center animate-in fade-in zoom-in duration-700 z-10">
                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 flex items-center justify-center mb-10 relative">
                       <div className="absolute inset-0 bg-primary/5 rounded-[32px] animate-ping opacity-20" />
                      <svg className="w-10 h-10 text-primary opacity-40 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">No Links Generated</h3>
                    <p className="text-sm text-gray-400 mb-12 leading-relaxed font-bold max-w-sm opacity-70">Start protecting your traffic by creating your first secure short link in the cloud.</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-10 py-4 bg-white border border-gray-100 text-primary text-sm font-black rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm hover:shadow-md"
                    >
                      Initialize Link
                    </button>
                  </div>
                ) : showForm && !result ? (
                 
                  <div className="w-full flex-1 flex flex-col items-center justify-center p-10 animate-in fade-in slide-in-from-top-8 duration-700 z-10">
                    <div className="max-w-xl w-full flex flex-col items-center bg-white/60 backdrop-blur-xl p-12 rounded-[40px] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl opacity-30" />
                      
                      <h3 className="text-3xl font-black text-gray-900 mb-1 tracking-tighter text-center">New Secure Link</h3>
                      <p className="text-sm font-bold text-gray-400 mb-10 opacity-60 text-center">AI-powered link protection network.</p>
                      
                      <form onSubmit={handleShorten} className="w-full space-y-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 opacity-70">Target Destination</label>
                          <input
                            type="url"
                            required
                            autoFocus
                            placeholder="https://example.com/..."
                            className="w-full px-6 py-4.5 bg-white/80 border border-gray-100 rounded-[20px] text-base font-bold text-gray-800 focus:outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm"
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-8 py-4 bg-white text-gray-500 text-sm font-black rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 border border-gray-100"
                          >
                            Cancel
                          </button>
                          <button
                            disabled={loading}
                            className="flex-1 py-4 bg-primary text-white text-sm font-black rounded-xl shadow-[0_12px_24px_-8px_rgba(242,106,27,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(242,106,27,0.5)] transition-all active:scale-95"
                          >
                            {loading ? "Protecting..." : "Protect Link"}
                          </button>
                        </div>
                      </form>
                      {error && (
                         <div className="mt-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 italic">
                            ⚠️ {error}
                         </div>
                      )}
                    </div>
                  </div>
                ) : result ? (
                  /* Success View */
                  <div className="w-full flex-1 flex flex-col p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-left z-10">
                    <div className="flex justify-between items-end mb-12 pb-8 border-b border-gray-100/50">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-500 text-white rounded-[24px] flex items-center justify-center shadow-[0_12px_24px_-8px_rgba(34,197,94,0.5)]">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <div className="text-left">
                          <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">Link Protected</h3>
                          <p className="text-sm font-bold text-gray-400 opacity-60">Real-time analysis completed successfully.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowForm(false); setResult(null); setInputUrl(""); }}
                        className="px-6 py-3 bg-white text-gray-500 hover:text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm hover:shadow-md border border-gray-100 active:scale-95"
                      >
                        Back to history
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                      <ResultCard
                        title="Fraud Score"
                        value={result.fraudScore}
                        subValue={result.fraudScore > 50 ? "⚠️ High Threat Risk" : "✅ Safe Traffic"}
                        type={result.fraudScore > 50 ? "error" : result.fraudScore > 20 ? "warning" : "success"}
                      />
                      <ResultCard title="Short Identity" value={result.shortCode}>
                        <button
                          onClick={() => {
                             navigator.clipboard.writeText(result.shortlink);
                             // Optional: Toast notification would be nice here
                          }}
                          className="w-full py-4 bg-primary text-white text-xs font-black rounded-2xl hover:bg-primary-dark transition-all active:scale-95 shadow-[0_8px_16px_rgba(242,106,27,0.2)] hover:shadow-[0_12px_24px_rgba(242,106,27,0.3)]"
                        >
                          Copy link
                        </button>
                      </ResultCard>
                      <ResultCard title="Target Destination">
                        <div className="flex flex-col gap-2 mt-1">
                          <div className="text-xs font-bold text-gray-800 line-clamp-1 break-all bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                             {result.originalUrl}
                          </div>
                          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            Secure Route Active
                          </div>
                        </div>
                      </ResultCard>
                      <ResultCard title="Global Reach" value={result.clicks} subValue="Real-time hits" />
                    </div>

                    {/* Single Big Reasons Card */}
                    <div className="bg-white/40 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)] text-left w-full transition-all hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-between mb-8">
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-70">Security Insights & Reasons</div>
                         <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">Analysis Engine v1.0</div>
                      </div>
                      <div className="space-y-4">
                        {result.fraudInfo?.reasons?.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-5">
                            {result.fraudInfo.reasons.map((reason: string, i: number) => (
                              <div key={i} className="group flex gap-5 items-center p-5 bg-white/60 rounded-[28px] border border-gray-100 hover:border-primary/20 hover:bg-white transition-all duration-300">
                                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
                                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <span className="text-sm font-bold text-gray-800 leading-snug">{reason}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div className="text-base font-black text-gray-900">Link Fully Protected</div>
                            <div className="text-sm font-bold text-gray-400 mt-1 italic">This URL passed all AI and rule-based security checks.</div>
                          </div>
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
          ) : activeTab === "My Links" ? (
            <div className="flex-1 flex flex-col min-h-full">
               {/* My Links Header */}
              <div className="px-10 py-10 text-left">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Links</h1>
                <p className="text-sm font-bold text-gray-400 opacity-60">Track your link performance and security insights.</p>
              </div>

              {/* Link List View */}
              <div className="flex-1 px-10 pb-10 overflow-x-auto z-10">
                <div className="bg-white/40 backdrop-blur-md border border-white rounded-[40px] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)] animate-in fade-in duration-700">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100/50">
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Link</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Short Code</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Hits</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Created</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50 font-bold">
                      {links.map((link) => (
                        <tr key={link.id} className="hover:bg-white transition-all duration-300 group">
                          <td className="px-10 py-6 min-w-[240px]">
                            <div className="text-sm text-gray-900 truncate max-w-xs">{link.originalUrl}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">{link.shortCode}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(`${API_BASE_URL}/${link.shortCode}`)}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-gray-50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" /></svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${link.fraudScore > 50 ? 'bg-red-50 text-red-600 border-red-100' :
                              link.fraudScore > 20 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-green-50 text-green-600 border-green-100'
                              }`}>
                              {link.fraudScore}% {link.fraudScore > 50 ? 'RISK' : 'SAFE'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-50 text-gray-500 font-black text-xs border border-gray-100">
                               {link.clicks || 0}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right text-xs text-gray-400 font-bold">
                            {new Date(link.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="px-4 py-2 text-xs font-black text-red-500 bg-red-50/50 border border-transparent hover:border-red-200 hover:bg-red-50 hover:text-red-700 rounded-2xl transition-all duration-300 opacity-60 group-hover:opacity-100"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fetching && (
                    <div className="flex justify-center p-20 bg-white/40">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_20px_rgba(242,106,27,0.2)]" />
                    </div>
                  )}
                  {links.length === 0 && !fetching && (
                     <div className="py-24 text-center">
                        <div className="text-gray-400 font-bold italic">No links available in your workspace yet.</div>
                     </div>
                  )}
                </div>
              </div>

              {/* Pagination Footer */}
              <footer className="h-20 border-t border-border-custom bg-white/70 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-80">
                  Dashboard Intelligence • Page 1 of {Math.ceil(links.length / 10) || 1}
                </div>
                <div className="flex gap-4">
                  <button disabled className="px-6 py-2.5 text-[10px] font-black text-gray-400 border border-gray-100 rounded-2xl uppercase tracking-widest disabled:opacity-30 transition-all">
                    Previous
                  </button>
                  <button disabled={links.length <= 10} className="px-6 py-2.5 text-[10px] font-black text-gray-800 bg-white border border-gray-100 rounded-2xl uppercase tracking-widest hover:border-primary/30 hover:text-primary disabled:opacity-30 transition-all shadow-sm">
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
