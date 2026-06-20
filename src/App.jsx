import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Play, Pause, RotateCcw, AlertTriangle, TrendingUp, TrendingDown,
  Droplets, Factory, Sprout, Fish, DollarSign, Volume2, VolumeX,
  ShieldAlert, Award, FileText, Info, BarChart2, CloudRain, Sun,
  Thermometer, CheckCircle, HelpCircle, ChevronRight, Settings
} from 'lucide-react';

// ─── Scenario Presets ─────────────────────────────────────────
const SCENARIOS = {
  baseline: {
    name: "Standard Baseline",
    description: "Average industrial and farming levels. Good starting point to test balanced regulations.",
    factories: { count: 5, treatment: 50, type: 'chemical' },
    farming: { area: 100, fertilizerUse: 70, organic: 30 },
    activePolicies: { effluentLaws: false, greenSubsidy: false, cleanupDrive: false, carbonTax: false },
    budget: 1000000,
    approval: 60,
    wqi: 65,
    fish: 1000,
    ph: 7.2,
    do: 7.5
  },
  industrialBoom: {
    name: "Industrial Expansion",
    description: "Rapid industrialization with lax regulations. High factory count and low treatment levels.",
    factories: { count: 12, treatment: 20, type: 'chemical' },
    farming: { area: 40, fertilizerUse: 50, organic: 20 },
    activePolicies: { effluentLaws: false, greenSubsidy: false, cleanupDrive: false, carbonTax: false },
    budget: 1500000,
    approval: 80,
    wqi: 42,
    fish: 450,
    ph: 6.2,
    do: 4.8
  },
  agriHub: {
    name: "Agricultural Heartland",
    description: "Massive intensive farming region using heavy chemical fertilizers, producing high runoff.",
    factories: { count: 1, treatment: 60, type: 'food' },
    farming: { area: 180, fertilizerUse: 90, organic: 10 },
    activePolicies: { effluentLaws: false, greenSubsidy: false, cleanupDrive: false, carbonTax: false },
    budget: 800000,
    approval: 70,
    wqi: 52,
    fish: 800,
    ph: 7.0,
    do: 6.4
  },
  greenUtopia: {
    name: "Eco-Haven Initiative",
    description: "Strict environmental regulations, low factory footprint with full treatment, organic farming.",
    factories: { count: 2, treatment: 95, type: 'food' },
    farming: { area: 85, fertilizerUse: 15, organic: 85 },
    activePolicies: { effluentLaws: true, greenSubsidy: true, cleanupDrive: false, carbonTax: false },
    budget: 600000,
    approval: 55,
    wqi: 88,
    fish: 1300,
    ph: 7.3,
    do: 9.2
  },
  crisis: {
    name: "Ecological Collapse",
    description: "Critical pollution, dying fish populations, collapsing public approval, and low local budget.",
    factories: { count: 9, treatment: 15, type: 'textile' },
    farming: { area: 130, fertilizerUse: 85, organic: 10 },
    activePolicies: { effluentLaws: false, greenSubsidy: false, cleanupDrive: false, carbonTax: false },
    budget: 350000,
    approval: 30,
    wqi: 31,
    fish: 180,
    ph: 5.8,
    do: 3.2
  }
};

// ─── Simulation Events ────────────────────────────────────────
const SIMULATION_EVENTS = [
  {
    id: "toxic_spill",
    title: "Accidental Chemical Spill",
    description: "A major chemicals manufacturer reports a storage tank leakage directly into the river system upstream.",
    options: [
      {
        text: "Enforce a strict fine of $150K and force safety shutdown (Factory closes, approval goes up, WQI slightly hit).",
        impact: "Budget +$150K | Factories -1 | Approval +10% | WQI -5",
        effect: (s) => {
          s.setBudget(b => b + 150000);
          s.setFactories(f => ({ ...f, count: Math.max(0, f.count - 1) }));
          s.setPublicApproval(a => Math.min(100, a + 10));
          s.setWqi(w => Math.max(0, w - 5));
          s.logEvent("Chemical Spill: Fined the factory $150K and shut it down. WQI had minor impact.");
        }
      },
      {
        text: "Fund municipal emergency cleanup team (Costs $100K, preserves WQI, approval up slightly).",
        impact: "Budget -$100K | WQI +5 | Approval +5%",
        effect: (s) => {
          s.setBudget(b => Math.max(0, b - 100000));
          s.setWqi(w => Math.min(100, w + 5));
          s.setPublicApproval(a => Math.min(100, a + 5));
          s.logEvent("Chemical Spill: Deployed $100K emergency cleanup. Water quality preserved.");
        }
      },
      {
        text: "Lobby to cover up the incident to protect jobs (Free, WQI drops severely, approval drops).",
        impact: "WQI -22 | Fish -25% | Approval -12%",
        effect: (s) => {
          s.setWqi(w => Math.max(0, w - 22));
          s.setFishPopulation(f => Math.max(0, Math.round(f * 0.75)));
          s.setPublicApproval(a => Math.max(0, a - 12));
          s.logEvent("Chemical Spill: Downplayed the incident. Ecosystem suffered severe collapse.");
        }
      }
    ]
  },
  {
    id: "algae_outbreak",
    title: "Dangerous Algal Bloom",
    description: "High fertilizer runoff combined with warm water has caused toxic cyanobacteria to multiply rapidly.",
    options: [
      {
        text: "Deploy chemical algicides immediately (Costs $60K, lowers WQI slightly, saves fish population).",
        impact: "Budget -$60K | DO +2.0 | WQI -4",
        effect: (s) => {
          s.setBudget(b => Math.max(0, b - 60000));
          s.setDissolvedOxygen(d => Math.min(12, d + 2.0));
          s.setWqi(w => Math.max(0, w - 4));
          s.logEvent("Algal Bloom: Treated with chemical algicides. Dissolved oxygen levels recovered.");
        }
      },
      {
        text: "Enforce emergency agriculture fertilizer quotas (Farmer approval drops, runoff decreases).",
        impact: "Farming Fertilizer -20% | Approval -8% | WQI +8",
        effect: (s) => {
          s.setFarming(f => ({ ...f, fertilizerUse: Math.max(0, f.fertilizerUse - 20) }));
          s.setPublicApproval(a => Math.max(0, a - 8));
          s.setWqi(w => Math.min(100, w + 8));
          s.logEvent("Algal Bloom: Enforced fertilizer quotas. Long-term runoff decreased.");
        }
      }
    ]
  },
  {
    id: "restoration_grant",
    title: "Federal Conservation Grant",
    description: "Your efforts to balance ecology have attracted federal interest. They offer a direct sustainability grant.",
    options: [
      {
        text: "Accept grant for river cleanup initiatives (Adds +$200K to budget, raises approval).",
        impact: "Budget +$200K | Approval +8%",
        effect: (s) => {
          s.setBudget(b => b + 200000);
          s.setPublicApproval(a => Math.min(100, a + 8));
          s.logEvent("Federal Grant: Received $200K federal conservation grant.");
        }
      }
    ]
  },
  {
    id: "illegal_dumping",
    title: "Midnight Dumping Report",
    description: "Ecosystem patrol rangers report an unidentified vessel dumping sewage drums near the river banks.",
    options: [
      {
        text: "Prosecute suspects and clean dumping site (Costs $40K, WQI rises, approval increases).",
        impact: "Budget -$40K | WQI +6 | Approval +10%",
        effect: (s) => {
          s.setBudget(b => Math.max(0, b - 40000));
          s.setWqi(w => Math.min(100, w + 6));
          s.setPublicApproval(a => Math.min(100, a + 10));
          s.logEvent("Midnight Dumping: Investigated and cleaned site ($40K). Public approval raised.");
        }
      },
      {
        text: "Ignore due to limited patrol budget (Free, WQI drops, approval drops).",
        impact: "WQI -8 | Approval -6%",
        effect: (s) => {
          s.setWqi(w => Math.max(0, w - 8));
          s.setPublicApproval(a => Math.max(0, a - 6));
          s.logEvent("Midnight Dumping: Ignored report. Pollution leaked into groundwater.");
        }
      }
    ]
  }
];

const RiverPollutionSimulator = () => {
  // ─── Simulation State ───────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeTab, setActiveTab] = useState('simulation'); // simulation, science, charts, logs
  const [selectedScenario, setSelectedScenario] = useState('baseline');

  // ─── Environmental Parameters ───────────────────────────────
  const [season, setSeason] = useState('spring');
  const [temperature, setTemperature] = useState(20);
  const [rainfall, setRainfall] = useState(50);
  const [riverFlow, setRiverFlow] = useState(100);

  // ─── Pollution & Biological Parameters ──────────────────────
  const [factories, setFactories] = useState({ count: 5, treatment: 50, type: 'chemical' });
  const [farming, setFarming] = useState({ area: 100, fertilizerUse: 70, organic: 30 });
  const [activePolicies, setActivePolicies] = useState({
    effluentLaws: false,
    greenSubsidy: false,
    cleanupDrive: false,
    carbonTax: false
  });

  // ─── Calculated Metrics ────────────────────────────────────
  const [wqi, setWqi] = useState(65);
  const [dissolvedOxygen, setDissolvedOxygen] = useState(7.5);
  const [ph, setPh] = useState(7.2);
  const [turbidity, setTurbidity] = useState(30);
  const [eutrophicationIndex, setEutrophicationIndex] = useState(25);
  const [heavyMetalsIndex, setHeavyMetalsIndex] = useState(12);
  const [fishPopulation, setFishPopulation] = useState(1000);
  const [budget, setBudget] = useState(1000000);
  const [publicApproval, setPublicApproval] = useState(60);

  // ─── Historical, Forecast, & Logs Data ──────────────────────
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [eventLogs, setEventLogs] = useState([
    { day: 0, text: "Simulation started with Standard Baseline." }
  ]);

  // ─── Active Popup Event ──────────────────────────────────────
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventPopupResult, setEventPopupResult] = useState(null);

  // ─── River Canvas Ref & Hover Tooltip State ──────────────────
  const riverCanvasRef = useRef(null);
  const [canvasTooltip, setCanvasTooltip] = useState(null);

  // ─── Sound Synthesizer System ────────────────────────────────
  const audioCtxRef = useRef(null);
  const synthNodesRef = useRef({ ambient: null, alert: null });
  const [soundMuted, setSoundMuted] = useState(true);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtxRef.current = new AudioContextClass();
    
    // Create soft river flow noise generator (Pink Noise approximation)
    const bufferSize = 2 * audioCtxRef.current.sampleRate;
    const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // scale down
      b6 = white * 0.115926;
    }
    
    const noiseNode = audioCtxRef.current.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    // Lowpass filter for water undercurrent muffling
    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, audioCtxRef.current.currentTime);
    
    const gainNode = audioCtxRef.current.createGain();
    gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);
    noiseNode.start();
    
    synthNodesRef.current.ambient = gainNode;
  };

  const setAmbientVolume = (vol) => {
    if (!audioCtxRef.current || soundMuted) return;
    const gain = synthNodesRef.current.ambient;
    if (gain) {
      gain.gain.linearRampToValueAtTime(vol, audioCtxRef.current.currentTime + 0.5);
    }
  };

  const playSoundEffect = (type) => {
    if (soundMuted) return;
    if (!audioCtxRef.current) initAudio();
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    
    const now = audioCtxRef.current.currentTime;
    
    if (type === 'click') {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + 0.1);
    } else if (type === 'bubble') {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(250 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 300, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + 0.15);
    } else if (type === 'chime_up') {
      const osc = audioCtxRef.current.createOscillator();
      const osc2 = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'triangle';
      osc2.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc2.start();
      osc.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } else if (type === 'chime_down') {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(349.23, now + 0.12); // F4
      osc.frequency.setValueAtTime(293.66, now + 0.24); // D4
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + 0.5);
    } else if (type === 'alarm') {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(350, now + 0.15);
      osc.frequency.linearRampToValueAtTime(180, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(now + 0.4);
    }
  };

  useEffect(() => {
    if (!soundMuted) {
      if (!audioCtxRef.current) initAudio();
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setAmbientVolume(isRunning ? 0.08 : 0.02);
    } else {
      if (synthNodesRef.current.ambient) {
        synthNodesRef.current.ambient.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      }
    }
  }, [soundMuted, isRunning]);


  // Helper to log event messages
  const logEvent = (text) => {
    setEventLogs(prev => [{ day: currentDay, text }, ...prev]);
  };

  // ─── Season Logic ───────────────────────────────────────────
  const getSeason = (day) => {
    const month = Math.floor((day % 365) / 30);
    if (month >= 2 && month < 5) return 'spring';
    if (month >= 5 && month < 8) return 'summer';
    if (month >= 8 && month < 11) return 'monsoon';
    return 'winter';
  };

  const getSeasonalEffects = (season) => {
    const effects = {
      spring: { temp: 18, rainfall: 45, flow: 120 },
      summer: { temp: 33, rainfall: 15, flow: 60 },
      monsoon: { temp: 25, rainfall: 180, flow: 250 },
      winter: { temp: 10, rainfall: 30, flow: 80 }
    };
    return effects[season];
  };

  // ─── Scenarios Loader ───────────────────────────────────────
  const loadScenario = (key) => {
    playSoundEffect('click');
    const s = SCENARIOS[key];
    if (!s) return;
    setSelectedScenario(key);
    setFactories({ ...s.factories });
    setFarming({ ...s.farming });
    setActivePolicies({ ...s.activePolicies });
    setBudget(s.budget);
    setPublicApproval(s.approval);
    setWqi(s.wqi);
    setFishPopulation(s.fish);
    setPh(s.ph);
    setDissolvedOxygen(s.do);
    setHistory([]);
    setCurrentDay(0);
    setEventPopupResult(null);
    setActiveEvent(null);
    setEventLogs([{ day: 0, text: `Loaded scenario: ${s.name}.` }]);
  };

  // ─── Calculations ───────────────────────────────────────────
  const calculateIndustrialPollution = () => {
    const base = factories.count * 120;
    const treatmentFactor = (105 - factories.treatment) / 100;
    const typeFactor = factories.type === 'chemical' ? 1.6 : factories.type === 'textile' ? 1.3 : 1.0;
    const lawsFactor = activePolicies.effluentLaws ? 0.5 : 1.0;
    const taxFactor = activePolicies.carbonTax ? 0.75 : 1.0;
    return base * treatmentFactor * typeFactor * lawsFactor * taxFactor;
  };

  const calculateAgriRunoff = () => {
    const base = farming.area * (farming.fertilizerUse / 100) * 60;
    const organicFactor = 1 - (farming.organic / 140);
    const rainfallFactor = Math.sqrt(rainfall / 50);
    const subsidyFactor = activePolicies.greenSubsidy ? 0.65 : 1.0;
    return base * organicFactor * rainfallFactor * subsidyFactor;
  };

  // ─── Main Simulation Step ───────────────────────────────────
  const simulateDay = () => {
    const nextDay = currentDay + 1;
    setCurrentDay(nextDay);

    const currentSeason = getSeason(nextDay);
    const effects = getSeasonalEffects(currentSeason);
    setSeason(currentSeason);

    // Weather variability
    const newTemp = Math.max(0, effects.temp + Math.sin(nextDay * 0.1) * 3 + (Math.random() - 0.5) * 4);
    const newRain = Math.max(0, effects.rainfall + (Math.random() - 0.5) * 30);
    const newFlow = Math.max(20, effects.flow + Math.sin(nextDay * 0.1) * 20 + (Math.random() - 0.5) * 40);

    setTemperature(newTemp);
    setRainfall(newRain);
    setRiverFlow(newFlow);

    // Pollution Calculations
    const indPoll = calculateIndustrialPollution();
    const agriPoll = calculateAgriRunoff();

    // Chemical / Bio index additions
    const dilution = newFlow / 100;
    const newEI = Math.max(5, Math.min(100, (agriPoll / (dilution * 3.5)) + (activePolicies.cleanupDrive ? -10 : 0)));
    const newHMI = Math.max(2, Math.min(100, (indPoll / (dilution * 5.0)) + (activePolicies.effluentLaws ? -8 : 0)));

    setEutrophicationIndex(newEI);
    setHeavyMetalsIndex(newHMI);

    // Turbidity calculated from runoff and rain stir
    const newTurbidity = Math.max(5, Math.min(100, 10 + (agriPoll / 12) + (newRain / 4)));
    setTurbidity(newTurbidity);

    // pH calculation shifts acid with chemicals / factory type
    const basePH = 7.3;
    const pHShift = (indPoll * 0.0006) + (factories.type === 'chemical' ? 0.3 : 0.1);
    const newPH = Math.max(3.0, Math.min(10.5, basePH - pHShift + (Math.random() - 0.5) * 0.2));
    setPh(newPH);

    // Dissolved Oxygen
    // Oxygen solubility is lower in high temperatures. Eutrophication algal respiration depletes DO.
    const tempFactor = (35 - newTemp) / 35;
    const oxygenSolubility = 11.5 * tempFactor;
    const depletion = (newEI * 0.05) + (newHMI * 0.02) + (newTurbidity * 0.01);
    const newDO = Math.max(0.5, Math.min(12, oxygenSolubility - depletion + (activePolicies.cleanupDrive ? 1.5 : 0)));
    setDissolvedOxygen(newDO);

    // Water Quality Index
    // Combined chemical weighted metrics
    const wqiPHScore = 100 - Math.abs(7.2 - newPH) * 25;
    const wqiDOScore = Math.min(100, (newDO / 8) * 100);
    const wqiTurbScore = 100 - newTurbidity;
    const wqiHmiScore = 100 - newHMI;
    const wqiEiScore = 100 - newEI;
    
    let calculatedWQI = (wqiPHScore * 0.15) + (wqiDOScore * 0.30) + (wqiTurbScore * 0.15) + (wqiHmiScore * 0.20) + (wqiEiScore * 0.20);
    calculatedWQI = Math.max(0, Math.min(100, calculatedWQI + (activePolicies.cleanupDrive ? 6 : 0)));
    setWqi(calculatedWQI);

    // Fish Health & Population growth / death
    // DO is the most vital metric. DO < 4.0 triggers acute asphyxiation.
    // Heavy metals bioaccumulate, causing mortality. pH extremes (< 6.0 or > 8.5) burn gills.
    let fishGrowthFactor = 1.002; // natural reproduction
    if (newDO < 4.2) {
      fishGrowthFactor -= 0.015 * (4.2 - newDO); // severe oxygen stress
    }
    if (newPH < 6.0) {
      fishGrowthFactor -= 0.008 * (6.0 - newPH);
    } else if (newPH > 8.5) {
      fishGrowthFactor -= 0.008 * (newPH - 8.5);
    }
    if (newHMI > 25) {
      fishGrowthFactor -= 0.0004 * (newHMI - 25); // chemical toxicity
    }
    
    const newFish = Math.max(0, fishPopulation * fishGrowthFactor);
    setFishPopulation(Math.round(newFish));

    // Sound Warning Trigger
    if (calculatedWQI < 40 && nextDay % 5 === 0) {
      playSoundEffect('alarm');
    }

    // Save history data
    const dataPoint = {
      day: nextDay,
      wqi: Math.round(calculatedWQI),
      do: Number(newDO.toFixed(1)),
      fish: Math.round(newFish),
      industrial: Math.round(indPoll),
      agricultural: Math.round(agriPoll),
      eutrophication: Math.round(newEI),
      heavyMetals: Math.round(newHMI),
      temperature: Math.round(newTemp)
    };
    setHistory(prev => [...prev.slice(-120), dataPoint]);

    // Random Event Engine: 5% chance every day if not already displaying one
    if (nextDay > 5 && nextDay % 30 === 0 && Math.random() < 0.6 && !activeEvent) {
      const randEvent = SIMULATION_EVENTS[Math.floor(Math.random() * SIMULATION_EVENTS.length)];
      setActiveEvent(randEvent);
      setIsRunning(false); // pause simulation during event decision
      playSoundEffect('alarm');
    }
  };

  // ─── Simple Prediction Generator ────────────────────────────
  const generatePredictions = () => {
    const pred = [];
    let w = wqi;
    let f = fishPopulation;

    for (let i = 1; i <= 12; i++) {
      const trend = (w - 52) / 120;
      w = Math.max(10, Math.min(100, w + trend * 4.5));
      f = Math.max(10, f * (0.96 + (w / 250)));

      pred.push({
        month: i,
        wqi: Math.round(w),
        fish: Math.round(f)
      });
    }
    setPredictions(pred);
  };

  // ─── Policy Interventions ───────────────────────────────────
  const togglePolicy = (policy) => {
    const costs = { effluentLaws: 250000, greenSubsidy: 180000, cleanupDrive: 60000, carbonTax: 120000 };
    const approvalChanges = { effluentLaws: -8, greenSubsidy: 12, cleanupDrive: 18, carbonTax: -14 };

    if (!activePolicies[policy]) {
      if (budget >= costs[policy]) {
        playSoundEffect('chime_up');
        setActivePolicies(prev => ({ ...prev, [policy]: true }));
        setBudget(prev => prev - costs[policy]);
        setPublicApproval(prev => Math.max(0, Math.min(100, prev + approvalChanges[policy])));
        logEvent(`Activated policy: ${policy.replace(/([A-Z])/g, ' $1')}. Cost: $${(costs[policy]/1000).toFixed(0)}K.`);
      } else {
        playSoundEffect('chime_down');
        alert("Insufficient municipal budget to enact this policy!");
      }
    } else {
      playSoundEffect('chime_down');
      setActivePolicies(prev => ({ ...prev, [policy]: false }));
      setPublicApproval(prev => Math.max(0, Math.min(100, prev - approvalChanges[policy])));
      logEvent(`Repealed policy: ${policy.replace(/([A-Z])/g, ' $1')}.`);
    }
  };

  // ─── Event Resolution ───────────────────────────────────────
  const handleEventChoice = (option) => {
    playSoundEffect('click');
    option.effect({
      setBudget,
      setFactories,
      setFarming,
      setPublicApproval,
      setWqi,
      setFishPopulation,
      setDissolvedOxygen,
      logEvent
    });
    setEventPopupResult({
      title: activeEvent.title,
      text: "Resolution implemented successfully.",
      choiceText: option.text
    });
    setActiveEvent(null);
  };

  // ─── Reset Function ─────────────────────────────────────────
  const resetSimulation = () => {
    loadScenario('baseline');
  };

  // ─── Simulation Loops ───────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      simulateDay();
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, factories, farming, activePolicies, currentDay, wqi, fishPopulation]);

  useEffect(() => {
    generatePredictions();
  }, [wqi, fishPopulation]);

  // ─── 2D Interactive Canvas Drawing ──────────────────────────
  useEffect(() => {
    const canvas = riverCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let frame;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Define particles arrays
    const smokeParticles = [];
    const industrialSewage = [];
    const fertilizerRunoff = [];
    const canvasFish = [];
    const backgroundRain = [];

    // Initialize fish swimming details
    for (let i = 0; i < 22; i++) {
      canvasFish.push({
        x: Math.random() * canvas.width,
        y: canvas.height * 0.45 + Math.random() * (canvas.height * 0.38),
        speed: 0.8 + Math.random() * 1.5,
        direction: Math.random() > 0.5 ? 1 : -1,
        angle: Math.random() * Math.PI * 2,
        size: 10 + Math.random() * 12,
        color: `hsl(${190 + Math.random() * 30}, 85%, 65%)`
      });
    }

    // Dynamic color selection based on water health index
    const getRiverColor = () => {
      if (wqi >= 80) return { primary: '#0891b2', secondary: '#0e7490', foam: 'rgba(103,232,249,0.3)', haze: 0 }; // Clean Blue-Green
      if (wqi >= 60) return { primary: '#2563eb', secondary: '#1d4ed8', foam: 'rgba(147,197,253,0.25)', haze: 0 }; // Standard Blue
      if (wqi >= 42) return { primary: '#b45309', secondary: '#78350f', foam: 'rgba(253,186,116,0.3)', haze: 0.05 }; // Muddy Orange/Brown
      return { primary: '#be123c', secondary: '#881337', foam: 'rgba(251,113,133,0.35)', haze: 0.22 }; // Toxic Red
    };

    // Draw helper - Rounded Rect
    const drawRoundedRect = (c, x, y, width, height, radius, fill, stroke) => {
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + width - radius, y);
      c.quadraticCurveTo(x + width, y, x + width, y + radius);
      c.lineTo(x + width, y + height - radius);
      c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      c.lineTo(x + radius, y + height);
      c.quadraticCurveTo(x, y + height, x, y + height - radius);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.stroke();
      }
    };

    const animate = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        frame = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // ─── 1. SKY & HILLS BACKGROUND ───
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0d1527');
      bgGrad.addColorStop(1, '#111c34');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Hills Horizon silhouette
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.42);
      ctx.quadraticCurveTo(w * 0.25, h * 0.32, w * 0.5, h * 0.40);
      ctx.quadraticCurveTo(w * 0.75, h * 0.30, w, h * 0.44);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // ─── 2. RAIN WEATHER ANIMATION ───
      if (rainfall > 35) {
        const density = Math.min(60, Math.round(rainfall / 3.0));
        while (backgroundRain.length < density) {
          backgroundRain.push({
            x: Math.random() * w,
            y: -20,
            speed: 8 + Math.random() * 8,
            length: 12 + Math.random() * 15
          });
        }
        ctx.strokeStyle = 'rgba(125,211,252,0.3)';
        ctx.lineWidth = 1;
        backgroundRain.forEach((r, idx) => {
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 2, r.y + r.length);
          ctx.stroke();

          r.y += r.speed;
          r.x -= 2;

          // Recycle rain
          if (r.y > h) {
            backgroundRain[idx] = {
              x: Math.random() * w,
              y: -20,
              speed: 8 + Math.random() * 8,
              length: 12 + Math.random() * 15
            };
          }
        });
      }

      // ─── 3. LAND HORIZONS & HOVER HOT-ZONES (Left & Right Banks) ───
      // Left Shore: Factories
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w * 0.32, h * 0.45);
      ctx.quadraticCurveTo(w * 0.35, h * 0.48, w * 0.34, h * 0.55);
      ctx.lineTo(0, h * 0.55);
      ctx.closePath();
      ctx.fill();

      // Right Shore: Farmland
      ctx.fillStyle = '#0f3a1d'; // Rich green
      ctx.beginPath();
      ctx.moveTo(w, h * 0.45);
      ctx.lineTo(w * 0.68, h * 0.45);
      ctx.quadraticCurveTo(w * 0.65, h * 0.48, w * 0.66, h * 0.55);
      ctx.lineTo(w, h * 0.55);
      ctx.closePath();
      ctx.fill();

      // Draw agricultural rows on Right bank
      ctx.strokeStyle = farming.fertilizerUse > 72 ? '#78350f' : '#22c55e';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.72 + i * 20, h * 0.46);
        ctx.lineTo(w * 0.76 + i * 24, h * 0.53);
        ctx.stroke();
      }

      // Draw Factory Buildings on Left bank
      const numFacs = Math.min(10, factories.count);
      for (let i = 0; i < numFacs; i++) {
        const fx = 15 + i * 26;
        const fy = h * 0.45;
        const fh = 20 + (i % 3) * 8;
        const fw = 18;

        // Base box
        drawRoundedRect(ctx, fx, fy - fh, fw, fh, 2, '#334155', '#475569');
        // Slanted roof
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(fx, fy - fh);
        ctx.lineTo(fx + fw / 2, fy - fh - 6);
        ctx.lineTo(fx + fw, fy - fh);
        ctx.closePath();
        ctx.fill();

        // Chimney pipes emitting smoke
        const cx = fx + fw - 4;
        const cy = fy - fh - 2;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 2, cy - 8, 4, 8);

        // Generate Chimney Smoke
        if (isRunning && Math.random() < 0.12 && speed > 0) {
          smokeParticles.push({
            x: cx,
            y: cy - 8,
            vx: -0.2 - Math.random() * 0.3,
            vy: -0.4 - Math.random() * 0.5,
            size: 2 + Math.random() * 4,
            alpha: 0.8
          });
        }
      }

      // Render factory chimney smoke
      smokeParticles.forEach((p, idx) => {
        ctx.fillStyle = `rgba(148,163,184,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.008;
        p.size += 0.12;

        if (p.alpha <= 0) smokeParticles.splice(idx, 1);
      });

      // ─── 4. WATER FLOW (RIVER BED) ───
      const colors = getRiverColor();
      const rY = h * 0.45; // river surface baseline
      const rH = h - rY;

      // Base water color
      const riverGrad = ctx.createLinearGradient(0, rY, 0, h);
      riverGrad.addColorStop(0, colors.primary);
      riverGrad.addColorStop(0.6, colors.secondary);
      riverGrad.addColorStop(1, '#020617');
      ctx.fillStyle = riverGrad;
      ctx.fillRect(0, rY, w, rH);

      // Waves Animation Overlay
      ctx.fillStyle = colors.foam;
      const numWaves = 4;
      for (let i = 0; i < numWaves; i++) {
        const wavePhase = t * 1.5 + i * Math.PI * 0.5;
        const speedScale = 0.015 + i * 0.005;
        ctx.beginPath();
        ctx.moveTo(0, rY + h * speedScale);
        
        for (let x = 0; x <= w; x += 15) {
          const dy = Math.sin(x * 0.01 + wavePhase) * (5 + i * 2);
          ctx.lineTo(x, rY + 12 + i * 15 + dy);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
      }

      // Eutrophication / Algae bloom floating green sheet
      if (eutrophicationIndex > 35) {
        ctx.fillStyle = `rgba(34, 197, 94, ${Math.min(0.5, (eutrophicationIndex - 30) / 130)})`;
        ctx.beginPath();
        ctx.moveTo(0, rY + 10);
        for (let x = 0; x <= w; x += 25) {
          const dy = Math.sin(x * 0.015 + t) * 6;
          ctx.lineTo(x, rY + 15 + dy);
        }
        ctx.lineTo(w, rY + 45);
        ctx.lineTo(0, rY + 45);
        ctx.closePath();
        ctx.fill();
      }

      // ─── 5. POLLUTANT EFFLUENT & AGRICULTURAL RUNOFF DISCHARGE ───
      // Factory discharge pipe on Left shore
      const pipeX = w * 0.32;
      const pipeY = rY + 10;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(pipeX - 10, pipeY, 12, 10);
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(pipeX + 2, pipeY + 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Emit Industrial Sewage plumes
      if (isRunning && factories.count > 0 && Math.random() < 0.25) {
        const metalLoad = heavyMetalsIndex;
        industrialSewage.push({
          x: pipeX,
          y: pipeY + 5,
          vx: 0.5 + Math.random() * 1.5,
          vy: 0.1 + Math.random() * 0.6,
          size: 2.5 + Math.random() * 5,
          alpha: 0.85,
          color: metalLoad > 40 ? 'rgba(76,29,149,0.7)' : 'rgba(115,76,34,0.7)' // toxic purple vs muddy brown
        });
      }

      industrialSewage.forEach((p, idx) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.size += 0.06;
        p.alpha -= 0.007;

        if (p.alpha <= 0 || p.x > w) industrialSewage.splice(idx, 1);
      });

      // Emit Agricultural Runoff (green fertilizer bubbles)
      const farmX = w * 0.68;
      const farmY = rY + 12;
      if (isRunning && farming.area > 0 && farming.fertilizerUse > 35 && Math.random() < 0.20) {
        fertilizerRunoff.push({
          x: farmX + Math.random() * 50,
          y: farmY,
          vx: -0.4 - Math.random() * 1.2,
          vy: 0.2 + Math.random() * 0.8,
          size: 1.5 + Math.random() * 3.5,
          alpha: 0.9
        });
      }

      fertilizerRunoff.forEach((p, idx) => {
        ctx.fillStyle = `rgba(74, 222, 128, ${p.alpha})`; // neon lime-green
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.008;

        if (p.alpha <= 0 || p.x < 0) fertilizerRunoff.splice(idx, 1);
      });

      // ─── 6. SWIMMING WILDLIFE (FISH POPULATION) ───
      // Determine number of active fish to render (min 2, max 22 based on population)
      const visibleFishCount = Math.max(1, Math.min(22, Math.ceil(fishPopulation / 68)));
      
      for (let i = 0; i < visibleFishCount; i++) {
        const fish = canvasFish[i];
        if (!fish) continue;

        ctx.save();
        ctx.translate(fish.x, fish.y);

        // Fish swimming states based on DO
        if (dissolvedOxygen < 3.5) {
          // Asphyxiating - Float belly-up, tilt upside down
          ctx.rotate(Math.PI + Math.sin(t * 1.5 + i) * 0.1);
          fish.speed = 0.15;
          fish.y = Math.max(rY + 12, fish.y - 0.25); // Float upwards
        } else {
          // Healthy swimming
          ctx.rotate(fish.direction === 1 ? Math.sin(t * 3.5 + i) * 0.08 : Math.PI + Math.sin(t * 3.5 + i) * 0.08);
          // Standard swimming limits
          fish.y = Math.min(h - 15, Math.max(rY + 25, fish.y + Math.sin(fish.angle + t) * 0.18));
        }

        // Draw Fish Silhouette
        ctx.fillStyle = fish.color;
        ctx.beginPath();
        // Body ellipse
        ctx.ellipse(0, 0, fish.size, fish.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail fin
        ctx.beginPath();
        ctx.moveTo(-fish.size, 0);
        ctx.lineTo(-fish.size - fish.size * 0.4, -fish.size * 0.35);
        ctx.lineTo(-fish.size - fish.size * 0.4, fish.size * 0.35);
        ctx.closePath();
        ctx.fill();

        // Eye
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(fish.size * 0.5, -fish.size * 0.1, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Swim move logic
        if (isRunning && speed > 0) {
          fish.x += fish.speed * fish.direction * speed;
          if (fish.x > w + 20) {
            fish.x = -20;
            fish.y = rY + 20 + Math.random() * (rH - 40);
          } else if (fish.x < -20) {
            fish.x = w + 20;
            fish.y = rY + 20 + Math.random() * (rH - 40);
          }
        }
      }

      // ─── 7. WATER OVERLAY POLLUTION HAZE ───
      if (colors.haze > 0) {
        ctx.fillStyle = `rgba(220, 38, 38, ${colors.haze})`;
        ctx.fillRect(0, rY, w, rH);
      }

      // Draw canvas bounds/districts lines on overlay
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.33, 0); ctx.lineTo(w * 0.33, h);
      ctx.moveTo(w * 0.67, 0); ctx.lineTo(w * 0.67, h);
      ctx.stroke();

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [wqi, dissolvedOxygen, factories.count, farming.area, farming.fertilizerUse, isRunning, speed]);

  // ─── Canvas Interaction (Hit Testing) ───────────────────────
  const handleCanvasMouseMove = (e) => {
    const canvas = riverCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = canvas.width;

    if (x < w * 0.33) {
      setCanvasTooltip({
        title: "Factory District (Left Shore)",
        desc: `Monitoring ${factories.count} plants. Industrial effluent is running at ${Math.round(calculateIndustrialPollution() / 5)} kiloliters/day with a ${factories.treatment}% purification treatment rate.`
      });
    } else if (x > w * 0.67) {
      setCanvasTooltip({
        title: "Agricultural Basin (Right Shore)",
        desc: `Covers ${farming.area} km² farmland. Nitrogen runoffs are active at ${Math.round(calculateAgriRunoff() / 6)} ppm. Farms are using ${farming.organic}% organic agriculture methods.`
      });
    } else {
      setCanvasTooltip({
        title: "River Hydrosphere (Channel Basin)",
        desc: `Current Dissolved Oxygen is ${dissolvedOxygen.toFixed(1)} mg/L. pH balance stands at ${ph.toFixed(2)}. Eutrophication index is estimated at ${Math.round(eutrophicationIndex)}%.`
      });
    }
  };

  const handleCanvasMouseLeave = () => {
    setCanvasTooltip(null);
  };

  // Determine status levels for widgets
  const getHealthStatus = (value, thresholds) => {
    if (value >= thresholds.good) return { status: 'Optimal', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
    if (value >= thresholds.moderate) return { status: 'Stressed', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
    return { status: 'Critical', color: 'text-rose-400 border-rose-500/20 bg-rose-500/5 warning-glow' };
  };

  const wqiHealth = getHealthStatus(wqi, { good: 75, moderate: 45 });
  const doHealth = getHealthStatus(dissolvedOxygen, { good: 6.8, moderate: 4.5 });
  const fishHealth = getHealthStatus(fishPopulation, { good: 850, moderate: 420 });

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 p-4 md:p-6 font-outfit">
      
      {/* ─── Header ─── */}
      <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg text-white shadow-lg shadow-cyan-500/20">
              <Droplets className="w-6 h-6 animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                HydroSphere
              </h1>
              <p className="text-xs md:text-sm text-cyan-400/80 font-medium">
                River Basin Ecosystem Pollution & Policy Simulator
              </p>
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center gap-3 md:gap-5">
          {/* Mute toggle */}
          <button
            onClick={() => {
              setSoundMuted(!soundMuted);
              playSoundEffect('click');
            }}
            className={`p-2.5 rounded-lg border transition-all ${
              soundMuted
                ? 'border-slate-700 text-slate-400 hover:text-slate-200 bg-slate-800/40'
                : 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
            }`}
            title={soundMuted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Scenario Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preset Scenario:</span>
            <select
              value={selectedScenario}
              onChange={(e) => loadScenario(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-sm text-cyan-400 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="baseline">Standard Baseline</option>
              <option value="industrialBoom">Industrial Expansion</option>
              <option value="agriHub">Agricultural Heartland</option>
              <option value="greenUtopia">Eco-Haven Initiative</option>
              <option value="crisis">Ecological Collapse</option>
            </select>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          {/* Speed Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Speed:</span>
            <div className="flex bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSpeed(s);
                    playSoundEffect('click');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    speed === s ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* ─── Sidebar Controls (Col 1) ─── */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Main Controls Card */}
          <div className="glass-panel rounded-xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-lg text-slate-200">Time & Actions</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 indicator-glow"></span>
                <span className="text-xs font-mono font-medium text-cyan-400/90 uppercase tracking-widest">{season}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5 bg-slate-950/60 rounded-lg p-3 border border-slate-900 font-mono">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Timeline</span>
                <span className="text-lg font-bold text-slate-100">Day {currentDay}</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Weather</span>
                <span className="text-sm font-semibold text-cyan-400 flex items-center justify-end gap-1">
                  {rainfall > 40 ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {temperature.toFixed(0)}°C
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRunning(!isRunning);
                  playSoundEffect('click');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition shadow-lg ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/15'
                }`}
              >
                {isRunning ? <Pause size={18} /> : <Play size={18} />}
                {isRunning ? 'Pause Sim' : 'Run Simulator'}
              </button>
              <button
                onClick={() => {
                  playSoundEffect('chime_down');
                  resetSimulation();
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition border border-slate-700"
                title="Reset simulation variables"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Industrial Polluters control */}
          <div className="glass-panel rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Factory className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-slate-200">Industrial Districts</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Active Factories</span>
                  <span className="font-bold text-rose-400 font-mono">{factories.count} plants</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={factories.count}
                  onChange={e => {
                    setFactories({ ...factories, count: +e.target.value });
                    playSoundEffect('bubble');
                  }}
                  className="custom-slider slider-red"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Treatment Rate</span>
                  <span className="font-bold text-cyan-400 font-mono">{factories.treatment}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={factories.treatment}
                  onChange={e => {
                    setFactories({ ...factories, treatment: +e.target.value });
                    playSoundEffect('bubble');
                  }}
                  className="custom-slider slider-blue"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Manufacture Focus</label>
                <select
                  value={factories.type}
                  onChange={e => {
                    setFactories({ ...factories, type: e.target.value });
                    playSoundEffect('click');
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="chemical">Heavy Chemical Synthesis (Severe pH/Toxins)</option>
                  <option value="textile">Textile Dye Mill (High Metals/Turbidity)</option>
                  <option value="food">Organic Food Processing (High Organic Matter)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agricultural controls */}
          <div className="glass-panel rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-200">Agricultural Watershed</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Total Farm Area</span>
                  <span className="font-bold text-emerald-400 font-mono">{farming.area} km²</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={farming.area}
                  onChange={e => {
                    setFarming({ ...farming, area: +e.target.value });
                    playSoundEffect('bubble');
                  }}
                  className="custom-slider slider-green"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Chemical Fertilizer Use</span>
                  <span className="font-bold text-amber-400 font-mono">{farming.fertilizerUse}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={farming.fertilizerUse}
                  onChange={e => {
                    setFarming({ ...farming, fertilizerUse: +e.target.value });
                    playSoundEffect('bubble');
                  }}
                  className="custom-slider slider-amber"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Organic Farming Share</span>
                  <span className="font-bold text-emerald-400 font-mono">{farming.organic}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={farming.organic}
                  onChange={e => {
                    setFarming({ ...farming, organic: +e.target.value });
                    playSoundEffect('bubble');
                  }}
                  className="custom-slider slider-green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Interface & Visualizer (Col 2-4) ─── */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Key Indicators Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            
            <div className={`border rounded-xl p-4 transition-all duration-300 ${wqiHealth.color}`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1 opacity-80">
                <span className="uppercase">Water Quality (WQI)</span>
                <Droplets className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold font-mono mb-0.5">{Math.round(wqi)}</div>
              <div className="text-[10px] font-bold tracking-wider uppercase">{wqiHealth.status}</div>
            </div>

            <div className={`border rounded-xl p-4 transition-all duration-300 ${doHealth.color}`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1 opacity-80">
                <span className="uppercase">Dissolved Oxygen</span>
                <span className="text-[10px] uppercase font-mono">DO</span>
              </div>
              <div className="text-3xl font-extrabold font-mono mb-0.5">{dissolvedOxygen.toFixed(1)}</div>
              <div className="text-[10px] font-bold tracking-wider uppercase">{dissolvedOxygen > 6.5 ? 'Optimal' : dissolvedOxygen > 4.2 ? 'Hypoxic Stress' : 'Anoxic Danger'}</div>
            </div>

            <div className={`border rounded-xl p-4 transition-all duration-300 ${fishHealth.color}`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1 opacity-80">
                <span className="uppercase">Fish Population</span>
                <Fish className="w-4 h-4" />
              </div>
              <div className="text-3xl font-extrabold font-mono mb-0.5">{fishPopulation.toLocaleString()}</div>
              <div className="text-[10px] font-bold tracking-wider uppercase">{fishHealth.status}</div>
            </div>

            <div className="border border-slate-800/80 bg-slate-900/50 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-400">
                <span className="uppercase">Local Budget</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-0.5">${(budget / 1000).toFixed(0)}K</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Funding Reserves</div>
            </div>

            <div className="border border-slate-800/80 bg-slate-900/50 rounded-xl p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs font-semibold mb-1 text-slate-400">
                <span className="uppercase">Public Approval</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-cyan-400 mb-0.5">{publicApproval}%</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                {publicApproval > 60 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                Approval Rating
              </div>
            </div>
          </div>

          {/* Event Popup Decision Overlay */}
          {activeEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
              <div className="glass-panel-heavy rounded-2xl max-w-2xl w-full p-6 md:p-8 border border-cyan-500/30 shadow-2xl relative warning-glow">
                <div className="absolute top-4 right-4 text-amber-500 flex items-center gap-1 text-xs font-mono uppercase bg-amber-500/10 py-1 px-2.5 rounded border border-amber-500/20">
                  <ShieldAlert className="w-4 h-4" />
                  Ecosystem Incident
                </div>
                
                <h2 className="text-2xl font-extrabold text-white mt-2 mb-3 bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent">
                  🚨 {activeEvent.title}
                </h2>
                
                <p className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed">
                  {activeEvent.description}
                </p>

                <div className="space-y-3.5">
                  {activeEvent.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEventChoice(opt)}
                      className="w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800/80 hover:border-cyan-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300">
                        {opt.text}
                      </div>
                      <div className="text-[10px] font-bold text-amber-400 tracking-wider uppercase shrink-0 font-mono bg-slate-900 py-1 px-2.5 rounded border border-slate-800">
                        {opt.impact}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Event Result Toast */}
          {eventPopupResult && (
            <div className="border border-cyan-500/20 bg-cyan-950/40 backdrop-blur-md rounded-xl p-4 flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <h4 className="font-bold text-cyan-400 text-sm">{eventPopupResult.title} Resolution</h4>
                <p className="text-xs text-slate-300 mt-1">{eventPopupResult.choiceText}</p>
              </div>
              <button
                onClick={() => {
                  playSoundEffect('click');
                  setEventPopupResult(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-300 underline font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Interactive Navigation Tabs */}
          <div className="flex bg-slate-900 border border-slate-800/80 rounded-xl p-1 font-medium text-sm">
            <button
              onClick={() => { setActiveTab('simulation'); playSoundEffect('click'); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'simulation' ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplets className="w-4 h-4" />
              Live Visual Basin
            </button>
            <button
              onClick={() => { setActiveTab('science'); playSoundEffect('click'); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'science' ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-4 h-4" />
              Ecosystem Science Reference
            </button>
            <button
              onClick={() => { setActiveTab('charts'); playSoundEffect('click'); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'charts' ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Trend Charts
            </button>
            <button
              onClick={() => { setActiveTab('logs'); playSoundEffect('click'); }}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'logs' ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Incident Logs
            </button>
          </div>

          {/* ─── Simulation Tab ─── */}
          {activeTab === 'simulation' && (
            <div className="space-y-6">
              {/* Canvas Interactive River Visualization */}
              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 relative shadow-2xl">
                
                <div className="bg-slate-900/90 text-slate-300 border-b border-slate-800 px-5 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-slate-200 uppercase tracking-wide text-xs">Dynamic Basin Visualizer</span>
                  </div>
                  <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1 bg-slate-950 py-1 px-2.5 rounded border border-slate-800">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    Hover over shorelines for regional reports
                  </div>
                </div>

                <div className="relative h-64 md:h-80 lg:h-96">
                  <canvas
                    ref={riverCanvasRef}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={handleCanvasMouseLeave}
                    className="w-full h-full cursor-crosshair"
                  />
                  
                  {/* Canvas regional tooltip overlay */}
                  {canvasTooltip && (
                    <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-slate-950/95 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20 shadow-xl pointer-events-none transition-all duration-150">
                      <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                        {canvasTooltip.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {canvasTooltip.desc}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Policy Interventions Grid */}
              <div className="glass-panel rounded-xl p-6 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800/80 pb-2.5">
                  Policy Interventions
                </h3>
                
                {/* Lookups to map dynamic classes cleanly to prevent Tailwind purge issues */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'effluentLaws', title: 'Effluent Regulation Laws', desc: 'Mandate factory treatment. Cuts industrial toxicity -50%.', cost: '$250K', status: 'Approval -8%' },
                    { key: 'greenSubsidy', title: 'Sustainable Farm Subsidy', desc: 'Promotes green farming methods. Reduces farm runoffs -35%.', cost: '$180K', status: 'Approval +12%' },
                    { key: 'cleanupDrive', title: 'Community Cleanup Drive', desc: 'Direct garbage cleanup. Raises water quality index +6 WQI.', cost: '$60K', status: 'Approval +18%' },
                    { key: 'carbonTax', title: 'Industrial Carbon Tax', desc: 'Tax carbon outputs. Reduces factory pollution outputs -25%.', cost: '$120K', status: 'Approval -14%' }
                  ].map(p => {
                    const isActive = activePolicies[p.key];
                    let borderClass = 'border-slate-800/80 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80';
                    let titleColor = 'text-slate-200';
                    
                    if (isActive) {
                      if (p.key === 'effluentLaws') { borderClass = 'border-blue-500/80 bg-blue-500/10'; titleColor = 'text-blue-400'; }
                      if (p.key === 'greenSubsidy') { borderClass = 'border-emerald-500/80 bg-emerald-500/10'; titleColor = 'text-emerald-400'; }
                      if (p.key === 'cleanupDrive') { borderClass = 'border-cyan-500/80 bg-cyan-500/10'; titleColor = 'text-cyan-400'; }
                      if (p.key === 'carbonTax') { borderClass = 'border-purple-500/80 bg-purple-500/10'; titleColor = 'text-purple-400'; }
                    }

                    return (
                      <button
                        key={p.key}
                        onClick={() => togglePolicy(p.key)}
                        className={`p-4 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between h-44 group ${borderClass}`}
                      >
                        <div>
                          <div className={`font-bold text-sm mb-1.5 transition group-hover:text-cyan-400 ${titleColor}`}>
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            {p.desc}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider font-mono uppercase bg-slate-950/80 py-1.5 px-2.5 rounded border border-slate-800 w-full shrink-0">
                          <span className="text-emerald-400 font-extrabold">{p.cost}</span>
                          <span className={p.status.includes('+') ? 'text-emerald-400' : 'text-rose-400'}>{p.status}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Science Reference Tab ─── */}
          {activeTab === 'science' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="glass-panel rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2">
                  <Droplets className="w-5 h-5" />
                  <h4 className="font-bold text-base">Dissolved Oxygen (DO) Balance</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Dissolved oxygen measures the molecular oxygen gas dissolved in water. It is vital for gill-breathing aquatic organisms.
                </p>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 text-[11px] font-mono text-cyan-400/90 leading-relaxed space-y-1">
                  <div><strong>Thermodynamic Solubility limit:</strong> drops as water temperature goes up. Cold water holds more oxygen.</div>
                  <div><strong>Eutrophication depletion:</strong> algal respiration and organic decomposition consume vast amounts of oxygen, causing hypoxic zones.</div>
                  <div><strong>Thresholds:</strong> &gt;6.5 mg/L is thriving, &lt;4.0 mg/L causes gill distress, &lt;2.0 mg/L is anoxia (severe die-offs).</div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-2">
                  <Sprout className="w-5 h-5" />
                  <h4 className="font-bold text-base">Eutrophication (Nutrient Overload)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Eutrophication is caused by high concentrations of nitrates and phosphates, commonly originating from synthetic agricultural fertilizers.
                </p>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 text-[11px] font-mono text-emerald-400/90 leading-relaxed space-y-1">
                  <div><strong>Agricultural Runoff:</strong> Heavy rain carries fertilizers directly into the watershed.</div>
                  <div><strong>Cyanobacteria Blooms:</strong> Extreme nutrient levels trigger massive algae multiplying. They block sunlight and consume oxygen during nighttime cycles.</div>
                  <div><strong>Mitigations:</strong> Enacting green subsidies encourages organic farming techniques, reducing toxic runoffs.</div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-400 border-b border-slate-800 pb-2">
                  <Factory className="w-5 h-5" />
                  <h4 className="font-bold text-base">Heavy Metals & Industrial Pollutants</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Factories discharging untreated chemical synthetics or metal dyes cause long-lasting environmental toxicity.
                </p>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 text-[11px] font-mono text-rose-400/90 leading-relaxed space-y-1">
                  <div><strong>Bioaccumulation:</strong> Toxins accumulate inside aquatic organisms. High heavy metal ratios trigger biological cell collapse.</div>
                  <div><strong>pH Alterations:</strong> Untreated industrial effluents change the pH value of the river, disrupting biological chemistry.</div>
                  <div><strong>Regulatory Mitigations:</strong> Effluent laws enforce onsite biological treatment setups. Carbon taxes reduce heavy manufacture footprints.</div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-purple-400 border-b border-slate-800 pb-2">
                  <Info className="w-5 h-5" />
                  <h4 className="font-bold text-base">Water Quality Index (WQI)</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  WQI is a single composite metric reflecting overall river health, combining pH, turbidity, dissolved oxygen, and toxic indices.
                </p>
                <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 text-[11px] font-mono text-purple-400/90 leading-relaxed space-y-1">
                  <div><strong>pH Ideal:</strong> Near neutrality (7.2 - 7.5). Extremes are highly corrosive.</div>
                  <div><strong>Turbidity Score:</strong> Suspended sediment blocks light, preventing plant photosynthesis.</div>
                  <div><strong>WQI weighting:</strong> DO (30%), Heavy Metals (20%), Eutrophication (20%), pH balance (15%), and Turbidity (15%).</div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Chart Reference Tab ─── */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              
              <div className="glass-panel rounded-xl p-5 shadow-xl">
                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                  Ecosystem Environmental Metrics (Last 120 Days)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="wqi" stroke="#06b6d4" name="Water Quality (WQI)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="do" stroke="#10b981" name="Dissolved Oxygen (DO)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 shadow-xl">
                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-rose-400" />
                  Effluent Load Indexes
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="heavyMetals" stackId="1" stroke="#f43f5e" fill="rgba(244,63,94,0.15)" name="Heavy Metals index" />
                      <Area type="monotone" dataKey="eutrophication" stackId="1" stroke="#fbbf24" fill="rgba(251,191,36,0.15)" name="Eutrophication Index" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-5 shadow-xl">
                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  12-Month Predictive Outlook (WQI vs. Fish Population)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'Months Ahead', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', color: '#f8fafc' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="wqi" stroke="#a855f7" name="Forecast WQI" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="fish" stroke="#ec4899" name="Forecast Fish Population" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ─── Incident Logs Tab ─── */}
          {activeTab === 'logs' && (
            <div className="glass-panel rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Historical Simulation Log
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  Reverse Chronological Order
                </span>
              </div>
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2">
                {eventLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/60 rounded-lg border border-slate-850 flex items-start gap-3.5 hover:border-slate-800 transition"
                  >
                    <span className="text-xs font-bold text-cyan-400/90 font-mono shrink-0 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded">
                      Day {log.day}
                    </span>
                    <span className="text-xs md:text-sm text-slate-300 font-medium">
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ecosystem Warnings Banner */}
          {(wqi < 45 || dissolvedOxygen < 4.0 || fishPopulation < 350) && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 warning-glow flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-400 text-lg leading-none mb-2">
                  CRITICAL BIOSPHERE COLLAPSE WARNING
                </h4>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  {wqi < 45 && "• River Water Quality Index has fallen into dangerous hypoxic toxic categories. "}
                  {dissolvedOxygen < 4.0 && "• Dissolved Oxygen is below biological survival thresholds (4.0 mg/L). Aquatic organisms are asphyxiating. "}
                  {fishPopulation < 350 && "• Local aquatic wildlife populations are crashing exponentially. "}
                  Immediate political regulations and effluent containment actions are recommended.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiverPollutionSimulator;