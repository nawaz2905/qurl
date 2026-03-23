import Link from "next/link";

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const baseClasses = `w-6 h-6 ${className || ""}`;
  switch (name) {
    case 'bot': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4M8 16v2M16 16v2" /></svg>;
    case 'shield': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'chart': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
    case 'globe': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case 'link': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
    case 'api': return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClasses}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>;
    default: return null;
  }
};

const FeatureCard = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <div className="group p-8 bg-white rounded-3xl border border-gray-100 hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
    <div className="w-12 h-12 mb-6 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
      <Icon name={icon} />
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-500 leading-relaxed leading-7">{text}</p>
  </div>
);

export default function Home() {


  return (
    <div className="flex flex-col items-center w-full min-h-screen selection:bg-primary selection:text-white grid-background">

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl h-16 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 rounded-2xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-xl rotate-12 group-hover:rotate-0 transition-transform shadow-lg shadow-primary/20" />
          <span className="font-black text-xl tracking-tight text-gray-900">Qurl<span className="text-gray-400 font-normal"> AI</span></span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Features</a>
          <a href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Security</a>
          <a href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Enterprise</a>
          <a href="#" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors">Log In</Link>
          <Link href="/login" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-light hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center text-center pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">

          <div
            className="absolute top-0 left-[-50%] w-[200%] h-full bg-linear-to-r from-transparent via-primary/5 to-transparent -skew-x-12 blur-[100px] animate-pulse"
            style={{ animationDuration: '8s' }}
          />
        </div>

        {/* Hero Content */}
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 border border-orange-100 rounded-full mb-10 text-sm font-bold text-primary animate-bounce-slow">
            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
            Analyzing 2M+ links daily
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] text-gray-900 mb-8">
            Shorten Links. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-400">Block Fraud.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12">
            The intelligent URL shortener that uses AI to detect and block bots, phishing
            attempts, and fraudulent traffic before they reach your destination.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-primary-light hover:-translate-y-1 transition-all shadow-xl shadow-primary/30 active:scale-[0.98]">
              Shorten & Protect
            </Link>
            <button className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]">
              View Video Demo
            </button>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="w-full max-w-5xl mt-24 relative px-4 group">
          <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-2xl overflow-hidden ring-1 ring-black/5">
            <div className="flex gap-2 p-6 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="p-8 md:p-12 grid md:grid-cols-3 gap-8 bg-gray-50/50">
              <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="font-bold text-lg mb-8">Traffic Overview</h4>
                <div className="flex items-end gap-3 h-64">
                  {[40, 65, 50, 95, 60, 85, 45, 75, 55, 100, 65].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-lg transition-all duration-1000 ${h > 90 ? 'bg-primary' : 'bg-orange-100'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-lg shadow-red-500/5 text-left">
                  <h5 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Threat Detected</h5>
                  <p className="text-2xl font-black text-gray-900">Bot Attack Blocked</p>
                  <p className="text-sm text-gray-500 mt-2">1,240 attempts from 64 unique IPs</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-lg shadow-green-500/5 text-left">
                  <h5 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Protection Health</h5>
                  <p className="text-2xl font-black text-gray-900">99.9% Reliable</p>
                  <p className="text-sm text-gray-500 mt-2">Real-time AI verification active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 py-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        <FeatureCard
          icon="bot"
          title="AI Bot Detection"
          text="Automatically identify and block non-human traffic from scraping your content or inflating metrics."
        />
        <FeatureCard
          icon="shield"
          title="Phishing Prevention"
          text="Real-time scanning prevents your domains from being used for malicious redirection attacks."
        />
        <FeatureCard
          icon="chart"
          title="Clean Analytics"
          text="Get true click data. We filter out scammers, crawlers, and bots so you see real engagement."
        />
        <FeatureCard
          icon="globe"
          title="Geo-Fencing"
          text="Restrict access to your links based on country or region to prevent unauthorized global traffic."
        />
        <FeatureCard
          icon="link"
          title="Custom Domains"
          text="Use your own branded domain while leveraging our powerful protection infrastructure."
        />
        <FeatureCard
          icon="api"
          title="Developer API"
          text="Integrate fraud-resistant link generation directly into your own applications with our REST API."
        />
      </section>

      {/* CTA Section */}
      <section className="w-[92%] max-w-7xl relative mx-auto my-20 p-12 md:p-24 bg-orange-50 rounded-[48px] overflow-hidden flex flex-col lg:flex-row items-center gap-16 border border-orange-100 shadow-xl shadow-orange-500/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/10 via-transparent to-transparent opacity-50 blur-[100px]" />

        <div className="relative z-10 flex-1 text-center lg:text-left">
          <h2 className="text-4xl md:text-6xl font-black leading-tight mb-8 text-gray-900">Ready to secure your traffic?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 font-medium">Join 10,000+ marketers and developers who trust SecureLink to protect their digital assets.</p>
          <ul className="space-y-4 mb-12 inline-block text-left">
            <li className="flex items-center gap-4 text-gray-700 font-bold">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</span>
              99.99% Enterprise Uptime SLA
            </li>
            <li className="flex items-center gap-4 text-gray-700 font-bold">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</span>
              GDPR & CCPA Compliant Infrastructure
            </li>
            <li className="flex items-center gap-4 text-gray-700 font-bold">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">✓</span>
              24/7 Priority Engineering Support
            </li>
          </ul>
          <div className="flex justify-center lg:justify-start">
            <button className="px-12 py-5 bg-primary text-white text-xl font-black rounded-3xl hover:bg-primary-light hover:-translate-y-1 transition-all active:scale-95 shadow-xl shadow-primary/20">
              Start Free Trial
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-8 w-full lg:w-auto">
          {[
            { label: "Fraud Blocked", val: "1.2M+" },
            { label: "Active Links", val: "85K+" },
            { label: "Data Protected", val: "45TB" },
            { label: "Uptime Rate", val: "99.9%" },
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white/50 backdrop-blur-md rounded-3xl border border-white text-center shadow-sm">
              <div className="text-4xl font-black mb-2 text-primary">{stat.val}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="w-full py-16 px-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8 text-gray-500 font-semibold max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-lg opacity-50" />
          <span className="text-gray-900 font-bold">SecureLink © 2026</span>
        </div>
        <div className="flex gap-8 text-sm">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
        <div className="text-sm">Built with passion for security.</div>
      </footer>
    </div>
  );
}
