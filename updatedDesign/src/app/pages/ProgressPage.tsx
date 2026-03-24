import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { UnlimitedPrefetchLink } from "../components/UnlimitedPrefetchLink";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, getAuthToken } from "@/lib/api";

type SubmissionEntry = {
  date?: string;
  score?: number;
  mode?: string;
  easy_selection?: string | null;
  word_bank_used?: boolean;
  theme?: string;
  emotion?: string;
  poem_text?: string;
  required_words?: string[];
};

export function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);

  useEffect(() => {
    if (!getAuthToken()) {
      setSubmissions([]);
      setStreak(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      apiFetch<{ success?: boolean; current_streak?: number }>("/api/daily/history", {
        method: "GET",
      }).catch(() => ({ success: false, current_streak: 0 })),
      apiFetch<{
        success?: boolean;
        submissions?: Record<string, SubmissionEntry>;
      }>("/api/user/submission-history", { method: "GET" }).catch(() => ({
        success: false,
        submissions: {},
      })),
    ])
      .then(([hist, histDetail]) => {
        if (cancelled) return;
        setStreak(hist.current_streak ?? 0);
        const raw = histDetail.submissions ?? {};
        const list = Object.values(raw).sort((a, b) => {
          const da = a.date ?? "";
          const db = b.date ?? "";
          return db.localeCompare(da);
        });
        setSubmissions(list);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const stats = useMemo(() => {
    const completed = submissions.length;
    const scores = submissions.map((s) => s.score ?? 0).filter((n) => n > 0);
    const avgScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const totalWords = submissions.reduce((acc, s) => {
      const t = (s.poem_text ?? "").trim();
      if (!t) return acc;
      return acc + t.split(/\s+/).filter(Boolean).length;
    }, 0);
    return { completed, streak, avgScore, totalWords };
  }, [submissions, streak]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading progress…</p>
      </div>
    );
  }

  if (!user || !getAuthToken()) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white px-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to see progress</h1>
          <Link to="/" className="inline-block px-6 py-3 bg-gray-900 text-white font-bold rounded-full">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8 pb-6 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress</h1>
          <p className="text-gray-600">Your poetry challenge history</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          <div className="text-center p-4 border-2 border-gray-300 rounded">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Completed</div>
          </div>
          <div className="text-center p-4 border-2 border-gray-300 rounded">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.streak}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Streak</div>
          </div>
          <div className="text-center p-4 border-2 border-gray-300 rounded">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgScore}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Avg Score</div>
          </div>
          <div className="text-center p-4 border-2 border-gray-300 rounded">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalWords}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Words</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">History</h2>

          {submissions.length === 0 ? (
            <p className="text-gray-600">No submissions yet. Play the daily challenge to build history.</p>
          ) : (
            submissions.map((game, index) => {
              const dateLabel = game.date
                ? new Date(game.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";
              const score = game.score ?? 0;
              const status = score > 0 ? ("complete" as const) : ("incomplete" as const);
              const words = game.required_words ?? [];

              return (
                <div
                  key={`${game.date ?? index}`}
                  className="border-2 border-gray-300 rounded p-6 hover:border-gray-900 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{dateLabel}</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {score}/100
                      </div>
                    </div>
                    <div
                      className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${
                        status === "complete"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {status}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Theme:</span>{" "}
                      <span className="font-medium text-gray-900">{game.theme ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Emotion:</span>{" "}
                      <span className="font-medium text-gray-900">{game.emotion ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mode:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {game.mode ?? "—"}
                        {game.mode === "easy" && game.easy_selection
                          ? ` (${game.easy_selection})`
                          : ""}
                      </span>
                    </div>
                    {game.word_bank_used && words.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-600">Word Bank:</span>{" "}
                        <span className="font-medium text-gray-900">{words.join(", ")}</span>
                      </div>
                    )}
                    <div className="pt-2 text-gray-700 italic whitespace-pre-wrap">
                      &ldquo;{game.poem_text?.trim() || "—"}&rdquo;
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-300 flex justify-center">
          <UnlimitedPrefetchLink
            to="/unlimited"
            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors text-center"
          >
            Play Unlimited
          </UnlimitedPrefetchLink>
        </div>
      </div>
    </div>
  );
}
