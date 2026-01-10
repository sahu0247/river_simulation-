import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, RotateCcw, AlertTriangle, TrendingUp, TrendingDown, Droplets, Factory, Sprout, Fish, DollarSign } from 'lucide-react';

const RiverPollutionSimulator = () => {
  // ─── Simulation State ───────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [speed, setSpeed] = useState(1);

  // ─── Environmental Parameters ───────────────────────────────
  const [season, setSeason] = useState('spring');
  const [temperature, setTemperature] = useState(20);
  const [rainfall, setRainfall] = useState(50);
  const [riverFlow, setRiverFlow] = useState(100);

  // ─── Pollution Sources ──────────────────────────────────────
  const [factories, setFactories] = useState({
    count: 5,
    treatment: 50,
    type: 'chemical'
  });

  const [farming, setFarming] = useState({
    area: 100,
    fertilizerUse: 70,
    organic: 30
  });

  // ─── Policies ───────────────────────────────────────────────
  const [activePolicies, setActivePolicies] = useState({
    effluentLaws: false,
    greenSubsidy: false,
    cleanupDrive: false,
    carbonTax: false
  });

  // ─── Metrics ────────────────────────────────────────────────
  const [wqi, setWqi] = useState(65);
  const [dissolvedOxygen, setDissolvedOxygen] = useState(7.5);
  const [ph, setPh] = useState(7.2);
  const [turbidity, setTurbidity] = useState(30);
  const [fishPopulation, setFishPopulation] = useState(1000);
  const [budget, setBudget] = useState(1000000);
  const [publicApproval, setPublicApproval] = useState(60);

  // ─── Historical & Prediction Data ───────────────────────────
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);

  // ─── River Canvas Ref ───────────────────────────────────────
  const riverCanvasRef = useRef(null);

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
      spring: { temp: 20, rainfall: 60, flow: 110 },
      summer: { temp: 32, rainfall: 20, flow: 70 },
      monsoon: { temp: 26, rainfall: 150, flow: 200 },
      winter: { temp: 12, rainfall: 40, flow: 90 }
    };
    return effects[season];
  };

  // ─── Pollution Calculations ─────────────────────────────────
  const calculateIndustrialPollution = () => {
    const base = factories.count * 100;
    const treatmentFactor = (100 - factories.treatment) / 100;
    const typeFactor = factories.type === 'chemical' ? 1.5 : factories.type === 'textile' ? 1.3 : 1.0;
    const policyFactor = activePolicies.effluentLaws ? 0.6 : 1.0;
    const taxFactor = activePolicies.carbonTax ? 0.8 : 1.0;
    return base * treatmentFactor * typeFactor * policyFactor * taxFactor;
  };

  const calculateAgriRunoff = () => {
    const base = farming.area * (farming.fertilizerUse / 100) * 50;
    const organicFactor = 1 - (farming.organic / 200);
    const rainfallFactor = rainfall / 50;
    const subsidyFactor = activePolicies.greenSubsidy ? 0.7 : 1.0;
    return base * organicFactor * rainfallFactor * subsidyFactor;
  };

  const calculateWQI = (industrial, agri) => {
    const totalPollution = industrial + agri;
    const dilution = riverFlow / 100;
    const cleanupBonus = activePolicies.cleanupDrive ? 10 : 0;
    let wqi = 100 - (totalPollution / (10 * dilution));
    wqi = Math.max(0, Math.min(100, wqi + cleanupBonus));
    return wqi;
  };

  const calculateDO = (wqi, temp) => {
    const tempFactor = (30 - temp) / 30;
    const pollutionFactor = wqi / 100;
    return 4 + (6 * tempFactor * pollutionFactor);
  };

  const calculatePH = (industrial) => {
    const acidFactor = industrial / 1000;
    return 7.0 + (Math.random() - 0.5) - (acidFactor * 0.5);
  };

  const calculateFishHealth = (do_level, temp, wqi) => {
    const doHealth = do_level > 6 ? 1.0 : do_level > 4 ? 0.7 : 0.3;
    const tempHealth = (temp >= 15 && temp <= 25) ? 1.0 : 0.7;
    const wqiHealth = wqi / 100;
    return doHealth * tempHealth * wqiHealth;
  };

  // ─── Main Simulation Step ───────────────────────────────────
  const simulateDay = () => {
    const currentSeason = getSeason(currentDay);
    const effects = getSeasonalEffects(currentSeason);

    setSeason(currentSeason);
    setTemperature(effects.temp + (Math.random() - 0.5) * 5);
    setRainfall(effects.rainfall + (Math.random() - 0.5) * 20);
    setRiverFlow(effects.flow + (Math.random() - 0.5) * 30);

    const indPoll = calculateIndustrialPollution();
    const agriPoll = calculateAgriRunoff();

    const newWQI = calculateWQI(indPoll, agriPoll);
    const newDO = calculateDO(newWQI, effects.temp);
    const newPH = calculatePH(indPoll);
    const newTurbidity = 10 + (agriPoll / 10) + (effects.rainfall / 5);

    setWqi(newWQI);
    setDissolvedOxygen(newDO);
    setPh(newPH);
    setTurbidity(newTurbidity);

    const fishHealth = calculateFishHealth(newDO, effects.temp, newWQI);
    const newFish = Math.max(0, fishPopulation * (0.998 + fishHealth * 0.004));
    setFishPopulation(Math.round(newFish));

    const dataPoint = {
      day: currentDay,
      wqi: Math.round(newWQI),
      do: Number(newDO.toFixed(1)),
      fish: Math.round(newFish),
      industrial: Math.round(indPoll),
      agricultural: Math.round(agriPoll),
      temperature: Math.round(effects.temp)
    };

    setHistory(prev => [...prev.slice(-180), dataPoint]);
  };

  // ─── Simple Prediction ──────────────────────────────────────
  const generatePredictions = () => {
    const pred = [];
    let w = wqi;
    let f = fishPopulation;

    for (let i = 0; i < 365; i += 30) {
      const trend = (wqi - 50) / 100;
      w = Math.max(0, Math.min(100, w + trend * 5));
      f = Math.max(0, f * (0.95 + (w / 200)));

      pred.push({
        month: Math.floor(i / 30) + 1,
        wqi: Math.round(w),
        fish: Math.round(f)
      });
    }
    setPredictions(pred);
  };

  // ─── Policy Toggle ──────────────────────────────────────────
  const togglePolicy = (policy) => {
    const costs = {
      effluentLaws: 200000,
      greenSubsidy: 150000,
      cleanupDrive: 50000,
      carbonTax: 100000
    };

    const approvalChanges = {
      effluentLaws: -10,
      greenSubsidy: 15,
      cleanupDrive: 20,
      carbonTax: -15
    };

    if (!activePolicies[policy] && budget >= costs[policy]) {
      setActivePolicies(prev => ({ ...prev, [policy]: true }));
      setBudget(prev => prev - costs[policy]);
      setPublicApproval(prev => Math.max(0, Math.min(100, prev + approvalChanges[policy])));
    } else if (activePolicies[policy]) {
      setActivePolicies(prev => ({ ...prev, [policy]: false }));
      setPublicApproval(prev => Math.max(0, Math.min(100, prev - approvalChanges[policy])));
    }
  };

  // ─── Simulation Loop ────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setCurrentDay(prev => prev + 1);
      simulateDay();
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, factories, farming, activePolicies]);

  useEffect(() => {
    generatePredictions();
  }, [currentDay, wqi, fishPopulation]);

  // ─── River Animation ────────────────────────────────────────
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

    const getColors = () => {
      if (wqi >= 80) return { water: '#4f9df7', foam: '#a5d8ff', haze: 0 };
      if (wqi >= 60) return { water: '#60a5fa', foam: '#93c5fd', haze: 0 };
      if (wqi >= 40) return { water: '#93c5fd', foam: '#fed7aa', haze: 0.06 };
      return { water: '#f87171', foam: '#fca5a5', haze: 0.18 };
    };

    const animateRiver = () => {
      t += 0.016;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const { water, foam, haze } = getColors();

      // Base water gradient
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, water);
      grad.addColorStop(0.45, '#60a5fa');
      grad.addColorStop(0.55, water);
      grad.addColorStop(1, '#3b82f6');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Flowing wave layers
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      for (let i = 0; i < 6; i++) {
        const phase = t + i * 2.8;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.32 + Math.sin(phase) * 18);
        ctx.quadraticCurveTo(w*0.25, h*0.36 + Math.cos(phase+1.8)*22, w*0.5, h*0.30 + Math.sin(phase+3.6)*16);
        ctx.quadraticCurveTo(w*0.75, h*0.34 + Math.cos(phase+5.4)*20, w, h*0.31 + Math.sin(phase+7.2)*17);
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fill();
      }

      // Floating particles / foam
      ctx.fillStyle = foam;
      for (let i = 0; i < 40; i++) {
        const x = ((t * 45 + i * 137) % (w + 120)) - 60;
        const y = 40 + Math.sin(t * 1.3 + i * 8) * 25 + (i % 4) * (h / 5);
        const size = 3.5 + Math.sin(t * 2.5 + i) * 3;

        ctx.globalAlpha = 0.35 + Math.sin(t * 4 + i) * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // tiny trail
        if (x > 30 && x < w - 30) {
          ctx.globalAlpha *= 0.35;
          ctx.fillRect(x - 14, y - 1.8, 28, 3.6);
        }
      }

      ctx.globalAlpha = 1;

      // Pollution haze overlay
      if (haze > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${haze})`;
        ctx.fillRect(0, 0, w, h);
      }

      frame = requestAnimationFrame(animateRiver);
    };

    animateRiver();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [wqi]);

  // ─── Reset Function ─────────────────────────────────────────
  const reset = () => {
    setIsRunning(false);
    setCurrentDay(0);
    setHistory([]);
    setWqi(65);
    setDissolvedOxygen(7.5);
    setPh(7.2);
    setTurbidity(30);
    setFishPopulation(1000);
    setBudget(1000000);
    setPublicApproval(60);
    setActivePolicies({
      effluentLaws: false,
      greenSubsidy: false,
      cleanupDrive: false,
      carbonTax: false
    });
  };

  const getHealthStatus = (value, thresholds) => {
    if (value >= thresholds.good) return { status: 'Thriving', color: 'text-green-600', bg: 'bg-green-100' };
    if (value >= thresholds.moderate) return { status: 'Stressed', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const wqiStatus = getHealthStatus(wqi, { good: 70, moderate: 40 });
  const fishStatus = getHealthStatus(fishPopulation, { good: 800, moderate: 400 });

  // ─── JSX ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6 pb-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            🌊 River Basin Pollution Simulator
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            See how policies and human activity change the health of a river
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                {isRunning ? <Pause size={20} /> : <Play size={20} />}
                {isRunning ? 'Pause' : 'Start Simulation'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition font-medium"
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-600">Day</div>
                <div className="text-2xl font-bold text-gray-800">{currentDay}</div>
                <div className="text-sm text-gray-600 capitalize">{season}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Speed: {speed}×</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={speed}
                  onChange={e => setSpeed(Number(e.target.value))}
                  className="w-40 accent-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className={`p-4 rounded-xl ${wqiStatus.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Droplets className={`w-5 h-5 ${wqiStatus.color}`} />
                <span className="text-sm text-gray-600">Water Quality</span>
              </div>
              <div className={`text-3xl font-bold ${wqiStatus.color}`}>{Math.round(wqi)}</div>
              <div className={`text-sm ${wqiStatus.color}`}>{wqiStatus.status}</div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">DO</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{dissolvedOxygen.toFixed(1)}</div>
              <div className="text-sm text-blue-600">mg/L</div>
            </div>

            <div className={`p-4 rounded-xl ${fishStatus.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Fish className={`w-5 h-5 ${fishStatus.color}`} />
                <span className="text-sm text-gray-600">Fish Population</span>
              </div>
              <div className={`text-3xl font-bold ${fishStatus.color}`}>{fishPopulation}</div>
              <div className={`text-sm ${fishStatus.color}`}>{fishStatus.status}</div>
            </div>

            <div className="p-4 rounded-xl bg-green-50">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Budget</span>
              </div>
              <div className="text-3xl font-bold text-green-600">${(budget/1000).toFixed(0)}K</div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Approval</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{publicApproval}%</div>
            </div>
          </div>
        </div>

        {/* RIVER VISUALIZATION */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4 font-semibold text-lg flex items-center gap-3">
            <Droplets className="w-6 h-6" />
            Live River Condition
          </div>
          <div className="h-64 md:h-80 lg:h-96">
            <canvas
              ref={riverCanvasRef}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            {/* Industrial */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Factory className="w-6 h-6 text-red-600" />
                Industrial Sources
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Factories: {factories.count}</label>
                  <input type="range" min="0" max="20" value={factories.count}
                    onChange={e => setFactories({...factories, count: +e.target.value})}
                    className="w-full accent-red-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Treatment: {factories.treatment}%</label>
                  <input type="range" min="0" max="100" value={factories.treatment}
                    onChange={e => setFactories({...factories, treatment: +e.target.value})}
                    className="w-full accent-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select
                    value={factories.type}
                    onChange={e => setFactories({...factories, type: e.target.value})}
                    className="w-full p-2.5 border rounded-lg"
                  >
                    <option value="chemical">Chemical</option>
                    <option value="textile">Textile</option>
                    <option value="food">Food Processing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Agriculture */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Sprout className="w-6 h-6 text-green-600" />
                Agricultural Sources
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Farm Area: {farming.area} km²</label>
                  <input type="range" min="0" max="200" value={farming.area}
                    onChange={e => setFarming({...farming, area: +e.target.value})}
                    className="w-full accent-green-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Fertilizer: {farming.fertilizerUse}%</label>
                  <input type="range" min="0" max="100" value={farming.fertilizerUse}
                    onChange={e => setFarming({...farming, fertilizerUse: +e.target.value})}
                    className="w-full accent-amber-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Organic: {farming.organic}%</label>
                  <input type="range" min="0" max="100" value={farming.organic}
                    onChange={e => setFarming({...farming, organic: +e.target.value})}
                    className="w-full accent-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-5">Historical Trends (last ~6 months)</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="wqi" stroke="#3b82f6" name="Water Quality" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="do" stroke="#10b981" name="DO (mg/L)" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-5">Pollution Sources Over Time</h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="industrial" stackId="1" stroke="#ef4444" fill="#ef4444" name="Industrial" />
                  <Area type="monotone" dataKey="agricultural" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Agricultural" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-5">12-Month Forecast</h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: "Months Ahead", position: "insideBottom", offset: -10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="wqi" stroke="#8b5cf6" name="Predicted WQI" strokeWidth={2.5} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="fish" stroke="#ec4899" name="Predicted Fish Pop." strokeWidth={2.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-xl shadow-xl p-6 mt-8">
          <h3 className="text-2xl font-bold mb-6 text-center md:text-left">Policy Interventions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { key: 'effluentLaws',   title: 'Strict Effluent Laws',   desc: '-40% industrial pollution', cost: '$200K', appr: '-10%', color: 'blue'   },
              { key: 'greenSubsidy',   title: 'Green Farming Subsidy',  desc: '-30% farm runoff',         cost: '$150K', appr: '+15%', color: 'green'  },
              { key: 'cleanupDrive',   title: 'River Cleanup Drive',    desc: '+10 WQI boost',            cost: '$50K',  appr: '+20%', color: 'yellow' },
              { key: 'carbonTax',      title: 'Carbon Tax',             desc: '-20% factory output',      cost: '$100K', appr: '-15%', color: 'purple' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => togglePolicy(p.key)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 text-left
                  ${activePolicies[p.key]
                    ? `border-${p.color}-600 bg-${p.color}-50 shadow-md`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  }`}
              >
                <div className="font-semibold text-lg mb-2">{p.title}</div>
                <div className="text-sm text-gray-600 mb-3">{p.desc}</div>
                <div className={`text-xs ${p.appr.includes('+') ? 'text-green-600' : 'text-red-600'}`}>
                  Cost: {p.cost} | Approval: {p.appr}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Critical Alert */}
        {(wqi < 40 || fishPopulation < 400) && (
          <div className="mt-8 bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-red-800 text-xl mb-2">CRITICAL ECOSYSTEM WARNING</div>
                <div className="text-red-700">
                  {wqi < 40 && "Water quality has fallen to dangerous levels. "}
                  {fishPopulation < 400 && "Fish population is collapsing rapidly. "}
                  Immediate strong action is required!
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RiverPollutionSimulator;