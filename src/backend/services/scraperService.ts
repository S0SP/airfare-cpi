// src/services/scraperService.ts
// Simulated scraper service — generates realistic dummy fare data and seeds MongoDB.
// This is NOT real web scraping. It is a simulation for the SIH 2026 demo prototype.

import { fareRepository } from '../repositories/fareRepository';
import { logRepository } from '../repositories/logRepository';
import { ScraperResult } from '../types';

const ROUTES = [
  { origin: 'DEL', destination: 'BOM', basePrice: 4800 },
  { origin: 'DEL', destination: 'BLR', basePrice: 5200 },
  { origin: 'BOM', destination: 'BLR', basePrice: 3800 },
  { origin: 'DEL', destination: 'CCU', basePrice: 4200 },
  { origin: 'BLR', destination: 'HYD', basePrice: 2800 },
  { origin: 'MAA', destination: 'DEL', basePrice: 5600 },
];

const AIRLINES = [
  { name: 'IndiGo', prefix: '6E', priceMultiplier: 1.0 },
  { name: 'Air India', prefix: 'AI', priceMultiplier: 1.18 },
  { name: 'Air India Express', prefix: 'IX', priceMultiplier: 0.92 },
  { name: 'Akasa Air', prefix: 'QP', priceMultiplier: 0.95 },
  { name: 'SpiceJet', prefix: 'SG', priceMultiplier: 0.88 },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function seededRand(seed: number, min: number, max: number): number {
  // Deterministic-ish variation based on seed
  const x = Math.sin(seed + 1) * 10000;
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1));
}

function generateFlightNumber(prefix: string, routeIdx: number): string {
  const num = 100 + routeIdx * 17 + rand(1, 9);
  return `${prefix}-${num}`;
}

export async function runMockScraper(): Promise<ScraperResult> {
  const startTime = Date.now();
  console.log('\n🛫 APIx Mock Scraper — SIMULATED DATA GENERATION');
  console.log('━'.repeat(50));
  console.log('⚠️  This is NOT real web scraping. For SIH 2026 demo only.\n');

  // Clear existing data for fresh seed
  await fareRepository.deleteAll();

  const records: object[] = [];
  const now = new Date();

  // Generate 35 days of data ending today
  for (let dayOffset = 34; dayOffset >= 0; dayOffset--) {
    const scrapedAt = new Date(now);
    scrapedAt.setDate(now.getDate() - dayOffset);
    scrapedAt.setHours(rand(6, 22), rand(0, 59), rand(0, 59), 0);

    for (let routeIdx = 0; routeIdx < ROUTES.length; routeIdx++) {
      const route = ROUTES[routeIdx];
      const routeCode = `${route.origin}-${route.destination}`;

      for (let airlineIdx = 0; airlineIdx < AIRLINES.length; airlineIdx++) {
        const airline = AIRLINES[airlineIdx];

        // Generate 3-6 observations per route/airline/day
        const obsCount = rand(3, 6);
        for (let obs = 0; obs < obsCount; obs++) {
          const seed = dayOffset * 1000 + routeIdx * 100 + airlineIdx * 10 + obs;

          // Base price with realistic variation
          let baseFareRaw = route.basePrice * airline.priceMultiplier;

          // Weekly cycle: weekends cost more
          const dayOfWeek = scrapedAt.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) baseFareRaw *= 1.08;

          // Random daily drift ±15%
          const drift = 1 + (seededRand(seed, -150, 150) / 1000);
          baseFareRaw *= drift;

          // Occasional price spike (roughly 8% of days)
          const isSpike = seededRand(seed + 999, 0, 100) > 92;
          if (isSpike) baseFareRaw *= 1.35 + seededRand(seed + 777, 0, 20) / 100;

          // Early-booking discount (lead time > 14 days)
          const leadTimeDays = rand(1, 21);
          if (leadTimeDays >= 14) baseFareRaw *= 0.88;
          else if (leadTimeDays <= 3) baseFareRaw *= 1.12; // last-minute surge

          const baseFare = Math.round(baseFareRaw / 10) * 10;
          const taxes = Math.round(baseFare * 0.12 / 10) * 10;
          const fees = rand(80, 200);
          const totalFare = baseFare + taxes + fees;

          // Some sold-out observations (~6%)
          const isSoldOut = seededRand(seed + 555, 0, 100) > 94;
          const availabilityStatus = isSoldOut
            ? 'SOLD_OUT'
            : seededRand(seed + 444, 0, 100) > 85
            ? 'LIMITED'
            : 'AVAILABLE';

          const departureDate = new Date(scrapedAt);
          departureDate.setDate(scrapedAt.getDate() + leadTimeDays);

          records.push({
            source: 'Mock Scraper v1.0 — Simulated Data',
            route: routeCode,
            origin: route.origin,
            destination: route.destination,
            airline: airline.name,
            flightNumber: generateFlightNumber(airline.prefix, routeIdx + obs),
            scrapedAt,
            departureDate,
            leadTimeDays,
            baseFare,
            taxes,
            fees,
            totalFare,
            currency: 'INR',
            availabilityStatus,
          });
        }
      }
    }
  }

  console.log(`📊 Sources scanned:    5 (simulated OTAs + airline sites)`);
  console.log(`🗺  Routes processed:  ${ROUTES.length}`);
  console.log(`📋 Records collected: ${records.length}`);

  // Validate: must have all required fields and positive fares
  const valid = records.filter((r: any) =>
    r.origin && r.destination && r.airline && r.totalFare > 0 && r.baseFare > 0
  );

  console.log(`✅ Valid records:      ${valid.length}`);

  const inserted = await fareRepository.insertMany(valid as any);

  console.log(`💾 Records inserted:   ${inserted}`);
  console.log(`⏱  Time elapsed:       ${Date.now() - startTime}ms`);
  console.log(`🟢 Status:             SUCCESS\n`);

  await logRepository.create({
    timestamp: new Date(),
    method: 'POST',
    endpoint: '/api/v1/demo/scrape',
    statusCode: 200,
    responseTime: Date.now() - startTime,
    message: `Mock scraper complete — ${inserted} records inserted across ${ROUTES.length} routes`,
  });

  return {
    status: 'success',
    sourcesScanned: 5,
    routesProcessed: ROUTES.length,
    recordsCollected: records.length,
    validRecords: valid.length,
    recordsInserted: inserted,
    message: 'Simulated scrape complete. Data seeded in MongoDB.',
  };
}
