import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DailyGamePage } from "./pages/DailyGamePage";
import { UnlimitedModePage } from "./pages/UnlimitedModePage";
import { ProgressPage } from "./pages/ProgressPage";
import { AdminPage } from "./pages/AdminPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { Root } from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "leaderboard", Component: LeaderboardPage },
      { path: "play", Component: DailyGamePage },
      { path: "unlimited", Component: UnlimitedModePage },
      { path: "progress", Component: ProgressPage },
      { path: "admin", Component: AdminPage },
    ],
  },
]);
