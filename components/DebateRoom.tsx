
import React, { useState, useEffect, useRef } from 'react';
import { Room, User, Message } from '../types';

interface DebateRoomProps {
  room: Room;
  currentUser: User;
  onLeave: () => void;
  onFinish: () => void;
}

const DebateRoom: React.FC<DebateRoomProps> = ({ room, currentUser, onLeave, onFinish }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [debateActive, setDebateActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !debateActive) {
      setDebateActive(true);
    }
  }, [countdown, debateActive]);

  useEffect(() => {
    if (debateActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setDebateActive(false);
      onFinish();
    }
  }, [debateActive, timeLeft, onFinish]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !debateActive) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.username,
      text: input,
      timestamp: Date.now(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const isCreator = currentUser.id === room.creatorId;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col pt-10">
      {/* Header */}
      <div className="bg-[#0c0032] border-b border-white/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={onLeave}
            className="text-white/60 hover:text-white flex items-center gap-2 font-futuristic text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Abandone Match
          </button>
          <div className="h-6 w-[1px] bg-white/10"></div>
          <div>
            <h1 className="text-white font-futuristic text-lg uppercase font-bold tracking-tight">
              {room.topic}
            </h1>
            <span className="text-[#00CCFF] text-[10px] font-mono uppercase">Track: {room.track}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-white/40 text-[10px] font-futuristic uppercase">Time Remaining</div>
            <div className={`font-mono text-2xl font-bold ${timeLeft < 10 ? 'text-red-500 glow-pulse' : 'text-[#BF00FF]'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Arena Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Opponents List */}
        <div className="w-64 bg-white/5 border-r border-white/10 p-6 flex flex-col gap-6">
          <div className="p-4 rounded-xl border border-[#BF00FF]/50 bg-[#BF00FF]/10">
             <div className="text-[10px] font-futuristic text-[#BF00FF] uppercase mb-1">Combatant A</div>
             <div className="text-white font-bold uppercase">{room.creatorName}</div>
             <div className="text-[#00CCFF] font-mono text-sm">{room.creatorRating} ELO</div>
          </div>
          <div className="flex justify-center text-white/20 font-futuristic font-black text-2xl">VS</div>
          <div className="p-4 rounded-xl border border-[#00CCFF]/50 bg-[#00CCFF]/10">
             <div className="text-[10px] font-futuristic text-[#00CCFF] uppercase mb-1">Combatant B</div>
             <div className="text-white font-bold uppercase">{room.participantName || "WAITING..."}</div>
             <div className="text-[#00CCFF] font-mono text-sm">??? ELO</div>
          </div>
        </div>

        {/* Chat / Debate Flow */}
        <div className="flex-1 flex flex-col bg-black/40 relative">
          {countdown > 0 && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="text-[12px] font-futuristic text-[#BF00FF] tracking-[0.5em] uppercase mb-4">Commencing Battle in</div>
              <div className="text-9xl font-futuristic font-black text-white shadow-text-neon animate-pulse">
                {countdown}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.senderId === currentUser.id ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] font-futuristic text-white/40 mb-1 uppercase tracking-widest">
                  {m.senderName}
                </div>
                <div className={`max-w-[70%] p-4 rounded-2xl ${
                  m.senderId === currentUser.id 
                    ? 'bg-[#BF00FF]/20 border border-[#BF00FF]/40 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-[#0c0032]/80 border-t border-white/10 backdrop-blur-xl">
            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!debateActive}
                placeholder={debateActive ? "Enter your argument..." : "Waiting for battle start..."}
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[#BF00FF] transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!debateActive}
                className="bg-[#BF00FF] hover:bg-[#d800ff] text-white px-8 rounded-xl font-futuristic font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(191,0,255,0.4)] disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                Deploy
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateRoom;
