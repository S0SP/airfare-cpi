// src/App.tsx
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
} from './api/client';

import Header from './components/Header';
import SearchPanel from './components/SearchPanel';
import LoadingSteps from './components/LoadingSteps';
import KpiCards from './components/KpiCards';
import FareChart from './components/FareChart';
import AnalyticsPanel from './components/AnalyticsPanel';
import LogPanel from './components/LogPanel';

type AnalyzeState = 'idle' | 'step1' | 'step2' | 'step3' | 'done' | 'error';

export default function App() {
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
    fetchRoutes().then(setRoutes).catch(() => {});
    fetchAirlines().then(setAirlines).catch(() => {});
  }, []);

  // Poll logs every 5 seconds
  const refreshLogs = useCallback(() => {
    fetchLogs().then(setLogs).catch(() => {});
  }, []);

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 5000);
    return () => clearInterval(interval);
  }, [refreshLogs]);

  // Simulated multi-step loading UX
  const handleAnalyze = async () => {
    if (!origin || !destination || !airline) return;
    setResult(null);
    setErrorMsg('');

    try {
      setAnalyzeState('step1');
      await sleep(600);
      setAnalyzeState('step2');
      await sleep(700);
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
        'Failed to fetch fare data. Ensure the backend is running and data has been scraped.';
      setErrorMsg(msg);
      setAnalyzeState('error');
    }
  };

  const handleRunScraper = async () => {
    setScraperLoading(true);
    setScraperMsg('');
    try {
      const res = await runScraper();
      setScraperMsg(`✅ Scraper complete — ${res.recordsInserted} records inserted across ${res.routesProcessed} routes.`);
      refreshLogs();
    } catch {
      setScraperMsg('❌ Scraper failed. Ensure backend is running and MONGODB_URI is set.');
    } finally {
      setScraperLoading(false);
    }
  };

  const isLoading = ['step1', 'step2', 'step3'].includes(analyzeState);
  const loadingStep = analyzeState === 'step1' ? 1 : analyzeState === 'step2' ? 2 : 3;

  return (
    <div className="min-h-screen bg-surface-900">
      <Header onRunScraper={handleRunScraper} scraperLoading={scraperLoading} />

      {/* Scraper toast */}
      {scraperMsg && (
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in`}
        >
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium border ${
              scraperMsg.startsWith('✅')
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {scraperMsg}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Real-time Airfare Intelligence
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            MoSPI · SIH 2026 — Development of a Real-time Airfare Price Index for India
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
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
            <LogPanel logs={logs} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Idle state */}
            {analyzeState === 'idle' && (
              <div className="glass-card p-12 flex flex-col items-center gap-4 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-3xl">
                  ✈️
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Select a route to begin</h3>
                  <p className="text-slate-500 text-sm">Choose origin, destination, and airline, then click <strong className="text-slate-300">Analyze Fare</strong>.</p>
                </div>
                <p className="text-slate-600 text-xs">Tip: Run the Mock Scraper first to populate the database.</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && <LoadingSteps step={loadingStep} />}

            {/* Error */}
            {analyzeState === 'error' && (
              <div className="glass-card p-6 border-red-500/30 bg-red-500/5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl shrink-0">⚠️</span>
                  <div>
                    <h3 className="text-red-400 font-semibold text-sm mb-1">Analysis Failed</h3>
                    <p className="text-red-400/70 text-xs leading-relaxed">{errorMsg}</p>
                    <button
                      onClick={() => setAnalyzeState('idle')}
                      className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analyzeState === 'done' && result && (
              <>
                <KpiCards data={result} />
                <FareChart
                  data={result.historicalData}
                  thirtyDayAvg={result.analytics.thirtyDayAverage}
                />
                <AnalyticsPanel trend={result.trend} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
