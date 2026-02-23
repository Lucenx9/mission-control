'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import type { Event } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type FeedFilter = 'all' | 'tasks' | 'agents';

export function LiveFeed() {
  const { events } = useMissionControl();
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'tasks')
      return ['task_created', 'task_assigned', 'task_status_changed', 'task_completed'].includes(
        event.type
      );
    if (filter === 'agents')
      return ['agent_joined', 'agent_status_changed', 'message_sent'].includes(event.type);
    return true;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return '📋';
      case 'task_assigned':
        return '👤';
      case 'task_status_changed':
        return '🔄';
      case 'task_completed':
        return '✅';
      case 'message_sent':
        return '💬';
      case 'agent_joined':
        return '🎉';
      case 'agent_status_changed':
        return '🔔';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  return (
    <aside
      className={`bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-12' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center">
          <button
            onClick={toggleMinimize}
            className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label={isMinimized ? 'Expand feed' : 'Minimize feed'}
          >
            {isMinimized ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {!isMinimized && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live Feed</span>
          )}
        </div>

        {/* Filter Tabs */}
        {!isMinimized && (
          <div className="flex gap-1 mt-3">
            {(['all', 'tasks', 'agents'] as FeedFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-[10px] rounded uppercase tracking-wider ${
                  filter === tab
                    ? 'bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30'
                    : 'text-zinc-500 hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events List */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No events yet
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))
          )}
        </div>
      )}
    </aside>
  );
}

function EventItem({ event }: { event: Event }) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return '📋';
      case 'task_assigned':
        return '👤';
      case 'task_status_changed':
        return '🔄';
      case 'task_completed':
        return '✅';
      case 'message_sent':
        return '💬';
      case 'agent_joined':
        return '🎉';
      case 'agent_status_changed':
        return '🔔';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  const isTaskEvent = ['task_created', 'task_assigned', 'task_completed'].includes(event.type);
  const isHighlight = event.type === 'task_created' || event.type === 'task_completed';

  return (
    <div
      className={`p-2 rounded border-l-2 animate-slide-in ${
        isHighlight
          ? 'bg-white/5 border-[var(--cyber-primary)]'
          : 'bg-transparent border-transparent hover:bg-white/5'
      }`}
    >
      <div className="flex items-start gap-2">
        <span className="text-sm">{getEventIcon(event.type)}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs ${isTaskEvent ? 'text-[var(--cyber-primary)]' : 'text-zinc-300'}`}>
            {event.message}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-600">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
