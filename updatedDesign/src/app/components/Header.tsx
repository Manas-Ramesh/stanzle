import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { LayoutDashboard, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, getAuthToken } from "@/lib/api";

export function Header() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuAlignOffset, setMenuAlignOffset] = useState(0);
  const [dailyStatus, setDailyStatus] = useState<"Submitted" | "Not Started" | "In Progress">(
    "Not Started",
  );
  const [todayScore, setTodayScore] = useState<number | null>(null);

  const measureTriggerWidth = useCallback(() => {
    const el = triggerRef.current;
    if (el) setMenuAlignOffset(el.offsetWidth);
  }, []);

  useLayoutEffect(() => {
    measureTriggerWidth();
  }, [user?.username, measureTriggerWidth]);

  useEffect(() => {
    window.addEventListener("resize", measureTriggerWidth);
    return () => window.removeEventListener("resize", measureTriggerWidth);
  }, [measureTriggerWidth]);

  useEffect(() => {
    if (!user || !getAuthToken()) {
      setDailyStatus("Not Started");
      setTodayScore(null);
      return;
    }
    let cancelled = false;
    apiFetch<{ can_submit?: boolean; daily_score?: number }>("/api/daily/submission-status", {
      method: "GET",
    })
      .then((s) => {
        if (cancelled) return;
        if (s.can_submit === false) {
          setDailyStatus("Submitted");
          setTodayScore(s.daily_score ?? null);
        } else {
          setDailyStatus("Not Started");
          setTodayScore(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDailyStatus("Not Started");
          setTodayScore(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.username, user?.games_played]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Stanzle</h1>
          </Link>

          {user ? (
            <DropdownMenu onOpenChange={(open) => open && measureTriggerWidth()}>
              <DropdownMenuTrigger asChild>
                <button
                  ref={triggerRef}
                  type="button"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  {user.username}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                alignOffset={menuAlignOffset}
                className="w-64 p-4"
              >
                <div className="space-y-3 pb-4 mb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Games played:</span>
                    <span className="text-lg font-bold text-gray-900">{user.games_played ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Best score:</span>
                    <span className="text-lg font-bold text-gray-900">{user.best_score ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Today&apos;s score:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {todayScore !== null && todayScore !== undefined ? todayScore : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily status:</span>
                    <span
                      className={`text-sm font-bold ${
                        dailyStatus === "Submitted" ? "text-orange-600" : "text-gray-900"
                      }`}
                    >
                      {dailyStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {user.is_admin ? (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => navigate("/admin")}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => {
                      void refreshUser();
                      navigate("/progress");
                    }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => void handleLogout()}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
