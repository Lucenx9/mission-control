'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, ChevronLeft, LayoutGrid } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import { format } from 'date-fns';
import type { Workspace } from '@/lib/types';

interface HeaderProps {
  workspace?: Workspace;
}

export function Header({ workspace }: HeaderProps) {
  const router = useRouter();
  const { agents, tasks, isOnline } = useMissionControl();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSubAgents, setActiveSubAgents] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load active sub-agent count
  useEffect(() => {
    const loadSubAgentCount = async () => {
      try {
        const res = await fetch('/api/openclaw/sessions?session_type=subagent&status=active');
        if (res.ok) {
          const sessions = await res.json();
          setActiveSubAgents(sessions.length);
        }
      } catch (error) {
        console.error('Failed to load sub-agent count:', error);
      }
    };

    loadSubAgentCount();

    // Poll every 30 seconds (reduced from 10s to reduce load)
    const interval = setInterval(loadSubAgentCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const workingAgents = agents.filter((a) => a.status === 'working').length;
  const activeAgents = workingAgents + activeSubAgents;
  const tasksInQueue = tasks.filter((t) => t.status !== 'done' && t.status !== 'review').length;

  return (
    <header className="h-14 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Radio/Signal SVG icon */}
          <svg className="w-5 h-5 text-[var(--cyber-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
            <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
            <circle cx="12" cy="12" r="2" />
            <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
            <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
          </svg>
          <span className="font-bold text-[var(--foreground)] uppercase tracking-widest text-xs">
            Mission Control
          </span>
        </div>

        {/* Workspace indicator or back to dashboard */}
        {workspace ? (
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1 text-zinc-500 hover:text-[var(--cyber-primary)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <span className="text-zinc-600">/</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5">
              <span className="text-lg">{workspace.icon}</span>
              <span className="font-medium text-sm">{workspace.name}</span>
            </div>
          </div>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/5 hover:bg-white/10 transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">All Workspaces</span>
          </Link>
        )}
      </div>

      {/* Center: Stats - only show in workspace view */}
      {workspace && (
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--cyber-primary)]">{activeAgents}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Agents Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--cyber-secondary)]">{tasksInQueue}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Tasks in Queue</div>
          </div>
        </div>
      )}

      {/* Right: Time & Status */}
      <div className="flex items-center gap-4">
        <span className="text-zinc-500 text-xs font-mono tracking-wider">
          {format(currentTime, 'HH:mm:ss')}
        </span>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded border text-xs font-medium ${
            isOnline
              ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
              : 'bg-red-400/10 border-red-400/30 text-red-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
            }`}
          />
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="p-2 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
