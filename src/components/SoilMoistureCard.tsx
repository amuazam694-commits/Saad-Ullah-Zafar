import React from 'react';
import { Droplet, AlertTriangle, CheckCircle2, Clock, Zap, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { PlantProfile } from '../types/sensors';

interface SoilMoistureCardProps {
  moisturePercent: number;
  voltage: number;
  rawAdc: number;
  isDry: boolean;
  isWaterlogged: boolean;
  dryThreshold: number;
  profile: PlantProfile;
  hoursUntilDry: number;
  onWaterPlant: () => void;
  onSimulateDry: () => void;
  isWatering: boolean;
}

export const SoilMoistureCard: React.FC<SoilMoistureCardProps> = ({
  moisturePercent,
  voltage,
  rawAdc,
  isDry,
  isWaterlogged,
  dryThreshold,
  profile,
  hoursUntilDry,
  onWaterPlant,
  onSimulateDry,
  isWatering,
}) => {
  // Determine moisture zone
  const getZoneInfo = () => {
    if (moisturePercent <= dryThreshold) {
      return {
        label: 'Critical Dry Soil',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10 border-rose-500/30',
        barColor: 'bg-rose-500',
      };
    }
    if (moisturePercent < profile.optimalSoilMoistureMin) {
      return {
        label: 'Sub-Optimal / Depleting',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-500',
      };
    }
    if (moisturePercent <= profile.optimalSoilMoistureMax) {
      return {
        label: 'Optimal Hydration Zone',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        barColor: 'bg-emerald-500',
      };
    }
    return {
      label: 'Saturated Root Bed',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      barColor: 'bg-cyan-500',
    };
  };

  const zone = getZoneInfo();

  return (
    <div className={`rounded-xl border p-5 transition-all relative overflow-hidden bg-[#0e111a] ${
      isDry ? 'border-rose-500/50 shadow-lg shadow-rose-950/20' : 'border-zinc-800/80 hover:border-zinc-700'
    }`}>
      {/* Sensor Channel Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Soil Moisture Sensor</h3>
              <p className="text-xs text-zinc-400">Capacitive VWC Probe (Channel 01)</p>
            </div>
          </div>
        </div>

        {/* Status Text Indicator */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isDry ? (
            <span className="flex items-center gap-1 text-rose-400 font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Dry Alert</span>
            </span>
          ) : isWaterlogged ? (
            <span className="flex items-center gap-1 text-cyan-400 font-mono">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Waterlogged</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Calibrated</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 tabular-nums">
            {moisturePercent.toFixed(1)}
          </span>
          <span className="text-xl font-mono text-zinc-400">%</span>
          <span className={`text-xs ml-auto font-mono ${zone.color}`}>
            {zone.label}
          </span>
        </div>

        {/* Moisture Level Visual Meter Bar */}
        <div className="mt-3">
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ease-out ${zone.barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, moisturePercent))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mt-1.5">
            <span>0% (Dry)</span>
            <span>Target: {profile.optimalSoilMoistureMin}% – {profile.optimalSoilMoistureMax}%</span>
            <span>100% (Sat)</span>
          </div>
        </div>
      </div>

      {/* DRY SOIL WARNING BANNER */}
      {isDry && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-semibold block text-rose-200">Dry Soil Warning: Hydration Required</strong>
            <span>Moisture dropped below the critical {dryThreshold}% safety threshold for {profile.commonName}. Roots at risk of desiccation stress.</span>
          </div>
        </div>
      )}

      {/* WATERING REMINDER & CADENCE */}
      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/80 mb-4 text-xs">
        <div className="flex items-center justify-between text-zinc-300 mb-1.5">
          <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Watering Reminder</span>
          </span>
          <span className="font-mono text-emerald-400">
            {isDry
              ? 'Action Required Now'
              : hoursUntilDry > 0
              ? `Due in ~${hoursUntilDry} hours`
              : 'Hydrated'}
          </span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          {profile.commonName} prefers watering every {profile.wateringCadenceDays} days. {profile.botanistTip}
        </p>
      </div>

      {/* Probe Telemetry & Controls */}
      <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 font-mono text-zinc-400 text-[11px]">
          <span>ADC: <strong className="text-zinc-200">{rawAdc}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Probe: <strong className="text-zinc-200">{voltage.toFixed(2)}V</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateDry}
            title="Simulate rapid transpiration to test dry soil alert"
            className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 rounded transition-colors flex items-center gap-1"
          >
            <ArrowDownRight className="w-3 h-3 text-amber-400" />
            <span>Test Dry</span>
          </button>

          <button
            onClick={onWaterPlant}
            disabled={isWatering}
            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded transition-all flex items-center gap-1"
          >
            <Droplet className="w-3 h-3" />
            <span>Water Plant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
