"use client";

import { useState } from "react";
import { Bell, Search, ChevronDown, Sparkles, CheckCircle2, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";

const NOTIFICATIONS = [
  { id: 1, text: "7 new trend opportunities discovered", time: "Just now", unread: true, type: "trend" },
  { id: 2, text: "AI Agent completed daily scan", time: "31 min ago", unread: true, type: "agent" },
  { id: 3, text: "Virality prediction updated for your draft", time: "1h ago", unread: false, type: "content" },
  { id: 4, text: "New LinkedIn post ready for review", time: "2h ago", unread: false, type: "content" },
];

export default function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  const user = useAppStore((state) => state.user);
  const logoutUser = useAppStore((state) => state.logoutUser);
  const router = useRouter();

  return (
    <header className="navbar">
      {/* Search */}
      <div className="search-input">
        <Search size={14} color="var(--text-muted)" />
        <input placeholder="Search trends, topics, content..." id="global-search" />
        <span
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            background: "#F0F3F6",
            padding: "2px 7px",
            borderRadius: 5,
            border: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Agent Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: "#059669",
          }}
        >
          <Sparkles size={12} />
          Agent Running
          <div className="pulse-dot" style={{ width: 6, height: 6 }} />
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            id="notifications-btn"
            className="btn btn-ghost"
            style={{ padding: "8px", borderRadius: 8, position: "relative" }}
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell size={18} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 8,
                  height: 8,
                  background: "#EF4444",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="card"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: 340,
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 300,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                  <span className="badge badge-blue">{unreadCount} new</span>
                </div>
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border-subtle)",
                      background: n.unread ? "#FAFBFF" : "white",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle2 size={14} color={n.unread ? "#2563EB" : "var(--text-muted)"} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: n.unread ? 600 : 400 }}>{n.text}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div style={{ position: "relative" }}>
          {user && user.isLoggedIn ? (
            <>
              <button
                id="profile-btn"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px 6px 6px",
                  borderRadius: 10,
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F5F7FA")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Creator</div>
                </div>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="card"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: 200,
                      boxShadow: "var(--shadow-lg)",
                      zIndex: 300,
                      padding: "6px",
                    }}
                  >
                    {["Profile Settings", "Billing", "API Keys", "Sign Out"].map((item) => (
                      <div
                        key={item}
                        onClick={() => {
                          setShowProfile(false);
                          if (item === "Sign Out") {
                            logoutUser();
                            router.push("/login");
                          } else if (item === "Profile Settings") {
                            router.push("/settings");
                          }
                        }}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 6,
                          fontSize: 13,
                          color: item === "Sign Out" ? "#DC2626" : "var(--text-primary)",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F5F7FA")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {item}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="btn btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 12.5,
              }}
            >
              <LogIn size={13} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
