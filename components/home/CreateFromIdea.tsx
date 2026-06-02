"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Lightbulb, Zap, Eye, Bookmark, Check, CalendarDays, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { expandIdeas, runReelAgent } from "@/lib/api";

const VAGUE_IDEAS_MAP: Record<string, string[]> = {
  food: [
    "5 Places In India Nobody Talks About (Food Edition)",
    "What ₹100 Buys In Different Countries",
    "Why Street Food Vendors Outsell Big Restaurants",
    "The Science Behind Fast Food Addiction",
    "Best High Protein Indian Meals Under ₹100",
    "I Ate Only Street Food For 24 Hours: Results",
    "3 Healthy Snacks You Can Make in 5 Minutes",
    "The Truth About Organic Food Labels",
    "How A Local Tea Shop Generates ₹1 Lakh Per Day",
    "5 Cooking Hacks From Michelin Star Chefs",
    "Why Indian Spices Rule The Global Culinary Scene",
    "The Worst Food Combos That People Actually Love",
    "How Food Delivery Apps Manipulate Your Cravings",
    "I Tried A 17th Century Historical Recipe",
    "Is Coffee Actually Good For Your Productivity?"
  ],
  travel: [
    "5 Places In India Nobody Talks About",
    "What ₹100 Buys In Different Countries (Travel Edition)",
    "Biggest Travel Mistakes First-Time Tourists Make",
    "Hidden Gems In Northeast India You Must Visit",
    "Countries Where Indians Can Travel Visa-Free",
    "How To Travel Europe For Under $50 A Day",
    "Solo Travel Safety Rules Nobody Tells You",
    "What I Packed For A 3-Month Backpacking Trip",
    "How To Earn Money While Traveling Full-Time",
    "Why You Should Never Exchange Currency At Airports",
    "The Secret Hacks To Find Cheap Flight Tickets",
    "I Slept In A Capsule Hotel: Is It Worth It?",
    "5 Underrated Countries That Feel Like A Fairy Tale",
    "How Travel Insurance Saved Me $10,000",
    "The Real Cost of Traveling To Bali In 2026"
  ],
  business: [
    "How I started a Micro-SaaS in one weekend",
    "Why 90% of startups fail in the first year",
    "3 marketing strategies that cost $0 to start",
    "How to find your first 10 paying customers",
    "The leverage mindset: scaling with zero employees",
    "How a local laundry service built a $1M startup",
    "Why subscription business models are money printers",
    "How to negotiate equity when joining a startup",
    "5 books every aspiring entrepreneur must read",
    "The business of creators: how influencers monetize",
    "How to draft a simple business contract in 5 mins",
    "Why hiring slow and firing fast is crucial for growth",
    "How pricing psychology determines your company's revenue",
    "I pitched 50 VCs and got 0 checks: here's what I learned",
    "Why cash flow is way more important than profit"
  ],
  ai: [
    "5 AI tools that will save you 20 hours a week",
    "Vibe coding: building apps without knowing how to code",
    "How autonomous AI agents are replacing junior workers",
    "The future of software engineering in the age of LLMs",
    "How to write prompts that actually get results",
    "I built an AI clone of myself to answer emails",
    "Why AI search engines are replacing Google Search",
    "How to start an AI automation agency (AAA) in 2026",
    "The dark side of AI deepfakes nobody is prepared for",
    "How AI is changing the music and creative industry",
    "Why prompt engineering is a dead skill (And what's next)",
    "I automated my entire content pipeline using AI agents",
    "5 industries AI will disrupt by the end of this year",
    "The ethics of training AI models on public content",
    "How local businesses are using AI to double output"
  ],
  fitness: [
    "3 exercises to build core strength at home",
    "How to stay consistent with the gym",
    "What I eat in a day to build muscle",
    "The myth of spot reduction explained",
    "Gym beginner guide: first week workout",
    "How to calculate your maintenance calories in 2 mins",
    "The real reason your muscles are sore after workouts",
    "Is cardio or weight lifting better for fat loss?",
    "How I fixed my posture in 15 days at my desk",
    "Why sleep is 80% of your muscle recovery",
    "The truth about creatine: benefits and side effects",
    "5 stretching routines to relieve lower back pain",
    "How to build a home gym for under $200",
    "Why drinking water increases fat loss speed",
    "I did 100 pushups everyday for 30 days: results"
  ],
  politics: [
    "How elections are won using digital algorithms",
    "Why trade policies affect the price of your groceries",
    "The history of lobbying in modern democracies",
    "How clean energy policies reshape global geopolitics",
    "Why local elections have more impact than national ones",
    "How young voters are changing political discourse",
    "The role of independent media in a polarized society",
    "Why the housing crisis is a political choice",
    "How tax reform benefits the top 1% (And why it persists)",
    "Geopolitical conflicts in 2026: what you need to know",
    "How political propaganda spreads on short-form video",
    "Why public healthcare is debated in major nations",
    "The history of student protests that changed laws",
    "How redistricting and gerrymandering manipulate votes",
    "The future of global governance in a multipolar world"
  ],
  religion: [
    "The history of major world religions explained",
    "How sacred texts are translated: lost meanings",
    "The intersection of science and spirituality",
    "Why pilgrimage sites attract millions of tourists annually",
    "The origins of modern religious holidays and festivals",
    "How architecture reflects religious beliefs in history",
    "The role of religion in forming modern civil laws",
    "Why meditation and mindfulness span multiple faiths",
    "How religious movements adapt to the digital age",
    "The philosophy of moral codes across cultures",
    "Underrepresented religious cultures you should know about",
    "How music and chanting affect the human brain state",
    "The historical relationship between religion and art",
    "Why different cultures have different creation stories",
    "The ethics of religious tolerance in modern society"
  ],
  education: [
    "Why the traditional school system is outdated",
    "How to self-educate using free online resources",
    "5 study techniques backed by cognitive science",
    "The active recall method: memorize anything fast",
    "How to learn a new language in 6 months solo",
    "Why generalist degrees are declining in value",
    "The future of universities: online credentials vs degrees",
    "How to read 50 books a year without losing speed",
    "Why teaching others is the ultimate learning cheat code",
    "How gamified learning apps like Duolingo retain users",
    "The role of financial literacy in early education",
    "Why note-taking systems like Obsidian double memory",
    "How to write high-quality research papers using AI tools",
    "The history of schooling: why we sit in desks",
    "How to build a personal knowledge management (PKM) vault"
  ]
};

export default function CreateFromIdea() {
  const [idea, setIdea] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [previewIdeaText, setPreviewIdeaText] = useState<string | null>(null);
  const [calendarToast, setCalendarToast] = useState<string | null>(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [agentError, setAgentError] = useState<string | null>(null);

  const generateReelWithWorkflow = useAppStore((state) => state.generateReelWithWorkflow);
  const addReel = useAppStore((state) => (state as any).addReel);
  const savedIdeas = useAppStore((state) => state.savedIdeas);
  const saveIdea = useAppStore((state) => state.saveIdea);
  const unsaveIdea = useAppStore((state) => state.unsaveIdea);
  const reels = useAppStore((state) => state.reels);
  const router = useRouter();

  /** Detect whether input is vague (≤2 meaningful words) */
  const isVague = (text: string) => text.trim().split(/\s+/).length <= 2;

  const handleInputChange = (val: string) => {
    setIdea(val);
    const normalized = val.trim().toLowerCase();

    // Show static suggestions immediately for known keys while typing
    const matchedKey = Object.keys(VAGUE_IDEAS_MAP).find(
      (k) => normalized.includes(k) || k.includes(normalized)
    );

    if (matchedKey && normalized.length > 0) {
      setSuggestions(VAGUE_IDEAS_MAP[matchedKey]);
      setShowSuggestions(true);
    } else if (normalized.length >= 3 && normalized.length < 15) {
      setSuggestions([
        `Why most people fail at ${val}`,
        `3 secrets of ${val} you need to know`,
        `How to master ${val} in 30 days`,
        `The future of ${val} in 2026`,
        `How I got started with ${val}`
      ]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggested: string) => {
    setIdea(suggested);
    setShowSuggestions(false);
  };

  /** Full agent workflow — calls /api/generate-reel-agent */
  const triggerAgentWorkflow = async (text: string) => {
    const ideaLower = text.toLowerCase();
    let category = "General";
    if (ideaLower.includes("food") || ideaLower.includes("eat") || ideaLower.includes("meal") || ideaLower.includes("recipe")) category = "Food";
    else if (ideaLower.includes("career") || ideaLower.includes("job") || ideaLower.includes("study") || ideaLower.includes("education")) category = "Education";
    else if (ideaLower.includes("gym") || ideaLower.includes("fit") || ideaLower.includes("muscle") || ideaLower.includes("workout")) category = "Fitness";
    else if (ideaLower.includes("travel") || ideaLower.includes("europe") || ideaLower.includes("places")) category = "Travel";
    else if (ideaLower.includes("saas") || ideaLower.includes("business") || ideaLower.includes("startup")) category = "Business";
    else if (ideaLower.includes("ai") || ideaLower.includes("agent") || ideaLower.includes("coding") || ideaLower.includes("engineer")) category = "AI";

    setAgentRunning(true);
    setAgentLog([]);
    setAgentError(null);

    try {
      const result = await runReelAgent(text, category);
      setAgentLog(result.agentLog);

      // Inject the generated reel into Zustand store
      const store = useAppStore.getState();
      const agentReel = {
        ...result.reel,
        draft: {
          ...result.reel.draft,
          linkedInPost: result.reel.draft.linkedInPost,
          instagramCaption: result.reel.draft.instagramCaption,
          linkedInHashtags: result.reel.draft.linkedInHashtags,
          instagramHashtags: result.reel.draft.instagramHashtags,
          instagramCTA: result.reel.draft.instagramCTA,
        },
      };
      store.reels.unshift(agentReel as any);
      useAppStore.setState({ reels: [agentReel as any, ...reels], activeReelId: agentReel.id });

      router.push("/create");
    } catch (err: any) {
      console.error("Agent workflow error:", err);
      setAgentError(err.message ?? "Agent workflow failed. Falling back to local generation.");
      // Graceful fallback to Zustand-based generation
      generateReelWithWorkflow(text, "idea", category, undefined, router);
    } finally {
      setAgentRunning(false);
    }
  };

  /** Handle form submit — expand ideas if vague, otherwise run agent directly */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    if (isVague(idea) && !showSuggestions) {
      // Try to expand with Gemini
      setIsLoadingIdeas(true);
      try {
        const ideas = await expandIdeas(idea);
        setSuggestions(ideas);
        setShowSuggestions(true);
      } catch {
        // Fallback to static map
        const normalized = idea.trim().toLowerCase();
        const matchedKey = Object.keys(VAGUE_IDEAS_MAP).find((k) => normalized.includes(k));
        if (matchedKey) {
          setSuggestions(VAGUE_IDEAS_MAP[matchedKey]);
          setShowSuggestions(true);
        } else {
          triggerAgentWorkflow(idea);
        }
      } finally {
        setIsLoadingIdeas(false);
      }
    } else {
      triggerAgentWorkflow(idea);
    }
  };

  const handleAddToCalendar = (title: string) => {
    setCalendarToast(title);
    setTimeout(() => setCalendarToast(null), 3000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, #FFFFFF 0%, #FAFBFC 100%)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
          marginBottom: 28,
          position: "relative"
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
              border: "1px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Lightbulb size={20} color="#2563EB" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
              Smart Idea Generator & AI Briefing
            </h2>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
              Input vague keywords like <strong>food</strong>, <strong>travel</strong>, <strong>business</strong>, <strong>politics</strong>, or <strong>AI</strong>. CreatorOS will generate up to 20 actionable hooks.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, alignItems: "stretch", marginBottom: showSuggestions ? 14 : 0 }}>
          <input
            type="text"
            value={idea}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="e.g., travel, business, food, or enter your own custom idea here..."
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 13.5,
              color: "var(--text-primary)",
              background: "#FAFBFC",
              outline: "none",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2563EB";
              e.target.style.background = "white";
              e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.background = "#FAFBFC";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={!idea.trim() || isLoadingIdeas || agentRunning}
            className="btn btn-primary"
            style={{
              padding: "0 22px",
              fontSize: 13,
              fontWeight: 700,
              gap: 8,
              opacity: idea.trim() && !isLoadingIdeas && !agentRunning ? 1 : 0.6,
              cursor: idea.trim() && !isLoadingIdeas && !agentRunning ? "pointer" : "not-allowed",
            }}
          >
            {isLoadingIdeas ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : agentRunning ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
            {isLoadingIdeas ? "Finding Ideas..." : agentRunning ? "Agent Running..." : "Generate Reel"}
          </button>
        </form>

        {/* Agent running log */}
        {agentRunning && agentLog.length > 0 && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "#F0FDF4", borderRadius: 8, border: "1px solid #BBF7D0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>🤖 Agent Workflow Live Log</div>
            {agentLog.map((log, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "#047857", marginBottom: 2 }}>✓ {log}</div>
            ))}
          </div>
        )}

        {/* Agent error */}
        {agentError && (
          <div style={{ marginTop: 8, padding: "8px 12px", background: "#FFF1F2", border: "1px solid #FECDD3", borderRadius: 8, fontSize: 12, color: "#BE123C" }}>
            ⚠ {agentError}
          </div>
        )}

        {/* Suggested Reel Ideas List */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "12px 0 0", borderTop: "1px dashed var(--border-subtle)", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                  <Zap size={11} /> AI Generated Suggestions ({suggestions.length}):
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
                  {suggestions.map((sug) => {
                    const isSaved = savedIdeas.includes(sug);
                    return (
                      <div
                        key={sug}
                        style={{
                          padding: "10px 14px",
                          background: "#FAFBFC",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span
                          onClick={() => handleSelectSuggestion(sug)}
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            flex: 1
                          }}
                        >
                          💡 {sug}
                        </span>

                        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                          <button
                            onClick={() => setPreviewIdeaText(sug)}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: 11, gap: 4 }}
                            title="Preview Idea Profile"
                          >
                            <Eye size={11} /> Preview
                          </button>
                          <button
                            onClick={() => triggerAgentWorkflow(sug)}
                            className="btn btn-primary"
                            style={{ padding: "4px 8px", fontSize: 11, gap: 4 }}
                            disabled={agentRunning}
                          >
                            <Sparkles size={11} /> {agentRunning ? "..." : "Create"}
                          </button>
                          <button
                            onClick={() => isSaved ? unsaveIdea(sug) : saveIdea(sug)}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", color: isSaved ? "#059669" : "var(--text-secondary)", borderColor: isSaved ? "#BBF7D0" : "var(--border)", background: isSaved ? "#F0FDF4" : "white" }}
                          >
                            {isSaved ? <Check size={11} /> : <Bookmark size={11} />}
                          </button>
                          <button
                            onClick={() => handleAddToCalendar(sug)}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px" }}
                            title="Add to Calendar"
                          >
                            <Plus size={11} /> Calendar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview Idea Modal */}
      <AnimatePresence>
        {previewIdeaText && (
          <div
            onClick={() => setPreviewIdeaText(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 22, 41, 0.4)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 20
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="card"
              style={{
                width: "100%",
                maxWidth: 460,
                background: "white",
                padding: 0,
                overflow: "hidden",
                boxShadow: "var(--shadow-lg)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} color="var(--accent)" /> AI Content Concept Preview
                </h3>
                <button
                  onClick={() => setPreviewIdeaText(null)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "var(--text-muted)", fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)", border: "1px solid #DBEAFE", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Suggested Title</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1629", lineHeight: 1.4 }}>"{previewIdeaText}"</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Predicted Virality</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#059669" }}>88/100 · 🔥 High Potential</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Hook Concept</div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      "Most people think they know how to handle {previewIdeaText.toLowerCase()}, but this 1 mistake is costing them thousands. Stop scrolling..."
                    </p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Recommended Platform</div>
                    <span style={{ background: "#F5F3FF", color: "#7C3AED", fontSize: 11.5, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid #DDD6FE" }}>
                      📱 Instagram Reels & YouTube Shorts
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border-subtle)", background: "#FAFBFC", gap: 8, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    const isSaved = savedIdeas.includes(previewIdeaText!);
                    isSaved ? unsaveIdea(previewIdeaText!) : saveIdea(previewIdeaText!);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: 12.5 }}
                >
                  {savedIdeas.includes(previewIdeaText!) ? "Unsave" : "Save Concept"}
                </button>
                <button
                  onClick={() => {
                    triggerAgentWorkflow(previewIdeaText!);
                    setPreviewIdeaText(null);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: 12.5 }}
                  disabled={agentRunning}
                >
                  {agentRunning ? "Agent Running..." : "Create with Agent"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Add Toast */}
      <AnimatePresence>
        {calendarToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 10000,
              background: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #2563EB",
              boxShadow: "0 10px 30px rgba(37, 99, 235, 0.15)",
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              backdropFilter: "blur(8px)"
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CalendarDays size={14} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>Added to Calendar!</div>
              <div style={{ fontSize: 11.5, color: "#2563EB", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                "{calendarToast}" scheduled for tomorrow.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
