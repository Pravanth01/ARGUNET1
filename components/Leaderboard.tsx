
import React from 'react';
import { User } from '../types';

interface LeaderboardProps {
  users: User[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users }) => {
  const sortedUsers = [...users].sort((a, b) => b.rating - a.rating).slice(0, 10);

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <span className="text-yellow-400">👑</span>;
      case 1: return <span className="text-gray-300">🥈</span>;
      case 2: return <span className="text-orange-400">🥉</span>;
      default: return <span className="text-white/20">#{index + 1}</span>;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg className="w-24 h-24 text-[#00CCFF]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      
      <h2 className="text-xl font-futuristic font-black text-white mb-6 uppercase tracking-tighter flex items-center">
        <span className="w-1.5 h-6 bg-[#BF00FF] mr-3"></span>
        Global Rankings
      </h2>
      
      <div className="space-y-3">
        {sortedUsers.map((user, idx) => (
          <div 
            key={user.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
              idx === 0 ? 'bg-[#BF00FF]/10 border-[#BF00FF]/30' : 'bg-black/20 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 flex justify-center font-mono font-bold text-lg">
                {getRankIcon(idx)}
              </div>
              <span className="text-white font-semibold uppercase tracking-wide">
                {user.username}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[#00CCFF] font-mono font-bold text-lg">
                {user.rating}
              </span>
              <span className="text-[10px] block text-white/40 uppercase font-futuristic">Rating</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
