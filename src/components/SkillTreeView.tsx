import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { COURSES, LESSONS, SKILLS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { CompetencyStatus, SimulatorId } from '../types/maintenance';
import { soundFx } from '../utils/sound';

interface SkillTreeViewProps {
  onOpenLesson: (lessonId: string) => void;
  onOpenSimulator: (simId: SimulatorId) => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  onOpenLesson,
  onOpenSimulator,
}) => {
  const { state, currentLevel, submitCompetencyEvidence } = useMaintenanceStore();
  const [tierFilter, setTierFilter] = useState<'All' | 'Foundations' | 'Core Systems' | 'Advanced Mastery'>('All');
  const [fastTrackSkillId, setFastTrackSkillId] = useState<string | null>(null);
  const [evidenceStatus, setEvidenceStatus] = useState<CompetencyStatus>('Self-Reported Practical Experience');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('');

  const soundOn = state.profile.soundEnabled;

  const filteredCourses = COURSES.filter(
    (c) => tierFilter === 'All' || c.tier === tierFilter
  );

  function getLessonNodeStatus(lessonId: string, courseRequiredLevel: number, prereqIds: string[]) {
    const rec = state.lessonProgress[lessonId];
    if (rec?.completed) return 'Completed';
    if (rec && !rec.completed) return 'In Progress';

    const levelMet = currentLevel.level >= courseRequiredLevel;
    const prereqsMet = prereqIds.every((pid) => state.lessonProgress[pid]?.completed);
    // Allow experienced technicians with logged competency evidence to unlock directly
    const lessonObj = LESSONS.find((l) => l.id === lessonId);
    const hasPriorCompetency = lessonObj && state.competencyEvidence[lessonObj.skillId] !== undefined;

    if ((levelMet && prereqsMet) || hasPriorCompetency) return 'Available';
    return 'Locked';
  }

  function handleSaveFastTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!fastTrackSkillId) return;
    soundFx.success(soundOn);
    submitCompetencyEvidence(
      fastTrackSkillId,
      evidenceStatus,
      evidenceNotes.trim() || 'Prior industrial maintenance experience documented.',
      evidenceTitle.trim() || undefined,
      reviewerName.trim() || undefined
    );
    setFastTrackSkillId(null);
    setEvidenceTitle('');
    setEvidenceNotes('');
    setReviewerName('');
  }

  const activeFastTrackSkill = SKILLS.find((s) => s.id === fastTrackSkillId);

  return (
    <div className="space-y-6">
      {/* Header + Tier Filter + Prior Experience Button */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Industrial Maintenance Skill Tree
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Progress through 8 connected craft pathways from Safety &amp; Mechanical Foundations to Controls &amp; Reliability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(['All', 'Foundations', 'Core Systems', 'Advanced Mastery'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  tierFilter === tier
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.click(soundOn);
              setFastTrackSkillId(SKILLS[0].id);
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Record Prior Experience</span>
          </button>
        </div>
      </div>

      {/* Connected Pathway Cards */}
      <div className="space-y-5">
        {filteredCourses.map((course) => {
          const courseLessons = LESSONS.filter((l) => l.courseId === course.id).sort(
            (a, b) => a.order - b.order
          );
          const completedInCourse = courseLessons.filter(
            (l) => state.lessonProgress[l.id]?.completed
          ).length;
          const levelLocked = currentLevel.level < course.requiredLevel;

          return (
            <section
              key={course.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      Path {course.pathNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{course.tier}</span>
                    <span aria-hidden="true">·</span>
                    <span>Requires Level {course.requiredLevel}+</span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{course.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {completedInCourse}/{courseLessons.length}
                    </div>
                    <div className="text-xs text-slate-500">Lessons done</div>
                  </div>
                  {course.linkedSimulatorId && (
                    <button
                      type="button"
                      onClick={() => onOpenSimulator(course.linkedSimulatorId!)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      <span>Open Lab</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Connected Learning Nodes */}
              <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-stretch">
                {courseLessons.map((lesson, idx) => {
                  const status = getLessonNodeStatus(
                    lesson.id,
                    course.requiredLevel,
                    lesson.prerequisiteLessonIds
                  );
                  const skill = SKILLS.find((s) => s.id === lesson.skillId);
                  const evidence = state.competencyEvidence[lesson.skillId];

                  return (
                    <React.Fragment key={lesson.id}>
                      <div
                        className={`flex flex-1 flex-col justify-between rounded-xl border p-4 transition-colors ${
                          status === 'Completed'
                            ? 'border-emerald-300 bg-emerald-50/60'
                            : status === 'In Progress'
                              ? 'border-yellow-400 bg-yellow-50/50'
                              : status === 'Available'
                                ? 'border-slate-300 bg-white hover:border-slate-400'
                                : 'border-slate-200 bg-slate-50 opacity-80'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              {status === 'Completed' && (
                                <>
                                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                  <span className="text-emerald-800">Completed</span>
                                </>
                              )}
                              {status === 'In Progress' && (
                                <>
                                  <CircleDot className="h-4 w-4 text-amber-600" />
                                  <span className="text-amber-900">
                                    In Progress · Stage {state.lessonProgress[lesson.id]?.currentStage}/7
                                  </span>
                                </>
                              )}
                              {status === 'Available' && (
                                <>
                                  <Sparkles className="h-4 w-4 text-slate-700" />
                                  <span className="text-slate-700">Available</span>
                                </>
                              )}
                              {status === 'Locked' && (
                                <>
                                  <Lock className="h-4 w-4 text-slate-400" />
                                  <span className="text-slate-500">
                                    {levelLocked
                                      ? `Locked (Level ${course.requiredLevel})`
                                      : 'Complete prerequisite'}
                                  </span>
                                </>
                              )}
                            </span>
                            <span className="font-mono text-xs text-slate-500 tabular-nums">
                              {lesson.durationMinutes}m
                            </span>
                          </div>

                          <h4 className="mt-2 font-display text-base font-bold text-slate-900">
                            {lesson.title}
                          </h4>
                          <p className="mt-1 text-xs text-slate-600">
                            Skill: {skill?.name}
                          </p>
                          {evidence && (
                            <p className="mt-1.5 text-xs font-medium text-emerald-800">
                              Passport: {evidence.status}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2">
                          <button
                            type="button"
                            disabled={status === 'Locked'}
                            onClick={() => {
                              soundFx.click(soundOn);
                              onOpenLesson(lesson.id);
                            }}
                            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                              status === 'Locked'
                                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                                : status === 'Completed'
                                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                  : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>
                              {status === 'Completed'
                                ? 'Review Lesson'
                                : status === 'In Progress'
                                  ? 'Resume'
                                  : 'Start Lesson'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              soundFx.click(soundOn);
                              setFastTrackSkillId(lesson.skillId);
                            }}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline whitespace-nowrap shrink-0"
                          >
                            Log Prior Experience
                          </button>
                        </div>
                      </div>

                      {idx < courseLessons.length - 1 && (
                        <div className="hidden items-center justify-center md:flex">
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Prior Experience / Competency Fast-Track Modal */}
      {fastTrackSkillId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fast-track-title"
        >
          <form
            onSubmit={handleSaveFastTrack}
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <h3 id="fast-track-title" className="font-display text-lg font-bold text-slate-900">
              Record Prior Experience &amp; Competency Evidence
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Experienced technicians can document field experience or submit verification notes for review without repeating basic lessons.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Skill / Competency
                </label>
                <select
                  value={fastTrackSkillId}
                  onChange={(e) => setFastTrackSkillId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {SKILLS.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.category} — {sk.name}
                    </option>
                  ))}
                </select>
                {activeFastTrackSkill && (
                  <p className="mt-1 text-xs text-slate-500">{activeFastTrackSkill.description}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Competency Tier
                </label>
                <select
                  value={evidenceStatus}
                  onChange={(e) => setEvidenceStatus(e.target.value as CompetencyStatus)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="Self-Reported Practical Experience">Self-Reported Practical Experience</option>
                  <option value="Evidence Submitted">Evidence Submitted (Pending Review)</option>
                  <option value="Verified by Authorized Reviewer">Verified by Authorized Reviewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Evidence Document / Reference Title
                </label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g., Plant 2 Motor Control Sign-Off Log"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              {evidenceStatus === 'Verified by Authorized Reviewer' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Authorized Supervisor / Instructor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g., M. Vance, Lead Controls Engineer"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Practical Experience Summary
                </label>
                <textarea
                  rows={3}
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="Describe equipment serviced, meters/tools used, and hours of field experience..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFastTrackSkillId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save to Skills Passport
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
