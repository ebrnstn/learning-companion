import React from 'react';
import { X, ArrowLeft, ArrowRight, PlayCircle, FileText, BookOpen, Code, CheckCircle, ExternalLink, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const typeConfig = {
  video: { icon: PlayCircle, label: 'VIDEO', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  article: { icon: FileText, label: 'ARTICLE', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  quiz: { icon: BookOpen, label: 'QUIZ', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  exercise: { icon: Code, label: 'EXERCISE', color: 'text-green-400', bg: 'bg-green-500/10' },
  project: { icon: Code, label: 'PROJECT', color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export default function ActivityDetailView({
  step,
  dayTitle,
  onClose,
  onToggleComplete,
  onNavigate,
  hasPrev,
  hasNext,
  isOverlay = false,
}) {
  if (!step) return null;

  const config = typeConfig[step.type] || typeConfig.article;
  const TypeIcon = config.icon;

  return (
    <div className={cn(
      "flex flex-col bg-neutral-950 text-white",
      isOverlay ? "fixed inset-0 z-50" : "h-full"
    )}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3 min-w-0">
          {hasPrev && (
            <button
              onClick={() => onNavigate('prev')}
              className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Previous step"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold truncate">{step.title}</h1>
        </div>
        {isOverlay && (
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Day context */}
        {dayTitle && (
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">
            {dayTitle}
          </p>
        )}

        {/* Metadata badges */}
        <div className="flex items-center gap-3 mb-6">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            config.bg, config.color
          )}>
            <TypeIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          <span className="text-sm text-neutral-400">{step.duration}</span>
        </div>

        {/* External link card */}
        {step.url && (
          <a
            href={step.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-6 p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 hover:bg-neutral-800/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  <TypeIcon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Open {config.label.toLowerCase()}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">
                    {(() => { try { return new URL(step.url).hostname; } catch { return step.url; } })()}
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-neutral-500 group-hover:text-white transition-colors flex-shrink-0" />
            </div>
          </a>
        )}

        {/* Description */}
        {step.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">Description</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
          </div>
        )}

        {/* Objectives */}
        {step.objectives && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-300 mb-2">Learning Objectives</h3>
            <ul className="space-y-1.5">
              {(Array.isArray(step.objectives) ? step.objectives : step.objectives.split('. ')).map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                  <span className="text-neutral-600 mt-1">•</span>
                  <span>{obj.trim().replace(/\.$/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources */}
        {step.resources && (
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-2">Resources</h3>
            <p className="text-sm text-blue-400">{step.resources}</p>
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleComplete}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-colors",
              step.completed
                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            )}
          >
            {step.completed ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Completed
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Mark Complete
              </>
            )}
          </button>

          {hasNext && (
            <button
              onClick={() => onNavigate('next')}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
