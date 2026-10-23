import React from 'react';
import { PlantProfile, IrrigationLog } from '../types/sensors';
import { BOTANICAL_PROFILES } from '../data/plantProfiles';
import probeImage from '../assets/images/iot_sensor_probe_1792776088456.jpg';
import { Cpu, Sprout, Droplets, Info, Layers, CheckCircle2 } from 'lucide-react';

interface SpeciesAndHardwareSectionProps {
  profile: PlantProfile;
  onSelectProfile: (profile: PlantProfile) => void;
  irrigationHistory: IrrigationLog[];
  onTriggerPump: () => void;
  isPumpActive: boolean;
}

export const SpeciesAndHardwareSection: React.FC<SpeciesAndHardwareSectionProps> = ({
  profile,
  onSelectProfile,
  irrigationHistory,
  onTriggerPump,
  isPumpActive,
}) => {
  return (
    <div className="space-y-6">
      {/* Botanical Species Catalog Grid */}
      <div className="rounded-xl border border-zinc-800/80 bg-[#0c0e16] p-5 sm:p-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Botanical Specimen Library</h3>
              <p className="text-xs text-zinc-400">Scientifically calibrated profiles with tailored soil moisture and light envelopes</p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {BOTANICAL_PROFILES.length} Verified Profiles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOTANICAL_PROFILES.map((p) => {
            const isSelected = p.id === profile.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">{p.commonName}</h4>
                    <p className="text-xs italic text-emerald-400 font-mono">{p.scientificName}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                <div className="mt-3 pt-3 border-t border-zinc-800/70 grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                  <div>
                    <span>Moisture: </span>
                    <strong className="text-zinc-200">{p.optimalSoilMoistureMin}-{p.optimalSoilMoistureMax}%</strong>
                  </div>
                  <div>
                    <span>Temp: </span>
                    <strong className="text-zinc-200">{p.optimalTempMinC}-{p.optimalTempMaxC}°C</strong>
                  </div>
                  <div>
                    <span>RH: </span>
                    <strong className="text-zinc-200">{p.optimalHumidityMin}-{p.optimalHumidityMax}%</strong>
                  </div>
                  <div>
                    <span>Cadence: </span>
                    <strong className="text-zinc-200">{p.wateringCadenceDays}d</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Architecture & Pinout Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sensor Node Photography & Specs */}
        <div className="lg:col-span-5 rounded-xl border border-zinc-800/80 bg-[#0c0e16] overflow-hidden flex flex-col">
          <div className="relative h-56 sm:h-64">
            <img
              src={probeImage}
              alt="IoT Plant Sensor Probe in dark soil"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] via-transparent to-black/20" />
            <div className="absolute bottom-3 left-3 text-xs font-mono bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800 text-zinc-300">
              PhytoSense Node Revision 2.4
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-zinc-100">Triple-Sensor Probe Node</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Compact weather-sealed enclosure integrating capacitive corrosion-free soil prongs, high-accuracy DHT11 thermo-hygrometer, and ambient light photoresistor with dual-core ESP32 MCU.
              </p>

              <div className="space-y-2 text-xs font-mono text-zinc-300">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">1. Soil Moisture Probe:</span>
                  <span className="text-emerald-400 font-semibold">GPIO 34 (ADC1_CH6)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">2. DHT11 Sensor:</span>
                  <span className="text-cyan-400 font-semibold">GPIO 4 (1-Wire Bidirectional)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500">3. LDR Light Sensor:</span>
                  <span className="text-amber-400 font-semibold">GPIO 35 (ADC1_CH7)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Submersible Pump Relay:</span>
                  <span className="text-purple-400 font-semibold">GPIO 16 (PWM Relay)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Micro-Pump Actuator:</span>
              <button
                onClick={onTriggerPump}
                disabled={isPumpActive}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isPumpActive
                    ? 'bg-purple-600/40 text-purple-200 cursor-wait'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{isPumpActive ? 'Pumping 50ml...' : 'Trigger Automated Pump'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Irrigation History Log */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-800/80 bg-[#0c0e16] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-zinc-100">Irrigation & Hydration Event Log</h4>
              </div>
              <span className="text-xs font-mono text-zinc-500">{irrigationHistory.length} events logged</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {irrigationHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No hydration events logged yet. Click "Hydrate (+50ml)" to record.
                </div>
              ) : (
                irrigationHistory.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-zinc-200 font-mono">{log.amountMl} ml</strong>
                        <span className="text-zinc-500 font-mono">via {log.method}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{log.notes}</p>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-zinc-400 text-[11px]">{log.timestamp}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">
                        {log.soilBefore.toFixed(0)}% → {log.soilAfter.toFixed(0)}% Moisture
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Capacitive sensors measure soil dielectric permittivity without electrolysis corrosion, maintaining stable calibration over multi-year deployments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
