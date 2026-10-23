import React from 'react';
import { Droplet, Activity, Bell, FileText, Cpu, Sprout } from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'graphs' | 'alerts' | 'logger' | 'specimen';
  setActiveTab: (tab: 'overview' | 'graphs' | 'alerts' | 'logger' | 'specimen') => void;
  onWaterPlant: () => void;
  isWatering: boolean;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onWaterPlant,
  isWatering,
  activeAlertCount,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-[#08090d]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-100 whitespace-nowrap">
            PhytoSense <span className="text-emerald-400 font-medium">IoT</span>
          </span>
        </div>

        {/* Zone 2: Single-line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 border-b-2 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Live Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('graphs')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 border-b-2 ${
              activeTab === 'graphs'
                ? 'border-emerald-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Telemetry & Graphs</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 border-b-2 ${
              activeTab === 'alerts'
                ? 'border-emerald-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alert Limits</span>
            {activeAlertCount > 0 && (
              <span className="text-xs font-mono text-rose-400 font-semibold ml-1">
                ({activeAlertCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logger')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 border-b-2 ${
              activeTab === 'logger'
                ? 'border-emerald-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Data Logs & Serial</span>
          </button>

          <button
            onClick={() => setActiveTab('specimen')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 py-1 border-b-2 ${
              activeTab === 'specimen'
                ? 'border-emerald-400 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Species & Hardware</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onWaterPlant}
            disabled={isWatering}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shadow-sm ${
              isWatering
                ? 'bg-emerald-600/40 text-emerald-200 cursor-wait'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <Droplet className={`w-3.5 h-3.5 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>{isWatering ? 'Dispensing Water...' : 'Hydrate (+50ml)'}</span>
          </button>
        </div>

      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-zinc-800/60 overflow-x-auto text-xs gap-3">
        {(['overview', 'graphs', 'alerts', 'logger', 'specimen'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap capitalize ${
              activeTab === tab ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-400'
            }`}
          >
            {tab === 'overview' ? 'Monitor' : tab === 'graphs' ? 'Graphs' : tab === 'alerts' ? 'Limits' : tab === 'logger' ? 'Logs' : 'Species'}
          </button>
        ))}
      </div>
    </header>
  );
};
