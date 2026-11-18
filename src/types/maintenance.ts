export type NavTab = 'dashboard' | 'learn' | 'practice' | 'progress' | 'jobs' | 'more';

export type MoreSubTab = 'tasks' | 'documents' | 'reviews' | 'settings';

export type LearnSubTab = 'skill-tree' | 'lesson' | 'quizzes' | 'flashcards';

export type PracticeSubTab = 'simulators' | 'missions' | 'challenges';

export type ProgressSubTab = 'passport' | 'analytics' | 'trophies';

export type CompetencyStatus =
  | 'Learning'
  | 'Practiced in Simulation'
  | 'Self-Reported Practical Experience'
  | 'Evidence Submitted'
  | 'Verified by Authorized Reviewer';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type MentorMode =
  | 'explain_simply'
  | 'step_by_step'
  | 'quiz_me'
  | 'hint'
  | 'challenge'
  | 'interview_prep';

export interface TechnicianLevelDef {
  level: number;
  title: string;
  minXp: number;
  unlockNote: string;
}

export type XpActivityType =
  | 'lesson'
  | 'quiz_pass'
  | 'practical_exercise'
  | 'simulator_challenge'
  | 'troubleshooting_mission'
  | 'module_complete'
  | 'weekly_challenge';

export interface XpLedgerEntry {
  id: string;
  sourceKey: string;
  activityType: XpActivityType;
  amount: number;
  label: string;
  awardedAt: string;
}

export interface Course {
  id: string;
  pathNumber: number;
  title: string;
  subtitle: string;
  description: string;
  tier: 'Foundations' | 'Core Systems' | 'Advanced Mastery';
  requiredLevel: number;
  lessonIds: string[];
  linkedSimulatorId?: SimulatorId;
}

export interface LessonVocabItem {
  term: string;
  definition: string;
  application: string;
}

export interface LessonStageQuestion {
  id: string;
  kind: 'multiple_choice' | 'component_id' | 'diagram' | 'matching' | 'scenario';
  prompt: string;
  diagramHint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag: string;
}

export interface LessonPracticeExercise {
  prompt: string;
  mode: 'sequence' | 'parameter_tune' | 'component_match';
  items: { id: string; label: string; detail: string }[];
  correctOrderOrIds: string[];
  feedbackPass: string;
  feedbackRetry: string;
}

export interface LessonSeeItWorkConfig {
  diagramType: 'loto_circuit' | 'bearing_load' | 'motor_seal_in' | 'plc_scan' | 'hydraulic_valve' | 'pneumatic_frl' | 'rca_fishbone' | 'network_ring';
  caption: string;
  interactiveStates: { label: string; reading: string; status: 'nominal' | 'warning' | 'fault'; description: string }[];
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  durationMinutes: number;
  skillId: string;
  prerequisiteLessonIds: string[];
  stage1Learn: {
    summary: string;
    keyPoints: string[];
    analogy: string;
    safetyNote?: string;
  };
  stage2Understand: {
    vocabulary: LessonVocabItem[];
    practicalApplications: string[];
  };
  stage3SeeItWork: LessonSeeItWorkConfig;
  stage4Practice: LessonPracticeExercise;
  stage5Quiz: LessonStageQuestion[];
  stage6Demonstrate: {
    prompt: string;
    checklistCriteria: string[];
  };
}

export interface Skill {
  id: string;
  name: string;
  category:
    | 'Safety'
    | 'Mechanical'
    | 'Electrical'
    | 'PLC & Automation'
    | 'Hydraulics'
    | 'Pneumatics'
    | 'Troubleshooting'
    | 'Reliability & Leadership';
  courseId: string;
  description: string;
}

export interface CompetencyEvidence {
  skillId: string;
  status: CompetencyStatus;
  notes: string;
  evidenceTitle?: string;
  reviewerName?: string;
  updatedAt: string;
}

export interface LessonProgressRecord {
  lessonId: string;
  currentStage: number;
  completed: boolean;
  stage4Passed: boolean;
  quizBestScore: number;
  demonstrateResponse: string;
  completedAt?: string;
  lastStudiedAt: string;
}

export interface LearningActivity {
  id: string;
  dateKey: string; // YYYY-MM-DD
  timestamp: string;
  type: 'lesson' | 'quiz' | 'simulator' | 'mission' | 'challenge' | 'review';
  referenceId: string;
  title: string;
  minutesSpent: number;
  xpEarned: number;
}

export interface QuizAttempt {
  id: string;
  lessonId?: string;
  title: string;
  category: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  timeSpentSeconds: number;
  missedTopics: string[];
  completedAt: string;
  nextReviewDate: string;
}

export interface SpacedRepetitionItem {
  id: string;
  question: LessonStageQuestion;
  lessonId: string;
  category: string;
  intervalDays: number;
  nextReviewDate: string; // YYYY-MM-DD
  lastResult?: 'correct' | 'incorrect';
}

export type SimulatorId =
  | 'motor_starter'
  | 'plc_ladder'
  | 'hydraulics'
  | 'pneumatics'
  | 'mechanical'
  | 'preventive_maintenance';

export interface SimulationAttempt {
  id: string;
  simulatorId: SimulatorId;
  simulatorName: string;
  scenarioTitle: string;
  faultDiagnosed: string;
  correct: boolean;
  scorePercent: number;
  completedAt: string;
}

export interface MissionStepOption {
  id: string;
  label: string;
  observation: string;
  safetyDelta: number;
  reasoningDelta: number;
  efficiencyDelta: number;
  isOptimal?: boolean;
  nextStepId: string;
}

export interface MissionStep {
  id: string;
  stageTitle: string;
  prompt: string;
  readings?: { label: string; value: string; status: 'nominal' | 'warning' | 'fault' }[];
  hint: string;
  options: MissionStepOption[];
}

export interface TroubleshootingMission {
  id: string;
  title: string;
  equipment: string;
  difficulty: DifficultyLevel;
  category: string;
  complaint: string;
  safetyBrief: string;
  steps: Record<string, MissionStep>;
  startStepId: string;
  faultChoices: { id: string; label: string; isCorrect: boolean; explanation: string }[];
  correctiveChoices: { id: string; label: string; isCorrect: boolean }[];
}

export interface MissionAttempt {
  id: string;
  missionId: string;
  missionTitle: string;
  difficulty: DifficultyLevel;
  safetyScore: number;
  reasoningScore: number;
  faultIdScore: number;
  efficiencyScore: number;
  documentationScore: number;
  rootCauseScore: number;
  totalScore: number;
  reportText: string;
  completedAt: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  kind: 'daily' | 'weekly';
  description: string;
  xpReward: number;
  category: string;
  actionTarget: { tab: NavTab; subTab?: string; simulatorId?: SimulatorId; missionId?: string };
  questions?: LessonStageQuestion[];
}

export interface ChallengeCompletion {
  id: string;
  challengeId: string;
  dateKey: string;
  kind: 'daily' | 'weekly';
  scorePercent: number;
  completedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  earned: boolean;
  earnedAt?: string;
  progressCurrent: number;
  progressTarget: number;
}

export interface LearningGoal {
  weeklyMinutesTarget: number;
  weeklyLessonsTarget: number;
  dailyXpTarget: number;
}

export type CareerGoalId =
  | 'industrial_maintenance_tech'
  | 'industrial_maintenance_mechanic'
  | 'electrical_maintenance_tech'
  | 'plc_technician'
  | 'automation_technician'
  | 'reliability_technician'
  | 'maintenance_supervisor';

export interface CareerGoalDef {
  id: CareerGoalId;
  title: string;
  summary: string;
  requiredSkillIds: string[];
  recommendedLessonIds: string[];
  potentialCredentials: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer';
  appliedDate?: string;
  notes: string;
  requiredSkillIds: string[];
  customRequirements: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  category: 'Study' | 'Job Application' | 'Certification' | 'Lab Practice';
  completed: boolean;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'Resume' | 'Certificate' | 'Training Evidence' | 'Study Notes';
  updatedAt: string;
  linkedSkillId?: string;
  summary: string;
}

export interface WeeklyReview {
  id: string;
  weekOf: string;
  wins: string;
  challenges: string;
  nextWeekFocus: string;
  hoursLogged: number;
  createdAt: string;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: MentorMode;
  timestamp: string;
}

export interface FlashcardItem {
  id: string;
  category: string;
  front: string;
  back: string;
  practicalTip: string;
}

export interface UserProfile {
  name: string;
  roleTitle: string;
  careerGoalId: CareerGoalId;
  soundEnabled: boolean;
  reducedMotion: boolean;
  learningGoal: LearningGoal;
}

export interface MaintenanceStoreState {
  version: number;
  profile: UserProfile;
  xpLedger: XpLedgerEntry[];
  lessonProgress: Record<string, LessonProgressRecord>;
  competencyEvidence: Record<string, CompetencyEvidence>;
  learningActivities: LearningActivity[];
  quizAttempts: QuizAttempt[];
  simulationAttempts: SimulationAttempt[];
  missionAttempts: MissionAttempt[];
  challengeCompletions: ChallengeCompletion[];
  spacedRepetitionQueue: SpacedRepetitionItem[];
  jobs: JobPosting[];
  tasks: TaskItem[];
  documents: DocumentItem[];
  weeklyReviews: WeeklyReview[];
  mentorConversations: MentorMessage[];
}
