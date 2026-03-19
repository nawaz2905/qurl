import Link from "next/link";

const SidebarItem = ({ icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
    active 
      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
      : "text-gray-500 hover:bg-orange-50 hover:text-primary"
  }`}>
    <div className="w-5 h-5">{icon}</div>
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) => (
  <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</div>
    <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
    <div className={`text-xs font-bold flex items-center gap-1 ${positive ? "text-green-500" : "text-red-500"}`}>
      <span>{positive ? "↑" : "↓"}</span>
      <span>{change} vs last month</span>
    </div>
  </div>
);

export default function Dashboard() {
  const bars = [40, 60, 45, 90, 70, 85, 55, 75, 40, 95, 65, 80, 50, 70];

  return (
    <div className="flex min-h-screen bg-orange-50/30">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-orange-100 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-primary rounded-xl rotate-12" />
          <span className="font-black text-xl tracking-tight text-gray-900">SecureLink</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem 
            active 
            label="Dashboard" 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
          />
          <SidebarItem 
            label="My Links" 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} 
          />
          <SidebarItem 
            label="Analytics" 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} 
          />
          <SidebarItem 
            label="Security" 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} 
          />
          <SidebarItem 
            label="Settings" 
            icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>} 
          />
        </nav>

        <div className="pt-8 border-t border-orange-50">
          <Link href="/" className="text-gray-400 hover:text-primary text-sm font-bold flex items-center gap-2 transition-colors">
            <span>←</span> Back to site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Overview</h1>
            <p className="text-gray-500 font-medium">Monitoring activity across all your protected links.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20 active:scale-95">
              + Create Link
            </button>
            <div className="w-12 h-12 rounded-2xl bg-white border border-orange-100 flex items-center justify-center font-black text-gray-900 shadow-sm hover:border-primary transition-colors cursor-pointer">
              NS
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Clicks" value="1,243,902" change="14.2%" positive={true} />
          <StatCard label="Threats Blocked" value="12,432" change="2.5%" positive={true} />
          <StatCard label="Active Links" value="1,542" change="0.8%" positive={false} />
          <StatCard label="Traffic Health" value="99.9%" change="0.1%" positive={true} />
        </section>

        {/* Charts and Alerts */}
        <div className="grid lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2 bg-white p-10 rounded-[32px] border border-orange-100 shadow-sm">
            <div className="text-xl font-bold text-gray-900 mb-10">Traffic Volume (24h)</div>
            <div className="flex items-end gap-3 h-[300px] mb-6">
              {bars.map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-t-xl transition-all duration-500 hover:bg-primary ${i % 3 === 0 ? 'bg-orange-100' : 'bg-orange-50/50'}`} 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
            <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:59</span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[32px] border border-orange-100 shadow-sm flex flex-col">
            <div className="text-xl font-bold text-gray-900 mb-8">Security Alerts</div>
            <div className="flex-1 space-y-4">
              {[
                { type: "Suspicious Bot", domain: "google.co", time: "2m ago", severity: "HIGH" },
                { type: "Phishing Attempt", domain: "amazon.secure", time: "14m ago", severity: "HIGH" },
                { type: "SQL Injection", domain: "qurl.it", time: "1h ago", severity: "MED" },
                { type: "Brute Force", domain: "api.qurl.it", time: "3h ago", severity: "HIGH" },
              ].map((threat, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-orange-50/30 rounded-2xl border border-orange-100 hover:border-primary/20 transition-colors">
                  <div className="text-left">
                    <h4 className="font-bold text-gray-900 text-sm">{threat.type}</h4>
                    <p className="text-xs text-gray-500">{threat.domain} • {threat.time}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                    threat.severity === "HIGH" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {threat.severity}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-light transition-all active:scale-95 shadow-lg shadow-primary/20">
              View Security Log
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
