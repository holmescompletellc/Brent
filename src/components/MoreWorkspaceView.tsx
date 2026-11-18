import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Download,
  FileText,
  NotebookPen,
  Settings as SettingsIcon,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import { CAREER_GOALS, SKILLS } from '../data/curriculum';
import { getLocalDateKey, useMaintenanceStore } from '../store/useMaintenanceStore';
import { CareerGoalId, DocumentItem, MoreSubTab, TaskItem } from '../types/maintenance';

interface MoreWorkspaceViewProps {
  activeSubTab: MoreSubTab;
  onChangeSubTab: (sub: MoreSubTab) => void;
}

export const MoreWorkspaceView: React.FC<MoreWorkspaceViewProps> = ({
  activeSubTab,
  onChangeSubTab,
}) => {
  const {
    state,
    updateProfile,
    addTask,
    toggleTask,
    deleteTask,
    addDocument,
    deleteDocument,
    addWeeklyReview,
    exportAllDataJson,
    importDataJson,
    resetAllData,
  } = useMaintenanceStore();

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState(getLocalDateKey());
  const [taskCategory, setTaskCategory] = useState<TaskItem['category']>('Study');

  // Document state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<DocumentItem['type']>('Training Evidence');
  const [docSkillId, setDocSkillId] = useState('');
  const [docSummary, setDocSummary] = useState('');

  // Weekly Review state
  const [weekOf, setWeekOf] = useState(getLocalDateKey());
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextFocus, setNextFocus] = useState('');
  const [hoursLogged, setHoursLogged] = useState(2.5);

  // Import/Export state
  const [importText, setImportText] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      dueDate: taskDue,
      category: taskCategory,
      completed: false,
    });
    setTaskTitle('');
  }

  function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docTitle.trim()) return;
    addDocument({
      title: docTitle.trim(),
      type: docType,
      linkedSkillId: docSkillId || undefined,
      summary: docSummary.trim() || 'Supporting maintenance documentation record.',
    });
    setDocTitle('');
    setDocSummary('');
  }

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    addWeeklyReview({
      weekOf,
      wins: wins.trim(),
      challenges: challenges.trim(),
      nextWeekFocus: nextFocus.trim(),
      hoursLogged,
    });
    setWins('');
    setChallenges('');
    setNextFocus('');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportText(reader.result);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
        {[
          { id: 'tasks' as const, label: 'Tasks & Calendar', icon: <Calendar className="h-4 w-4" /> },
          { id: 'documents' as const, label: 'Documents', icon: <FileText className="h-4 w-4" /> },
          { id: 'reviews' as const, label: 'Weekly Reviews', icon: <NotebookPen className="h-4 w-4" /> },
          { id: 'settings' as const, label: 'Settings & Data', icon: <SettingsIcon className="h-4 w-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChangeSubTab(t.id)}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeSubTab === t.id
                ? 'bg-slate-900 text-yellow-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TASKS & CALENDAR ================= */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={handleAddTask} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Schedule Study or Career Task</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Task Title</label>
              <input required type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g., Practice PLC Ladder TON simulator" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Target Date</label>
                <input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value as TaskItem['category'])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="Study">Study</option>
                  <option value="Lab Practice">Lab Practice</option>
                  <option value="Job Application">Job Application</option>
                  <option value="Certification">Certification</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Add to Schedule
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900">Tasks &amp; Study Calendar</h3>
            {state.tasks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No tasks scheduled yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {state.tasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className="flex min-w-0 items-start gap-3 text-left"
                    >
                      {task.completed ? (
                        <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                      ) : (
                        <Square className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                      )}
                      <div className="min-w-0">
                        <div className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </div>
                        <div className="font-mono text-xs text-slate-500 tabular-nums">
                          {task.dueDate} · {task.category}
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ================= DOCUMENTS VAULT ================= */}
      {activeSubTab === 'documents' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={handleAddDoc} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Add Career or Competency Document</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Document Title</label>
              <input required type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="e.g., OSHA 10 General Industry Card" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentItem['type'])} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="Resume">Resume</option>
                <option value="Certificate">Certificate</option>
                <option value="Training Evidence">Training Evidence</option>
                <option value="Study Notes">Study Notes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Linked Skill (Optional)</label>
              <select value={docSkillId} onChange={(e) => setDocSkillId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">None</option>
                {SKILLS.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Summary / Reference Details</label>
              <textarea rows={3} value={docSummary} onChange={(e) => setDocSummary(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <button type="submit" className="w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Save Document Record
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900">Saved Documents &amp; Credentials</h3>
            <div className="mt-4 space-y-3">
              {state.documents.map((doc) => (
                <div key={doc.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {doc.type} · Updated {doc.updatedAt}
                    </div>
                    <h4 className="mt-0.5 font-display text-base font-bold text-slate-900">{doc.title}</h4>
                    <p className="mt-1 text-xs text-slate-600">{doc.summary}</p>
                  </div>
                  <button type="button" onClick={() => deleteDocument(doc.id)} aria-label={`Delete ${doc.title}`} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= WEEKLY REVIEWS ================= */}
      {activeSubTab === 'reviews' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={handleAddReview} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-slate-900">Log Weekly Training Review</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Week Of</label>
                <input type="date" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Hours Logged</label>
                <input type="number" step="0.5" min="0" value={hoursLogged} onChange={(e) => setHoursLogged(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Key Technical Wins</label>
              <textarea required rows={2} value={wins} onChange={(e) => setWins(e.target.value)} placeholder="What systems or faults clicked this week?" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Challenges / Knowledge Gaps</label>
              <textarea rows={2} value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="What topics still need lab repetition?" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Next Week Priority</label>
              <input required type="text" value={nextFocus} onChange={(e) => setNextFocus(e.target.value)} placeholder="e.g., Complete Hydraulics Lab & 2 job applications" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Save Weekly Review
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900">Weekly Review Log</h3>
            {state.weeklyReviews.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No weekly reflections saved yet. Capture your first weekly training reflection on the left.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {state.weeklyReviews.map((wr) => (
                  <div key={wr.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Week of {wr.weekOf}</span>
                      <span className="font-mono tabular-nums">{wr.hoursLogged} hrs</span>
                    </div>
                    <p className="text-xs text-slate-700"><span className="font-semibold">Wins:</span> {wr.wins}</p>
                    {wr.challenges && <p className="text-xs text-slate-700"><span className="font-semibold">Gaps:</span> {wr.challenges}</p>}
                    <p className="text-xs text-emerald-800"><span className="font-semibold">Next Focus:</span> {wr.nextWeekFocus}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SETTINGS & DATA IMPORT/EXPORT ================= */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Learner Profile &amp; Preferences</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Technician Name</label>
              <input
                type="text"
                value={state.profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Target Career Goal</label>
              <select
                value={state.profile.careerGoalId}
                onChange={(e) => updateProfile({ careerGoalId: e.target.value as CareerGoalId })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {CAREER_GOALS.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Weekly Study Minutes Target</label>
              <input
                type="number"
                min={30}
                max={1200}
                step={15}
                value={state.profile.learningGoal.weeklyMinutesTarget}
                onChange={(e) =>
                  updateProfile({
                    learningGoal: {
                      ...state.profile.learningGoal,
                      weeklyMinutesTarget: Number(e.target.value) || 120,
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={state.profile.soundEnabled}
                  onChange={(e) => updateProfile({ soundEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Enable Web Audio simulator &amp; milestone feedback sounds</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={state.profile.reducedMotion}
                  onChange={(e) => updateProfile({ reducedMotion: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Prefer reduced motion animations</span>
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">Base44 Record Import &amp; Full Backup</h2>
            <p className="text-xs text-slate-600">
              Export all Maintenance Path records as JSON or import previously exported Base44/Maintenance Path JSON snapshots.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([exportAllDataJson()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `maintenance-path-backup-${getLocalDateKey()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Full Backup</span>
              </button>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" />
                <span>Load JSON File</span>
                <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div>
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste Maintenance Path / Base44 JSON export here to restore records..."
                className="w-full rounded-lg border border-slate-300 p-2.5 font-mono text-xs"
              />
              <button
                type="button"
                disabled={!importText.trim()}
                onClick={() => {
                  const res = importDataJson(importText);
                  setImportFeedback(res);
                  if (res.ok) setImportText('');
                }}
                className="mt-2 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-50"
              >
                Import &amp; Merge Records
              </button>
              {importFeedback && (
                <p className={`mt-2 text-xs font-medium ${importFeedback.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {importFeedback.message}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs font-semibold text-rose-700 hover:underline"
                >
                  Reset Local Training Records
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-rose-800">Confirm reset all local data?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetAllData();
                      setConfirmReset(false);
                    }}
                    className="rounded bg-rose-700 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Yes, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
