"use client"

import { useState, useEffect, useCallback } from 'react';
import {
  fetchRoutes,
  fetchAirlines,
  analyzeFare,
  fetchLogs,
  runScraper,
  RouteInfo,
  FareAnalyzeResult,
  ApiLogEntry,
} from '@/lib/api';

import Header from '@/components/Header';
import SearchPanel from '@/components/SearchPanel';
import LoadingSteps from '@/components/LoadingSteps';
import KpiCards from '@/components/KpiCards';
import FareChart from '@/components/FareChart';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import LogPanel from '@/components/LogPanel';

import { GlobeFlights } from '@/components/ui/cobe-globe-flights';
import { FlightCard } from '@/components/ui/flight-card';
import { FlightCard1 } from '@/components/ui/flight-card-1';

import { AlertCircle, CheckCircle, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AnalyzeState = 'idle' | 'step1' | 'step2' | 'step3' | 'done' | 'error';

// Helper to map IATA to full city names
const CITY_MAP: Record<string, string> = {
  DEL: 'Delhi',
  BOM: 'Mumbai',
  BLR: 'Bengaluru',
  CCU: 'Kolkata',
  MAA: 'Chennai',
  HYD: 'Hyderabad',
  PNQ: 'Pune',
  AMD: 'Ahmedabad',
  GOI: 'Goa',
  COK: 'Kochi',
};
const getCityName = (code: string) => CITY_MAP[code] || code;

export default function Home() {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [airlines, setAirlines] = useState<string[]>([]);
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [airline, setAirline] = useState('IndiGo');
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>('idle');
  const [result, setResult] = useState<FareAnalyzeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [scraperLoading, setScraperLoading] = useState(false);
  const [scraperMsg, setScraperMsg] = useState('');

  // Load routes & airlines on mount
  useEffect(() => {
    fetchRoutes().then(setRoutes).catch(() => { });
    fetchAirlines().then(setAirlines).catch(() => { });
  }, []);

  // Poll logs every 5 seconds
  const refreshLogs = useCallback(() => {
    fetchLogs().then(setLogs).catch(() => { });
  }, []);

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  // Multi-step query execution UX
  const handleAnalyze = async () => {
    if (!origin || !destination || !airline) return;
    setResult(null);
    setErrorMsg('');

    try {
      setAnalyzeState('step1');
      await sleep(500);
      setAnalyzeState('step2');
      await sleep(600);
      setAnalyzeState('step3');

      const data = await analyzeFare(origin, destination, airline);

      await sleep(400);
      setResult(data);
      setAnalyzeState('done');
      refreshLogs();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        'Failed to fetch fare data. Ensure backend is running and dataset has been scraped.';
      setErrorMsg(msg);
      setAnalyzeState('error');
    }
  };

  const handleRunScraper = async () => {
    setScraperLoading(true);
    setScraperMsg('');
    try {
      const res = await runScraper();
      setScraperMsg(`Scraper complete — ${res.recordsInserted} records inserted across ${res.routesProcessed} routes.`);
      refreshLogs();
    } catch {
      setScraperMsg('Scraper failed. Ensure backend is running on port 5000.');
    } finally {
      setScraperLoading(false);
    }
  };

  const isLoading = ['step1', 'step2', 'step3'].includes(analyzeState);
  const loadingStep = analyzeState === 'step1' ? 1 : analyzeState === 'step2' ? 2 : 3;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header onRunScraper={handleRunScraper} scraperLoading={scraperLoading} />

      {/* Scraper Toast Notification */}
      {scraperMsg && (
        <div className="px-6 pt-4 shrink-0">
          <div
            className={`p-2.5 rounded-none border text-xs font-medium flex items-center gap-2 ${scraperMsg.startsWith('Scraper complete')
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                : 'bg-destructive/10 border-destructive/30 text-red-600'
              }`}
          >
            {scraperMsg.startsWith('Scraper complete') ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{scraperMsg}</span>
          </div>
        </div>
      )}

      {/* MASTER GRID LAYOUT */}
      <main className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden min-h-0">

        {/* LEFT SIDEBAR (Controls & Telemetry) */}
        <section className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
          <div className="shrink-0 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground">APIx Intelligence</h2>
              <p className="text-xs text-muted-foreground">MoSPI Problem Statement SIH26056</p>
            </div>
            <SearchPanel
              routes={routes}
              airlines={airlines}
              origin={origin}
              destination={destination}
              airline={airline}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
              onAirlineChange={setAirline}
              onAnalyze={handleAnalyze}
              loading={isLoading}
            />
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <LogPanel logs={logs} />
          </div>
        </section>

        {/* RIGHT AREA (Main Dashboard) */}
        <section className="col-span-9 h-full flex flex-col min-h-0 overflow-y-auto pr-2 pb-4 space-y-6">
          {/* Idle State */}
          {analyzeState === 'idle' && (
            <div className="border border-border bg-card p-12 flex flex-col items-center justify-center text-center space-y-4 flex-1">
              <div className="w-12 h-12 border border-border bg-muted dark:bg-slate-800 flex items-center justify-center text-primary">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">System Standby</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
                  Configure origin, destination, and carrier in the control panel to initiate fare index analysis.
                </p>
              </div>
              <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 border border-border font-mono">
                System check: DB connected, scraper ready.
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && <LoadingSteps step={loadingStep} />}

          {/* Error */}
          {analyzeState === 'error' && (
            <div className="border border-destructive/30 bg-destructive/5 p-6 space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-600 font-bold text-sm">Analysis Execution Failed</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mt-1">{errorMsg}</p>
                  <button
                    onClick={() => setAnalyzeState('idle')}
                    className="mt-3 text-xs text-primary underline font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Done Results */}
          {analyzeState === 'done' && result && (
            <>
              <div className="flex items-center gap-2 mb-[-12px]">
                <Badge variant="secondary" className="font-semibold text-[10px] py-1 px-2 tracking-wider uppercase tabular-nums">
                  Route: {result.route}
                </Badge>
                <Badge variant="outline" className="text-[10px] py-1 px-2 tracking-wider uppercase tabular-nums">
                  Carrier: {result.airline}
                </Badge>
              </div>

              {/* Top Row: Metrics (Horizontal Unfurling) */}
              <KpiCards data={result} />

              {/* Middle Row: Chart & Ticket Split */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <FareChart
                    data={result.historicalData}
                    thirtyDayAvg={result.analytics.thirtyDayAverage}
                  />
                </div>
                <div className="col-span-1">
                  <div className="h-full border border-border bg-card">
                    <FlightCard1
                      imageUrl="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop"
                      airline={result.airline}
                      flightCode={`${result.airline.slice(0, 2).toUpperCase()}-402`}
                      flightClass="Economy"
                      departureCode={origin}
                      departureCity={getCityName(origin)}
                      departureTime="08:30 AM"
                      arrivalCode={destination}
                      arrivalCity={getCityName(destination)}
                      arrivalTime="10:45 AM"
                      duration="2h 15m"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Row: Analytics Insights */}
              <div className="col-span-full">
                <AnalyticsPanel trend={result.trend} />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
