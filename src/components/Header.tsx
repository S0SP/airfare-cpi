"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Activity, Plane, Moon, Sun, Globe } from "lucide-react"
import LiveAviationGlobe from "./LiveAviationGlobe";

interface HeaderProps {
  onRunScraper: () => void;
  scraperLoading: boolean;
}

export default function Header({ onRunScraper, scraperLoading }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      <header className="flex items-center justify-between w-full px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          {/* Airplane Icon */}
          <Plane className="text-slate-900 dark:text-white w-6 h-6" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">APIx</span>
              <span className="text-[10px] font-semibold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">MoSPI GOVT</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Real-time Airfare Price Index for India</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowGlobe(true)}
            className="flex items-center gap-2 text-xs font-medium border border-sky-600/30 bg-sky-500/10 text-sky-500 px-3 py-1.5 rounded hover:bg-sky-500/20 transition-colors"
          >
            <Globe size={16} />
            Live Radar
          </button>

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {/* Mock Scraper Button */}
          <button
            onClick={onRunScraper}
            disabled={scraperLoading}
            className="flex items-center gap-2 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {scraperLoading ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Scraping Data...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Run Mock Scraper</span>
              </>
            )}
          </button>
        </div>
      </header>
      {showGlobe && <LiveAviationGlobe onClose={() => setShowGlobe(false)} isDark={isDark} />}
    </>
  );
}
