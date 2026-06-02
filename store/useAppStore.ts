import { create } from "zustand";
import { Trend, ContentDraft, Reel, AudienceTargeting, CreatorProfile } from "@/types";
import { DEFAULT_DRAFT } from "@/lib/constants";

type Page = "home" | "explore" | "analyze" | "create" | "measure" | "settings" | "my-reels";

interface AppState {
  activePage: Page;
  selectedTrend: Trend;
  contentDraft: ContentDraft;
  sidebarOpen: boolean;

  // Creator-centric Content Library
  reels: Reel[];
  activeReelId: string | null;
  setReels: (reels: Reel[]) => void;

  // AI Workflow generation state
  isGenerating: boolean;
  isGeneratingAudio: boolean;
  generationStep: number;
  autonomousLog: { step: number; message: string }[];
  isAutonomousRunning: boolean;
  autonomousResult: { 
    reel: Reel; 
    aiReasoningSummary: string;
    dashboardTrends?: {
      recommended: Trend[];
      mostViral: Trend[];
      highestGrowth: Trend[];
      newestTrends: Trend[];
    };
  } | null;

  setActivePage: (page: Page) => void;
  setSelectedTrend: (trend: Trend) => void;
  updateDraft: (patch: Partial<ContentDraft>) => void;
  toggleSidebar: () => void;

  // Reel actions
  setActiveReelId: (id: string | null) => void;
  createReelFromIdea: (idea: string) => void;
  createReelFromTrend: (trend: Trend) => void;
  generateReelWithWorkflow: (
    title: string,
    sourceType: "trend" | "idea",
    category: string,
    trend?: Trend,
    router?: any
  ) => void;
  runAutonomousAgent: (router?: any) => void;
  postAutonomousResult: (router?: any) => void;
  updateActiveReelDraft: (patch: Partial<ContentDraft>) => void;
  updateActiveReelTargeting: (targeting: Partial<AudienceTargeting>) => void;
  duplicateReel: (id: string) => void;
  deleteReel: (id: string) => void;
  updateReelStatus: (id: string, status: Reel["status"]) => void;
  generateAudioForReel: (id: string, text: string) => Promise<void>;

  // Creator Profile Personalization
  creatorProfile: CreatorProfile;
  setCreatorProfile: (profile: Partial<CreatorProfile>) => void;

  // Saved Ideas
  savedIdeas: string[];
  saveIdea: (idea: string) => void;
  unsaveIdea: (idea: string) => void;

  // Beginner Friendly Mode
  beginnerMode: boolean;
  setBeginnerMode: (val: boolean) => void;

  // User auth state
  user: { name: string; email: string; isLoggedIn: boolean } | null;
  loginUser: (name: string, email: string) => void;
  logoutUser: () => void;
}

// Helper to generate a default content draft for any custom user idea
const createDefaultDraftForTopic = (topic: string): ContentDraft => {
  const cleanTopic = topic.trim();
  return {
    id: `draft_${Date.now()}`,
    trendId: "custom",
    hook: `Here is exactly how I went from nothing to mastering ${cleanTopic} — and why most people get it wrong. 🧠\n\nIf you want to achieve this in 2026, stop scrolling.`,
    story: `When I first started focusing on ${cleanTopic}, I had zero credibility. I spent weeks making mistakes, trying to figure out what actually worked.\n\nBut then I discovered a simple 3-step framework that changed everything. And the results? They speak for themselves...`,
    keyInsights: `• Step 1: Audit your current strategy and remove bottlenecks\n• Step 2: Leverage modern tools and automated workflows\n• Step 3: Implement rapid feedback loops based on weekly analytics`,
    cta: `What is your biggest blocker with ${cleanTopic}? Let me know in the comments, and follow for more breakdowns! 🚀`,
    linkedInPost: `I spent months trying to figure out ${cleanTopic} so you don't have to. Here is my exact playbook:\n\n1. The operational framework\n2. The automation strategy\n3. The feedback loop\n\nWhat is your biggest challenge here? Let's discuss in the comments.\n\n#Career #SaaS #GrowthMindset #Innovation`,
    instagramCaption: `Here is the ultimate blueprint for ${cleanTopic} in 2026 🤯\n\nSave this for later 🔖`,
    linkedInHashtags: ["#Career", "#SaaS", "#GrowthMindset", "#Innovation"],
    instagramHashtags: ["#strategy", "#career", "#productivity", "#learning", "#2026"],
    instagramCTA: "💬 What's your take? Drop a comment below!",
    viralityScore: 82,
    expectedViews: "100K – 350K",
    expectedLikes: "5K – 12K",
    expectedShares: "1.2K – 3.1K",
    expectedSaves: "2K – 5.4K",
    breakdown: {
      hookStrength: 80,
      topicMomentum: 78,
      searchInterest: 84,
      audienceFit: 82,
      novelty: 85,
      ctaStrength: 80
    }
  };
};

const INITIAL_REELS: Reel[] = [];

// Core AI Personalization engine that updates content based on audience settings
export function personalizeDraft(
  baseDraft: ContentDraft,
  targeting: AudienceTargeting,
  topicTitle: string
): ContentDraft {
  const draft = {
    ...baseDraft,
    breakdown: { ...baseDraft.breakdown }
  };

  // Adjust scores based on targets
  let score = baseDraft.viralityScore;
  if (targeting.ageGroup.includes("Gen Z")) {
    score = Math.min(99, score + 4);
    draft.breakdown.audienceFit = Math.min(99, draft.breakdown.audienceFit + 6);
  } else if (targeting.ageGroup.includes("Boomers")) {
    score = Math.max(40, score - 15);
    draft.breakdown.audienceFit = Math.max(40, draft.breakdown.audienceFit - 12);
  }
  draft.viralityScore = score;

  // Rewrite copies and tone
  const age = targeting.ageGroup;
  if (age.includes("Gen Z")) {
    draft.hook = `POV: You're trying to figure out '${topicTitle}' in 2026. Stop scrolling. No cap. 🧢⚡`;
    draft.story = `I spent weeks failing at '${topicTitle}' so you don't have to. \n\nHere is the exact 3-step blueprint I used. It's actually a cheat code...`;
    draft.cta = `What is your biggest blocker with this? Let me know in the comments. Follow for more AI career hacks! 🚀`;
    draft.instagramCaption = `POV: Mastering '${topicTitle}' is a major vibe check in 2026 🤯\n\nCheck the comments for details.👇\n\n#GenZ #FutureOfWork #Tips #Careers`;
    draft.instagramHashtags = ["#genz", "#learning", "#growth", "#careers", "#automation", "#nocap"];
    draft.linkedInHashtags = ["#Careers", "#GenZ", "#Strategy", "#Workforce"];
  } else if (age.includes("Millennials")) {
    draft.hook = `How startup founders are leveraging '${topicTitle}' to scale operations with zero team overhead. 🤖💼`;
    draft.story = `When I built my operations around '${topicTitle}', my leverage tripled.\n\nHere is the exact operational framework I deployed to achieve this.`;
    draft.cta = `How are you integrating this in your workflows? Drop a reply below. Follow for more tech strategy. 🚀`;
    draft.instagramCaption = `Scale your business leverage using the '${topicTitle}' framework 📊\n\nComment below with your thoughts.\n\n#SaaS #Founders #Productivity #Leverage`;
    draft.instagramHashtags = ["#saas", "#entrepreneur", "#productivity", "#workplace", "#leangrowth"];
    draft.linkedInHashtags = ["#SaaS", "#Productivity", "#Management", "#Operations"];
  } else if (age.includes("Gen X") || age.includes("Boomers")) {
    draft.hook = `A corporate briefing on '${topicTitle}' and its impact on structural department workflows. 📈👔`;
    draft.story = `Recent corporate reports indicate that deploying '${topicTitle}' improves task efficiency by 22%.\n\nThis outline outlines the strategic transition roadmap for organizations.`;
    draft.cta = `How is your organization preparing for these automation transitions? Follow for executive briefings. 🚀`;
    draft.instagramCaption = `Workforce restructuring analysis: '${topicTitle}' 📊\n\nFull analysis details at CreatorOS.\n\n#Leadership #CorporateStrategy #Efficiency #Automation`;
    draft.instagramHashtags = ["#leadership", "#automation", "#corporate", "#efficiency", "#business"];
    draft.linkedInHashtags = ["#Leadership", "#CorporateStrategy", "#Efficiency", "#Automation"];
  }

  // Rewrite based on occupation
  const occ = targeting.occupation;
  if (occ === "Software Engineers" || occ === "Developers" || occ === "Coding") {
    draft.hook = `POV: You're a software engineer writing code about '${topicTitle}' in 2026. Stop scrolling. 💻🤖`;
    draft.story = `I spent months debugging my workflows so you don't have to. Here's the exact setup I used to automate this with AI agents...`;
  } else if (occ === "Founders" || occ === "Entrepreneurs" || occ === "Business Owner") {
    draft.hook = `How founders are leveraging '${topicTitle}' to scale operations with zero employee overhead. 🚀💼`;
    draft.story = `Last month, we built a micro-SaaS with zero employee overhead using autonomous AI agents. Here is the operational breakdown...`;
  } else if (occ === "Student" || occ === "College Student") {
    draft.hook = `POV: You're a student trying to survive in the age of AI. '${topicTitle}' is your ultimate cheat code. 🎓⚡`;
    draft.story = `If you're still studying this topic the old way, you are falling behind. Here is exactly how I hack my productivity using modern workflows...`;
  } else if (occ === "Marketers" || occ === "Designer" || occ === "Freelancer") {
    draft.hook = `How modern creative professionals use '${topicTitle}' to double their freelance output and charge premium rates. 🎨📈`;
    draft.story = `The old agency model is dead. Freelancers who learn this setup are scaling their portfolios with zero team overhead...`;
  } else if (occ === "All") {
    // Keep base/neutral draft text if both are set to All
    if (age === "All") {
      draft.hook = baseDraft.hook;
      draft.story = baseDraft.story;
      draft.cta = baseDraft.cta;
      draft.instagramCaption = baseDraft.instagramCaption;
    }
  } else {
    // Corporate/Default
    draft.hook = `A corporate briefing on '${topicTitle}' and its structural impact on organizational workflows. 👔📈`;
    draft.story = `Data shows deploying this operational framework increases structural task efficiency by 28%. Here is the executive roadmap...`;
  }

  return draft;
}

export const useAppStore = create<AppState>((set, get) => ({
  activePage: "home",
  selectedTrend: {} as Trend,
  contentDraft: DEFAULT_DRAFT,
  sidebarOpen: true,

  reels: [],
  activeReelId: null,
  setReels: (reels) => set({ reels }),

  isGenerating: false,
  isGeneratingAudio: false,
  generationStep: 0,
  autonomousLog: [],
  isAutonomousRunning: false,
  autonomousResult: null,

  creatorProfile: {
    completed: false,
    category: "AI",
    countries: ["United States"],
    regions: ["North America"],
    ageGroups: ["Gen Z (13-24)"],
    genders: ["All"],
    interests: ["Technology"],
    occupations: ["Software Engineers"]
  },

  setCreatorProfile: (profilePatch) => set((state) => ({
    creatorProfile: { ...state.creatorProfile, ...profilePatch }
  })),

  savedIdeas: [],
  saveIdea: (idea) => set((state) => {
    if (state.savedIdeas.includes(idea)) return {};
    return { savedIdeas: [...state.savedIdeas, idea] };
  }),
  unsaveIdea: (idea) => set((state) => ({
    savedIdeas: state.savedIdeas.filter((id) => id !== idea)
  })),

  beginnerMode: true,
  setBeginnerMode: (val) => set({ beginnerMode: val }),

  user: null,
  loginUser: (name, email) => set({ user: { name, email, isLoggedIn: true } }),
  logoutUser: () => set({ user: null }),

  setActivePage: (page) => set({ activePage: page }),
  setSelectedTrend: (trend) => set({ selectedTrend: trend }),
  updateDraft: (patch) =>
    set((s) => ({ contentDraft: { ...s.contentDraft, ...patch } })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  setActiveReelId: (id) => {
    const reel = get().reels.find((r) => r.id === id);
    if (reel) {
      set({
        activeReelId: id,
        contentDraft: reel.draft
      });
    } else {
      set({ activeReelId: id });
    }
  },

  createReelFromIdea: (idea) => {
    const defaultDraft = createDefaultDraftForTopic(idea);
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      title: idea,
      category: "General",
      sourceType: "idea",
      sourceName: idea,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      viralityScore: defaultDraft.viralityScore,
      status: "draft",
      targeting: { country: "United States", region: "North America", ageGroup: "Gen Z (13-24)", gender: "All", interestCategory: "All", occupation: "All" },
      draft: defaultDraft,
      platformScores: { instagram: 80, linkedin: 82, youtubeShorts: 78, tiktok: 84 }
    };

    set((state) => ({
      reels: [newReel, ...state.reels],
      activeReelId: newReel.id,
      contentDraft: newReel.draft,
      activePage: "create"
    }));
  },

  createReelFromTrend: (trend) => {
    const newReel: Reel = {
      id: `reel_${Date.now()}`,
      title: trend.name,
      category: trend.category,
      sourceType: "trend",
      sourceName: trend.name,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      viralityScore: trend.scores.overall,
      status: "draft",
      targeting: { country: "United States", region: "North America", ageGroup: "Gen Z (13-24)", gender: "All", interestCategory: trend.category, occupation: "All" },
      draft: {
        ...DEFAULT_DRAFT,
        id: `draft_${Date.now()}`,
        trendId: trend.id,
        viralityScore: trend.scores.overall,
        hook: `POV: You realize '${trend.name}' is changing everything. Stop scrolling. 🤖🔥`
      },
      platformScores: {
        instagram: trend.scores.overall,
        linkedin: Math.max(10, trend.scores.overall - 5),
        youtubeShorts: Math.max(10, trend.scores.overall - 2),
        tiktok: Math.min(100, trend.scores.overall + 2)
      }
    };

    set((state) => ({
      reels: [newReel, ...state.reels],
      activeReelId: newReel.id,
      contentDraft: newReel.draft,
      activePage: "create"
    }));
  },

  generateReelWithWorkflow: async (title, sourceType, category, trend, router) => {
    set({ isGenerating: true, generationStep: 1 });

    try {
      const res = await fetch("/api/generate-reel-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: title,
          category: category || "General",
          audience: {
            country: "United States",
            region: "North America",
            ageGroup: "Gen Z (13-24)",
            gender: "All",
            interestCategory: category || "All",
            occupation: "All"
          }
        })
      });

      set({ generationStep: 5 });

      if (!res.ok) {
        throw new Error("Failed to generate reel");
      }

      const data = await res.json();
      
      set({ generationStep: 8 });

      if (data.reel) {
        set((state) => ({
          reels: [data.reel, ...state.reels],
          activeReelId: data.reel.id,
          contentDraft: data.reel.draft,
          isGenerating: false,
          generationStep: 0,
          activePage: "create"
        }));

        if (router) {
          router.push("/create");
        }
      }
    } catch (e) {
      console.error(e);
      set({ isGenerating: false, generationStep: 0 });
    }
  },

  runAutonomousAgent: (router) => {
    set({ isAutonomousRunning: true, autonomousLog: [] });

    const eventSource = new EventSource("/api/autonomous/run");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.step === -1) {
        eventSource.close();
        set({ isAutonomousRunning: false });
        return;
      }

      set((state) => ({
        autonomousLog: [...state.autonomousLog, { step: data.step, message: data.message }],
      }));

      if (data.step === 10 && data.data?.reel) {
        eventSource.close();
        set({
          autonomousResult: {
            reel: data.data.reel,
            aiReasoningSummary: data.data.aiReasoningSummary
          },
          isAutonomousRunning: false
        });
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      set({ isAutonomousRunning: false });
    };
  },

  postAutonomousResult: (router) => {
    const state = get();
    if (state.autonomousResult) {
      set((s) => ({
        reels: [state.autonomousResult!.reel, ...s.reels],
        activeReelId: state.autonomousResult!.reel.id,
        contentDraft: state.autonomousResult!.reel.draft,
        autonomousResult: null,
        activePage: "create"
      }));
      if (router) router.push("/create");
    }
  },

  updateActiveReelDraft: (patch) => {
    const { activeReelId, reels } = get();
    if (!activeReelId) return;

    const updatedReels = reels.map((reel) => {
      if (reel.id === activeReelId) {
        const updatedDraft = { ...reel.draft, ...patch };
        return {
          ...reel,
          draft: updatedDraft,
          viralityScore: updatedDraft.viralityScore
        };
      }
      return reel;
    });

    set({
      reels: updatedReels,
      contentDraft: { ...get().contentDraft, ...patch }
    });
  },

  updateActiveReelTargeting: (targetingPatch) => {
    const { activeReelId, reels } = get();
    if (!activeReelId) return;

    const updatedReels = reels.map((reel) => {
      if (reel.id === activeReelId) {
        const newTargeting = { ...reel.targeting, ...targetingPatch };
        const personalizedDraftCopy = personalizeDraft(reel.draft, newTargeting, reel.title);
        return {
          ...reel,
          targeting: newTargeting,
          draft: personalizedDraftCopy,
          viralityScore: personalizedDraftCopy.viralityScore
        };
      }
      return reel;
    });

    const activeReel = updatedReels.find((r) => r.id === activeReelId);
    set({
      reels: updatedReels,
      contentDraft: activeReel ? activeReel.draft : get().contentDraft
    });
  },

  duplicateReel: (id) => {
    const reelToCopy = get().reels.find((r) => r.id === id);
    if (!reelToCopy) return;

    const duplicated: Reel = {
      ...reelToCopy,
      id: `reel_${Date.now()}`,
      title: `Copy of ${reelToCopy.title}`,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "draft"
    };

    set((state) => ({ reels: [...state.reels, duplicated] }));
  },

  deleteReel: (id) => {
    set((state) => ({
      reels: state.reels.filter((r) => r.id !== id),
      activeReelId: state.activeReelId === id ? null : state.activeReelId
    }));
  },

  updateReelStatus: (id, status) => {
    set((state) => ({
      reels: state.reels.map((reel) =>
        reel.id === id ? { ...reel, status } : reel
      )
    }));
  },

  generateAudioForReel: async (id: string, text: string) => {
    set({ isGeneratingAudio: true });
    try {
      const res = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId: id, text })
      });
      const data = await res.json();
      
      if (data.success && data.audioUrl) {
        get().updateActiveReelDraft({ audioUrl: data.audioUrl });
      } else {
        console.error("Audio generation failed:", data.error);
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      set({ isGeneratingAudio: false });
    }
  }
}));
