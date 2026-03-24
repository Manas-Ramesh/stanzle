import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { AUTH_TOKEN_KEY } from "./lib/api";
import "./styles/index.css";

/** OAuth on API host redirects here with ?authToken= (split Vercel + Railway). */
function consumeAuthTokenFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const t = params.get("authToken");
  if (!t) return;
  localStorage.setItem(AUTH_TOKEN_KEY, t);
  params.delete("authToken");
  const q = params.toString();
  const path = `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", path);
}
consumeAuthTokenFromQuery();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
  