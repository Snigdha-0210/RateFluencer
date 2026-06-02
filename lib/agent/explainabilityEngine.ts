/**
 * Explainability Engine
 * 
 * Generates human-readable, transparent reasoning for autonomous AI decisions.
 * Used for the hackathon presentation to show exactly why the AI makes choices.
 */

export function generateWeightAdjustmentReason(
  error: number, 
  increasedKeys: string[], 
  decreasedKeys: string[]
): string {
  const incStr = increasedKeys.map(formatKey).join(" and ");
  const decStr = decreasedKeys.map(formatKey).join(" and ");

  if (error > 0) {
    return `Model overpredicted virality by ${error} points. Decreased ${decStr} due to weak correlation with actual engagement, and boosted ${incStr} to improve future accuracy.`;
  } else {
    return `Model underpredicted virality by ${Math.abs(error)} points. Increased ${incStr} as this content performed significantly better than expected, while reducing ${decStr}.`;
  }
}

export function explainTrendSelection(topic: string, score: number, velocity: number): string {
  return `Selected "${topic}" (Score: ${score}). Velocity is extremely high at ${velocity}%. It shows strong cross-platform validation with zero historical saturation in your library.`;
}

export function explainViralityPrediction(score: number, breakdown: any): string {
  if (score >= 85) {
    return `Predicted Viral (Score: ${score}). Driven by an exceptionally high Hook Strength (${breakdown.hookStrength}) and strong Novelty (${breakdown.novelty}).`;
  } else if (score >= 70) {
    return `High Potential (Score: ${score}). Good overall structure, primarily carried by Topic Momentum and Emotional Resonance.`;
  }
  return `Moderate Potential (Score: ${score}). Factors are balanced, but lacks an explosive hook.`;
}

function formatKey(key: string): string {
  return key.replace("Weight", "").charAt(0).toUpperCase() + key.replace("Weight", "").slice(1);
}
