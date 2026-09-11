"use client"

import { Loader2, CheckCircle2, Circle } from "lucide-react"

interface LoadingStepsProps {
  step: number; // 1=fetching, 2=querying, 3=processing
}

const STEPS = [
  { id: 1, label: 'Fetching live fare data from scraper stream' },
  { id: 2, label: 'Querying MoSPI MongoDB dataset index' },
  { id: 3, label: 'Calculating volatility & statistical averages' },
];

export default function LoadingSteps({ step }: LoadingStepsProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-6 shadow-sm">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {STEPS.map((s) => {
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                isActive
                  ? 'border-primary/50 bg-primary/5 text-foreground'
                  : isDone
                  ? 'border-border bg-muted/40 text-muted-foreground'
                  : 'border-transparent opacity-40 text-muted-foreground'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-xs font-medium">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
