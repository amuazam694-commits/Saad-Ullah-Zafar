import React from 'react';
import { Sun, SunDim, SunMedium, AlertOctagon, Flame } from 'lucide-react';
import { PlantProfile } from '../types/sensors';

interface LDRSensorCardProps {
  lightLux: number;
  lightFootCandles: number;
  resistanceKohm: number;
  lightCategory: 'Deep Shade' | 'Low Light' | 'Medium Indirect' | 'Bright Indirect' | 'Direct Sun' | 'Scorching Excess';
  profile: PlantProfile;
  lightMinLimit: number;
  lightMaxLimit: number;
}

export const LDRSensorCard: React.FC<LDRSensorCardProps> = ({
  lightLux,
  lightFootCandles,
  resistanceKohm,
  lightCategory,
  profile,
  lightMinLimit,
  lightMaxLimit,
}) => {
  const isLightDim = lightLux < lightMinLimit;
  const isLightScorching = lightLux > lightMaxLimit;

  // Visual badge based on lighting band
  const getCategoryStyles = () => {
    switch (lightCategory) {
      case 'Deep Shade':
        return { color: 'text-zinc-400', icon: SunDim, barWidth: '15%', accent: 'bg-zinc-600' };
      case 'Low Light':
        return { color: 'text-amber-300', icon: SunDim, barWidth: '35%', accent: 'bg-amber-400' };
      case 'Medium Indirect':
        return { color: 'text-emerald-400', icon: SunMedium, barWidth: '60%', accent: 'bg-emerald-400' };
      case 'Bright Indirect':
        return { color: 'text-emerald-300', icon: Sun, barWidth: '80%', accent: 'bg-emerald-300' };
      case 'Direct Sun':
        return { color: 'text-amber-400', icon: Flame, barWidth: '92%', accent: 'bg-amber-500' };
      case 'Scorching Excess':
        return { color: 'text-rose-400', icon: AlertOctagon, barWidth: '100%', accent: 'bg-rose-500' };
    }
  };

  const catStyle = getCategoryStyles();
  const IconComponent = catStyle.icon;

  // Approximate Daily Light Integral (DLI) assuming 12-hour photoperiod
  const estimatedDli = ((lightLux * 0.0185 * 12 * 3600) / 1000000).toFixed(1);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0e111a] p-5 hover:border-zinc-700 transition-all">
      {/* Sensor Channel Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">LDR Light Sensor</h3>
            <p className="text-xs text-zinc-400">Cadmium-Sulfide Photoresistor (Channel 03)</p>
          </div>
        </div>

        {/* Dynamic Category Text Badge */}
        <div className={`flex items-center gap-1.5 text-xs font-medium ${catStyle.color}`}>
          <IconComponent className="w-3.5 h-3.5" />
          <span>{lightCategory}</span>
        </div>
      </div>

      {/* Main Metric Display */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-zinc-100 tabular-nums">
            {Math.round(lightLux).toLocaleString()}
          </span>
          <span className="text-xl font-mono text-amber-400">Lux</span>
          <span className="text-xs font-mono text-zinc-400 ml-auto tabular-nums">
            {Math.round(lightFootCandles)} FC
          </span>
        </div>

        {/* Light Intensity Meter */}
        <div className="mt-3">
          <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 ease-out ${catStyle.accent}`}
              style={{ width: `${Math.min(100, (lightLux / 35000) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mt-1.5">
            <span>0 Lux</span>
            <span>Target: {profile.optimalLuxMin.toLocaleString()} – {profile.optimalLuxMax.toLocaleString()} Lux</span>
            <span>35k+ Lux</span>
          </div>
        </div>
      </div>

      {/* Light Density Status Advisory */}
      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/80 mb-4 text-xs">
        <div className="flex items-center justify-between text-zinc-300 mb-1">
          <span className="font-medium text-zinc-200">Photoperiod & DLI Status</span>
          <span className="font-mono text-emerald-400 text-[11px]">~{estimatedDli} mol/m²/day</span>
        </div>
        <p className="text-zinc-400 text-[11px] leading-relaxed">
          {isLightScorching
            ? 'Scorching radiation detected! Foliage bleaching risk for indoor specimens.'
            : isLightDim
            ? 'Insufficient light. Photosynthetic rate suppressed; internodal elongation (stretching) likely.'
            : 'Foliar photon density is balanced for active photosynthesis without chlorophyll solarization.'}
        </p>
      </div>

      {/* Analog LDR Telemetry */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400 text-[11px]">
        <span>Photoresistance: <strong className="text-zinc-200">{resistanceKohm.toFixed(2)} kΩ</strong></span>
        <span>Photopic Curve: <strong className="text-zinc-200">λ 540nm peak</strong></span>
      </div>
    </div>
  );
};
