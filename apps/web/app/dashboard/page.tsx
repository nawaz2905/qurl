"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type DashboardTab = "Overview" | "Create Link" | "My Links";

type LinkItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  fraudScore: number;
  clicks: number;
  createdAt: string;
};

type LinkResult = {
  originalUrl: string;
  shortCode: string;
  shortlink: string;
  fraudScore: number;
  clicks: number;
  fraudInfo?: {
    reasons?: string[];
  };
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

function getInitials(email: string | null) {
  if (!email) return "??";
  const localPart = email.split("@")[0];
  return localPart ? localPart.slice(0, 2).toUpperCase() : "??";
}

function getRiskTone(score: number) {
  if (score > 50) return "high";
  if (score > 20) return "medium";
  return "low";
}

function getRiskLabel(score: number) {
  if (score > 50) return "High risk";
  if (score > 20) return "Needs review";
  return "Healthy";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortLink(shortCode: string) {
  return `${API_BASE_URL}/${shortCode}`;
}

const dashboardTabs: {
  id: DashboardTab;
  label: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: "Overview",
    label: "Overview",
    description: "See workspace health and recent link activity.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M4 13h6V5H4v8Zm10 6h6V5h-6v14ZM4 19h6v-2H4v2Zm10-8h6v-2h-6v2Z" />
      </svg>
    ),
  },
  {
    id: "Create Link",
    label: "Create Link",
    description: "Generate a protected short link with instant analysis.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "My Links",
    label: "My Links",
    description: "Search, copy, open, and remove saved links.",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07l-1.76 1.76" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-2.92 2.92a5 5 0 0 0 7.07 7.07l1.76-1.76" />
      </svg>
    ),
  },
];

function SidebarItem({
  active,
  collapsed,
  label,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  collapsed: boolean;
  label: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`transition ${
        collapsed
          ? active
            ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary"
            : "flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          : active
            ? "w-full rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-left text-primary shadow-sm"
            : "w-full rounded-2xl border border-transparent px-4 py-3 text-left text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {collapsed ? (
        <div className="h-5 w-5">{icon}</div>
      ) : (
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 h-5 w-5 ${active ? "text-primary" : "text-gray-400"}`}>{icon}</div>
          <div className="min-w-0">
            <div className="text-sm font-bold">{label}</div>
            <div className={`mt-1 text-xs font-medium leading-5 ${active ? "text-primary/70" : "text-gray-400"}`}>{description}</div>
          </div>
        </div>
      )}
    </button>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string; }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">{label}</div>
      <div className="mt-4 text-3xl font-black tracking-tight text-gray-900">{value}</div>
      <div className="mt-2 text-sm font-medium text-gray-500">{helper}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode; }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{eyebrow}</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-gray-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    const savedTab = localStorage.getItem("dashboardTab") as DashboardTab | null;
    const savedToken = localStorage.getItem("token");
    const savedUserEmail = localStorage.getItem("userEmail");

    if (savedTab && dashboardTabs.some((tab) => tab.id === savedTab)) {
      setActiveTab(savedTab);
    }
    const savedSidebarState = localStorage.getItem("dashboardSidebarCollapsed");
    if (savedSidebarState === "true") {
      setSidebarCollapsed(true);
    }
    if (savedUserEmail) setUserEmail(savedUserEmail);
    if (!savedToken) {
      setFetching(false);
      return;
    }

    setToken(savedToken);
    void fetchLinks(savedToken);
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("dashboardSidebarCollapsed", sidebarCollapsed ? "true" : "false");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function fetchLinks(tokenToUse: string) {
    setFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/links`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to fetch links");
      setLinks(Array.isArray(data.links) ? data.links : []);
    } catch (fetchError: unknown) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch links";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setFetching(false);
    }
  }

  async function handleShorten(event: React.FormEvent) {
    event.preventDefault();
    if (!inputUrl || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to create link");

      setResult(data);
      setInputUrl("");
      setToast({ tone: "success", message: "Protected link created." });
      await fetchLinks(token);
      setActiveTab("Create Link");
    } catch (submitError: unknown) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create link";
      setError(message);
      setToast({ tone: "error", message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;

    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/link/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || "Failed to delete link");

      setLinks((current) => current.filter((link) => link.id !== id));
      setToast({ tone: "success", message: "Link deleted." });
    } catch (deleteError: unknown) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete link";
      setError(message);
      setToast({ tone: "error", message });
    }
  }

  async function handleCopy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast({ tone: "success", message: `${label} copied.` });
    } catch {
      setToast({ tone: "error", message: "Copy failed." });
    }
  }

  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("dashboardTab");
    localStorage.removeItem("userEmail");
    router.push("/login");
  }

  const filteredLinks = links.filter((link) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return link.originalUrl.toLowerCase().includes(normalizedQuery) || link.shortCode.toLowerCase().includes(normalizedQuery);
  });

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const riskyLinks = links.filter((link) => link.fraudScore > 50).length;
  const reviewLinks = links.filter((link) => link.fraudScore > 20 && link.fraudScore <= 50).length;
  const averageFraud = links.length ? Math.round(links.reduce((sum, link) => sum + link.fraudScore, 0) / links.length) : 0;
  const recentLinks = [...links].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 5);

  if (!token && !fetching) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-gray-900">Access denied</h2>
        <p className="mt-3 max-w-md text-center text-sm font-medium leading-6 text-gray-500">
          Sign in to reach your workspace and manage protected links.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
            Go to login
          </Link>
          <Link href="/" className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:text-gray-900">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-left text-gray-900 selection:bg-primary/20 lg:h-screen lg:overflow-hidden">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-[60] rounded-2xl border px-4 py-3 text-sm font-bold shadow-lg ${
            toast.tone === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="flex min-h-screen flex-col lg:h-full lg:min-h-0 lg:flex-row">
        <aside
          className={`scrollbar-hidden w-full border-b px-6 py-6 shadow-sm transition-all duration-300 lg:h-full lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:shadow-none ${
            sidebarCollapsed
              ? "border-gray-200 bg-white lg:w-24 lg:px-4"
              : "border-gray-200 bg-white lg:w-80 lg:border-r"
          }`}
        >
          <div className={`flex ${sidebarCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"}`}>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                title="Expand sidebar"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6M5 5h2v14H5z" />
                </svg>
              </button>
            )}

            <Link href="/" className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black text-white shadow-md shadow-primary/25 ${
                sidebarCollapsed ? "bg-primary shadow-primary/15" : "bg-primary"
              }`}>
                Q
              </div>
              {!sidebarCollapsed && (
                <div>
                  <div className="text-xl font-black tracking-tight text-gray-900">Qurl.ai</div>
                  <div className="text-xs font-medium text-gray-400">Protected link workspace</div>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => setSidebarCollapsed((current) => !current)}
                title="Collapse sidebar"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6M17 5h2v14h-2z" />
                </svg>
              </button>
            )}
          </div>

          <nav className={`mt-8 ${sidebarCollapsed ? "flex flex-col items-center gap-4" : "space-y-2"}`}>
            {dashboardTabs.map((tab) => (
              <SidebarItem
                key={tab.id}
                active={activeTab === tab.id}
                collapsed={sidebarCollapsed}
                label={tab.label}
                description={tab.description}
                icon={tab.icon}
                onClick={() => handleTabChange(tab.id)}
              />
            ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-5 rounded-[22px] border border-orange-100 bg-orange-50 px-4 py-3.5">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Next upgrade</div>
              <div className="mt-1.5 text-sm font-black tracking-tight text-gray-900">Risk alerts and custom domains</div>
              <p className="mt-1 max-w-[210px] text-xs font-medium leading-4.5 text-gray-600">
                Add alerts and branded short links when you are ready to scale.
              </p>
            </div>
          )}

          <div
            className={`mt-6 pt-5 ${
              sidebarCollapsed
                ? "flex flex-col items-center gap-4 border-t border-white/8"
                : "space-y-2 border-t border-gray-200"
            }`}
          >
            <button
              type="button"
              title={sidebarCollapsed ? "Billing and plan" : undefined}
              className={`transition ${
                sidebarCollapsed
                  ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  : "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {sidebarCollapsed ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ) : (
                "Billing and plan"
              )}
            </button>
            <button
              type="button"
              onClick={logout}
              title={sidebarCollapsed ? "Sign out" : undefined}
              className={`transition ${
                sidebarCollapsed
                  ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  : "w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left text-sm font-bold text-red-600 hover:border-red-200 hover:bg-red-100"
              }`}
            >
              {sidebarCollapsed ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
              ) : (
                "Sign out"
              )}
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col lg:h-full lg:min-h-0">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-10">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by destination URL or short code"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm md:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                    {getInitials(userEmail)}
                  </div>
                  <div className="min-w-0">
                    <div className="max-w-[220px] truncate text-sm font-bold text-gray-900">
                      {userEmail || "Guest workspace"}
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      Free plan - security monitoring enabled
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabChange("Create Link")}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
                >
                  Create link
                </button>
              </div>
            </div>
          </header>

          <div className="scrollbar-hidden mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-8 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:px-10">
            {activeTab === "Overview" && (
              <div className="space-y-8">
                <SectionHeader
                  eyebrow="Workspace overview"
                  title="A cleaner view of link health"
                  description="Keep creation, monitoring, and management separate so the dashboard reads like an operations tool instead of a single modal stretched across the whole app."
                  action={
                    <button
                      type="button"
                      onClick={() => handleTabChange("Create Link")}
                      className="rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5"
                    >
                      Protect a new URL
                    </button>
                  }
                />

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="Total links" value={String(links.length)} helper="Saved in this workspace" />
                  <StatCard label="Total clicks" value={String(totalClicks)} helper="All recorded visits" />
                  <StatCard label="Average fraud score" value={`${averageFraud}%`} helper="Across every saved link" />
                  <StatCard label="Needs attention" value={String(riskyLinks + reviewLinks)} helper="Medium and high risk links" />
                </div>

                <div className="grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
                  <section className="flex h-[540px] flex-col rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Recent links</div>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">Newest protected destinations</h2>
                      </div>
                      <button type="button" onClick={() => handleTabChange("My Links")} className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">
                        View all
                      </button>
                    </div>

                    <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-2">
                      {fetching ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm font-medium text-gray-500">
                          Loading workspace activity...
                        </div>
                      ) : recentLinks.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm font-medium text-gray-500">
                          No links yet. Create your first protected short link from the Create Link tab.
                        </div>
                      ) : (
                        recentLinks.map((link) => {
                          const tone = getRiskTone(link.fraudScore);
                          return (
                            <div key={link.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-bold text-gray-900">{link.originalUrl}</div>
                                <div className="mt-1 text-xs font-medium text-gray-500">
                                  {link.shortCode} - created {formatDate(link.createdAt)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${tone === "high" ? "bg-red-50 text-red-600" : tone === "medium" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                                  {getRiskLabel(link.fraudScore)}
                                </span>
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{link.clicks || 0} clicks</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                  <section className="flex h-[540px] flex-col rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Risk breakdown</div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">How safe is the workspace?</h2>

                    <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
                      <div className="rounded-2xl bg-green-50 p-4">
                        <div className="text-sm font-bold text-green-800">Healthy links</div>
                        <div className="mt-1 text-3xl font-black tracking-tight text-green-900">{links.length - riskyLinks - reviewLinks}</div>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <div className="text-sm font-bold text-amber-800">Needs review</div>
                        <div className="mt-1 text-3xl font-black tracking-tight text-amber-900">{reviewLinks}</div>
                      </div>
                      <div className="rounded-2xl bg-red-50 p-4">
                        <div className="text-sm font-bold text-red-800">High risk</div>
                        <div className="mt-1 text-3xl font-black tracking-tight text-red-900">{riskyLinks}</div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "Create Link" && (
              <div className="space-y-8">
                <SectionHeader
                  eyebrow="Create protected link"
                  title="Shorten a destination without leaving the workspace"
                  description="The creation flow now lives in its own section, with the latest result displayed alongside it instead of taking over the entire dashboard."
                />

                <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                  <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <form onSubmit={handleShorten} className="space-y-6">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Destination URL</label>
                        <input
                          type="url"
                          required
                          autoFocus
                          value={inputUrl}
                          onChange={(event) => setInputUrl(event.target.value)}
                          placeholder="https://example.com/offer"
                          className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>

                      <div className="grid gap-4 rounded-2xl bg-gray-50 p-4 sm:grid-cols-3">
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">What happens</div>
                          <div className="mt-2 text-sm font-medium leading-6 text-gray-600">We create a short URL and run a fraud score before saving it to your workspace.</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Best for</div>
                          <div className="mt-2 text-sm font-medium leading-6 text-gray-600">Campaign links, personal redirects, and domains you want to monitor over time.</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Immediate output</div>
                          <div className="mt-2 text-sm font-medium leading-6 text-gray-600">Short code, fraud score, click count, and explanation of flagged reasons.</div>
                        </div>
                      </div>

                      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">Warning: {error}</div>}

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button type="submit" disabled={loading} className="rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                          {loading ? "Protecting..." : "Create protected link"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputUrl("");
                            setError(null);
                          }}
                          className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                        >
                          Clear form
                        </button>
                      </div>
                    </form>
                  </section>

                  <section className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Latest result</div>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900">Most recent analysis</h2>
                      </div>
                      {result && <button type="button" onClick={() => setResult(null)} className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">Clear</button>}
                    </div>

                    {!result ? (
                      <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm font-medium leading-6 text-gray-500">
                        Your newest protected link will appear here, along with its fraud score and any reasons that need attention.
                      </div>
                    ) : (
                      <div className="mt-6 space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Short URL</div>
                            <div className="mt-3 break-all text-sm font-bold text-gray-900">{result.shortlink}</div>
                            <button type="button" onClick={() => handleCopy(result.shortlink, "Short URL")} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark">
                              Copy short URL
                            </button>
                          </div>
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Fraud score</div>
                            <div className="mt-3 text-3xl font-black tracking-tight text-gray-900">{result.fraudScore}%</div>
                            <div className="mt-2 text-sm font-medium text-gray-600">{getRiskLabel(result.fraudScore)}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Destination</div>
                          <div className="mt-3 break-all text-sm font-medium leading-6 text-gray-700">{result.originalUrl}</div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Analysis reasons</div>
                          <div className="mt-4 space-y-3">
                            {result.fraudInfo?.reasons?.length ? (
                              result.fraudInfo.reasons.map((reason, index) => (
                                <div key={`${reason}-${index}`} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                                  {reason}
                                </div>
                              ))
                            ) : (
                              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                                No suspicious reasons were reported for this destination.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}

            {activeTab === "My Links" && (
              <div className="space-y-8">
                <SectionHeader
                  eyebrow="Link library"
                  title="Searchable, action-oriented link management"
                  description="Every action is visible by default now, so the table works on desktop and touch devices without relying on hover to reveal basic controls."
                  action={<div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">Showing {filteredLinks.length} of {links.length} links</div>}
                />

                <section className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
                  {fetching ? (
                    <div className="px-6 py-16 text-center text-sm font-medium text-gray-500">Loading your links...</div>
                  ) : filteredLinks.length === 0 ? (
                    <div className="px-6 py-16 text-center">
                      <div className="text-lg font-black tracking-tight text-gray-900">No matching links</div>
                      <div className="mt-2 text-sm font-medium text-gray-500">{links.length === 0 ? "Create a protected URL to populate your workspace." : "Try another search term or clear the search box."}</div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Destination</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Short URL</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Risk</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Clicks</th>
                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created</th>
                            <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredLinks.map((link) => {
                            const fullShortLink = formatShortLink(link.shortCode);
                            const tone = getRiskTone(link.fraudScore);
                            return (
                              <tr key={link.id} className="align-top">
                                <td className="px-6 py-5"><div className="max-w-sm break-all text-sm font-bold text-gray-900">{link.originalUrl}</div></td>
                                <td className="px-6 py-5"><div className="text-sm font-bold text-primary">{fullShortLink}</div><div className="mt-1 text-xs font-medium text-gray-500">Code: {link.shortCode}</div></td>
                                <td className="px-6 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${tone === "high" ? "bg-red-50 text-red-600" : tone === "medium" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{link.fraudScore}% - {getRiskLabel(link.fraudScore)}</span></td>
                                <td className="px-6 py-5 text-sm font-bold text-gray-700">{link.clicks || 0}</td>
                                <td className="px-6 py-5 text-sm font-medium text-gray-500">{formatDate(link.createdAt)}</td>
                                <td className="px-6 py-5">
                                  <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => handleCopy(fullShortLink, "Short URL")} className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">Copy</button>
                                    <a href={fullShortLink} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50">Open</a>
                                    <button type="button" onClick={() => handleDelete(link.id)} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
