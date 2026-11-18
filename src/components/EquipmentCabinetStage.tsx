import React, { useEffect, useState } from 'react';
import { Eye, Pause, Play, RotateCcw } from 'lucide-react';

interface ZonePreset {
  id: string;
  label: string;
  note: string;
  scale: number;
  translateX: number;
  translateY: number;
}

const CABINET_ZONES: ZonePreset[] = [
  {
    id: 'overview',
    label: 'Full Panel Sweep',
    note: 'Wide visual sweep across enclosure door, DIN rail contactors, wireways, and PLC rack.',
    scale: 1.04,
    translateX: 0,
    translateY: 0,
  },
  {
    id: 'contactors',
    label: 'Motor Starter Contactors',
    note: 'Check auxiliary seal-in contact block (13-14), coil terminals (A1/A2), and heat discoloration.',
    scale: 1.48,
    translateX: 12,
    translateY: -6,
  },
  {
    id: 'plc_rack',
    label: 'PLC I/O Status Rail',
    note: 'Verify 24VDC input LEDs (I:0/0 Start, I:0/1 NC Stop, I:0/2 Photoeye) and RUN indicator.',
    scale: 1.55,
    translateX: -14,
    translateY: -8,
  },
  {
    id: 'terminals',
    label: 'Fuses & Field Terminals',
    note: 'Inspect control transformer fuse holder, terminal block torque marks, and wire ferrules.',
    scale: 1.45,
    translateX: -4,
    translateY: 14,
  },
];

interface EquipmentCabinetStageProps {
  reducedMotion?: boolean;
  title?: string;
}

export const EquipmentCabinetStage: React.FC<EquipmentCabinetStageProps> = ({
  reducedMotion = false,
  title = 'Live Cabinet Inspection Camera',
}) => {
  const [autoPan, setAutoPan] = useState(!reducedMotion);
  const [zoneIdx, setZoneIdx] = useState(0);

  useEffect(() => {
    if (reducedMotion || !autoPan) return;
    const timer = window.setInterval(() => {
      setZoneIdx((prev) => (prev + 1) % CABINET_ZONES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [autoPan, reducedMotion]);

  const activeZone = CABINET_ZONES[zoneIdx];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-700" />
          <span className="font-display text-sm font-bold text-slate-900">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoPan((v) => !v)}
            className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
          >
            {autoPan && !reducedMotion ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause Camera Pan</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Auto-Pan Tour</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setAutoPan(false);
              setZoneIdx(0);
            }}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Moving Camera Viewport */}
        <div className="relative h-56 overflow-hidden bg-slate-950 sm:h-64 lg:col-span-7">
          <img
            src="/src/assets/images/control_panel_closeup_1795039546326.jpg"
            alt="Industrial electrical control cabinet closeup with PLC rack, contactors, and terminal blocks"
            referrerPolicy="no-referrer"
            className={`h-full w-full object-cover transition-transform duration-1000 ease-in-out will-change-transform ${
              zoneIdx === 0 && autoPan && !reducedMotion ? 'animate-panel-drift' : ''
            }`}
            style={
              zoneIdx !== 0 || !autoPan || reducedMotion
                ? {
                    transform: `scale(${activeZone.scale}) translate3d(${activeZone.translateX}%, ${activeZone.translateY}%, 0)`,
                  }
                : undefined
            }
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="font-mono text-[11px] font-semibold text-yellow-400">
              FOCUS ZONE · {activeZone.label.toUpperCase()}
            </div>
            <p className="mt-0.5 text-xs text-slate-200">{activeZone.note}</p>
          </div>
        </div>

        {/* Inspection Zone Selector */}
        <div className="flex flex-col justify-center gap-2 border-t border-slate-200 bg-slate-50 p-4 lg:col-span-5 lg:border-t-0 lg:border-l">
          <div className="text-xs font-semibold text-slate-500">
            Select Cabinet Inspection Zone
          </div>
          {CABINET_ZONES.map((zone, idx) => {
            const active = zoneIdx === idx;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  setAutoPan(false);
                  setZoneIdx(idx);
                }}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{zone.label}</div>
                <div className={`mt-0.5 line-clamp-1 text-[11px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {zone.note}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
