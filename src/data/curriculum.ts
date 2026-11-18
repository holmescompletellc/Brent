import {
  CareerGoalDef,
  Course,
  DailyChallenge,
  FlashcardItem,
  Lesson,
  Skill,
  TechnicianLevelDef,
  XpActivityType,
} from '../types/maintenance';

export const XP_REWARDS: Record<XpActivityType, number> = {
  lesson: 20,
  quiz_pass: 30,
  practical_exercise: 50,
  simulator_challenge: 75,
  troubleshooting_mission: 100,
  module_complete: 150,
  weekly_challenge: 200,
};

export const TECHNICIAN_LEVELS: TechnicianLevelDef[] = [
  {
    level: 1,
    title: 'Apprentice',
    minXp: 0,
    unlockNote: 'Access to Path 1 Safety, Path 2 Mechanical, Path 3 Electrical Foundations & Beginner Simulators',
  },
  {
    level: 2,
    title: 'Maintenance Trainee',
    minXp: 150,
    unlockNote: 'Unlocks Path 4 PLC Fundamentals & Intermediate Troubleshooting Missions',
  },
  {
    level: 3,
    title: 'Junior Technician',
    minXp: 350,
    unlockNote: 'Unlocks Path 5 Hydraulics, Path 6 Pneumatics & Fluid Power Simulators',
  },
  {
    level: 4,
    title: 'Maintenance Technician',
    minXp: 650,
    unlockNote: 'Unlocks Path 7 Systematic Troubleshooting & Preventive Maintenance Lab',
  },
  {
    level: 5,
    title: 'Advanced Technician',
    minXp: 1050,
    unlockNote: 'Unlocks Advanced PLC Fault Diagnosis & Multi-Fault Missions',
  },
  {
    level: 6,
    title: 'Controls Specialist',
    minXp: 1550,
    unlockNote: 'Unlocks Path 8 Integrated Electromechanical & Industrial Networking',
  },
  {
    level: 7,
    title: 'Maintenance Expert',
    minXp: 2200,
    unlockNote: 'Unlocks Expert Diagnostic Scenarios & Reliability-Centered Maintenance',
  },
  {
    level: 8,
    title: 'Master Technician',
    minXp: 3000,
    unlockNote: 'Full Academy Curriculum Unlocked — Maintenance Planning & Leadership Mastery',
  },
];

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first_lesson',
    title: 'First Lesson Completed',
    description: 'Complete your first 7-stage interactive lesson.',
    category: 'Foundations',
    target: 1,
  },
  {
    id: 'electrical_fundamentals',
    title: 'Electrical Fundamentals',
    description: 'Complete both lessons in Path 3 — Electrical Systems.',
    category: 'Electrical',
    target: 2,
  },
  {
    id: 'motor_troubleshooter',
    title: 'Motor Troubleshooter',
    description: 'Successfully diagnose a fault in the Electrical Motor Starter simulator.',
    category: 'Simulators',
    target: 1,
  },
  {
    id: 'plc_apprentice',
    title: 'PLC Apprentice',
    description: 'Complete a PLC Ladder Logic simulator challenge and PLC lesson.',
    category: 'PLC & Automation',
    target: 2,
  },
  {
    id: 'hydraulic_specialist',
    title: 'Hydraulic Specialist',
    description: 'Pass the Hydraulics simulator fault challenge and Path 5 lessons.',
    category: 'Hydraulics',
    target: 2,
  },
  {
    id: 'pneumatic_troubleshooter',
    title: 'Pneumatic Troubleshooter',
    description: 'Diagnose a pneumatic circuit fault in the Pneumatics simulator.',
    category: 'Pneumatics',
    target: 1,
  },
  {
    id: 'pm_pro',
    title: 'Preventive Maintenance Pro',
    description: 'Complete the Preventive Maintenance virtual inspection & CMMS work order.',
    category: 'Reliability',
    target: 1,
  },
  {
    id: 'safety_champion',
    title: 'Safety Champion',
    description: 'Complete all Industrial Safety lessons with 80%+ quiz mastery.',
    category: 'Safety',
    target: 2,
  },
  {
    id: 'streak_7',
    title: 'Seven-Day Learning Streak',
    description: 'Record verified study activity across 7 consecutive calendar days.',
    category: 'Consistency',
    target: 7,
  },
  {
    id: 'streak_30',
    title: 'Thirty-Day Learning Streak',
    description: 'Maintain an active study streak across 30 consecutive calendar days.',
    category: 'Consistency',
    target: 30,
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Quiz Score',
    description: 'Achieve 100% accuracy on any Knowledge Check or Assessment.',
    category: 'Assessment',
    target: 1,
  },
  {
    id: 'first_simulator',
    title: 'First Simulator Completed',
    description: 'Complete your first diagnostic challenge in the Virtual Maintenance Lab.',
    category: 'Simulators',
    target: 1,
  },
  {
    id: 'ten_missions',
    title: 'Ten Troubleshooting Missions',
    description: 'Complete 10 scored troubleshooting missions.',
    category: 'Troubleshooting',
    target: 10,
  },
  {
    id: 'module_mastery',
    title: 'Module Mastery',
    description: 'Complete 100% of lessons inside any full learning path.',
    category: 'Mastery',
    target: 1,
  },
] as const;

export const COURSES: Course[] = [
  {
    id: 'path-1-safety',
    pathNumber: 1,
    title: 'Industrial Safety',
    subtitle: 'PPE, LOTO, Hazardous Energy & Machine Guarding',
    description:
      'Build non-negotiable hazard awareness covering PPE selection, Lockout/Tagout energy isolation concepts, arc-flash boundaries, machine guarding, and workplace safety documentation.',
    tier: 'Foundations',
    requiredLevel: 1,
    lessonIds: ['safety-loto', 'safety-electrical-guarding'],
  },
  {
    id: 'path-2-mechanical',
    pathNumber: 2,
    title: 'Mechanical Maintenance',
    subtitle: 'Precision Tools, Bearings, Drives, Alignment & Vibration',
    description:
      'Master precision measurement, bearing and seal inspection, gearboxes, belt/chain drives, shaft alignment, lubrication schedules, and vibration diagnostics.',
    tier: 'Foundations',
    requiredLevel: 1,
    lessonIds: ['mech-bearings-alignment', 'mech-drives-lubrication'],
    linkedSimulatorId: 'mechanical',
  },
  {
    id: 'path-3-electrical',
    pathNumber: 3,
    title: 'Electrical Systems',
    subtitle: 'AC/DC, Ohm’s Law, Schematics, Motor Starters & VFDs',
    description:
      'Understand voltage, current, resistance, schematic symbols, relays, contactors, three-phase induction motors, overload protection, and Variable Frequency Drives.',
    tier: 'Core Systems',
    requiredLevel: 1,
    lessonIds: ['elec-ohms-schematics', 'elec-starters-vfd'],
    linkedSimulatorId: 'motor_starter',
  },
  {
    id: 'path-4-plc',
    pathNumber: 4,
    title: 'PLCs & Automation',
    subtitle: 'I/O, Ladder Logic, Timers, Counters & Fault Diagnosis',
    description:
      'Read and troubleshoot PLC ladder logic, discrete inputs/outputs, TON timers, CTU counters, seal-in rungs, industrial sensors, and automated machine sequences.',
    tier: 'Core Systems',
    requiredLevel: 2,
    lessonIds: ['plc-io-ladder', 'plc-timers-sensors'],
    linkedSimulatorId: 'plc_ladder',
  },
  {
    id: 'path-5-hydraulics',
    pathNumber: 5,
    title: 'Hydraulics',
    subtitle: 'Pumps, Pressure/Flow, Directional Valves & Cylinders',
    description:
      'Apply Pascal’s law to hydraulic reservoirs, gear/vane/piston pumps, relief valves, 4/3 directional control valves, actuators, schematics, and pressure/flow fault isolation.',
    tier: 'Core Systems',
    requiredLevel: 3,
    lessonIds: ['hyd-principles-valves', 'hyd-schematics-faults'],
    linkedSimulatorId: 'hydraulics',
  },
  {
    id: 'path-6-pneumatics',
    pathNumber: 6,
    title: 'Pneumatics',
    subtitle: 'Compressors, FRL Air Prep, Solenoids & Actuators',
    description:
      'Inspect compressed air generation, FRL conditioning units, pressure regulators, 5/2 solenoid valves, pneumatic cylinders, flow controls, and leak/pressure-drop diagnostics.',
    tier: 'Core Systems',
    requiredLevel: 3,
    lessonIds: ['pneu-airprep-valves', 'pneu-circuits-troubleshoot'],
    linkedSimulatorId: 'pneumatics',
  },
  {
    id: 'path-7-troubleshooting',
    pathNumber: 7,
    title: 'Industrial Troubleshooting',
    subtitle: 'Systematic Diagnosis, RCA, PM & CMMS Work Orders',
    description:
      'Execute structured half-split troubleshooting, 5-Why and Fishbone root-cause analysis, preventive maintenance inspections, CMMS work orders, and failure analysis.',
    tier: 'Advanced Mastery',
    requiredLevel: 4,
    lessonIds: ['ts-systematic-rca', 'ts-pm-cmms'],
    linkedSimulatorId: 'preventive_maintenance',
  },
  {
    id: 'path-8-advanced',
    pathNumber: 8,
    title: 'Advanced Technician Development',
    subtitle: 'Integrated Systems, Industrial Networks, RCM & Leadership',
    description:
      'Synthesize electromechanical control loops, EtherNet/IP & PROFINET networking fundamentals, Reliability-Centered Maintenance (RCM), maintenance planning, and crew leadership.',
    tier: 'Advanced Mastery',
    requiredLevel: 6,
    lessonIds: ['adv-electromech-networks', 'adv-rcm-leadership'],
  },
];

export const SKILLS: Skill[] = [
  { id: 'sk-loto', name: 'Lockout / Tagout & Zero-Energy Verification', category: 'Safety', courseId: 'path-1-safety', description: 'Identify hazardous energy sources and sequence energy isolation steps properly.' },
  { id: 'sk-ppe-guarding', name: 'PPE, Electrical Boundaries & Machine Guarding', category: 'Safety', courseId: 'path-1-safety', description: 'Select appropriate PPE and verify physical machine guards and interlocks.' },
  { id: 'sk-precision-meas', name: 'Precision Measurement & Bearing Inspection', category: 'Mechanical', courseId: 'path-2-mechanical', description: 'Use micrometers, dial indicators, and inspect rolling-element bearings & seals.' },
  { id: 'sk-alignment-vib', name: 'Shaft Alignment & Vibration Fundamentals', category: 'Mechanical', courseId: 'path-2-mechanical', description: 'Recognize angular/parallel misalignment and abnormal vibration signatures.' },
  { id: 'sk-drives-lube', name: 'Belts, Chains, Gearboxes & Lubrication', category: 'Mechanical', courseId: 'path-2-mechanical', description: 'Evaluate belt tension, chain wear, gearbox oil condition, and relubrication intervals.' },
  { id: 'sk-ohms-acdc', name: 'AC/DC Fundamentals & Ohm’s Law', category: 'Electrical', courseId: 'path-3-electrical', description: 'Apply V=I×R, distinguish AC vs DC behavior, and interpret meter readings safely.' },
  { id: 'sk-schematics', name: 'Industrial Electrical Schematic Reading', category: 'Electrical', courseId: 'path-3-electrical', description: 'Trace ladder diagrams, NO/NC contacts, relays, and wire numbering.' },
  { id: 'sk-motor-starters', name: '3-Phase Motor Starters & Overload Protection', category: 'Electrical', courseId: 'path-3-electrical', description: 'Diagnose holding coils, seal-in contacts, thermal overloads, and 3-phase motors.' },
  { id: 'sk-vfd', name: 'Variable Frequency Drives (VFDs)', category: 'Electrical', courseId: 'path-3-electrical', description: 'Understand frequency/speed control, accel/decel ramps, and VFD fault codes.' },
  { id: 'sk-plc-io', name: 'PLC Architecture & Discrete I/O', category: 'PLC & Automation', courseId: 'path-4-plc', description: 'Trace field inputs and outputs through PLC input/output modules.' },
  { id: 'sk-ladder-logic', name: 'Ladder Logic, Timers & Counters', category: 'PLC & Automation', courseId: 'path-4-plc', description: 'Read XIC/XIO instructions, TON timers, CTU counters, and seal-in rungs.' },
  { id: 'sk-sensors-plc', name: 'Industrial Sensors & PLC Fault Diagnosis', category: 'PLC & Automation', courseId: 'path-4-plc', description: 'Troubleshoot inductive proximity sensors, photoeyes, limit switches, and PLC faults.' },
  { id: 'sk-hyd-principles', name: 'Hydraulic Pressure, Flow & Pumps', category: 'Hydraulics', courseId: 'path-5-hydraulics', description: 'Distinguish pump flow generation from load-induced pressure and relief settings.' },
  { id: 'sk-hyd-valves', name: 'Hydraulic Directional Valves & Cylinders', category: 'Hydraulics', courseId: 'path-5-hydraulics', description: 'Interpret 4/3 valve center conditions, actuators, and internal bypass faults.' },
  { id: 'sk-pneu-frl', name: 'Compressed Air Prep (FRL) & Regulators', category: 'Pneumatics', courseId: 'path-6-pneumatics', description: 'Maintain air compressors, filters, pressure regulators, and lubricators.' },
  { id: 'sk-pneu-circuits', name: 'Pneumatic Solenoid Valves & Cylinders', category: 'Pneumatics', courseId: 'path-6-pneumatics', description: 'Trace 5/2 solenoid valves, speed-control flow restrictors, and air leaks.' },
  { id: 'sk-systematic-ts', name: 'Systematic Half-Split Fault Diagnosis', category: 'Troubleshooting', courseId: 'path-7-troubleshooting', description: 'Isolate root faults methodically without parts-swapping guesswork.' },
  { id: 'sk-rca', name: 'Root-Cause Analysis (5-Why & Fishbone)', category: 'Troubleshooting', courseId: 'path-7-troubleshooting', description: 'Separate symptoms from underlying physical, human, and systemic root causes.' },
  { id: 'sk-pm-cmms', name: 'Preventive Maintenance & CMMS Work Orders', category: 'Troubleshooting', courseId: 'path-7-troubleshooting', description: 'Execute equipment inspection checklists and write actionable work order histories.' },
  { id: 'sk-electromech', name: 'Integrated Electromechanical Systems', category: 'Reliability & Leadership', courseId: 'path-8-advanced', description: 'Correlate PLC logic, electrical drives, fluid power, and mechanical loads.' },
  { id: 'sk-ind-networks', name: 'Industrial Networking Basics (EtherNet/IP)', category: 'Reliability & Leadership', courseId: 'path-8-advanced', description: 'Diagnose switch links, IP subnets, and fieldbus node drop-offs.' },
  { id: 'sk-rcm-planning', name: 'Reliability-Centered Maintenance & Planning', category: 'Reliability & Leadership', courseId: 'path-8-advanced', description: 'Prioritize criticality, spare parts kitting, and preventive/predictive strategies.' },
];

export const LESSONS: Lesson[] = [
  // PATH 1: INDUSTRIAL SAFETY
  {
    id: 'safety-loto',
    courseId: 'path-1-safety',
    order: 1,
    title: 'Lockout / Tagout & Hazardous Energy Control',
    durationMinutes: 12,
    skillId: 'sk-loto',
    prerequisiteLessonIds: [],
    stage1Learn: {
      summary:
        'Hazardous energy includes electrical, mechanical, hydraulic, pneumatic, chemical, and thermal sources—including stored energy in capacitors, springs, or elevated loads. Lockout/Tagout (LOTO) ensures every energy source is physically isolated and verified at zero energy before maintenance begins.',
      keyPoints: [
        'Turning off a control pushbutton or HMI screen is NOT energy isolation—control circuits can fail closed.',
        'Every authorized technician applies their own personal lock and tag; never rely on another worker’s lock.',
        'Always perform a Zero-Energy Verification (Try / Test) step after locking out and dissipating stored pressure.',
      ],
      analogy:
        'Think of a light switch versus the main breaker panel: turning off the wall switch stops the lamp, but only locking the breaker prevents someone else from flipping power back on while your hands are in the fixture.',
      safetyNote:
        'Training Simulation Notice: This module teaches LOTO concepts for educational readiness. Always follow your employer’s written site-specific LOTO procedures and work under qualified supervision.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Energy-Isolating Device', definition: 'A mechanical device (disconnect switch, ball valve, blind flange) that physically prevents energy transmission.', application: 'Main 480V fused disconnect handle on a conveyor control panel.' },
        { term: 'Stored Energy', definition: 'Residual energy remaining after isolation, such as charged hydraulic accumulators, compressed air receivers, or suspended vertical loads.', application: 'Bleed hydraulic accumulator pressure to 0 PSI and insert mechanical safety blocks.' },
        { term: 'Zero-Energy Verification', definition: 'Attempting normal start controls and testing with a verified meter/gauge to prove zero energy state.', application: 'Live-Dead-Live voltage check by qualified personnel before touching conductors.' },
      ],
      practicalApplications: [
        'Isolating both electrical supply and pneumatic air supply on an automated packaging sealer.',
        'Using mechanical cribbing blocks beneath a raised hydraulic press platen before seal replacement.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'loto_circuit',
      caption: 'Toggle energy isolation states to see why control stops differ from true zero-energy LOTO.',
      interactiveStates: [
        { label: '1. Machine Running', reading: '480V · 90 PSI · Guard Closed', status: 'warning', description: 'Main power and pneumatic supply energized; actuator cycling normally.' },
        { label: '2. Control Stop Pressed', reading: '480V Present · 90 PSI Active', status: 'fault', description: 'UNSAFE FOR HANDS-ON WORK: Control circuit halted, but main line and air pressure remain live.' },
        { label: '3. LOTO Applied & Bled', reading: '0V Verified · 0 PSI · Locked', status: 'nominal', description: 'Main disconnect locked/tagged, air dumped via lockout valve, zero-energy verified.' },
      ],
    },
    stage4Practice: {
      prompt: 'Arrange the mandatory LOTO isolation steps in the correct sequence from start to finish.',
      mode: 'sequence',
      items: [
        { id: 'prep', label: '1. Notify & Prepare', detail: 'Notify affected operators and identify all energy sources.' },
        { id: 'shutdown', label: '2. Normal Shutdown', detail: 'Stop the machine using normal operating controls.' },
        { id: 'isolate', label: '3. Isolate & Lock/Tag', detail: 'Open disconnect/valves and apply personal lock and tag.' },
        { id: 'dissipate', label: '4. Bleed Stored Energy', detail: 'Release trapped hydraulic/pneumatic pressure or block gravity loads.' },
        { id: 'verify', label: '5. Verify Zero Energy', detail: 'Test start controls and verify zero energy before starting work.' },
      ],
      correctOrderOrIds: ['prep', 'shutdown', 'isolate', 'dissipate', 'verify'],
      feedbackPass: 'Exact sequence! Energy dissipation and zero-energy verification prevent unexpected startup.',
      feedbackRetry: 'Review the order: you must shut down normally before isolating, bleed stored energy after locking out, and always verify last.',
    },
    stage5Quiz: [
      {
        id: 'q-loto-1',
        kind: 'scenario',
        prompt: 'An operator presses the red Emergency Stop button on a conveyor. Is it safe for a technician to reach inside the chain guard to clear a jam?',
        options: [
          'Yes, as long as the E-Stop stays latched.',
          'No, E-Stop is a control device, not a locked-out energy-isolating device.',
          'Yes, if another operator watches the control panel.',
          'Only if the conveyor motor hums quietly.',
        ],
        correctIndex: 1,
        explanation: 'Emergency stops interrupt control power or safety relays—they do not physically isolate primary power or bleed stored mechanical/pneumatic energy like LOTO.',
        topicTag: 'LOTO Energy Isolation',
      },
      {
        id: 'q-loto-2',
        kind: 'multiple_choice',
        prompt: 'Which item is considered stored hazardous energy after the main electrical disconnect is locked open?',
        options: [
          'A pressurized hydraulic accumulator',
          'An empty plastic conduit',
          'A labeled terminal strip diagram',
          'A grounded equipment frame',
        ],
        correctIndex: 0,
        explanation: 'Hydraulic accumulators store pressurized fluid that can violently actuate a cylinder even when the electrical pump motor is locked out.',
        topicTag: 'Stored Energy',
      },
      {
        id: 'q-loto-3',
        kind: 'multiple_choice',
        prompt: 'If two technicians work simultaneously on the same hydraulic press, how should locks be applied?',
        options: [
          'Only the lead technician needs to apply a lock.',
          'Use a multi-lock hasp so each technician applies their own personal lock and tag.',
          'Share one key taped inside the panel door.',
          'Apply a paper tag without a padlock.',
        ],
        correctIndex: 1,
        explanation: 'Every exposed worker must retain exclusive control over their own personal lock using a group lockbox or multi-lock hasp.',
        topicTag: 'LOTO Procedures',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Describe how you would identify and verify zero energy on a machine powered by both 480V 3-phase electricity and 100 PSI compressed air.',
      checklistCriteria: [
        'Identify both electrical and pneumatic energy sources',
        'Mention physical lockout devices on both disconnect and air dump valve',
        'Include bleeding residual air pressure and verifying zero energy',
      ],
    },
  },
  {
    id: 'safety-electrical-guarding',
    courseId: 'path-1-safety',
    order: 2,
    title: 'PPE, Electrical Safety & Machine Guarding',
    durationMinutes: 10,
    skillId: 'sk-ppe-guarding',
    prerequisiteLessonIds: ['safety-loto'],
    stage1Learn: {
      summary:
        'Industrial safety pairs engineering controls (fixed guards, interlocked doors, light curtains) with Personal Protective Equipment (PPE) and safe electrical work boundaries. Technicians never bypass safety interlocks to keep production moving.',
      keyPoints: [
        'Arc-flash hazards occur when high fault current bridges air gaps—never open energized high-energy panels without proper qualification and arc-rated PPE.',
        'Machine guarding prevents contact with pinch points, rotating shafts, shear blades, and nip points.',
        'Workplace safety documentation (Job Safety Analyses / Hot Work / LOTO logs) captures hazards before work starts.',
      ],
      analogy:
        'Machine guards are like seatbelts and airbags: you never remove them just because a trip feels routine.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Interlocked Guard', definition: 'A movable barrier wired to a safety switch that stops hazardous motion when opened.', application: 'Safety door switch on a robotic palletizer cell.' },
        { term: 'Pinch / Nip Point', definition: 'Zone where two moving parts (or a moving belt and pulley) converge and can trap body parts.', application: 'Conveyor roller transfer points and V-belt sheaves.' },
        { term: 'Job Safety Analysis (JSA)', definition: 'Pre-task worksheet breaking a job into steps, identifying hazards, and defining controls.', application: 'Completed before crane lifts or confined space entries.' },
      ],
      practicalApplications: [
        'Inspecting safety light curtains and door interlocks during preventive maintenance checks.',
        'Reporting damaged or missing shaft guards immediately rather than operating exposed drives.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'loto_circuit',
      caption: 'Explore safety guarding states and interlock behavior on a rotating drive assembly.',
      interactiveStates: [
        { label: 'Guard Installed & Interlocked', reading: 'Safety Relay: OK · Drive Enabled', status: 'nominal', description: 'Physical barrier blocks pinch points; safety circuit closed normally.' },
        { label: 'Guard Opened', reading: 'Safety Relay: OPEN · Drive Coasting to Stop', status: 'warning', description: 'Safety switch opens control enable immediately when guard door opens.' },
        { label: 'Bypassed / Missing Guard', reading: 'CRITICAL HAZARD · Exposed Nip Point', status: 'fault', description: 'Unacceptable condition: machine must be locked out until guard and interlock are restored.' },
      ],
    },
    stage4Practice: {
      prompt: 'Select all practices that represent compliant industrial safety behavior.',
      mode: 'component_match',
      items: [
        { id: 'c1', label: 'Inspect safety glasses, hearing protection & insulated gloves before task', detail: 'Pre-use PPE inspection' },
        { id: 'c2', label: 'Tape down a guard interlock switch to observe belt tracking', detail: 'Safety bypass' },
        { id: 'c3', label: 'Complete a JSA before hoisting a heavy gearbox', detail: 'Safety documentation' },
        { id: 'c4', label: 'Verify guard fasteners are reinstalled after belt replacement', detail: 'Guard restoration' },
      ],
      correctOrderOrIds: ['c1', 'c3', 'c4'],
      feedbackPass: 'Correct! Never bypass interlocks; rely on proper PPE, JSA planning, and restored physical guarding.',
      feedbackRetry: 'Watch out for safety bypasses—taping down an interlock switch is never acceptable.',
    },
    stage5Quiz: [
      {
        id: 'q-safe-1',
        kind: 'multiple_choice',
        prompt: 'What is the correct action if you discover a missing V-belt guard on an operating exhaust fan?',
        options: [
          'Leave it running until the annual shutdown.',
          'Stop and lock out the unit according to site procedure, report the hazard, and reinstall/fabricate an approved guard before restart.',
          'Wrap caution tape around the rotating pulley.',
          'Stand three feet back while operating it.',
        ],
        correctIndex: 1,
        explanation: 'Exposed belts and pulleys create severe nip-point hazards; equipment must be safely isolated until proper guarding is restored.',
        topicTag: 'Machine Guarding',
      },
      {
        id: 'q-safe-2',
        kind: 'multiple_choice',
        prompt: 'Why is a Job Safety Analysis (JSA) completed before non-routine maintenance?',
        options: [
          'To replace Lockout/Tagout entirely.',
          'To identify step-by-step hazards, required PPE, and controls with the crew before starting work.',
          'To calculate motor horsepower.',
          'Only to log technician overtime.',
        ],
        correctIndex: 1,
        explanation: 'A JSA systematically identifies task hazards and puts controls in place before tools touch equipment.',
        topicTag: 'Safety Documentation',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain why bypassing a safety door interlock creates legal, mechanical, and human hazards even for an experienced technician.',
      checklistCriteria: [
        'Addresses unexpected automatic restart or distraction risks',
        'Notes responsibility to restore engineering controls',
      ],
    },
  },

  // PATH 2: MECHANICAL MAINTENANCE
  {
    id: 'mech-bearings-alignment',
    courseId: 'path-2-mechanical',
    order: 1,
    title: 'Precision Measurement, Bearings, Seals & Shaft Alignment',
    durationMinutes: 15,
    skillId: 'sk-precision-meas',
    prerequisiteLessonIds: ['safety-loto'],
    stage1Learn: {
      summary:
        'Over half of premature rotating-equipment failures trace back to misalignment, improper bearing installation, or seal contamination. Precision tools—micrometers, calipers, feeler gauges, and dial/laser alignment tools—let technicians measure clearances to thousandths of an inch.',
      keyPoints: [
        'Never strike a bearing’s outer race when pressing onto a shaft; always apply force to the press-fit race.',
        'Shaft misalignment occurs in two planes: parallel offset and angularity, both vertically and horizontally.',
        'Lip seals keep lubricant in and grit/moisture out; install seal lips facing the retained lubricant.',
      ],
      analogy:
        'Misaligned motor and pump shafts act like riding a bicycle with a bent crank—every revolution forces the bearings to absorb side-loads they were never built to carry.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Soft Foot', definition: 'Condition where one machine mounting foot does not sit flat on the baseplate, distorting the frame when bolted down.', application: 'Check with feeler gauges and shim before final shaft alignment.' },
        { term: 'Dial Indicator', definition: 'Precision gauge measuring runout, endplay, or shaft alignment offset in 0.001" increments.', application: 'Rim-and-face shaft alignment or checking shaft bend.' },
        { term: 'Brinelling', definition: 'Permanent indentations in bearing raceways caused by heavy impact loads or static vibration.', application: 'Appears as evenly spaced dents matching ball/roller spacing.' },
      ],
      practicalApplications: [
        'Measuring shaft journal diameter with an outside micrometer prior to bearing replacement.',
        'Correcting motor soft foot with stainless steel shims before aligning a coupling.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'bearing_load',
      caption: 'Observe how shaft misalignment impacts bearing temperature and vibration RMS.',
      interactiveStates: [
        { label: 'Aligned (< 0.05 mm offset)', reading: '1.4 mm/s RMS · 118°F', status: 'nominal', description: 'Smooth load distribution across bearing raceways and flexible coupling.' },
        { label: 'Moderate Misalignment (0.25 mm)', reading: '5.2 mm/s RMS · 156°F', status: 'warning', description: 'Elevated 2× axial vibration and rising coupling/seal wear.' },
        { label: 'Severe Misalignment + Soft Foot', reading: '11.4 mm/s RMS · 204°F', status: 'fault', description: 'Rapid bearing fatigue, spalling risk, and premature seal failure.' },
      ],
    },
    stage4Practice: {
      prompt: 'Order the proper mechanical sequence for aligning a motor to a centrifugal pump.',
      mode: 'sequence',
      items: [
        { id: 'loto', label: '1. Lock Out & Inspect Base', detail: 'Verify LOTO, clean mounting pads, check rough coupling gap.' },
        { id: 'softfoot', label: '2. Eliminate Soft Foot', detail: 'Check each foot with feeler gauges/dial indicator and shim flat.' },
        { id: 'rough', label: '3. Rough Align', detail: 'Bring shafts close to specification using a straightedge.' },
        { id: 'precision', label: '4. Precision Align & Torque', detail: 'Measure with dial/laser tool, shim vertically, move horizontally, torque bolts.' },
      ],
      correctOrderOrIds: ['loto', 'softfoot', 'rough', 'precision'],
      feedbackPass: 'Spot on! Always eliminate soft foot before precision alignment.',
      feedbackRetry: 'Remember: soft foot twists the motor housing if bolted down, so correct it before precision alignment.',
    },
    stage5Quiz: [
      {
        id: 'q-mech-1',
        kind: 'multiple_choice',
        prompt: 'When pressing a bearing onto a tight-fit rotating shaft, where should installation force be applied?',
        options: [
          'Against the outer race only',
          'Against the inner race using a clean mounting sleeve',
          'Directly on the rolling balls or cage',
          'With a hammer directly against the seal shield',
        ],
        correctIndex: 1,
        explanation: 'Transmitting press force through the balls onto the outer race causes brinelling damage inside the new bearing.',
        topicTag: 'Bearing Installation',
      },
      {
        id: 'q-mech-2',
        kind: 'component_id',
        prompt: 'Which precision tool checks clearance between a motor foot and baseplate to detect soft foot?',
        options: ['Feeler gauge set', 'Clamp ammeter', 'Pipe wrench', 'Torque multiplier'],
        correctIndex: 0,
        explanation: 'Feeler gauges measure narrow gaps (e.g., > 0.002") under an untorqued mounting foot.',
        topicTag: 'Precision Measurement',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain how bearing overheating, vibration, and shaft misalignment reinforce one another if left uncorrected.',
      checklistCriteria: [
        'Links misalignment forces to elevated bearing load and heat',
        'Notes lubricant breakdown and progressive raceway wear',
      ],
    },
  },
  {
    id: 'mech-drives-lubrication',
    courseId: 'path-2-mechanical',
    order: 2,
    title: 'Gearboxes, Belt & Chain Drives, Lubrication & Vibration',
    durationMinutes: 14,
    skillId: 'sk-drives-lube',
    prerequisiteLessonIds: ['mech-bearings-alignment'],
    stage1Learn: {
      summary:
        'Mechanical power transmission relies on matched belts, sprockets, gearboxes, and proper lubrication film thickness. Too little grease causes metal-to-metal scuffing; over-greasing seals blows out seals and overheats churning bearings.',
      keyPoints: [
        'Check V-belt tension at mid-span deflection; loose belts slip and glaze, overtight belts overload shaft bearings.',
        'Gearbox oil level, breather vent cleanliness, and magnetic drain plug debris reveal early gear wear.',
        'Vibration frequency helps pinpoint faults: 1× RPM points to unbalance, 2× RPM often signals misalignment, high-frequency noise points to bearing defects.',
      ],
      analogy:
        'Lubricant viscosity is like engine oil weight—too thin lets metal surfaces touch under load, while too thick creates drag and heat.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Sheave Alignment', definition: 'Coplanar alignment of driving and driven belt pulleys so belts enter grooves straight.', application: 'Checked across pulley faces with a straightedge or laser.' },
        { term: 'Chain Elongation', definition: 'Pitch stretch caused by pin-and-bushing wear; typically condemned at 2–3% stretch.', application: 'Measured across a fixed pin span with a chain wear gauge.' },
        { term: 'Viscosity Grade (ISO VG)', definition: 'Standardized measure of lubricant resistance to flow at 40°C.', application: 'Selecting ISO VG 220 synthetic gear oil per gearbox nameplate.' },
      ],
      practicalApplications: [
        'Replacing matched V-belt sets together rather than mixing one new belt with worn belts.',
        'Inspecting gearbox sight glass oil clarity for milky water contamination.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'bearing_load',
      caption: 'Compare drive condition states across belt tension and lubrication health.',
      interactiveStates: [
        { label: 'Proper Tension & ISO Oil', reading: '1.8 mm/s RMS · 122°F', status: 'nominal', description: 'Zero belt slip, steady gearbox oil film, normal operating temperature.' },
        { label: 'Loose / Worn V-Belt', reading: 'Belt Slip · Pulley Squeal · 154°F', status: 'warning', description: 'Reduced driven RPM, belt sidewall glazing, rubber dust accumulation.' },
        { label: 'Starved Bearing Lubrication', reading: '9.8 mm/s RMS · 198°F', status: 'fault', description: 'Dry metal-to-metal contact producing high-frequency acoustic noise and thermal spike.' },
      ],
    },
    stage4Practice: {
      prompt: 'Match the symptom to the most likely mechanical cause.',
      mode: 'component_match',
      items: [
        { id: 'm1', label: 'Fine rubber dust beneath motor sheaves + belt squeal on start', detail: 'Under-tensioned or misaligned V-belt' },
        { id: 'm2', label: 'Milky white oil inside gearbox sight glass', detail: 'Water contamination through failed seal or breather' },
        { id: 'm3', label: 'Grease pushed past bearing lip seal + hot housing', detail: 'Over-greasing churning the cavity' },
      ],
      correctOrderOrIds: ['m1', 'm2', 'm3'],
      feedbackPass: 'All three mechanical signatures correctly identified!',
      feedbackRetry: 'Review each visual symptom carefully.',
    },
    stage5Quiz: [
      {
        id: 'q-drive-1',
        kind: 'multiple_choice',
        prompt: 'On a 3-belt V-belt drive, one belt snaps while the other two look intact. What is best practice?',
        options: [
          'Replace only the broken belt to save time.',
          'Replace all three as a matched set and inspect sheave groove wear and alignment.',
          'Run on two belts permanently.',
          'Apply belt dressing lubricant to the sheaves.',
        ],
        correctIndex: 1,
        explanation: 'Old belts have stretched; mixing one new belt forces the single new belt to carry almost all the load and fail prematurely.',
        topicTag: 'Belt Drives',
      },
      {
        id: 'q-drive-2',
        kind: 'multiple_choice',
        prompt: 'What happens when a technician pumps grease aggressively into a motor bearing housing until grease bursts out the seal?',
        options: [
          'The bearing runs cooler and lasts twice as long.',
          'Over-greasing causes grease churning, excessive heat, and damaged shaft seals.',
          'It automatically aligns the motor.',
          'It lowers electrical amp draw.',
        ],
        correctIndex: 1,
        explanation: 'Overfilling causes hydraulic pressure and viscous churning heat inside the bearing cavity, blowing seals and accelerating failure.',
        topicTag: 'Lubrication',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Summarize what you inspect on a gearbox and belt-driven conveyor during a routine preventive maintenance walkdown.',
      checklistCriteria: [
        'Covers oil level/clarity and breather check',
        'Covers belt tension, wear debris, and guard security',
      ],
    },
  },

  // PATH 3: ELECTRICAL SYSTEMS
  {
    id: 'elec-ohms-schematics',
    courseId: 'path-3-electrical',
    order: 1,
    title: 'AC/DC Fundamentals, Ohm’s Law & Electrical Schematics',
    durationMinutes: 16,
    skillId: 'sk-ohms-acdc',
    prerequisiteLessonIds: ['safety-loto'],
    stage1Learn: {
      summary:
        'Electrical troubleshooting begins with three linked quantities—Voltage (V, electrical pressure), Current (I, electron flow in Amps), and Resistance (R, opposition in Ohms)—governed by Ohm’s Law: V = I × R. Ladder schematics map how power flows left-to-right from L1 to L2 through switches, relay contacts, and loads.',
      keyPoints: [
        'Voltage is always measured in parallel across two points; an open switch drops full supply voltage across its terminals.',
        'Normally Open (NO) contacts pass current only when actuated; Normally Closed (NC) contacts pass current at rest.',
        'DC power maintains constant polarity (24VDC PLC I/O); AC power alternates polarity (120VAC control, 480VAC 3-phase motors).',
      ],
      analogy:
        'Voltage is water pressure in a pipe, Current (Amps) is gallons per minute flowing, and Resistance (Ohms) is a partially closed valve restricting flow.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Ohm’s Law (V = I × R)', definition: 'Fundamental relationship linking Voltage (V), Current (A), and Resistance (Ω).', application: 'A 24VDC coil with 48Ω resistance draws I = 24 / 48 = 0.5 Amps.' },
        { term: 'Normally Open (NO) Contact', definition: 'Switch or relay contact that stays open until pressed or energized.', application: 'Green Start pushbutton and M1 seal-in auxiliary contact.' },
        { term: 'Normally Closed (NC) Contact', definition: 'Switch or relay contact that conducts continuously until actuated or tripped.', application: 'Red Stop pushbutton and Overload (OL) trip contact.' },
      ],
      practicalApplications: [
        'Calculating expected solenoid coil current before energizing a 24VDC circuit.',
        'Reading rung numbers and cross-references on industrial ladder schematics.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'motor_seal_in',
      caption: 'Step through a 120VAC relay control rung to see voltage across open vs. closed contacts.',
      interactiveStates: [
        { label: 'Stop Closed · Start Open', reading: '120VAC across Start · Coil: 0V', status: 'warning', description: 'Power waits at the NO Start contact; coil de-energized.' },
        { label: 'Start Pressed · Coil Energized', reading: '0V across Start · Coil: 120V', status: 'nominal', description: 'Closed switch has near-zero voltage drop; full 120V drives the coil.' },
        { label: 'Open Overload Contact', reading: '120VAC across OL · Coil: 0V', status: 'fault', description: 'Open safety/overload contact drops full line voltage and cuts coil power.' },
      ],
    },
    stage4Practice: {
      prompt: 'Solve this practical Ohm’s Law check: A 120VAC indicator lamp filament measures 240 Ohms cold. Using I = V / R, pick the correct calculated current and meter safety rule.',
      mode: 'component_match',
      items: [
        { id: 'ans1', label: '0.5 Amps (120V / 240Ω = 0.5A)', detail: 'Calculated current' },
        { id: 'ans2', label: 'Measure resistance ONLY on a de-energized, isolated component', detail: 'Ohms meter safety rule' },
      ],
      correctOrderOrIds: ['ans1', 'ans2'],
      feedbackPass: 'Correct! Never connect an ohmmeter to a live energized circuit.',
      feedbackRetry: 'Remember I = V / R (120 / 240 = 0.5A) and ohmmeters require de-energized circuits.',
    },
    stage5Quiz: [
      {
        id: 'q-elec-1',
        kind: 'diagram',
        prompt: 'In a 120VAC control ladder rung, a good closed Stop pushbutton should measure approximately how many volts across its two terminals?',
        diagramHint: 'L1 --- [ NC Stop ] --- [ NO Start ] --- ( Coil ) --- L2',
        options: ['120 VAC', '60 VAC', '0 VAC', '480 VAC'],
        correctIndex: 2,
        explanation: 'A closed switch acts like a continuous conductor, so both terminals sit at the same electrical potential (~0V difference across the switch).',
        topicTag: 'Voltage Drop Diagnosis',
      },
      {
        id: 'q-elec-2',
        kind: 'multiple_choice',
        prompt: 'Using Ohm’s Law, how much current flows through a 24VDC PLC solenoid coil with 12 Ohms of resistance?',
        options: ['0.5 A', '2.0 A', '12 A', '288 A'],
        correctIndex: 1,
        explanation: 'I = V / R = 24V / 12Ω = 2.0 Amps.',
        topicTag: 'Ohms Law',
      },
      {
        id: 'q-elec-3',
        kind: 'component_id',
        prompt: 'In standard industrial schematics, two parallel vertical lines with a diagonal slash represent which contact type?',
        options: ['Normally Open (NO)', 'Normally Closed (NC)', 'Ground Rod', 'Fuse'],
        correctIndex: 1,
        explanation: 'Parallel lines with a diagonal slash denote a Normally Closed (NC) contact.',
        topicTag: 'Electrical Symbols',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain why measuring 120VAC across a closed switch terminal indicates a bad contact rather than normal operation.',
      checklistCriteria: [
        'Explains that closed switches have ~0V drop across them',
        'Notes that 120V across a switch proves it is electrically open',
      ],
    },
  },
  {
    id: 'elec-starters-vfd',
    courseId: 'path-3-electrical',
    order: 2,
    title: 'Relays, Motor Starters, 3-Phase Motors & VFDs',
    durationMinutes: 16,
    skillId: 'sk-motor-starters',
    prerequisiteLessonIds: ['elec-ohms-schematics'],
    stage1Learn: {
      summary:
        'A magnetic motor starter pairs an electromagnetic contactor (heavy 3-phase power contacts) with an overload relay protecting motor windings from sustained overcurrent. Variable Frequency Drives (VFDs) convert fixed 60Hz AC into adjustable frequency and voltage to control motor speed and torque smoothly.',
      keyPoints: [
        'A 3-wire Start/Stop circuit uses an auxiliary NO holding contact (seal-in) wired in parallel with the Start button so the motor stays latched after Start is released.',
        'Swapping any two of the three power phases (L1, L2, L3) reverses a 3-phase induction motor’s rotation.',
        'VFD DC bus capacitors hold lethal voltage for several minutes after power-off; always verify bus discharge before servicing.',
      ],
      analogy:
        'A contactor is like a heavy-duty remote-controlled drawbridge: a tiny 24V/120V control signal pulls an electromagnet that closes thick copper contacts carrying 480V to the motor.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Seal-In (Holding) Contact', definition: 'Auxiliary NO contact on a contactor that closes with the main poles to keep the coil energized after releasing Start.', application: 'Prevents automatic restart after a power outage (low-voltage protection).' },
        { term: 'Thermal Overload Relay', definition: 'Current-sensing protection device that opens an NC contact in the control circuit if motor current exceeds FLA limit.', application: 'Trips to protect motor windings from mechanical jam or single-phasing.' },
        { term: 'VFD (Variable Frequency Drive)', definition: 'Power electronic drive controlling 3-phase motor RPM via variable frequency (Hz) and volts-per-hertz ratio.', application: 'Soft-starting conveyors and matching fan/pump flow demand.' },
      ],
      practicalApplications: [
        'Diagnosing a motor that runs ONLY while the Start button is held down (failed seal-in contact or loose wire).',
        'Checking VFD fault logs (Overcurrent, Overvoltage on decel, Ground Fault) before resetting.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'motor_seal_in',
      caption: 'Simulate 3-wire motor starter operation and fault states.',
      interactiveStates: [
        { label: 'Start Held -> Latched', reading: 'Coil: 120V · M1 Aux: CLOSED · Motor: 1750 RPM', status: 'nominal', description: 'Seal-in path sustains coil after Start pushbutton opens.' },
        { label: 'Broken Seal-In Wire', reading: 'Runs ONLY while Start held · Drops on release', status: 'warning', description: 'Classic 3-wire control fault: holding auxiliary contact fails to latch.' },
        { label: 'Overload Tripped', reading: 'OL NC Contact: OPEN · Motor: 0 RPM', status: 'fault', description: 'Sustained overcurrent opened control circuit; inspect mechanical load before reset.' },
      ],
    },
    stage4Practice: {
      prompt: 'Identify the two root symptoms most associated with an open seal-in circuit vs. a tripped overload.',
      mode: 'component_match',
      items: [
        { id: 's1', label: 'Motor starts when button is held, stops the instant finger lifts', detail: 'Open seal-in auxiliary contact' },
        { id: 's2', label: 'Start button does nothing; OL trip flag is popped out', detail: 'Tripped thermal overload relay' },
      ],
      correctOrderOrIds: ['s1', 's2'],
      feedbackPass: 'Accurate! Differentiating holding-circuit faults from overload trips saves huge diagnostic time.',
      feedbackRetry: 'Think about which symptom happens only upon releasing the Start button.',
    },
    stage5Quiz: [
      {
        id: 'q-mtr-1',
        kind: 'scenario',
        prompt: 'A 3-phase conveyor motor starts when you press and hold Start, but stops immediately when you release the button. What is the most likely cause?',
        options: [
          'The main 480V fuses are blown.',
          'The motor starter’s seal-in auxiliary contact or its parallel wiring is open.',
          'Two motor phases are swapped.',
          'The VFD acceleration ramp is too fast.',
        ],
        correctIndex: 1,
        explanation: 'Because the motor runs while Start is held, primary power and the coil work—the latch (seal-in) circuit is failing to hold.',
        topicTag: 'Motor Starters',
      },
      {
        id: 'q-mtr-2',
        kind: 'multiple_choice',
        prompt: 'After wiring a new 3-phase motor, you observe the shaft spinning backward. How do you reverse rotation?',
        options: [
          'Flip the Stop pushbutton upside down.',
          'Under proper LOTO, swap any two of the three phase leads (e.g., T1 and T2).',
          'Increase the overload dial setting.',
          'Reverse the 120VAC coil wires A1 and A2.',
        ],
        correctIndex: 1,
        explanation: 'Reversing any two phase conductors reverses the rotating magnetic field direction in a 3-phase AC induction motor.',
        topicTag: '3-Phase Motors',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Why should a technician never repeatedly press the Overload Reset button without first investigating what caused the overload to trip?',
      checklistCriteria: [
        'Identifies risk of motor winding insulation burnout',
        'Notes mechanical jam, single-phasing, or high amp draw checks',
      ],
    },
  },

  // PATH 4: PLCs & AUTOMATION
  {
    id: 'plc-io-ladder',
    courseId: 'path-4-plc',
    order: 1,
    title: 'PLC Fundamentals, Inputs/Outputs & Ladder Logic',
    durationMinutes: 15,
    skillId: 'sk-plc-io',
    prerequisiteLessonIds: ['elec-ohms-schematics'],
    stage1Learn: {
      summary:
        'A Programmable Logic Controller (PLC) continuously repeats a four-step Scan Cycle: Read Inputs -> Execute Program Logic -> Update Outputs -> Housekeeping/Comms. Ladder logic mirrors electrical relay schematics using software instructions like XIC (Examine If Closed) and XIO (Examine If Open).',
      keyPoints: [
        'Input LEDs on a PLC card confirm whether the field signal actually reached the processor.',
        'XIC evaluates TRUE when its bit is 1; XIO evaluates TRUE when its bit is 0.',
        'Wiring a physical Normally Closed (NC) Stop button to a PLC input usually pairs with an XIC instruction in logic so a broken wire fails safe (Stop goes to 0 -> rung drops out).',
      ],
      analogy:
        'The PLC scan cycle is like a referee checking every player’s position (inputs), applying the rulebook (ladder logic), and blowing the whistle (outputs) hundreds of times every second.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Scan Cycle', definition: 'Continuous loop of Input Scan, Program Execution, Output Scan, and Diagnostics.', application: 'Typically runs every 2–20 milliseconds.' },
        { term: 'XIC (Examine If Closed)', definition: 'Ladder instruction true when the referenced input/memory bit equals 1.', application: 'Used for NO Start buttons and NC fail-safe Stop buttons.' },
        { term: 'XIO (Examine If Open)', definition: 'Ladder instruction true when the referenced bit equals 0.', application: 'Used for permissive faults or normally-false interlock conditions.' },
      ],
      practicalApplications: [
        'Using input/output module LEDs to quickly split a fault between field wiring and PLC program logic.',
        'Verifying fail-safe NC Stop logic inside an automated conveyor program.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'plc_scan',
      caption: 'Inspect how physical switch state interacts with XIC/XIO logic and output coils.',
      interactiveStates: [
        { label: 'NC Stop Healthy (Bit=1) · Start=0', reading: 'I:0/1 LED ON · O:0/0 OFF', status: 'nominal', description: 'Fail-safe Stop input holds bit 1; waiting for Start command.' },
        { label: 'Start Pressed -> Latched', reading: 'I:0/0=1 -> O:0/0 Latched ON', status: 'nominal', description: 'Rung continuity reaches O:0/0; parallel branch seals output.' },
        { label: 'Broken Wire on NC Stop', reading: 'I:0/1 LED OFF · O:0/0 Drops Out', status: 'fault', description: 'Fail-safe wiring immediately halts output when Stop wire opens.' },
      ],
    },
    stage4Practice: {
      prompt: 'Order the four steps of a standard PLC scan cycle.',
      mode: 'sequence',
      items: [
        { id: 'in', label: '1. Read Physical Inputs', detail: 'Copy field sensor/switch states into input image table.' },
        { id: 'prog', label: '2. Execute Ladder Logic', detail: 'Solve rungs top-to-bottom, left-to-right.' },
        { id: 'out', label: '3. Update Physical Outputs', detail: 'Energize/de-energize output module terminals.' },
        { id: 'comm', label: '4. Housekeeping & Comms', detail: 'Handle HMI tags, diagnostics, and overhead.' },
      ],
      correctOrderOrIds: ['in', 'prog', 'out', 'comm'],
      feedbackPass: 'Clean scan cycle mastery!',
      feedbackRetry: 'Inputs are read first, then logic executes, then physical outputs update.',
    },
    stage5Quiz: [
      {
        id: 'q-plc-1',
        kind: 'multiple_choice',
        prompt: 'A PLC output coil O:0/0 is bright green on your laptop monitor, yet the physical solenoid valve does not shift and the PLC output card LED is ON. Where is the fault?',
        options: [
          'Inside the PLC ladder program logic',
          'In the field output circuit (output power fuse, field wiring, or solenoid coil)',
          'Inside the input photoeye',
          'The scan cycle is running backwards',
        ],
        correctIndex: 1,
        explanation: 'Because the PLC logic and output card LED are both ON, the fault lies downstream between the output terminal and the field solenoid.',
        topicTag: 'PLC Half-Split',
      },
      {
        id: 'q-plc-2',
        kind: 'multiple_choice',
        prompt: 'Why is a physical Normally Closed (NC) Stop pushbutton normally paired with an XIC instruction in ladder logic?',
        options: [
          'So a broken Stop wire stops the machine automatically (fail-safe).',
          'Because PLCs cannot read Normally Open buttons.',
          'To double the motor RPM.',
          'To bypass the scan cycle.',
        ],
        correctIndex: 0,
        explanation: 'When wired NC, 24VDC is continuously present (1). If a wire breaks or the button is pressed, the bit drops to 0 and XIC opens.',
        topicTag: 'Fail-Safe Design',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain how checking PLC I/O status LEDs cuts troubleshooting time in half.',
      checklistCriteria: [
        'Separates field sensor/actuator faults from internal PLC logic/hardware',
      ],
    },
  },
  {
    id: 'plc-timers-sensors',
    courseId: 'path-4-plc',
    order: 2,
    title: 'Timers, Counters, Sensors & PLC Fault Diagnosis',
    durationMinutes: 15,
    skillId: 'sk-sensors-plc',
    prerequisiteLessonIds: ['plc-io-ladder'],
    stage1Learn: {
      summary:
        'Automated machines coordinate events using On-Delay Timers (TON), Up Counters (CTU), and field sensors (inductive proximity sensors for metal, photoelectric eyes for packages, mechanical limit switches for end-of-travel).',
      keyPoints: [
        'TON timers count Accumulated time (.ACC) up to Preset (.PRE) while rung-in is TRUE, then set the Done (.DN) bit.',
        'Inductive proximity sensors detect ferrous/non-ferrous metals without contact; verify sensing distance (typically a few millimeters) and PNP vs. NPN wiring.',
        'Misaligned photoeyes or dirty reflectors are among the top causes of false jam timers in packaging lines.',
      ],
      analogy:
        'A TON timer is like holding down an elevator Door-Close button—it only reaches "Done" if the condition stays true continuously for the full preset.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'TON (Timer On-Delay)', definition: 'Timer instruction that increments when rung is true and resets ACC to 0 when rung goes false.', application: '5-second jam-detection delay or startup warning horn.' },
        { term: 'CTU (Count Up)', definition: 'Counter that increments by 1 on each false-to-true rung transition until ACC >= PRE.', application: 'Counting 12 bottles per case before triggering a pusher.' },
        { term: 'Inductive Proximity Sensor', definition: 'Non-contact solid-state switch detecting metallic targets via an electromagnetic field.', application: 'Confirming hydraulic cylinder end-of-stroke or gear tooth speed.' },
      ],
      practicalApplications: [
        'Diagnosing why a jam-detection TON timer triggers prematurely due to a flickering photoeye.',
        'Checking sensor supply voltage and indicator LED before replacing a proximity switch.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'plc_scan',
      caption: 'Trace TON timer accumulation and sensor input pulse behavior.',
      interactiveStates: [
        { label: 'Part Clears Photoeye (< 3.0s)', reading: 'ACC: 0.8s / PRE: 3.0s · DN=0', status: 'nominal', description: 'Normal carton transit; timer resets cleanly as photoeye clears.' },
        { label: 'Carton Stalled (> 3.0s)', reading: 'ACC: 3.0s / PRE: 3.0s · DN=1', status: 'fault', description: 'Timer reaches Preset and latches Conveyor Jam Fault alarm.' },
      ],
    },
    stage4Practice: {
      prompt: 'Select the right sensor type for each industrial application.',
      mode: 'component_match',
      items: [
        { id: 'p1', label: 'Detect steel pallet stops at 4 mm range in oily environment', detail: 'Inductive Proximity Sensor' },
        { id: 'p2', label: 'Detect cardboard boxes across a 1.5-meter conveyor lane', detail: 'Retro-Reflective Photoeye' },
      ],
      correctOrderOrIds: ['p1', 'p2'],
      feedbackPass: 'Great sensor selection!',
      feedbackRetry: 'Remember inductive sensors only sense metal at short range; photoeyes handle longer-distance non-metal objects.',
    },
    stage5Quiz: [
      {
        id: 'q-ts-1',
        kind: 'multiple_choice',
        prompt: 'What happens to a standard TON (Timer On-Delay) Accumulated value (.ACC) if its input rung goes FALSE halfway to the Preset?',
        options: [
          'It freezes at the halfway value.',
          'It immediately resets .ACC back to 0 and clears .DN.',
          'It jumps straight to Done (.DN = 1).',
          'It counts backward slowly.',
        ],
        correctIndex: 1,
        explanation: 'A non-retentive TON timer resets to 0 whenever rung continuity drops to false.',
        topicTag: 'PLC Timers',
      },
      {
        id: 'q-ts-2',
        kind: 'scenario',
        prompt: 'A packaging counter increments by 2 or 3 counts every time a single box passes a photoeye. What is the likely issue?',
        options: [
          'Flapping box flaps or loose photoeye mounting causing signal chatter/bounce',
          'The conveyor motor is spinning backward',
          'The counter Preset is too low',
          'The PLC needs a firmware erase',
        ],
        correctIndex: 0,
        explanation: 'Signal bounce from fluttering flaps or vibration creates multiple false-to-true transitions on the CTU input.',
        topicTag: 'Counters & Sensors',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain how you would stabilize a noisy photoeye causing false CTU counts without altering safety circuits.',
      checklistCriteria: [
        'Checks mechanical alignment, reflector cleanliness, and flap control',
        'Notes PLC input debounce timer option if appropriate',
      ],
    },
  },

  // PATH 5: HYDRAULICS
  {
    id: 'hyd-principles-valves',
    courseId: 'path-5-hydraulics',
    order: 1,
    title: 'Hydraulic Principles, Pumps, Reservoirs & Pressure/Flow',
    durationMinutes: 15,
    skillId: 'sk-hyd-principles',
    prerequisiteLessonIds: ['safety-loto'],
    stage1Learn: {
      summary:
        'Hydraulics transmits tremendous force using incompressible oil. A critical principle: **pumps create flow (GPM), while resistance to that flow creates pressure (PSI)**. Force equals Pressure × Area (F = P × A), and cylinder speed depends on flow rate.',
      keyPoints: [
        'Never mistake a missing pump flow issue for a relief valve fault without checking both pressure and flow.',
        'The Pressure Relief Valve caps maximum system pressure to protect hoses, pumps, and cylinders.',
        'Reservoirs store fluid, dissipate heat, and allow air bubbles and contaminants to settle.',
      ],
      analogy:
        'Your heart (pump) pushes blood flow; narrowing an artery or lifting a heavy weight creates resistance (pressure).',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Pascal’s Law (F = P × A)', definition: 'Pressure applied to a confined fluid transmits undiminished in all directions.', application: '2,000 PSI on a 10 sq. in. piston yields 20,000 lbs of force.' },
        { term: 'Pressure Relief Valve', definition: 'Normally closed safety valve that opens to tank when system pressure exceeds its spring setting.', application: 'Protects hydraulic power unit at e.g. 2,200 PSI.' },
        { term: 'Cavitation', definition: 'Formation and violent collapse of vapor bubbles when pump suction is restricted.', application: 'Sounds like marbles rattling inside the pump; caused by clogged suction strainer.' },
      ],
      practicalApplications: [
        'Recognizing pump whine/rattling caused by a clogged suction filter or low reservoir oil.',
        'Distinguishing cylinder speed (GPM flow) from cylinder pushing force (PSI pressure).',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'hydraulic_valve',
      caption: 'Explore hydraulic pump flow, relief pressure, and cylinder force relationships.',
      interactiveStates: [
        { label: 'Normal Load Extension', reading: '1,450 PSI · 8.0 GPM · 125°F', status: 'nominal', description: 'Relief closed; full pump flow extends cylinder smoothly against load.' },
        { label: 'Stalled Against Relief', reading: '2,200 PSI · 0 GPM to Cyl · Heating', status: 'warning', description: 'Load exceeds relief setting; oil bypasses over relief valve generating heat.' },
        { label: 'Clogged Suction Strainer', reading: '350 PSI · 1.8 GPM · Pump Cavitation', status: 'fault', description: 'Pump starved of oil; sluggish actuator and noisy pump housing.' },
      ],
    },
    stage4Practice: {
      prompt: 'Match each hydraulic variable to what it controls.',
      mode: 'component_match',
      items: [
        { id: 'h1', label: 'Pump Flow Rate (GPM)', detail: 'Controls how FAST the hydraulic cylinder extends' },
        { id: 'h2', label: 'System Pressure (PSI)', detail: 'Controls how much FORCE the hydraulic cylinder exerts' },
      ],
      correctOrderOrIds: ['h1', 'h2'],
      feedbackPass: 'Fundamental hydraulic rule locked in: Flow = Speed, Pressure = Force!',
      feedbackRetry: 'Remember: Flow drives speed (GPM); Pressure drives force (PSI).',
    },
    stage5Quiz: [
      {
        id: 'q-hyd-1',
        kind: 'multiple_choice',
        prompt: 'What actually creates pressure (PSI) inside a hydraulic circuit?',
        options: [
          'The pump directly compresses the oil like air.',
          'Resistance to the fluid flow created by the pump (load, restriction, or relief valve).',
          'The return line tank breather.',
          'Reservoir oil temperature alone.',
        ],
        correctIndex: 1,
        explanation: 'Pumps generate flow; pressure only rises when that flow encounters resistance.',
        topicTag: 'Hydraulic Principles',
      },
      {
        id: 'q-hyd-2',
        kind: 'scenario',
        prompt: 'A hydraulic pump begins rattling like marbles inside the housing and the actuator moves very slowly. What should you inspect first?',
        options: [
          'Reservoir oil level and suction strainer for restriction (cavitation)',
          'Paint color on the cylinder barrel',
          'Swap the directional valve solenoids',
          'Increase electrical breaker size',
        ],
        correctIndex: 0,
        explanation: 'Rattling noise + low flow indicates pump cavitation from low oil level, clogged suction screen, or air ingress on the inlet line.',
        topicTag: 'Pump Cavitation',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Why does running a hydraulic system continuously over the Pressure Relief Valve overheat the hydraulic oil?',
      checklistCriteria: [
        'Explains pressurized oil dropping across relief orifice converts mechanical work directly into heat',
      ],
    },
  },
  {
    id: 'hyd-schematics-faults',
    courseId: 'path-5-hydraulics',
    order: 2,
    title: 'Directional Valves, Cylinders, Schematics & Fault ID',
    durationMinutes: 14,
    skillId: 'sk-hyd-valves',
    prerequisiteLessonIds: ['hyd-principles-valves'],
    stage1Learn: {
      summary:
        'Directional Control Valves (DCVs) such as 4-way, 3-position (4/3) spool valves route pressurized oil to either the cap end or rod end of a double-acting cylinder while returning opposite fluid to tank. Internal piston seal leaks cause cylinder drift and sluggish force.',
      keyPoints: [
        'On a 4/3 valve schematic, each square box represents one spool position (Left shift, Center neutral, Right shift).',
        'Center conditions matter: Closed-center blocks all ports; Tandem-center dumps pump flow to tank while locking cylinder ports.',
        'Because the piston rod occupies volume on the rod side, a cylinder retracts faster than it extends at equal flow, but exerts less pulling force.',
      ],
      analogy:
        'A 4/3 valve is like a railroad track switch: sliding the spool aligns different internal passages to send oil left, right, or straight back to the depot.',
    },
    stage2Understand: {
      vocabulary: [
        { term: '4/3 Directional Control Valve', definition: 'Valve with 4 main ports (P, T, A, B) and 3 distinct spool positions.', application: 'Controls extend, hold/neutral, and retract of a double-acting cylinder.' },
        { term: 'Internal Cylinder Bypass', definition: 'Worn piston seals allowing high-pressure oil to leak past the piston to the return side.', application: 'Causes cylinder drift under load and hot cylinder barrel.' },
      ],
      practicalApplications: [
        'Reading P (Pressure), T (Tank), A, and B ports on hydraulic manifold schematics.',
        'Diagnosing stuck DCV spools caused by varnish or fine particulate contamination.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'hydraulic_valve',
      caption: 'Toggle 4/3 directional valve commands and inspect A/B port flow.',
      interactiveStates: [
        { label: 'Neutral Center (Tandem)', reading: 'P->T Open · A/B Blocked', status: 'nominal', description: 'Pump circulates oil at low pressure; cylinder holds position.' },
        { label: 'Solenoid A Energized (Extend)', reading: 'P->A · B->T · Extending', status: 'nominal', description: 'High-pressure oil enters cap end; rod extends under load.' },
        { label: 'Worn Piston Seal Bypass', reading: 'Drift Under Load · Warm Barrel', status: 'fault', description: 'Fluid leaks internally from A side to B side past piston seal.' },
      ],
    },
    stage4Practice: {
      prompt: 'Identify the correct hydraulic port labels on a standard 4/3 valve.',
      mode: 'component_match',
      items: [
        { id: 'hp1', label: 'Port P', detail: 'High-pressure supply from hydraulic pump' },
        { id: 'hp2', label: 'Port T', detail: 'Low-pressure return line back to reservoir tank' },
        { id: 'hp3', label: 'Ports A & B', detail: 'Work lines connected to cylinder cap and rod ends' },
      ],
      correctOrderOrIds: ['hp1', 'hp2', 'hp3'],
      feedbackPass: 'Hydraulic port conventions mastered!',
      feedbackRetry: 'P = Pump/Pressure, T = Tank, A & B = Actuator work ports.',
    },
    stage5Quiz: [
      {
        id: 'q-hyd-3',
        kind: 'multiple_choice',
        prompt: 'Why does a standard single-rod double-acting cylinder retract faster than it extends when pump GPM is constant?',
        options: [
          'The rod occupies volume on the rod side, leaving less annular volume to fill.',
          'Oil flows faster uphill during retraction.',
          'The relief valve doubles pump speed on retract.',
          'Gravity always pulls it backward.',
        ],
        correctIndex: 0,
        explanation: 'Smaller effective area on the rod side requires less fluid volume per inch of stroke, producing faster travel with lower force.',
        topicTag: 'Hydraulic Cylinders',
      },
      {
        id: 'q-hyd-4',
        kind: 'scenario',
        prompt: 'A hydraulic press cylinder slowly sinks downward under load when the 4/3 closed-center valve is in Neutral, and there are zero external oil drips. What is failing?',
        options: [
          'Worn internal piston seal allowing fluid to bypass across the piston',
          'Empty hydraulic reservoir',
          'Disconnected electric motor',
          'Clogged return filter',
        ],
        correctIndex: 0,
        explanation: 'Without external leaks, load-induced drift points to internal bypass past worn piston seals or a leaking load-holding check valve.',
        topicTag: 'Hydraulic Faults',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Before loosening any hydraulic fitting to inspect a valve or cylinder, what safety steps must a technician perform?',
      checklistCriteria: [
        'Shut down & lock out pump motor, lower suspended loads, bleed accumulator/trapped pressure to 0 PSI',
        'Never check for pinhole hydraulic leaks with bare hands',
      ],
    },
  },

  // PATH 6: PNEUMATICS
  {
    id: 'pneu-airprep-valves',
    courseId: 'path-6-pneumatics',
    order: 1,
    title: 'Compressors, FRL Air Preparation & Regulators',
    durationMinutes: 13,
    skillId: 'sk-pneu-frl',
    prerequisiteLessonIds: ['safety-loto'],
    stage1Learn: {
      summary:
        'Compressed air is clean and fast, but raw air from a compressor contains moisture, oil mist, and scale that ruin valves and cylinders. Every pneumatic branch relies on an FRL unit—Filter, Regulator, and Lubricator—placed in exact upstream-to-downstream order.',
      keyPoints: [
        'Always install F -> R -> L in order: Filter removes water/particles first, Regulator steps pressure down smoothly, Lubricator adds controlled oil mist last (if required by non-lube-free valves).',
        'Drain moisture traps and receiver tanks regularly; water washes out cylinder grease and corrodes spool valves.',
        'Compressed air is compressible—never exceed component PSI ratings and never use compressed air to dust off clothing or skin.',
      ],
      analogy:
        'An FRL is like a municipal water station for air: clean the grit out first, regulate the street pressure second, and condition it last.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'FRL Unit', definition: 'Combination Filter, Pressure Regulator (with gauge), and Lubricator conditioning compressed air.', application: 'Mounted at machine air drop immediately downstream of lockout dump valve.' },
        { term: 'Relieving Regulator', definition: 'Pressure regulator that vents excess downstream pressure to atmosphere when dialed down.', application: 'Allows safe pressure adjustment from 90 PSI down to 60 PSI.' },
      ],
      practicalApplications: [
        'Setting machine working pressure to 80–90 PSI instead of running plant header at 115 PSI wastes less energy and reduces wear.',
        'Checking filter bowl condensate drains during daily PM walks.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'pneumatic_frl',
      caption: 'Adjust FRL regulator conditions and observe actuator health.',
      interactiveStates: [
        { label: 'Clean Air · 85 PSI Regulated', reading: 'Header: 110 PSI -> Reg: 85 PSI', status: 'nominal', description: 'Moisture drained, smooth downstream pressure, crisp valve response.' },
        { label: 'Saturated Filter / Pressure Drop', reading: 'Header: 110 PSI -> Out: 42 PSI', status: 'warning', description: 'Clogged filter element starves actuators under rapid cycling.' },
        { label: 'Air Line Leak', reading: 'Compressor Duty 95% · 48 PSI', status: 'fault', description: 'Major fitting leak drops downstream pressure and wastes compressor energy.' },
      ],
    },
    stage4Practice: {
      prompt: 'Order the FRL components from air inlet (upstream) to machine outlet (downstream).',
      mode: 'sequence',
      items: [
        { id: 'f', label: '1. Filter (Water & Particulate)', detail: 'Removes moisture droplets and pipe scale first.' },
        { id: 'r', label: '2. Pressure Regulator', detail: 'Reduces and stabilizes pressure to machine spec.' },
        { id: 'l', label: '3. Lubricator (if specified)', detail: 'Adds fine oil mist to conditioned air.' },
      ],
      correctOrderOrIds: ['f', 'r', 'l'],
      feedbackPass: 'F-R-L order verified!',
      feedbackRetry: 'Remember the acronym itself gives the flow order: Filter -> Regulator -> Lubricator.',
    },
    stage5Quiz: [
      {
        id: 'q-pneu-1',
        kind: 'multiple_choice',
        prompt: 'Why must the Filter come BEFORE the Pressure Regulator in an FRL assembly?',
        options: [
          'So moisture and rust particles do not foul the regulator diaphragm and seat.',
          'Because filters work better at low pressure only.',
          'To heat up the compressed air.',
          'It doesn’t matter which comes first.',
        ],
        correctIndex: 0,
        explanation: 'Unfiltered rust and condensate jam regulator internals and damage downstream valve seals.',
        topicTag: 'Air Preparation',
      },
      {
        id: 'q-pneu-2',
        kind: 'scenario',
        prompt: 'Your regulator gauge reads 85 PSI at idle, but plunges to 40 PSI the moment two pneumatic cylinders fire together. What is the prime suspect?',
        options: [
          'Clogged filter element or undersized supply restriction upstream of the gauge',
          'Excessive lubricator oil',
          'Cylinder bore too small',
          'Grounded PLC input',
        ],
        correctIndex: 0,
        explanation: 'Static pressure looks normal with zero flow, but severe restriction (clogged filter/kinked hose) causes huge dynamic pressure drop under flow.',
        topicTag: 'Pressure Drop',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Why do industrial pneumatic lockout valves automatically exhaust downstream air to atmosphere when locked out?',
      checklistCriteria: [
        'Explains stored compressed air hazard in cylinders and lines',
        'Notes 3-way exhausting/dump function brings machine to zero-energy state',
      ],
    },
  },
  {
    id: 'pneu-circuits-troubleshoot',
    courseId: 'path-6-pneumatics',
    order: 2,
    title: '5/2 Solenoid Valves, Cylinders & Pneumatic Troubleshooting',
    durationMinutes: 14,
    skillId: 'sk-pneu-circuits',
    prerequisiteLessonIds: ['pneu-airprep-valves'],
    stage1Learn: {
      summary:
        'Most double-acting pneumatic cylinders are driven by 5/2-way directional solenoid valves (5 ports, 2 positions) paired with meter-out flow control needle valves. Meter-out speed control stabilizes jerky cylinder motion because air is compressible.',
      keyPoints: [
        '5 ports on a 5/2 valve: 1 Pressure (P), 2 Work ports (A, B), and 2 Exhaust ports (EA, EB).',
        'A plugged exhaust muffler creates backpressure that slows or stalls a cylinder just like low supply pressure.',
        'Use ultrasonic leak detectors or soapy water—never bare hands—to pinpoint leaks on fittings and cylinder rod seals.',
      ],
      analogy:
        'Meter-out speed control works like letting air slowly out of a tire valve while pushing a piston—controlling the escaping exhaust keeps motion smooth instead of bouncy.',
    },
    stage2Understand: {
      vocabulary: [
        { term: '5/2 Solenoid Valve', definition: 'Directional valve with 5 ports (P, A, B, EA, EB) and 2 switched positions.', application: 'Standard actuator control for double-acting air cylinders.' },
        { term: 'Meter-Out Flow Control', definition: 'Check-and-needle valve restricting exhaust air leaving the cylinder.', application: 'Prevents erratic "slip-stick" motion under varying loads.' },
      ],
      practicalApplications: [
        'Using the manual override pin on a solenoid valve to split an electrical coil fault from a mechanical/air fault.',
        'Cleaning or replacing oil-fouled bronze exhaust mufflers.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'pneumatic_frl',
      caption: 'Observe 5/2 solenoid valve actuation and exhaust muffler restriction.',
      interactiveStates: [
        { label: 'Solenoid Energized · Clean Exhaust', reading: 'Supply: 85 PSI · Stroke: 0.9s', status: 'nominal', description: 'Air enters cap end while rod-end exhaust vents smoothly through meter-out valve.' },
        { label: 'Plugged Exhaust Muffler', reading: 'Supply: 85 PSI · Backpressure: 52 PSI', status: 'fault', description: 'Trapped exhaust pressure opposes piston travel, stalling stroke.' },
      ],
    },
    stage4Practice: {
      prompt: 'Choose the best diagnostic step when a PLC turns ON a pneumatic valve output, yet the cylinder refuses to move.',
      mode: 'component_match',
      items: [
        { id: 'pn1', label: 'Verify air gauge shows 80+ PSI at valve manifold', detail: 'Check pneumatic energy supply' },
        { id: 'pn2', label: 'Check solenoid LED / coil voltage and inspect exhaust muffler', detail: 'Isolate coil vs. mechanical/exhaust jam' },
      ],
      correctOrderOrIds: ['pn1', 'pn2'],
      feedbackPass: 'Solid pneumatic troubleshooting logic!',
      feedbackRetry: 'Check both supply pressure and solenoid/exhaust path.',
    },
    stage5Quiz: [
      {
        id: 'q-pneu-3',
        kind: 'multiple_choice',
        prompt: 'Why should flow control valves on a pneumatic cylinder normally be mounted in a meter-out configuration?',
        options: [
          'Meter-out traps backpressure against the exhausting side, stabilizing compressible air motion.',
          'Meter-out doubles maximum cylinder force.',
          'Meter-in is illegal on 5/2 valves.',
          'It eliminates the need for an air filter.',
        ],
        correctIndex: 0,
        explanation: 'Trapping exhaust air cushions the piston against air compressibility and prevents lunging when loads vary.',
        topicTag: 'Pneumatic Speed Control',
      },
      {
        id: 'q-pneu-4',
        kind: 'scenario',
        prompt: 'A pneumatic cylinder extends briskly, then slams slowly or stalls halfway back on retract. You unscrew the bronze exhaust muffler on port EB and it immediately snaps back smoothly. What was wrong?',
        options: [
          'The exhaust muffler was clogged with oil/dirt, creating backpressure.',
          'The compressor tank ran out of air.',
          'The PLC program had a counter error.',
          'The regulator was set too high.',
        ],
        correctIndex: 0,
        explanation: 'A fouled muffler blocks exhaust flow, building trapped backpressure that opposes piston return.',
        topicTag: 'Pneumatic Troubleshooting',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Explain how a technician uses a solenoid valve manual override test safely to separate an electrical issue from an air/mechanical issue.',
      checklistCriteria: [
        'Warns to stay clear of cylinder pinch points before actuating manual override',
        'Explains that movement on override points upstream to electrical/PLC control issue',
      ],
    },
  },

  // PATH 7: INDUSTRIAL TROUBLESHOOTING
  {
    id: 'ts-systematic-rca',
    courseId: 'path-7-troubleshooting',
    order: 1,
    title: 'Systematic Fault Diagnosis & Root-Cause Analysis',
    durationMinutes: 15,
    skillId: 'sk-systematic-ts',
    prerequisiteLessonIds: ['elec-starters-vfd', 'plc-io-ladder'],
    stage1Learn: {
      summary:
        'Great troubleshooters avoid "parts cannon" guessing. Systematic diagnosis gathers symptoms from the operator, verifies safety/energy, splits the system in half (half-split method), tests hypotheses with measurements, and uses 5-Why / Fishbone analysis to eliminate the true root cause.',
      keyPoints: [
        'Gather facts first: What changed? Did it fail suddenly or gradually? What fault codes appeared?',
        'Half-split method: Check the midpoint of a process chain (e.g., PLC output LED or motor starter coil) to eliminate 50% of possibilities in one step.',
        'Replacing a blown fuse without finding why it blew only guarantees a repeat breakdown.',
      ],
      analogy:
        'Half-splitting is like looking up a word in a dictionary: open to the middle to discard half the book immediately, rather than flipping page 1, 2, 3.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'Half-Split Method', definition: 'Diagnostic strategy testing at the logical midpoint between power/input and final actuator.', application: 'Checking PLC output LED splits program/inputs from field solenoid/wiring.' },
        { term: '5-Why Analysis', definition: 'Iterative questioning technique peeling back symptoms to uncover physical, process, or system root causes.', application: 'Fuse blew -> short in cord -> cord pinched -> missing strain relief clamp.' },
        { term: 'Fishbone (Ishikawa) Diagram', definition: 'Structured brainstorming map sorting causes across Machine, Method, Material, Man, Measurement, Environment.', application: 'Team root-cause investigation after recurring line stoppage.' },
      ],
      practicalApplications: [
        'Documenting root cause on CMMS work orders so recurring failures trigger preventive redesigns.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'rca_fishbone',
      caption: 'Trace how 5-Why peels a symptom back to an actionable corrective action.',
      interactiveStates: [
        { label: 'Level 1 Symptom: Motor Tripped', reading: 'Resetting OL only treats symptom', status: 'fault', description: 'Immediate machine stoppage observed by operator.' },
        { label: 'Level 3 Cause: Conveyor Jammed', reading: 'Worn guide rail binding belt', status: 'warning', description: 'Physical drag pushed motor amps above 115% FLA.' },
        { label: 'Level 5 Root Cause: Missing PM Check', reading: 'Add rail wear check to monthly PM', status: 'nominal', description: 'Permanent corrective action prevents recurrence.' },
      ],
    },
    stage4Practice: {
      prompt: 'Order the systematic troubleshooting workflow.',
      mode: 'sequence',
      items: [
        { id: 't1', label: '1. Observe & Gather Complaint', detail: 'Interview operator, inspect HMI faults, check visual condition.' },
        { id: 't2', label: '2. Apply Safety & Half-Split Test', detail: 'Verify safe test access and split the circuit/process at midpoint.' },
        { id: 't3', label: '3. Isolate Fault & Root Cause', detail: 'Confirm failed component and WHY it failed.' },
        { id: 't4', label: '4. Repair, Verify & Document', detail: 'Test full cycle under load and log root cause in CMMS.' },
      ],
      correctOrderOrIds: ['t1', 't2', 't3', 't4'],
      feedbackPass: 'Disciplined troubleshooting workflow!',
      feedbackRetry: 'Gather symptoms first, half-split to isolate, find root cause, then verify and document.',
    },
    stage5Quiz: [
      {
        id: 'q-ts-3',
        kind: 'multiple_choice',
        prompt: 'A technician replaces a blown 2A control fuse three times in one week without testing downstream wiring. Which step are they skipping?',
        options: [
          'Root-cause analysis',
          'Ordering spare fuses',
          'Checking motor RPM',
          'Updating PPE size',
        ],
        correctIndex: 0,
        explanation: 'A fuse is a symptom/sacrificial protector; root-cause analysis locates the shorted solenoid, pinched wire, or failing coil causing overcurrent.',
        topicTag: 'Root-Cause Analysis',
      },
      {
        id: 'q-ts-4',
        kind: 'multiple_choice',
        prompt: 'In an 8-component serial control chain, what is the biggest advantage of the half-split method?',
        options: [
          'It eliminates half of the possible fault locations with each diagnostic check.',
          'It requires no schematics or meters.',
          'It bypasses LOTO requirements.',
          'It automatically repairs broken wires.',
        ],
        correctIndex: 0,
        explanation: 'Testing at step 4 immediately tells you whether the fault lies in steps 1–4 or steps 5–8.',
        topicTag: 'Systematic Diagnosis',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Write a quick 3-step 5-Why chain starting from: "Conveyor belt shredded on shift 2."',
      checklistCriteria: [
        'Moves beyond "belt broke" to mechanical/process root cause',
        'Includes a preventive corrective action',
      ],
    },
  },
  {
    id: 'ts-pm-cmms',
    courseId: 'path-7-troubleshooting',
    order: 2,
    title: 'Preventive Maintenance, Inspections & CMMS Work Orders',
    durationMinutes: 13,
    skillId: 'sk-pm-cmms',
    prerequisiteLessonIds: ['ts-systematic-rca'],
    stage1Learn: {
      summary:
        'Preventive Maintenance (PM) catches wear before unplanned downtime strikes. A Computerized Maintenance Management System (CMMS) turns technician inspections into trackable asset history—allowing reliability teams to spot bad actors and optimize spare parts.',
      keyPoints: [
        'Use all senses safely during inspections: listen for bearing grind, look for oil/air leaks and belt dust, check non-contact IR temperatures.',
        'Never close a CMMS work order with just "Fixed it"—record As-Found condition, Action Taken, Parts Used, and As-Left verification.',
        'Distinguish Preventive Maintenance (time/meter based) from Predictive Maintenance (condition-based: vibration, IR thermography, oil analysis).',
      ],
      analogy:
        'A CMMS work order history is like a medical chart for a machine: future technicians rely on accurate notes to see recurring symptoms.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'CMMS', definition: 'Computerized Maintenance Management System tracking assets, PM schedules, work orders, and spare parts.', application: 'Logging motor amp draw and bearing replacement on Conveyor #4.' },
        { term: 'As-Found / As-Left', definition: 'Documentation standard contrasting equipment condition upon arrival vs. verified operating state after repair.', application: 'As-Found: Chain slack 2.5"; As-Left: Tensioned to 0.5" sag, guard torqued.' },
      ],
      practicalApplications: [
        'Writing clean, searchable work-order closeout notes.',
        'Converting recurring reactive breakdowns into scheduled PM inspection items.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'rca_fishbone',
      caption: 'Compare vague vs. professional CMMS work order closeout documentation.',
      interactiveStates: [
        { label: 'Poor Note: "Fixed conveyor"', reading: 'Zero root cause · Zero parts · No verification', status: 'fault', description: 'Provides zero diagnostic history for next shift.' },
        { label: 'Actionable CMMS Record', reading: 'As-Found + Root Cause + Parts + As-Left Test', status: 'nominal', description: 'Enables failure trend analysis and accurate spare parts forecasting.' },
      ],
    },
    stage4Practice: {
      prompt: 'Select the fields required for a complete, high-value CMMS work order closeout.',
      mode: 'component_match',
      items: [
        { id: 'cm1', label: 'As-Found problem & verified root cause', detail: 'Diagnostic clarity' },
        { id: 'cm2', label: 'Exact replacement part numbers & quantities', detail: 'Inventory accuracy' },
        { id: 'cm3', label: 'As-Left operational test & safety restoration check', detail: 'Handover verification' },
      ],
      correctOrderOrIds: ['cm1', 'cm2', 'cm3'],
      feedbackPass: 'Complete CMMS closeout standard!',
      feedbackRetry: 'All three elements belong in a thorough work order record.',
    },
    stage5Quiz: [
      {
        id: 'q-pm-1',
        kind: 'multiple_choice',
        prompt: 'Which work order closeout note is most useful to the maintenance team?',
        options: [
          '"Machine fixed, running now."',
          '"Reset breaker."',
          '"As-Found: Photoeye PE-04 bracket bent out of alignment causing jam fault. Realigned bracket, cleaned reflector, tightened mount, tested 20 cartons As-Left OK."',
          '"Replaced stuff."',
        ],
        correctIndex: 2,
        explanation: 'Detailed As-Found, Action Taken, and As-Left records eliminate repeated troubleshooting guesswork.',
        topicTag: 'CMMS Documentation',
      },
      {
        id: 'q-pm-2',
        kind: 'multiple_choice',
        prompt: 'Infrared thermography scanning of an electrical panel without opening live covers (via IR window) is an example of:',
        options: [
          'Predictive / Condition-Based Maintenance (PdM)',
          'Run-to-Failure maintenance',
          'Emergency breakdown repair',
          'Capital demolition',
        ],
        correctIndex: 0,
        explanation: 'Thermography monitors equipment condition non-invasively to schedule repairs before failure.',
        topicTag: 'PM vs PdM',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Draft a concise 3-sentence CMMS closeout note for replacing a worn coupling insert on Pump P-102.',
      checklistCriteria: [
        'States As-Found symptom, corrective action + alignment check, and As-Left test',
      ],
    },
  },

  // PATH 8: ADVANCED TECHNICIAN DEVELOPMENT
  {
    id: 'adv-electromech-networks',
    courseId: 'path-8-advanced',
    order: 1,
    title: 'Integrated Electromechanical Systems & Industrial Networking',
    durationMinutes: 16,
    skillId: 'sk-electromech',
    prerequisiteLessonIds: ['ts-pm-cmms', 'plc-timers-sensors'],
    stage1Learn: {
      summary:
        'Modern manufacturing lines combine PLCs, VFDs, servo drives, hydraulic/pneumatic actuators, and industrial Ethernet networks (such as EtherNet/IP or PROFINET). Technicians must trace faults seamlessly across network links, software tags, electrical power, and mechanical hardware.',
      keyPoints: [
        'Industrial Ethernet troubleshooting starts at Layer 1: check link/activity LEDs, shielded M12/RJ45 connectors, and switch power before assuming PLC software corruption.',
        'IP address conflicts or wrong subnet masks prevent PLC-to-VFD communication.',
        'Integrated systems require verifying interlock handshakes between upstream and downstream machines.',
      ],
      analogy:
        'If a PLC is the brain and motors are muscles, industrial Ethernet is the nervous system—a single loose shielded connector can silence an entire drive node.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'EtherNet/IP / Fieldbus Node', definition: 'Networked industrial device (VFD, remote I/O block, HMI) exchanging cyclic I/O data with a PLC.', application: 'Remote I/O rack on a palletizer dropping offline due to damaged patch cable.' },
        { term: 'Link / Activity LED', definition: 'Port indicator confirming physical Ethernet electrical link and packet traffic.', application: 'Dark Link LED immediately isolates a bad cable, unplugged port, or unpowered switch.' },
      ],
      practicalApplications: [
        'Tracing a "VFD Comm Loss" alarm from switch port LED -> shielded cable -> IP configuration.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'network_ring',
      caption: 'Inspect an integrated PLC -> Managed Switch -> VFD / Remote I/O network loop.',
      interactiveStates: [
        { label: 'All Nodes Cyclic OK', reading: 'Link: 100Mbps Full · 0 Packet Loss', status: 'nominal', description: 'PLC exchanges real-time torque/speed commands with VFD and Remote I/O.' },
        { label: 'Damaged Patch Cable on VFD-2', reading: 'Link LED: OFF · PLC Fault: Node 192.168.1.22 Lost', status: 'fault', description: 'Physical layer break halts drive command; inspect cable/connector strain relief.' },
      ],
    },
    stage4Practice: {
      prompt: 'Order the OSI Layer-1-up approach for diagnosing a "Remote I/O Communication Timeout".',
      mode: 'sequence',
      items: [
        { id: 'n1', label: '1. Verify 24VDC Power & Link LEDs', detail: 'Confirm node and managed switch have power and solid physical link.' },
        { id: 'n2', label: '2. Inspect Cable & Shielding', detail: 'Check flex-rated cable for crush damage or loose M12 connector.' },
        { id: 'n3', label: '3. Verify IP Address & Ping', detail: 'Confirm rotary switches / static IP match PLC I/O tree.' },
      ],
      correctOrderOrIds: ['n1', 'n2', 'n3'],
      feedbackPass: 'Physical-layer-first diagnostics saves hours of unnecessary PLC downloads!',
      feedbackRetry: 'Always verify power and physical link LEDs before checking IP settings.',
    },
    stage5Quiz: [
      {
        id: 'q-adv-1',
        kind: 'scenario',
        prompt: 'After replacing a failed VFD with an identical spare, the drive powers up cleanly but the PLC still shows "Module Comm Fault". What was likely missed?',
        options: [
          'Setting the replacement VFD’s IP address / network parameters to match the PLC configuration',
          'Swapping two 480V input phases',
          'Lubricating the VFD heatsink',
          'Increasing hydraulic relief pressure',
        ],
        correctIndex: 0,
        explanation: 'A brand-new out-of-the-box VFD lacks the previous unit’s static IP address or fieldbus node ID.',
        topicTag: 'Industrial Networking',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Outline your step-by-step verification checklist after swapping a networked Remote I/O module.',
      checklistCriteria: [
        'Covers physical wiring/power check, IP/node setting, link LEDs, and I/O functional test',
      ],
    },
  },
  {
    id: 'adv-rcm-leadership',
    courseId: 'path-8-advanced',
    order: 2,
    title: 'Reliability-Centered Maintenance, Planning & Leadership',
    durationMinutes: 14,
    skillId: 'sk-rcm-planning',
    prerequisiteLessonIds: ['adv-electromech-networks'],
    stage1Learn: {
      summary:
        'Reliability-Centered Maintenance (RCM) aligns maintenance strategy with equipment criticality and failure modes—choosing the right mix of preventive, predictive, or run-to-failure tasks. Senior technicians also lead shift handovers, mentor apprentices, and plan kitted jobs for wrench-time efficiency.',
      keyPoints: [
        'Criticality = Probability of Failure × Consequence (Safety, Environmental, Production).',
        'Effective Maintenance Planning kits parts, special tools, LOTO points, and permits BEFORE scheduling downtime.',
        'Technical leadership means clear, respectful shift handovers and coaching newer technicians safely without shortcuts.',
      ],
      analogy:
        'A pit crew changes four tires in seconds because planning kitted every tool and assigned every role before the car pulled in.',
    },
    stage2Understand: {
      vocabulary: [
        { term: 'RCM (Reliability-Centered Maintenance)', definition: 'Structured framework determining maintenance tasks based on asset function and failure consequences.', application: 'Applying vibration monitoring on a critical single-point-of-failure chiller.' },
        { term: 'Job Kitting', definition: 'Staging verified spare parts, gaskets, hardware, and procedures prior to scheduled work.', application: 'Prevents mid-job parts runs during tight weekend outage windows.' },
      ],
      practicalApplications: [
        'Leading a 5-minute shift handover briefing highlighting open LOTO points and pending part orders.',
      ],
    },
    stage3SeeItWork: {
      diagramType: 'rca_fishbone',
      caption: 'Compare reactive firefighting vs. planned, kitted Reliability-Centered Maintenance.',
      interactiveStates: [
        { label: 'Reactive Firefighting', reading: 'Unplanned Downtime · Rush Freight · High Stress', status: 'fault', description: 'Emergency teardowns without staged parts or root-cause follow-up.' },
        { label: 'Planned RCM Execution', reading: 'Kitted Parts · Scheduled Window · 98% Uptime', status: 'nominal', description: 'Predictive alerts trigger kitted, safe, on-time repairs.' },
      ],
    },
    stage4Practice: {
      prompt: 'Select the traits of effective maintenance leadership & planning.',
      mode: 'component_match',
      items: [
        { id: 'r1', label: 'Stage spare bearings, seals & LOTO diagram before shutdown window', detail: 'Maintenance planning & kitting' },
        { id: 'r2', label: 'Communicate open faults and safety holds clearly at shift change', detail: 'Shift handover leadership' },
      ],
      correctOrderOrIds: ['r1', 'r2'],
      feedbackPass: 'Strong reliability & leadership mindset!',
      feedbackRetry: 'Select both planning and clear shift communication.',
    },
    stage5Quiz: [
      {
        id: 'q-rcm-1',
        kind: 'multiple_choice',
        prompt: 'Why is Run-to-Failure acceptable for an inexpensive redundant hallway light bulb, but unacceptable for a plant’s main ammonia refrigeration compressor?',
        options: [
          'RCM bases maintenance strategy on failure consequence and safety/production criticality.',
          'Light bulbs do not use electricity.',
          'Compressors never wear out.',
          'Hallway lights have no CMMS asset tags.',
        ],
        correctIndex: 0,
        explanation: 'RCM focuses engineering and predictive resources where failure consequences (safety, downtime, cost) are highest.',
        topicTag: 'Reliability-Centered Maintenance',
      },
    ],
    stage6Demonstrate: {
      prompt: 'Describe how a senior technician mentors an apprentice during a fault investigation without simply taking the tools away.',
      checklistCriteria: [
        'Emphasizes safety verification, guided questioning, and schematic walkthrough',
      ],
    },
  },
];

export const CAREER_GOALS: CareerGoalDef[] = [
  {
    id: 'industrial_maintenance_tech',
    title: 'Industrial Maintenance Technician',
    summary: 'Multi-craft technician maintaining electrical, mechanical, hydraulic, and pneumatic manufacturing equipment.',
    requiredSkillIds: ['sk-loto', 'sk-ppe-guarding', 'sk-precision-meas', 'sk-ohms-acdc', 'sk-motor-starters', 'sk-plc-io', 'sk-hyd-principles', 'sk-pneu-frl', 'sk-systematic-ts', 'sk-pm-cmms'],
    recommendedLessonIds: ['safety-loto', 'mech-bearings-alignment', 'elec-starters-vfd', 'plc-io-ladder', 'ts-systematic-rca'],
    potentialCredentials: ['OSHA 10/30 General Industry', 'SACA C-101 / C-201 Industry 4.0', 'PMMI Mechatronics Certifications'],
  },
  {
    id: 'industrial_maintenance_mechanic',
    title: 'Industrial Maintenance Mechanic',
    summary: 'Specializes in precision mechanical rebuilds, shaft alignment, gearboxes, conveyors, hydraulics, and pneumatics.',
    requiredSkillIds: ['sk-loto', 'sk-precision-meas', 'sk-alignment-vib', 'sk-drives-lube', 'sk-hyd-principles', 'sk-hyd-valves', 'sk-pneu-frl', 'sk-pneu-circuits', 'sk-pm-cmms'],
    recommendedLessonIds: ['mech-bearings-alignment', 'mech-drives-lubrication', 'hyd-principles-valves', 'pneu-airprep-valves'],
    potentialCredentials: ['NCCER Industrial Maintenance Mechanic', 'Vibration Institute Category I', 'Fluid Power Society Hydraulic Mechanic'],
  },
  {
    id: 'electrical_maintenance_tech',
    title: 'Electrical Maintenance Technician',
    summary: 'Focuses on industrial power distribution, schematics, motor control centers, VFDs, and electrical fault isolation.',
    requiredSkillIds: ['sk-loto', 'sk-ppe-guarding', 'sk-ohms-acdc', 'sk-schematics', 'sk-motor-starters', 'sk-vfd', 'sk-plc-io', 'sk-systematic-ts'],
    recommendedLessonIds: ['safety-electrical-guarding', 'elec-ohms-schematics', 'elec-starters-vfd', 'ts-systematic-rca'],
    potentialCredentials: ['NFPA 70E Electrical Safety Training', 'SACA Electrical Systems Specialist', 'ISA Control Systems Technician'],
  },
  {
    id: 'plc_technician',
    title: 'PLC Technician',
    summary: 'Diagnoses discrete & analog I/O, ladder logic routines, timers/counters, sensors, and automated workcells.',
    requiredSkillIds: ['sk-loto', 'sk-ohms-acdc', 'sk-schematics', 'sk-plc-io', 'sk-ladder-logic', 'sk-sensors-plc', 'sk-systematic-ts', 'sk-ind-networks'],
    recommendedLessonIds: ['elec-ohms-schematics', 'plc-io-ladder', 'plc-timers-sensors', 'adv-electromech-networks'],
    potentialCredentials: ['Rockwell / Siemens PLC Certificate Programs', 'SACA Programmable Controller Systems'],
  },
  {
    id: 'automation_technician',
    title: 'Automation Technician',
    summary: 'Integrates PLCs, drives, sensors, industrial networking, pneumatic actuators, and vision/robotics systems.',
    requiredSkillIds: ['sk-loto', 'sk-motor-starters', 'sk-vfd', 'sk-plc-io', 'sk-ladder-logic', 'sk-sensors-plc', 'sk-pneu-circuits', 'sk-electromech', 'sk-ind-networks'],
    recommendedLessonIds: ['plc-io-ladder', 'plc-timers-sensors', 'pneu-circuits-troubleshoot', 'adv-electromech-networks'],
    potentialCredentials: ['PMMI Mechatronics PLC & Industrial Electricity', 'SACA Smart Automation Certification'],
  },
  {
    id: 'reliability_technician',
    title: 'Reliability Technician',
    summary: 'Drives predictive maintenance, vibration analysis, root-cause elimination, lubrication quality, and RCM.',
    requiredSkillIds: ['sk-precision-meas', 'sk-alignment-vib', 'sk-drives-lube', 'sk-systematic-ts', 'sk-rca', 'sk-pm-cmms', 'sk-rcm-planning'],
    recommendedLessonIds: ['mech-bearings-alignment', 'mech-drives-lubrication', 'ts-systematic-rca', 'ts-pm-cmms', 'adv-rcm-leadership'],
    potentialCredentials: ['SMRP CMRT (Certified Maintenance & Reliability Technician)', 'ISO 18436 Vibration Analyst Cat I/II', 'ICML MLT I'],
  },
  {
    id: 'maintenance_supervisor',
    title: 'Maintenance Supervisor',
    summary: 'Leads technician teams, safety compliance, CMMS planning/scheduling, root-cause standards, and reliability KPIs.',
    requiredSkillIds: ['sk-loto', 'sk-ppe-guarding', 'sk-systematic-ts', 'sk-rca', 'sk-pm-cmms', 'sk-electromech', 'sk-rcm-planning'],
    recommendedLessonIds: ['safety-loto', 'ts-systematic-rca', 'ts-pm-cmms', 'adv-rcm-leadership'],
    potentialCredentials: ['SMRP CMRP', 'OSHA 30-Hour General Industry', 'Maintenance Planning & Scheduling Certificate'],
  },
];

export const FLASHCARDS: FlashcardItem[] = [
  { id: 'fc-1', category: 'Electrical', front: 'What voltage do you read across a healthy CLOSED switch in a live 120VAC circuit?', back: '0 VAC (both sides are at the same electrical potential).', practicalTip: 'Reading full line voltage across a closed switch means the switch is actually open or failed.' },
  { id: 'fc-2', category: 'Electrical', front: 'How do you reverse the rotation direction of a 3-phase AC induction motor?', back: 'Under proper LOTO, swap any two of the three power phase leads (e.g., T1 and T2).', practicalTip: 'Never try to reverse a 3-phase motor by flipping control coil wires.' },
  { id: 'fc-3', category: 'Electrical', front: 'What does a Seal-In (Holding) Contact do in a 3-wire motor starter?', back: 'Keeps the contactor coil energized after the momentary Start pushbutton is released.', practicalTip: 'If a motor runs only while Start is held, suspect the seal-in auxiliary contact.' },
  { id: 'fc-4', category: 'Safety', front: 'Why is an Emergency Stop pushbutton NOT a valid Lockout/Tagout device?', back: 'E-Stops only interrupt control circuits; they do not physically isolate primary power or bleed stored energy.', practicalTip: 'Always use the main energy-isolating disconnect/valve + personal lock + zero-energy check.' },
  { id: 'fc-5', category: 'PLC & Automation', front: 'List the 4 steps of a standard PLC scan cycle.', back: '1. Read Inputs -> 2. Execute Program Logic -> 3. Update Outputs -> 4. Housekeeping & Comms.', practicalTip: 'Input card LEDs tell you immediately if a field signal actually reached the PLC.' },
  { id: 'fc-6', category: 'PLC & Automation', front: 'Why are physical Stop pushbuttons usually wired Normally Closed (NC) to a PLC input?', back: 'Fail-safe design: a broken wire or loose terminal drops the bit to 0 and halts the machine.', practicalTip: 'In ladder logic, that NC physical button pairs with an XIC instruction.' },
  { id: 'fc-7', category: 'Hydraulics', front: 'In hydraulics, what creates flow (GPM) vs. what creates pressure (PSI)?', back: 'The pump creates FLOW; resistance to flow (load, valve, restriction) creates PRESSURE.', practicalTip: 'Low pressure with normal flow often points to an open relief valve or worn internal seals.' },
  { id: 'fc-8', category: 'Hydraulics', front: 'What causes pump cavitation ("marbles rattling" sound)?', back: 'Vapor bubbles forming and collapsing due to restricted pump inlet, clogged suction strainer, or low oil.', practicalTip: 'Check reservoir level and suction strainer before condemning a hydraulic pump.' },
  { id: 'fc-9', category: 'Pneumatics', front: 'What is the required flow order of an FRL air preparation unit?', back: 'Filter -> Regulator -> Lubricator (upstream to downstream).', practicalTip: 'Filtering moisture and rust first protects the delicate regulator diaphragm.' },
  { id: 'fc-10', category: 'Pneumatics', front: 'Why do pneumatic cylinders typically use meter-out flow control?', back: 'Restricting exhausting air builds stabilizing backpressure that prevents jerky motion.', practicalTip: 'Check clogged bronze exhaust mufflers whenever a cylinder slows down dramatically.' },
  { id: 'fc-11', category: 'Mechanical', front: 'What is "Soft Foot" on an electric motor installation?', back: 'When one or more mounting feet do not sit flat on the baseplate, twisting the frame when torqued.', practicalTip: 'Always detect and shim soft foot BEFORE performing precision shaft alignment.' },
  { id: 'fc-12', category: 'Troubleshooting', front: 'Explain the Half-Split troubleshooting technique.', back: 'Test at the midpoint of a circuit or system to immediately eliminate half the possible fault area.', practicalTip: 'One well-placed measurement beats swapping five random parts.' },
];

export function getRotatingChallenges(dateKey: string): DailyChallenge[] {
  const dayNum = Number(dateKey.replace(/-/g, '')) || 1;
  const dailyPool: DailyChallenge[] = [
    {
      id: 'dc-elec-symbols',
      title: 'Identify Five Electrical & Control Concepts',
      kind: 'daily',
      description: 'Quick 5-question check on schematic symbols, voltage drop, and motor control logic.',
      xpReward: 50,
      category: 'Electrical',
      actionTarget: { tab: 'practice', subTab: 'challenges' },
      questions: [
        {
          id: 'dc-q1',
          kind: 'component_id',
          prompt: 'Which symbol/contact conducts power continuously at rest until actuated?',
          options: ['Normally Open (NO)', 'Normally Closed (NC)', 'Capacitor', 'Ground'],
          correctIndex: 1,
          explanation: 'Normally Closed (NC) contacts remain closed at rest and open when actuated.',
          topicTag: 'Electrical Symbols',
        },
        {
          id: 'dc-q2',
          kind: 'multiple_choice',
          prompt: 'If a 24VDC solenoid coil measures 48 Ohms, how much current should it draw when energized?',
          options: ['0.5 Amps', '2.0 Amps', '24 Amps', '1152 Amps'],
          correctIndex: 0,
          explanation: 'I = V / R = 24 / 48 = 0.5 Amps.',
          topicTag: 'Ohms Law',
        },
        {
          id: 'dc-q3',
          kind: 'multiple_choice',
          prompt: 'What voltage is measured across an OPEN overload contact inside a live 120VAC control rung?',
          options: ['0 VAC', '120 VAC', '24 VDC', '480 VAC'],
          correctIndex: 1,
          explanation: 'An open switch/contact in series with a load drops full source voltage across its open terminals.',
          topicTag: 'Voltage Drop',
        },
        {
          id: 'dc-q4',
          kind: 'component_id',
          prompt: 'Which component protects motor windings against sustained overcurrent?',
          options: ['Thermal Overload Relay', 'Start Pushbutton', 'Indicator Pilot Lamp', 'DIN Rail'],
          correctIndex: 0,
          explanation: 'Overload relays monitor motor current and trip open the control circuit if current stays excessive.',
          topicTag: 'Motor Protection',
        },
        {
          id: 'dc-q5',
          kind: 'multiple_choice',
          prompt: 'Swapping T1 and T2 on a 3-phase induction motor causes what result?',
          options: [
            'Reverses motor shaft rotation',
            'Doubles motor voltage',
            'Disables the stop button',
            'Trips the main breaker immediately',
          ],
          correctIndex: 0,
          explanation: 'Swapping any two phases reverses the stator rotating magnetic field.',
          topicTag: '3-Phase Motors',
        },
      ],
    },
    {
      id: 'dc-motor-fault',
      title: 'Diagnose a Simulated Motor Fault',
      kind: 'daily',
      description: 'Launch the Electrical Motor Starter simulator and isolate an active fault scenario.',
      xpReward: 75,
      category: 'Simulators',
      actionTarget: { tab: 'practice', subTab: 'simulators', simulatorId: 'motor_starter' },
    },
    {
      id: 'dc-plc-sprint',
      title: 'Five-Minute PLC & Sensor Sprint',
      kind: 'daily',
      description: 'Test your PLC scan cycle, TON timer, and inductive proximity sensor instincts.',
      xpReward: 50,
      category: 'PLC & Automation',
      actionTarget: { tab: 'practice', subTab: 'challenges' },
      questions: [
        {
          id: 'plc-dq1',
          kind: 'multiple_choice',
          prompt: 'During which PLC scan step are field sensor voltages read into memory?',
          options: ['Input Scan', 'Program Execution', 'Output Update', 'Serial Print'],
          correctIndex: 0,
          explanation: 'The Input Scan updates the input image table at the start of every scan cycle.',
          topicTag: 'PLC Scan',
        },
        {
          id: 'plc-dq2',
          kind: 'multiple_choice',
          prompt: 'An inductive proximity sensor is best suited for detecting which target?',
          options: ['Metal cam lobe at 3 mm range', 'Clear glass bottle at 1 meter', 'Cardboard box at 2 meters', 'Air pressure'],
          correctIndex: 0,
          explanation: 'Inductive sensors detect metallic targets at short range regardless of dust or oil.',
          topicTag: 'Sensors',
        },
        {
          id: 'plc-dq3',
          kind: 'multiple_choice',
          prompt: 'If a TON timer’s Accumulated value equals its Preset, which bit turns ON?',
          options: ['.DN (Done)', '.TT (Timer Timing)', '.EN (Enable)', '.RES (Reset)'],
          correctIndex: 0,
          explanation: 'The Done (.DN) bit energizes once .ACC reaches .PRE.',
          topicTag: 'PLC Timers',
        },
      ],
    },
    {
      id: 'dc-hydraulic-failure',
      title: 'Identify Hydraulic Failure Cause',
      kind: 'daily',
      description: 'Operate the Hydraulics simulator to isolate pump cavitation vs. relief vs. seal bypass.',
      xpReward: 75,
      category: 'Hydraulics',
      actionTarget: { tab: 'practice', subTab: 'simulators', simulatorId: 'hydraulics' },
    },
  ];

  const primaryDaily = dailyPool[dayNum % dailyPool.length];
  const secondaryDaily = dailyPool[(dayNum + 1) % dailyPool.length];

  const weeklyChallenge: DailyChallenge = {
    id: `wk-mastery-${dateKey.slice(0, 7)}`,
    title: 'Weekly Academy Readiness Mission',
    kind: 'weekly',
    description:
      'Complete a Troubleshooting Mission in the Practice Lab or score 80%+ on any module assessment this week to earn 200 bonus XP.',
    xpReward: 200,
    category: 'Weekly Mission',
    actionTarget: { tab: 'practice', subTab: 'missions' },
  };

  return [primaryDaily, secondaryDaily, weeklyChallenge];
}
