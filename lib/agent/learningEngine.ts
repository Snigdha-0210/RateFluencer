/**
 * AI Learning Engine (Phase 6)
 *
 * This module tracks predicted virality versus actual performance and automatically
 * calibrates internal scoring weights based on prediction errors. This allows the AI
 * to continuously improve its content strategy over time.
 */

import { generateWeightAdjustmentReason } from "./explainabilityEngine";

export interface ScoringWeights {
  hookWeight: number;      // Default: 0.25
  emotionWeight: number;   // Default: 0.20
  noveltyWeight: number;   // Default: 0.20
  audienceWeight: number;  // Default: 0.20
  shareWeight: number;     // Default: 0.15
}

export interface PredictionRecord {
  id: string;
  topic: string;
  predictedScore: number;
  actualScore: number | null;
  timestamp: string;
}

export interface LearningState {
  weights: ScoringWeights;
  previousWeights: ScoringWeights | null;
  weightChangeReason: string | null;
  predictions: PredictionRecord[];
  adjustmentsMade: number;
  predictionAccuracy: number; // 0-100
}

// In-memory singleton state
const store: LearningState = {
  weights: {
    hookWeight: 0.25,
    emotionWeight: 0.20,
    noveltyWeight: 0.20,
    audienceWeight: 0.20,
    shareWeight: 0.15,
  },
  previousWeights: null,
  weightChangeReason: null,
  predictions: [],
  adjustmentsMade: 0,
  predictionAccuracy: 0,
};

export function getScoringWeights(): ScoringWeights {
  return { ...store.weights };
}

export function getLearningState(): LearningState {
  return { ...store };
}

export function logPrediction(id: string, topic: string, predictedScore: number): void {
  store.predictions.push({
    id,
    topic,
    predictedScore,
    actualScore: null,
    timestamp: new Date().toISOString()
  });
}

/**
 * Simulates receiving real-world analytics data.
 * Computes prediction error and dynamically alters weights.
 */
export function simulateRealPerformance(id: string, actualScore: number): LearningState {
  const record = store.predictions.find(p => p.id === id);
  if (!record) return store;

  record.actualScore = actualScore;

  // Calculate prediction error
  const error = record.predictedScore - actualScore;
  
  // Basic Calibration Logic:
  // If we overpredicted (AI thought it would do great, but it failed):
  // We likely over-weighted the "Novelty" or "Hook" if they were high.
  // If we underpredicted (AI thought it would fail, but it went viral):
  // We might need to boost "Emotion" or "Shareability" weights.
  
  if (Math.abs(error) > 5) {
    store.adjustmentsMade++;
    
    // Save previous weights
    store.previousWeights = { ...store.weights };
    let incKeys: string[] = [];
    let decKeys: string[] = [];

    // We adjust weights by a small delta (learning rate)
    const delta = 0.02;

    if (error > 0) {
      // Overpredicted: Reduce hook/novelty weight slightly, boost audience/share
      store.weights.hookWeight = Math.max(0.10, store.weights.hookWeight - delta);
      store.weights.noveltyWeight = Math.max(0.10, store.weights.noveltyWeight - delta);
      store.weights.audienceWeight += delta;
      store.weights.shareWeight += delta;
      decKeys = ["hookWeight", "noveltyWeight"];
      incKeys = ["audienceWeight", "shareWeight"];
    } else {
      // Underpredicted: Boost hook/emotion weight slightly, reduce novelty
      store.weights.hookWeight += delta;
      store.weights.emotionWeight += delta;
      store.weights.noveltyWeight = Math.max(0.10, store.weights.noveltyWeight - (delta * 2));
      incKeys = ["hookWeight", "emotionWeight"];
      decKeys = ["noveltyWeight"];
    }

    // Normalize weights to ensure they sum to ~1.0
    const sum = Object.values(store.weights).reduce((a, b) => a + b, 0);
    Object.keys(store.weights).forEach(k => {
      const key = k as keyof ScoringWeights;
      store.weights[key] = Number((store.weights[key] / sum).toFixed(4));
    });

    store.weightChangeReason = generateWeightAdjustmentReason(error, incKeys, decKeys);
  }

  // Update overall prediction accuracy
  const completedPredictions = store.predictions.filter(p => p.actualScore !== null);
  if (completedPredictions.length > 0) {
    const totalError = completedPredictions.reduce((acc, curr) => acc + Math.abs(curr.predictedScore - curr.actualScore!), 0);
    const avgError = totalError / completedPredictions.length;
    // Accuracy is 100 minus avg error
    store.predictionAccuracy = Math.max(0, 100 - avgError);
  }

  return { ...store };
}
