import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, PlayCircle, FileText, BookOpen, Code, CheckCircle, ExternalLink, Check, Loader2, Lightbulb, BookMarked, HelpCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { searchStepResources, generateStepLearningContent } from '../lib/gemini';

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
  topic,
  onClose,
  onToggleComplete,
  onNavigate,
  hasPrev,
  hasNext,
  isOverlay = false,
}) {
  const [extraResources, setExtraResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [learningContent, setLearningContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    keyConcepts: true,
    vocabulary: false,
    practiceQuestions: false,
    learningTips: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    let active = true;

    async function loadResources() {
      if (!step || !topic) return;

      // Reset
      setExtraResources([]);
      setLoadingResources(true);

      try {
        const results = await searchStepResources(step.title, step.type, topic);
        if (active) {
          setExtraResources(results);
        }
      } catch (error) {
        console.error("Failed to load resources", error);
      } finally {
        if (active) {
          setLoadingResources(false);
        }
      }
    }

    loadResources();

    return () => { active = false; };
  }, [step, topic]);

  useEffect(() => {
    let active = true;

    async function loadLearningContent() {
      if (!step || !topic) return;

      // Reset
      setLearningContent(null);
      setContentError(null);
      setLoadingContent(true);

      try {
        const content = await generateStepLearningContent(step, topic, dayTitle);
        if (active) {
          setLearningContent(content);
        }
      } catch (error) {
        console.error("Failed to load learning content", error);
        if (active) {
          setContentError("Unable to generate learning insights");
        }
      } finally {
        if (active) {
          setLoadingContent(false);
        }
      }
    }

    loadLearningContent();

    return () => { active = false; };
  }, [step, topic, dayTitle]);

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

        {/* Learning Insights */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-neutral-300">Learning Insights</h3>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-400">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          </div>

          {loadingContent ? (
            <div className="flex items-center gap-2 text-neutral-500 text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating learning insights...</span>
            </div>
          ) : contentError ? (
            <p className="text-xs text-neutral-600 italic py-2">{contentError}</p>
          ) : learningContent ? (
            <div className="space-y-2">
              {/* Key Concepts */}
              {learningContent.keyConcepts?.length > 0 && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('keyConcepts')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-neutral-200">Key Concepts</span>
                      <span className="text-xs text-neutral-500">({learningContent.keyConcepts.length})</span>
                    </div>
                    {expandedSections.keyConcepts ? (
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                  {expandedSections.keyConcepts && (
                    <div className="px-3 py-2 space-y-2">
                      {learningContent.keyConcepts.map((item, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-yellow-400">{item.concept}:</span>
                          <span className="text-neutral-400 ml-1">{item.explanation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Vocabulary */}
              {learningContent.vocabulary?.length > 0 && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('vocabulary')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-neutral-200">Vocabulary</span>
                      <span className="text-xs text-neutral-500">({learningContent.vocabulary.length})</span>
                    </div>
                    {expandedSections.vocabulary ? (
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                  {expandedSections.vocabulary && (
                    <div className="px-3 py-2 space-y-2">
                      {learningContent.vocabulary.map((item, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-blue-400">{item.term}:</span>
                          <span className="text-neutral-400 ml-1">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Practice Questions */}
              {learningContent.practiceQuestions?.length > 0 && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('practiceQuestions')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-neutral-200">Practice Questions</span>
                      <span className="text-xs text-neutral-500">({learningContent.practiceQuestions.length})</span>
                    </div>
                    {expandedSections.practiceQuestions ? (
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                  {expandedSections.practiceQuestions && (
                    <div className="px-3 py-2 space-y-2">
                      {learningContent.practiceQuestions.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                          <span className="text-green-500 font-medium">{i + 1}.</span>
                          <span>{item.question}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Learning Tips */}
              {learningContent.learningTips?.length > 0 && (
                <div className="border border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('learningTips')}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-neutral-200">Learning Tips</span>
                      <span className="text-xs text-neutral-500">({learningContent.learningTips.length})</span>
                    </div>
                    {expandedSections.learningTips ? (
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                  {expandedSections.learningTips && (
                    <div className="px-3 py-2 space-y-2">
                      {learningContent.learningTips.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                          <span className="text-purple-400">•</span>
                          <span>{item.tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Connection to Next */}
              {learningContent.connectionToNext && (
                <div className="mt-3 px-3 py-2 bg-neutral-900/30 rounded-lg border border-neutral-800/50">
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-400">Next up:</span>{' '}
                    {learningContent.connectionToNext}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Resources */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-neutral-300 mb-2">Resources</h3>
          {step.resources && (
             <p className="text-sm text-neutral-400 mb-3">{step.resources}</p>
          )}

          {/* Dynamic Resources */}
          {loadingResources ? (
            <div className="flex items-center gap-2 text-neutral-500 text-sm py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching for helpful resources...</span>
            </div>
          ) : extraResources.length > 0 ? (
            <div className="space-y-2 mt-2">
              {extraResources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-3 bg-neutral-900/50 rounded-lg hover:bg-neutral-800 transition-colors group border border-transparent hover:border-neutral-700"
                >
                  <ExternalLink className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="block text-sm text-blue-400 group-hover:underline font-medium">{resource.title}</span>
                    {resource.description && (
                      <span className="block text-xs text-neutral-500 mt-1 line-clamp-2">{resource.description}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            // Only show "No additional resources" if we tried searching (topic exists) and found nothing
            topic && <p className="text-xs text-neutral-600 italic">No additional resources found.</p>
          )}
        </div>
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