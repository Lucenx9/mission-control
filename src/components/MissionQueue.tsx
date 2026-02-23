'use client';

import { useState } from 'react';
import { Plus, ChevronRight, GripVertical } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import { triggerAutoDispatch, shouldTriggerAutoDispatch } from '@/lib/auto-dispatch';
import { safeRandomId } from '@/lib/id';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskModal } from './TaskModal';
import { formatDistanceToNow } from 'date-fns';

interface MissionQueueProps {
  workspaceId?: string;
}

const COLUMNS: { id: TaskStatus; label: string; accent: string }[] = [
  { id: 'planning', label: 'PLANNING', accent: 'var(--cyber-secondary)' },
  { id: 'inbox', label: 'INBOX', accent: 'var(--cyber-primary)' },
  { id: 'assigned', label: 'ASSIGNED', accent: 'var(--cyber-warning)' },
  { id: 'in_progress', label: 'IN PROGRESS', accent: 'var(--cyber-primary)' },
  { id: 'testing', label: 'TESTING', accent: 'var(--cyber-success)' },
  { id: 'review', label: 'REVIEW', accent: 'var(--cyber-secondary)' },
  { id: 'done', label: 'DONE', accent: 'var(--cyber-success)' },
];

export function MissionQueue({ workspaceId }: MissionQueueProps) {
  const { tasks, updateTaskStatus, addEvent } = useMissionControl();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    updateTaskStatus(draggedTask.id, targetStatus);

    // Persist to API
    try {
      const res = await fetch(`/api/tasks/${draggedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (res.ok) {
        // Add event
        addEvent({
          id: safeRandomId(),
          type: targetStatus === 'done' ? 'task_completed' : 'task_status_changed',
          task_id: draggedTask.id,
          message: `Task "${draggedTask.title}" moved to ${targetStatus}`,
          created_at: new Date().toISOString(),
        });

        // Check if auto-dispatch should be triggered and execute it
        if (shouldTriggerAutoDispatch(draggedTask.status, targetStatus, draggedTask.assigned_agent_id)) {
          const result = await triggerAutoDispatch({
            taskId: draggedTask.id,
            taskTitle: draggedTask.title,
            agentId: draggedTask.assigned_agent_id,
            agentName: draggedTask.assigned_agent?.name || 'Unknown Agent',
            workspaceId: draggedTask.workspace_id
          });

          if (!result.success) {
            console.error('Auto-dispatch failed:', result.error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert on error
      updateTaskStatus(draggedTask.id, draggedTask.status);
    }

    setDraggedTask(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-zinc-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mission Queue</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30 rounded text-xs font-medium hover:bg-[var(--cyber-primary)]/30 transition-colors uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-3 p-3 overflow-x-auto">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="flex-1 min-w-[220px] max-w-[300px] flex flex-col bg-black/20 rounded border border-white/5"
              style={{ borderTopColor: column.accent, borderTopWidth: '2px' }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: column.accent }}>
                  {column.label}
                </span>
                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-zinc-500">
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onClick={() => setEditingTask(task)}
                    isDragging={draggedTask?.id === task.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TaskModal onClose={() => setShowCreateModal(false)} workspaceId={workspaceId} />
      )}
      {editingTask && (
        <TaskModal task={editingTask} onClose={() => setEditingTask(null)} workspaceId={workspaceId} />
      )}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onClick: () => void;
  isDragging: boolean;
}

function TaskCard({ task, onDragStart, onClick, isDragging }: TaskCardProps) {
  const priorityColors = {
    low: 'text-zinc-500',
    normal: 'text-[var(--cyber-primary)]',
    high: 'text-[var(--cyber-warning)]',
    urgent: 'text-[var(--cyber-danger)]',
  };

  const priorityDots = {
    low: 'bg-zinc-600',
    normal: 'bg-[var(--cyber-primary)]',
    high: 'bg-[var(--cyber-warning)]',
    urgent: 'bg-[var(--cyber-danger)]',
  };

  const isPlanning = task.status === 'planning';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={`group bg-white/5 border rounded cursor-pointer transition-all hover:border-[var(--cyber-primary)]/50 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isPlanning ? 'border-[var(--cyber-secondary)]/40 hover:border-[var(--cyber-secondary)]' : 'border-white/10'}`}
    >
      {/* Drag handle bar */}
      <div className="flex items-center justify-center py-1.5 border-b border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-zinc-600 cursor-grab" />
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Title */}
        <h4 className="text-sm font-medium leading-snug line-clamp-2 mb-3">
          {task.title}
        </h4>

        {/* Planning mode indicator */}
        {isPlanning && (
          <div className="flex items-center gap-2 mb-3 py-2 px-3 bg-[var(--cyber-secondary)]/10 rounded border border-[var(--cyber-secondary)]/20">
            <div className="w-2 h-2 bg-[var(--cyber-secondary)] rounded-full animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-[var(--cyber-secondary)] font-medium uppercase tracking-wider">Continue planning</span>
          </div>
        )}

        {/* Assigned agent */}
        {task.assigned_agent && (
          <div className="flex items-center gap-2 mb-3 py-1.5 px-2 bg-black/30 rounded">
            <span className="text-base">{(task.assigned_agent as unknown as { avatar_emoji: string }).avatar_emoji}</span>
            <span className="text-[10px] text-zinc-500 truncate">
              {(task.assigned_agent as unknown as { name: string }).name}
            </span>
          </div>
        )}

        {/* Footer: priority + timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${priorityDots[task.priority]}`} />
            <span className={`text-[10px] capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <span className="text-[10px] text-zinc-600">
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
