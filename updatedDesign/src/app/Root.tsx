import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { Header } from "./components/Header";

export function Root() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
