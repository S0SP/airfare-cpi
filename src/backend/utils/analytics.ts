// src/utils/analytics.ts
// Prototype Analytics — simple statistical calculations for the SIH 2026 demo.
// The actual APIx price index methodology is NOT implemented here.

import { DailyFareData, FareAnalytics, FareTrend } from '../types';
import { FareObservationDocument } from '../models/FareObservation';

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export function percentageChange(current: number, reference: number): number {
  if (reference === 0) return 0;
  return Math.round(((current - reference) / reference) * 10000) / 100;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((v) => Math.pow(v - avg, 2))));
}

export function aggregateByDay(observations: FareObservationDocument[], baseFare: number): DailyFareData[] {
  const dayMap: Record<string, number[]> = {};
  for (const obs of observations) {
    const date = new Date(obs.scrapedAt).toISOString().split('T')[0];
    if (!dayMap[date]) dayMap[date] = [];
    if (obs.availabilityStatus !== 'SOLD_OUT') dayMap[date].push(obs.totalFare);
  }
  return Object.entries(dayMap)
    .filter(([, fares]) => fares.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, fares]) => ({
      date,
      averageFare: mean(fares),
      minimumFare: Math.min(...fares),
      maximumFare: Math.max(...fares),
      apixIndex: baseFare > 0 ? Math.round((mean(fares) / baseFare) * 100) : 100,
    }));
}

export function determineTrend(dailyData: DailyFareData[]): FareTrend {
  if (dailyData.length < 3) {
    return { direction: 'STABLE', volatility: 'LOW', note: 'Insufficient data for trend analysis' };
  }
  const fares = dailyData.map((d) => d.averageFare);
  const half = Math.floor(fares.length / 2);
  const firstAvg = mean(fares.slice(0, half));
  const secondAvg = mean(fares.slice(half));
  const overallAvg = mean(fares);
  const latest = fares[fares.length - 1];
  const changePct = percentageChange(secondAvg, firstAvg);

  let direction: FareTrend['direction'] = 'STABLE';
  if (changePct > 2) direction = 'INCREASING';
  else if (changePct < -2) direction = 'DECREASING';

  const allFares = dailyData.flatMap((d) => [d.minimumFare, d.maximumFare]);
  const cv = overallAvg > 0 ? (stdDev(allFares) / overallAvg) * 100 : 0;
  let volatility: FareTrend['volatility'] = 'LOW';
  if (cv > 15) volatility = 'HIGH';
  else if (cv > 8) volatility = 'MODERATE';

  let note = 'Current price is near historical average';
  if (latest > overallAvg * 1.1) note = 'Current price is above historical average';
  else if (latest < overallAvg * 0.9) note = 'Current price is below historical average';

  return { direction, volatility, note };
}

export function computeAnalytics(
  todayObs: FareObservationDocument[],
  sevenDayObs: FareObservationDocument[],
  thirtyDayObs: FareObservationDocument[]
): FareAnalytics {
  const avail = (obs: FareObservationDocument[]) =>
    obs.filter((o) => o.availabilityStatus !== 'SOLD_OUT').map((o) => o.totalFare);

  const tf = avail(todayObs);
  const sf = avail(sevenDayObs);
  const thf = avail(thirtyDayObs);

  const todayAverage = mean(tf);
  const sevenDayAverage = mean(sf);
  const thirtyDayAverage = mean(thf);

  return {
    todayAverage,
    sevenDayAverage,
    thirtyDayAverage,
    minimumFare: thf.length ? Math.min(...thf) : 0,
    maximumFare: thf.length ? Math.max(...thf) : 0,
    changeVs7Days: percentageChange(todayAverage, sevenDayAverage),
    changeVs30Days: percentageChange(todayAverage, thirtyDayAverage),
    currentApixIndex: thirtyDayAverage > 0 ? Math.round((todayAverage / thirtyDayAverage) * 100) : 100,
    sevenDayApixIndex: thirtyDayAverage > 0 ? Math.round((sevenDayAverage / thirtyDayAverage) * 100) : 100,
    thirtyDayApixIndex: 100,
  };
}
