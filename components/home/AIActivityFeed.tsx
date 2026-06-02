"use client";

import { motion } from "framer-motion";
import { MessageSquare, Newspaper, Sparkles, BarChart3, CheckCircle2, PlayCircle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { TrendEvent } from "@/types/events";

const ICON_MAP: Record<string, React.ElementType> = {
  MessageSquare, Linkedin: Users, Youtube: PlayCircle, Newspaper, Sparkles, BarChart3,
};

export default function AIActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/trends/firestore")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.trends) && data.trends.length > 0) {
          const newActivities = [
            { id: "a1", action: "Scanned Data Sources", detail: `Analyzed posts across ${Array.from(new Set(data.trends.map((d: any) => d.sources?.[0] || 'Internet'))).join(", ")}`, timestamp: "1 min ago", icon: "Newspaper", status: "complete" },
            { id: "a2", action: "Ranked Trends", detail: `Scored and ranked ${data.trends.length} trends by momentum and volume`, timestamp: "Just now", icon: "BarChart3", status: "complete" }
          ];
          setActivities(newActivities);
        }
      })
      .catch(console.error);
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="card" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>AI Activity Feed</h2>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>Daily morning scan completed</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            color: "#059669",
          }}
        >
          <CheckCircle2 size={12} />
          All Complete
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {activities.map((activity, i) => {
          const Icon = ICON_MAP[activity.icon] ?? Sparkles;
          const isLast = i === activities.length - 1;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{ display: "flex", gap: 14, position: "relative" }}
            >
              {/* Line */}
              {!isLast && (
                <div
                  style={{
                    position: "absolute",
                    left: 17,
                    top: 30,
                    bottom: -4,
                    width: 2,
                    background: "linear-gradient(to bottom, #BFDBFE, transparent)",
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 4,
                  zIndex: 1,
                }}
              >
                <Icon size={15} color="#2563EB" />
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>
                    {activity.action}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{activity.timestamp}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>
                  {activity.detail}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
