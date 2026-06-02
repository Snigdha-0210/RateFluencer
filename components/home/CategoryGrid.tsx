"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Monitor, Briefcase, Rocket, DollarSign, Video, Megaphone, Zap } from "lucide-react";
import Link from "next/link";
import { Trend } from "@/types";

const INITIAL_CATEGORIES = [
  { label: "AI", icon: Cpu, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", count: 0 },
  { label: "Technology", icon: Monitor, color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", count: 0 },
  { label: "Business", icon: Briefcase, color: "#0369A1", bg: "#F0F9FF", border: "#BAE6FD", count: 0 },
  { label: "Startups", icon: Rocket, color: "#D97706", bg: "#FFF7ED", border: "#FED7AA", count: 0 },
  { label: "Finance", icon: DollarSign, color: "#059669", bg: "#F0FDF4", border: "#BBF7D0", count: 0 },
  { label: "Creator Economy", icon: Video, color: "#BE185D", bg: "#FDF2F8", border: "#FBCFE8", count: 0 },
  { label: "Marketing", icon: Megaphone, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", count: 0 },
  { label: "Productivity", icon: Zap, color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", count: 0 },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  useEffect(() => {
    fetch("/api/trends/firestore")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.trends) {
          const trends = data.trends as Trend[];
          const updatedCategories = INITIAL_CATEGORIES.map(cat => {
            const count = trends.filter(t => t.category.toLowerCase() === cat.label.toLowerCase()).length;
            return { ...cat, count };
          });
          setCategories(updatedCategories);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2 className="section-heading">Trending Categories</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 12,
        }}
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3, scale: 1.04 }}
            className="card"
            style={{
              padding: "16px 12px",
              textAlign: "center",
              cursor: "pointer",
              border: `1px solid ${cat.border}`,
              background: cat.bg,
            }}
          >
            <Link href={`/explore?category=${encodeURIComponent(cat.label)}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  border: `1px solid ${cat.border}`,
                }}
              >
                <cat.icon size={18} color={cat.color} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F1629", marginBottom: 3 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: cat.color, fontWeight: 600 }}>{cat.count > 0 ? cat.count : "..."} topics</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
