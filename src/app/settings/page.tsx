/**
 * Settings Page
 * Configure Mission Control paths, URLs, and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, RotateCcw, Home, FolderOpen, Link as LinkIcon } from 'lucide-react';
import { getConfig, updateConfig, resetConfig, type MissionControlConfig } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<MissionControlConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      updateConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetConfig();
      setConfig(getConfig());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleChange = (field: keyof MissionControlConfig, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-zinc-500 text-xs">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 text-xs"
              title="Back to Mission Control"
            >
              ← Back
            </button>
            <Settings className="w-6 h-6 text-[var(--cyber-primary)]" />
            <h1 className="text-sm font-bold uppercase tracking-widest">Settings</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-white/10 rounded hover:bg-white/5 text-zinc-500 flex items-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[var(--cyber-primary)]/20 text-[var(--cyber-primary)] border border-[var(--cyber-primary)]/30 rounded hover:bg-[var(--cyber-primary)]/30 flex items-center gap-2 disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-[var(--cyber-success)]/10 border border-[var(--cyber-success)]/30 rounded text-[var(--cyber-success)] text-xs">
            Settings saved successfully
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--cyber-danger)]/10 border border-[var(--cyber-danger)]/30 rounded text-[var(--cyber-danger)] text-xs">
            {error}
          </div>
        )}

        {/* Workspace Paths */}
        <section className="mb-8 p-6 cyber-card rounded">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-[var(--cyber-primary)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Workspace Paths</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Configure where Mission Control stores projects and deliverables.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Workspace Base Path
              </label>
              <input
                type="text"
                value={config.workspaceBasePath}
                onChange={(e) => handleChange('workspaceBasePath', e.target.value)}
                placeholder="~/Documents/Shared"
                className="w-full cyber-input rounded px-4 py-2 text-sm"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Base directory for all Mission Control files. Use ~ for home directory.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Projects Path
              </label>
              <input
                type="text"
                value={config.projectsPath}
                onChange={(e) => handleChange('projectsPath', e.target.value)}
                placeholder="~/Documents/Shared/projects"
                className="w-full cyber-input rounded px-4 py-2 text-sm"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Directory where project folders are created. Each project gets its own folder.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Default Project Name
              </label>
              <input
                type="text"
                value={config.defaultProjectName}
                onChange={(e) => handleChange('defaultProjectName', e.target.value)}
                placeholder="mission-control"
                className="w-full cyber-input rounded px-4 py-2 text-sm"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                Default name for new projects. Can be changed per project.
              </p>
            </div>
          </div>
        </section>

        {/* API Configuration */}
        <section className="mb-8 p-6 cyber-card rounded">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-[var(--cyber-primary)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">API Configuration</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-4">
            Configure Mission Control API URL for agent orchestration.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Mission Control URL
              </label>
              <input
                type="text"
                value={config.missionControlUrl}
                onChange={(e) => handleChange('missionControlUrl', e.target.value)}
                placeholder="http://localhost:4000"
                className="w-full cyber-input rounded px-4 py-2 text-sm"
              />
              <p className="text-[10px] text-zinc-600 mt-1">
                URL where Mission Control is running. Auto-detected by default. Change for remote access.
              </p>
            </div>
          </div>
        </section>

        {/* Environment Variables Note */}
        <section className="p-6 bg-[var(--cyber-primary)]/5 border border-[var(--cyber-primary)]/20 rounded">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--cyber-primary)] mb-2">
            Environment Variables
          </h3>
          <p className="text-xs text-zinc-400 mb-3">
            Some settings are also configurable via environment variables in <code className="px-2 py-1 bg-black/40 rounded text-[10px]">.env.local</code>:
          </p>
          <ul className="text-xs text-zinc-400 space-y-1 ml-4 list-disc">
            <li><code className="text-[var(--cyber-primary)]">MISSION_CONTROL_URL</code> - API URL override</li>
            <li><code className="text-[var(--cyber-primary)]">WORKSPACE_BASE_PATH</code> - Base workspace directory</li>
            <li><code className="text-[var(--cyber-primary)]">PROJECTS_PATH</code> - Projects directory</li>
            <li><code className="text-[var(--cyber-primary)]">OPENCLAW_GATEWAY_URL</code> - Gateway WebSocket URL</li>
            <li><code className="text-[var(--cyber-primary)]">OPENCLAW_GATEWAY_TOKEN</code> - Gateway auth token</li>
          </ul>
          <p className="text-[10px] text-zinc-500 mt-3">
            Environment variables take precedence over UI settings for server-side operations.
          </p>
        </section>
      </div>
    </div>
  );
}
