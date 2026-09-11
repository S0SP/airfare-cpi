import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export interface RouteInfo {
  code: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
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

export interface FareAnalyzeResult {
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

export interface ApiLogEntry {
  _id: string;
  timestamp: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  message: string;
}

export interface ScraperResult {
  status: string;
  sourcesScanned: number;
  routesProcessed: number;
  recordsCollected: number;
  validRecords: number;
  recordsInserted: number;
  message: string;
}

export const fetchRoutes = async (): Promise<RouteInfo[]> => {
  const res = await apiClient.get('/routes');
  return res.data.data;
};

export const fetchAirlines = async (): Promise<string[]> => {
  const res = await apiClient.get('/airlines');
  return res.data.data;
};

export const analyzeFare = async (
  origin: string,
  destination: string,
  airline: string
): Promise<FareAnalyzeResult> => {
  const res = await apiClient.post('/fare/analyze', { origin, destination, airline });
  return res.data.data;
};

export const fetchLogs = async (): Promise<ApiLogEntry[]> => {
  const res = await apiClient.get('/logs');
  return res.data.data;
};

export const runScraper = async (): Promise<ScraperResult> => {
  const res = await apiClient.post('/demo/scrape');
  return res.data.data;
};
