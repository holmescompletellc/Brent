import { TroubleshootingMission } from '../types/maintenance';

export const TROUBLESHOOTING_MISSIONS: TroubleshootingMission[] = [
  {
    id: 'mission-conveyor-wont-start',
    title: 'Conveyor Line 3 Will Not Start',
    equipment: '480V 3-Phase Bottling Infeed Conveyor (Motor Starter M-301)',
    difficulty: 'Beginner',
    category: 'Electrical & Controls',
    complaint:
      'Shift 1 Operator reports: "Conveyor 3 stopped mid-run while moving heavy palletized cases. Now pressing the green Start button does nothing at all."',
    safetyBrief:
      'Verify area is clear of pinch points, inspect guarding, and observe simulated control panel indicators before opening any cabinet doors. Remember: live electrical troubleshooting in real facilities requires qualified authorization and PPE.',
    startStepId: 'step-1',
    steps: {
      'step-1': {
        id: 'step-1',
        stageTitle: 'Step 1 · Safety & Initial Observation',
        prompt: 'You arrive at Conveyor Line 3. Before touching the motor or opening the starter enclosure, what is your first action?',
        readings: [
          { label: 'Panel Disconnect', value: 'ON (Handle Up)', status: 'nominal' },
          { label: 'Control Power Pilot', value: '120VAC LIT', status: 'nominal' },
          { label: 'Conveyor Belt', value: 'Stopped · Cases Backed Up', status: 'warning' },
        ],
        hint: 'Always confirm safety conditions and inspect operator controls/E-stops before opening panels or resetting devices.',
        options: [
          {
            id: 'opt-1a',
            label: 'Check E-Stop stations, verify guard integrity, and inspect mechanical jam signs along conveyor',
            observation:
              'All E-Stops are pulled out and guards are intact. Looking under the discharge roller, a crushed wooden pallet slat is wedged tight against the tail pulley, and the overload relay flag inside the window shows TRIPPED.',
            safetyDelta: 35,
            reasoningDelta: 30,
            efficiencyDelta: 30,
            isOptimal: true,
            nextStepId: 'step-2',
          },
          {
            id: 'opt-1b',
            label: 'Immediately open the cabinet and jam a screwdriver against the contactor to force the motor on',
            observation:
              'SAFETY VIOLATION: Forcing a contactor closed bypasses overload and safety interlocks, risking arc flash and tearing the jammed belt.',
            safetyDelta: 0,
            reasoningDelta: 5,
            efficiencyDelta: 5,
            nextStepId: 'step-2',
          },
          {
            id: 'opt-1c',
            label: 'Replace the conveyor motor right away without checking controls',
            observation:
              'Unnecessary teardown: you have not verified whether power or overload protection tripped yet.',
            safetyDelta: 20,
            reasoningDelta: 10,
            efficiencyDelta: 5,
            nextStepId: 'step-2',
          },
        ],
      },
      'step-2': {
        id: 'step-2',
        stageTitle: 'Step 2 · Diagnostic Readings & Isolation',
        prompt: 'Simulated panel telemetry confirms Control Power is present (120VAC), and the Thermal Overload (OL) relay indicator is tripped. How do you proceed safely?',
        readings: [
          { label: 'Control Transformer Sec.', value: '120.4 VAC', status: 'nominal' },
          { label: 'OL Relay Status', value: 'TRIPPED (NC 95-96 OPEN)', status: 'fault' },
          { label: 'Motor Frame Temp', value: '162°F (Elevated)', status: 'warning' },
        ],
        hint: 'Never clear a mechanical jam or reset an overload blindly—isolate energy first, inspect the mechanical obstruction, and check winding/amp conditions.',
        options: [
          {
            id: 'opt-2a',
            label: 'Apply simulated LOTO, clear the wedged pallet slat from the tail pulley, check drive rotation by hand, then restore power and reset OL',
            observation:
              'With LOTO verified, you remove the crushed pallet slat. The tail pulley now spins freely by hand with smooth bearings. After restoring power and resetting the cooled OL relay, you test-run unloaded: 3-phase current balances at 6.2A / 6.1A / 6.2A (FLA 7.0A).',
            safetyDelta: 35,
            reasoningDelta: 35,
            efficiencyDelta: 35,
            isOptimal: true,
            nextStepId: 'step-3',
          },
          {
            id: 'opt-2b',
            label: 'Press the Overload Reset button immediately and hit Start without removing the jam',
            observation:
              'The motor hums loudly at locked-rotor current (38A) for 4 seconds and trips the Overload relay again—risking winding damage.',
            safetyDelta: 10,
            reasoningDelta: 10,
            efficiencyDelta: 10,
            nextStepId: 'step-3',
          },
        ],
      },
      'step-3': {
        id: 'step-3',
        stageTitle: 'Step 3 · Root-Cause Check',
        prompt: 'Conveyor 3 now runs smoothly at 6.2A balanced load. Before signing off, what diagnostic check confirms why the overload tripped?',
        readings: [
          { label: 'Phase Currents (L1/L2/L3)', value: '6.2A / 6.1A / 6.2A', status: 'nominal' },
          { label: 'OL Relay Status', value: 'CLOSED (Reset)', status: 'nominal' },
          { label: 'Mechanical Jam', value: 'Cleared', status: 'nominal' },
        ],
        hint: 'Good technicians inspect what allowed the debris into the tail pulley in the first place.',
        options: [
          {
            id: 'opt-3a',
            label: 'Inspect tail pulley skirt guarding and note recurring damaged pallets as root-cause follow-up',
            observation:
              'You notice a bent return-side debris deflector allowing broken pallet slats under the belt. Logging this prevents repeat overload trips.',
            safetyDelta: 30,
            reasoningDelta: 35,
            efficiencyDelta: 35,
            isOptimal: true,
            nextStepId: 'COMPLETE',
          },
          {
            id: 'opt-3b',
            label: 'Turn the overload trip dial up 50% so it does not trip next time',
            observation:
              'DANGEROUS ADJUSTMENT: Raising overload trip current above motor nameplate FLA removes thermal protection and can burn out the motor.',
            safetyDelta: 0,
            reasoningDelta: 5,
            efficiencyDelta: 10,
            nextStepId: 'COMPLETE',
          },
        ],
      },
    },
    faultChoices: [
      {
        id: 'fc-jam-ol',
        label: 'Mechanical tail-pulley jam caused motor overcurrent and tripped the Thermal Overload Relay',
        isCorrect: true,
        explanation: 'The wedged pallet slat stalled the conveyor, spiking amps and tripping the NC 95-96 overload contact.',
      },
      {
        id: 'fc-coil',
        label: 'Burned-out 120VAC contactor holding coil',
        isCorrect: false,
        explanation: 'Control power was present and the overload flag was visibly tripped; the coil did not fail.',
      },
      {
        id: 'fc-fuse',
        label: 'Blown primary control transformer fuse',
        isCorrect: false,
        explanation: 'Control Pilot and transformer secondary measured 120.4 VAC.',
      },
    ],
    correctiveChoices: [
      { id: 'cc-1', label: 'LOTO conveyor, clear jam, verify smooth rotation, reset cooled OL, inspect debris deflector, log CMMS work order', isCorrect: true },
      { id: 'cc-2', label: 'Jumper across terminals 95-96 on the overload relay permanently', isCorrect: false },
      { id: 'cc-3', label: 'Swap motor leads T1 and T2 to run conveyor backward', isCorrect: false },
    ],
  },
  {
    id: 'mission-hydraulic-press',
    title: 'Hydraulic Forming Press Slow & Overheating',
    equipment: '2,200 PSI Hydraulic Power Unit (HPU-02)',
    difficulty: 'Intermediate',
    category: 'Hydraulics',
    complaint:
      'Press operator reports: "Ram extension speed dropped by half this morning, the pump sounds unusually noisy, and the tank oil temperature climbed to 165°F."',
    safetyBrief:
      'Verify press ram is resting on mechanical safety blocks and never open hydraulic lines under trapped pressure.',
    startStepId: 'step-1',
    steps: {
      'step-1': {
        id: 'step-1',
        stageTitle: 'Step 1 · Visual & Sensory Walkdown',
        prompt: 'Inspect the HPU indicators safely from outside the guarding.',
        readings: [
          { label: 'Reservoir Sight Glass', value: 'Mid-Level · Slightly Foamy', status: 'warning' },
          { label: 'Suction Vacuum Gauge', value: '14 inHg Vacuum (High)', status: 'fault' },
          { label: 'System Pressure', value: '620 PSI (Low)', status: 'warning' },
        ],
        hint: 'High vacuum on the pump suction line paired with foaming and noisy rattling points directly to suction restriction.',
        options: [
          {
            id: 'hopt-1a',
            label: 'Compare suction gauge reading against reservoir level and inspect suction strainer differential indicator',
            observation:
              'The suction strainer clog indicator is deep in the red zone (14 inHg suction vacuum), starving the pump and causing cavitation.',
            safetyDelta: 35,
            reasoningDelta: 35,
            efficiencyDelta: 35,
            isOptimal: true,
            nextStepId: 'step-2',
          },
          {
            id: 'hopt-1b',
            label: 'Crank the Pressure Relief Valve clockwise to force pressure higher',
            observation:
              'Increasing relief pressure does not cure pump starvation and risks over-pressurizing components once flow returns.',
            safetyDelta: 10,
            reasoningDelta: 5,
            efficiencyDelta: 5,
            nextStepId: 'step-2',
          },
        ],
      },
      'step-2': {
        id: 'step-2',
        stageTitle: 'Step 2 · Isolation & Service',
        prompt: 'You confirmed pump cavitation from a severely restricted suction strainer. What is the safe repair path?',
        readings: [
          { label: 'Oil Temp', value: '165°F', status: 'warning' },
          { label: 'Suction Strainer', value: 'Plugged w/ Sludge', status: 'fault' },
        ],
        hint: 'Lock out the HPU motor, bleed accumulator/line pressure, service the strainer, and sample oil.',
        options: [
          {
            id: 'hopt-2a',
            label: 'LOTO pump, verify 0 PSI, clean/replace suction strainer, check oil sample for contamination, refill & bleed',
            observation:
              'Strainer mesh was coated with degraded varnish/sludge. With a clean strainer and fresh fluid top-off, suction vacuum drops to 2 inHg, pump noise disappears, and ram cycle time returns to spec.',
            safetyDelta: 65,
            reasoningDelta: 65,
            efficiencyDelta: 65,
            isOptimal: true,
            nextStepId: 'COMPLETE',
          },
          {
            id: 'hopt-2b',
            label: 'Remove the suction strainer completely and run without filtration',
            observation:
              'Running without a suction strainer allows large debris straight into the precision pump vanes, causing catastrophic pump scoring.',
            safetyDelta: 15,
            reasoningDelta: 5,
            efficiencyDelta: 10,
            nextStepId: 'COMPLETE',
          },
        ],
      },
    },
    faultChoices: [
      {
        id: 'hfc-1',
        label: 'Plugged pump suction strainer causing pump cavitation, flow starvation, and overheating',
        isCorrect: true,
        explanation: 'High suction vacuum + foaming + rattling sound + slow flow is the classic signature of suction-side cavitation.',
      },
      {
        id: 'hfc-2',
        label: 'Reversed 3-phase motor wires',
        isCorrect: false,
        explanation: 'A reversed pump typically produces zero pressure/flow immediately rather than high suction vacuum and partial extension.',
      },
    ],
    correctiveChoices: [
      { id: 'hcc-1', label: 'LOTO HPU, bleed pressure, replace/clean suction strainer, sample oil for contamination, add PM filter check', isCorrect: true },
      { id: 'hcc-2', label: 'Delete the strainer permanently and raise relief PSI', isCorrect: false },
    ],
  },
  {
    id: 'mission-plc-diverter',
    title: 'PLC Case Diverter Double-Triggering',
    equipment: 'Automated Case Sorter (PLC Rack 2 + Pneumatic Diverter)',
    difficulty: 'Advanced',
    category: 'PLC & Automation',
    complaint:
      'Packing supervisor reports: "Every third cardboard case triggers the pneumatic diverter twice, jamming cartons on the spur lane."',
    safetyBrief:
      'Keep hands clear of the pneumatic pusher cylinder while cycling test boxes. Use PLC I/O diagnostics and sensor inspection before changing code.',
    startStepId: 'step-1',
    steps: {
      'step-1': {
        id: 'step-1',
        stageTitle: 'Step 1 · Half-Split PLC vs. Field Sensor',
        prompt: 'You monitor the PLC input table and photoeye PE-12 while one carton passes.',
        readings: [
          { label: 'Input I:1/4 (PE-12)', value: 'Flickers 0->1->0->1', status: 'fault' },
          { label: 'Air Header Pressure', value: '86 PSI', status: 'nominal' },
          { label: 'CTU Counter .ACC', value: 'Increments +2 per box', status: 'warning' },
        ],
        hint: 'Notice Input I:1/4 flickers twice per single carton!',
        options: [
          {
            id: 'popt-1a',
            label: 'Inspect photoeye PE-12 alignment, reflector cleanliness, and carton flap interference',
            observation:
              'PE-12 bracket vibration + dust on the reflector causes signal chatter as the carton edge passes, pulsing I:1/4 twice.',
            safetyDelta: 50,
            reasoningDelta: 50,
            efficiencyDelta: 50,
            isOptimal: true,
            nextStepId: 'step-2',
          },
          {
            id: 'popt-1b',
            label: 'Rewrite the PLC program to ignore every second box',
            observation:
              'Masking an intermittent hardware sensor fault in software causes missed diverter counts whenever flap bounce stops.',
            safetyDelta: 30,
            reasoningDelta: 10,
            efficiencyDelta: 10,
            nextStepId: 'step-2',
          },
        ],
      },
      'step-2': {
        id: 'step-2',
        stageTitle: 'Step 2 · Mechanical Stabilization & Verification',
        prompt: 'What corrective step permanently eliminates the double-trigger?',
        readings: [
          { label: 'PE-12 Bracket', value: 'Loose M6 Bolt', status: 'fault' },
          { label: 'Reflector', value: 'Dust-Coated', status: 'warning' },
        ],
        hint: 'Fix the physical sensor mount/reflector first, then verify clean single-pulse I:1/4 transitions.',
        options: [
          {
            id: 'popt-2a',
            label: 'Tighten PE-12 bracket, clean reflector, realign beam center, and test 15 consecutive cartons',
            observation:
              'I:1/4 now pulses cleanly once per carton (0->1->0). CTU increments +1 per box with zero double-diverts.',
            safetyDelta: 50,
            reasoningDelta: 50,
            efficiencyDelta: 50,
            isOptimal: true,
            nextStepId: 'COMPLETE',
          },
        ],
      },
    },
    faultChoices: [
      {
        id: 'pfc-1',
        label: 'Loose photoeye PE-12 bracket and dusty reflector caused input signal chatter, double-counting the PLC logic',
        isCorrect: true,
        explanation: 'Signal bounce on I:1/4 triggered the counter and diverter rung twice per carton.',
      },
      {
        id: 'pfc-2',
        label: 'Failed 5/2 solenoid exhaust muffler',
        isCorrect: false,
        explanation: 'Air pressure was nominal and the PLC input itself pulsed twice.',
      },
    ],
    correctiveChoices: [
      { id: 'pcc-1', label: 'Secure sensor bracket, clean reflector, verify single clean input pulse per box, log PM cleaning task', isCorrect: true },
      { id: 'pcc-2', label: 'Lower air pressure to 30 PSI', isCorrect: false },
    ],
  },
  {
    id: 'mission-chiller-expert',
    title: 'Chiller Pump Vibration & Intermittent VFD Trip',
    equipment: '480V VFD-Driven Centrifugal Chiller Pump (P-401)',
    difficulty: 'Expert',
    category: 'Integrated Reliability',
    complaint:
      'Facilities team reports: "Pump P-401 trips on VFD Overcurrent (F005) every 2–3 hours, and operators hear a rhythmic bearing rumble."',
    safetyBrief:
      'Wait for VFD DC bus capacitor discharge verification under qualified LOTO before opening motor junction boxes or touching couplings.',
    startStepId: 'step-1',
    steps: {
      'step-1': {
        id: 'step-1',
        stageTitle: 'Step 1 · Non-Invasive Condition Monitoring',
        prompt: 'Before tearing down the pump, collect safe running diagnostics.',
        readings: [
          { label: 'Vibration (Pump DE)', value: '9.6 mm/s RMS (High 2x Axial)', status: 'fault' },
          { label: 'Pump Bearing Temp', value: '194°F (Alarm)', status: 'fault' },
          { label: 'VFD Output Current', value: '18.2A (FLA 15.0A)', status: 'warning' },
        ],
        hint: 'High 2× axial vibration + elevated bearing heat + rising amp draw points to coupling misalignment + bearing distress.',
        options: [
          {
            id: 'eopt-1a',
            label: 'Correlate high 2× axial vibration, 194°F bearing heat, and rising amp draw; schedule immediate LOTO inspection of coupling & bearings',
            observation:
              'Smart reliability call: under LOTO you find degraded coupling spider debris, 0.45mm vertical misalignment, and dry, spalled drive-end bearings.',
            safetyDelta: 50,
            reasoningDelta: 50,
            efficiencyDelta: 50,
            isOptimal: true,
            nextStepId: 'step-2',
          },
          {
            id: 'eopt-1b',
            label: 'Raise VFD Overcurrent trip limit to 150% and keep running',
            observation:
              'Masking an active mechanical bearing overload causes shaft seizure and potential VFD IGBT failure.',
            safetyDelta: 5,
            reasoningDelta: 5,
            efficiencyDelta: 5,
            nextStepId: 'step-2',
          },
        ],
      },
      'step-2': {
        id: 'step-2',
        stageTitle: 'Step 2 · Precision Rebuild & Verification',
        prompt: 'What sequence restores P-401 to reliable service?',
        readings: [
          { label: 'Shaft Offset', value: '0.45 mm (Out of Spec)', status: 'fault' },
          { label: 'Pump DE Bearing', value: 'Spalled Race', status: 'fault' },
        ],
        hint: 'Replace bearings + coupling insert, eliminate soft foot, precision align, and record baseline As-Left vibration & amps.',
        options: [
          {
            id: 'eopt-2a',
            label: 'Replace pump bearings & coupling insert, eliminate soft foot, precision laser-align shafts (<0.05mm), verify baseline 1.3 mm/s RMS & 11.4A',
            observation:
              'Pump P-401 runs quietly at 11.4A and 116°F bearing temperature with zero VFD trips.',
            safetyDelta: 50,
            reasoningDelta: 50,
            efficiencyDelta: 50,
            isOptimal: true,
            nextStepId: 'COMPLETE',
          },
        ],
      },
    },
    faultChoices: [
      {
        id: 'efc-1',
        label: 'Severe shaft misalignment and bearing wear increased mechanical drag, causing high 2× vibration, heat, and VFD overcurrent trips',
        isCorrect: true,
        explanation: 'Misalignment overloaded the bearing until spalling raised torque demand past the VFD overcurrent threshold.',
      },
      {
        id: 'efc-2',
        label: 'Loose Ethernet cable on HMI',
        isCorrect: false,
        explanation: 'Network cables do not generate 194°F bearing temperatures or 9.6 mm/s vibration.',
      },
    ],
    correctiveChoices: [
      { id: 'ecc-1', label: 'LOTO, replace damaged bearings & coupling, fix soft foot, precision align shafts, log As-Left vibration/amp baseline', isCorrect: true },
      { id: 'ecc-2', label: 'Pump extra grease into the spalled bearing and disable VFD fault F005', isCorrect: false },
    ],
  },
];
