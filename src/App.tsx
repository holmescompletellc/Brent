/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Bot,
  Briefcase,
  Cpu,
  LayoutDashboard,
  MoreHorizontal,
} from 'lucide-react';
import { DashboardView } from './components/DashboardView';
import { JobsAndCareerView } from './components/JobsAndCareerView';
import { LessonPlayerView } from './components/LessonPlayerView';
import { LevelUpCelebrationModal } from './components/LevelUpCelebrationModal';
import { MissionsAndChallengesView } from './components/MissionsAndChallengesView';
import { MoreWorkspaceView } from './components/MoreWorkspaceView';
import { PathMentorDrawer } from './components/PathMentorDrawer';
import { ProgressAndPassportView } from './components/ProgressAndPassportView';
import { QuizHubView } from './components/QuizHubView';
import { SimulatorsLabView } from './components/SimulatorsLabView';
import { SkillTreeView } from './components/SkillTreeView';
import { LESSONS } from './data/curriculum';
import { MaintenanceProvider, useMaintenanceStore } from './store/useMaintenanceStore';
import {
  LearnSubTab,
  MoreSubTab,
  NavTab,
  PracticeSubTab,
  ProgressSubTab,
  SimulatorId,
  TechnicianLevelDef,
} from './types/maintenance';
import { soundFx } from './utils/sound';

const MAIN_NAV: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'learn', label: 'Learn', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'practice', label: 'Practice', icon: <Cpu className="h-4 w-4" /> },
  { id: 'progress', label: 'Progress', icon: <Award className="h-4 w-4" /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'more', label: 'More', icon: <MoreHorizontal className="h-4 w-4" /> },
];

const MaintenanceShell: React.FC = () => {
  const { state, totalXp, currentLevel, nextLevel, recommendedLesson } = useMaintenanceStore();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [learnSubTab, setLearnSubTab] = useState<LearnSubTab>('skill-tree');
  const [practiceSubTab, setPracticeSubTab] = useState<PracticeSubTab>('simulators');
  const [progressSubTab, setProgressSubTab] = useState<ProgressSubTab>('passport');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('tasks');

  const [activeLessonId, setActiveLessonId] = useState<string>(recommendedLesson.id);
  const [activeSimulatorId, setActiveSimulatorId] = useState<SimulatorId>('motor_starter');

  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorPrompt, setMentorPrompt] = useState<string | undefined>(undefined);
  const [mentorSimCtx, setMentorSimCtx] = useState<string | undefined>(undefined);

  const prevLevelRef = useRef<number>(currentLevel.level);
  const [celebration, setCelebration] = useState<{
    newLevel: TechnicianLevelDef;
    previousLevelNumber: number;
  } | null>(null);

  useEffect(() => {
    if (currentLevel.level > prevLevelRef.current) {
      const prev = prevLevelRef.current;
      prevLevelRef.current = currentLevel.level;
      setCelebration({ newLevel: currentLevel, previousLevelNumber: prev });
      soundFx.complete(state.profile.soundEnabled);
    } else if (currentLevel.level < prevLevelRef.current) {
      prevLevelRef.current = currentLevel.level;
    }
  }, [currentLevel, state.profile.soundEnabled]);

  function handleNavigate(tab: NavTab, subTab?: string) {
    setActiveTab(tab);
    if (subTab) {
      if (tab === 'learn') setLearnSubTab(subTab as LearnSubTab);
      if (tab === 'practice') setPracticeSubTab(subTab as PracticeSubTab);
      if (tab === 'progress') setProgressSubTab(subTab as ProgressSubTab);
      if (tab === 'more') setMoreSubTab(subTab as MoreSubTab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenLesson(lessonId: string) {
    setActiveLessonId(lessonId);
    setActiveTab('learn');
    setLearnSubTab('lesson');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenSimulator(simId: SimulatorId) {
    setActiveSimulatorId(simId);
    setActiveTab('practice');
    setPracticeSubTab('simulators');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenMentor(prompt?: string, simCtx?: string) {
    setMentorPrompt(prompt);
    setMentorSimCtx(simCtx);
    setMentorOpen(true);
  }

  const currentLesson = LESSONS.find((l) => l.id === activeLessonId);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-10">
      {/* Clean 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark Only */}
          <button
            type="button"
            onClick={() => handleNavigate('dashboard')}
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Maintenance Path
          </button>

          {/* Zone 2: Single-line Primary Nav Links */}
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            {MAIN_NAV.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`border-b-2 py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleOpenMentor()}
              className="inline-flex min-h-[38px] items-center gap-2 rounded-lg bg-yellow-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors hover:bg-yellow-300 whitespace-nowrap shrink-0"
            >
              <Bot className="h-4 w-4" />
              <span>Path Mentor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenLesson={handleOpenLesson}
            onOpenSimulator={handleOpenSimulator}
            onOpenMentor={(p) => handleOpenMentor(p)}
          />
        )}

        {activeTab === 'learn' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
              {[
                { id: 'skill-tree' as const, label: 'Skill Tree (8 Paths)' },
                { id: 'lesson' as const, label: '7-Stage Lesson Player' },
                { id: 'quizzes' as const, label: 'Smart Quizzes & Review' },
                { id: 'flashcards' as const, label: 'Flashcards' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLearnSubTab(t.id)}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    learnSubTab === t.id
                      ? 'bg-slate-900 text-yellow-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {learnSubTab === 'skill-tree' && (
              <SkillTreeView
                onOpenLesson={handleOpenLesson}
                onOpenSimulator={handleOpenSimulator}
              />
            )}
            {learnSubTab === 'lesson' && (
              <LessonPlayerView
                lessonId={activeLessonId}
                onSelectLesson={(id) => setActiveLessonId(id)}
                onBackToTree={() => setLearnSubTab('skill-tree')}
                onOpenMentor={(p) => handleOpenMentor(p)}
              />
            )}
            {learnSubTab === 'quizzes' && (
              <QuizHubView mode="quizzes" onOpenMentor={(p) => handleOpenMentor(p)} />
            )}
            {learnSubTab === 'flashcards' && (
              <QuizHubView mode="flashcards" onOpenMentor={(p) => handleOpenMentor(p)} />
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
              {[
                { id: 'simulators' as const, label: 'Equipment Simulators (6)' },
                { id: 'missions' as const, label: 'Troubleshooting Missions' },
                { id: 'challenges' as const, label: 'Daily & Weekly Challenges' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPracticeSubTab(t.id)}
                  className={`min-h-[40px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    practiceSubTab === t.id
                      ? 'bg-slate-900 text-yellow-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {practiceSubTab === 'simulators' && (
              <SimulatorsLabView
                initialSimulatorId={activeSimulatorId}
                onOpenMentor={(p, ctx) => handleOpenMentor(p, ctx)}
              />
            )}
            {practiceSubTab === 'missions' && (
              <MissionsAndChallengesView
                mode="missions"
                onOpenSimulator={handleOpenSimulator}
                onOpenMentor={(p) => handleOpenMentor(p)}
              />
            )}
            {practiceSubTab === 'challenges' && (
              <MissionsAndChallengesView
                mode="challenges"
                onOpenSimulator={handleOpenSimulator}
                onOpenMentor={(p) => handleOpenMentor(p)}
              />
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <ProgressAndPassportView
            activeSubTab={progressSubTab}
            onChangeSubTab={setProgressSubTab}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsAndCareerView
            onOpenLesson={handleOpenLesson}
            onOpenMentor={(p) => handleOpenMentor(p)}
          />
        )}

        {activeTab === 'more' && (
          <MoreWorkspaceView
            activeSubTab={moreSubTab}
            onChangeSubTab={setMoreSubTab}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation (<= 60px height, <15% sticky budget) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-800 bg-slate-900 text-white md:hidden"
        aria-label="Mobile navigation"
      >
        {MAIN_NAV.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`flex min-h-[54px] flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium ${
                isActive ? 'text-yellow-400' : 'text-slate-400'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Contextual Path Mentor AI Drawer */}
      <PathMentorDrawer
        open={mentorOpen}
        onClose={() => setMentorOpen(false)}
        initialPrompt={mentorPrompt}
        activeScreenLabel={`${activeTab} workspace`}
        activeLessonTitle={
          activeTab === 'learn' && learnSubTab === 'lesson' ? currentLesson?.title : undefined
        }
        activeLessonSummary={
          activeTab === 'learn' && learnSubTab === 'lesson'
            ? currentLesson?.stage1Learn.summary
            : undefined
        }
        simulatorContext={mentorSimCtx}
      />

      {/* Technician Level-Up Celebration & Confetti Modal */}
      <LevelUpCelebrationModal
        newLevel={celebration?.newLevel ?? null}
        previousLevelNumber={celebration?.previousLevelNumber ?? 1}
        totalXp={totalXp}
        nextLevel={nextLevel}
        reducedMotion={state.profile.reducedMotion}
        onClose={() => setCelebration(null)}
        onExploreSkillTree={() => {
          setCelebration(null);
          handleNavigate('learn', 'skill-tree');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <MaintenanceProvider>
      <MaintenanceShell />
    </MaintenanceProvider>
  );
}
