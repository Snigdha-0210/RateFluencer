"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { generateScript, generateLinkedInPost } from "@/lib/api";
import { PIPELINE_STEPS } from "@/lib/constants";
import {
  Copy, Check, Wand2, Sparkles,
  CheckCircle2, Clock, Circle, Mic, Layers,
  TrendingUp, Eye, Heart, Share2, Bookmark, Lightbulb
} from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="btn btn-secondary"
      style={{ fontSize: 12, padding: "6px 10px" }}
    >
      {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color }}>{value}%</span>
      </div>
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ViralityGauge({ score }: { score: number }) {
  const color = score >= 90 ? "#059669" : score >= 75 ? "#2563EB" : "#D97706";
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <div style={{ position: "relative", width: 100, height: 60, margin: "0 auto 8px" }}>
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F0F3F6" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 125.6} 125.6`}
          />
        </svg>
        <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, color, letterSpacing: "-1px", lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color }}>
        {score >= 90 ? "🔥 Viral Potential" : score >= 75 ? "⚡ Strong" : "📈 Good"}
      </div>
    </div>
  );
}

export default function ContentStudioPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLinkedIn, setIsGeneratingLinkedIn] = useState(false);
  const [linkedInResult, setLinkedInResult] = useState<{ post: string; hook: string; hashtags: string[] } | null>(null);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);

  const handleGenerateLinkedIn = async () => {
    setIsGeneratingLinkedIn(true);
    setLinkedInError(null);
    try {
      const audience = `${activeReel.targeting.country}, ${activeReel.targeting.ageGroup}, ${activeReel.targeting.interestCategory || ""}`.trim();
      const result = await generateLinkedInPost(activeReel.title, activeReel.category, audience);
      setLinkedInResult(result);
    } catch (e: any) {
      console.error("LinkedIn generation failed", e);
      setLinkedInError(e.message || "Failed to generate LinkedIn content");
    } finally {
      setIsGeneratingLinkedIn(false);
    }
  };
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    try {
      const audience = `${activeReel.targeting.country}, ${activeReel.targeting.ageGroup}, ${activeReel.targeting.interestCategory || ""}`.trim();
      const result = await generateScript(activeReel.title, activeReel.category, audience);
      // Update Zustand store draft
      updateActiveReelDraft({
        hook: result.hook,
        story: result.story,
        keyInsights: result.keyInsights,
        cta: result.cta,
      });
      // Sync local state
      setHook(result.hook);
      setStory(result.story);
      setInsights(result.keyInsights);
      setCta(result.cta);
    } catch (e) {
      console.error("Script generation failed", e);
    } finally {
      setIsGenerating(false);
    }
  };
  const reels = useAppStore((state) => state.reels);
  const activeReelId = useAppStore((state) => state.activeReelId);
  const updateActiveReelDraft = useAppStore((state) => state.updateActiveReelDraft);
  const updateActiveReelTargeting = useAppStore((state) => state.updateActiveReelTargeting);
  const beginnerMode = useAppStore((state) => state.beginnerMode);
  const setBeginnerMode = useAppStore((state) => state.setBeginnerMode);

  // Fallback to first reel if no active ID is selected
  const activeReel = reels.find((r) => r.id === activeReelId) || reels[0];
  const draft = activeReel?.draft;

  // Local state for the textareas to enable smooth typing, synced on activeReel changes
  const [hook, setHook] = useState(draft?.hook || "");
  const [story, setStory] = useState(draft?.story || "");
  const [insights, setInsights] = useState(draft?.keyInsights || "");
  const [cta, setCta] = useState(draft?.cta || "");
  const [activeScene, setActiveScene] = useState(0);
  const [previewPlatform, setPreviewPlatform] = useState<"LinkedIn" | "Instagram" | null>(null);

  const SCENES = ["Hook", "Story", "Data", "CTA"];

  // Keep local state in sync with Zustand store active draft modifications (especially during audience targeting shifts)
  useEffect(() => {
    if (draft) {
      setHook(draft.hook);
      setStory(draft.story);
      setInsights(draft.keyInsights);
      setCta(draft.cta);
    }
  }, [activeReel?.id, draft?.hook, draft?.story, draft?.keyInsights, draft?.cta]);

  if (!activeReel || !draft) {
    return (
      <div style={{ padding: 24, textAlign: "center", marginTop: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>No Active Content</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>Please select a trend from the Discover or Explore page to generate content.</p>
      </div>
    );
  }

  // Mark all pipeline steps as completed
  const completedSteps = PIPELINE_STEPS.map((step) => ({ ...step, status: "done" as const }));

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Create</h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>Active Reel:</span> {activeReel.title} ·{" "}
              <span style={{ textTransform: "capitalize", fontWeight: 600 }}>Source: {activeReel.sourceType}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Beginner Mode Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                <Lightbulb size={14} color={beginnerMode ? "var(--accent)" : "var(--text-muted)"} style={{ fill: beginnerMode ? "var(--accent-light)" : "none" }} />
                Beginner Guide
              </span>
              <div
                onClick={() => setBeginnerMode(!beginnerMode)}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 99,
                  background: beginnerMode ? "var(--accent)" : "#D1D9E0",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "white",
                    position: "absolute",
                    top: 3,
                    left: beginnerMode ? 19 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </div>
            </div>

            <button className="btn btn-secondary" style={{ fontSize: 13 }}>
              <Layers size={14} />
              Save Draft
            </button>
            <button
  className="btn btn-primary"
  style={{ fontSize: 13 }}
  onClick={handleGenerateScript}
  disabled={isGenerating}
>
  <Sparkles size={14} />
  {isGenerating ? "Generating..." : "Regenerate All"}
</button>
{/* LinkedIn Generation Button */}
<button
  className="btn btn-outline"
  style={{ fontSize: 13, marginLeft: 8 }}
  onClick={handleGenerateLinkedIn}
  disabled={isGeneratingLinkedIn}
>
  {isGeneratingLinkedIn ? "Generating..." : "Generate LinkedIn Post"}
</button>
          </div>
        </div>
      </div>

      {/* LinkedIn Generation Result */}
      {linkedInError && (
        <div style={{ marginTop: 12, color: "#B91C1C", fontWeight: 600 }}>
          {linkedInError}
        </div>
      )}
      {linkedInResult && (
        <div className="card" style={{ padding: "18px 20px", marginTop: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            LinkedIn Post
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "var(--text-primary)", marginBottom: 8 }}>
            {linkedInResult.post}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
            Hook: {linkedInResult.hook}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
            Hashtags: {linkedInResult.hashtags.map((h) => `#${h}`).join(" ")}
          </div>
        </div>
      )}
      {/* Three-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 270px 330px", gap: 20, alignItems: "start" }}>

        {/* ─── LEFT: Script Editor + Targeting Controls ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Audience Targeting Panel */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                  border: "1px solid #BFDBFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14
                }}
              >
                🎯
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>Audience Targeting Controls</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>AI personalizes scripts, scores, and hashtags on change</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Country</label>
                <select
                  value={activeReel.targeting.country}
                  onChange={(e) => updateActiveReelTargeting({ country: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Region</label>
                <select
                  value={activeReel.targeting.region}
                  onChange={(e) => updateActiveReelTargeting({ region: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="Latin America">Latin America</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Age Group</label>
                <select
                  value={activeReel.targeting.ageGroup}
                  onChange={(e) => updateActiveReelTargeting({ ageGroup: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="Gen Z (13-24)">Gen Z (13-24)</option>
                  <option value="Millennials (25-40)">Millennials (25-40)</option>
                  <option value="Gen X (41-56)">Gen X (41-56)</option>
                  <option value="Boomers (57+)">Boomers (57+)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Gender</label>
                <select
                  value={activeReel.targeting.gender}
                  onChange={(e) => updateActiveReelTargeting({ gender: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Interest Category</label>
                <select
                  value={activeReel.targeting.interestCategory || "All"}
                  onChange={(e) => updateActiveReelTargeting({ interestCategory: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="AI">AI</option>
                  <option value="Technology">Technology</option>
                  <option value="Creator Economy">Creator Economy</option>
                  <option value="Finance">Finance</option>
                  <option value="Personal Development">Personal Development</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Productivity">Productivity</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Occupation</label>
                <select
                  value={activeReel.targeting.occupation || "All"}
                  onChange={(e) => updateActiveReelTargeting({ occupation: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", background: "white", outline: "none", cursor: "pointer" }}
                >
                  <option value="All">All</option>
                  <option value="Software Engineers">Software Engineers</option>
                  <option value="Founders">Founders</option>
                  <option value="Creators">Creators</option>
                  <option value="Marketers">Marketers</option>
                  <option value="Students">Students</option>
                  <option value="Designers">Designers</option>
                </select>
              </div>
            </div>

            {/* Dynamic Content Angle display */}
            <div style={{ padding: "8px 12px", background: "var(--accent-light)", borderRadius: 8, border: "1px solid #BFDBFE", fontSize: 11.5 }}>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>AI Angle Personalization: </span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {activeReel.targeting.ageGroup.includes("Gen Z") ? "POV Slang / High Engagement Pace" :
                 activeReel.targeting.ageGroup.includes("Millennials") ? "Startup Leverage & Founder Career" :
                 "Executive Briefing & Strategic Shift Operations"}
              </span>
            </div>
          </div>

          {/* Script Textareas */}
          {[
            { label: "🎣 Hook", value: hook, field: "hook", setter: setHook, rows: 4, desc: "The first 3 seconds determine everything" },
            { label: "📖 Story", value: story, field: "story", setter: setStory, rows: 6, desc: "Build context and credibility" },
            { label: "💡 Key Insights", value: insights, field: "keyInsights", setter: setInsights, rows: 5, desc: "The substance your audience saves" },
            { label: "📣 Call to Action", value: cta, field: "cta", setter: setCta, rows: 3, desc: "Drive engagement and follows" },
          ].map(({ label, value, field, setter, rows, desc }) => (
            <div key={label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 1 }}>{desc}</div>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 11.5, color: "#2563EB", padding: "4px 8px" }}>
                  <Wand2 size={11} />
                  AI Improve
                </button>
              </div>
              <textarea
                value={value}
                onChange={(e) => {
                  setter(e.target.value);
                  updateActiveReelDraft({ [field]: e.target.value });
                }}
                rows={rows}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                  resize: "vertical",
                  fontFamily: "inherit",
                  background: "#FAFBFC",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.background = "white"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.background = "#FAFBFC"; }}
              />

              {beginnerMode && label.includes("Hook") && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#FFF9E6", border: "1px solid #FCD34D", borderRadius: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#B45309", marginBottom: 6 }}>
                    <Lightbulb size={12} style={{ fill: "#FCD34D", color: "#B45309" }} />
                    Suggested Alternate Hooks (Click to apply)
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {getSuggestedHooks(activeReel.title, activeReel.targeting).map((shook, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setter(shook);
                          updateActiveReelDraft({ hook: shook });
                        }}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          background: "white",
                          border: "1px solid #FDE68A",
                          borderRadius: 6,
                          fontSize: 11.5,
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          fontWeight: 500,
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FFFDF5"; e.currentTarget.style.borderColor = "#FCD34D"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#FDE68A"; }}
                      >
                        {shook}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── CENTER: Reel Preview + Pipeline ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Phone Mockup */}
          <div className="card" style={{ padding: "20px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Reel Preview</div>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div className="phone-mockup">
                <div className="phone-notch" />
                <div
                  style={{
                    height: "100%",
                    background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "0 14px 20px",
                    position: "relative",
                  }}
                >
                  {/* Status bar dots */}
                  <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 4, alignItems: "center" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981" }} />
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>LIVE</div>
                  </div>

                  {/* Floating data */}
                  <div style={{ position: "absolute", top: "25%", left: 10, right: 10 }}>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.5 }}>
                      🎬 {activeReel.title}<br />
                      <span style={{ fontSize: 11, color: "white", fontWeight: 700 }}>Score: {draft.viralityScore}</span>
                    </div>
                  </div>

                  {/* Progress timeline */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                      {SCENES.map((s, i) => (
                        <div
                          key={s}
                          onClick={() => setActiveScene(i)}
                          style={{
                            flex: 1,
                            height: 3,
                            borderRadius: 99,
                            background: i <= activeScene ? "white" : "rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
                      {SCENES[activeScene]} · {(activeScene + 1) * 7}s
                    </div>
                  </div>

                  {/* Caption preview */}
                  <div
                    style={{
                      padding: "8px",
                      background: "rgba(0,0,0,0.4)",
                      borderRadius: 8,
                      fontSize: 8,
                      color: "rgba(255,255,255,0.9)",
                      lineHeight: 1.4,
                      marginBottom: 8,
                      backdropFilter: "blur(10px)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {draft.hook}
                  </div>

                  {/* Action buttons */}
                  <div style={{ position: "absolute", right: 8, bottom: 60, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                    {[{ icon: "❤️", label: "84K" }, { icon: "💬", label: "2.4K" }, { icon: "🔗", label: "Share" }].map(({ icon, label }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14 }}>{icon}</div>
                        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Voiceover status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Mic size={13} color="#059669" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>Voiceover Ready</span>
              <span style={{ fontSize: 11, color: "#6EE7B7", marginLeft: "auto" }}>28s</span>
            </div>

            {/* Thumbnail */}
            <div
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid var(--border)",
                background: "linear-gradient(135deg, #1E3A5F, #2563EB)",
                height: 90,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 900, color: "white", lineHeight: 1.2, padding: "0 12px" }}>
                  {activeReel.title}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Thumbnail Preview</div>
              </div>
            </div>
          </div>

          {/* Beginner Guide Card */}
          {beginnerMode && (
            <div className="card" style={{ padding: "18px 20px", border: "1px solid #FCD34D", background: "linear-gradient(135deg, #FFFBEB 0%, #FFFDF5 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  💡
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E" }}>Beginner Guide & Publishing Tips</div>
                  <div style={{ fontSize: 10.5, color: "#B45309" }}>Active AI advice tailored for this reel</div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Recommended formats */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>
                    🎬 Suggested Reel Format
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
                    {activeReel.targeting.ageGroup.includes("Gen Z") ? "Fast-Paced Talking Head + B-Roll" : "Clean Screen Recording with Voiceover"}
                  </div>
                  <div style={{ fontSize: 11, color: "#B45309", marginTop: 1, lineHeight: 1.3 }}>
                    {activeReel.targeting.ageGroup.includes("Gen Z") 
                      ? "Keep cuts under 1.5 seconds. Use text-on-screen hook overlays to grab attention in the first 2 seconds."
                      : "Focus on showing value immediately. Zoom in on details and keep a steady, clear professional narration."}
                  </div>
                </div>

                {/* Suggested Content Angle */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>
                    🎯 Suggested Content Angle
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
                    {activeReel.targeting.occupation === "Software Engineers" ? "Technical Hack & Leverage" :
                     activeReel.targeting.occupation === "Founders" ? "Behind-the-scenes Workflow Case Study" :
                     "Educational Beginner Breakdown"}
                  </div>
                  <div style={{ fontSize: 11, color: "#B45309", marginTop: 1, lineHeight: 1.3 }}>
                    {activeReel.targeting.occupation === "Software Engineers" ? "Explain the exact problem, show the code/tool, and conclude with the productivity output lift." :
                     activeReel.targeting.occupation === "Founders" ? "Be authentic. Share real numbers, the mistakes you made, and the exact system you set up." :
                     "Use simple analogies. Avoid complex industry jargon to keep viewers from dropping off early."}
                  </div>
                </div>

                {/* Posting Times */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>
                    ⏰ Suggested Posting Time
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>
                    {activeReel.targeting.region.includes("Asia-Pacific") ? "6:30 PM – 8:30 PM (IST)" : "5:00 PM – 7:30 PM (EST)"}
                  </div>
                  <div style={{ fontSize: 11, color: "#B45309", marginTop: 1, lineHeight: 1.3 }}>
                    Publish when your demographic's activity peaks to trigger initial algorithm recommendations.
                  </div>
                </div>

                {/* Best Platforms */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 }}>
                    📱 Suggested Platforms
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                    {activeReel.targeting.occupation === "Software Engineers" || activeReel.targeting.occupation === "Founders" ? (
                      <>
                        <span style={{ background: "white", border: "1px solid #FCD34D", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>LinkedIn Video</span>
                        <span style={{ background: "white", border: "1px solid #FCD34D", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>YouTube Shorts</span>
                      </>
                    ) : (
                      <>
                        <span style={{ background: "white", border: "1px solid #FCD34D", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>Instagram Reels</span>
                        <span style={{ background: "white", border: "1px solid #FCD34D", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>TikTok</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Suggested Topics */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 5 }}>
                    💡 Recommended Next Topics
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {getSuggestedTopics(activeReel.category).map((topic, i) => (
                      <div key={i} style={{ fontSize: 11, color: "#92400E", fontWeight: 500, background: "rgba(255, 255, 255, 0.5)", padding: "4px 8px", borderRadius: 4 }}>
                        • {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Production Pipeline */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
              Production Pipeline
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {completedSteps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: "8px 12px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#047857", fontWeight: 600 }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#059669" }}>8/8 steps</span>
            </div>
            <div className="progress-track" style={{ marginTop: 6 }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: "#059669" }}
              />
            </div>
          </div>
        </div>

        {/* ─── RIGHT: LinkedIn + Instagram + Virality ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* LinkedIn Generator */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0077B5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, color: "white", fontWeight: 900 }}>in</span>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>LinkedIn Post</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Professional audience</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPreviewPlatform("LinkedIn")}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}
                >
                  Preview
                </button>
                <CopyButton text={draft.linkedInPost} />
              </div>
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: "#F8FAFC",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                fontSize: 12.5,
                color: "var(--text-primary)",
                lineHeight: 1.65,
                maxHeight: 180,
                overflowY: "auto",
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
                marginBottom: 10,
              }}
            >
              {draft.linkedInPost}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {draft.linkedInHashtags.slice(0, 5).map((h) => (
                <span key={h} style={{ fontSize: 11, color: "#0077B5", fontWeight: 600, background: "#F0F9FF", padding: "2px 8px", borderRadius: 99, border: "1px solid #BAE6FD" }}>
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Instagram Generator */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "linear-gradient(135deg, #E1306C, #833AB4, #F77737)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 14, color: "white" }}>📸</span>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>Instagram Caption</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Visual-first audience</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPreviewPlatform("Instagram")}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "6px 10px", display: "flex", alignItems: "center", gap: 4 }}
                >
                  Preview
                </button>
                <CopyButton text={draft.instagramCaption} />
              </div>
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: "#FAFBFF",
                borderRadius: 8,
                border: "1px solid var(--border-subtle)",
                fontSize: 12.5,
                color: "var(--text-primary)",
                lineHeight: 1.65,
                maxHeight: 140,
                overflowY: "auto",
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
                marginBottom: 8,
              }}
            >
              {draft.instagramCaption}
            </div>
            <div
              style={{
                padding: "8px 12px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                borderRadius: 7,
                fontSize: 12,
                color: "#C2410C",
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              {draft.instagramCTA}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {draft.instagramHashtags.slice(0, 6).map((h) => (
                <span key={h} style={{ fontSize: 11, color: "#7C3AED", fontWeight: 600, background: "#F5F3FF", padding: "2px 7px", borderRadius: 99, border: "1px solid #DDD6FE" }}>
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Virality Panel */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Virality Prediction Engine
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12 }}>AI-powered forecast before publishing</div>

            <ViralityGauge score={draft.viralityScore} />

            {/* Audience Demographic Breakdown */}
            <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px", marginTop: 10, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                🎯 Target Audience Persona
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "flex", gap: 4, alignItems: "center" }}>
                  <span>🌍</span> <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeReel.targeting.country}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "flex", gap: 4, alignItems: "center" }}>
                  <span>👥</span> <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeReel.targeting.ageGroup}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "flex", gap: 4, alignItems: "center" }}>
                  <span>💼</span> <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeReel.targeting.occupation || "All"}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", display: "flex", gap: 4, alignItems: "center" }}>
                  <span>💡</span> <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeReel.targeting.interestCategory || "All"}</span>
                </div>
              </div>
            </div>

            {/* Expected metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "14px 0" }}>
              {[
                { label: "Views", value: draft.expectedViews, icon: "👁️", color: "#2563EB" },
                { label: "Likes", value: draft.expectedLikes, icon: "❤️", color: "#DC2626" },
                { label: "Shares", value: draft.expectedShares, icon: "🔗", color: "#7C3AED" },
                { label: "Saves", value: draft.expectedSaves, icon: "🔖", color: "#059669" },
                { label: "Watch Time", value: `${Math.round(10 + (draft.viralityScore * 0.15))}s`, icon: "⏱️", color: "#D97706" },
                { label: "Retention Rate", value: `${Math.round(35 + (draft.viralityScore * 0.45))}%`, icon: "📈", color: "#0891B2" }
              ].map((m) => (
                <div key={m.label} style={{ padding: "9px 10px", background: "#FAFBFC", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: 9.5, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>
                    {m.icon} {m.label}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: m.color, lineHeight: 1.2 }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                Score Breakdown
              </div>
              <ScoreBar label="Hook Strength" value={draft.breakdown.hookStrength} color="#DC2626" />
              <ScoreBar label="Topic Momentum" value={draft.breakdown.topicMomentum} color="#D97706" />
              <ScoreBar label="Search Interest" value={draft.breakdown.searchInterest} color="#2563EB" />
              <ScoreBar label="Audience Fit" value={draft.breakdown.audienceFit} color="#7C3AED" />
              <ScoreBar label="Novelty" value={draft.breakdown.novelty} color="#0891B2" />
              <ScoreBar label="CTA Strength" value={draft.breakdown.ctaStrength} color="#059669" />
            </div>
          </div>

          {/* Platform Recommendation Scores Card */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Platform Recommendation Scores
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 14 }}>
              Distribution potential based on audience traits
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Instagram Reels", score: activeReel.platformScores?.instagram || 80, color: "#E1306C", logo: "📸" },
                { name: "LinkedIn Video", score: activeReel.platformScores?.linkedin || 80, color: "#0077B5", logo: "💼" },
                { name: "YouTube Shorts", score: activeReel.platformScores?.youtubeShorts || 80, color: "#FF0000", logo: "🎬" },
                { name: "TikTok", score: activeReel.platformScores?.tiktok || 80, color: "#000000", logo: "🎵" }
              ].map((p) => (
                <div key={p.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{p.logo}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: p.color }}>{p.score}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}>
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.score}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ background: p.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why It Will Go Viral Panel */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Why It Will Go Viral
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 14 }}>
              AI Content Officer strategic score breakdown
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  factor: "Strong Hook",
                  desc: "Compares high-stakes financial figures or topics within 3s, creating instant curiosity.",
                  color: "#DC2626"
                },
                {
                  factor: "Trend Momentum",
                  desc: "Rides on automation indicators and viral social discussion tags.",
                  color: "#D97706"
                },
                {
                  factor: "Audience Match",
                  desc: `Optimized for ${activeReel.targeting.ageGroup} in ${activeReel.targeting.country}.`,
                  color: "#7C3AED"
                },
                {
                  factor: "Novelty",
                  desc: "Presents specific case analysis or personal insights over general clichés.",
                  color: "#0891B2"
                },
                {
                  factor: "Search Interest",
                  desc: "Indexes keywords mapped to high Google Trends query indexes.",
                  color: "#2563EB"
                },
                {
                  factor: "CTA Strength",
                  desc: "Prompts open-ended comments boosting algorithms and watch duration.",
                  color: "#059669"
                }
              ].map((item) => (
                <div key={item.factor} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: item.color,
                      marginTop: 6,
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)" }}>{item.factor}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.4, marginTop: 1 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Previews Modal */}
      <AnimatePresence>
        {previewPlatform && (
          <div
            onClick={() => setPreviewPlatform(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 22, 41, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              padding: 20
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: "100%",
                maxWidth: 480,
                background: "white",
                padding: 0,
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
                  {previewPlatform} Post Preview
                </h3>
                <button
                  onClick={() => setPreviewPlatform(null)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: 20, maxHeight: "60vh", overflowY: "auto", background: "#F1F5F9" }}>
                {previewPlatform === "LinkedIn" ? (
                  // LinkedIn Mock Post
                  <div style={{ background: "white", borderRadius: 8, border: "1px solid #E2E8F0", padding: 16 }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 16 }}>
                        AC
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1629" }}>Alex Creator</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>AI Content Specialist @ CreatorOS</div>
                        <div style={{ fontSize: 10.5, color: "#94A3B8", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                          <span>1h ago</span> • <span>🌐</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.6, whiteSpace: "pre-wrap", marginBottom: 14 }}>
                      {draft.linkedInPost}
                    </div>

                    {/* Mock image/banner */}
                    <div style={{ background: "linear-gradient(135deg, #1E3A5F, #2563EB)", height: 160, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", marginBottom: 14 }}>
                      <div style={{ textAlign: "center", color: "white", padding: 12 }}>
                        <div style={{ fontSize: 15, fontWeight: 900 }}>{activeReel.title}</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>creatoros.ai</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#64748B", borderBottom: "1px solid #F1F5F9", paddingBottom: 10, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span>👍 ❤️ 💡</span>
                        <span>1,842 likes</span>
                      </div>
                      <div>214 comments • 45 reposts</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "space-around", fontSize: 12.5, fontWeight: 600, color: "#64748B" }}>
                      <span>👍 Like</span>
                      <span>💬 Comment</span>
                      <span>🔁 Repost</span>
                      <span>✈️ Send</span>
                    </div>
                  </div>
                ) : (
                  // Instagram Mock Post
                  <div style={{ background: "white", borderRadius: 8, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #E1306C, #C13584)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12 }}>
                        AC
                      </div>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1629" }}>alex_creator</div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>Original Audio</div>
                      </div>
                      <span style={{ marginLeft: "auto", fontWeight: 700, color: "#0F1629", cursor: "pointer" }}>•••</span>
                    </div>

                    {/* Post Media (Reel Preview Thumbnail) */}
                    <div style={{ background: "linear-gradient(135deg, #1E3A5F, #2563EB)", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ textAlign: "center", color: "white", padding: 20 }}>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{activeReel.title}</div>
                        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 10 }}>📊 Virality Score: {draft.viralityScore}</div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: "flex", gap: 14, padding: "12px 14px", fontSize: 18 }}>
                      <span>❤️</span>
                      <span>💬</span>
                      <span>✈️</span>
                      <span style={{ marginLeft: "auto" }}>🔖</span>
                    </div>

                    {/* Likes & Caption */}
                    <div style={{ padding: "0 14px 14px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1629", marginBottom: 6 }}>12,847 views</div>
                      <div style={{ fontSize: 12, color: "#1E293B", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        <strong>alex_creator</strong> {draft.instagramCaption}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "#FAFBFC" }}>
                <button
                  onClick={() => setPreviewPlatform(null)}
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                >
                  Done Previewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function getSuggestedHooks(title: string, targeting: any) {
  const occ = targeting.occupation || "All";
  const age = targeting.ageGroup || "";
  
  if (occ === "Software Engineers" || occ === "Developers") {
    return [
      `🚨 Attention Software Engineers: This "${title}" hack is saving me 15 hours of debugging a week.`,
      `If you're a developer and you aren't using this "${title}" strategy yet, you're working 2x harder than you need to. 💻`,
      `Here is a secret tool for "${title}" that every programmer needs in their setup. 🛠️`
    ];
  } else if (occ === "Student" || occ === "College Student" || targeting.occupation?.toLowerCase().includes("student")) {
    return [
      `POV: You're a college student trying to survive coding classes, and this "${title}" strategy changes everything. 🎓`,
      `If you're still studying "${title}" the traditional way, stop. Do this instead.`,
      `The ultimate study hack for "${title}" that got me an A+ without studying overnight. ⚡`
    ];
  } else if (occ === "Founders" || occ === "Entrepreneurs") {
    return [
      `How we scaled our SaaS revenue by 32% using this simple "${title}" operational loop. 🚀`,
      `Every founder needs to automate this "${title}" workflow immediately. Here is our blueprint.`,
      `I built a micro-business around "${title}" with zero employees. Let me show you how. 💼`
    ];
  } else if (age.includes("Gen Z")) {
    return [
      `No cap, this "${title}" hack feels illegal to know. 🧢⚡`,
      `POV: You realize everyone has been gatekeeping this "${title}" secret from you.`,
      `This is your sign to start focusing on "${title}" in 2026 before it's too late.`
    ];
  } else {
    return [
      `Here is exactly how to get started with "${title}" as a complete beginner. 🧠`,
      `The 3 biggest mistakes people make with "${title}" (and how to fix them).`,
      `What nobody tells you about "${title}" and why most tutorials fail.`
    ];
  }
}

function getSuggestedTopics(category: string) {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("ai")) {
    return [
      "AI Agents vs Custom API Integrations in 2026",
      "How to Build a Personalized Knowledge Vault",
      "Top 5 Prompting Mistakes Creators Make"
    ];
  } else if (cat.includes("travel")) {
    return [
      "I Traveled to 3 Countries with Just a Backpack",
      "Hidden Visa Hacks for Indian Citizens",
      "The Reality of Digital Nomad Lifestyle Costs"
    ];
  } else if (cat.includes("food")) {
    return [
      "Why Michelin Chefs Never Clean Pans with Water",
      "The ₹50 Meal Plan That Got Me Ripped",
      "Street Food Secrets: Why MSG is Actually Fine"
    ];
  } else if (cat.includes("business") || cat.includes("startup")) {
    return [
      "How to Validate Your SaaS Idea for $0",
      "Why You Don't Need Venture Capital to Scale",
      "The Operational Blueprint of a Solo Millionaire"
    ];
  } else {
    return [
      "Why Spot Light Hooks Drive 30% Higher Views",
      "How to Set Up Your Lighting for Under $50",
      "The Storytelling Blueprint for Short Form Reels"
    ];
  }
}
