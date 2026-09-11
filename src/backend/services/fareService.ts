// src/services/fareService.ts
// Business logic for fare analysis — sits between controller and repository

import { fareRepository } from '../repositories/fareRepository';
import { logRepository } from '../repositories/logRepository';
import { aggregateByDay, computeAnalytics, determineTrend } from '../utils/analytics';
import { FareAnalyzeRequest, FareAnalyzeResponse } from '../types';

const ROUTES = [
  { code: 'DEL-BOM', origin: 'DEL', destination: 'BOM', originCity: 'Delhi', destinationCity: 'Mumbai' },
  { code: 'DEL-BLR', origin: 'DEL', destination: 'BLR', originCity: 'Delhi', destinationCity: 'Bengaluru' },
  { code: 'BOM-BLR', origin: 'BOM', destination: 'BLR', originCity: 'Mumbai', destinationCity: 'Bengaluru' },
  { code: 'DEL-CCU', origin: 'DEL', destination: 'CCU', originCity: 'Delhi', destinationCity: 'Kolkata' },
  { code: 'BLR-HYD', origin: 'BLR', destination: 'HYD', originCity: 'Bengaluru', destinationCity: 'Hyderabad' },
  { code: 'MAA-DEL', origin: 'MAA', destination: 'DEL', originCity: 'Chennai', destinationCity: 'Delhi' },
];

const AIRLINES = ['IndiGo', 'Air India', 'Air India Express', 'Akasa Air', 'SpiceJet'];

export class FareService {
  getRoutes() {
    return ROUTES;
  }

  getAirlines() {
    return AIRLINES;
  }

  async analyzeFare(req: FareAnalyzeRequest): Promise<FareAnalyzeResponse> {
    const { origin, destination, airline } = req;
    const route = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
    const now = new Date();

    // Date windows
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);

    const [todayObs, sevenDayObs, thirtyDayObs] = await Promise.all([
      fareRepository.findByRouteAndAirline(origin, destination, airline, today, todayEnd),
      fareRepository.findByRouteAndAirline(origin, destination, airline, sevenDaysAgo, todayEnd),
      fareRepository.findByRouteAndAirline(origin, destination, airline, thirtyDaysAgo, todayEnd),
    ]);

    if (thirtyDayObs.length === 0) {
      throw new Error(`No fare data found for ${route} on ${airline}. Please run the mock scraper first.`);
    }

    const analytics = computeAnalytics(todayObs, sevenDayObs, thirtyDayObs);
    const historicalData = aggregateByDay(thirtyDayObs, analytics.thirtyDayAverage);
    const trend = determineTrend(historicalData);

    // Current fare: latest available, or today's average, or 30-day average
    const latest = await fareRepository.findLatest(origin, destination, airline);
    const currentFare = latest?.totalFare ?? analytics.todayAverage ?? analytics.thirtyDayAverage;

    // Log the analyze event
    await logRepository.create({
      timestamp: new Date(),
      method: 'POST',
      endpoint: '/api/v1/fare/analyze',
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 60) + 30,
      message: `Analyzed ${route} | ${airline} | ${thirtyDayObs.length} observations`,
    });

    return {
      route,
      airline,
      currentFare,
      currency: 'INR',
      analytics,
      trend,
      historicalData,
      dataSource: 'SIMULATED SCRAPED DATA — Mock Scraper v1.0',
      disclaimer: 'For demonstration purposes only. This is a SIH 2026 prototype.',
    };
  }

  async getTodayFares() {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);

    const routes = ROUTES;
    const results = [];
    for (const r of routes) {
      for (const a of AIRLINES) {
        const obs = await fareRepository.findByRouteAndAirline(r.origin, r.destination, a, start, end);
        if (obs.length > 0) {
          const fares = obs.filter(o => o.availabilityStatus !== 'SOLD_OUT').map(o => o.totalFare);
          if (fares.length > 0) {
            results.push({
              route: r.code,
              airline: a,
              averageFare: Math.round(fares.reduce((s, v) => s + v, 0) / fares.length),
              currency: 'INR',
            });
          }
        }
      }
    }
    return results;
  }
}

export const fareService = new FareService();
