
import React from 'react';

const LiveTicker: React.FC = () => {
  const matches = [
    "POLITICAL: 'THE ROLE OF AI IN GOVERNANCE' - LIVE NOW",
    "SOCIAL: 'UNIVERSAL BASIC INCOME' - PREPARING",
    "AI_ETHICS: 'SENTIENT ALGORITHMS' - JUST FINISHED (WINNER: ZERO_DAY)",
    "POLITICAL: 'GLOBAL TRADE POLICIES' - LIVE NOW",
    "SOCIAL: 'URBANIZATION VS RURAL LIFE' - LIVE NOW"
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-10 overflow-hidden flex items-center">
      <div className="bg-[#BF00FF] px-4 h-full flex items-center text-xs font-futuristic font-bold text-white uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(191,0,255,0.5)]">
        LIVE MATCHES
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {matches.map((m, i) => (
            <span key={i} className="mx-12 text-xs font-mono font-bold text-[#00CCFF] flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2 glow-pulse"></span>
              {m}
            </span>
          ))}
          {/* Duplicate for seamless scrolling */}
          {matches.map((m, i) => (
            <span key={`dup-${i}`} className="mx-12 text-xs font-mono font-bold text-[#00CCFF] flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2 glow-pulse"></span>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
