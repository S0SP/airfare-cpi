"use client"

import { FareAnalyzeResult } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KpiCardsProps {
  data: FareAnalyzeResult;
}

function formatINR(v: number) {
  return `₹${v.toLocaleString('en-IN')}`;
}

function ChangeBadge({ value, label }: { value: number; label: string }) {
  const isUp = value >= 0;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Badge
        variant="outline"
        className="gap-1 font-semibold border-border text-foreground bg-muted"
      >
        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isUp ? "+" : ""}{value}%
      </Badge>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

export default function KpiCards({ data }: KpiCardsProps) {
  const { analytics, currentFare, route, airline } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Col 1: Current Fare */}
      <div className="p-5 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Current Average Fare
        </p>
        <span className="text-3xl font-extrabold tracking-tight tabular-nums mb-3 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-slate-50 dark:to-slate-400">
          {formatINR(currentFare)}
        </span>
        <div className="flex flex-col gap-1.5 mt-auto">
          <ChangeBadge value={analytics.changeVs7Days} label="vs 7D Avg" />
          <ChangeBadge value={analytics.changeVs30Days} label="vs 30D Avg" />
        </div>
      </div>

      {/* Col 2: APIx Index */}
      <div className="p-5 flex flex-col justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            APIx Price Index
          </p>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.5 border border-slate-200 dark:border-slate-700 font-semibold shadow-sm">Base: 100</span>
        </div>
        <span className="text-3xl font-extrabold tracking-tight tabular-nums mb-3 text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-slate-50 dark:to-slate-400">
          {analytics.currentApixIndex}
        </span>
        <div className="flex flex-col gap-1.5 mt-auto text-xs text-muted-foreground">
          <div className="flex justify-between"><span>7D Index:</span><span className="font-semibold text-foreground tabular-nums">{analytics.sevenDayApixIndex}</span></div>
          <div className="flex justify-between"><span>30D Index:</span><span className="font-semibold text-foreground tabular-nums">{analytics.thirtyDayApixIndex}</span></div>
        </div>
      </div>

      {/* Col 3: Averages */}
      <div className="p-5 flex flex-col justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">7-Day Moving Avg</p>
          <p className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatINR(analytics.sevenDayAverage)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">30-Day Moving Avg</p>
          <p className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatINR(analytics.thirtyDayAverage)}</p>
        </div>
      </div>

      {/* Col 4: Min/Max */}
      <div className="p-5 flex flex-col justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">30D Minimum Fare</p>
          <p className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatINR(analytics.minimumFare)}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">30D Maximum Fare</p>
          <p className="text-lg font-bold text-foreground tabular-nums tracking-tight">{formatINR(analytics.maximumFare)}</p>
        </div>
      </div>
    </div>
  );
}
