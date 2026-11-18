import React, { useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Download,
  Lock,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import { COURSES, LESSONS, SKILLS, TECHNICIAN_LEVELS } from '../data/curriculum';
import { addDaysToDateKey, getLocalDateKey, useMaintenanceStore } from '../store/useMaintenanceStore';
import { CompetencyStatus, ProgressSubTab } from '../types/maintenance';

interface ProgressAndPassportViewProps {
  activeSubTab: ProgressSubTab;
  onChangeSubTab: (sub: ProgressSubTab) => void;
}

const STATUS_BADGE_TEXT: Record<CompetencyStatus, string> = {
  Learning: 'text-slate-700 bg-slate-100',
  'Practiced in Simulation': 'text-sky-800 bg-sky-50',
  'Self-Reported Practical Experience': 'text-amber-900 bg-amber-50',
  'Evidence Submitted': 'text-indigo-900 bg-indigo-50',
  'Verified by Authorized Reviewer': 'text-emerald-900 bg-emerald-50',
};

export const ProgressAndPassportView: React.FC<ProgressAndPassportViewProps> = ({
  activeSubTab,
  onChangeSubTab,
}) => {
  const {
    state,
    totalXp,
    currentLevel,
    totalStudyHours,
    completedLessonsCount,
    averageQuizScore,
    achievements,
    weakSkills,
    submitCompetencyEvidence,
    exportAllDataJson,
  } = useMaintenanceStore();

  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<CompetencyStatus>('Self-Reported Practical Experience');
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newReviewer, setNewReviewer] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const today = getLocalDateKey();
  const last7Days = useMemo(() => {
    const days: { dateKey: string; label: string; minutes: number; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dk = addDaysToDateKey(today, -i);
      const dayActs = state.learningActivities.filter((a) => a.dateKey === dk);
      days.push({
        dateKey: dk,
        label: dk.slice(5),
        minutes: dayActs.reduce((s, a) => s + a.minutesSpent, 0),
        xp: dayActs.reduce((s, a) => s + a.xpEarned, 0),
      });
    }
    return days;
  }, [state.learningActivities, today]);

  const maxDayMin = Math.max(20, ...last7Days.map((d) => d.minutes));

  const skillsByCategory = useMemo(() => {
    const map: Record<string, { total: number; practicedOrHigher: number }> = {};
    for (const sk of SKILLS) {
      if (!map[sk.category]) map[sk.category] = { total: 0, practicedOrHigher: 0 };
      map[sk.category].total += 1;
      const ev = state.competencyEvidence[sk.id];
      if (ev && ev.status !== 'Learning') {
        map[sk.category].practicedOrHigher += 1;
      }
    }
    return Object.entries(map);
  }, [state.competencyEvidence]);

  function downloadPassportSummary() {
    const payload = {
      exportedAt: new Date().toISOString(),
      disclaimer:
        'Educational Training Summary from Maintenance Path. Simulation completions and XP do not constitute accredited occupational certification or workplace authorization.',
      learner: state.profile,
      academyLevel: `Level ${currentLevel.level} - ${currentLevel.title}`,
      totalXp,
      completedLessons: completedLessonsCount,
      totalStudyHours,
      competencyPassport: SKILLS.map((s) => ({
        skill: s.name,
        category: s.category,
        status: state.competencyEvidence[s.id]?.status || 'Not Started',
        evidenceTitle: state.competencyEvidence[s.id]?.evidenceTitle || '',
        reviewer: state.competencyEvidence[s.id]?.reviewerName || '',
        notes: state.competencyEvidence[s.id]?.notes || '',
      })),
      externalDocuments: state.documents,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-path-skills-passport-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAnalyticsCsv() {
    const rows = [
      ['Date', 'Type', 'Title', 'Minutes', 'XP'],
      ...state.learningActivities.map((a) => [
        a.dateKey,
        a.type,
        `"${a.title.replace(/"/g, '""')}"`,
        String(a.minutesSpent),
        String(a.xpEarned),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-path-analytics-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveSkillEvidence(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSkillId) return;
    submitCompetencyEvidence(
      editingSkillId,
      newStatus,
      newNotes.trim() || 'Updated competency status.',
      newTitle.trim() || undefined,
      newReviewer.trim() || undefined
    );
    setEditingSkillId(null);
    setNewTitle('');
    setNewNotes('');
    setNewReviewer('');
  }

  const skillCategories = ['All', ...Array.from(new Set(SKILLS.map((s) => s.category)))];

  return (
    <div className="space-y-6">
      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { id: 'passport' as const, label: 'Skills Passport' },
            { id: 'analytics' as const, label: 'Learning Analytics' },
            { id: 'trophies' as const, label: 'Trophy Room & Levels' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeSubTab(t.id)}
              className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                activeSubTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={downloadPassportSummary}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Passport JSON</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: DIGITAL SKILLS PASSPORT ================= */}
      {activeSubTab === 'passport' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Digital Skills Passport
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Explicitly separates platform study and simulations from self-reported field experience, submitted evidence, and authorized reviewer sign-offs.
                </p>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {skillCategories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Credential Integrity Notice: </span>
              Maintenance Path badges and simulation scores reflect educational training milestones only—they do not issue accredited certifications or workplace electrical/mechanical authorization.
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2.5 pr-4">Skill &amp; Category</th>
                    <th className="py-2.5 pr-4">Competency Tier</th>
                    <th className="py-2.5 pr-4">Evidence / Notes</th>
                    <th className="py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SKILLS.filter((s) => categoryFilter === 'All' || s.category === categoryFilter).map((sk) => {
                    const ev = state.competencyEvidence[sk.id];
                    return (
                      <tr key={sk.id}>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-slate-900">{sk.name}</div>
                          <div className="text-xs text-slate-500">{sk.category}</div>
                        </td>
                        <td className="py-3 pr-4">
                          {ev ? (
                            <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_TEXT[ev.status]}`}>
                              {ev.status}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Not Started</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-600">
                          {ev ? (
                            <>
                              {ev.evidenceTitle && <div className="font-semibold text-slate-800">{ev.evidenceTitle}</div>}
                              <div>{ev.notes}</div>
                              {ev.reviewerName && <div className="text-emerald-700">Verified by: {ev.reviewerName}</div>}
                            </>
                          ) : (
                            <span>Complete linked lesson/sim or log field experience</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSkillId(sk.id);
                              setNewStatus(ev?.status || 'Self-Reported Practical Experience');
                              setNewTitle(ev?.evidenceTitle || '');
                              setNewNotes(ev?.notes || '');
                              setNewReviewer(ev?.reviewerName || '');
                            }}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                          >
                            Update Evidence
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LEARNING ANALYTICS ================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Learning Analytics &amp; Study History
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                All metrics below are computed directly from your saved activity ledger, quizzes, simulators, and missions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadAnalyticsCsv}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Activity CSV</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([exportAllDataJson()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `maintenance-path-full-backup-${today}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Full Backup JSON</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Total Training Hours</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{totalStudyHours}h</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Lessons Completed</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{completedLessonsCount}/{LESSONS.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Avg Quiz Score</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{averageQuizScore}%</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Simulator Attempts</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{state.simulationAttempts.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Missions Completed</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">{state.missionAttempts.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* 7-Day Activity Bar Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-slate-900">Weekly Study Minutes</h3>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-200 pb-2">
                {last7Days.map((d) => {
                  const pct = Math.round((d.minutes / maxDayMin) * 100);
                  return (
                    <div key={d.dateKey} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums">{d.minutes}m</span>
                      <div className="flex h-28 w-full items-end rounded-md bg-slate-100 p-1">
                        <div
                          className="w-full rounded bg-slate-900 transition-all"
                          style={{ height: `${Math.max(d.minutes > 0 ? 10 : 0, pct)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-600 tabular-nums">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills by Category Progress */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <h3 className="font-display text-base font-bold text-slate-900">Skills Practiced or Verified by Category</h3>
              <div className="mt-4 space-y-3">
                {skillsByCategory.map(([cat, counts]) => {
                  const pct = Math.round((counts.practicedOrHigher / counts.total) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{cat}</span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {counts.practicedOrHigher}/{counts.total} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Course Completion + Knowledge Gaps */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-base font-bold text-slate-900">Course Completion Across 8 Paths</h3>
              <div className="mt-3 space-y-2.5">
                {COURSES.map((c) => {
                  const done = c.lessonIds.filter((id) => state.lessonProgress[id]?.completed).length;
                  const pct = Math.round((done / c.lessonIds.length) * 100);
                  return (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-800">Path {c.pathNumber}: {c.title}</span>
                      <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">{done}/{c.lessonIds.length} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-display text-base font-bold text-slate-900">Identified Knowledge Gaps &amp; Activity Log</h3>
              {weakSkills.length > 0 && (
                <ul className="mt-2 space-y-1.5 text-xs text-amber-900">
                  {weakSkills.map((w) => (
                    <li key={w.skillId}>• {w.name} — {w.reason}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4 max-h-48 overflow-y-auto border-t border-slate-100 pt-3">
                {state.learningActivities.length === 0 ? (
                  <p className="text-xs text-slate-500">No dated study activities recorded yet.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {state.learningActivities.slice(0, 12).map((act) => (
                      <li key={act.id} className="flex items-center justify-between text-slate-700">
                        <span className="truncate pr-2">{act.dateKey} · {act.title}</span>
                        <span className="font-mono text-emerald-700 tabular-nums shrink-0">+{act.xpEarned} XP</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TROPHY ROOM & LEVELS ================= */}
      {activeSubTab === 'trophies' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Personal Trophy Room (14 Academy Badges)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Achievements unlock automatically from validated lesson completions, quiz scores, simulator diagnoses, troubleshooting missions, and daily streaks.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`rounded-xl border p-4 ${
                    ach.earned ? 'border-emerald-300 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{ach.category}</span>
                    {ach.earned ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Award className={`h-5 w-5 shrink-0 ${ach.earned ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <h3 className="font-display text-base font-bold text-slate-900">{ach.title}</h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{ach.description}</p>
                  <div className="mt-3 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                    {ach.earned ? 'Earned' : `Progress: ${ach.progressCurrent} / ${ach.progressTarget}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8 Technician Levels Ladder */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Technician Progression Ladder (Platform Milestones)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Titles indicate learning milestones inside Maintenance Path, not independently verified occupational credentials.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {TECHNICIAN_LEVELS.map((lvl) => {
                const reached = totalXp >= lvl.minXp;
                const isCurrent = currentLevel.level === lvl.level;
                return (
                  <div
                    key={lvl.level}
                    className={`rounded-xl border p-4 ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : reached
                          ? 'border-emerald-200 bg-emerald-50/60 text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold">
                        Level {lvl.level}: {lvl.title}
                      </span>
                      <span className={`font-mono text-xs font-bold tabular-nums ${isCurrent ? 'text-yellow-400' : ''}`}>
                        {lvl.minXp} XP
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${isCurrent ? 'text-slate-300' : 'text-slate-600'}`}>
                      {lvl.unlockNote}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Evidence Update Modal */}
      {editingSkillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true">
          <form onSubmit={saveSkillEvidence} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h3 className="font-display text-lg font-bold text-slate-900">Update Competency Evidence</h3>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Competency Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as CompetencyStatus)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="Learning">Learning</option>
                <option value="Practiced in Simulation">Practiced in Simulation</option>
                <option value="Self-Reported Practical Experience">Self-Reported Practical Experience</option>
                <option value="Evidence Submitted">Evidence Submitted</option>
                <option value="Verified by Authorized Reviewer">Verified by Authorized Reviewer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Evidence Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., OEM VFD Commissioning Checklist"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {newStatus === 'Verified by Authorized Reviewer' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700">Authorized Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={newReviewer}
                  onChange={(e) => setNewReviewer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700">Notes</label>
              <textarea
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingSkillId(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Cancel</button>
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
