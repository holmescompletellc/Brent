import React, { useState } from 'react';
import {
  Bot,
  Briefcase,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { CAREER_GOALS, LESSONS, SKILLS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { CareerGoalId, JobPosting } from '../types/maintenance';

interface JobsAndCareerViewProps {
  onOpenLesson: (lessonId: string) => void;
  onOpenMentor: (prompt: string) => void;
}

export const JobsAndCareerView: React.FC<JobsAndCareerViewProps> = ({
  onOpenLesson,
  onOpenMentor,
}) => {
  const {
    state,
    updateProfile,
    addJobPosting,
    updateJobStatus,
    deleteJobPosting,
  } = useMaintenanceStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['sk-loto', 'sk-motor-starters']);
  const [customReqInput, setCustomReqInput] = useState('');

  const activeGoal =
    CAREER_GOALS.find((g) => g.id === state.profile.careerGoalId) || CAREER_GOALS[0];

  function hasPracticalOrVerifiedEvidence(skillId: string): { met: boolean; label: string } {
    const ev = state.competencyEvidence[skillId];
    if (!ev) return { met: false, label: 'Not Started' };
    if (
      ev.status === 'Practiced in Simulation' ||
      ev.status === 'Self-Reported Practical Experience' ||
      ev.status === 'Evidence Submitted' ||
      ev.status === 'Verified by Authorized Reviewer'
    ) {
      return { met: true, label: ev.status };
    }
    return { met: false, label: ev.status };
  }

  function handleSaveJob(e: React.FormEvent) {
    e.preventDefault();
    addJobPosting({
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || 'On-site',
      status: 'Saved',
      notes: notes.trim(),
      requiredSkillIds: selectedSkills,
      customRequirements: customReqInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setTitle('');
    setCompany('');
    setLocation('');
    setNotes('');
    setCustomReqInput('');
    setShowAddForm(false);
  }

  return (
    <div className="space-y-8">
      {/* Career Goal Selector & Pathway Alignment */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Career Pathway &amp; Job Alignment
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Select your target maintenance role to map Skills Passport readiness against real industry competencies and saved job postings.
            </p>
          </div>
          <div className="min-w-[260px]">
            <label className="block text-xs font-semibold text-slate-600">Active Career Goal</label>
            <select
              value={state.profile.careerGoalId}
              onChange={(e) => updateProfile({ careerGoalId: e.target.value as CareerGoalId })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
            >
              {CAREER_GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 border-t border-slate-100 pt-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <h3 className="font-display text-lg font-bold text-slate-900">{activeGoal.title}</h3>
            <p className="text-sm text-slate-600">{activeGoal.summary}</p>

            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-700">
                Required Technical Skills vs. Your Skills Passport
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeGoal.requiredSkillIds.map((skId) => {
                  const sk = SKILLS.find((s) => s.id === skId);
                  const check = hasPracticalOrVerifiedEvidence(skId);
                  const lesson = LESSONS.find((l) => l.skillId === skId);
                  return (
                    <div
                      key={skId}
                      className={`flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs ${
                        check.met ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900">{sk?.name}</div>
                        <div className="text-[11px] text-slate-600">{check.label}</div>
                      </div>
                      {!check.met && lesson && (
                        <button
                          type="button"
                          onClick={() => onOpenLesson(lesson.id)}
                          className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white shrink-0"
                        >
                          Train
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 lg:col-span-5">
            <div>
              <div className="text-xs font-semibold text-slate-700">Recommended Academy Lessons</div>
              <ul className="mt-2 space-y-1.5">
                {activeGoal.recommendedLessonIds.map((lId) => {
                  const l = LESSONS.find((x) => x.id === lId);
                  if (!l) return null;
                  const done = state.lessonProgress[l.id]?.completed;
                  return (
                    <li key={l.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-medium text-slate-800">{l.title}</span>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(l.id)}
                        className={`font-semibold whitespace-nowrap shrink-0 ${done ? 'text-emerald-700' : 'text-slate-900 underline'}`}
                      >
                        {done ? 'Completed' : 'Open'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <div className="text-xs font-semibold text-slate-700">Industry Credentials to Research</div>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
                {activeGoal.potentialCredentials.map((cred) => (
                  <li key={cred}>• {cred}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenMentor(
                  `I am targeting the role of ${activeGoal.title}. Can you run a technical interview prep session focused on my remaining skill gaps?`
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Bot className="h-4 w-4 text-yellow-400" />
              <span>Practice Technical Interview</span>
            </button>
          </div>
        </div>
      </section>

      {/* Saved Job Postings & Application Tracker */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Saved Job Postings &amp; Application Tracker
            </h3>
            <p className="text-xs text-slate-600">
              Job qualifications are checked strictly against your Skills Passport evidence—never marked satisfied by XP alone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((s) => !s)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-yellow-300"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job Posting</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSaveJob} className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Job Title</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Maintenance Electrician" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Company</label>
                <input required type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Northwest Foods" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Map Required Skills from Posting</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {SKILLS.slice(0, 14).map((sk) => {
                  const active = selectedSkills.includes(sk.id);
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() =>
                        setSelectedSkills((prev) =>
                          prev.includes(sk.id) ? prev.filter((x) => x !== sk.id) : [...prev, sk.id]
                        )
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium ${
                        active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {sk.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Additional Requirements (comma-separated)</label>
                <input type="text" value={customReqInput} onChange={(e) => setCustomReqInput(e.target.value)} placeholder="e.g., Boiler license, Welding MIG" className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Notes</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Shift schedule, pay range, recruiter contact..." className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold">Cancel</button>
              <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Save Job</button>
            </div>
          </form>
        )}

        <div className="mt-5 space-y-4">
          {state.jobs.length === 0 ? (
            <p className="text-sm text-slate-600">No job postings saved yet. Add a target job posting to compare requirements against your Skills Passport.</p>
          ) : (
            state.jobs.map((job) => {
              const matchedSkills = job.requiredSkillIds.filter((s) => hasPracticalOrVerifiedEvidence(s).met);
              const missingSkills = job.requiredSkillIds.filter((s) => !hasPracticalOrVerifiedEvidence(s).met);

              return (
                <div key={job.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{job.company} · {job.location}</span>
                        {job.appliedDate && <span>· Applied {job.appliedDate}</span>}
                      </div>
                      <h4 className="mt-1 font-display text-lg font-bold text-slate-900">{job.title}</h4>
                      {job.notes && <p className="mt-1 text-xs text-slate-600">{job.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value as JobPosting['status'])}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offer">Offer</option>
                      </select>
                      <button
                        type="button"
                        aria-label={`Delete ${job.title}`}
                        onClick={() => deleteJobPosting(job.id)}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Passport Gap Comparison */}
                  <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Passport Skills Practiced / Evidenced ({matchedSkills.length}/{job.requiredSkillIds.length})</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {matchedSkills.length > 0
                          ? matchedSkills.map((id) => SKILLS.find((s) => s.id === id)?.name).join(' · ')
                          : 'None practiced or evidenced yet.'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Missing Qualifications &amp; Recommended Training ({missingSkills.length})</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {missingSkills.map((skId) => {
                          const sk = SKILLS.find((s) => s.id === skId);
                          const l = LESSONS.find((x) => x.skillId === skId);
                          return (
                            <button
                              key={skId}
                              type="button"
                              onClick={() => l && onOpenLesson(l.id)}
                              className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-950 hover:bg-amber-100"
                            >
                              {sk?.name} {l ? '-> Train' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
