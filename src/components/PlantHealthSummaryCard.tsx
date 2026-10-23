import React from 'react';
import { Sprout, AlertTriangle, ShieldCheck, HeartPulse, ChevronDown } from 'lucide-react';
import { PlantProfile } from '../types/sensors';
import { BOTANICAL_PROFILES } from '../data/plantProfiles';

interface PlantHealthSummaryCardProps {
  profile: PlantProfile;
  onSelectProfile: (profile: PlantProfile) => void;
  healthScore: number;
  healthState: 'Thriving' | 'Good' | 'Moderate Stress' | 'Critical Attention';
  activeAlerts: string[];
  soilMoisture: number;
  tempC: number;
  humidityPercent: number;
  lightLux: number;
  onApplyPresetScenario: (scenario: 'dry_soil' | 'watered' | 'scorching_sun' | 'cool_night') => void;
}

export const PlantHealthSummaryCard: React.FC<PlantHealthSummaryCardProps> = ({
  profile,
  onSelectProfile,
  healthScore,
  healthState,
  activeAlerts,
  soilMoisture,
  tempC,
  humidityPercent,
  lightLux,
  onApplyPresetScenario,
}) => {
  const getHealthColor = () => {
    if (healthScore >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (healthScore >= 70) return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
    if (healthScore >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0c0e16] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Specimen Portrait & Selector (5 cols) */}
        <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full flex flex-col justify-between p-5 overflow-hidden">
          {/* Background image with measured scrim */}
          <img
            src={profile.image}
            alt={profile.commonName}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] via-[#0c0e16]/60 to-[#0c0e16]/30" />

          {/* Plant Specimen Dropdown Selector */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="relative inline-block">
              <select
                value={profile.id}
                aria-label="Select active plant specimen profile"
                onChange={(e) => {
                  const selected = BOTANICAL_PROFILES.find((p) => p.id === e.target.value);
                  if (selected) onSelectProfile(selected);
                }}
                className="appearance-none bg-zinc-950/80 backdrop-blur border border-zinc-700/80 text-zinc-100 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg cursor-pointer hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {BOTANICAL_PROFILES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-200">
                    {p.commonName} ({p.scientificName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
              Active Specimen
            </span>
          </div>

          {/* Botanical Nomenclature */}
          <div className="relative z-10 mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {profile.commonName}
            </h2>
            <p className="text-xs italic text-emerald-400 font-mono mt-0.5">
              {profile.scientificName}
            </p>
            <p className="text-xs text-zinc-300 line-clamp-2 mt-2 leading-relaxed">
              {profile.description}
            </p>
          </div>
        </div>

        {/* Right: Health Index Gauge & Environmental Diagnosis (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Top row: Health state */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800/70">
              <div>
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Botanical Health Index</span>
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-zinc-100 tabular-nums">
                    {healthScore}
                  </span>
                  <span className="text-sm font-mono text-zinc-400">/ 100</span>
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ml-2 ${getHealthColor()}`}>
                    {healthState}
                  </span>
                </div>
              </div>

              {/* Mini circular progress representation */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }
                    strokeDasharray={`${healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Sprout className="w-5 h-5 absolute text-emerald-400" />
              </div>
            </div>

            {/* Quick 3-Sensor Status Ribbon */}
            <div className="grid grid-cols-3 gap-2.5 my-4">
              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-center">
                <span className="text-[11px] text-zinc-400 block">Soil Moisture</span>
                <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                  {soilMoisture.toFixed(1)}%
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {soilMoisture < profile.optimalSoilMoistureMin ? 'Needs Water' : 'Adequate'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-center">
                <span className="text-[11px] text-zinc-400 block">DHT11 Ambient</span>
                <span className="text-sm font-mono font-bold text-cyan-400 tabular-nums">
                  {tempC.toFixed(1)}°C · {humidityPercent.toFixed(0)}%
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {tempC > profile.optimalTempMaxC ? 'Thermal High' : 'Comfort Zone'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-center">
                <span className="text-[11px] text-zinc-400 block">LDR Light</span>
                <span className="text-sm font-mono font-bold text-amber-400 tabular-nums truncate">
                  {Math.round(lightLux).toLocaleString()} lx
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {lightLux > profile.optimalLuxMax ? 'Intense' : lightLux < profile.optimalLuxMin ? 'Dim' : 'Optimal'}
                </span>
              </div>
            </div>

            {/* Active alerts display */}
            {activeAlerts.length > 0 ? (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Active Sensor Threshold Violations ({activeAlerts.length}):</span>
                </div>
                {activeAlerts.map((alert, idx) => (
                  <p key={idx} className="text-[11px] pl-5 list-disc text-rose-300">
                    • {alert}
                  </p>
                ))}
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All 3 IoT sensors reporting parameters within calibrated botanical tolerance limits.</span>
              </div>
            )}
          </div>

          {/* Quick Simulation Scenario Bar */}
          <div className="mt-4 pt-3 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">Simulate Hardware Scenarios:</span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => onApplyPresetScenario('dry_soil')}
                className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors text-[11px] font-mono"
              >
                Dry Soil Stress
              </button>
              <button
                onClick={() => onApplyPresetScenario('watered')}
                className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 transition-colors text-[11px] font-mono"
              >
                Fresh Hydration
              </button>
              <button
                onClick={() => onApplyPresetScenario('scorching_sun')}
                className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 transition-colors text-[11px] font-mono"
              >
                Solar Peak (32k lx)
              </button>
              <button
                onClick={() => onApplyPresetScenario('cool_night')}
                className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700 transition-colors text-[11px] font-mono"
              >
                Night Transpiration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
