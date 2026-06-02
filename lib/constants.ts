import { ContentDraft, PipelineStep } from "@/types";

export const DEFAULT_DRAFT: ContentDraft = {
  id: "draft_new",
  trendId: "",
  hook: "",
  story: "",
  keyInsights: "",
  cta: "",
  linkedInPost: "",
  instagramCaption: "",
  linkedInHashtags: [],
  instagramHashtags: [],
  instagramCTA: "",
  viralityScore: 0,
  expectedViews: "0",
  expectedLikes: "0",
  expectedShares: "0",
  expectedSaves: "0",
  breakdown: {
    hookStrength: 0,
    topicMomentum: 0,
    searchInterest: 0,
    audienceFit: 0,
    novelty: 0,
    ctaStrength: 0,
  },
};

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: "p1", label: "Script Generated", status: "done" },
  { id: "p2", label: "Voiceover Generated", status: "done" },
  { id: "p3", label: "Captions Generated", status: "done" },
  { id: "p4", label: "Subtitles Generated", status: "in-progress" },
  { id: "p5", label: "Thumbnail Generated", status: "pending" },
  { id: "p6", label: "B-Roll Generated", status: "pending" },
  { id: "p7", label: "Visual Assets Generated", status: "pending" },
  { id: "p8", label: "Reel Ready", status: "pending" },
];
