"use client"

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DailyFareData } from '@/lib/api';

interface FareChartProps {
  data: DailyFareData[];
  thirtyDayAvg: number;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function formatINR(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card/90 backdrop-blur-md p-3 text-xs space-y-1.5 shadow-sm">
      <p className="text-foreground font-semibold mb-2">{formatDate(label)}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex justify-between gap-4">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="text-foreground font-medium">
            {mode === 'index' ? entry.value : formatINR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function FareChart({ data, thirtyDayAvg }: FareChartProps) {
  const [mode, setMode] = useState<'fare' | 'index'>('fare');

  return (
    <div className="border border-border bg-card p-5 space-y-4 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-border">
        <div>
          <h3 className="text-foreground font-semibold text-sm">30-Day Trend</h3>
          <p className="text-muted-foreground text-xs">Historical daily observation points</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setMode('fare')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'fare' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Absolute Fare
            </button>
            <button
              onClick={() => setMode('index')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'index' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              APIx Index
            </button>
          </div>
          {mode === 'fare' && (
            <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border hidden sm:block">
              Baseline 30D Avg: <span className="font-medium text-foreground">{formatINR(thirtyDayAvg)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={mode === 'fare' ? (v) => `₹${(v / 1000).toFixed(1)}k` : (v) => `${v}`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip mode={mode} />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
            
            {mode === 'fare' && (
              <ReferenceLine
                y={thirtyDayAvg}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{ value: '30D Baseline', fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'insideTopRight' }}
              />
            )}
            {mode === 'fare' && <Area type="monotone" dataKey="maximumFare" name="Max Fare" stroke="#94a3b8" strokeWidth={1.5} fill="none" dot={false} />}
            {mode === 'fare' && <Area type="monotone" dataKey="averageFare" name="Avg Fare" stroke="#2563eb" strokeWidth={1.5} fill="none" dot={false} style={{ filter: "drop-shadow(0px 2px 4px rgba(37, 99, 235, 0.3))" }} />}
            {mode === 'fare' && <Area type="monotone" dataKey="minimumFare" name="Min Fare" stroke="#94a3b8" strokeWidth={1.5} fill="none" dot={false} />}
            
            {mode === 'index' && (
              <ReferenceLine
                y={100}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="4 4"
                label={{ value: 'Base 100', fill: 'hsl(var(--muted-foreground))', fontSize: 10, position: 'insideTopRight' }}
              />
            )}
            {mode === 'index' && <Area type="monotone" dataKey="apixIndex" name="APIx Index" stroke="#2563eb" strokeWidth={1.5} fill="none" dot={{ r: 2, fill: '#2563eb' }} activeDot={{ r: 4 }} style={{ filter: "drop-shadow(0px 2px 4px rgba(37, 99, 235, 0.3))" }} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
