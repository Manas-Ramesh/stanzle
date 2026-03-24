import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { DailyGamePage } from "./pages/DailyGamePage";
import { UnlimitedModePage } from "./pages/UnlimitedModePage";
import { ProgressPage } from "./pages/ProgressPage";
import { Root } from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "play", Component: DailyGamePage },
      { path: "unlimited", Component: UnlimitedModePage },
      { path: "progress", Component: ProgressPage },
    ],
  },
]);
