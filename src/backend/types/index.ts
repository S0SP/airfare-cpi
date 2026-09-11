// src/types/index.ts
export interface IFareObservation {
  source: string;
  route: string;
  origin: string;
  destination: string;
  airline: string;
  flightNumber: string;
  scrapedAt: Date;
  departureDate: Date;
  leadTimeDays: number;
  baseFare: number;
  taxes: number;
  fees: number;
  totalFare: number;
  currency: string;
  availabilityStatus: 'AVAILABLE' | 'SOLD_OUT' | 'LIMITED';
  createdAt?: Date;
}

export interface IApiLog {
  timestamp: Date;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  message: string;
}

export interface FareAnalyzeRequest {
  origin: string;
  destination: string;
  airline: string;
}

export interface DailyFareData {
  date: string;
  averageFare: number;
  minimumFare: number;
  maximumFare: number;
  apixIndex: number;
}

export interface FareAnalytics {
  todayAverage: number;
  sevenDayAverage: number;
  thirtyDayAverage: number;
  minimumFare: number;
  maximumFare: number;
  changeVs7Days: number;
  changeVs30Days: number;
  currentApixIndex: number;
  sevenDayApixIndex: number;
  thirtyDayApixIndex: number;
}

export interface FareTrend {
  direction: 'INCREASING' | 'DECREASING' | 'STABLE';
  volatility: 'LOW' | 'MODERATE' | 'HIGH';
  note: string;
}

export interface FareAnalyzeResponse {
  route: string;
  airline: string;
  currentFare: number;
  currency: string;
  analytics: FareAnalytics;
  trend: FareTrend;
  historicalData: DailyFareData[];
  dataSource: string;
  disclaimer: string;
}

export interface ScraperResult {
  status: 'success' | 'error';
  sourcesScanned: number;
  routesProcessed: number;
  recordsCollected: number;
  validRecords: number;
  recordsInserted: number;
  message: string;
}
