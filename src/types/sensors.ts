export interface SensorReading {
  timestamp: string; // ISO string or formatted time
  timestampMs: number;
  // Soil Moisture Sensor
  soilMoisturePercent: number; // 0 - 100%
  soilRawAdc: number; // 0 - 4095
  soilVoltage: number; // 0 - 3.3V
  isSoilDry: boolean;
  isSoilWaterlogged: boolean;
  
  // DHT11 Sensor
  temperatureC: number;
  temperatureF: number;
  humidityPercent: number;
  vpdKpa: number; // Vapor pressure deficit in kPa
  dewPointC: number;

  // LDR Light Sensor
  lightLux: number;
  lightFootCandles: number;
  ldrResistanceKohm: number;
  lightCategory: 'Deep Shade' | 'Low Light' | 'Medium Indirect' | 'Bright Indirect' | 'Direct Sun' | 'Scorching Excess';

  // Computed Health
  healthScore: number; // 0 - 100%
  healthState: 'Thriving' | 'Good' | 'Moderate Stress' | 'Critical Attention';
  activeAlerts: string[];
}

export interface PlantProfile {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  description: string;
  wateringCadenceDays: number;
  optimalSoilMoistureMin: number;
  optimalSoilMoistureMax: number;
  optimalTempMinC: number;
  optimalTempMaxC: number;
  optimalHumidityMin: number;
  optimalHumidityMax: number;
  optimalLuxMin: number;
  optimalLuxMax: number;
  soilType: string;
  botanistTip: string;
}

export interface AlertThresholds {
  soilDryAlertPercent: number;
  soilWaterloggedPercent: number;
  tempMinC: number;
  tempMaxC: number;
  humidityMinPercent: number;
  humidityMaxPercent: number;
  lightMinLux: number;
  lightMaxLux: number;
  soundAlertEnabled: boolean;
}

export interface IrrigationLog {
  id: string;
  timestamp: string;
  amountMl: number;
  method: 'Manual Water' | 'Automated Pump' | 'Hydration Cycle';
  soilBefore: number;
  soilAfter: number;
  notes: string;
}
