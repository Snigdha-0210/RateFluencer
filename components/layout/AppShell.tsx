"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import GenerationOverlay from "./GenerationOverlay";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    if (!user?.isLoggedIn && !isLoginPage) {
      router.push("/login");
    }
  }, [user, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="auth-shell" style={{ background: "#FAFBFC", minHeight: "100vh" }}>
        {children}
      </div>
    );
  }

  // Prevent showing protected content while redirecting
  if (!user?.isLoggedIn) {
    return null; 
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">{children}</main>
      </div>
      <GenerationOverlay />
    </div>
  );
}
