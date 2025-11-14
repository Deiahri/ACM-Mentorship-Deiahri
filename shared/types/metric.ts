
export interface Metric {
  AIResume?: {
    tokensUsedLastHour: MetricCountTimestampObj,
    requestsMadeLastHour: MetricCountTimestampObj
  } | null;
};

export interface MetricCountTimestampObj {
  count: number;
  timestamp: number;
}