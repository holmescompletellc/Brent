import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Cpu,
  Droplets,
  Gauge,
  RotateCcw,
  ShieldAlert,
  Wrench,
  Wind,
  Zap,
} from 'lucide-react';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { SimulatorId } from '../types/maintenance';
import { soundFx } from '../utils/sound';
import { EquipmentCabinetStage } from './EquipmentCabinetStage';

interface SimulatorsLabViewProps {
  initialSimulatorId?: SimulatorId;
  onOpenMentor: (prompt: string, simContext?: string) => void;
}

const SIM_TABS: { id: SimulatorId; label: string; short: string; icon: React.ReactNode }[] = [
  { id: 'motor_starter', label: 'A. Electrical Motor Starter', short: 'Motor Starter', icon: <Zap className="h-4 w-4" /> },
  { id: 'plc_ladder', label: 'B. PLC Ladder Logic', short: 'PLC Ladder', icon: <Cpu className="h-4 w-4" /> },
  { id: 'hydraulics', label: 'C. Hydraulics', short: 'Hydraulics', icon: <Droplets className="h-4 w-4" /> },
  { id: 'pneumatics', label: 'D. Pneumatics', short: 'Pneumatics', icon: <Wind className="h-4 w-4" /> },
  { id: 'mechanical', label: 'E. Mechanical Equipment', short: 'Mechanical', icon: <Gauge className="h-4 w-4" /> },
  { id: 'preventive_maintenance', label: 'F. Preventive Maintenance', short: 'Preventive Maint.', icon: <Wrench className="h-4 w-4" /> },
];

const SIM_OBJECTIVES: Record<SimulatorId, { title: string; objective: string; instructions: string }> = {
  motor_starter: {
    title: '3-Wire Magnetic Motor Starter Control Lab',
    objective: 'Operate a 120VAC/480V 3-wire motor starter circuit, test holding seal-in logic, and isolate common starter faults.',
    instructions: 'Close the main disconnect, press Start, observe contactor latch and motor RPM, then inject a fault and diagnose the failed component.',
  },
  plc_ladder: {
    title: 'PLC Ladder Logic, Timers & Counters Lab',
    objective: 'Trace real-time ladder rung continuity across discrete inputs, seal-in branches, TON timers, and CTU counters.',
    instructions: 'Switch between Beginner (Seal-In) and Advanced (Jam Timer + Counter) modes. Toggle inputs and inject a fault to identify the failure.',
  },
  hydraulics: {
    title: 'Hydraulic Pump, 4/3 Valve & Cylinder Lab',
    objective: 'Explore how pump flow (GPM), load pressure (PSI), and relief settings interact during cylinder extension/retraction.',
    instructions: 'Turn on the hydraulic pump, shift the 4/3 valve lever, vary load/relief sliders, and isolate injected hydraulic faults.',
  },
  pneumatics: {
    title: 'Pneumatic FRL, 5/2 Solenoid & Actuator Lab',
    objective: 'Control regulated plant air through an FRL, 5/2 solenoid valve, and meter-out speed control to diagnose pressure/exhaust faults.',
    instructions: 'Open air supply, tune regulator PSI and meter-out flow, fire the solenoid, and diagnose any injected fault.',
  },
  mechanical: {
    title: 'Shaft Alignment, Belt Tension & Bearing Diagnostics Lab',
    objective: 'Correlate shaft misalignment, belt tension, and lubrication state with vibration RMS, bearing temperature, and speed loss.',
    instructions: 'Start the drive motor, adjust alignment/tension/lubrication controls or inject a fault, and diagnose the mechanical condition.',
  },
  preventive_maintenance: {
    title: 'Virtual Equipment Inspection & CMMS Work Order Lab',
    objective: 'Inspect an industrial pump & conveyor skid systematically, flag abnormal conditions, and submit a complete CMMS work order.',
    instructions: 'Click all 8 inspection checkpoints on the skid diagram, flag every defect, and complete the work-order closeout report.',
  },
};

export const SimulatorsLabView: React.FC<SimulatorsLabViewProps> = ({
  initialSimulatorId = 'motor_starter',
  onOpenMentor,
}) => {
  const { state, recordSimulationAttempt } = useMaintenanceStore();
  const soundOn = state.profile.soundEnabled;

  const [activeSim, setActiveSim] = useState<SimulatorId>(initialSimulatorId);

  useEffect(() => {
    setActiveSim(initialSimulatorId);
  }, [initialSimulatorId]);

  // ===== SIM A: MOTOR STARTER =====
  const [msDisconnect, setMsDisconnect] = useState(true);
  const [msStartHeld, setMsStartHeld] = useState(false);
  const [msLatched, setMsLatched] = useState(false);
  const [msFault, setMsFault] = useState<'none' | 'broken_seal' | 'ol_tripped' | 'open_coil' | 'blown_fuse'>('none');
  const [msGuess, setMsGuess] = useState('');
  const [msResult, setMsResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const msControlPowerOk = msDisconnect && msFault !== 'blown_fuse';
  const msOverloadClosed = msFault !== 'ol_tripped';
  const msCoilHealthy = msFault !== 'open_coil';
  const msStartPath = msControlPowerOk && msStartHeld && msOverloadClosed && msCoilHealthy;
  const msSealPath = msControlPowerOk && msLatched && msFault !== 'broken_seal' && msOverloadClosed && msCoilHealthy;
  const msMotorRunning = msStartPath || msSealPath;
  const msMotorRpm = msMotorRunning ? 1750 : 0;
  const msAmps = msMotorRunning ? 6.4 : 0.0;

  function pressMsStart() {
    soundFx.relaySnap(soundOn);
    setMsStartHeld(true);
    if (msControlPowerOk && msOverloadClosed && msCoilHealthy) {
      if (msFault !== 'broken_seal') {
        setMsLatched(true);
      }
    } else {
      soundFx.fault(soundOn);
    }
  }

  function releaseMsStart() {
    setMsStartHeld(false);
    if (msFault === 'broken_seal') {
      setMsLatched(false);
    }
  }

  function pressMsStop() {
    soundFx.click(soundOn);
    setMsStartHeld(false);
    setMsLatched(false);
  }

  // ===== SIM B: PLC LADDER =====
  const [plcMode, setPlcMode] = useState<'beginner' | 'advanced'>('beginner');
  const [plcStartIn, setPlcStartIn] = useState(false); // I:0/0 NO
  const [plcStopIn, setPlcStopIn] = useState(true); // I:0/1 NC healthy
  const [plcPhotoeye, setPlcPhotoeye] = useState(false); // I:0/2
  const [plcResetIn, setPlcResetIn] = useState(false); // I:0/3
  const [plcLatchBit, setPlcLatchBit] = useState(false);
  const [plcTonAcc, setPlcTonAcc] = useState(0); // 0..30 (3.0s)
  const [plcCtuAcc, setPlcCtuAcc] = useState(0);
  const [plcPrevPe, setPlcPrevPe] = useState(false);
  const [plcFault, setPlcFault] = useState<'none' | 'stuck_pe' | 'open_stop_wire' | 'faulty_output'>('none');
  const [plcGuess, setPlcGuess] = useState('');
  const [plcResult, setPlcResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const effectiveStopBit = plcFault === 'open_stop_wire' ? false : plcStopIn;
  const effectivePeBit = plcFault === 'stuck_pe' ? true : plcPhotoeye;

  useEffect(() => {
    const id = window.setInterval(() => {
      setPlcLatchBit((prevLatch) => {
        const nextMotor = (plcStartIn || prevLatch) && effectiveStopBit;
        return nextMotor;
      });
      if (plcResetIn) {
        setPlcCtuAcc(0);
        setPlcTonAcc(0);
      } else {
        setPlcTonAcc((acc) => {
          if (effectivePeBit && plcLatchBit) {
            return Math.min(30, acc + 1);
          }
          return 0;
        });
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [plcStartIn, effectiveStopBit, effectivePeBit, plcResetIn, plcLatchBit]);

  useEffect(() => {
    if (effectivePeBit && !plcPrevPe && plcLatchBit) {
      setPlcCtuAcc((c) => c + 1);
    }
    setPlcPrevPe(effectivePeBit);
  }, [effectivePeBit, plcPrevPe, plcLatchBit]);

  const plcJamAlarm = plcTonAcc >= 30;
  const plcMotorOut = plcLatchBit && !plcJamAlarm && plcFault !== 'faulty_output';

  // ===== SIM C: HYDRAULICS =====
  const [hydPumpOn, setHydPumpOn] = useState(true);
  const [hydValve, setHydValve] = useState<'retract' | 'neutral' | 'extend'>('neutral');
  const [hydReliefPsi, setHydReliefPsi] = useState(2000);
  const [hydLoadLbs, setHydLoadLbs] = useState(900);
  const [hydCylinderPos, setHydCylinderPos] = useState(25); // 0..100
  const [hydFault, setHydFault] = useState<'none' | 'clogged_suction' | 'stuck_relief' | 'piston_bypass'>('none');
  const [hydGuess, setHydGuess] = useState('');
  const [hydResult, setHydResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const hydMaxFlow = !hydPumpOn ? 0 : hydFault === 'clogged_suction' ? 1.8 : 8.5;
  const hydComputedPsi = !hydPumpOn
    ? 0
    : hydFault === 'stuck_relief'
      ? 240
      : hydFault === 'clogged_suction'
        ? 380
        : hydValve === 'neutral'
          ? 120
          : Math.min(hydReliefPsi, Math.max(250, Math.round(hydLoadLbs * 0.95)));
  const hydOilTemp = !hydPumpOn ? 78 : hydFault === 'stuck_relief' || hydComputedPsi >= hydReliefPsi ? 168 : 124;

  useEffect(() => {
    if (!hydPumpOn || hydValve === 'neutral') return;
    const id = window.setInterval(() => {
      setHydCylinderPos((pos) => {
        if (hydFault === 'stuck_relief' || hydComputedPsi >= hydReliefPsi) return pos;
        const speed = hydFault === 'clogged_suction' ? 0.6 : hydFault === 'piston_bypass' ? 0.8 : 2.5;
        if (hydValve === 'extend') return Math.min(100, pos + speed);
        return Math.max(0, pos - speed * 1.3);
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [hydPumpOn, hydValve, hydFault, hydComputedPsi, hydReliefPsi]);

  // ===== SIM D: PNEUMATICS =====
  const [pneuSupplyOn, setPneuSupplyOn] = useState(true);
  const [pneuRegPsi, setPneuRegPsi] = useState(85);
  const [pneuSolenoid, setPneuSolenoid] = useState(false);
  const [pneuFlowPct, setPneuFlowPct] = useState(70);
  const [pneuPos, setPneuPos] = useState(0);
  const [pneuFault, setPneuFault] = useState<'none' | 'clogged_muffler' | 'air_leak' | 'clogged_filter'>('none');
  const [pneuGuess, setPneuGuess] = useState('');
  const [pneuResult, setPneuResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const pneuEffectivePsi = !pneuSupplyOn
    ? 0
    : pneuFault === 'air_leak'
      ? Math.round(pneuRegPsi * 0.45)
      : pneuFault === 'clogged_filter'
        ? Math.round(pneuRegPsi * 0.55)
        : pneuRegPsi;

  useEffect(() => {
    if (!pneuSupplyOn) return;
    const id = window.setInterval(() => {
      setPneuPos((p) => {
        const step =
          pneuFault === 'clogged_muffler'
            ? 0.5
            : pneuFault === 'air_leak'
              ? 1.2
              : Math.max(1, pneuFlowPct / 15);
        if (pneuSolenoid) return Math.min(100, p + step);
        return Math.max(0, p - step);
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [pneuSupplyOn, pneuSolenoid, pneuFlowPct, pneuFault]);

  // ===== SIM E: MECHANICAL =====
  const [mechRunning, setMechRunning] = useState(true);
  const [mechMisalignMm, setMechMisalignMm] = useState(0.04);
  const [mechBeltTension, setMechBeltTension] = useState(85);
  const [mechLube, setMechLube] = useState<'optimal' | 'dry' | 'overgreased'>('optimal');
  const [mechFault, setMechFault] = useState<'none' | 'misalignment' | 'belt_slip' | 'dry_bearing'>('none');
  const [mechGuess, setMechGuess] = useState('');
  const [mechResult, setMechResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const effMisalign = mechFault === 'misalignment' ? 0.38 : mechMisalignMm;
  const effTension = mechFault === 'belt_slip' ? 35 : mechBeltTension;
  const effLube = mechFault === 'dry_bearing' ? 'dry' : mechLube;

  const mechVibRms = !mechRunning
    ? 0.0
    : Number(
        (
          0.9 +
          effMisalign * 18 +
          (effLube === 'dry' ? 4.4 : effLube === 'overgreased' ? 1.5 : 0) +
          (effTension < 55 ? 1.2 : 0)
        ).toFixed(1)
      );
  const mechTempF = !mechRunning
    ? 74
    : Math.round(
        112 +
          effMisalign * 95 +
          (effLube === 'dry' ? 58 : effLube === 'overgreased' ? 34 : 0)
      );
  const mechDrivenRpm = !mechRunning ? 0 : effTension < 55 ? Math.round(1750 * 0.72) : 1750;

  // ===== SIM F: PREVENTIVE MAINTENANCE =====
  const PM_HOTSPOTS = [
    { id: 'pm-1', label: '1. Suction Strainer Gauge', reading: '12 inHg Vacuum (High)', isDefect: true, x: 75, y: 120 },
    { id: 'pm-2', label: '2. Motor Coupling Guard', reading: 'Secure · All Bolts Tight', isDefect: false, x: 185, y: 95 },
    { id: 'pm-3', label: '3. Gearbox Sight Glass', reading: 'Milky Water-Contaminated Oil', isDefect: true, x: 265, y: 120 },
    { id: 'pm-4', label: '4. FRL Filter Bowl', reading: 'Condensate Full to Red Line', isDefect: true, x: 365, y: 80 },
    { id: 'pm-5', label: '5. Drive-End Bearing (IR)', reading: '119°F Nominal', isDefect: false, x: 150, y: 65 },
    { id: 'pm-6', label: '6. V-Belt Guard & Tension', reading: 'Black Rubber Dust Below Sheave', isDefect: true, x: 315, y: 145 },
    { id: 'pm-7', label: '7. E-Stop Station', reading: 'Intact · Clear Access', isDefect: false, x: 415, y: 130 },
    { id: 'pm-8', label: '8. Hydraulic Hose Crimps', reading: 'Dry · No Seepage', isDefect: false, x: 115, y: 155 },
  ];
  const [pmInspected, setPmInspected] = useState<string[]>([]);
  const [pmFlagged, setPmFlagged] = useState<string[]>([]);
  const [pmWorkOrderNote, setPmWorkOrderNote] = useState('');
  const [pmSelectedId, setPmSelectedId] = useState<string>('pm-1');
  const [pmResult, setPmResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function getLiveSimContextSummary(): string {
    switch (activeSim) {
      case 'motor_starter':
        return `Motor Starter: Disconnect=${msDisconnect}, Fault=${msFault}, Running=${msMotorRunning}, RPM=${msMotorRpm}, Amps=${msAmps}`;
      case 'plc_ladder':
        return `PLC Ladder (${plcMode}): I:0/0 Start=${plcStartIn}, I:0/1 Stop=${effectiveStopBit}, I:0/2 PE=${effectivePeBit}, TON=${(plcTonAcc / 10).toFixed(1)}s, CTU=${plcCtuAcc}, Fault=${plcFault}`;
      case 'hydraulics':
        return `Hydraulics: Pump=${hydPumpOn}, Valve=${hydValve}, PSI=${hydComputedPsi}, Flow=${hydMaxFlow} GPM, Cyl=${hydCylinderPos.toFixed(0)}%, Temp=${hydOilTemp}F, Fault=${hydFault}`;
      case 'pneumatics':
        return `Pneumatics: Supply=${pneuSupplyOn}, EffPSI=${pneuEffectivePsi}, Solenoid=${pneuSolenoid}, Pos=${pneuPos.toFixed(0)}%, Fault=${pneuFault}`;
      case 'mechanical':
        return `Mechanical: Run=${mechRunning}, Misalign=${effMisalign}mm, Tension=${effTension}%, Lube=${effLube}, Vib=${mechVibRms}mm/s, Temp=${mechTempF}F, Fault=${mechFault}`;
      case 'preventive_maintenance':
        return `PM Inspection: Inspected ${pmInspected.length}/8 checkpoints, Flagged ${pmFlagged.length} defects.`;
    }
  }

  function handleCheckMotorDiag() {
    const map: Record<string, string> = {
      broken_seal: 'Open seal-in auxiliary contact / wire',
      ol_tripped: 'Tripped thermal overload relay (95-96 open)',
      open_coil: 'Open 120VAC contactor holding coil',
      blown_fuse: 'Blown control power fuse',
    };
    if (msFault === 'none') {
      setMsResult({ ok: false, msg: 'Inject a fault from the Fault Injector first, then test controls to diagnose it!' });
      return;
    }
    const ok = msGuess === msFault;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'motor_starter',
      simulatorName: 'Electrical Motor Starter',
      scenarioKey: msFault,
      scenarioTitle: map[msFault] || msFault,
      faultDiagnosed: map[msGuess] || msGuess || 'None',
      correct: ok,
      scorePercent: ok ? 100 : 40,
    });
    setMsResult({
      ok,
      msg: ok
        ? `Correct diagnosis! ${map[msFault]} confirmed (+75 XP if first completion).`
        : 'Mismatch — observe whether the motor runs only while Start is held, or if control power / overload trips.',
    });
  }

  function handleCheckPlcDiag() {
    if (plcFault === 'none') {
      setPlcResult({ ok: false, msg: 'Select an active PLC fault scenario first, then toggle inputs to isolate it.' });
      return;
    }
    const ok = plcGuess === plcFault;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'plc_ladder',
      simulatorName: 'PLC Ladder Logic',
      scenarioKey: `${plcMode}:${plcFault}`,
      scenarioTitle: `${plcMode} · ${plcFault}`,
      faultDiagnosed: plcGuess || 'None',
      correct: ok,
      scorePercent: ok ? 100 : 40,
    });
    setPlcResult({
      ok,
      msg: ok
        ? 'Correct PLC fault isolation! Your input/output half-split diagnosis is logged.'
        : 'Not quite — compare physical input states against the ladder rung power rails and output bit.',
    });
  }

  function handleCheckHydDiag() {
    if (hydFault === 'none') {
      setHydResult({ ok: false, msg: 'Inject a hydraulic fault first to run a diagnostic check.' });
      return;
    }
    const ok = hydGuess === hydFault;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'hydraulics',
      simulatorName: 'Hydraulics Lab',
      scenarioKey: hydFault,
      scenarioTitle: hydFault,
      faultDiagnosed: hydGuess || 'None',
      correct: ok,
      scorePercent: ok ? 100 : 40,
    });
    setHydResult({
      ok,
      msg: ok
        ? 'Accurate hydraulic diagnosis! Flow, pressure, and oil temperature telemetry match your finding.'
        : 'Check pressure vs. flow GPM and oil temperature clues carefully.',
    });
  }

  function handleCheckPneuDiag() {
    if (pneuFault === 'none') {
      setPneuResult({ ok: false, msg: 'Inject a pneumatic fault first to run a diagnostic check.' });
      return;
    }
    const ok = pneuGuess === pneuFault;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'pneumatics',
      simulatorName: 'Pneumatics Lab',
      scenarioKey: pneuFault,
      scenarioTitle: pneuFault,
      faultDiagnosed: pneuGuess || 'None',
      correct: ok,
      scorePercent: ok ? 100 : 40,
    });
    setPneuResult({
      ok,
      msg: ok
        ? 'Correct pneumatic diagnosis! Supply gauge vs. actuator travel speed isolated the issue.'
        : 'Compare effective PSI against slow-moving cylinder travel to separate supply loss from clogged exhaust.',
    });
  }

  function handleCheckMechDiag() {
    const activeFault =
      mechFault !== 'none'
        ? mechFault
        : effMisalign >= 0.2
          ? 'misalignment'
          : effTension < 55
            ? 'belt_slip'
            : effLube === 'dry'
              ? 'dry_bearing'
              : 'none';
    if (activeFault === 'none') {
      setMechResult({ ok: false, msg: 'Inject a mechanical fault or adjust sliders into a fault condition first.' });
      return;
    }
    const ok = mechGuess === activeFault;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'mechanical',
      simulatorName: 'Mechanical Equipment Lab',
      scenarioKey: activeFault,
      scenarioTitle: activeFault,
      faultDiagnosed: mechGuess || 'None',
      correct: ok,
      scorePercent: ok ? 100 : 40,
    });
    setMechResult({
      ok,
      msg: ok
        ? 'Correct mechanical diagnosis! Vibration, temperature, and driven RPM confirm the fault.'
        : 'Check driven RPM (belt slip), vibration RMS, and bearing temperature together.',
    });
  }

  function handleSubmitPmInspection(e: React.FormEvent) {
    e.preventDefault();
    const trueDefects = PM_HOTSPOTS.filter((h) => h.isDefect).map((h) => h.id).sort();
    const userDefects = [...pmFlagged].sort();
    const exact =
      trueDefects.length === userDefects.length &&
      trueDefects.every((id, idx) => id === userDefects[idx]);
    const ok = exact && pmInspected.length === PM_HOTSPOTS.length && pmWorkOrderNote.trim().length >= 15;
    if (ok) soundFx.success(soundOn);
    else soundFx.fault(soundOn);
    recordSimulationAttempt({
      simulatorId: 'preventive_maintenance',
      simulatorName: 'Preventive Maintenance Lab',
      scenarioKey: 'skid_p204_pm',
      scenarioTitle: 'Skid P-204 Walkdown & CMMS Work Order',
      faultDiagnosed: `${pmFlagged.length} flagged defects`,
      correct: ok,
      scorePercent: ok ? 100 : 55,
    });
    setPmResult({
      ok,
      msg: ok
        ? 'PM Inspection & CMMS Work Order passed! All 4 hidden defects flagged and documented.'
        : `Inspect all 8 points (${pmInspected.length}/8), flag only the 4 real defects (${pmFlagged.length} flagged), and enter a descriptive CMMS closeout note.`,
    });
  }

  const obj = SIM_OBJECTIVES[activeSim];

  return (
    <div className="space-y-6">
      {/* Mandatory Safety Disclaimer Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <div className="font-bold">Simulated Desk Training — Safety Boundary</div>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900">
            All equipment labs are virtual simulations. Never perform live electrical measurements, defeat interlocks/guards, or service energized plant machinery without formal authorization, site Lockout/Tagout (LOTO) verification, proper PPE, and qualified supervision.
          </p>
        </div>
      </div>

      {/* 6 Simulator Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
        {SIM_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              soundFx.click(soundOn);
              setActiveSim(tab.id);
            }}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              activeSim === tab.id
                ? 'bg-slate-900 text-yellow-400'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Objective + Instructions Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">{obj.title}</h2>
          <p className="mt-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Objective: </span>
            {obj.objective}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Instructions: </span>
            {obj.instructions}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onOpenMentor(
              `I am working in the ${obj.title}. Give me a coaching hint based on my live readings without spoiling the exact fault.`,
              getLiveSimContextSummary()
            )
          }
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
        >
          <Bot className="h-4 w-4 text-emerald-700" />
          <span>Get Simulator Hint</span>
        </button>
      </div>

      {/* ================= SIMULATOR A: MOTOR STARTER ================= */}
      {activeSim === 'motor_starter' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Live 120VAC Control &amp; 480V Motor Schematic</span>
              <span className={`font-mono text-xs font-bold ${msMotorRunning ? 'text-emerald-400' : msFault === 'ol_tripped' ? 'text-rose-400' : 'text-yellow-400'}`}>
                {msMotorRunning ? 'RUNNING · 1750 RPM' : msFault === 'ol_tripped' ? 'FAULT · OL TRIPPED' : 'STOPPED'}
              </span>
            </div>

            <svg viewBox="0 0 500 220" className="mt-4 w-full" role="img" aria-label="3-wire motor starter control schematic">
              {/* Power Rails */}
              <line x1="30" y1="25" x2="30" y2="195" stroke={msControlPowerOk ? '#facc15' : '#475569'} strokeWidth="4" />
              <line x1="460" y1="25" x2="460" y2="195" stroke="#64748b" strokeWidth="4" />
              <text x="18" y="18" fill="#cbd5e1" fontSize="11" fontFamily="monospace">L1</text>
              <text x="452" y="18" fill="#cbd5e1" fontSize="11" fontFamily="monospace">L2</text>

              {/* Main Rung */}
              <line x1="30" y1="70" x2="110" y2="70" stroke={msControlPowerOk ? '#facc15' : '#475569'} strokeWidth="3" />
              {/* Stop NC */}
              <rect x="110" y="55" width="60" height="30" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              <text x="140" y="74" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">STOP NC</text>
              <line x1="170" y1="70" x2="210" y2="70" stroke={msControlPowerOk ? '#facc15' : '#475569'} strokeWidth="3" />

              {/* Start NO */}
              <rect x="210" y="55" width="66" height="30" rx="4" fill={msStartHeld ? '#15803d' : '#1e293b'} stroke={msStartHeld ? '#4ade80' : '#94a3b8'} strokeWidth="2" />
              <text x="243" y="74" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">START NO</text>

              {/* Seal-In Parallel Branch */}
              <polyline
                points="190,70 190,125 210,125"
                fill="none"
                stroke={msControlPowerOk ? '#facc15' : '#475569'}
                strokeWidth="2.5"
                className={msSealPath ? 'animate-flow-fast' : ''}
              />
              <rect
                x="210"
                y="110"
                width="66"
                height="30"
                rx="4"
                fill={msSealPath ? '#15803d' : '#1e293b'}
                stroke={msFault === 'broken_seal' ? '#ef4444' : msSealPath ? '#4ade80' : '#94a3b8'}
                strokeWidth="2"
              />
              <text x="243" y="129" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">
                {msFault === 'broken_seal' ? 'M1 AUX OPEN' : 'M1 SEAL-IN'}
              </text>
              <polyline
                points="276,125 295,125 295,70"
                fill="none"
                stroke={msSealPath ? '#4ade80' : '#475569'}
                strokeWidth="2.5"
                className={msSealPath ? 'animate-flow-fast' : ''}
              />

              {/* Line to Coil */}
              <line
                x1="276"
                y1="70"
                x2="320"
                y2="70"
                stroke={msMotorRunning ? '#4ade80' : '#475569'}
                strokeWidth="3"
                className={msMotorRunning ? 'animate-flow-fast' : ''}
              />
              {/* M1 Coil */}
              <circle cx="345" cy="70" r="22" fill={msMotorRunning ? '#065f46' : '#1e293b'} stroke={msFault === 'open_coil' ? '#ef4444' : msMotorRunning ? '#34d399' : '#94a3b8'} strokeWidth="2.5" />
              <text x="345" y="74" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">M1</text>

              {/* Overload NC */}
              <line
                x1="367"
                y1="70"
                x2="395"
                y2="70"
                stroke={msMotorRunning ? '#4ade80' : '#475569'}
                strokeWidth="3"
                className={msMotorRunning ? 'animate-flow-fast' : ''}
              />
              <rect x="395" y="55" width="45" height="30" rx="4" fill={msOverloadClosed ? '#1e293b' : '#7f1d1d'} stroke={msOverloadClosed ? '#94a3b8' : '#ef4444'} strokeWidth="2" />
              <text x="417" y="74" textAnchor="middle" fill="#ffffff" fontSize="10" fontFamily="monospace">
                {msOverloadClosed ? 'OL NC' : 'OL TRIP'}
              </text>
              <line
                x1="440"
                y1="70"
                x2="460"
                y2="70"
                stroke={msMotorRunning ? '#4ade80' : '#475569'}
                strokeWidth="3"
                className={msMotorRunning ? 'animate-flow-fast' : ''}
              />

              {/* Virtual 3-Phase Motor */}
              <rect x="175" y="158" width="150" height="44" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="2" />
              <circle cx="205" cy="180" r="14" fill="#1e293b" stroke={msMotorRunning ? '#34d399' : '#64748b'} strokeWidth="2" />
              <g className={msMotorRunning ? 'animate-spin-svg' : ''}>
                <line x1="197" y1="180" x2="213" y2="180" stroke={msMotorRunning ? '#facc15' : '#64748b'} strokeWidth="3" />
                <line x1="205" y1="172" x2="205" y2="188" stroke={msMotorRunning ? '#facc15' : '#64748b'} strokeWidth="2" />
              </g>
              <text x="265" y="177" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">3-PH MOTOR</text>
              <text x="265" y="192" textAnchor="middle" fill={msMotorRunning ? '#34d399' : '#94a3b8'} fontSize="10" fontFamily="monospace">
                {msMotorRpm} RPM · {msAmps.toFixed(1)}A
              </text>
            </svg>

            {/* Telemetry Bar */}
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 font-mono text-xs tabular-nums">
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Control Supply</div>
                <div className="mt-1 text-sm font-bold text-yellow-400">
                  {msControlPowerOk ? '120.2 VAC' : '0.0 VAC'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">OL Relay (95-96)</div>
                <div className="mt-1 text-sm font-bold text-white">
                  {msOverloadClosed ? 'CLOSED' : 'OPEN (TRIP)'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Motor Current</div>
                <div className="mt-1 text-sm font-bold text-emerald-400">
                  {msAmps.toFixed(1)} A
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h3 className="font-display text-base font-bold text-slate-900">Operator &amp; Fault Controls</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onMouseDown={pressMsStart}
                onMouseUp={releaseMsStart}
                onMouseLeave={releaseMsStart}
                onTouchStart={pressMsStart}
                onTouchEnd={releaseMsStart}
                className="min-h-[48px] rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 active:scale-[0.98]"
              >
                Hold START
              </button>
              <button
                type="button"
                onClick={pressMsStop}
                className="min-h-[48px] rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-800"
              >
                STOP
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.click(soundOn);
                  setMsDisconnect((d) => !d);
                  setMsLatched(false);
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  msDisconnect ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                Disconnect: {msDisconnect ? 'ON' : 'OFF (LOTO)'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.click(soundOn);
                  setMsFault('none');
                  setMsLatched(false);
                  setMsDisconnect(true);
                  setMsResult(null);
                  setMsGuess('');
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Inject Simulated Fault</label>
              <select
                value={msFault}
                onChange={(e) => {
                  setMsFault(e.target.value as typeof msFault);
                  setMsLatched(false);
                  setMsResult(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="none">None (Healthy Circuit)</option>
                <option value="broken_seal">Fault 1: Open Seal-In Wire</option>
                <option value="ol_tripped">Fault 2: Tripped Overload Relay</option>
                <option value="open_coil">Fault 3: Open Contactor Coil</option>
                <option value="blown_fuse">Fault 4: Blown Control Fuse</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Diagnostic Verification (+75 XP)</label>
              <select
                value={msGuess}
                onChange={(e) => setMsGuess(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select diagnosed fault...</option>
                <option value="broken_seal">Open Seal-In Auxiliary Contact / Wire</option>
                <option value="ol_tripped">Tripped Thermal Overload Relay (95-96 Open)</option>
                <option value="open_coil">Failed Open Contactor Holding Coil</option>
                <option value="blown_fuse">Blown Control Power Fuse (0 VAC)</option>
              </select>
              <button
                type="button"
                onClick={handleCheckMotorDiag}
                className="mt-2.5 w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Submit Diagnosis
              </button>
              {msResult && (
                <div className={`mt-2.5 rounded-lg p-3 text-xs font-medium ${msResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {msResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATOR B: PLC LADDER ================= */}
      {activeSim === 'plc_ladder' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => setPlcMode('beginner')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${plcMode === 'beginner' ? 'bg-yellow-400 text-slate-950' : 'text-slate-300'}`}
                >
                  Beginner: Seal-In
                </button>
                <button
                  type="button"
                  onClick={() => setPlcMode('advanced')}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${plcMode === 'advanced' ? 'bg-yellow-400 text-slate-950' : 'text-slate-300'}`}
                >
                  Advanced: TON + CTU
                </button>
              </div>
              <span className="font-mono text-xs text-emerald-400 tabular-nums">
                RUN MODE · SCAN 4ms
              </span>
            </div>

            {/* Live Ladder Rungs */}
            <div className="mt-4 space-y-4 font-mono text-xs">
              {/* Rung 0 */}
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <div className="text-slate-400">Rung 000 · Conveyor Seal-In Control</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-1 ${plcStartIn ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    [XIC I:0/0 Start={plcStartIn ? '1' : '0'}]
                  </span>
                  <span className="text-slate-500">OR</span>
                  <span className={`rounded px-2 py-1 ${plcLatchBit ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                    [XIC O:0/0 Seal={plcLatchBit ? '1' : '0'}]
                  </span>
                  <span className="text-slate-500">—</span>
                  <span className={`rounded px-2 py-1 ${effectiveStopBit ? 'bg-emerald-700 text-white' : 'bg-rose-800 text-white'}`}>
                    [XIC I:0/1 StopNC={effectiveStopBit ? '1' : '0'}]
                  </span>
                  <span className="text-slate-500">—</span>
                  <span className={`rounded px-2 py-1 ${!plcJamAlarm ? 'bg-emerald-700 text-white' : 'bg-rose-800 text-white'}`}>
                    [XIO T4:0.DN={plcJamAlarm ? '1' : '0'}]
                  </span>
                  <span className="text-slate-500">—&gt;</span>
                  <span className={`rounded px-2.5 py-1 font-bold ${plcMotorOut ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                    (OTE O:0/0 Motor={plcMotorOut ? 'ON' : 'OFF'})
                  </span>
                </div>
              </div>

              {/* Rung 1 & 2 */}
              {plcMode === 'advanced' && (
                <>
                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="text-slate-400">Rung 001 · Carton Jam On-Delay Timer (TON)</div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded px-2 py-1 ${effectivePeBit && plcLatchBit ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                        [XIC I:0/2 Photoeye={effectivePeBit ? '1' : '0'}]
                      </span>
                      <span className="text-yellow-400 tabular-nums">
                        TON T4:0 · PRE: 3.0s · ACC: {(plcTonAcc / 10).toFixed(1)}s · DN={plcJamAlarm ? '1' : '0'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                    <div className="text-slate-400">Rung 002 · Case Counter (CTU)</div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-200">Counts rising edge of Photoeye I:0/2</span>
                      <span className="text-emerald-400 tabular-nums">
                        CTU C5:0 · PRE: 5 · ACC: {plcCtuAcc} {plcCtuAcc >= 5 ? '(DONE)' : ''}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h3 className="font-display text-base font-bold text-slate-900">Physical Field Inputs &amp; Faults</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { soundFx.click(soundOn); setPlcStartIn((v) => !v); }}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold ${plcStartIn ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-800'}`}
              >
                I:0/0 Start PB: {plcStartIn ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => { soundFx.click(soundOn); setPlcStopIn((v) => !v); }}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold ${plcStopIn ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-500 bg-rose-600 text-white'}`}
              >
                I:0/1 Stop NC: {plcStopIn ? 'HEALTHY' : 'PRESSED'}
              </button>
              <button
                type="button"
                onClick={() => { soundFx.click(soundOn); setPlcPhotoeye((v) => !v); }}
                className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold ${plcPhotoeye ? 'border-amber-500 bg-yellow-400 text-slate-950' : 'border-slate-300 bg-slate-50 text-slate-800'}`}
              >
                I:0/2 Photoeye: {plcPhotoeye ? 'BLOCKED' : 'CLEAR'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.click(soundOn);
                  setPlcResetIn(true);
                  setTimeout(() => setPlcResetIn(false), 250);
                }}
                className="min-h-[44px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                I:0/3 Reset Timer/Cnt
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Inject PLC Field Fault</label>
                <button
                  type="button"
                  onClick={() => {
                    setPlcFault('none');
                    setPlcStartIn(false);
                    setPlcStopIn(true);
                    setPlcPhotoeye(false);
                    setPlcLatchBit(false);
                    setPlcTonAcc(0);
                    setPlcCtuAcc(0);
                    setPlcResult(null);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:underline"
                >
                  Reset PLC
                </button>
              </div>
              <select
                value={plcFault}
                onChange={(e) => {
                  setPlcFault(e.target.value as typeof plcFault);
                  setPlcResult(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="none">None (Healthy I/O)</option>
                <option value="stuck_pe">Fault 1: Photoeye I:0/2 Stuck Blocked</option>
                <option value="open_stop_wire">Fault 2: Broken Wire on NC Stop I:0/1</option>
                <option value="faulty_output">Fault 3: Blown Output Card Fuse O:0/0</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Diagnose Active PLC Fault (+75 XP)</label>
              <select
                value={plcGuess}
                onChange={(e) => setPlcGuess(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Choose diagnosed fault...</option>
                <option value="stuck_pe">Blocked/Faulty Photoeye I:0/2 triggering Jam Timer</option>
                <option value="open_stop_wire">Open Field Wire on Fail-Safe Stop I:0/1</option>
                <option value="faulty_output">PLC Logic True, Field Output O:0/0 Open</option>
              </select>
              <button
                type="button"
                onClick={handleCheckPlcDiag}
                className="mt-2.5 w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Verify PLC Diagnosis
              </button>
              {plcResult && (
                <div className={`mt-2.5 rounded-lg p-3 text-xs font-medium ${plcResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {plcResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATOR C: HYDRAULICS ================= */}
      {activeSim === 'hydraulics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Hydraulic Power Unit &amp; 4/3 Actuator Stage</span>
              <span className="font-mono text-xs font-bold text-yellow-400 tabular-nums">
                {hydComputedPsi} PSI · {hydMaxFlow.toFixed(1)} GPM · {hydOilTemp}°F
              </span>
            </div>

            <svg viewBox="0 0 480 210" className="mt-4 w-full" role="img" aria-label="Hydraulic pump, directional valve, and double-acting cylinder">
              {/* Reservoir */}
              <rect x="25" y="135" width="90" height="55" rx="6" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <rect x="29" y="155" width="82" height="31" fill="#b45309" opacity="0.6" />
              <text x="70" y="175" textAnchor="middle" fill="#fef3c7" fontSize="10" fontFamily="monospace">RESERVOIR</text>

              {/* Pump */}
              <g className={hydPumpOn && hydFault === 'clogged_suction' ? 'animate-vib-shake' : ''}>
                <circle cx="155" cy="155" r="22" fill={hydPumpOn ? '#065f46' : '#1e293b'} stroke={hydFault === 'clogged_suction' ? '#ef4444' : '#34d399'} strokeWidth="2.5" />
                <g className={hydPumpOn ? (hydFault === 'clogged_suction' ? 'animate-spin-svg-slow' : 'animate-spin-svg') : ''} opacity="0.45">
                  <line x1="142" y1="155" x2="168" y2="155" stroke="#a7f3d0" strokeWidth="2" />
                  <line x1="155" y1="142" x2="155" y2="168" stroke="#a7f3d0" strokeWidth="2" />
                </g>
                <text x="155" y="159" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">PUMP</text>
              </g>
              <line
                x1="115"
                y1="155"
                x2="133"
                y2="155"
                stroke={hydFault === 'clogged_suction' ? '#ef4444' : '#fbbf24'}
                strokeWidth="4"
                className={hydPumpOn ? (hydFault === 'clogged_suction' ? 'animate-flow-slow' : 'animate-flow-fast') : ''}
              />

              {/* Pressure Line to 4/3 Valve */}
              <polyline
                points="155,133 155,95 205,95"
                fill="none"
                stroke={hydPumpOn ? '#f59e0b' : '#475569'}
                strokeWidth="4"
                className={hydPumpOn ? (hydFault === 'stuck_relief' ? 'animate-flow-slow' : 'animate-flow-fast') : ''}
              />
              <line
                x1="300"
                y1="95"
                x2="330"
                y2="95"
                stroke={hydPumpOn && hydValve !== 'neutral' ? '#38bdf8' : '#475569'}
                strokeWidth="3.5"
                className={hydPumpOn && hydValve !== 'neutral' ? 'animate-flow-fast' : ''}
              />
              <rect x="205" y="70" width="95" height="50" rx="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              <text x="252" y="92" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">4/3 DCV</text>
              <text x="252" y="108" textAnchor="middle" fill="#facc15" fontSize="10" fontFamily="monospace">{hydValve.toUpperCase()}</text>

              {/* Cylinder Barrel */}
              <rect x="330" y="65" width="110" height="60" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              {/* Piston + Rod */}
              <rect x={334 + hydCylinderPos * 0.65} y="69" width="12" height="52" fill="#38bdf8" className="transition-all duration-100" />
              <rect x={346 + hydCylinderPos * 0.65} y="89" width="115" height="12" fill="#cbd5e1" className="transition-all duration-100" />
              <text x="385" y="148" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                STROKE: {hydCylinderPos.toFixed(0)}%
              </text>
            </svg>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 font-mono text-xs tabular-nums">
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">System Pressure</div>
                <div className="mt-1 text-sm font-bold text-yellow-400">{hydComputedPsi} PSI</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Pump Flow</div>
                <div className="mt-1 text-sm font-bold text-emerald-400">{hydMaxFlow.toFixed(1)} GPM</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Sump Temp</div>
                <div className="mt-1 text-sm font-bold text-white">{hydOilTemp}°F</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">HPU Controls</h3>
              <button
                type="button"
                onClick={() => { soundFx.click(soundOn); setHydPumpOn((p) => !p); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${hydPumpOn ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-800'}`}
              >
                Pump: {hydPumpOn ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['retract', 'neutral', 'extend'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => { soundFx.click(soundOn); setHydValve(pos); }}
                  className={`min-h-[42px] rounded-lg border text-xs font-bold capitalize ${
                    hydValve === pos ? 'border-slate-900 bg-slate-900 text-yellow-400' : 'border-slate-300 bg-slate-50 text-slate-800'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Relief Valve Setting</span>
                <span className="font-mono tabular-nums">{hydReliefPsi} PSI</span>
              </div>
              <input type="range" min={800} max={2500} step={50} value={hydReliefPsi} onChange={(e) => setHydReliefPsi(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Workpiece Load Resistance</span>
                <span className="font-mono tabular-nums">{hydLoadLbs} lbs</span>
              </div>
              <input type="range" min={200} max={2400} step={50} value={hydLoadLbs} onChange={(e) => setHydLoadLbs(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Inject Hydraulic Fault</label>
                <button type="button" onClick={() => { setHydFault('none'); setHydCylinderPos(25); setHydResult(null); }} className="text-xs font-semibold text-slate-600 hover:underline">Reset</button>
              </div>
              <select
                value={hydFault}
                onChange={(e) => { setHydFault(e.target.value as typeof hydFault); setHydResult(null); }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="none">None (Healthy Circuit)</option>
                <option value="clogged_suction">Fault 1: Clogged Suction Strainer (Cavitation)</option>
                <option value="stuck_relief">Fault 2: Stuck Open Relief Valve</option>
                <option value="piston_bypass">Fault 3: Internal Piston Seal Bypass</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <select value={hydGuess} onChange={(e) => setHydGuess(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">Diagnose hydraulic fault (+75 XP)...</option>
                <option value="clogged_suction">Clogged Suction Strainer Causing Cavitation</option>
                <option value="stuck_relief">Relief Valve Stuck Open Dumping Flow to Tank</option>
                <option value="piston_bypass">Worn Internal Cylinder Piston Seal</option>
              </select>
              <button type="button" onClick={handleCheckHydDiag} className="mt-2 w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Submit Hydraulic Diagnosis
              </button>
              {hydResult && (
                <div className={`mt-2 rounded-lg p-3 text-xs font-medium ${hydResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {hydResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATOR D: PNEUMATICS ================= */}
      {activeSim === 'pneumatics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">FRL Conditioning, 5/2 Solenoid &amp; Air Cylinder</span>
              <span className="font-mono text-xs font-bold text-sky-400 tabular-nums">
                Effective: {pneuEffectivePsi} PSI · Stroke: {pneuPos.toFixed(0)}%
              </span>
            </div>

            <svg viewBox="0 0 480 190" className="mt-4 w-full" role="img" aria-label="Pneumatic FRL, 5/2 valve, and double-acting cylinder">
              <rect x="25" y="65" width="90" height="55" rx="6" fill="#1e293b" stroke={pneuFault === 'clogged_filter' ? '#ef4444' : '#38bdf8'} strokeWidth="2" />
              <text x="70" y="90" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">F-R-L</text>
              <text x="70" y="106" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace">{pneuEffectivePsi} PSI</text>

              <line
                x1="115"
                y1="92"
                x2="175"
                y2="92"
                stroke={pneuSupplyOn ? '#38bdf8' : '#475569'}
                strokeWidth="4"
                className={pneuSupplyOn ? (pneuFault === 'clogged_filter' ? 'animate-flow-slow' : 'animate-flow-fast') : ''}
              />
              <line
                x1="270"
                y1="92"
                x2="310"
                y2="92"
                stroke={pneuSupplyOn && pneuSolenoid ? '#38bdf8' : '#475569'}
                strokeWidth="3.5"
                className={pneuSupplyOn && pneuSolenoid ? 'animate-flow-fast' : ''}
              />

              <rect x="175" y="65" width="95" height="55" rx="6" fill={pneuSolenoid ? '#0369a1' : '#1e293b'} stroke={pneuFault === 'clogged_muffler' ? '#ef4444' : '#94a3b8'} strokeWidth="2" />
              <text x="222" y="90" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">5/2 VALVE</text>
              <text x="222" y="106" textAnchor="middle" fill="#e0f2fe" fontSize="10" fontFamily="monospace">
                {pneuSolenoid ? 'SOL ENERGIZED' : 'SPRING RET'}
              </text>

              <rect x="310" y="65" width="110" height="55" rx="4" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              <rect x={314 + pneuPos * 0.65} y="69" width="12" height="47" fill="#38bdf8" className="transition-all duration-75" />
              <rect x={326 + pneuPos * 0.65} y="87" width="110" height="10" fill="#cbd5e1" className="transition-all duration-75" />
              <text x="365" y="142" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                AIR CYLINDER ({pneuPos.toFixed(0)}%)
              </text>
            </svg>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Air Control Deck</h3>
              <button
                type="button"
                onClick={() => { soundFx.click(soundOn); setPneuSupplyOn((s) => !s); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${pneuSupplyOn ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-800'}`}
              >
                Air Lockout: {pneuSupplyOn ? 'OPEN' : 'EXHAUSTED'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => { soundFx.relaySnap(soundOn); setPneuSolenoid((s) => !s); }}
              className={`w-full min-h-[44px] rounded-lg font-bold text-sm ${pneuSolenoid ? 'bg-yellow-400 text-slate-950' : 'bg-slate-900 text-white'}`}
            >
              {pneuSolenoid ? 'De-Energize 5/2 Solenoid (Retract)' : 'Energize 5/2 Solenoid (Extend)'}
            </button>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Regulator Target PSI</span>
                <span className="font-mono tabular-nums">{pneuRegPsi} PSI</span>
              </div>
              <input type="range" min={30} max={110} value={pneuRegPsi} onChange={(e) => setPneuRegPsi(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Meter-Out Needle Valve Opening</span>
                <span className="font-mono tabular-nums">{pneuFlowPct}%</span>
              </div>
              <input type="range" min={10} max={100} value={pneuFlowPct} onChange={(e) => setPneuFlowPct(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Inject Pneumatic Fault</label>
                <button type="button" onClick={() => { setPneuFault('none'); setPneuResult(null); }} className="text-xs font-semibold text-slate-600 hover:underline">Reset</button>
              </div>
              <select value={pneuFault} onChange={(e) => { setPneuFault(e.target.value as typeof pneuFault); setPneuResult(null); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="none">None (Healthy)</option>
                <option value="clogged_muffler">Fault 1: Plugged Exhaust Muffler</option>
                <option value="air_leak">Fault 2: Downstream Supply Air Leak</option>
                <option value="clogged_filter">Fault 3: Saturated FRL Filter Element</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <select value={pneuGuess} onChange={(e) => setPneuGuess(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">Diagnose pneumatic fault (+75 XP)...</option>
                <option value="clogged_muffler">Clogged Exhaust Muffler Creating Backpressure</option>
                <option value="air_leak">Major Air Leak Dropping Manifold Pressure</option>
                <option value="clogged_filter">Saturated FRL Filter Restricting Supply</option>
              </select>
              <button type="button" onClick={handleCheckPneuDiag} className="mt-2 w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Submit Pneumatic Diagnosis
              </button>
              {pneuResult && (
                <div className={`mt-2 rounded-lg p-3 text-xs font-medium ${pneuResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {pneuResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATOR E: MECHANICAL ================= */}
      {activeSim === 'mechanical' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Motor-Coupling-Gearbox-Belt Vibration Rig</span>
              <span className={`font-mono text-xs font-bold tabular-nums ${mechVibRms > 4.5 ? 'text-rose-400' : mechVibRms > 2.5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {mechVibRms} mm/s RMS · {mechTempF}°F
              </span>
            </div>

            <svg viewBox="0 0 480 180" className="mt-4 w-full" role="img" aria-label="Mechanical motor, shaft alignment coupling, and belt drive">
              <rect x="40" y="60" width="110" height="65" rx="6" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <text x="95" y="96" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">DRIVE MOTOR</text>
              {/* Shaft + Misalignment offset + Vibration Shake */}
              <g className={mechRunning && mechVibRms > 3.2 ? 'animate-vib-shake' : ''}>
                <rect x="150" y="88" width="60" height="8" fill="#cbd5e1" />
                <rect x="210" y={84 + effMisalign * 18} width="24" height="16" rx="2" fill={effMisalign > 0.15 ? '#ef4444' : '#10b981'} />
                <rect x="234" y={88 + effMisalign * 24} width="65" height="8" fill="#cbd5e1" />

                {/* Bearing Housing */}
                <rect x="275" y="65" width="50" height="55" rx="6" fill="#1e293b" stroke={effLube === 'dry' ? '#ef4444' : '#34d399'} strokeWidth="2" />
                <text x="300" y="138" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="monospace">BEARING</text>
              </g>

              {/* Animated Belt Lines */}
              <line
                x1="315"
                y1="72"
                x2="395"
                y2="60"
                stroke={effTension < 55 ? '#facc15' : '#64748b'}
                strokeWidth="3"
                className={mechRunning ? (effTension < 55 ? 'animate-flow-slow' : 'animate-flow-fast') : ''}
              />
              <line
                x1="315"
                y1="112"
                x2="395"
                y2="124"
                stroke={effTension < 55 ? '#facc15' : '#64748b'}
                strokeWidth="3"
                className={mechRunning ? (effTension < 55 ? 'animate-flow-slow' : 'animate-flow-fast') : ''}
              />

              {/* Driven Pulley + Rotating Spokes */}
              <circle cx="395" cy="92" r="32" fill="#1e293b" stroke={effTension < 55 ? '#facc15' : '#94a3b8'} strokeWidth="3" />
              <g className={mechRunning ? (effTension < 55 ? 'animate-spin-svg-slow' : 'animate-spin-svg') : ''} opacity="0.45">
                <line x1="367" y1="92" x2="423" y2="92" stroke="#94a3b8" strokeWidth="2" />
                <line x1="395" y1="64" x2="395" y2="120" stroke="#94a3b8" strokeWidth="2" />
              </g>
              <text x="395" y="96" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="monospace">{mechDrivenRpm} RPM</text>
            </svg>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 font-mono text-xs tabular-nums">
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Vibration RMS</div>
                <div className="mt-1 text-sm font-bold text-yellow-400">{mechVibRms} mm/s</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Bearing Temp</div>
                <div className="mt-1 text-sm font-bold text-white">{mechTempF}°F</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3">
                <div className="text-slate-400">Driven Speed</div>
                <div className="mt-1 text-sm font-bold text-emerald-400">{mechDrivenRpm} RPM</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-slate-900">Mechanical Rig Controls</h3>
              <button
                type="button"
                onClick={() => setMechRunning((r) => !r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mechRunning ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-800'}`}
              >
                Drive: {mechRunning ? 'RUNNING' : 'STOPPED'}
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Shaft Misalignment Offset</span>
                <span className="font-mono tabular-nums">{mechMisalignMm.toFixed(2)} mm</span>
              </div>
              <input type="range" min={0} max={0.5} step={0.02} value={mechMisalignMm} onChange={(e) => setMechMisalignMm(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>V-Belt Tension</span>
                <span className="font-mono tabular-nums">{mechBeltTension}%</span>
              </div>
              <input type="range" min={30} max={110} value={mechBeltTension} onChange={(e) => setMechBeltTension(Number(e.target.value))} className="mt-1 w-full" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Bearing Lubrication State</label>
              <select value={mechLube} onChange={(e) => setMechLube(e.target.value as typeof mechLube)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="optimal">Optimal ISO Grease Film</option>
                <option value="dry">Dry / Starved Bearing</option>
                <option value="overgreased">Over-Greased (Churning)</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-semibold text-slate-700">Inject Mechanical Fault</label>
              <select value={mechFault} onChange={(e) => { setMechFault(e.target.value as typeof mechFault); setMechResult(null); }} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="none">Manual Slider Mode</option>
                <option value="misalignment">Fault 1: Severe Coupling Misalignment</option>
                <option value="belt_slip">Fault 2: Loose Slipping V-Belt</option>
                <option value="dry_bearing">Fault 3: Dry Starved Bearing</option>
              </select>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <select value={mechGuess} onChange={(e) => setMechGuess(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                <option value="">Diagnose mechanical fault (+75 XP)...</option>
                <option value="misalignment">Coupling / Shaft Misalignment (High Vibration + Heat)</option>
                <option value="belt_slip">Under-Tensioned V-Belt Causing Speed Loss</option>
                <option value="dry_bearing">Dry Starved Bearing Causing Thermal &amp; Acoustic Spike</option>
              </select>
              <button type="button" onClick={handleCheckMechDiag} className="mt-2 w-full min-h-[42px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Submit Mechanical Diagnosis
              </button>
              {mechResult && (
                <div className={`mt-2 rounded-lg p-3 text-xs font-medium ${mechResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  {mechResult.msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATOR F: PREVENTIVE MAINTENANCE ================= */}
      {activeSim === 'preventive_maintenance' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-white lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-slate-300">Virtual Equipment Walkdown — Skid P-204</span>
              <span className="font-mono text-xs text-yellow-400 tabular-nums">
                Inspected: {pmInspected.length}/8 · Flagged: {pmFlagged.length}
              </span>
            </div>

            <svg viewBox="0 0 480 210" className="mt-4 w-full" role="img" aria-label="Interactive preventive maintenance equipment skid hotspots">
              <rect x="35" y="40" width="410" height="140" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />
              <rect x="65" y="95" width="90" height="55" rx="6" fill="#1e293b" stroke="#64748b" />
              <rect x="175" y="75" width="110" height="75" rx="6" fill="#1e293b" stroke="#64748b" />
              <rect x="305" y="65" width="120" height="85" rx="6" fill="#1e293b" stroke="#64748b" />

              {PM_HOTSPOTS.map((spot, idx) => {
                const seen = pmInspected.includes(spot.id);
                const flagged = pmFlagged.includes(spot.id);
                const active = pmSelectedId === spot.id;
                return (
                  <g
                    key={spot.id}
                    className="cursor-pointer"
                    onClick={() => {
                      soundFx.click(soundOn);
                      setPmSelectedId(spot.id);
                      if (!pmInspected.includes(spot.id)) {
                        setPmInspected((p) => [...p, spot.id]);
                      }
                    }}
                  >
                    {active && (
                      <circle
                        cx={spot.x}
                        cy={spot.y}
                        r={20}
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="1.5"
                        opacity="0.6"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={spot.x}
                      cy={spot.y}
                      r={active ? 16 : 14}
                      fill={flagged ? '#dc2626' : seen ? '#059669' : '#eab308'}
                      stroke="#ffffff"
                      strokeWidth={active ? 3 : 1.5}
                    />
                    <text x={spot.x} y={spot.y + 4} textAnchor="middle" fill={flagged || seen ? '#ffffff' : '#0f172a'} fontSize="11" fontWeight="bold">
                      {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Hotspot Reading */}
            {(() => {
              const cur = PM_HOTSPOTS.find((h) => h.id === pmSelectedId) || PM_HOTSPOTS[0];
              const isFlagged = pmFlagged.includes(cur.id);
              return (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-900 p-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">{cur.label}</div>
                    <div className="mt-1 text-sm font-bold text-white">{cur.reading}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.click(soundOn);
                      setPmFlagged((prev) =>
                        prev.includes(cur.id) ? prev.filter((x) => x !== cur.id) : [...prev, cur.id]
                      );
                    }}
                    className={`rounded-lg px-3.5 py-2 text-xs font-bold ${
                      isFlagged ? 'bg-rose-600 text-white' : 'bg-yellow-400 text-slate-950'
                    }`}
                  >
                    {isFlagged ? 'Flagged as Defect (Click to Clear)' : 'Flag Defect for Work Order'}
                  </button>
                </div>
              );
            })()}
          </div>

          <form onSubmit={handleSubmitPmInspection} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <h3 className="font-display text-base font-bold text-slate-900">
              CMMS Inspection Checklist &amp; Work Order
            </h3>
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {PM_HOTSPOTS.map((spot) => {
                const seen = pmInspected.includes(spot.id);
                const flagged = pmFlagged.includes(spot.id);
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      setPmSelectedId(spot.id);
                      if (!seen) setPmInspected((p) => [...p, spot.id]);
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-900">{spot.label}</span>
                    <span className={`font-semibold ${flagged ? 'text-rose-700' : seen ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {flagged ? 'Defect Flagged' : seen ? 'Inspected' : 'Pending'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                CMMS Work Order Summary (As-Found &amp; Recommended Action)
              </label>
              <textarea
                required
                rows={3}
                value={pmWorkOrderNote}
                onChange={(e) => setPmWorkOrderNote(e.target.value)}
                placeholder="Document abnormal suction gauge, milky gearbox oil, full FRL trap, and belt wear..."
                className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit PM Inspection &amp; Work Order (+75 XP)
            </button>

            {pmResult && (
              <div className={`rounded-lg p-3 text-xs font-medium ${pmResult.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}>
                {pmResult.msg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Interactive Moving Control Panel Inspection Stage on Electrical & PLC Labs */}
      {(activeSim === 'motor_starter' || activeSim === 'plc_ladder') && (
        <EquipmentCabinetStage
          reducedMotion={state.profile.reducedMotion}
          title={
            activeSim === 'motor_starter'
              ? 'Real-World Enclosure Inspection — Contactors, Overloads & Fuses'
              : 'Real-World Enclosure Inspection — PLC I/O Rack & Terminal Rail'
          }
        />
      )}

      {/* Attempt History */}
      {state.simulationAttempts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-bold text-slate-900">
            Saved Simulator Attempt History
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-4">Simulator</th>
                  <th className="py-2 pr-4">Scenario</th>
                  <th className="py-2 pr-4">Outcome</th>
                  <th className="py-2 pr-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.simulationAttempts.slice(0, 8).map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{attempt.simulatorName}</td>
                    <td className="py-2 pr-4 text-slate-600">{attempt.scenarioTitle}</td>
                    <td className="py-2 pr-4">
                      {attempt.correct ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Diagnosed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Needs Retry</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono font-bold tabular-nums">{attempt.scorePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
