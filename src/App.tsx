import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SoilMoistureCard } from './components/SoilMoistureCard';
import { DHT11Card } from './components/DHT11Card';
import { LDRSensorCard } from './components/LDRSensorCard';
import { PlantHealthSummaryCard } from './components/PlantHealthSummaryCard';
import { HistoricalGraphs } from './components/HistoricalGraphs';
import { AlertLimitsSection } from './components/AlertLimitsSection';
import { DataLoggerTable } from './components/DataLoggerTable';
import { SpeciesAndHardwareSection } from './components/SpeciesAndHardwareSection';

import { SensorReading, PlantProfile, AlertThresholds, IrrigationLog } from './types/sensors';
import { BOTANICAL_PROFILES } from './data/plantProfiles';
import {
  calculateVPD,
  calculateDewPoint,
  classifyLightLux,
  evaluatePlantHealth,
  playAlertBuzzer,
} from './utils/botanicalMath';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'alerts' | 'logger' | 'specimen'>('overview');
  const [activeProfile, setActiveProfile] = useState<PlantProfile>(BOTANICAL_PROFILES[0]);

  // Alert limits state
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    soilDryAlertPercent: 35,
    soilWaterloggedPercent: 82,
    tempMinC: 16,
    tempMaxC: 30,
    humidityMinPercent: 50,
    humidityMaxPercent: 88,
    lightMinLux: 1800,
    lightMaxLux: 14000,
    soundAlertEnabled: true,
  });

  // Current physical sensor state
  const [soilMoisture, setSoilMoisture] = useState<number>(56.4);
  const [tempC, setTempC] = useState<number>(23.2);
  const [humidity, setHumidity] = useState<number>(67.0);
  const [lightLux, setLightLux] = useState<number>(4650);

  // Irrigation and pump states
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [isPumpActive, setIsPumpActive] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Irrigation history log
  const [irrigationHistory, setIrrigationHistory] = useState<IrrigationLog[]>([
    {
      id: 'irr-1',
      timestamp: 'Yesterday at 09:30 AM',
      amountMl: 150,
      method: 'Manual Water',
      soilBefore: 31,
      soilAfter: 68,
      notes: 'Deep saturation with filtered rainwater.',
    },
    {
      id: 'irr-2',
      timestamp: '5 days ago',
      amountMl: 120,
      method: 'Automated Pump',
      soilBefore: 33,
      soilAfter: 62,
      notes: 'Autonomous micro-drip trigger based on dry limit threshold.',
    },
  ]);

  // Helper to build a comprehensive SensorReading object
  const createReading = useCallback(
    (
      sm: number,
      tc: number,
      rh: number,
      lux: number,
      timeStr?: string,
      timeMs?: number
    ): SensorReading => {
      const now = new Date();
      const timestamp = timeStr || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const timestampMs = timeMs || now.getTime();

      const tempF = parseFloat((tc * 1.8 + 32).toFixed(1));
      const vpdKpa = calculateVPD(tc, rh);
      const dewPointC = calculateDewPoint(tc, rh);
      const lightCategory = classifyLightLux(lux);
      const lightFootCandles = Math.round(lux / 10.764);

      // Capacitive probe analog voltage approximation: 3.0V (bone dry) to 1.1V (fully saturated)
      const soilVoltage = parseFloat((3.0 - (sm / 100) * 1.9).toFixed(2));
      const soilRawAdc = Math.round((soilVoltage / 3.3) * 4095);

      // LDR photoresistance approximation (higher lux = lower resistance)
      const ldrResistanceKohm = parseFloat((50000 / (lux + 50) / 10).toFixed(2));

      const isSoilDry = sm <= thresholds.soilDryAlertPercent;
      const isSoilWaterlogged = sm >= thresholds.soilWaterloggedPercent;

      const health = evaluatePlantHealth(sm, tc, rh, lux, activeProfile, thresholds);

      return {
        timestamp,
        timestampMs,
        soilMoisturePercent: parseFloat(sm.toFixed(1)),
        soilRawAdc,
        soilVoltage,
        isSoilDry,
        isSoilWaterlogged,
        temperatureC: parseFloat(tc.toFixed(1)),
        temperatureF: tempF,
        humidityPercent: parseFloat(rh.toFixed(1)),
        vpdKpa,
        dewPointC,
        lightLux: Math.round(lux),
        lightFootCandles,
        ldrResistanceKohm,
        lightCategory,
        healthScore: health.score,
        healthState: health.state,
        activeAlerts: health.alerts,
      };
    },
    [thresholds, activeProfile]
  );

  // History buffer
  const [history, setHistory] = useState<SensorReading[]>(() => {
    // Generate 48 initial historical data points for realistic charts
    const initial: SensorReading[] = [];
    const baseTime = Date.now() - 48 * 30 * 60 * 1000; // 24 hours back (30 min steps)
    let curSm = 66.0;

    for (let i = 0; i < 48; i++) {
      const t = new Date(baseTime + i * 30 * 60 * 1000);
      const hoursAgo = (48 - i) * 0.5;
      
      // Simulate slow natural soil evaporation
      curSm = Math.max(32, curSm - 0.28 + (Math.random() * 0.1 - 0.05));

      // Simulate diurnal temperature and light sine curves
      const hourOfDay = t.getHours();
      const solarFactor = Math.max(0, Math.sin(((hourOfDay - 6) / 14) * Math.PI));
      const histLux = Math.round(150 + solarFactor * 7500 + (Math.random() * 400 - 200));
      const histTemp = 20.0 + solarFactor * 4.5 + (Math.random() * 0.4 - 0.2);
      const histRh = 74.0 - solarFactor * 12.0 + (Math.random() * 2 - 1);

      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      initial.push({
        timestamp: timeStr,
        timestampMs: t.getTime(),
        soilMoisturePercent: parseFloat(curSm.toFixed(1)),
        soilRawAdc: Math.round(2200 + (100 - curSm) * 15),
        soilVoltage: parseFloat((1.4 + (100 - curSm) * 0.015).toFixed(2)),
        isSoilDry: curSm <= 35,
        isSoilWaterlogged: curSm >= 82,
        temperatureC: parseFloat(histTemp.toFixed(1)),
        temperatureF: parseFloat((histTemp * 1.8 + 32).toFixed(1)),
        humidityPercent: parseFloat(histRh.toFixed(1)),
        vpdKpa: calculateVPD(histTemp, histRh),
        dewPointC: calculateDewPoint(histTemp, histRh),
        lightLux: histLux,
        lightFootCandles: Math.round(histLux / 10.764),
        ldrResistanceKohm: parseFloat((4000 / (histLux + 50)).toFixed(2)),
        lightCategory: classifyLightLux(histLux),
        healthScore: curSm < 35 ? 65 : 94,
        healthState: curSm < 35 ? 'Moderate Stress' : 'Thriving',
        activeAlerts: curSm <= 35 ? ['Dry Soil Warning'] : [],
      });
    }
    return initial;
  });

  // Current latest reading object
  const latestReading = createReading(soilMoisture, tempC, humidity, lightLux);

  // Track previous dry state to sound buzzer once upon transition
  const prevDryRef = useRef<boolean>(latestReading.isSoilDry);

  useEffect(() => {
    if (latestReading.isSoilDry && !prevDryRef.current && thresholds.soundAlertEnabled) {
      playAlertBuzzer('warning');
    }
    prevDryRef.current = latestReading.isSoilDry;
  }, [latestReading.isSoilDry, thresholds.soundAlertEnabled]);

  // Real-time Sensor Polling Simulation (every 2.5 seconds)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Natural minor micro-fluctuations simulating genuine ADC/I2C sensor read jitter
      setSoilMoisture((prev) => {
        // Slow natural transpiration evaporation
        const drop = 0.04;
        const jitter = (Math.random() - 0.5) * 0.08;
        return Math.max(12, Math.min(98, prev - drop + jitter));
      });

      setTempC((prev) => {
        const jitter = (Math.random() - 0.5) * 0.15;
        return parseFloat((prev + jitter).toFixed(1));
      });

      setHumidity((prev) => {
        const jitter = (Math.random() - 0.5) * 0.3;
        return parseFloat(Math.max(20, Math.min(95, prev + jitter)).toFixed(1));
      });

      setLightLux((prev) => {
        const jitter = (Math.random() - 0.5) * 80;
        return Math.max(50, Math.min(45000, Math.round(prev + jitter)));
      });

      // Append to rolling history
      setHistory((prevHistory) => {
        const newReading = createReading(soilMoisture, tempC, humidity, lightLux);
        const next = [...prevHistory, newReading];
        return next.slice(-150); // retain last 150 readings
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, soilMoisture, tempC, humidity, lightLux, createReading]);

  // Handler: Water the Plant (+50ml hydration)
  const handleWaterPlant = () => {
    if (isWatering) return;
    setIsWatering(true);

    const prevMoisture = soilMoisture;
    const addedMoisture = 26.5;
    const newMoisture = Math.min(84, soilMoisture + addedMoisture);

    // Audio chime
    if (thresholds.soundAlertEnabled) {
      playAlertBuzzer('watered');
    }

    setTimeout(() => {
      setSoilMoisture(newMoisture);
      setIsWatering(false);

      // Record in irrigation log
      const now = new Date();
      const newLog: IrrigationLog = {
        id: `irr-${Date.now()}`,
        timestamp: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        amountMl: 50,
        method: 'Manual Water',
        soilBefore: prevMoisture,
        soilAfter: newMoisture,
        notes: `Replenished root zone for ${activeProfile.commonName}. Moisture elevated to ${newMoisture.toFixed(1)}%.`,
      };
      setIrrigationHistory((prev) => [newLog, ...prev]);

      // Add to sensor history
      const wateredReading = createReading(newMoisture, tempC, humidity, lightLux);
      setHistory((prev) => [...prev, wateredReading]);
    }, 900);
  };

  // Handler: Trigger Automated Micro-Pump Relay
  const handleTriggerPump = () => {
    if (isPumpActive) return;
    setIsPumpActive(true);

    if (thresholds.soundAlertEnabled) {
      playAlertBuzzer('watered');
    }

    setTimeout(() => {
      const prevMoisture = soilMoisture;
      const newMoisture = Math.min(86, soilMoisture + 30);
      setSoilMoisture(newMoisture);
      setIsPumpActive(false);

      const now = new Date();
      const newLog: IrrigationLog = {
        id: `irr-${Date.now()}`,
        timestamp: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        amountMl: 50,
        method: 'Automated Pump',
        soilBefore: prevMoisture,
        soilAfter: newMoisture,
        notes: `Micro-pump relay activated via GPIO16 actuator.`,
      };
      setIrrigationHistory((prev) => [newLog, ...prev]);
    }, 1800);
  };

  // Handler: Simulate Rapid Soil Drying
  const handleSimulateDry = () => {
    const dryVal = thresholds.soilDryAlertPercent - 6;
    setSoilMoisture(dryVal);
    if (thresholds.soundAlertEnabled) {
      playAlertBuzzer('warning');
    }
  };

  // Handler: Quick Hardware Environment Scenarios
  const handleApplyPresetScenario = (scenario: 'dry_soil' | 'watered' | 'scorching_sun' | 'cool_night') => {
    switch (scenario) {
      case 'dry_soil':
        setSoilMoisture(thresholds.soilDryAlertPercent - 8);
        break;
      case 'watered':
        setSoilMoisture(76.5);
        break;
      case 'scorching_sun':
        setLightLux(33500);
        setTempC(32.8);
        setHumidity(42.0);
        break;
      case 'cool_night':
        setLightLux(180);
        setTempC(17.2);
        setHumidity(76.5);
        break;
    }
  };

  // Calculate estimated hours until soil reaches dry threshold
  const hoursUntilDry = Math.max(
    0,
    Math.round(((soilMoisture - thresholds.soilDryAlertPercent) / 1.8) * 4)
  );

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onWaterPlant={handleWaterPlant}
        isWatering={isWatering}
        activeAlertCount={latestReading.activeAlerts.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: LIVE DASHBOARD / MONITOR */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Focal Anchor: Plant Health & Active Specimen Hero Card */}
            <PlantHealthSummaryCard
              profile={activeProfile}
              onSelectProfile={(p) => {
                setActiveProfile(p);
                // Synchronize alert limits with newly selected botanical species
                setThresholds((prev) => ({
                  ...prev,
                  soilDryAlertPercent: Math.max(10, p.optimalSoilMoistureMin - 5),
                  soilWaterloggedPercent: Math.min(95, p.optimalSoilMoistureMax + 10),
                  tempMinC: p.optimalTempMinC - 3,
                  tempMaxC: p.optimalTempMaxC + 3,
                  humidityMinPercent: Math.max(20, p.optimalHumidityMin - 10),
                  humidityMaxPercent: Math.min(95, p.optimalHumidityMax + 10),
                  lightMinLux: Math.max(300, p.optimalLuxMin - 600),
                  lightMaxLux: p.optimalLuxMax + 4000,
                }));
              }}
              healthScore={latestReading.healthScore}
              healthState={latestReading.healthState}
              activeAlerts={latestReading.activeAlerts}
              soilMoisture={soilMoisture}
              tempC={tempC}
              humidityPercent={humidity}
              lightLux={lightLux}
              onApplyPresetScenario={handleApplyPresetScenario}
            />

            {/* Responsive 3-Sensor Hardware Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sensor 1: Capacitive Soil Moisture Sensor */}
              <SoilMoistureCard
                moisturePercent={soilMoisture}
                voltage={latestReading.soilVoltage}
                rawAdc={latestReading.soilRawAdc}
                isDry={latestReading.isSoilDry}
                isWaterlogged={latestReading.isSoilWaterlogged}
                dryThreshold={thresholds.soilDryAlertPercent}
                profile={activeProfile}
                hoursUntilDry={hoursUntilDry}
                onWaterPlant={handleWaterPlant}
                onSimulateDry={handleSimulateDry}
                isWatering={isWatering}
              />

              {/* Sensor 2: DHT11 Ambient Temperature & Humidity Sensor */}
              <DHT11Card
                tempC={tempC}
                tempF={latestReading.temperatureF}
                humidityPercent={humidity}
                vpdKpa={latestReading.vpdKpa}
                dewPointC={latestReading.dewPointC}
                profile={activeProfile}
                tempMinLimit={thresholds.tempMinC}
                tempMaxLimit={thresholds.tempMaxC}
                humidityMinLimit={thresholds.humidityMinPercent}
                humidityMaxLimit={thresholds.humidityMaxPercent}
              />

              {/* Sensor 3: LDR Light Photoresistor Sensor */}
              <LDRSensorCard
                lightLux={lightLux}
                lightFootCandles={latestReading.lightFootCandles}
                resistanceKohm={latestReading.ldrResistanceKohm}
                lightCategory={latestReading.lightCategory}
                profile={activeProfile}
                lightMinLimit={thresholds.lightMinLux}
                lightMaxLimit={thresholds.lightMaxLux}
              />
            </div>

            {/* Embedded Telemetry Graphs in Overview */}
            <HistoricalGraphs
              history={history}
              soilDryLimit={thresholds.soilDryAlertPercent}
            />
          </div>
        )}

        {/* VIEW 2: HISTORICAL ANALYTICS & TELEMETRY GRAPHS */}
        {activeTab === 'graphs' && (
          <div className="space-y-6">
            <HistoricalGraphs
              history={history}
              soilDryLimit={thresholds.soilDryAlertPercent}
            />
            {/* Companion Live Logger Table below graphs */}
            <DataLoggerTable
              logs={history}
              onClearLogs={() => setHistory([])}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
            />
          </div>
        )}

        {/* VIEW 3: CUSTOM ALERT LIMITS CONFIGURATION */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <AlertLimitsSection
              thresholds={thresholds}
              onUpdateThresholds={setThresholds}
              profile={activeProfile}
              latestReading={latestReading}
              onTestSoundAlert={() => playAlertBuzzer('warning')}
            />
          </div>
        )}

        {/* VIEW 4: AUTOMATED DATA LOGS & HARDWARE SERIAL MONITOR */}
        {activeTab === 'logger' && (
          <div className="space-y-6">
            <DataLoggerTable
              logs={history}
              onClearLogs={() => setHistory([])}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
            />
          </div>
        )}

        {/* VIEW 5: SPECIES LIBRARY & HARDWARE NODE ARCHITECTURE */}
        {activeTab === 'specimen' && (
          <SpeciesAndHardwareSection
            profile={activeProfile}
            onSelectProfile={(p) => {
              setActiveProfile(p);
              setThresholds((prev) => ({
                ...prev,
                soilDryAlertPercent: Math.max(10, p.optimalSoilMoistureMin - 5),
                soilWaterloggedPercent: Math.min(95, p.optimalSoilMoistureMax + 10),
                tempMinC: p.optimalTempMinC - 3,
                tempMaxC: p.optimalTempMaxC + 3,
                humidityMinPercent: Math.max(20, p.optimalHumidityMin - 10),
                humidityMaxPercent: Math.min(95, p.optimalHumidityMax + 10),
                lightMinLux: Math.max(300, p.optimalLuxMin - 600),
                lightMaxLux: p.optimalLuxMax + 4000,
              }));
            }}
            irrigationHistory={irrigationHistory}
            onTriggerPump={handleTriggerPump}
            isPumpActive={isPumpActive}
          />
        )}
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#08090d] py-6 mt-12 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-zinc-300 font-semibold">PhytoSense IoT Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Triple-Sensor Node: Capacitive Soil Moisture · DHT11 · LDR</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>ESP32 Hardware Stream: 115200 Baud</span>
            <span aria-hidden="true">·</span>
            <span>VPD Agronomy Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
