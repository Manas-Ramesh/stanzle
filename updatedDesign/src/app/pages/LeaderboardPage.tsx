import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

type LeaderboardResponse = {
  success: boolean;
  date: string;
  top_score: number | null;
  leaders: Array<{ username: string; score: number }>;
  submission_count: number;
  error?: string;
};

export function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch<LeaderboardResponse>("/api/daily/leaderboard", { method: "GET" })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load leaderboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="mb-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-900">Daily leaderboard</h1>
          <p className="text-sm text-gray-600 mt-2">
            Highest score for today&apos;s official daily challenge. Ties share the top spot — everyone
            at that score is listed.
          </p>
        </div>

        {loading && <p className="text-gray-500 text-sm py-8">Loading…</p>}

        {error && (
          <p className="text-red-700 text-sm py-6 rounded-lg bg-red-50 border border-red-100 px-4">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            <p className="text-center text-gray-700 font-medium mt-8 mb-6">
              {formatBoardDate(data.date)}
            </p>

            {data.top_score == null || data.leaders.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <p className="text-gray-700">No submissions for this daily yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Play today&apos;s challenge and submit your score to appear here.
                </p>
                <Link
                  to="/play"
                  className="inline-block mt-6 px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
                >
                  Play daily
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
                    Top score
                  </p>
                  <p className="text-5xl font-bold text-gray-900 tabular-nums mt-1">
                    {data.top_score}
                    <span className="text-lg font-semibold text-gray-500">/100</span>
                  </p>
                  {data.leaders.length > 1 && (
                    <p className="text-sm text-amber-800 font-medium mt-2">
                      {data.leaders.length}-way tie
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {data.submission_count}{" "}
                    {data.submission_count === 1 ? "player" : "players"} submitted today
                  </p>
                </div>

                <ul className="space-y-2">
                  {data.leaders.map((row) => {
                    const isYou = user?.username === row.username;
                    return (
                      <li
                        key={row.username}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${
                          isYou
                            ? "border-amber-400 bg-amber-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <span className={`font-semibold ${isYou ? "text-amber-950" : "text-gray-900"}`}>
                          {row.username}
                          {isYou ? (
                            <span className="ml-2 text-xs font-normal text-amber-800">(you)</span>
                          ) : null}
                        </span>
                        <span className="tabular-nums font-bold text-gray-800">{row.score}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <p className="text-center mt-10">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
                Back to home
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function formatBoardDate(iso: string) {
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return iso;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
