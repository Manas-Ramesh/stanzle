import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

type OverviewPayload = {
  success: boolean;
  overview?: {
    user_count: number;
    active_sessions: number;
    total_daily_submissions_recorded: number;
    tracked_challenge_days: number;
    data_dir: string;
  };
  recent_tracked_challenges?: Array<{
    date: string;
    theme?: string;
    emotion?: string;
    submissions_count: number;
    avg_score: number;
    best_score: number;
  }>;
  error?: string;
};

type UserRow = {
  username: string;
  email?: string;
  created_at?: string;
  last_login?: string | null;
  games_played: number;
  total_score: number;
  best_score: number;
  daily_submit_days: number;
  detailed_submissions: number;
  last_daily_submission?: string | null;
};

type SubRow = {
  username: string;
  date: string;
  score?: number;
  theme?: string;
  emotion?: string;
  mode?: string;
  word_bank_used?: boolean;
  submitted_at?: string;
  poem_preview: string;
};

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewPayload | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadError("Log in to open the admin dashboard.");
      return;
    }
    if (!user.is_admin) {
      setLoadError("You don’t have access to this page.");
      return;
    }
    let cancelled = false;
    setFetching(true);
    setLoadError(null);
    Promise.all([
      apiFetch<OverviewPayload>("/api/admin/overview", { method: "GET" }),
      apiFetch<{ success: boolean; users?: UserRow[] }>("/api/admin/users", { method: "GET" }),
      apiFetch<{ success: boolean; submissions?: SubRow[] }>("/api/admin/submissions?limit=120", {
        method: "GET",
      }),
    ])
      .then(([ov, ur, sr]) => {
        if (cancelled) return;
        setOverview(ov);
        setUsers(ur.users ?? []);
        setSubs(sr.submissions ?? []);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load admin data.");
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, user?.is_admin]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center text-gray-600">
        Loading…
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-700 mb-6">{loadError || "You don’t have access to this page."}</p>
        <Link to="/" className="text-gray-900 font-semibold underline">
          Back to home
        </Link>
      </div>
    );
  }

  const ov = overview?.overview;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-sm text-gray-600 mt-1">
              Signed in as <span className="font-medium text-gray-800">{user.username}</span>
            </p>
          </div>
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 underline self-start">
            ← Back to app
          </Link>
        </div>

        {loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {loadError}
          </div>
        )}

        {fetching && !ov && !loadError && (
          <p className="text-gray-600 text-sm mb-6">Loading analytics…</p>
        )}

        {ov && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <StatCard label="Users" value={ov.user_count} />
            <StatCard label="Active sessions" value={ov.active_sessions} />
            <StatCard label="Daily submissions (stored)" value={ov.total_daily_submissions_recorded} />
            <StatCard label="Tracked challenge days" value={ov.tracked_challenge_days} />
          </div>
        )}

        {ov && (
          <p className="text-xs text-gray-500 mb-10">
            Data directory: <code className="bg-gray-200/80 px-1 rounded">{ov.data_dir}</code>
          </p>
        )}

        {overview?.recent_tracked_challenges && overview.recent_tracked_challenges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent tracked daily challenges</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Theme</th>
                    <th className="px-3 py-2 font-medium">Emotion</th>
                    <th className="px-3 py-2 font-medium text-right">Subs</th>
                    <th className="px-3 py-2 font-medium text-right">Avg</th>
                    <th className="px-3 py-2 font-medium text-right">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recent_tracked_challenges.map((c) => (
                    <tr key={c.date} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2 font-mono text-gray-800">{c.date}</td>
                      <td className="px-3 py-2 text-gray-700">{c.theme ?? "—"}</td>
                      <td className="px-3 py-2 text-gray-700">{c.emotion ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.submissions_count}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {typeof c.avg_score === "number" ? c.avg_score.toFixed(1) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{c.best_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Users ({users.length})</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white max-h-[28rem] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
                  <th className="px-3 py-2 font-medium">Username</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Joined</th>
                  <th className="px-3 py-2 font-medium">Last login</th>
                  <th className="px-3 py-2 font-medium text-right">Games</th>
                  <th className="px-3 py-2 font-medium text-right">Best</th>
                  <th className="px-3 py-2 font-medium text-right">Daily days</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username} className="border-b border-gray-100 last:border-0">
                    <td className="px-3 py-2 font-medium text-gray-900">{u.username}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[12rem]" title={u.email}>
                      {u.email ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {fmtDate(u.created_at)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                      {fmtDate(u.last_login)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{u.games_played}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{u.best_score}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{u.daily_submit_days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent daily poem submissions</h2>
          <p className="text-xs text-gray-500 mb-3">
            Text is truncated. Full poems live in <code className="bg-gray-200/80 px-1 rounded">users.json</code>{" "}
            on the server.
          </p>
          <div className="space-y-4">
            {subs.map((s, i) => (
              <article
                key={`${s.username}-${s.date}-${i}`}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm mb-2">
                  <span className="font-semibold text-gray-900">{s.username}</span>
                  <span className="text-gray-500 font-mono">{s.date}</span>
                  {s.score != null && (
                    <span className="text-gray-700">
                      Score: <span className="font-bold tabular-nums">{s.score}</span>
                    </span>
                  )}
                  <span className="text-gray-600">
                    {s.theme ?? "—"} / {s.emotion ?? "—"}
                  </span>
                  <span className="text-gray-500">{s.mode ?? ""}</span>
                  {s.word_bank_used ? (
                    <span className="text-xs bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                      word bank
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {s.poem_preview || "—"}
                </p>
                {s.submitted_at && (
                  <p className="text-xs text-gray-400 mt-2">Submitted {s.submitted_at}</p>
                )}
              </article>
            ))}
            {subs.length === 0 && !fetching && (
              <p className="text-gray-500 text-sm">No stored submissions yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums mt-1">{value}</p>
    </div>
  );
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}
