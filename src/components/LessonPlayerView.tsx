import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { COURSES, LESSONS, SKILLS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { soundFx } from '../utils/sound';

interface LessonPlayerViewProps {
  lessonId: string;
  onSelectLesson: (id: string) => void;
  onBackToTree: () => void;
  onOpenMentor: (prompt: string) => void;
}

const STAGE_NAMES = [
  '1. Learn',
  '2. Understand',
  '3. See It Work',
  '4. Practice',
  '5. Knowledge Check',
  '6. Demonstrate',
  '7. Complete',
];

export const LessonPlayerView: React.FC<LessonPlayerViewProps> = ({
  lessonId,
  onSelectLesson,
  onBackToTree,
  onOpenMentor,
}) => {
  const {
    state,
    achievements,
    startOrAdvanceLessonStage,
    markStage4Passed,
    completeLesson,
  } = useMaintenanceStore();

  const lesson = LESSONS.find((l) => l.id === lessonId) || LESSONS[0];
  const course = COURSES.find((c) => c.id === lesson.courseId) || COURSES[0];
  const skill = SKILLS.find((s) => s.id === lesson.skillId);
  const progressRec = state.lessonProgress[lesson.id];
  const soundOn = state.profile.soundEnabled;

  const [stage, setStage] = useState<number>(progressRec?.currentStage || 1);
  const [seeItIdx, setSeeItIdx] = useState(0);

  // Stage 4 Practice state
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string[]>([]);
  const [practiceStatus, setPracticeStatus] = useState<'idle' | 'pass' | 'retry'>('idle');

  // Stage 5 Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScorePct, setQuizScorePct] = useState(progressRec?.quizBestScore || 0);

  // Stage 6 Demonstrate state
  const [demonstrateText, setDemonstrateText] = useState(progressRec?.demonstrateResponse || '');
  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});
  const [completionResult, setCompletionResult] = useState<{
    xpEarnedNow: number;
    moduleCompletedNow: boolean;
  } | null>(null);

  const shuffledQuestions = useMemo(() => {
    const qs = [...lesson.stage5Quiz];
    // Deterministic shuffle per lesson load
    for (let i = qs.length - 1; i > 0; i--) {
      const j = (i * 7 + lesson.title.length) % (i + 1);
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    return qs;
  }, [lesson]);

  useEffect(() => {
    const rec = state.lessonProgress[lesson.id];
    setStage(rec?.currentStage && rec.currentStage <= 7 ? rec.currentStage : 1);
    setSeeItIdx(0);
    setSequenceOrder(lesson.stage4Practice.items.map((i) => i.id).reverse());
    setSelectedSet([]);
    setPracticeStatus(rec?.stage4Passed ? 'pass' : 'idle');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScorePct(rec?.quizBestScore || 0);
    setDemonstrateText(rec?.demonstrateResponse || '');
    setCheckedCriteria({});
    setCompletionResult(null);
    startOrAdvanceLessonStage(lesson.id, rec?.currentStage || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  function goToStage(nextStage: number) {
    soundFx.click(soundOn);
    setStage(nextStage);
    startOrAdvanceLessonStage(lesson.id, nextStage);
  }

  function moveSequenceItem(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= sequenceOrder.length) return;
    soundFx.click(soundOn);
    const copy = [...sequenceOrder];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setSequenceOrder(copy);
    setPracticeStatus('idle');
  }

  function togglePracticeSelection(id: string) {
    soundFx.click(soundOn);
    setPracticeStatus('idle');
    setSelectedSet((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function checkStage4Practice() {
    const p = lesson.stage4Practice;
    let passed = false;
    if (p.mode === 'sequence') {
      passed =
        sequenceOrder.length === p.correctOrderOrIds.length &&
        sequenceOrder.every((id, idx) => id === p.correctOrderOrIds[idx]);
    } else {
      const sortedSel = [...selectedSet].sort();
      const sortedExp = [...p.correctOrderOrIds].sort();
      passed =
        sortedSel.length === sortedExp.length &&
        sortedSel.every((id, idx) => id === sortedExp[idx]);
    }

    if (passed) {
      soundFx.success(soundOn);
      setPracticeStatus('pass');
      markStage4Passed(lesson.id);
    } else {
      soundFx.fault(soundOn);
      setPracticeStatus('retry');
    }
  }

  function handleSubmitQuiz(e: React.FormEvent) {
    e.preventDefault();
    let correct = 0;
    for (const q of shuffledQuestions) {
      if (quizAnswers[q.id] === q.correctIndex) correct += 1;
    }
    const pct = Math.round((correct / Math.max(1, shuffledQuestions.length)) * 100);
    setQuizScorePct(pct);
    setQuizSubmitted(true);
    if (pct >= 70) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
  }

  function handleFinalizeLesson(e: React.FormEvent) {
    e.preventDefault();
    const missedTopics: string[] = [];
    const missedQuestions = shuffledQuestions.filter((q) => {
      const wrong = quizAnswers[q.id] !== q.correctIndex;
      if (wrong) missedTopics.push(q.topicTag);
      return wrong;
    });

    const finalScore = quizSubmitted ? quizScorePct : Math.max(80, progressRec?.quizBestScore || 80);
    const res = completeLesson(
      lesson.id,
      finalScore,
      demonstrateText.trim(),
      Array.from(new Set(missedTopics)),
      missedQuestions
    );
    soundFx.complete(soundOn);
    setCompletionResult(res);
    setStage(7);
  }

  const nextLessonIdx = LESSONS.findIndex((l) => l.id === lesson.id) + 1;
  const nextLesson = nextLessonIdx < LESSONS.length ? LESSONS[nextLessonIdx] : null;
  const activeState = lesson.stage3SeeItWork.interactiveStates[seeItIdx] || lesson.stage3SeeItWork.interactiveStates[0];

  return (
    <div className="space-y-6">
      {/* Top Lesson Breadcrumb & Mentor Button */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToTree}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Skill Tree · Path {course.pathNumber}</span>
          </button>
          <h2 className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl">
            {lesson.title}
          </h2>
          <p className="text-xs text-slate-500">
            {course.title} · Skill: {skill?.name} · {lesson.durationMinutes} min
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpenMentor(
              `I am on Stage ${stage} of "${lesson.title}". Can you explain the key safety and technical concept here?`
            )
          }
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
        >
          <Bot className="h-4 w-4 text-emerald-700" />
          <span>Ask Path Mentor</span>
        </button>
      </div>

      {/* 7-Stage Stepper Bar */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex min-w-max items-center gap-1">
          {STAGE_NAMES.map((name, idx) => {
            const num = idx + 1;
            const active = stage === num;
            const visited = (progressRec?.currentStage || 1) >= num || stage >= num;
            return (
              <button
                key={name}
                type="button"
                onClick={() => goToStage(num)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 text-yellow-400'
                    : visited
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Workspace Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        {stage === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 1 · Learn</span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                Core Technical Principle
              </h3>
              <p className="mt-3 text-base leading-relaxed text-slate-700">
                {lesson.stage1Learn.summary}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="text-sm font-bold text-slate-900">Key Field Takeaways</h4>
              <ul className="mt-2.5 space-y-2 text-sm text-slate-700">
                {lesson.stage1Learn.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold text-slate-500">Everyday Analogy</div>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {lesson.stage1Learn.analogy}
              </p>
            </div>

            {lesson.stage1Learn.safetyNote && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <div className="font-semibold">Training Safety Boundary</div>
                  <p className="mt-0.5 text-amber-900">{lesson.stage1Learn.safetyNote}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => goToStage(2)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <span>Next: Understand Vocabulary</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 2 · Understand</span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                Terminology, Components &amp; Plant Applications
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {lesson.stage2Understand.vocabulary.map((item) => (
                <div key={item.term} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="font-display text-base font-bold text-slate-900">{item.term}</h4>
                  <p className="mt-1.5 text-sm text-slate-700">{item.definition}</p>
                  <p className="mt-2.5 border-t border-slate-200 pt-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Plant Example: </span>
                    {item.application}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-sm font-bold text-slate-900">Practical Applications</h4>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                {lesson.stage2Understand.practicalApplications.map((app, i) => (
                  <li key={i}>{app}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStage(1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToStage(3)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <span>Next: See It Work</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stage === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">Stage 3 · See It Work</span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                Interactive System Behavior Explorer
              </h3>
              <p className="mt-1 text-sm text-slate-600">{lesson.stage3SeeItWork.caption}</p>
            </div>

            {/* Interactive SVG Equipment State Stage */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-medium text-slate-400">
                    Interactive Schematic Model
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      activeState.status === 'nominal'
                        ? 'text-emerald-400'
                        : activeState.status === 'warning'
                          ? 'text-yellow-400'
                          : 'text-rose-400'
                    }`}
                  >
                    {activeState.status.toUpperCase()} · {activeState.reading}
                  </span>
                </div>

                {/* Clean Vector Schematic Reacting to Selected State */}
                <svg
                  viewBox="0 0 460 190"
                  className="mt-4 w-full"
                  role="img"
                  aria-label={`Interactive system schematic showing ${activeState.label}`}
                >
                  <line x1="25" y1="30" x2="25" y2="165" stroke="#475569" strokeWidth="4" />
                  <line x1="435" y1="30" x2="435" y2="165" stroke="#475569" strokeWidth="4" />
                  <text x="16" y="20" fill="#94a3b8" fontSize="12" fontFamily="monospace">L1 / IN</text>
                  <text x="405" y="20" fill="#94a3b8" fontSize="12" fontFamily="monospace">L2 / RET</text>

                  {/* Base Flow Line */}
                  <line
                    x1="25"
                    y1="95"
                    x2="435"
                    y2="95"
                    stroke={
                      activeState.status === 'nominal'
                        ? '#065f46'
                        : activeState.status === 'warning'
                          ? '#854d0e'
                          : '#7f1d1d'
                    }
                    strokeWidth="4"
                  />
                  {/* Moving Flow Overlay */}
                  <line
                    x1="25"
                    y1="95"
                    x2={activeState.status === 'fault' ? '195' : '435'}
                    y2="95"
                    stroke={
                      activeState.status === 'nominal'
                        ? '#10b981'
                        : activeState.status === 'warning'
                          ? '#facc15'
                          : '#ef4444'
                    }
                    strokeWidth="4"
                    className={
                      activeState.status === 'nominal'
                        ? 'animate-flow-fast'
                        : activeState.status === 'warning'
                          ? 'animate-flow-slow'
                          : ''
                    }
                    strokeDasharray={activeState.status === 'fault' ? '6 6' : undefined}
                  />

                  {/* Source / Isolation Block */}
                  <rect x="70" y="65" width="90" height="60" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <text x="115" y="91" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                    CONTROL / ISOLATION
                  </text>
                  <text x="115" y="109" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                    {activeState.status === 'fault' ? 'OPEN / FAULT' : 'ACTIVE'}
                  </text>

                  {/* Middle Interlock / Valve / Sensor */}
                  <rect
                    x="195"
                    y="65"
                    width="90"
                    height="60"
                    rx="8"
                    fill="#1e293b"
                    stroke={
                      activeState.status === 'nominal'
                        ? '#10b981'
                        : activeState.status === 'warning'
                          ? '#facc15'
                          : '#ef4444'
                    }
                    strokeWidth="2.5"
                  />
                  <text x="240" y="91" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                    LOAD / VALVE
                  </text>
                  <text x="240" y="109" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                    {activeState.status === 'nominal' ? 'ENERGIZED' : activeState.status === 'warning' ? 'LOADED' : 'INTERRUPTED'}
                  </text>

                  {/* Output Indicator */}
                  {activeState.status === 'nominal' && (
                    <circle
                      cx="365"
                      cy="95"
                      r="31"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      opacity="0.45"
                      className="animate-pulse"
                    />
                  )}
                  <circle
                    cx="365"
                    cy="95"
                    r="26"
                    fill={
                      activeState.status === 'nominal'
                        ? '#065f46'
                        : activeState.status === 'warning'
                          ? '#854d0e'
                          : '#7f1d1d'
                    }
                    stroke={
                      activeState.status === 'nominal'
                        ? '#34d399'
                        : activeState.status === 'warning'
                          ? '#facc15'
                          : '#f87171'
                    }
                    strokeWidth="3"
                  />
                  <text x="365" y="99" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                    {activeState.status === 'nominal' ? 'OK' : activeState.status === 'warning' ? 'WARN' : 'TRIP'}
                  </text>
                </svg>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {activeState.description}
                </p>
              </div>

              <div className="space-y-3 lg:col-span-5">
                <div className="text-xs font-semibold text-slate-500">
                  Select Operating Condition to Observe
                </div>
                {lesson.stage3SeeItWork.interactiveStates.map((st, idx) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => {
                      soundFx.click(soundOn);
                      setSeeItIdx(idx);
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      seeItIdx === idx
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-sm font-bold">{st.label}</div>
                    <div
                      className={`mt-1 font-mono text-xs tabular-nums ${
                        seeItIdx === idx ? 'text-yellow-400' : 'text-slate-600'
                      }`}
                    >
                      {st.reading}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStage(2)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToStage(4)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <span>Next: Hands-On Practice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {stage === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">
                Stage 4 · Practice Exercise (+50 XP on first completion)
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                {lesson.stage4Practice.prompt}
              </h3>
            </div>

            {lesson.stage4Practice.mode === 'sequence' ? (
              <div className="space-y-2.5">
                {sequenceOrder.map((id, idx) => {
                  const item = lesson.stage4Practice.items.find((x) => x.id === id);
                  if (!item) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          Position {idx + 1}: {item.label}
                        </div>
                        <div className="text-xs text-slate-600">{item.detail}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label={`Move ${item.label} up`}
                          disabled={idx === 0}
                          onClick={() => moveSequenceItem(idx, -1)}
                          className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 disabled:opacity-40"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${item.label} down`}
                          disabled={idx === sequenceOrder.length - 1}
                          onClick={() => moveSequenceItem(idx, 1)}
                          className="rounded-md border border-slate-300 bg-white p-2 text-slate-700 disabled:opacity-40"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                {lesson.stage4Practice.items.map((item) => {
                  const selected = selectedSet.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePracticeSelection(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                        selected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className={`text-xs ${selected ? 'text-slate-300' : 'text-slate-600'}`}>
                          {item.detail}
                        </div>
                      </div>
                      <span className="text-xs font-semibold">
                        {selected ? 'Selected' : 'Select'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {practiceStatus === 'pass' && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
                {lesson.stage4Practice.feedbackPass}
              </div>
            )}
            {practiceStatus === 'retry' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950">
                {lesson.stage4Practice.feedbackRetry}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => goToStage(3)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={checkStage4Practice}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-300"
                >
                  <span>Check Exercise</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStage(5)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <span>Next: Knowledge Check</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 5 && (
          <form onSubmit={handleSubmitQuiz} className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">
                Stage 5 · Knowledge Check (Pass at 70%+ for +30 XP)
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                Verify Your Technical Understanding
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Correct answers and explanations appear after submission. Educational assessment only.
              </p>
            </div>

            <div className="space-y-5">
              {shuffledQuestions.map((q, qIdx) => {
                const chosen = quizAnswers[q.id];
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="text-xs font-semibold text-slate-500">
                      Question {qIdx + 1} · {q.topicTag}
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-900">{q.prompt}</p>
                    {q.diagramHint && (
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-yellow-300">
                        {q.diagramHint}
                      </pre>
                    )}

                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const selected = chosen === optIdx;
                        let style = 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100';
                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                          } else if (selected && optIdx !== q.correctIndex) {
                            style = 'border-rose-400 bg-rose-50 text-rose-950';
                          }
                        } else if (selected) {
                          style = 'border-slate-900 bg-slate-900 text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() => {
                              soundFx.click(soundOn);
                              setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                            }}
                            className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${style}`}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`mt-3 rounded-lg p-3 text-xs ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        <div className="font-bold">
                          {isCorrect ? 'Correct:' : 'Review Needed:'}
                        </div>
                        <p className="mt-0.5">{q.explanation}</p>
                        {!isCorrect && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMentor(
                                `I missed this question in "${lesson.title}": "${q.prompt}". Can you explain why "${q.options[q.correctIndex]}" is right?`
                              )
                            }
                            className="mt-2 inline-flex items-center gap-1 font-semibold underline"
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                            <span>Ask Path Mentor why</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => goToStage(4)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {!quizSubmitted ? (
                  <button
                    type="submit"
                    disabled={Object.keys(quizAnswers).length < shuffledQuestions.length}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-yellow-300 disabled:opacity-50"
                  >
                    <span>Submit Answers</span>
                  </button>
                ) : (
                  <>
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      Score: {quizScorePct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => goToStage(6)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <span>Next: Demonstrate Understanding</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        )}

        {stage === 6 && (
          <form onSubmit={handleFinalizeLesson} className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">
                Stage 6 · Demonstrate Understanding (+20 XP Lesson Completion)
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                Explain the Solution &amp; Document Key Takeaways
              </h3>
              <p className="mt-2 text-sm text-slate-700">{lesson.stage6Demonstrate.prompt}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold text-slate-700">Self-Check Criteria</div>
              <div className="mt-2 space-y-2">
                {lesson.stage6Demonstrate.checklistCriteria.map((crit, idx) => (
                  <label key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(checkedCriteria[idx])}
                      onChange={(e) =>
                        setCheckedCriteria((prev) => ({ ...prev, [idx]: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>{crit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Your Technician Explanation / Report
              </label>
              <textarea
                required
                rows={4}
                value={demonstrateText}
                onChange={(e) => setDemonstrateText(e.target.value)}
                placeholder="Write a clear, practical explanation in your own words..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => goToStage(5)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <span>Complete Lesson &amp; Save Progress</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {stage === 7 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Award className="h-4 w-4" />
                <span>Stage 7 · Lesson Complete &amp; Saved</span>
              </div>
              <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                {lesson.title}
              </h3>
              <p className="mt-1 text-sm text-slate-700">
                Progress saved to your learning log and Skills Passport.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
                  <div className="text-xs text-slate-500">Quiz Score</div>
                  <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {quizSubmitted ? quizScorePct : progressRec?.quizBestScore || 100}%
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
                  <div className="text-xs text-slate-500">XP Awarded</div>
                  <div className="mt-1 font-mono text-xl font-bold text-emerald-700 tabular-nums">
                    +{completionResult?.xpEarnedNow ?? 0} XP
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
                  <div className="text-xs text-slate-500">Skill Updated</div>
                  <div className="mt-1 text-xs font-bold text-slate-900">{skill?.name}</div>
                </div>
                <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
                  <div className="text-xs text-slate-500">Badges Unlocked</div>
                  <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {achievements.filter((a) => a.earned).length}/14
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBackToTree}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Return to Skill Tree
              </button>

              {nextLesson && (
                <button
                  type="button"
                  onClick={() => onSelectLesson(nextLesson.id)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <span>Next Lesson: {nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
