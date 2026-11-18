import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ACHIEVEMENT_DEFINITIONS,
  CAREER_GOALS,
  COURSES,
  getRotatingChallenges,
  LESSONS,
  SKILLS,
  TECHNICIAN_LEVELS,
  XP_REWARDS,
} from '../data/curriculum';
import {
  Achievement,
  CareerGoalId,
  ChallengeCompletion,
  CompetencyEvidence,
  CompetencyStatus,
  DailyChallenge,
  DocumentItem,
  JobPosting,
  LearningActivity,
  Lesson,
  LessonProgressRecord,
  LessonStageQuestion,
  MaintenanceStoreState,
  MentorMessage,
  MentorMode,
  MissionAttempt,
  QuizAttempt,
  SimulationAttempt,
  SimulatorId,
  SpacedRepetitionItem,
  TaskItem,
  TechnicianLevelDef,
  UserProfile,
  WeeklyReview,
  XpActivityType,
} from '../types/maintenance';

const STORAGE_KEY = 'maintenance_path_training_center_v1';

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  return getLocalDateKey(dt);
}

function createInitialState(): MaintenanceStoreState {
  const today = getLocalDateKey();
  const nextWeek = addDaysToDateKey(today, 5);

  return {
    version: 1,
    profile: {
      name: 'Jordan Mercer',
      roleTitle: 'Apprentice Technician',
      careerGoalId: 'industrial_maintenance_tech',
      soundEnabled: true,
      reducedMotion: false,
      learningGoal: {
        weeklyMinutesTarget: 120,
        weeklyLessonsTarget: 4,
        dailyXpTarget: 50,
      },
    },
    xpLedger: [],
    lessonProgress: {},
    competencyEvidence: {},
    learningActivities: [],
    quizAttempts: [],
    simulationAttempts: [],
    missionAttempts: [],
    challengeCompletions: [],
    spacedRepetitionQueue: [],
    jobs: [
      {
        id: 'job-starter-1',
        title: 'Industrial Maintenance Technician II',
        company: 'Pacific Bottling & Packaging',
        location: 'Tacoma, WA',
        status: 'Saved',
        notes: 'Requires 3-phase motor troubleshooting, PLC I/O diagnostics, LOTO compliance, and conveyor PMs.',
        requiredSkillIds: [
          'sk-loto',
          'sk-ohms-acdc',
          'sk-motor-starters',
          'sk-plc-io',
          'sk-pneu-frl',
          'sk-pm-cmms',
        ],
        customRequirements: ['480V 3-phase motor control troubleshooting', 'CMMS work order documentation'],
      },
      {
        id: 'job-starter-2',
        title: 'Automation & PLC Maintenance Specialist',
        company: 'Cascade Precision Logistics',
        location: 'Portland, OR',
        status: 'Applied',
        appliedDate: today,
        notes: 'High-speed sortation facility using Allen-Bradley / Siemens PLCs, photoeyes, and VFDs.',
        requiredSkillIds: [
          'sk-loto',
          'sk-schematics',
          'sk-vfd',
          'sk-plc-io',
          'sk-ladder-logic',
          'sk-sensors-plc',
          'sk-ind-networks',
        ],
        customRequirements: ['Sensor alignment & PLC ladder diagnostics', 'Industrial Ethernet switch troubleshooting'],
      },
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Complete Lockout/Tagout & Hazardous Energy Control lesson',
        dueDate: today,
        category: 'Study',
        completed: false,
        notes: 'Foundation requirement before lab simulations.',
      },
      {
        id: 'task-2',
        title: 'Practice Conveyor Will Not Start troubleshooting mission',
        dueDate: nextWeek,
        category: 'Lab Practice',
        completed: false,
        notes: 'Prepare diagnostic report example for interviews.',
      },
    ],
    documents: [
      {
        id: 'doc-1',
        title: 'Maintenance Technician Resume — 2026 Draft',
        type: 'Resume',
        updatedAt: today,
        summary: 'Highlights mechanical aptitude, electrical fundamentals study, and facility safety awareness.',
      },
    ],
    weeklyReviews: [],
    mentorConversations: [],
  };
}

function calculateStreak(activities: LearningActivity[]): number {
  if (activities.length === 0) return 0;
  const uniqueDates = new Set(activities.map((a) => a.dateKey));
  const today = getLocalDateKey();
  const yesterday = addDaysToDateKey(today, -1);

  let cursor = uniqueDates.has(today) ? today : uniqueDates.has(yesterday) ? yesterday : '';
  if (!cursor) return 0;

  let streak = 0;
  while (uniqueDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateKey(cursor, -1);
  }
  return streak;
}

const COMPETENCY_RANK: Record<CompetencyStatus, number> = {
  Learning: 1,
  'Practiced in Simulation': 2,
  'Self-Reported Practical Experience': 3,
  'Evidence Submitted': 4,
  'Verified by Authorized Reviewer': 5,
};

interface MaintenanceContextValue {
  state: MaintenanceStoreState;
  totalXp: number;
  currentLevel: TechnicianLevelDef;
  nextLevel: TechnicianLevelDef | null;
  levelProgressPercent: number;
  streakDays: number;
  weeklyMinutes: number;
  weeklyLessonsCompleted: number;
  todayXp: number;
  totalStudyHours: number;
  completedLessonsCount: number;
  completedCoursesCount: number;
  averageQuizScore: number;
  achievements: Achievement[];
  earnedAchievementsCount: number;
  dailyChallenges: DailyChallenge[];
  weakSkills: { skillId: string; name: string; reason: string }[];
  recommendedLesson: Lesson;
  dueReviews: SpacedRepetitionItem[];
  updateProfile: (patch: Partial<UserProfile>) => void;
  startOrAdvanceLessonStage: (lessonId: string, stage: number) => void;
  markStage4Passed: (lessonId: string) => void;
  completeLesson: (
    lessonId: string,
    quizScorePercent: number,
    demonstrateResponse: string,
    missedTopics: string[],
    missedQuestions: LessonStageQuestion[]
  ) => { xpEarnedNow: number; moduleCompletedNow: boolean };
  recordQuizAttempt: (params: {
    lessonId?: string;
    title: string;
    category: string;
    correctCount: number;
    totalCount: number;
    timeSpentSeconds: number;
    missedTopics: string[];
    missedQuestions: LessonStageQuestion[];
  }) => { scorePercent: number; xpAwarded: number };
  recordSimulationAttempt: (params: {
    simulatorId: SimulatorId;
    simulatorName: string;
    scenarioKey: string;
    scenarioTitle: string;
    faultDiagnosed: string;
    correct: boolean;
    scorePercent: number;
  }) => { xpAwarded: number };
  recordMissionAttempt: (attempt: Omit<MissionAttempt, 'id' | 'completedAt'>) => { xpAwarded: number };
  recordChallengeCompletion: (challenge: DailyChallenge, scorePercent: number) => { xpAwarded: number };
  reviewSpacedItem: (itemId: string, wasCorrect: boolean) => void;
  submitCompetencyEvidence: (
    skillId: string,
    status: CompetencyStatus,
    notes: string,
    evidenceTitle?: string,
    reviewerName?: string
  ) => void;
  addJobPosting: (job: Omit<JobPosting, 'id'>) => void;
  updateJobStatus: (jobId: string, status: JobPosting['status']) => void;
  deleteJobPosting: (jobId: string) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addDocument: (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => void;
  deleteDocument: (docId: string) => void;
  addWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => void;
  appendMentorMessage: (role: 'user' | 'assistant', content: string, mode: MentorMode) => void;
  clearMentorHistory: () => void;
  exportAllDataJson: () => string;
  importDataJson: (rawJson: string) => { ok: boolean; message: string };
  resetAllData: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MaintenanceStoreState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<MaintenanceStoreState>;
        const base = createInitialState();
        return {
          ...base,
          ...parsed,
          profile: { ...base.profile, ...(parsed.profile || {}) },
        };
      }
    } catch {
      // Fallback to initial state
    }
    return createInitialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [state]);

  useEffect(() => {
    if (state.profile.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [state.profile.reducedMotion]);

  const totalXp = useMemo(
    () => state.xpLedger.reduce((sum, entry) => sum + entry.amount, 0),
    [state.xpLedger]
  );

  const currentLevel = useMemo(() => {
    let active = TECHNICIAN_LEVELS[0];
    for (const lvl of TECHNICIAN_LEVELS) {
      if (totalXp >= lvl.minXp) active = lvl;
    }
    return active;
  }, [totalXp]);

  const nextLevel = useMemo(() => {
    const idx = TECHNICIAN_LEVELS.findIndex((l) => l.level === currentLevel.level);
    return idx >= 0 && idx < TECHNICIAN_LEVELS.length - 1 ? TECHNICIAN_LEVELS[idx + 1] : null;
  }, [currentLevel]);

  const levelProgressPercent = useMemo(() => {
    if (!nextLevel) return 100;
    const span = nextLevel.minXp - currentLevel.minXp;
    if (span <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((totalXp - currentLevel.minXp) / span) * 100)));
  }, [totalXp, currentLevel, nextLevel]);

  const streakDays = useMemo(() => calculateStreak(state.learningActivities), [state.learningActivities]);

  const todayKey = getLocalDateKey();
  const sevenDaysAgoKey = addDaysToDateKey(todayKey, -6);

  const weeklyMinutes = useMemo(
    () =>
      state.learningActivities
        .filter((a) => a.dateKey >= sevenDaysAgoKey)
        .reduce((sum, a) => sum + a.minutesSpent, 0),
    [state.learningActivities, sevenDaysAgoKey]
  );

  const weeklyLessonsCompleted = useMemo(() => {
    const lessonIds = new Set(
      state.learningActivities
        .filter((a) => a.dateKey >= sevenDaysAgoKey && a.type === 'lesson')
        .map((a) => a.referenceId)
    );
    return lessonIds.size;
  }, [state.learningActivities, sevenDaysAgoKey]);

  const todayXp = useMemo(
    () =>
      state.learningActivities
        .filter((a) => a.dateKey === todayKey)
        .reduce((sum, a) => sum + a.xpEarned, 0),
    [state.learningActivities, todayKey]
  );

  const totalStudyHours = useMemo(() => {
    const mins = state.learningActivities.reduce((sum, a) => sum + a.minutesSpent, 0);
    return Number((mins / 60).toFixed(1));
  }, [state.learningActivities]);

  const completedLessonsCount = useMemo(
    () => Object.values(state.lessonProgress).filter((p) => p.completed).length,
    [state.lessonProgress]
  );

  const completedCoursesCount = useMemo(
    () =>
      COURSES.filter((c) => c.lessonIds.every((id) => state.lessonProgress[id]?.completed)).length,
    [state.lessonProgress]
  );

  const averageQuizScore = useMemo(() => {
    if (state.quizAttempts.length === 0) return 0;
    const total = state.quizAttempts.reduce((sum, q) => sum + q.scorePercent, 0);
    return Math.round(total / state.quizAttempts.length);
  }, [state.quizAttempts]);

  const achievements: Achievement[] = useMemo(() => {
    const passedSims = state.simulationAttempts.filter((s) => s.correct);
    const hasPassedMotor = passedSims.some((s) => s.simulatorId === 'motor_starter');
    const hasPassedPlcSim = passedSims.some((s) => s.simulatorId === 'plc_ladder');
    const hasPassedHydSim = passedSims.some((s) => s.simulatorId === 'hydraulics');
    const hasPassedPneuSim = passedSims.some((s) => s.simulatorId === 'pneumatics');
    const hasPassedPmSim = passedSims.some((s) => s.simulatorId === 'preventive_maintenance');

    const safetyCourse = COURSES.find((c) => c.id === 'path-1-safety')!;
    const elecCourse = COURSES.find((c) => c.id === 'path-3-electrical')!;
    const plcCourse = COURSES.find((c) => c.id === 'path-4-plc')!;
    const hydCourse = COURSES.find((c) => c.id === 'path-5-hydraulics')!;

    const safetyDone = safetyCourse.lessonIds.filter(
      (id) => state.lessonProgress[id]?.completed && state.lessonProgress[id].quizBestScore >= 80
    ).length;
    const elecDone = elecCourse.lessonIds.filter((id) => state.lessonProgress[id]?.completed).length;
    const plcLessonDone = plcCourse.lessonIds.some((id) => state.lessonProgress[id]?.completed) ? 1 : 0;
    const hydLessonDone = hydCourse.lessonIds.every((id) => state.lessonProgress[id]?.completed) ? 1 : 0;
    const perfectQuizCount = state.quizAttempts.filter((q) => q.scorePercent === 100).length;
    const completedMissionsCount = state.missionAttempts.filter((m) => m.totalScore >= 60).length;

    const progressMap: Record<string, { current: number; target: number }> = {
      first_lesson: { current: Math.min(1, completedLessonsCount), target: 1 },
      electrical_fundamentals: { current: elecDone, target: 2 },
      motor_troubleshooter: { current: hasPassedMotor ? 1 : 0, target: 1 },
      plc_apprentice: { current: (hasPassedPlcSim ? 1 : 0) + plcLessonDone, target: 2 },
      hydraulic_specialist: { current: (hasPassedHydSim ? 1 : 0) + hydLessonDone, target: 2 },
      pneumatic_troubleshooter: { current: hasPassedPneuSim ? 1 : 0, target: 1 },
      pm_pro: { current: hasPassedPmSim ? 1 : 0, target: 1 },
      safety_champion: { current: safetyDone, target: 2 },
      streak_7: { current: Math.min(7, streakDays), target: 7 },
      streak_30: { current: Math.min(30, streakDays), target: 30 },
      perfect_quiz: { current: Math.min(1, perfectQuizCount), target: 1 },
      first_simulator: { current: Math.min(1, passedSims.length), target: 1 },
      ten_missions: { current: Math.min(10, completedMissionsCount), target: 10 },
      module_mastery: { current: Math.min(1, completedCoursesCount), target: 1 },
    };

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const prog = progressMap[def.id] || { current: 0, target: def.target };
      const earned = prog.current >= prog.target;
      return {
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        earned,
        earnedAt: earned ? state.learningActivities[0]?.dateKey || todayKey : undefined,
        progressCurrent: prog.current,
        progressTarget: prog.target,
      };
    });
  }, [
    state.lessonProgress,
    state.simulationAttempts,
    state.quizAttempts,
    state.missionAttempts,
    state.learningActivities,
    completedLessonsCount,
    completedCoursesCount,
    streakDays,
    todayKey,
  ]);

  const earnedAchievementsCount = useMemo(
    () => achievements.filter((a) => a.earned).length,
    [achievements]
  );

  const dailyChallenges = useMemo(() => getRotatingChallenges(todayKey), [todayKey]);

  const weakSkills = useMemo(() => {
    const goal = CAREER_GOALS.find((g) => g.id === state.profile.careerGoalId) || CAREER_GOALS[0];
    const items: { skillId: string; name: string; reason: string }[] = [];

    const recentMissedTopics = new Set(
      state.quizAttempts.slice(0, 6).flatMap((q) => q.missedTopics)
    );

    for (const skill of SKILLS) {
      const ev = state.competencyEvidence[skill.id];
      const hasTopicGap = Array.from(recentMissedTopics).some((t) =>
        skill.name.toLowerCase().includes(t.toLowerCase().split(' ')[0])
      );
      if (hasTopicGap) {
        items.push({ skillId: skill.id, name: skill.name, reason: 'Missed quiz topic needs review' });
      } else if (goal.requiredSkillIds.includes(skill.id) && !ev) {
        items.push({ skillId: skill.id, name: skill.name, reason: `Required for ${goal.title}` });
      }
      if (items.length >= 4) break;
    }

    return items;
  }, [state.profile.careerGoalId, state.quizAttempts, state.competencyEvidence]);

  const recommendedLesson = useMemo(() => {
    // 1. Resume any in-progress incomplete lesson
    const inProgress = LESSONS.find(
      (l) => state.lessonProgress[l.id] && !state.lessonProgress[l.id].completed
    );
    if (inProgress) return inProgress;

    // 2. Match career goal recommended lessons not yet completed
    const goal = CAREER_GOALS.find((g) => g.id === state.profile.careerGoalId);
    if (goal) {
      const goalNext = LESSONS.find(
        (l) => goal.recommendedLessonIds.includes(l.id) && !state.lessonProgress[l.id]?.completed
      );
      if (goalNext) return goalNext;
    }

    // 3. Next uncompleted lesson in order
    return LESSONS.find((l) => !state.lessonProgress[l.id]?.completed) || LESSONS[0];
  }, [state.lessonProgress, state.profile.careerGoalId]);

  const dueReviews = useMemo(
    () => state.spacedRepetitionQueue.filter((item) => item.nextReviewDate <= todayKey),
    [state.spacedRepetitionQueue, todayKey]
  );

  function updateProfile(patch: Partial<UserProfile>) {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...patch,
        learningGoal: {
          ...prev.profile.learningGoal,
          ...(patch.learningGoal || {}),
        },
      },
    }));
  }

  function startOrAdvanceLessonStage(lessonId: string, stage: number) {
    const now = new Date().toISOString();
    const lesson = LESSONS.find((l) => l.id === lessonId);
    setState((prev) => {
      const existing = prev.lessonProgress[lessonId];
      const nextStage = existing ? Math.max(existing.currentStage, stage) : stage;
      const nextComp = { ...prev.competencyEvidence };
      if (lesson && !nextComp[lesson.skillId]) {
        nextComp[lesson.skillId] = {
          skillId: lesson.skillId,
          status: 'Learning',
          notes: `Started curriculum lesson: ${lesson.title}`,
          updatedAt: now,
        };
      }
      return {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            lessonId,
            currentStage: nextStage,
            completed: existing?.completed ?? false,
            stage4Passed: existing?.stage4Passed ?? false,
            quizBestScore: existing?.quizBestScore ?? 0,
            demonstrateResponse: existing?.demonstrateResponse ?? '',
            completedAt: existing?.completedAt,
            lastStudiedAt: now,
          },
        },
        competencyEvidence: nextComp,
      };
    });
  }

  function markStage4Passed(lessonId: string) {
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const lesson = LESSONS.find((l) => l.id === lessonId);
    setState((prev) => {
      const existing = prev.lessonProgress[lessonId];
      const sourceKey = `practical:${lessonId}`;
      const alreadyAwarded = prev.xpLedger.some((e) => e.sourceKey === sourceKey);
      const xpAmt = alreadyAwarded ? 0 : XP_REWARDS.practical_exercise;

      const nextLedger = alreadyAwarded
        ? prev.xpLedger
        : [
            ...prev.xpLedger,
            {
              id: `xp-${Date.now()}-p`,
              sourceKey,
              activityType: 'practical_exercise' as XpActivityType,
              amount: xpAmt,
              label: `Practical Exercise: ${lesson?.title || lessonId}`,
              awardedAt: now,
            },
          ];

      return {
        ...prev,
        xpLedger: nextLedger,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: {
            lessonId,
            currentStage: Math.max(existing?.currentStage ?? 1, 5),
            completed: existing?.completed ?? false,
            stage4Passed: true,
            quizBestScore: existing?.quizBestScore ?? 0,
            demonstrateResponse: existing?.demonstrateResponse ?? '',
            completedAt: existing?.completedAt,
            lastStudiedAt: now,
          },
        },
        learningActivities:
          xpAmt > 0
            ? [
                {
                  id: `act-${Date.now()}-p`,
                  dateKey,
                  timestamp: now,
                  type: 'lesson',
                  referenceId: lessonId,
                  title: `Practice Exercise · ${lesson?.title || lessonId}`,
                  minutesSpent: 4,
                  xpEarned: xpAmt,
                },
                ...prev.learningActivities,
              ]
            : prev.learningActivities,
      };
    });
  }

  function completeLesson(
    lessonId: string,
    quizScorePercent: number,
    demonstrateResponse: string,
    missedTopics: string[],
    missedQuestions: LessonStageQuestion[]
  ): { xpEarnedNow: number; moduleCompletedNow: boolean } {
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const lesson = LESSONS.find((l) => l.id === lessonId);
    const course = COURSES.find((c) => c.id === lesson?.courseId);

    let xpEarnedNow = 0;
    let moduleCompletedNow = false;

    setState((prev) => {
      const nextLedger = [...prev.xpLedger];
      const lessonKey = `lesson:${lessonId}`;
      if (!nextLedger.some((e) => e.sourceKey === lessonKey)) {
        nextLedger.push({
          id: `xp-${Date.now()}-l`,
          sourceKey: lessonKey,
          activityType: 'lesson',
          amount: XP_REWARDS.lesson,
          label: `Lesson: ${lesson?.title || lessonId}`,
          awardedAt: now,
        });
        xpEarnedNow += XP_REWARDS.lesson;
      }

      const quizKey = `quiz:${lessonId}`;
      if (quizScorePercent >= 70 && !nextLedger.some((e) => e.sourceKey === quizKey)) {
        nextLedger.push({
          id: `xp-${Date.now()}-q`,
          sourceKey: quizKey,
          activityType: 'quiz_pass',
          amount: XP_REWARDS.quiz_pass,
          label: `Quiz Passed: ${lesson?.title || lessonId}`,
          awardedAt: now,
        });
        xpEarnedNow += XP_REWARDS.quiz_pass;
      }

      const prevRec = prev.lessonProgress[lessonId];
      const updatedProgress: Record<string, LessonProgressRecord> = {
        ...prev.lessonProgress,
        [lessonId]: {
          lessonId,
          currentStage: 7,
          completed: true,
          stage4Passed: prevRec?.stage4Passed ?? true,
          quizBestScore: Math.max(prevRec?.quizBestScore ?? 0, quizScorePercent),
          demonstrateResponse,
          completedAt: prevRec?.completedAt || now,
          lastStudiedAt: now,
        },
      };

      if (course) {
        const allDone = course.lessonIds.every((id) => updatedProgress[id]?.completed);
        const modKey = `module:${course.id}`;
        if (allDone && !nextLedger.some((e) => e.sourceKey === modKey)) {
          nextLedger.push({
            id: `xp-${Date.now()}-m`,
            sourceKey: modKey,
            activityType: 'module_complete',
            amount: XP_REWARDS.module_complete,
            label: `Module Complete: ${course.title}`,
            awardedAt: now,
          });
          xpEarnedNow += XP_REWARDS.module_complete;
          moduleCompletedNow = true;
        }
      }

      // Update skill passport carefully without overwriting higher verified/self-reported statuses
      const nextComp = { ...prev.competencyEvidence };
      if (lesson) {
        const existingSkill = nextComp[lesson.skillId];
        if (!existingSkill || COMPETENCY_RANK[existingSkill.status] < COMPETENCY_RANK['Practiced in Simulation']) {
          nextComp[lesson.skillId] = {
            skillId: lesson.skillId,
            status: 'Learning',
            notes: `Completed lesson "${lesson.title}" (${quizScorePercent}% check).`,
            updatedAt: now,
          };
        }
      }

      // Enqueue missed questions for spaced repetition (+1 day)
      const nextQueue = [...prev.spacedRepetitionQueue];
      const tomorrow = addDaysToDateKey(dateKey, 1);
      for (const q of missedQuestions) {
        if (!nextQueue.some((item) => item.question.id === q.id)) {
          nextQueue.push({
            id: `sr-${q.id}`,
            question: q,
            lessonId,
            category: course?.title || 'General',
            intervalDays: 1,
            nextReviewDate: tomorrow,
            lastResult: 'incorrect',
          });
        }
      }

      const nextReviewDate = addDaysToDateKey(dateKey, missedTopics.length > 0 ? 2 : 5);
      const quizAttempt: QuizAttempt = {
        id: `qa-${Date.now()}`,
        lessonId,
        title: `${lesson?.title || lessonId} Check`,
        category: course?.title || 'Curriculum',
        scorePercent: quizScorePercent,
        correctCount: Math.round(((lesson?.stage5Quiz.length || 1) * quizScorePercent) / 100),
        totalCount: lesson?.stage5Quiz.length || 1,
        timeSpentSeconds: 90,
        missedTopics,
        completedAt: now,
        nextReviewDate,
      };

      const activity: LearningActivity = {
        id: `act-${Date.now()}`,
        dateKey,
        timestamp: now,
        type: 'lesson',
        referenceId: lessonId,
        title: lesson?.title || lessonId,
        minutesSpent: lesson?.durationMinutes || 12,
        xpEarned: xpEarnedNow,
      };

      return {
        ...prev,
        xpLedger: nextLedger,
        lessonProgress: updatedProgress,
        competencyEvidence: nextComp,
        spacedRepetitionQueue: nextQueue,
        quizAttempts: [quizAttempt, ...prev.quizAttempts],
        learningActivities: [activity, ...prev.learningActivities],
      };
    });

    return { xpEarnedNow, moduleCompletedNow };
  }

  function recordQuizAttempt(params: {
    lessonId?: string;
    title: string;
    category: string;
    correctCount: number;
    totalCount: number;
    timeSpentSeconds: number;
    missedTopics: string[];
    missedQuestions: LessonStageQuestion[];
  }) {
    const scorePercent = params.totalCount > 0 ? Math.round((params.correctCount / params.totalCount) * 100) : 0;
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const sourceKey = `assessment:${params.title}:${dateKey}`;
    let xpAwarded = 0;

    setState((prev) => {
      const nextLedger = [...prev.xpLedger];
      if (scorePercent >= 70 && !nextLedger.some((e) => e.sourceKey === sourceKey)) {
        xpAwarded = XP_REWARDS.quiz_pass;
        nextLedger.push({
          id: `xp-${Date.now()}-qa`,
          sourceKey,
          activityType: 'quiz_pass',
          amount: xpAwarded,
          label: `Assessment Passed: ${params.title}`,
          awardedAt: now,
        });
      }

      const nextQueue = [...prev.spacedRepetitionQueue];
      const tomorrow = addDaysToDateKey(dateKey, 1);
      for (const q of params.missedQuestions) {
        if (!nextQueue.some((i) => i.question.id === q.id)) {
          nextQueue.push({
            id: `sr-${q.id}`,
            question: q,
            lessonId: params.lessonId || 'safety-loto',
            category: params.category,
            intervalDays: 1,
            nextReviewDate: tomorrow,
            lastResult: 'incorrect',
          });
        }
      }

      const attempt: QuizAttempt = {
        id: `qa-${Date.now()}`,
        lessonId: params.lessonId,
        title: params.title,
        category: params.category,
        scorePercent,
        correctCount: params.correctCount,
        totalCount: params.totalCount,
        timeSpentSeconds: params.timeSpentSeconds,
        missedTopics: params.missedTopics,
        completedAt: now,
        nextReviewDate: addDaysToDateKey(dateKey, scorePercent >= 85 ? 7 : 2),
      };

      const activity: LearningActivity = {
        id: `act-${Date.now()}-q`,
        dateKey,
        timestamp: now,
        type: 'quiz',
        referenceId: attempt.id,
        title: params.title,
        minutesSpent: Math.max(3, Math.round(params.timeSpentSeconds / 60)),
        xpEarned: xpAwarded,
      };

      return {
        ...prev,
        xpLedger: nextLedger,
        quizAttempts: [attempt, ...prev.quizAttempts],
        spacedRepetitionQueue: nextQueue,
        learningActivities: [activity, ...prev.learningActivities],
      };
    });

    return { scorePercent, xpAwarded };
  }

  function recordSimulationAttempt(params: {
    simulatorId: SimulatorId;
    simulatorName: string;
    scenarioKey: string;
    scenarioTitle: string;
    faultDiagnosed: string;
    correct: boolean;
    scorePercent: number;
  }) {
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const sourceKey = `sim:${params.simulatorId}:${params.scenarioKey}`;
    let xpAwarded = 0;

    setState((prev) => {
      const nextLedger = [...prev.xpLedger];
      if (params.correct && !nextLedger.some((e) => e.sourceKey === sourceKey)) {
        xpAwarded = XP_REWARDS.simulator_challenge;
        nextLedger.push({
          id: `xp-${Date.now()}-sim`,
          sourceKey,
          activityType: 'simulator_challenge',
          amount: xpAwarded,
          label: `Simulator: ${params.simulatorName} (${params.scenarioTitle})`,
          awardedAt: now,
        });
      }

      const linkedCourse = COURSES.find((c) => c.linkedSimulatorId === params.simulatorId);
      const nextComp = { ...prev.competencyEvidence };
      if (params.correct && linkedCourse) {
        for (const lId of linkedCourse.lessonIds) {
          const l = LESSONS.find((x) => x.id === lId);
          if (l) {
            const existing = nextComp[l.skillId];
            if (!existing || COMPETENCY_RANK[existing.status] < COMPETENCY_RANK['Practiced in Simulation']) {
              nextComp[l.skillId] = {
                skillId: l.skillId,
                status: 'Practiced in Simulation',
                notes: `Completed ${params.simulatorName} scenario (${params.scenarioTitle}).`,
                updatedAt: now,
              };
            }
          }
        }
      }

      const simAttempt: SimulationAttempt = {
        id: `sim-${Date.now()}`,
        simulatorId: params.simulatorId,
        simulatorName: params.simulatorName,
        scenarioTitle: params.scenarioTitle,
        faultDiagnosed: params.faultDiagnosed,
        correct: params.correct,
        scorePercent: params.scorePercent,
        completedAt: now,
      };

      const act: LearningActivity = {
        id: `act-${Date.now()}-sim`,
        dateKey,
        timestamp: now,
        type: 'simulator',
        referenceId: params.simulatorId,
        title: `${params.simulatorName} · ${params.scenarioTitle}`,
        minutesSpent: 8,
        xpEarned: xpAwarded,
      };

      return {
        ...prev,
        xpLedger: nextLedger,
        competencyEvidence: nextComp,
        simulationAttempts: [simAttempt, ...prev.simulationAttempts],
        learningActivities: [act, ...prev.learningActivities],
      };
    });

    return { xpAwarded };
  }

  function recordMissionAttempt(attempt: Omit<MissionAttempt, 'id' | 'completedAt'>) {
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const sourceKey = `mission:${attempt.missionId}`;
    let xpAwarded = 0;

    setState((prev) => {
      const nextLedger = [...prev.xpLedger];
      if (attempt.totalScore >= 60 && !nextLedger.some((e) => e.sourceKey === sourceKey)) {
        xpAwarded = XP_REWARDS.troubleshooting_mission;
        nextLedger.push({
          id: `xp-${Date.now()}-mis`,
          sourceKey,
          activityType: 'troubleshooting_mission',
          amount: xpAwarded,
          label: `Mission: ${attempt.missionTitle}`,
          awardedAt: now,
        });
      }

      const fullAttempt: MissionAttempt = {
        ...attempt,
        id: `mis-${Date.now()}`,
        completedAt: now,
      };

      const act: LearningActivity = {
        id: `act-${Date.now()}-mis`,
        dateKey,
        timestamp: now,
        type: 'mission',
        referenceId: attempt.missionId,
        title: `Mission · ${attempt.missionTitle}`,
        minutesSpent: 12,
        xpEarned: xpAwarded,
      };

      return {
        ...prev,
        xpLedger: nextLedger,
        missionAttempts: [fullAttempt, ...prev.missionAttempts],
        learningActivities: [act, ...prev.learningActivities],
      };
    });

    return { xpAwarded };
  }

  function recordChallengeCompletion(challenge: DailyChallenge, scorePercent: number) {
    const now = new Date().toISOString();
    const dateKey = getLocalDateKey();
    const sourceKey = `challenge:${challenge.id}:${dateKey}`;
    let xpAwarded = 0;

    setState((prev) => {
      const nextLedger = [...prev.xpLedger];
      if (!nextLedger.some((e) => e.sourceKey === sourceKey)) {
        xpAwarded = challenge.kind === 'weekly' ? XP_REWARDS.weekly_challenge : challenge.xpReward;
        nextLedger.push({
          id: `xp-${Date.now()}-ch`,
          sourceKey,
          activityType: challenge.kind === 'weekly' ? 'weekly_challenge' : 'practical_exercise',
          amount: xpAwarded,
          label: `${challenge.kind === 'weekly' ? 'Weekly' : 'Daily'} Challenge: ${challenge.title}`,
          awardedAt: now,
        });
      }

      const comp: ChallengeCompletion = {
        id: `ch-${Date.now()}`,
        challengeId: challenge.id,
        dateKey,
        kind: challenge.kind,
        scorePercent,
        completedAt: now,
      };

      const act: LearningActivity = {
        id: `act-${Date.now()}-ch`,
        dateKey,
        timestamp: now,
        type: 'challenge',
        referenceId: challenge.id,
        title: challenge.title,
        minutesSpent: 5,
        xpEarned: xpAwarded,
      };

      return {
        ...prev,
        xpLedger: nextLedger,
        challengeCompletions: [comp, ...prev.challengeCompletions],
        learningActivities: [act, ...prev.learningActivities],
      };
    });

    return { xpAwarded };
  }

  function reviewSpacedItem(itemId: string, wasCorrect: boolean) {
    const today = getLocalDateKey();
    const now = new Date().toISOString();
    setState((prev) => {
      const updatedQueue = prev.spacedRepetitionQueue.map((item) => {
        if (item.id !== itemId) return item;
        const nextInterval = wasCorrect ? Math.min(30, item.intervalDays * 2 + 1) : 1;
        return {
          ...item,
          intervalDays: nextInterval,
          nextReviewDate: addDaysToDateKey(today, nextInterval),
          lastResult: wasCorrect ? ('correct' as const) : ('incorrect' as const),
        };
      });

      const act: LearningActivity = {
        id: `act-${Date.now()}-sr`,
        dateKey: today,
        timestamp: now,
        type: 'review',
        referenceId: itemId,
        title: 'Spaced Repetition Review',
        minutesSpent: 2,
        xpEarned: 0,
      };

      return {
        ...prev,
        spacedRepetitionQueue: updatedQueue,
        learningActivities: [act, ...prev.learningActivities],
      };
    });
  }

  function submitCompetencyEvidence(
    skillId: string,
    status: CompetencyStatus,
    notes: string,
    evidenceTitle?: string,
    reviewerName?: string
  ) {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      competencyEvidence: {
        ...prev.competencyEvidence,
        [skillId]: {
          skillId,
          status,
          notes,
          evidenceTitle,
          reviewerName,
          updatedAt: now,
        },
      },
    }));
  }

  function addJobPosting(job: Omit<JobPosting, 'id'>) {
    setState((prev) => ({
      ...prev,
      jobs: [{ ...job, id: `job-${Date.now()}` }, ...prev.jobs],
    }));
  }

  function updateJobStatus(jobId: string, status: JobPosting['status']) {
    const today = getLocalDateKey();
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) =>
        j.id === jobId
          ? { ...j, status, appliedDate: status === 'Applied' && !j.appliedDate ? today : j.appliedDate }
          : j
      ),
    }));
  }

  function deleteJobPosting(jobId: string) {
    setState((prev) => ({ ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId) }));
  }

  function addTask(task: Omit<TaskItem, 'id'>) {
    setState((prev) => ({
      ...prev,
      tasks: [{ ...task, id: `task-${Date.now()}` }, ...prev.tasks],
    }));
  }

  function toggleTask(taskId: string) {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  }

  function deleteTask(taskId: string) {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) }));
  }

  function addDocument(doc: Omit<DocumentItem, 'id' | 'updatedAt'>) {
    setState((prev) => ({
      ...prev,
      documents: [
        { ...doc, id: `doc-${Date.now()}`, updatedAt: getLocalDateKey() },
        ...prev.documents,
      ],
    }));
  }

  function deleteDocument(docId: string) {
    setState((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.id !== docId) }));
  }

  function addWeeklyReview(review: Omit<WeeklyReview, 'id' | 'createdAt'>) {
    setState((prev) => ({
      ...prev,
      weeklyReviews: [
        { ...review, id: `wr-${Date.now()}`, createdAt: new Date().toISOString() },
        ...prev.weeklyReviews,
      ],
    }));
  }

  function appendMentorMessage(role: 'user' | 'assistant', content: string, mode: MentorMode) {
    setState((prev) => ({
      ...prev,
      mentorConversations: [
        ...prev.mentorConversations.slice(-40),
        {
          id: `mm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role,
          content,
          mode,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }

  function clearMentorHistory() {
    setState((prev) => ({ ...prev, mentorConversations: [] }));
  }

  function exportAllDataJson() {
    return JSON.stringify(state, null, 2);
  }

  function importDataJson(rawJson: string): { ok: boolean; message: string } {
    try {
      const parsed = JSON.parse(rawJson) as Partial<MaintenanceStoreState>;
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, message: 'Invalid JSON structure.' };
      }
      const base = createInitialState();
      setState({
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
      });
      return { ok: true, message: 'Records imported and merged into Maintenance Path successfully.' };
    } catch {
      return { ok: false, message: 'Could not parse JSON file. Verify valid JSON export syntax.' };
    }
  }

  function resetAllData() {
    const fresh = createInitialState();
    setState(fresh);
  }

  const value: MaintenanceContextValue = {
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
    averageQuizScore,
    achievements,
    earnedAchievementsCount,
    dailyChallenges,
    weakSkills,
    recommendedLesson,
    dueReviews,
    updateProfile,
    startOrAdvanceLessonStage,
    markStage4Passed,
    completeLesson,
    recordQuizAttempt,
    recordSimulationAttempt,
    recordMissionAttempt,
    recordChallengeCompletion,
    reviewSpacedItem,
    submitCompetencyEvidence,
    addJobPosting,
    updateJobStatus,
    deleteJobPosting,
    addTask,
    toggleTask,
    deleteTask,
    addDocument,
    deleteDocument,
    addWeeklyReview,
    appendMentorMessage,
    clearMentorHistory,
    exportAllDataJson,
    importDataJson,
    resetAllData,
  };

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

export function useMaintenanceStore() {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) {
    throw new Error('useMaintenanceStore must be used inside MaintenanceProvider');
  }
  return ctx;
}
