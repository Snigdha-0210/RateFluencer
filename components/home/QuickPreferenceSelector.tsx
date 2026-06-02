"use client";

import { useAppStore } from "@/store/useAppStore";
import { Settings2, Loader2 } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  "General News", "World News", "Politics", "Science", "Entertainment",
  "AI", "Technology", "Business", "Finance", "Startups", "Creator Economy", "Marketing", "Productivity", "Education",
  "Career", "Programming", "Coding", "Software Engineering", "Space", "History", "Religion",
  "Current Affairs", "Travel", "Tourism", "Food", "Street Food", "Cooking", "Recipes", "Fitness", "Gym", "Sports",
  "Cricket", "Football", "Basketball", "Tennis", "Movies", "TV Shows", "OTT", "Anime", "Gaming", "Pets", "Animals",
  "Nature", "Wildlife", "Luxury", "Fashion", "Beauty", "Lifestyle", "Relationships", "Psychology", "Motivation",
  "Self Improvement", "Books", "Podcasts", "Memes", "Vlogging", "Personal Stories",
  "College Life", "Study Tips", "Entrepreneurship", "Side Hustles", "Investing", "Real Estate", "Health", "Mental Health",
  "Parenting", "Photography", "Art", "Music", "Dance", "Culture", "Local Trends", "Global Trends"
];

export default function QuickPreferenceSelector() {
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const setCreatorProfile = useAppStore((state) => state.setCreatorProfile);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCreatorProfile({ category: newCategory });
    
    setIsUpdating(true);
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory })
      });
      // Removed window.location.reload() to prevent session drop/login redirect
    } catch (error) {
      console.error("Failed to update preferences", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>
        <Settings2 size={15} />
        Filter By Niche:
      </div>
      <div style={{ position: "relative" }}>
        <select
          value={creatorProfile.category || "AI"}
          onChange={handleCategoryChange}
          disabled={isUpdating}
          style={{
            padding: "6px 32px 6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "white",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--accent)",
            outline: "none",
            cursor: isUpdating ? "not-allowed" : "pointer",
            appearance: "none",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          {isUpdating ? <Loader2 size={12} className="animate-spin" color="var(--accent)" /> : <span style={{ fontSize: 10, color: "var(--accent)" }}>▼</span>}
        </div>
      </div>
    </div>
  );
}
