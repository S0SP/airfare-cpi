"use client"

import { useEffect, useRef } from 'react';
import { ApiLogEntry } from '@/lib/api';
import { Terminal, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LogPanelProps {
  logs: ApiLogEntry[];
}

function statusColor(code: number) {
  if (code >= 200 && code < 300) return 'text-foreground font-semibold';
  if (code >= 400) return 'text-muted-foreground font-semibold';
  return 'text-muted-foreground font-semibold';
}

function timeStr(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-IN', { hour12: false });
}

export default function LogPanel({ logs }: LogPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="border border-border bg-card p-5 h-full flex flex-col min-h-0 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-border shrink-0">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
          Live Telemetry & Logs
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </h3>
        <Badge variant="secondary" className="ml-auto text-xs font-mono">
          {logs.length} events
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 pt-3 font-mono text-xs min-h-0">
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            Awaiting requests... Execute a query or run the mock scraper.
          </p>
        ) : (
          [...logs].reverse().map((log) => (
            <div
              key={log._id}
              className="flex items-center gap-2.5 py-1.5 px-2 bg-card border-b border-border text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-muted-foreground tabular-nums">{timeStr(log.timestamp)}</span>
              <span className={`font-semibold ${log.method === 'POST' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                {log.method}
              </span>
              <span className="text-foreground truncate flex-1">{log.endpoint}</span>
              <span className={statusColor(log.statusCode)}>{log.statusCode}</span>
              <span className="text-muted-foreground tabular-nums">{log.responseTime}ms</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
