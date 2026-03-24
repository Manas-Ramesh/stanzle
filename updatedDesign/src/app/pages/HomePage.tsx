import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, getAuthToken, getBackendOrigin } from "@/lib/api";
import { isManualPasswordValid, MANUAL_PASSWORD_RULES } from "@/lib/passwordRules";

function formatHeaderDate() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

export function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [dailyDone, setDailyDone] = useState(false);

  useEffect(() => {
    const modeParam = new URLSearchParams(location.search).get("mode");
    if (modeParam === "login" || modeParam === "register") {
      setMode(modeParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (!user || !getAuthToken()) {
      setDailyDone(false);
      return;
    }
    let cancelled = false;
    apiFetch<{ can_submit?: boolean }>("/api/daily/submission-status", { method: "GET" })
      .then((s) => {
        if (!cancelled) setDailyDone(s.can_submit === false);
      })
      .catch(() => {
        if (!cancelled) setDailyDone(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register" && !isManualPasswordValid(password)) {
      toast.error("Your password must meet all requirements below.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
        toast.success("Welcome back!");
      } else {
        await register(username.trim(), email.trim(), password);
        toast.success("Account created!");
      }
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handlePlay = () => {
    navigate("/play");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 border-4 border-gray-900 rounded-lg flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">S</div>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">Stanzle</h1>

        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          Write poetry based on daily themes and emotions.
          <br />
          Get scored by AI.
        </p>

        <div className="flex justify-center mb-16">
          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : !user ? (
            <div className="w-full max-w-sm text-left space-y-4">
              <div className="flex rounded-full border-2 border-gray-300 p-1 text-sm font-medium">
                <button
                  type="button"
                  className={`flex-1 rounded-full py-2 ${mode === "login" ? "bg-gray-900 text-white" : ""}`}
                  onClick={() => setMode("login")}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-full py-2 ${mode === "register" ? "bg-gray-900 text-white" : ""}`}
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </div>
              <button
                type="button"
                onClick={handlePlay}
                className="w-full px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                Play Daily as Guest
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.assign(`${getBackendOrigin()}/login/google`);
                }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-full font-semibold text-gray-900 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="h-px flex-1 bg-gray-300" />
                or
                <span className="h-px flex-1 bg-gray-300" />
              </div>

              <form onSubmit={(e) => void handleAuth(e)} className="space-y-3">
                <input
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
                {mode === "register" && (
                  <input
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                )}
                <input
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  minLength={mode === "register" ? 8 : 1}
                />
                {mode === "register" && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Password requirements
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {MANUAL_PASSWORD_RULES.map((rule) => {
                        const ok = rule.test(password);
                        return (
                          <li
                            key={rule.label}
                            className={`flex items-center gap-2 ${ok ? "text-green-700" : "text-gray-500"}`}
                          >
                            <span
                              className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                ok ? "bg-green-600 text-white" : "border border-gray-300 bg-white text-gray-400"
                              }`}
                              aria-hidden
                            >
                              {ok ? "✓" : ""}
                            </span>
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={busy || (mode === "register" && !isManualPasswordValid(password))}
                  className="w-full px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={handlePlay}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
              >
                {dailyDone ? "View daily challenge" : "Play"}
              </button>
              <p className="text-sm text-gray-500">
                {dailyDone
                  ? "You already submitted today — open the daily page for links to Unlimited mode and progress."
                  : "Solve today’s challenge and submit your score."}
              </p>
              <button
                type="button"
                onClick={() => void logout()}
                className="text-sm text-gray-600 underline"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p>{formatHeaderDate()}</p>
        </div>
      </div>
    </div>
  );
}
