import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { COURSES, FLASHCARDS, LESSONS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { LessonStageQuestion } from '../types/maintenance';
import { soundFx } from '../utils/sound';

interface QuizHubViewProps {
  mode: 'quizzes' | 'flashcards';
  onOpenMentor: (prompt: string) => void;
}

export const QuizHubView: React.FC<QuizHubViewProps> = ({ mode, onOpenMentor }) => {
  const {
    state,
    dueReviews,
    recordQuizAttempt,
    reviewSpacedItem,
  } = useMaintenanceStore();
  const soundOn = state.profile.soundEnabled;

  // Flashcards state
  const [fcCategory, setFcCategory] = useState<string>('All');
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Quiz Builder state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [timedMode, setTimedMode] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(180);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<LessonStageQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<{ scorePercent: number; xpAwarded: number } | null>(null);

  // AI generated quiz state
  const [aiTopic, setAiTopic] = useState('Three-Phase Motor Starters & Overload Troubleshooting');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filteredFlashcards = useMemo(
    () => FLASHCARDS.filter((f) => fcCategory === 'All' || f.category === fcCategory),
    [fcCategory]
  );

  const activeCard = filteredFlashcards[fcIndex % Math.max(1, filteredFlashcards.length)] || FLASHCARDS[0];
  const fcCategories = ['All', ...Array.from(new Set(FLASHCARDS.map((f) => f.category)))];

  useEffect(() => {
    if (!timedMode || activeQuizQuestions.length === 0 || submitted) return;
    if (secondsLeft <= 0) {
      finalizeQuiz();
      return;
    }
    const timer = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode, activeQuizQuestions.length, submitted, secondsLeft]);

  function startAssessment() {
    soundFx.click(soundOn);
    const pool = LESSONS.filter(
      (l) => selectedCourseId === 'all' || l.courseId === selectedCourseId
    ).flatMap((l) => l.stage5Quiz);

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    const courseName =
      selectedCourseId === 'all'
        ? 'Mixed Industrial Maintenance Assessment'
        : `${COURSES.find((c) => c.id === selectedCourseId)?.title || 'Module'} Assessment`;

    setQuizTitle(courseName);
    setActiveQuizQuestions(shuffled);
    setAnswers({});
    setSubmitted(false);
    setLastResult(null);
    setSecondsLeft(180);
  }

  async function generateAiQuiz() {
    setAiLoading(true);
    setAiError(null);
    try {
      const resp = await fetch('/api/mentor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, difficulty: 'Intermediate', count: 4 }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setAiError(data.error || 'Could not generate AI questions.');
        return;
      }
      const generated: LessonStageQuestion[] = (data.questions || []).map(
        (
          q: {
            prompt: string;
            options: string[];
            correctIndex: number;
            explanation: string;
            topicTag: string;
          },
          i: number
        ) => ({
          id: `aiq-${Date.now()}-${i}`,
          kind: 'multiple_choice',
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topicTag: q.topicTag || aiTopic,
        })
      );

      setQuizTitle(`Path Mentor Adaptive Check: ${aiTopic}`);
      setActiveQuizQuestions(generated);
      setAnswers({});
      setSubmitted(false);
      setLastResult(null);
      setSecondsLeft(180);
    } catch {
      setAiError('Network error contacting Path Mentor quiz service.');
    } finally {
      setAiLoading(false);
    }
  }

  function finalizeQuiz() {
    let correct = 0;
    const missedTopics: string[] = [];
    const missedQuestions: LessonStageQuestion[] = [];
    for (const q of activeQuizQuestions) {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
      } else {
        missedTopics.push(q.topicTag);
        missedQuestions.push(q);
      }
    }

    const res = recordQuizAttempt({
      title: quizTitle,
      category:
        selectedCourseId === 'all'
          ? 'Mixed Assessment'
          : COURSES.find((c) => c.id === selectedCourseId)?.title || 'Assessment',
      correctCount: correct,
      totalCount: activeQuizQuestions.length,
      timeSpentSeconds: timedMode ? 180 - secondsLeft : 95,
      missedTopics: Array.from(new Set(missedTopics)),
      missedQuestions,
    });

    if (res.scorePercent >= 70) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    setSubmitted(true);
    setLastResult(res);
  }

  if (mode === 'flashcards') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Industrial Flashcard Deck
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Click or press Space/Enter to flip cards and reinforce core terminology and field rules.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
            {fcCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFcCategory(cat);
                  setFcIndex(0);
                  setFcFlipped(false);
                }}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                  fcCategory === cat ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-4">
          <button
            type="button"
            onClick={() => {
              soundFx.click(soundOn);
              setFcFlipped((f) => !f);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-900 p-8 text-left text-white transition-transform duration-150 hover:scale-[1.005]"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{activeCard.category}</span>
              <span className="font-mono tabular-nums">
                Card {(fcIndex % filteredFlashcards.length) + 1} / {filteredFlashcards.length}
              </span>
            </div>

            <div className="mt-6 min-h-[120px]">
              {!fcFlipped ? (
                <>
                  <div className="text-xs font-semibold text-yellow-400">Question / Concept</div>
                  <p className="mt-2 font-display text-xl font-bold leading-snug text-white">
                    {activeCard.front}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold text-emerald-400">Technical Answer</div>
                  <p className="mt-2 text-lg font-semibold leading-snug text-white">
                    {activeCard.back}
                  </p>
                  <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-300">
                    Field Tip: {activeCard.practicalTip}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-slate-400">
              <RotateCw className="h-3.5 w-3.5" />
              <span>{fcFlipped ? 'Click to see question' : 'Click to reveal answer'}</span>
            </div>
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setFcFlipped(false);
                setFcIndex((i) => (i - 1 + filteredFlashcards.length) % filteredFlashcards.length);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Previous Card
            </button>
            <button
              type="button"
              onClick={() => {
                setFcFlipped(false);
                setFcIndex((i) => (i + 1) % filteredFlashcards.length);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Next Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Launcher + AI Generator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Smart Topic &amp; Module Assessments
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Educational knowledge checks track missed concepts into your spaced repetition queue. Passing a quiz does not substitute for hands-on workplace competency evaluation.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Learning Path Scope
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All 8 Paths (Mixed Assessment)</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    Path {c.pathNumber}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex min-h-[40px] items-center gap-2 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={timedMode}
                  onChange={(e) => setTimedMode(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Timed Challenge (3 min)</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={startAssessment}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Layers className="h-4 w-4 text-yellow-400" />
            <span>Start Assessment</span>
          </button>
        </div>

        {/* Path Mentor Custom Quiz Generator */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Bot className="h-4 w-4" />
            <span>Path Mentor Practice Generator</span>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
            Generate Custom Practice Questions
          </h3>
          <input
            type="text"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Enter topic (e.g., Hydraulic Relief Valves)"
          />
          {aiError && <p className="mt-2 text-xs text-rose-700">{aiError}</p>}
          <button
            type="button"
            disabled={aiLoading}
            onClick={generateAiQuiz}
            className="mt-3 inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{aiLoading ? 'Generating...' : 'Generate 4 AI Questions'}</span>
          </button>
        </div>
      </div>

      {/* Active Quiz Session */}
      {activeQuizQuestions.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <h3 className="font-display text-lg font-bold text-slate-900">{quizTitle}</h3>
            {timedMode && !submitted && (
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-700 tabular-nums">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {activeQuizQuestions.map((q, idx) => {
              const picked = answers[q.id];
              const isRight = picked === q.correctIndex;
              return (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Q{idx + 1} · {q.topicTag}
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-900">{q.prompt}</p>
                  <div className="mt-3 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      let cls = 'border-slate-200 bg-white text-slate-800';
                      if (submitted) {
                        if (optIdx === q.correctIndex) cls = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                        else if (picked === optIdx) cls = 'border-rose-400 bg-rose-50 text-rose-950';
                      } else if (picked === optIdx) {
                        cls = 'border-slate-900 bg-slate-900 text-white';
                      }
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((p) => ({ ...p, [q.id]: optIdx }))}
                          className={`w-full rounded-lg border px-3.5 py-2 text-left text-sm ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className={`mt-3 rounded-lg p-3 text-xs ${isRight ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                      <span className="font-bold">{isRight ? 'Correct: ' : 'Explanation: '}</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {!submitted ? (
              <button
                type="button"
                onClick={finalizeQuiz}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Submit Assessment
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                  Result: {lastResult?.scorePercent}% · +{lastResult?.xpAwarded} XP
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onOpenMentor(
                      `I scored ${lastResult?.scorePercent}% on "${quizTitle}". Can you help me review the topics I missed?`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <Bot className="h-4 w-4 text-emerald-700" />
                  <span>Debrief with Path Mentor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spaced Repetition Review Queue */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              Spaced Repetition Review Queue
            </h3>
            <p className="text-xs text-slate-600">
              Missed items reappear at expanding intervals (1d -&gt; 3d -&gt; 7d -&gt; 14d -&gt; 30d).
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
            {dueReviews.length} due now
          </span>
        </div>

        {dueReviews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No missed questions due for review right now. Complete a lesson or quiz to build your review deck.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {dueReviews.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.category} · {item.question.topicTag}</span>
                  <span className="font-mono tabular-nums">Interval: {item.intervalDays}d</span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-900">{item.question.prompt}</p>
                <p className="mt-1.5 text-xs text-slate-700">
                  Correct Answer: <span className="font-semibold">{item.question.options[item.question.correctIndex]}</span> — {item.question.explanation}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.success(soundOn);
                      reviewSpacedItem(item.id, true);
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Got It — Schedule Longer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.click(soundOn);
                      reviewSpacedItem(item.id, false);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Keep Reviewing Tomorrow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempt History */}
      {state.quizAttempts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-slate-900">
            Recent Assessment History
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-4">Assessment</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4 text-right">Score</th>
                  <th className="py-2 pr-4">Next Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.quizAttempts.slice(0, 8).map((qa) => (
                  <tr key={qa.id}>
                    <td className="py-2.5 pr-4 font-medium text-slate-900">{qa.title}</td>
                    <td className="py-2.5 pr-4 text-slate-600">{qa.category}</td>
                    <td className="py-2.5 pr-4 text-right font-mono font-bold tabular-nums">
                      {qa.scorePercent}%
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-slate-500 tabular-nums">
                      {qa.nextReviewDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
