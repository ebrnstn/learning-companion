import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, FileText, Home } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  getAllLogEntries,
  getLogEntry,
  saveLogEntry,
  updateLogEntry,
  deleteLogEntry
} from '../lib/storage';

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

export default function LogView({ onBackToHome }) {
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dirty, setDirty] = useState(false);

  const refreshEntries = useCallback(() => {
    setEntries(getAllLogEntries());
  }, []);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const selectedEntry = selectedId ? getLogEntry(selectedId) : null;

  useEffect(() => {
    if (selectedEntry) {
      setTitle(selectedEntry.title);
      setBody(selectedEntry.body || '');
      setDirty(false);
    } else {
      setTitle('');
      setBody('');
      setDirty(false);
    }
  }, [selectedId, selectedEntry?.updatedAt]);

  const saveCurrent = useCallback(() => {
    if (!dirty) return;
    if (selectedId) {
      updateLogEntry(selectedId, { title: title.trim() || 'Untitled', body });
    } else if (title.trim() || body.trim()) {
      const id = saveLogEntry({ title: title.trim() || 'Untitled', body });
      setSelectedId(id);
    }
    setDirty(false);
    refreshEntries();
  }, [selectedId, title, body, dirty, refreshEntries]);

  useEffect(() => {
    const t = setInterval(saveCurrent, 2000);
    return () => clearInterval(t);
  }, [saveCurrent]);

  const handleSelectEntry = (id) => {
    saveCurrent();
    setSelectedId(id);
  };

  const handleNewNote = () => {
    saveCurrent();
    setSelectedId(null);
    setTitle('');
    setBody('');
    setDirty(false);
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteLogEntry(selectedId);
      setSelectedId(null);
      refreshEntries();
    }
  };

  return (
    <div className="h-full flex bg-neutral-950 text-white">
      {/* Collapsible sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-neutral-800 bg-neutral-900/50 transition-all duration-200 flex-shrink-0',
          sidebarCollapsed ? 'w-0 overflow-hidden border-0' : 'w-56 min-w-0'
        )}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-3 border-b border-neutral-800">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Log</span>
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {entries.length === 0 && (
            <p className="px-3 py-4 text-xs text-neutral-500">No entries yet.</p>
          )}
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => handleSelectEntry(entry.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 flex flex-col gap-0.5 transition-colors',
                selectedId === entry.id
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
              )}
            >
              <span className="text-sm font-medium truncate">
                {entry.title || 'Untitled'}
              </span>
              <span className="text-xs text-neutral-500">{formatDate(entry.updatedAt)}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Collapse toggle when sidebar is hidden */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-10 ml-2 p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors shadow-lg"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Main notepad */}
      <main className="flex-1 flex flex-col min-w-0">
        {onBackToHome && (
          <div className="flex-shrink-0 px-6 pt-6">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
            >
              <Home className="h-4 w-4" />
              <span>All Plans</span>
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 md:px-10 py-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleNewNote}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              New note
            </button>
            {selectedId && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0 border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              placeholder="Title"
              className="w-full px-5 py-4 bg-transparent text-xl font-semibold text-white placeholder:text-neutral-500 border-b border-neutral-800 focus:outline-none focus:ring-0"
            />
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setDirty(true);
              }}
              placeholder="Start writing…"
              className="flex-1 min-h-[200px] w-full px-5 py-4 bg-transparent text-neutral-200 placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-0 text-[15px] leading-relaxed"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
