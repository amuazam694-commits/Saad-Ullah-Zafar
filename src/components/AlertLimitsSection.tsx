import React from 'react';
import { AlertThresholds, PlantProfile, SensorReading } from '../types/sensors';
import { Bell, Volume2, VolumeX, RotateCcw, AlertTriangle, ShieldCheck, Sliders } from 'lucide-react';

interface AlertLimitsSectionProps {
  thresholds: AlertThresholds;
  onUpdateThresholds: (thresholds: AlertThresholds) => void;
  profile: PlantProfile;
  latestReading: SensorReading;
  onTestSoundAlert: () => void;
}

export const AlertLimitsSection: React.FC<AlertLimitsSectionProps> = ({
  thresholds,
  onUpdateThresholds,
  profile,
  latestReading,
  onTestSoundAlert,
}) => {
  const handleResetToProfile = () => {
    onUpdateThresholds({
      ...thresholds,
      soilDryAlertPercent: profile.optimalSoilMoistureMin - 5,
      soilWaterloggedPercent: profile.optimalSoilMoistureMax + 10,
      tempMinC: profile.optimalTempMinC - 3,
      tempMaxC: profile.optimalTempMaxC + 3,
      humidityMinPercent: profile.optimalHumidityMin - 10,
      humidityMaxPercent: profile.optimalHumidityMax + 10,
      lightMinLux: profile.optimalLuxMin - 500,
      lightMaxLux: profile.optimalLuxMax + 4000,
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0c0e16] p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Custom Alert Limits & Sensor Thresholds
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure safety trigger boundaries for dry soil warnings, thermal distress, and foliar alerts
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateThresholds({
                ...thresholds,
                soundAlertEnabled: !thresholds.soundAlertEnabled,
              })
            }
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              thresholds.soundAlertEnabled
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {thresholds.soundAlertEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{thresholds.soundAlertEnabled ? 'Audio Alert Active' : 'Muted'}</span>
          </button>

          <button
            onClick={onTestSoundAlert}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
          >
            Test Beep
          </button>

          <button
            onClick={handleResetToProfile}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset to {profile.commonName}</span>
          </button>
        </div>
      </div>

      {/* Grid of Threshold Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        
        {/* Soil Moisture Thresholds */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">Soil Moisture Thresholds</h4>
              <p className="text-xs text-zinc-400">Current Reading: <strong className="text-emerald-400 font-mono">{latestReading.soilMoisturePercent.toFixed(1)}%</strong></p>
            </div>
            {latestReading.soilMoisturePercent <= thresholds.soilDryAlertPercent ? (
              <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Dry Triggered
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Safe
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Dry Soil Warning Trigger (Min Moisture):</span>
                <span className="font-mono font-bold text-rose-400">{thresholds.soilDryAlertPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={thresholds.soilDryAlertPercent}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    soilDryAlertPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[11px] text-zinc-400">Triggers dry soil warning and watering countdown alarm when reached.</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Waterlogged Root Alert (Max Moisture):</span>
                <span className="font-mono font-bold text-cyan-400">{thresholds.soilWaterloggedPercent}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="1"
                value={thresholds.soilWaterloggedPercent}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    soilWaterloggedPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* DHT11 Temperature Thresholds */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">DHT11 Temperature Limits</h4>
              <p className="text-xs text-zinc-400">Current Reading: <strong className="text-cyan-400 font-mono">{latestReading.temperatureC.toFixed(1)}°C</strong></p>
            </div>
            {latestReading.temperatureC < thresholds.tempMinC || latestReading.temperatureC > thresholds.tempMaxC ? (
              <span className="text-xs font-mono text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Thermal Alert
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Safe
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Low Temp Alarm (Chill Threshold):</span>
                <span className="font-mono font-bold text-sky-400">{thresholds.tempMinC}°C</span>
              </div>
              <input
                type="range"
                min="5"
                max="22"
                step="0.5"
                value={thresholds.tempMinC}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    tempMinC: Number(e.target.value),
                  })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">High Heat Alarm (Thermal Stress):</span>
                <span className="font-mono font-bold text-rose-400">{thresholds.tempMaxC}°C</span>
              </div>
              <input
                type="range"
                min="24"
                max="42"
                step="0.5"
                value={thresholds.tempMaxC}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    tempMaxC: Number(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* DHT11 Humidity Thresholds */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">DHT11 Relative Humidity Limits</h4>
              <p className="text-xs text-zinc-400">Current Reading: <strong className="text-sky-400 font-mono">{latestReading.humidityPercent.toFixed(1)}% RH</strong></p>
            </div>
            {latestReading.humidityPercent < thresholds.humidityMinPercent || latestReading.humidityPercent > thresholds.humidityMaxPercent ? (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> RH Alert
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Safe
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Dry Air Warning (Min RH):</span>
                <span className="font-mono font-bold text-amber-400">{thresholds.humidityMinPercent}% RH</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={thresholds.humidityMinPercent}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    humidityMinPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Fungal Spore Danger (Max RH):</span>
                <span className="font-mono font-bold text-cyan-400">{thresholds.humidityMaxPercent}% RH</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                step="1"
                value={thresholds.humidityMaxPercent}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    humidityMaxPercent: Number(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* LDR Light Thresholds */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-200">LDR Light Density Limits</h4>
              <p className="text-xs text-zinc-400">Current Reading: <strong className="text-amber-400 font-mono">{Math.round(latestReading.lightLux).toLocaleString()} Lux</strong></p>
            </div>
            {latestReading.lightLux < thresholds.lightMinLux || latestReading.lightLux > thresholds.lightMaxLux ? (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Light Alert
              </span>
            ) : (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Safe
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Etiolation Warning (Min Lux):</span>
                <span className="font-mono font-bold text-amber-300">{thresholds.lightMinLux.toLocaleString()} Lux</span>
              </div>
              <input
                type="range"
                min="200"
                max="4000"
                step="100"
                value={thresholds.lightMinLux}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    lightMinLux: Number(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-zinc-300">Scorching Sunlight Warning (Max Lux):</span>
                <span className="font-mono font-bold text-rose-400">{thresholds.lightMaxLux.toLocaleString()} Lux</span>
              </div>
              <input
                type="range"
                min="8000"
                max="40000"
                step="500"
                value={thresholds.lightMaxLux}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    lightMaxLux: Number(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Info notice */}
      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
        <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          Thresholds are evaluated instantaneously on every 1-second packet from the Soil Moisture, DHT11, and LDR sensors. Breaches trigger persistent dashboard notices and optional acoustic beeps.
        </span>
      </div>
    </div>
  );
};
