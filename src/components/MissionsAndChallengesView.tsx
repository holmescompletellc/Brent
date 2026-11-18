import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { TROUBLESHOOTING_MISSIONS } from '../data/missions';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { DailyChallenge, MissionAttempt, SimulatorId } from '../types/maintenance';
import { soundFx } from '../utils/sound';

interface MissionsAndChallengesViewProps {
  mode: 'missions' | 'challenges';
  onOpenSimulator: (simId: SimulatorId) => void;
  onOpenMentor: (prompt: string) => void;
}

export const MissionsAndChallengesView: React.FC<MissionsAndChallengesViewProps> = ({
  mode,
  onOpenSimulator,
  onOpenMentor,
}) => {
  const {
    state,
    dailyChallenges,
    recordMissionAttempt,
    recordChallengeCompletion,
  } = useMaintenanceStore();
  const soundOn = state.profile.soundEnabled;

  // Mission engine state
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string>('step-1');
  const [observations, setObservations] = useState<string[]>([]);
  const [safetyPts, setSafetyPts] = useState(0);
  const [reasoningPts, setReasoningPts] = useState(0);
  const [efficiencyPts, setEfficiencyPts] = useState(0);
  const [inWrapup, setInWrapup] = useState(false);
  const [selectedFaultId, setSelectedFaultId] = useState('');
  const [selectedCorrectiveId, setSelectedCorrectiveId] = useState('');
  const [reportText, setReportText] = useState('');
  const [submittedMission, setSubmittedMission] = useState<{
    attempt: Omit<MissionAttempt, 'id' | 'completedAt'>;
    xpAwarded: number;
  } | null>(null);

  // Daily challenge quick-quiz state
  const [activeChallenge, setActiveChallenge] = useState<DailyChallenge | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, number>>({});
  const [challengeResult, setChallengeResult] = useState<{ score: number; xp: number } | null>(null);

  const activeMission = TROUBLESHOOTING_MISSIONS.find((m) => m.id === activeMissionId) || null;

  function launchMission(missionId: string) {
    const m = TROUBLESHOOTING_MISSIONS.find((x) => x.id === missionId);
    if (!m) return;
    soundFx.click(soundOn);
    setActiveMissionId(m.id);
    setStepId(m.startStepId);
    setObservations([]);
    setSafetyPts(0);
    setReasoningPts(0);
    setEfficiencyPts(0);
    setInWrapup(false);
    setSelectedFaultId('');
    setSelectedCorrectiveId('');
    setReportText('');
    setSubmittedMission(null);
  }

  function handleMissionChoice(optionId: string) {
    if (!activeMission) return;
    const step = activeMission.steps[stepId];
    const opt = step?.options.find((o) => o.id === optionId);
    if (!opt) return;

    if (opt.isOptimal) soundFx.success(soundOn);
    else soundFx.fault(soundOn);

    setObservations((prev) => [...prev, `${step.stageTitle}: ${opt.observation}`]);
    setSafetyPts((p) => p + opt.safetyDelta);
    setReasoningPts((p) => p + opt.reasoningDelta);
    setEfficiencyPts((p) => p + opt.efficiencyDelta);

    if (opt.nextStepId === 'COMPLETE') {
      setInWrapup(true);
    } else {
      setStepId(opt.nextStepId);
    }
  }

  function handleFinalizeMission(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMission) return;

    const faultOk = activeMission.faultChoices.find((f) => f.id === selectedFaultId)?.isCorrect ? 100 : 25;
    const corrOk = activeMission.correctiveChoices.find((c) => c.id === selectedCorrectiveId)?.isCorrect ? 100 : 25;
    const docScore = reportText.trim().length >= 35 ? 100 : 60;

    const safeScore = Math.min(100, safetyPts);
    const reasonScore = Math.min(100, reasoningPts);
    const effScore = Math.min(100, efficiencyPts);
    const totalScore = Math.round(
      (safeScore + reasonScore + faultOk + effScore + docScore + corrOk) / 6
    );

    const payload: Omit<MissionAttempt, 'id' | 'completedAt'> = {
      missionId: activeMission.id,
      missionTitle: activeMission.title,
      difficulty: activeMission.difficulty,
      safetyScore: safeScore,
      reasoningScore: reasonScore,
      faultIdScore: faultOk,
      efficiencyScore: effScore,
      documentationScore: docScore,
      rootCauseScore: corrOk,
      totalScore,
      reportText: reportText.trim(),
    };

    const res = recordMissionAttempt(payload);
    soundFx.complete(soundOn);
    setSubmittedMission({ attempt: payload, xpAwarded: res.xpAwarded });
  }

  function submitDailyQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!activeChallenge?.questions) return;
    let right = 0;
    for (const q of activeChallenge.questions) {
      if (challengeAnswers[q.id] === q.correctIndex) right += 1;
    }
    const pct = Math.round((right / activeChallenge.questions.length) * 100);
    const res = recordChallengeCompletion(activeChallenge, pct);
    if (pct >= 70) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    setChallengeResult({ score: pct, xp: res.xpAwarded });
  }

  if (mode === 'challenges') {
    const todayStr = new Date().toISOString().slice(0, 10);

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Daily &amp; Weekly Training Challenges
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Rotating missions aligned to your curriculum. Dated logs ensure practice across distinct calendar days counts toward streaks and personal bests.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {dailyChallenges.map((ch) => {
            const doneToday = state.challengeCompletions.some(
              (c) => c.challengeId === ch.id && c.dateKey === todayStr
            );
            const best = state.challengeCompletions
              .filter((c) => c.challengeId === ch.id)
              .reduce((max, c) => Math.max(max, c.scorePercent), 0);

            return (
              <div
                key={ch.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">
                      {ch.kind === 'weekly' ? 'Weekly Challenge' : 'Daily Challenge'} · {ch.category}
                    </span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      +{ch.xpReward} XP
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-slate-900">{ch.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{ch.description}</p>
                  {best > 0 && (
                    <p className="mt-2 font-mono text-xs text-slate-500 tabular-nums">
                      Personal Best: {best}% {doneToday ? '· Completed today' : ''}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.click(soundOn);
                    if (ch.questions && ch.questions.length > 0) {
                      setActiveChallenge(ch);
                      setChallengeAnswers({});
                      setChallengeResult(null);
                    } else if (ch.actionTarget.simulatorId) {
                      onOpenSimulator(ch.actionTarget.simulatorId);
                    } else {
                      launchMission('mission-conveyor-wont-start');
                    }
                  }}
                  className="mt-4 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Target className="h-4 w-4 text-yellow-400" />
                  <span>{doneToday ? 'Replay Challenge' : 'Start Challenge'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Daily Quiz Challenge */}
        {activeChallenge && activeChallenge.questions && (
          <form onSubmit={submitDailyQuiz} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">{activeChallenge.title}</h3>
              <button type="button" onClick={() => setActiveChallenge(null)} className="text-xs font-semibold text-slate-600 hover:underline">Close</button>
            </div>

            {activeChallenge.questions.map((q, idx) => {
              const picked = challengeAnswers[q.id];
              return (
                <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500">Question {idx + 1}</div>
                  <p className="mt-1 text-sm font-bold text-slate-900">{q.prompt}</p>
                  <div className="mt-2.5 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      let cls = 'border-slate-200 bg-white text-slate-800';
                      if (challengeResult) {
                        if (optIdx === q.correctIndex) cls = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                        else if (picked === optIdx) cls = 'border-rose-400 bg-rose-50 text-rose-950';
                      } else if (picked === optIdx) {
                        cls = 'border-slate-900 bg-slate-900 text-white';
                      }
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={Boolean(challengeResult)}
                          onClick={() => setChallengeAnswers((p) => ({ ...p, [q.id]: optIdx }))}
                          className={`w-full rounded-lg border px-3.5 py-2 text-left text-sm ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {challengeResult && (
                    <p className="mt-2 text-xs text-slate-700">{q.explanation}</p>
                  )}
                </div>
              );
            })}

            {!challengeResult ? (
              <button type="submit" className="rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-yellow-300">
                Submit Challenge
              </button>
            ) : (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
                Challenge Score: {challengeResult.score}% · +{challengeResult.xp} XP credited!
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!activeMission ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Troubleshooting Mission Library
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Diagnose realistic equipment breakdowns with branching safety checks, simulated readings, root-cause identification, and CMMS reporting (+100 XP per mission).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {TROUBLESHOOTING_MISSIONS.map((m) => {
              const attempts = state.missionAttempts.filter((a) => a.missionId === m.id);
              const bestScore = attempts.reduce((max, a) => Math.max(max, a.totalScore), 0);

              return (
                <div
                  key={m.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{m.difficulty} · {m.category}</span>
                      <span className="font-mono tabular-nums">
                        {bestScore > 0 ? `Best: ${bestScore}%` : '+100 XP'}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold text-slate-900">{m.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{m.equipment}</p>
                    <p className="mt-2.5 text-sm text-slate-700">{m.complaint}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => launchMission(m.id)}
                    className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <span>Start Mission</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <button
                type="button"
                onClick={() => setActiveMissionId(null)}
                className="text-xs font-semibold text-slate-600 hover:underline"
              >
                &larr; Back to Mission Library
              </button>
              <h2 className="mt-1 font-display text-xl font-bold text-slate-900">
                {activeMission.title}
              </h2>
              <p className="text-xs text-slate-500">
                {activeMission.difficulty} · {activeMission.equipment}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onOpenMentor(
                  `I am troubleshooting "${activeMission.title}". Complaint: ${activeMission.complaint}. Give me a diagnostic hint without revealing the final fault.`
                )
              }
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Bot className="h-4 w-4 text-emerald-700" />
              <span>Ask Path Mentor</span>
            </button>
          </div>

          {/* Safety Brief */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <span className="font-bold">Safety Brief: </span>
              {activeMission.safetyBrief}
            </div>
          </div>

          {/* Observations Log */}
          {observations.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
              <div className="text-xs font-bold text-slate-700">Field Observations Log</div>
              {observations.map((obs, i) => (
                <p key={i} className="text-xs text-slate-700">
                  • {obs}
                </p>
              ))}
            </div>
          )}

          {!inWrapup ? (
            (() => {
              const step = activeMission.steps[stepId];
              if (!step) return null;
              return (
                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">{step.stageTitle}</div>
                    <h3 className="mt-1 font-display text-lg font-bold text-slate-900">{step.prompt}</h3>
                  </div>

                  {step.readings && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {step.readings.map((r) => (
                        <div key={r.label} className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-white">
                          <div className="text-[11px] text-slate-400">{r.label}</div>
                          <div
                            className={`mt-1 font-mono text-xs font-bold tabular-nums ${
                              r.status === 'nominal'
                                ? 'text-emerald-400'
                                : r.status === 'warning'
                                  ? 'text-yellow-400'
                                  : 'text-rose-400'
                            }`}
                          >
                            {r.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeMission.difficulty === 'Beginner' && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Coach Hint: </span>
                      {step.hint}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {step.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleMissionChoice(opt.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-4 text-left text-sm font-medium text-slate-900 transition-colors hover:border-slate-900 hover:bg-slate-50"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : !submittedMission ? (
            <form onSubmit={handleFinalizeMission} className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Final Diagnosis, Corrective Action &amp; Maintenance Report
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  1. Identify Most Likely Failed Component / Root Cause
                </label>
                <div className="mt-2 space-y-2">
                  {activeMission.faultChoices.map((fc) => (
                    <label
                      key={fc.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm ${
                        selectedFaultId === fc.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="faultChoice"
                        required
                        checked={selectedFaultId === fc.id}
                        onChange={() => setSelectedFaultId(fc.id)}
                        className="mt-1"
                      />
                      <span>{fc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  2. Recommend Corrective Action
                </label>
                <div className="mt-2 space-y-2">
                  {activeMission.correctiveChoices.map((cc) => (
                    <label
                      key={cc.id}
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm ${
                        selectedCorrectiveId === cc.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctiveChoice"
                        required
                        checked={selectedCorrectiveId === cc.id}
                        onChange={() => setSelectedCorrectiveId(cc.id)}
                        className="mt-1"
                      />
                      <span>{cc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  3. Write Short Maintenance Report (As-Found, Action Taken, Root Cause, As-Left)
                </label>
                <textarea
                  required
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Write a clear CMMS-ready closeout report..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <ClipboardCheck className="h-4 w-4" />
                <span>Submit Troubleshooting Report</span>
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mission Complete · +{submittedMission.xpAwarded} XP</span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                    Overall Score: {submittedMission.attempt.totalScore}%
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMissionId(null)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Back to Mission Library
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['Safety Decisions', submittedMission.attempt.safetyScore],
                  ['Diagnostic Reasoning', submittedMission.attempt.reasoningScore],
                  ['Fault Identification', submittedMission.attempt.faultIdScore],
                  ['Efficiency', submittedMission.attempt.efficiencyScore],
                  ['Documentation', submittedMission.attempt.documentationScore],
                  ['Root Cause', submittedMission.attempt.rootCauseScore],
                ].map(([label, score]) => (
                  <div key={String(label)} className="rounded-lg border border-emerald-200 bg-white p-3">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                      {score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mission History */}
      {state.missionAttempts.length > 0 && !activeMission && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-slate-900">Mission History</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-4">Mission</th>
                  <th className="py-2 pr-4">Difficulty</th>
                  <th className="py-2 pr-4 text-right">Safety</th>
                  <th className="py-2 pr-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.missionAttempts.slice(0, 8).map((ma) => (
                  <tr key={ma.id}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{ma.missionTitle}</td>
                    <td className="py-2 pr-4 text-slate-600">{ma.difficulty}</td>
                    <td className="py-2 pr-4 text-right font-mono tabular-nums">{ma.safetyScore}%</td>
                    <td className="py-2 pr-4 text-right font-mono font-bold tabular-nums">{ma.totalScore}%</td>
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
