"use client";

import { useState, useEffect, useCallback } from "react";

interface DurationDataPoint {
  date: string;
  durationHours: number;
}

interface WeeklyDataPoint {
  weekStart: string;
  totalHours: number;
}

interface GoalRateData {
  hit: number;
  total: number;
  percentage: number;
}

export interface ChartData {
  duration: DurationDataPoint[];
  weekly: WeeklyDataPoint[];
  goalRate: GoalRateData;
  defaultGoalHours: number | null;
}

export function useChartData() {
  const [range, setRange] = useState(7);
  const [data, setData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (r: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stats/charts?range=${r}`);
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  return { data, isLoading, error, range, setRange };
}
