import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Bot,
  CalendarClock,
  Cpu,
  Flame,
  GitBranch,
  Play,
  Target,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { CAREER_GOALS, COURSES, LESSONS, SKILLS } from '../data/curriculum';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { LearnSubTab, NavTab, PracticeSubTab, SimulatorId } from '../types/maintenance';
import { soundFx } from '../utils/sound';

interface DashboardViewProps {
  onNavigate: (tab: NavTab, subTab?: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenSimulator: (simId: SimulatorId) => void;
  onOpenMentor: (prompt?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenLesson,
  onOpenSimulator,
  onOpenMentor,
}) => {
  const {
    state,
    totalXp,
    currentLevel,
    nextLevel,
    levelProgressPercent,
    streakDays,
    weeklyMinutes,
    weeklyLessonsCompleted,
    todayXp,
    totalStudyHours,
    completedLessonsCount,
    completedCoursesCount,
    earnedAchievementsCount,
    achievements,
    dailyChallenges,
    weakSkills,
    recommendedLesson,
    dueReviews,
  } = useMaintenanceStore();

  const soundOn = state.profile.soundEnabled;
  const activeCourse = COURSES.find((c) => c.id === recommendedLesson.courseId) || COURSES[0];
  const careerGoal = CAREER_GOALS.find((g) => g.id === state.profile.careerGoalId) || CAREER_GOALS[0];

  const careerMatchedCount = careerGoal.requiredSkillIds.filter((sId) => {
    const ev = state.competencyEvidence[sId];
    return (
      ev &&
      (ev.status === 'Practiced in Simulation' ||
        ev.status === 'Self-Reported Practical Experience' ||
        ev.status === 'Evidence Submitted' ||
        ev.status === 'Verified by Authorized Reviewer')
    );
  }).length;
  const careerReadinessPct = Math.round((careerMatchedCount / careerGoal.requiredSkillIds.length) * 100);

  const primaryDaily = dailyChallenges[0];
  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyDoneToday = state.challengeCompletions.some(
    (c) => c.challengeId === primaryDaily?.id && c.dateKey === todayStr
  );

  const upcomingTasks = state.tasks.filter((t) => !t.completed).slice(0, 3);
  const weeklyGoalPct = Math.min(
    100,
    Math.round((weeklyMinutes / Math.max(1, state.profile.learningGoal.weeklyMinutesTarget)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* Hero Training Academy Banner */}
      <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-white">
        <img
          src="/src/assets/images/academy_training_bay_1795039545220.jpg"
          alt="Industrial maintenance training academy workshop floor"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-cover opacity-35 ${
            state.profile.reducedMotion ? '' : 'animate-hero-bay'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-900/75" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="group h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                <img
                  src="/src/assets/images/technician_avatar_1795039546053.jpg"
                  alt={state.profile.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-yellow-400">
                  Level {currentLevel.level} · {currentLevel.title} · {careerGoal.title} Track
                </p>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back, {state.profile.name}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                  {nextLevel
                    ? `${nextLevel.minXp - totalXp} XP to reach Level ${nextLevel.level} (${nextLevel.title}). ${currentLevel.unlockNote}.`
                    : 'Maximum Academy Tier reached. Continue refining diagnostics and reliability mastery.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-xl border border-slate-700/80 bg-slate-950/75 px-5 py-4 sm:min-w-[320px]">
              <div>
                <div className="text-xs text-slate-400">Total XP</div>
                <div className="mt-1 font-mono text-xl font-bold text-yellow-400 tabular-nums">
                  {totalXp.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Daily Streak</div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>{streakDays}d</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Today XP</div>
                <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                  +{todayXp}
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>
                Progression toward {nextLevel ? `Level ${nextLevel.level}: ${nextLevel.title}` : 'Academy Mastery'}
              </span>
              <span className="font-mono tabular-nums">{levelProgressPercent}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

          {/* 5 Primary Dashboard Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onOpenLesson(recommendedLesson.id);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-yellow-300 whitespace-nowrap shrink-0"
            >
              <Play className="h-4 w-4" />
              <span>Continue Learning</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onNavigate('practice', 'challenges' as PracticeSubTab);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              <Target className="h-4 w-4 text-yellow-400" />
              <span>Today&apos;s Challenge</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onNavigate('practice', 'simulators' as PracticeSubTab);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Practice Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onNavigate('learn', 'skill-tree' as LearnSubTab);
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              <GitBranch className="h-4 w-4 text-sky-400" />
              <span>Explore Skill Tree</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onOpenMentor();
              }}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/60 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-900/70 whitespace-nowrap shrink-0"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Instructor</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip Calculated Strictly From Real Saved Records */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Completed Modules &amp; Lessons</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {completedLessonsCount}/{LESSONS.length}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              · {completedCoursesCount}/{COURSES.length} paths
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Active track: {activeCourse.title}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Weekly Learning Goal</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {weeklyMinutes}m
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              / {state.profile.learningGoal.weeklyMinutesTarget}m goal · {weeklyLessonsCompleted} lessons
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${weeklyGoalPct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Earned Achievement Badges</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {earnedAchievementsCount}/{achievements.length}
            </span>
            <span className="text-xs text-slate-500 tabular-nums">· {totalStudyHours}h logged</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('progress', 'trophies')}
            className="mt-2 text-xs font-semibold text-slate-800 underline-offset-2 hover:underline"
          >
            Open Trophy Room
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">Career Pathway Alignment</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {careerReadinessPct}%
            </span>
            <span className="text-xs text-slate-500 tabular-nums">
              · {careerMatchedCount}/{careerGoal.requiredSkillIds.length} skills practiced
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            Educational training progress (not job certification)
          </p>
        </div>
      </section>

      {/* Main Action Grid: What to Learn Next + What to Practice Today */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Current Course & Recommended Next Activity */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                What Should I Learn Next · Path {activeCourse.pathNumber}
              </span>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {recommendedLesson.durationMinutes} min · 7 Stages
              </span>
            </div>

            <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
              {recommendedLesson.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {recommendedLesson.stage1Learn.summary}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.click(soundOn);
                  onOpenLesson(recommendedLesson.id);
                }}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-4 w-4 text-yellow-400" />
                <span>
                  {state.lessonProgress[recommendedLesson.id]
                    ? `Resume Stage ${state.lessonProgress[recommendedLesson.id].currentStage} of 7`
                    : 'Start 7-Stage Lesson'}
                </span>
              </button>

              {activeCourse.linkedSimulatorId && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.click(soundOn);
                    onOpenSimulator(activeCourse.linkedSimulatorId!);
                  }}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <Wrench className="h-4 w-4 text-slate-600" />
                  <span>Launch Paired Simulator</span>
                </button>
              )}
            </div>
          </div>

          {/* Today's Rotating Challenge & Recommended Lab Practice */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500">
                What Can I Practice Today
              </span>
              <span className="font-mono text-xs font-semibold text-emerald-700 tabular-nums">
                {dailyDoneToday ? 'Completed Today' : `+${primaryDaily?.xpReward || 50} XP Available`}
              </span>
            </div>

            <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {primaryDaily?.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{primaryDaily?.description}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.click(soundOn);
                  if (primaryDaily?.actionTarget.simulatorId) {
                    onOpenSimulator(primaryDaily.actionTarget.simulatorId);
                  } else {
                    onNavigate('practice', 'challenges');
                  }
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-yellow-300 whitespace-nowrap shrink-0"
              >
                <span>{dailyDoneToday ? 'Practice Again' : 'Start Challenge'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Moving Visual Lab Preview */}
            <button
              type="button"
              onClick={() => {
                soundFx.click(soundOn);
                onOpenSimulator('motor_starter');
              }}
              className="group relative mt-5 block w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-left"
            >
              <div className="relative h-28 w-full overflow-hidden sm:h-32">
                <img
                  src="/src/assets/images/control_panel_closeup_1795039546326.jpg"
                  alt="Control panel visual inspection bay preview"
                  referrerPolicy="no-referrer"
                  className={`h-full w-full object-cover opacity-65 transition-transform duration-700 ease-out group-hover:scale-110 ${
                    state.profile.reducedMotion ? '' : 'animate-panel-drift'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-center px-4 py-3">
                  <span className="font-mono text-[11px] font-semibold text-yellow-400">
                    INTERACTIVE CABINET &amp; SCHEMATIC VIEWPORT
                  </span>
                  <div className="mt-0.5 font-display text-sm font-bold text-white sm:text-base">
                    Inspect Live Motor Starter &amp; PLC Enclosure Zones
                  </div>
                  <div className="mt-1 text-xs text-slate-300">
                    Pan across contactors, I/O rails, and terminal strips while running live faults
                  </div>
                </div>
              </div>
            </button>

            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => onOpenSimulator('motor_starter')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="text-xs font-semibold text-slate-900">Motor Starter Lab</div>
                <div className="mt-0.5 text-xs text-slate-500">3-wire seal-in &amp; faults</div>
              </button>
              <button
                type="button"
                onClick={() => onOpenSimulator('plc_ladder')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="text-xs font-semibold text-slate-900">PLC Ladder Logic</div>
                <div className="mt-0.5 text-xs text-slate-500">I/O, TON timers &amp; CTU</div>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('practice', 'missions')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="text-xs font-semibold text-slate-900">Conveyor Mission</div>
                <div className="mt-0.5 text-xs text-slate-500">Branching fault diagnosis</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Weak Skills, Spaced Repetition Reviews & Earned Badges */}
        <div className="space-y-6 lg:col-span-5">
          {/* Skills Requiring Improvement */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">
                Skills Requiring Improvement
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('jobs')}
                className="text-xs font-semibold text-slate-700 hover:underline"
              >
                Compare to Jobs
              </button>
            </div>

            {weakSkills.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                All required skills for {careerGoal.title} have active evidence logged.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {weakSkills.map((ws) => {
                  const sk = SKILLS.find((s) => s.id === ws.skillId);
                  const targetLesson = LESSONS.find((l) => l.skillId === ws.skillId);
                  return (
                    <li key={ws.skillId} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{ws.name}</div>
                        <div className="text-xs text-slate-500">
                          {sk?.category} · {ws.reason}
                        </div>
                      </div>
                      {targetLesson && (
                        <button
                          type="button"
                          onClick={() => onOpenLesson(targetLesson.id)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                        >
                          Train
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Upcoming Review Activities & Tasks */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">
                Upcoming Review &amp; Study Queue
              </h3>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                {dueReviews.length} due
              </span>
            </div>

            {dueReviews.length === 0 && upcomingTasks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No overdue reviews right now. Complete a quiz or add study tasks in More &gt; Tasks &amp; Calendar.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {dueReviews.slice(0, 2).map((rev) => (
                  <div
                    key={rev.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Spaced Review Due · {rev.category}</span>
                      </div>
                      <p className="truncate text-xs text-amber-800">{rev.question.prompt}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('learn', 'quizzes')}
                      className="rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap shrink-0"
                    >
                      Review
                    </button>
                  </div>
                ))}

                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{task.title}</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {task.category} · Due {task.dueDate}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('more', 'tasks')}
                      className="text-xs font-semibold text-slate-700 hover:underline whitespace-nowrap shrink-0"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Badges Snapshot */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">
                Earned Achievements
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('progress', 'trophies')}
                className="text-xs font-semibold text-slate-700 hover:underline"
              >
                View All 14
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {achievements.slice(0, 4).map((ach) => (
                <div
                  key={ach.id}
                  className={`rounded-lg border p-3 ${
                    ach.earned
                      ? 'border-emerald-200 bg-emerald-50/70'
                      : 'border-slate-200 bg-slate-50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Award
                      className={`h-4 w-4 shrink-0 ${
                        ach.earned ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate text-xs font-semibold text-slate-900">
                      {ach.title}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                    {ach.earned ? 'Unlocked' : `${ach.progressCurrent}/${ach.progressTarget}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
