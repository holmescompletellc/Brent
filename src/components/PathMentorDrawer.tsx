import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, ShieldAlert, Trash2, X } from 'lucide-react';
import { CAREER_GOALS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { MentorMode } from '../types/maintenance';

interface PathMentorDrawerProps {
  open: boolean;
  onClose: () => void;
  initialPrompt?: string;
  activeScreenLabel: string;
  activeLessonTitle?: string;
  activeLessonSummary?: string;
  simulatorContext?: string;
}

const TEACHING_MODES: { id: MentorMode; label: string }[] = [
  { id: 'explain_simply', label: 'Explain It Simply' },
  { id: 'step_by_step', label: 'Teach Me Step by Step' },
  { id: 'quiz_me', label: 'Quiz Me' },
  { id: 'hint', label: 'Give Me a Hint' },
  { id: 'challenge', label: 'Challenge Me' },
  { id: 'interview_prep', label: 'Prepare Me for an Interview' },
];

export const PathMentorDrawer: React.FC<PathMentorDrawerProps> = ({
  open,
  onClose,
  initialPrompt,
  activeScreenLabel,
  activeLessonTitle,
  activeLessonSummary,
  simulatorContext,
}) => {
  const {
    state,
    currentLevel,
    weakSkills,
    appendMentorMessage,
    clearMentorHistory,
  } = useMaintenanceStore();

  const [mode, setMode] = useState<MentorMode>('explain_simply');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && initialPrompt) {
      setInput(initialPrompt);
    }
  }, [open, initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.mentorConversations.length, loading]);

  if (!open) return null;

  const careerGoal = CAREER_GOALS.find((g) => g.id === state.profile.careerGoalId);

  async function sendMessage(textToSend?: string) {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || loading) return;

    setInput('');
    setErrorMsg(null);
    appendMentorMessage('user', trimmed, mode);
    setLoading(true);

    try {
      const historyPayload = [
        ...state.mentorConversations.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: trimmed },
      ];

      const resp = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          mode,
          context: {
            learnerName: state.profile.name,
            technicianLevel: `Level ${currentLevel.level} - ${currentLevel.title}`,
            careerGoal: careerGoal?.title,
            activeScreen: activeScreenLabel,
            lessonTitle: activeLessonTitle,
            lessonSummary: activeLessonSummary,
            simulatorName: simulatorContext ? 'Virtual Lab' : undefined,
            simulatorState: simulatorContext,
            weakSkills: weakSkills.map((w) => w.name),
            quizMissedTopics: state.quizAttempts.slice(0, 3).flatMap((q) => q.missedTopics),
          },
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || 'Path Mentor could not respond right now.');
        return;
      }

      appendMentorMessage('assistant', data.reply, mode);
    } catch {
      setErrorMsg('Unable to reach the Path Mentor server. Check connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="path-mentor-title"
    >
      <div className="flex h-full w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400 text-slate-950">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 id="path-mentor-title" className="font-display text-base font-bold">
                Path Mentor
              </h2>
              <p className="text-xs text-slate-300">
                AI Industrial Maintenance Instructor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {state.mentorConversations.length > 0 && (
              <button
                type="button"
                aria-label="Clear conversation"
                onClick={clearMentorHistory}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              aria-label="Close Path Mentor"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 6 Teaching Modes */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-[11px] font-semibold text-slate-500">Teaching Mode</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TEACHING_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  mode === m.id
                    ? 'bg-slate-900 text-yellow-400'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Notice */}
        <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-950">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
          <span>
            Educational tutor only. Never troubleshoot live energized machinery without site-approved LOTO, PPE, and qualified supervision.
          </span>
        </div>

        {/* Conversation Feed */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {state.mentorConversations.length === 0 && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Hello {state.profile.name}. How can we sharpen your maintenance skills today?
              </p>
              <p className="text-xs text-slate-600">
                I adapt to your current lesson, simulator readings, quiz gaps, and target {careerGoal?.title} role. Try a quick prompt:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Explain why a closed switch reads 0 VAC across its terminals.',
                  'Walk me through diagnosing a motor that stops when Start is released.',
                  'Ask me 1 interview question for a Maintenance Technician role.',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-800 hover:bg-slate-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.mentorConversations.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
                Path Mentor is preparing an explanation...
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-medium text-rose-900">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about schematics, faults, LOTO, or interview prep..."
              className="flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message to Path Mentor"
              className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl bg-slate-900 text-yellow-400 hover:bg-slate-800 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
