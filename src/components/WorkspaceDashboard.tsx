'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowRight, Folder, Users, CheckSquare, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { WorkspaceStats } from '@/lib/types';

export function WorkspaceDashboard() {
  const [workspaces, setWorkspaces] = useState<WorkspaceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces?stats=true');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🦞</div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦞</span>
              <h1 className="text-sm font-bold uppercase tracking-widest">Mission Control</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30 rounded font-medium text-xs hover:bg-[var(--cyber-primary)]/30 transition-colors uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              New Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 uppercase tracking-wider">All Workspaces</h2>
          <p className="text-zinc-500 text-xs">
            Select a workspace to view its mission queue and agents
          </p>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
            <h3 className="text-sm font-medium mb-2 uppercase tracking-wider">No workspaces yet</h3>
            <p className="text-zinc-500 text-xs mb-6">
              Create your first workspace to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30 rounded font-medium text-xs hover:bg-[var(--cyber-primary)]/30 uppercase tracking-wider"
            >
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <WorkspaceCard
                key={workspace.id}
                workspace={workspace}
                onDelete={(id) => setWorkspaces(workspaces.filter(w => w.id !== id))}
              />
            ))}

            {/* Add workspace card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="border border-dashed border-white/10 rounded p-6 hover:border-[var(--cyber-primary)]/50 transition-colors flex flex-col items-center justify-center gap-3 min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Plus className="w-6 h-6 text-zinc-500" />
              </div>
              <span className="text-zinc-500 font-medium text-xs uppercase tracking-wider">Add Workspace</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadWorkspaces();
          }}
        />
      )}
    </div>
  );
}

function WorkspaceCard({ workspace, onDelete }: { workspace: WorkspaceStats; onDelete: (id: string) => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(workspace.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete workspace');
      }
    } catch {
      alert('Failed to delete workspace');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
    <Link href={`/workspace/${workspace.slug}`}>
      <div className="cyber-card rounded p-6 hover:border-[var(--cyber-primary)]/50 transition-all cursor-pointer group relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{workspace.icon}</span>
            <div>
              <h3 className="font-semibold text-sm group-hover:text-[var(--cyber-primary)] transition-colors">
                {workspace.name}
              </h3>
              <p className="text-[10px] text-zinc-500">/{workspace.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {workspace.id !== 'default' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 rounded hover:bg-[var(--cyber-danger)]/20 text-zinc-500 hover:text-[var(--cyber-danger)] transition-colors opacity-0 group-hover:opacity-100"
                title="Delete workspace"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-[var(--cyber-primary)] transition-colors" />
          </div>
        </div>

        {/* Simple task/agent counts */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4">
          <div className="flex items-center gap-1">
            <CheckSquare className="w-4 h-4" />
            <span>{workspace.taskCounts.total} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{workspace.agentCount} agents</span>
          </div>
        </div>
      </div>
    </Link>

    {/* Delete Confirmation Modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="cyber-card rounded w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[var(--cyber-danger)]/20 rounded-full">
              <AlertTriangle className="w-6 h-6 text-[var(--cyber-danger)]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm uppercase tracking-wider">Delete Workspace</h3>
              <p className="text-[10px] text-zinc-500">This action cannot be undone</p>
            </div>
          </div>

          <p className="text-zinc-400 text-sm mb-6">
            Are you sure you want to delete <strong>{workspace.name}</strong>?
            {workspace.taskCounts.total > 0 && (
              <span className="block mt-2 text-[var(--cyber-danger)]">
                This workspace has {workspace.taskCounts.total} task(s). Delete them first.
              </span>
            )}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || workspace.taskCounts.total > 0 || workspace.agentCount > 0}
              className="px-4 py-2 bg-[var(--cyber-danger)]/20 text-[var(--cyber-danger)] border border-[var(--cyber-danger)]/30 rounded font-medium text-xs hover:bg-[var(--cyber-danger)]/30 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Workspace'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function CreateWorkspaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icons = ['📁', '💼', '🏢', '🚀', '💡', '🎯', '📊', '🔧', '🌟', '🏠'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create workspace');
      }
    } catch {
      setError('Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="cyber-card rounded w-full max-w-md">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-sm font-bold uppercase tracking-wider">Create New Workspace</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Icon selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded text-xl flex items-center justify-center transition-colors ${
                    icon === i
                      ? 'bg-[var(--cyber-primary)]/20 border-2 border-[var(--cyber-primary)]'
                      : 'bg-white/5 border border-white/10 hover:border-[var(--cyber-primary)]/50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Corp"
              className="w-full cyber-input rounded px-4 py-2 text-sm"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-[var(--cyber-danger)] text-xs">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-6 py-2 bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30 rounded font-medium text-xs hover:bg-[var(--cyber-primary)]/30 disabled:opacity-50 uppercase tracking-wider"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
