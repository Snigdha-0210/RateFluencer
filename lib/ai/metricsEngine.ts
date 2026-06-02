/**
 * Real Metrics Engine
 * Computes performance based on actual world data, replacing mock/fake metrics.
 */

export interface MetricInputs {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  watchTime: number; // in seconds
}

export const METRICS_ENGINE = {
  /**
   * Calculate Engagement Rate
   * Formula: (likes + comments + shares) / views
   */
  calculateEngagementRate: (inputs: MetricInputs): number => {
    if (inputs.views === 0) return 0;
    const totalEngagement = inputs.likes + inputs.comments + inputs.shares;
    return (totalEngagement / inputs.views) * 100; // as a percentage
  },

  /**
   * Calculate Virality Score (0-100)
   * Formula: weighted combination of shares, watch time, comments, likes.
   * Adjust weights as needed.
   */
  calculateViralityScore: (inputs: MetricInputs): number => {
    if (inputs.views === 0) return 0;

    // Weights (relative importance for virality)
    const shareWeight = 40;     // shares are strongest virality signal
    const watchTimeWeight = 30; // avg watchtime > 15s is great
    const commentWeight = 20;   // conversation driver
    const likeWeight = 10;      // baseline engagement

    const shareScore = Math.min((inputs.shares / inputs.views) * 1000, 100);
    const watchTimeScore = Math.min((inputs.watchTime / 30) * 100, 100); // 30s is "perfect"
    const commentScore = Math.min((inputs.comments / inputs.views) * 500, 100);
    const likeScore = Math.min((inputs.likes / inputs.views) * 100, 100);

    const score = (
      (shareScore * shareWeight) +
      (watchTimeScore * watchTimeWeight) +
      (commentScore * commentWeight) +
      (likeScore * likeWeight)
    ) / 100;

    return Math.min(Math.round(score), 100);
  },

  /**
   * Calculate Prediction Error
   * Formula: abs(predictedScore - actualViralityScore)
   */
  calculatePredictionError: (predicted: number, actual: number): number => {
    return Math.abs(predicted - actual);
  },

  /**
   * Calculate Model Accuracy (0-100%)
   * Formula: 100 - error (bounded to 0)
   */
  calculateModelAccuracy: (predicted: number, actual: number): number => {
    const error = METRICS_ENGINE.calculatePredictionError(predicted, actual);
    return Math.max(100 - error, 0);
  }
};
