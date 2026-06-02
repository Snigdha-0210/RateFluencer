"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Layers, BarChart2, Wand2, LineChart,
  Settings, Zap, ChevronRight, Film
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Discover", description: "Today's Opportunities", icon: LayoutDashboard, badge: null },
  { href: "/explore", label: "Explore", description: "Trend Rankings", icon: Layers, badge: "7" },
  { href: "/analyze", label: "Analyze", description: "Why It Matters", icon: BarChart2, badge: null },
  { href: "/create", label: "Create", description: "Build Content", icon: Wand2, badge: null },
  { href: "/my-reels", label: "My Reels", description: "Manage Library", icon: Film, badge: null },
  { href: "/measure", label: "Measure", description: "Track Performance", icon: LineChart, badge: null },
  { href: "/settings", label: "Settings", description: "System Preferences", icon: Settings, badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/" className="flex items-center gap-2.5 text-decoration-none" style={{ textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Zap size={16} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#0F1629", letterSpacing: "-0.3px" }}>
              CreatorOS
            </div>
            <div style={{ fontSize: 10.5, color: "#8896A9", fontWeight: 500, marginTop: 0 }}>
              AI Content Officer
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#8896A9", padding: "4px 12px 8px", marginTop: 4 }}>
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-item", active && "active")}
              style={{ position: "relative", textDecoration: "none", padding: "10px 12px", height: "auto" }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "var(--accent-light)" }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                <item.icon size={16} strokeWidth={active ? 2.5 : 2} style={{ color: active ? "var(--accent)" : "var(--text-secondary)", flexShrink: 0 }} />
                <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? "var(--accent)" : "var(--text-primary)", lineHeight: 1.2 }}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span style={{ fontSize: 10.5, color: active ? "#3B82F6" : "var(--text-muted)", fontWeight: 400, lineHeight: 1.1 }}>
                      {item.description}
                    </span>
                  )}
                </span>
                {item.badge && (
                  <span
                    style={{
                      background: "#EFF6FF",
                      color: "#2563EB",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 99,
                      border: "1px solid #BFDBFE",
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom agent status */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div
          style={{
            padding: "12px 14px",
            background: "linear-gradient(135deg, #F0FDF4, #ECFDF5)",
            border: "1px solid #BBF7D0",
            borderRadius: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>Agent Active</span>
          </div>
          <div style={{ fontSize: 11.5, color: "#047857", lineHeight: 1.5 }}>
            Scanning 6 sources<br />
            <span style={{ color: "#6EE7B7" }}>Last run: 31 min ago</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
