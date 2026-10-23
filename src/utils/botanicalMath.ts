import { PlantProfile, AlertThresholds } from '../types/sensors';

/**
 * Calculate Saturated Vapor Pressure (SVP) and Vapor Pressure Deficit (VPD in kPa)
 * Crucial metric used by commercial agronomists and botanists for transpiration rate.
 */
export function calculateVPD(tempC: number, rhPercent: number): number {
  // Tetens formula for SVP in kPa
  const svp = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const avp = svp * (rhPercent / 100);
  const vpd = svp - avp;
  return Math.max(0, parseFloat(vpd.toFixed(2)));
}

/**
 * Calculate Dew Point in Celsius
 */
export function calculateDewPoint(tempC: number, rhPercent: number): number {
  const b = 17.27;
  const c = 237.7;
  const gamma = (b * tempC) / (c + tempC) + Math.log(rhPercent / 100);
  const dp = (c * gamma) / (b - gamma);
  return parseFloat(dp.toFixed(1));
}

/**
 * Classify LDR light readings into qualitative botanical lighting bands
 */
export function classifyLightLux(lux: number): 'Deep Shade' | 'Low Light' | 'Medium Indirect' | 'Bright Indirect' | 'Direct Sun' | 'Scorching Excess' {
  if (lux < 500) return 'Deep Shade';
  if (lux < 2500) return 'Low Light';
  if (lux < 6000) return 'Medium Indirect';
  if (lux < 15000) return 'Bright Indirect';
  if (lux < 35000) return 'Direct Sun';
  return 'Scorching Excess';
}

/**
 * Synthesizes overall plant health score (0 - 100%) and diagnosis
 * based on calibrated botanical envelope.
 */
export function evaluatePlantHealth(
  soilMoisture: number,
  tempC: number,
  rhPercent: number,
  lux: number,
  profile: PlantProfile,
  thresholds: AlertThresholds
): {
  score: number;
  state: 'Thriving' | 'Good' | 'Moderate Stress' | 'Critical Attention';
  alerts: string[];
} {
  let score = 100;
  const alerts: string[] = [];

  // Soil Moisture Evaluation (Weight 40%)
  if (soilMoisture <= thresholds.soilDryAlertPercent) {
    score -= 40;
    alerts.push(`Dry Soil Warning: Soil is at ${soilMoisture.toFixed(1)}% (Dry Limit: ${thresholds.soilDryAlertPercent}%)`);
  } else if (soilMoisture >= thresholds.soilWaterloggedPercent) {
    score -= 25;
    alerts.push(`Waterlogged Root Zone: Soil is at ${soilMoisture.toFixed(1)}%`);
  } else if (soilMoisture < profile.optimalSoilMoistureMin) {
    const deficit = profile.optimalSoilMoistureMin - soilMoisture;
    score -= Math.min(20, deficit * 1.5);
  } else if (soilMoisture > profile.optimalSoilMoistureMax) {
    const excess = soilMoisture - profile.optimalSoilMoistureMax;
    score -= Math.min(15, excess * 1.2);
  }

  // Temperature Evaluation (Weight 25%)
  if (tempC < thresholds.tempMinC) {
    score -= 25;
    alerts.push(`Low Temperature Hazard: ${tempC.toFixed(1)}°C is below threshold ${thresholds.tempMinC}°C`);
  } else if (tempC > thresholds.tempMaxC) {
    score -= 25;
    alerts.push(`High Heat Stress: ${tempC.toFixed(1)}°C exceeds limit ${thresholds.tempMaxC}°C`);
  } else if (tempC < profile.optimalTempMinC || tempC > profile.optimalTempMaxC) {
    score -= 10;
  }

  // Humidity Evaluation (Weight 20%)
  if (rhPercent < thresholds.humidityMinPercent) {
    score -= 20;
    alerts.push(`Low Relative Humidity: ${rhPercent.toFixed(1)}% RH`);
  } else if (rhPercent > thresholds.humidityMaxPercent) {
    score -= 15;
    alerts.push(`Excessive Humidity: ${rhPercent.toFixed(1)}% RH (Fungal spore danger)`);
  } else if (rhPercent < profile.optimalHumidityMin || rhPercent > profile.optimalHumidityMax) {
    score -= 8;
  }

  // Light Evaluation (Weight 15%)
  if (lux < thresholds.lightMinLux) {
    score -= 15;
    alerts.push(`Insufficient Photon Density: ${Math.round(lux)} Lux`);
  } else if (lux > thresholds.lightMaxLux) {
    score -= 20;
    alerts.push(`Scorching Solar Radiation: ${Math.round(lux)} Lux`);
  } else if (lux < profile.optimalLuxMin || lux > profile.optimalLuxMax) {
    score -= 6;
  }

  const finalScore = Math.max(8, Math.min(100, Math.round(score)));

  let state: 'Thriving' | 'Good' | 'Moderate Stress' | 'Critical Attention' = 'Thriving';
  if (finalScore < 50) {
    state = 'Critical Attention';
  } else if (finalScore < 72) {
    state = 'Moderate Stress';
  } else if (finalScore < 88) {
    state = 'Good';
  }

  return { score: finalScore, state, alerts };
}

/**
 * Audio cue synthesizer for alerts using Web Audio API
 */
export function playAlertBuzzer(severity: 'warning' | 'critical' | 'watered'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (severity === 'watered') {
      // Pleasant dual chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
      return;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = severity === 'critical' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(severity === 'critical' ? 740 : 440, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}
