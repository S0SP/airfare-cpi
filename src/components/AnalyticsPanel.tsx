"use client"

import { FareTrend } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Info } from "lucide-react"

interface AnalyticsPanelProps {
  trend: FareTrend;
}

export default function AnalyticsPanel({ trend }: AnalyticsPanelProps) {
  const isIncreasing = trend.direction === 'INCREASING';
  const isDecreasing = trend.direction === 'DECREASING';

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-foreground font-semibold text-sm">Statistical Intelligence</h3>
        <Badge variant="outline" className="ml-auto text-[10px] uppercase">
          MoSPI Engine
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Trend Direction</p>
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            {isIncreasing && <TrendingUp className="w-4 h-4 text-red-400" />}
            {isDecreasing && <TrendingDown className="w-4 h-4 text-emerald-400" />}
            {!isIncreasing && !isDecreasing && <Activity className="w-4 h-4 text-blue-400" />}
            <span>{trend.direction}</span>
          </div>
        </div>

        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Volatility Index</p>
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{trend.volatility}</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/20 border border-border flex items-start gap-2.5">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-medium">Observation: </strong>
          {trend.note}
        </p>
      </div>
    </div>
  );
}
