import React, { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  gamesPlayed: number;
  streak?: number;
  avatar?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');

  // Limit to only 5 entries
  const displayedEntries = entries.slice(0, 5);

  return (
    <div className="bg-deep-navy/95 rounded-2xl shadow-playful hover:shadow-playful-hover transition-all duration-300 p-6 h-full w-[280px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5 text-white"
          >
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <h2 className="text-lg font-bold text-white">Featured Game</h2>
        </div>
        <div className="flex gap-1">
          {(['week', 'month', 'all'] as const).map((frame) => (
            <button
              key={frame}
              onClick={() => setTimeFrame(frame)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                timeFrame === frame
                  ? 'bg-soft-purple text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {displayedEntries.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex-shrink-0 w-5 text-white/70 text-sm">
              {entry.rank}
            </div>
            
            <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10">
              <span className="text-white/90 text-sm">
                {entry.name.charAt(0)}
              </span>
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-medium text-white text-sm truncate">{entry.name}</h3>
                {entry.streak && entry.streak > 1 && (
                  <div className="flex items-center">
                    <span className="text-[10px] text-white/50">+{entry.streak}d</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40">
                {entry.gamesPlayed} games
              </p>
            </div>
            
            <div className="flex-shrink-0 text-right">
              <span className="text-white text-sm font-medium">
                {entry.points}
              </span>
              <span className="text-xs text-white/50 ml-0.5">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 