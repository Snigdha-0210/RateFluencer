"use client";

import { useAppStore } from "@/store/useAppStore";
import { Settings, User, Bell, Key, CreditCard, Shield, Zap } from "lucide-react";
import { useState } from "react";

const CATEGORIES = [
  "AI", "Technology", "Business", "Finance", "Startups", "Creator Economy", "Marketing", "Productivity", "Education",
  "Career", "Programming", "Coding", "Software Engineering", "Science", "Space", "History", "Politics", "Religion",
  "Current Affairs", "Travel", "Tourism", "Food", "Street Food", "Cooking", "Recipes", "Fitness", "Gym", "Sports",
  "Cricket", "Football", "Basketball", "Tennis", "Movies", "TV Shows", "OTT", "Anime", "Gaming", "Pets", "Animals",
  "Nature", "Wildlife", "Luxury", "Fashion", "Beauty", "Lifestyle", "Relationships", "Psychology", "Motivation",
  "Self Improvement", "Books", "Podcasts", "News", "Entertainment", "Memes", "Vlogging", "Personal Stories",
  "College Life", "Study Tips", "Entrepreneurship", "Side Hustles", "Investing", "Real Estate", "Health", "Mental Health",
  "Parenting", "Photography", "Art", "Music", "Dance", "Culture", "Local Trends", "Global Trends"
];

const OCCUPATIONS = [
  "Student", "College Student", "Software Engineer", "Doctor", "Teacher", "Founder", "Freelancer",
  "Content Creator", "Marketer", "Designer", "Government Employee", "Business Owner", "Entrepreneur", "All"
];

const REGIONS = ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East", "Africa", "Global"];
const AGE_GROUPS = ["Gen Z (13-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57+)", "All Ages"];
const GENDERS = ["Male", "Female", "Non-Binary", "Other", "Prefer Not To Say", "All Genders"];

export default function SettingsPage() {
  const creatorProfile = useAppStore((state) => state.creatorProfile);
  const setCreatorProfile = useAppStore((state) => state.setCreatorProfile);

  const [activeTab, setActiveTab] = useState("Profile");
  const [successMsg, setSuccessMsg] = useState(false);

  // Profile forms
  const [fullName, setFullName] = useState("Alex Chen");
  const [email, setEmail] = useState("alex@creatorhq.com");
  const [handle, setHandle] = useState("@alexchentech");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: creatorProfile.category,
          countries: creatorProfile.countries,
          regions: creatorProfile.regions,
          ageGroups: creatorProfile.ageGroups,
          genders: creatorProfile.genders,
          occupations: creatorProfile.occupations,
          interests: creatorProfile.interests
        })
      });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your CreatorOS account and AI personalization parameters</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Settings sidebar tabs */}
        <div className="card" style={{ padding: "12px", height: "fit-content" }}>
          {[
            { label: "Profile", icon: User },
            { label: "Notifications", icon: Bell },
            { label: "API Keys", icon: Key },
            { label: "Billing", icon: CreditCard },
            { label: "Security", icon: Shield },
            { label: "AI Agent Settings", icon: Zap },
          ].map(({ label, icon: Icon }) => {
            const active = activeTab === label;
            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`nav-item ${active ? "active" : ""}`}
                style={{ width: "100%", textAlign: "left", display: "flex", gap: 10, alignItems: "center" }}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Settings content tabs panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeTab === "Profile" && (
            <>
              {/* Account Profile Card */}
              <div className="card" style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #BFDBFE" }}>
                    <User size={16} color="#2563EB" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Creator Identity Profile</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "#FAFBFC", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "#FAFBFC", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Social Handle</label>
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "#FAFBFC", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
              </div>

              {/* Creator Personalized Niche System Card */}
              <div className="card" style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #DDD6FE" }}>
                    <Settings size={16} color="#7C3AED" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>AI Personalization Profile</div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Configure content targeting segments loaded by the AI CCO script generator</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Primary Content Category</label>
                    <select
                      value={creatorProfile.category}
                      onChange={(e) => setCreatorProfile({ category: e.target.value })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Countries</label>
                    <input
                      type="text"
                      value={creatorProfile.countries.join(", ")}
                      onChange={(e) => setCreatorProfile({ countries: e.target.value.split(",").map(c => c.trim()).filter(Boolean) })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "#FAFBFC", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Region</label>
                    <select
                      value={creatorProfile.regions[0] || "North America"}
                      onChange={(e) => setCreatorProfile({ regions: [e.target.value] })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Age Group</label>
                    <select
                      value={creatorProfile.ageGroups[0] || "Gen Z (13-24)"}
                      onChange={(e) => setCreatorProfile({ ageGroups: [e.target.value] })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Gender Focus</label>
                    <select
                      value={creatorProfile.genders[0] || "All Genders"}
                      onChange={(e) => setCreatorProfile({ genders: [e.target.value] })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Occupation Focus</label>
                    <select
                      value={creatorProfile.occupations[0] || "Software Engineers"}
                      onChange={(e) => setCreatorProfile({ occupations: [e.target.value] })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "white", outline: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Target Interests / Keywords</label>
                    <input
                      type="text"
                      value={creatorProfile.interests.join(", ")}
                      onChange={(e) => setCreatorProfile({ interests: e.target.value.split(",").map(i => i.trim()).filter(Boolean) })}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "#FAFBFC", outline: "none", fontFamily: "inherit" }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "AI Agent Settings" && (
            <div className="card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #BBF7D0" }}>
                  <Zap size={16} color="#059669" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>AI Agent Configuration</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                {[
                  { label: "Scan Frequency", value: "Every 30 minutes", on: true },
                  { label: "Auto-Generate Scripts", value: "Enabled", on: true },
                  { label: "LinkedIn Auto-Post", value: "Manual review", on: false },
                  { label: "Reddit Monitoring", value: "Active", on: true },
                  { label: "Virality Prediction", value: "Enabled", on: true },
                  { label: "Email Digest", value: "Daily at 8 AM", on: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "14px 16px",
                      background: "#FAFBFC",
                      borderRadius: 10,
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{item.label}</span>
                      <div
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: 99,
                          background: item.on ? "#2563EB" : "#D1D9E0",
                          position: "relative",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: "white",
                            position: "absolute",
                            top: 3,
                            left: item.on ? 17 : 3,
                            transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab !== "Profile" && activeTab !== "AI Agent Settings" && (
            <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <p style={{ fontSize: 15, fontWeight: 500 }}>{activeTab} configuration panel is active. (Mock Settings Component)</p>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center" }}>
            {successMsg && (
              <span style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>✓ Changes saved successfully!</span>
            )}
            <button className="btn btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
              <Settings size={13} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
