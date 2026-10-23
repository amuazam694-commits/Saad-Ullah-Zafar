import React, { useState } from 'react';
import { SensorReading } from '../types/sensors';
import { Download, Terminal, Filter, Trash2, Check, Copy, Code, Cpu } from 'lucide-react';

interface DataLoggerTableProps {
  logs: SensorReading[];
  onClearLogs: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const DataLoggerTable: React.FC<DataLoggerTableProps> = ({
  logs,
  onClearLogs,
  isStreaming,
  onToggleStreaming,
}) => {
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'serial' | 'firmware'>('table');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter logs
  const displayLogs = filterAlertsOnly
    ? logs.filter((log) => log.activeAlerts.length > 0 || log.isSoilDry)
    : logs;

  // Export CSV handler
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = [
      'Timestamp',
      'Soil_Moisture_Pct',
      'Soil_Voltage_V',
      'Soil_ADC',
      'Temperature_C',
      'Humidity_Pct',
      'VPD_kPa',
      'Light_Lux',
      'Light_Category',
      'Health_Score',
      'Active_Alerts',
    ];

    const rows = logs.map((log) => [
      `"${log.timestamp}"`,
      log.soilMoisturePercent.toFixed(2),
      log.soilVoltage.toFixed(2),
      log.soilRawAdc,
      log.temperatureC.toFixed(2),
      log.humidityPercent.toFixed(2),
      log.vpdKpa.toFixed(2),
      Math.round(log.lightLux),
      `"${log.lightCategory}"`,
      log.healthScore,
      `"${log.activeAlerts.join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phytosense_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestLog = logs[logs.length - 1];

  const serialJsonPayload = latestLog
    ? JSON.stringify(
        {
          node_id: 'phytosense-esp32-node1',
          timestamp: latestLog.timestamp,
          soil: {
            vwc_percent: parseFloat(latestLog.soilMoisturePercent.toFixed(1)),
            voltage_v: parseFloat(latestLog.soilVoltage.toFixed(2)),
            adc: latestLog.soilRawAdc,
            dry_alert: latestLog.isSoilDry,
          },
          dht11: {
            temp_c: parseFloat(latestLog.temperatureC.toFixed(1)),
            temp_f: parseFloat(latestLog.temperatureF.toFixed(1)),
            rh_percent: parseFloat(latestLog.humidityPercent.toFixed(1)),
            vpd_kpa: latestLog.vpdKpa,
          },
          ldr: {
            lux: Math.round(latestLog.lightLux),
            band: latestLog.lightCategory,
            res_kohm: parseFloat(latestLog.ldrResistanceKohm.toFixed(2)),
          },
          botany: {
            health_index: latestLog.healthScore,
            status: latestLog.healthState,
          },
        },
        null,
        2
      )
    : '{}';

  const arduinoFirmwareCode = `/*
 * PhytoSense IoT Plant Monitor Firmware (ESP32 / Arduino)
 * Sensors: Capacitive Soil Moisture, DHT11 (Temp & RH), LDR (Light)
 */

#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT11
#define SOIL_PIN 34
#define LDR_PIN 35

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  analogReadResolution(12); // 12-bit ADC (0 - 4095)
  Serial.println("{\\"status\\": \\"PhytoSense Node Initialized\\"}");
}

void loop() {
  // 1. Soil Moisture Probe
  int rawSoil = analogRead(SOIL_PIN);
  float soilPct = map(rawSoil, 3200, 1200, 0, 100); // Calibrated dry/wet
  soilPct = constrain(soilPct, 0.0, 100.0);

  // 2. DHT11 Sensor
  float tempC = dht.readTemperature();
  float humidity = dht.readHumidity();

  // 3. LDR Light Sensor
  int rawLdr = analogRead(LDR_PIN);
  float lux = map(rawLdr, 0, 4095, 0, 45000);

  // Output JSON Packet via Serial
  Serial.print("{\\"soil_moisture\\":");
  Serial.print(soilPct, 1);
  Serial.print(",\\"temp_c\\":");
  Serial.print(tempC, 1);
  Serial.print(",\\"humidity_rh\\":");
  Serial.print(humidity, 1);
  Serial.print(",\\"lux\\":");
  Serial.print(lux, 0);
  Serial.println("}");

  delay(2000);
}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0c0e16] p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Automated Data Logging & Serial Telemetry
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Immutable sensor buffer storing real-time packets from capacitive soil, DHT11, and LDR nodes
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-colors ${
              isStreaming
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}
          >
            {isStreaming ? 'Stream: Active (1s)' : 'Stream: Paused'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!logs.length}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onClearLogs}
            disabled={!logs.length}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs transition-colors disabled:opacity-50"
            title="Clear Log Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Table vs Live Serial Terminal vs Arduino Firmware */}
      <div className="flex items-center gap-2 my-4 border-b border-zinc-800/70 pb-3">
        <button
          onClick={() => setActiveSubTab('table')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeSubTab === 'table'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Telemetry Table ({displayLogs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('serial')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'serial'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live Serial JSON Stream</span>
        </button>

        <button
          onClick={() => setActiveSubTab('firmware')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'firmware'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Code className="w-3.5 h-3.5 text-emerald-400" />
          <span>ESP32 Arduino Firmware Code</span>
        </button>

        {activeSubTab === 'table' && (
          <button
            onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
            className={`ml-auto px-2.5 py-1 text-xs font-mono rounded border flex items-center gap-1.5 transition-colors ${
              filterAlertsOnly
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Alerts Only</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: TABULAR LOGS */}
      {activeSubTab === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Soil Moisture</th>
                <th className="py-2.5 px-3">DHT11 Temp</th>
                <th className="py-2.5 px-3">DHT11 RH</th>
                <th className="py-2.5 px-3">VPD</th>
                <th className="py-2.5 px-3">LDR Light</th>
                <th className="py-2.5 px-3">Health</th>
                <th className="py-2.5 px-3">Status Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40 text-zinc-300">
              {displayLogs.slice(-25).reverse().map((item, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-zinc-900/40 transition-colors ${
                    item.isSoilDry ? 'bg-rose-950/20' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-zinc-400 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`font-semibold tabular-nums ${item.isSoilDry ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.soilMoisturePercent.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">({item.soilVoltage.toFixed(2)}V)</span>
                  </td>
                  <td className="py-2 px-3 text-cyan-400 tabular-nums whitespace-nowrap">
                    {item.temperatureC.toFixed(1)}°C
                  </td>
                  <td className="py-2 px-3 text-sky-400 tabular-nums whitespace-nowrap">
                    {item.humidityPercent.toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-zinc-300 tabular-nums whitespace-nowrap">
                    {item.vpdKpa.toFixed(2)} kPa
                  </td>
                  <td className="py-2 px-3 text-amber-400 tabular-nums whitespace-nowrap">
                    {Math.round(item.lightLux).toLocaleString()} lx
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className={`tabular-nums ${item.healthScore >= 75 ? 'text-emerald-400' : item.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {item.healthScore}%
                    </span>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {item.activeAlerts.length > 0 ? (
                      <span className="text-rose-400 text-[11px]">
                        {item.activeAlerts[0]}
                      </span>
                    ) : (
                      <span className="text-emerald-500 text-[11px]">Nominal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-VIEW 2: SERIAL JSON PAYLOAD TERMINAL */}
      {activeSubTab === 'serial' && (
        <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs relative">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>UART / MQTT Payload (Baud: 115200)</span>
            </span>
            <button
              onClick={() => copyToClipboard(serialJsonPayload, 'json')}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              {copiedText === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedText === 'json' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="text-emerald-400 overflow-x-auto leading-relaxed max-h-72">
            {serialJsonPayload}
          </pre>
        </div>
      )}

      {/* SUB-VIEW 3: ARDUINO FIRMWARE SNIPPET */}
      {activeSubTab === 'firmware' && (
        <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs relative">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Arduino IDE / PlatformIO C++ Sketch</span>
            </span>
            <button
              onClick={() => copyToClipboard(arduinoFirmwareCode, 'code')}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              {copiedText === 'code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedText === 'code' ? 'Copied' : 'Copy Arduino Code'}</span>
            </button>
          </div>
          <pre className="text-zinc-300 overflow-x-auto leading-relaxed max-h-72">
            {arduinoFirmwareCode}
          </pre>
        </div>
      )}
    </div>
  );
};
