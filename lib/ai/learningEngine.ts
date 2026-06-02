import fs from "fs";
import path from "path";
import { ContentEvent } from "@/types/events";
import { METRICS_ENGINE } from "./metricsEngine";
import { db } from "@/lib/firebase";

const DB_DIR = path.join(process.cwd(), "data");
const WEIGHTS_FILE = path.join(DB_DIR, "weights.json");

interface FeatureWeights {
  hookWeight: number;
  emotionWeight: number;
  noveltyWeight: number;
  audienceWeight: number;
  shareabilityWeight: number;
}

const DEFAULT_WEIGHTS: FeatureWeights = {
  hookWeight: 1.0,
  emotionWeight: 1.0,
  noveltyWeight: 1.0,
  audienceWeight: 1.0,
  shareabilityWeight: 1.0,
};

function initWeights() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(WEIGHTS_FILE)) {
    fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(DEFAULT_WEIGHTS, null, 2), "utf-8");
  }
}

initWeights();

export function getWeights(): FeatureWeights {
  try {
    const data = fs.readFileSync(WEIGHTS_FILE, "utf-8");
    return JSON.parse(data) as FeatureWeights;
  } catch (err) {
    return { ...DEFAULT_WEIGHTS };
  }
}

export function saveWeights(weights: FeatureWeights): void {
  fs.writeFileSync(WEIGHTS_FILE, JSON.stringify(weights, null, 2), "utf-8");
}

/**
 * Ingest real-world feedback for a generated content event.
 * Recomputes metrics, updates the event, and adjusts learning weights.
 */
export async function ingestFeedback(
  eventId: string,
  event: ContentEvent,
  actualMetrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    watchTime: number;
  }
) {
  // 1. Compute real metrics
  const engagementRate = METRICS_ENGINE.calculateEngagementRate(actualMetrics);
  const actualViralityScore = METRICS_ENGINE.calculateViralityScore(actualMetrics);
  const predictionError = METRICS_ENGINE.calculatePredictionError(event.predictedScore, actualViralityScore);
  const modelAccuracy = METRICS_ENGINE.calculateModelAccuracy(event.predictedScore, actualViralityScore);

  // 2. Update Event in DB
  const updateData = {
    actualViews: actualMetrics.views,
    actualLikes: actualMetrics.likes,
    actualShares: actualMetrics.shares,
    actualComments: actualMetrics.comments,
    actualWatchTime: actualMetrics.watchTime,
    engagementRate,
    viralityScore: actualViralityScore,
    predictionError,
    modelAccuracy,
  };
  
  await db.collection("events").doc(eventId).update(updateData);

  // 3. Update Learning Weights
  // If prediction was off by > 10 points, adjust weights slightly.
  // In a full production system, we'd use backpropagation against specific feature impacts.
  // Here we do a simple heuristic adjustment.
  if (predictionError > 10) {
    const weights = getWeights();
    const learningRate = 0.05;
    
    // Was it overpredicted or underpredicted?
    const overpredicted = event.predictedScore > actualViralityScore;

    // Simple heuristic: adjust weights down if overpredicted, up if underpredicted
    // Real ML would adjust specific feature weights based on their contribution.
    const direction = overpredicted ? -1 : 1;
    
    weights.hookWeight = Math.max(0.5, Math.min(2.0, weights.hookWeight + (learningRate * direction)));
    weights.emotionWeight = Math.max(0.5, Math.min(2.0, weights.emotionWeight + (learningRate * direction)));
    weights.shareabilityWeight = Math.max(0.5, Math.min(2.0, weights.shareabilityWeight + (learningRate * direction)));

    saveWeights(weights);
  }

  const updatedEvent = { ...event, ...updateData };
  return updatedEvent;
}
