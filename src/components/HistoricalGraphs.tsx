import React, { useState, useMemo } from 'react';
import { SensorReading } from '../types/sensors';
import { TrendingUp, BarChart3, Filter } from 'lucide-react';

interface HistoricalGraphsProps {
  history: SensorReading[];
  soilDryLimit: number;
}

type MetricChannel = 'soil' | 'temperature' | 'humidity' | 'light';
type TimeWindow = '1h' | '6h' | '24h' | '7d';

export const HistoricalGraphs: React.FC<HistoricalGraphsProps> = ({
  history,
  soilDryLimit,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<MetricChannel>('soil');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter history based on time window
  const filteredData = useMemo(() => {
    if (!history.length) return [];
    const countMap: Record<TimeWindow, number> = {
      '1h': 20,
      '6h': 40,
      '24h': 72,
      '7d': 120,
    };
    const maxCount = countMap[timeWindow] || 72;
    return history.slice(-maxCount);
  }, [history, timeWindow]);

  // Extract channel configuration
  const channelConfig = useMemo(() => {
    switch (selectedChannel) {
      case 'soil':
        return {
          title: 'Soil Moisture Percentage',
          sensorName: 'Capacitive VWC Probe',
          unit: '%',
          getValue: (r: SensorReading) => r.soilMoisturePercent,
          color: '#10b981', // emerald-500
          fillGradient: 'from-emerald-500/20 to-transparent',
          minDefault: 0,
          maxDefault: 100,
          referenceLine: soilDryLimit,
          referenceLabel: `Dry Limit (${soilDryLimit}%)`,
        };
      case 'temperature':
        return {
          title: 'DHT11 Ambient Temperature',
          sensorName: 'DHT11 Digital Thermal Channel',
          unit: '°C',
          getValue: (r: SensorReading) => r.temperatureC,
          color: '#06b6d4', // cyan-500
          fillGradient: 'from-cyan-500/20 to-transparent',
          minDefault: 10,
          maxDefault: 40,
          referenceLine: 28,
          referenceLabel: 'Thermal Caution (28°C)',
        };
      case 'humidity':
        return {
          title: 'DHT11 Relative Humidity',
          sensorName: 'DHT11 Hygrometer Channel',
          unit: '% RH',
          getValue: (r: SensorReading) => r.humidityPercent,
          color: '#38bdf8', // sky-400
          fillGradient: 'from-sky-500/20 to-transparent',
          minDefault: 20,
          maxDefault: 100,
          referenceLine: 50,
          referenceLabel: 'Baseline Foliar RH (50%)',
        };
      case 'light':
        return {
          title: 'LDR Ambient Illuminance',
          sensorName: 'Cadmium-Sulfide Photoresistor',
          unit: 'Lux',
          getValue: (r: SensorReading) => r.lightLux,
          color: '#f59e0b', // amber-500
          fillGradient: 'from-amber-500/20 to-transparent',
          minDefault: 0,
          maxDefault: 25000,
          referenceLine: 10000,
          referenceLabel: 'Bright Indirect Cap (10k lx)',
        };
    }
  }, [selectedChannel, soilDryLimit]);

  // Compute stats: min, max, average
  const stats = useMemo(() => {
    if (!filteredData.length) return { min: 0, max: 0, avg: 0, current: 0 };
    const values = filteredData.map(channelConfig.getValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const current = values[values.length - 1];
    return { min, max, avg, current };
  }, [filteredData, channelConfig]);

  // SVG Geometry Calculations
  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Scale Y bounds
  const yMin = useMemo(() => {
    const rawMin = stats.min;
    return Math.floor(Math.min(channelConfig.minDefault, rawMin * 0.9));
  }, [stats.min, channelConfig.minDefault]);

  const yMax = useMemo(() => {
    const rawMax = stats.max;
    return Math.ceil(Math.max(channelConfig.maxDefault, rawMax * 1.1));
  }, [stats.max, channelConfig.maxDefault]);

  const yRange = yMax - yMin || 1;

  // Generate SVG Path
  const points = useMemo(() => {
    if (filteredData.length < 2) return [];
    return filteredData.map((d, index) => {
      const x = padding.left + (index / (filteredData.length - 1)) * graphWidth;
      const val = channelConfig.getValue(d);
      const y = padding.top + graphHeight - ((val - yMin) / yRange) * graphHeight;
      return { x, y, data: d, val };
    });
  }, [filteredData, channelConfig, yMin, yRange, graphWidth, graphHeight, padding.left, padding.top]);

  const pathD = useMemo(() => {
    if (!points.length) return '';
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (!points.length) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = padding.top + graphHeight;
    return `${pathD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [points, pathD, padding.top, graphHeight]);

  // Reference line Y
  const referenceY = useMemo(() => {
    if (channelConfig.referenceLine === undefined) return null;
    const ref = channelConfig.referenceLine;
    if (ref < yMin || ref > yMax) return null;
    return padding.top + graphHeight - ((ref - yMin) / yRange) * graphHeight;
  }, [channelConfig.referenceLine, yMin, yMax, yRange, padding.top, graphHeight]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-[#0c0e16] p-5 sm:p-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              Sensor Telemetry & Historical Trends
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            High-frequency logging across soil moisture, DHT11 microclimate, and LDR irradiance
          </p>
        </div>

        {/* Time Window Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          {(['1h', '6h', '24h', '7d'] as const).map((win) => (
            <button
              key={win}
              onClick={() => {
                setTimeWindow(win);
                setHoverIndex(null);
              }}
              className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                timeWindow === win
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {win.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Sensor Channel Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Channel:
          </span>
          <button
            onClick={() => setSelectedChannel('soil')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedChannel === 'soil'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Soil Moisture (%)
          </button>
          <button
            onClick={() => setSelectedChannel('temperature')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedChannel === 'temperature'
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DHT11 Temperature (°C)
          </button>
          <button
            onClick={() => setSelectedChannel('humidity')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedChannel === 'humidity'
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DHT11 Humidity (% RH)
          </button>
          <button
            onClick={() => setSelectedChannel('light')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
              selectedChannel === 'light'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            LDR Light (Lux)
          </button>
        </div>

        {/* Statistical Summary Strip */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>Min: <strong className="text-zinc-200 tabular-nums">{Math.round(stats.min).toLocaleString()}{channelConfig.unit}</strong></div>
          <span aria-hidden="true">·</span>
          <div>Avg: <strong className="text-zinc-200 tabular-nums">{stats.avg.toFixed(1)}{channelConfig.unit}</strong></div>
          <span aria-hidden="true">·</span>
          <div>Max: <strong className="text-zinc-200 tabular-nums">{Math.round(stats.max).toLocaleString()}{channelConfig.unit}</strong></div>
        </div>
      </div>

      {/* SVG Interactive Chart Stage */}
      <div className="relative w-full overflow-hidden bg-zinc-950/60 border border-zinc-900 rounded-lg p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            if (mouseX >= padding.left && mouseX <= svgWidth - padding.right && points.length > 1) {
              const fraction = (mouseX - padding.left) / graphWidth;
              const closestIdx = Math.round(fraction * (points.length - 1));
              setHoverIndex(Math.max(0, Math.min(points.length - 1, closestIdx)));
            }
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="channelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={channelConfig.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={channelConfig.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + graphHeight * (1 - pct);
            const val = yMin + yRange * pct;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#27272a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-zinc-500"
                >
                  {Math.round(val).toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Reference Threshold Line if present */}
          {referenceY !== null && (
            <g>
              <line
                x1={padding.left}
                y1={referenceY}
                x2={svgWidth - padding.right}
                y2={referenceY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={svgWidth - padding.right - 4}
                y={referenceY - 5}
                textAnchor="end"
                className="text-[9px] font-mono fill-rose-400 font-semibold"
              >
                {channelConfig.referenceLabel}
              </text>
            </g>
          )}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#channelGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={channelConfig.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X Axis Base Line */}
          <line
            x1={padding.left}
            y1={padding.top + graphHeight}
            x2={svgWidth - padding.right}
            y2={padding.top + graphHeight}
            stroke="#3f3f46"
            strokeWidth="1"
          />

          {/* X Axis Time Labels */}
          {points.length > 0 && (
            <>
              <text
                x={points[0].x}
                y={svgHeight - 10}
                textAnchor="start"
                className="text-[10px] font-mono fill-zinc-500"
              >
                {points[0].data.timestamp}
              </text>
              <text
                x={points[Math.floor(points.length / 2)].x}
                y={svgHeight - 10}
                textAnchor="middle"
                className="text-[10px] font-mono fill-zinc-500"
              >
                {points[Math.floor(points.length / 2)].data.timestamp}
              </text>
              <text
                x={points[points.length - 1].x}
                y={svgHeight - 10}
                textAnchor="end"
                className="text-[10px] font-mono fill-zinc-500"
              >
                {points[points.length - 1].data.timestamp} (Live)
              </text>
            </>
          )}

          {/* Hover Crosshair Probe */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + graphHeight}
                stroke="#a1a1aa"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="5"
                fill={channelConfig.color}
                stroke="#09090b"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover Monospace Tooltip HUD */}
        {activePoint && (
          <div
            className="absolute pointer-events-none bg-zinc-950/95 border border-zinc-700 rounded-lg p-2.5 shadow-xl text-xs font-mono"
            style={{
              left: `${Math.min(75, Math.max(15, (activePoint.x / svgWidth) * 100))}%`,
              top: '15px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[11px] text-zinc-400 mb-0.5">
              Time: <strong className="text-zinc-200">{activePoint.data.timestamp}</strong>
            </div>
            <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: channelConfig.color }} />
              <span>{channelConfig.title}:</span>
              <span className="text-emerald-400">{activePoint.val.toFixed(1)} {channelConfig.unit}</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 flex gap-2">
              <span>Soil: {activePoint.data.soilMoisturePercent.toFixed(0)}%</span>
              <span>Temp: {activePoint.data.temperatureC.toFixed(1)}°C</span>
              <span>Lux: {Math.round(activePoint.data.lightLux)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Channel Note */}
      <div className="flex items-center justify-between text-xs text-zinc-500 font-mono mt-3">
        <span>Hardware Bus: I2C & ADC1 via ESP32 Node</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Real-time rolling buffer: {filteredData.length} records</span>
        </span>
      </div>
    </div>
  );
};
