import React, { useState } from 'react';
import { Thermometer, Wind, Gauge, Sparkles, AlertCircle } from 'lucide-react';
import { PlantProfile } from '../types/sensors';

interface DHT11CardProps {
  tempC: number;
  tempF: number;
  humidityPercent: number;
  vpdKpa: number;
  dewPointC: number;
  profile: PlantProfile;
  tempMinLimit: number;
  tempMaxLimit: number;
  humidityMinLimit: number;
  humidityMaxLimit: number;
}

export const DHT11Card: React.FC<DHT11CardProps> = ({
  tempC,
  tempF,
  humidityPercent,
  vpdKpa,
  dewPointC,
  profile,
  tempMinLimit,
  tempMaxLimit,
  humidityMinLimit,
  humidityMaxLimit,
}) => {
  const [useFahrenheit, setUseFahrenheit] = useState(false);

  // Evaluate thermal & humidity stress
  const isTempCold = tempC < tempMinLimit;
  const isTempHot = tempC > tempMaxLimit;
  const isHumidityLow = humidityPercent < humidityMinLimit;
  const isHumidityHigh = humidityPercent > humidityMaxLimit;

  // VPD classification
  const getVpdStatus = (vpd: number) => {
    if (vpd < 0.4) return { label: 'Under-transpiring (Fungal Risk)', color: 'text-cyan-400' };
    if (vpd <= 1.2) return { label: 'Optimal Foliar Transpiration', color: 'text-emerald-400' };
    if (vpd <= 1.6) return { label: 'Active Transpiration', color: 'text-amber-400' };
    return { label: 'High Evaporative Stress (Stomata Closing)', color: 'text-rose-400' };
  };

  const vpdInfo = getVpdStatus(vpdKpa);

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0e111a] p-5 hover:border-zinc-700 transition-all">
      {/* Sensor Channel Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">DHT11 Environmental Sensor</h3>
            <p className="text-xs text-zinc-400">Combined Ambient Temp & RH (Channel 02)</p>
          </div>
        </div>

        {/* Temperature Unit Segmented Toggle */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={() => setUseFahrenheit(false)}
            className={`px-2 py-0.5 rounded transition-colors ${
              !useFahrenheit ? 'bg-zinc-800 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            °C
          </button>
          <button
            onClick={() => setUseFahrenheit(true)}
            className={`px-2 py-0.5 rounded transition-colors ${
              useFahrenheit ? 'bg-zinc-800 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            °F
          </button>
        </div>
      </div>

      {/* Dual Metric Split: Temperature & Relative Humidity */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Temperature Column */}
        <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/70">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Temperature</span>
            <span className="font-mono text-[11px]">
              {useFahrenheit ? `${profile.optimalTempMinC * 1.8 + 32}° – ${profile.optimalTempMaxC * 1.8 + 32}°F` : `${profile.optimalTempMinC}° – ${profile.optimalTempMaxC}°C`}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-zinc-100 tabular-nums">
              {useFahrenheit ? tempF.toFixed(1) : tempC.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-cyan-400">
              {useFahrenheit ? '°F' : '°C'}
            </span>
          </div>

          <div className="mt-2 text-[11px] font-mono">
            {isTempCold ? (
              <span className="text-sky-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Below safety limit
              </span>
            ) : isTempHot ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Heat stress danger
              </span>
            ) : (
              <span className="text-emerald-400">Within thermal envelope</span>
            )}
          </div>
        </div>

        {/* Relative Humidity Column */}
        <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/70">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" />
              <span>Humidity</span>
            </span>
            <span className="font-mono text-[11px]">
              {profile.optimalHumidityMin}% – {profile.optimalHumidityMax}%
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-zinc-100 tabular-nums">
              {humidityPercent.toFixed(1)}
            </span>
            <span className="text-sm font-mono text-sky-400">% RH</span>
          </div>

          <div className="mt-2 text-[11px] font-mono">
            {isHumidityLow ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Dry air (Crisping leaves)
              </span>
            ) : isHumidityHigh ? (
              <span className="text-cyan-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> High spore humidity
              </span>
            ) : (
              <span className="text-emerald-400">Optimal foliar air</span>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Botanist Microclimate Analytics: VPD & Dew Point */}
      <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-zinc-400" />
            <span>Vapor Pressure Deficit</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-mono font-semibold text-zinc-200 tabular-nums">{vpdKpa}</span>
            <span className="text-[10px] font-mono text-zinc-400">kPa</span>
          </div>
          <p className={`text-[10px] mt-0.5 truncate ${vpdInfo.color}`}>
            {vpdInfo.label}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1 text-zinc-400 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Calculated Dew Point</span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-mono font-semibold text-zinc-200 tabular-nums">
              {useFahrenheit ? (dewPointC * 1.8 + 32).toFixed(1) : dewPointC.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {useFahrenheit ? '°F' : '°C'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Condensation threshold
          </p>
        </div>
      </div>
    </div>
  );
};
