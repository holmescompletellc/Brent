import React, { useEffect, useRef } from 'react';
import { ArrowRight, Award, CheckCircle2, Unlock, X } from 'lucide-react';
import { COURSES } from '../data/curriculum';
import { TechnicianLevelDef } from '../types/maintenance';

interface LevelUpCelebrationModalProps {
  newLevel: TechnicianLevelDef | null;
  previousLevelNumber: number;
  totalXp: number;
  nextLevel: TechnicianLevelDef | null;
  reducedMotion: boolean;
  onClose: () => void;
  onExploreSkillTree: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  opacity: number;
}

const CONFETTI_COLORS = ['#facc15', '#10b981', '#38bdf8', '#f59e0b', '#ffffff'];

export const LevelUpCelebrationModal: React.FC<LevelUpCelebrationModalProps> = ({
  newLevel,
  previousLevelNumber,
  totalXp,
  nextLevel,
  reducedMotion,
  onClose,
  onExploreSkillTree,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!newLevel) return;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newLevel, onClose]);

  useEffect(() => {
    if (!newLevel) return;
    const prefersReduced =
      reducedMotion ||
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: ConfettiParticle[] = Array.from({ length: 120 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const originX = fromLeft ? width * 0.25 : width * 0.75;
      const angle = fromLeft
        ? -Math.PI / 2 + (Math.random() - 0.2) * 1.1
        : -Math.PI / 2 + (Math.random() - 0.8) * 1.1;
      const speed = 420 + Math.random() * 520;
      return {
        x: originX + (Math.random() - 0.5) * 80,
        y: height * 0.55 + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 120,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1,
      };
    });

    let lastTime = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;
      for (const p of particles) {
        p.vy += 880 * dt; // gravity
        p.vx *= 1 - 0.8 * dt; // air drag
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;

        if (elapsed > 2.2) {
          p.opacity = Math.max(0, p.opacity - 0.9 * dt);
        }

        if (p.opacity > 0.02 && p.y < height + 40) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      if (anyAlive && elapsed < 4.5) {
        animId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [newLevel, reducedMotion]);

  if (!newLevel) return null;

  const newlyUnlockedCourses = COURSES.filter(
    (c) => c.requiredLevel <= newLevel.level && c.requiredLevel > previousLevelNumber
  );

  return (
    <>
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
        />
      )}

      <div
        className="fixed inset-0 z-[61] flex items-center justify-center bg-slate-950/70 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="level-up-title"
      >
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl">
          {/* Top Industrial Navy Banner */}
          <div className="bg-slate-900 px-6 py-6 text-white">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close level up announcement"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-slate-950 shadow-sm">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-yellow-400">
                  Promotion Milestone · Level {previousLevelNumber} to Level {newLevel.level}
                </p>
                <h2
                  id="level-up-title"
                  className="mt-0.5 font-display text-2xl font-bold tracking-tight text-white"
                >
                  {newLevel.title}
                </h2>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-800 pt-3.5 text-xs">
              <div>
                <span className="text-slate-400">Total Earned XP: </span>
                <span className="font-mono font-bold text-yellow-400 tabular-nums">
                  {totalXp.toLocaleString()} XP
                </span>
              </div>
              <div>
                <span className="text-slate-400">Next Tier: </span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                  {nextLevel ? `${nextLevel.title} (${nextLevel.minXp} XP)` : 'Maximum Academy Tier'}
                </span>
              </div>
            </div>
          </div>

          {/* Unlocked Content Body */}
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Unlock className="h-4 w-4 shrink-0 text-emerald-700" />
                <span>Newly Unlocked Training &amp; Capabilities</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                {newLevel.unlockNote}
              </p>
            </div>

            {newlyUnlockedCourses.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-600">
                  Skill Tree Paths Unlocked at Level {newLevel.level}
                </div>
                <ul className="space-y-2">
                  {newlyUnlockedCourses.map((course) => (
                    <li
                      key={course.id}
                      className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          Path {course.pathNumber}: {course.title}
                        </div>
                        <div className="text-xs text-slate-600">{course.subtitle}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-slate-500">
              Technician titles represent learning milestones within Maintenance Path rather than verified occupational licenses.
            </p>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {newlyUnlockedCourses.length > 0 && (
                <button
                  type="button"
                  onClick={onExploreSkillTree}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  <span>Explore Skill Tree</span>
                </button>
              )}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-yellow-400 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
              >
                <span>Continue Training</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
