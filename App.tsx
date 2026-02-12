
import React, { useState, useEffect, useCallback } from 'react';
import { User, Room, Track, DebateHistory } from './types';
import Background from './components/Background';
import LiveTicker from './components/LiveTicker';
import Leaderboard from './components/Leaderboard';
import DebateRoom from './components/DebateRoom';
import { TRACK_CONFIG } from './constants';

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'AUTH' | 'DASHBOARD' | 'ARENA' | 'ROOM'>('AUTH');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  // Persist mock data
  useEffect(() => {
    const savedRooms = localStorage.getItem('arguenet_rooms');
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    
    // Auto-login check if session exists
    const savedUser = sessionStorage.getItem('arguenet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('DASHBOARD');
    }
  }, []);

  const saveRooms = useCallback((updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem('arguenet_rooms', JSON.stringify(updatedRooms));
  }, []);

  // Handlers
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authData.username.length < 3 || authData.password.length < 6) {
      alert("Invalid credentials. Use min 3 chars for user and 6 for pass.");
      return;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: authData.username,
      rating: 300,
      history: [],
      friends: []
    };
    setUser(newUser);
    sessionStorage.setItem('arguenet_user', JSON.stringify(newUser));
    setView('DASHBOARD');
  };

  const handleCreateRoom = () => {
    if (!user || !selectedTrack || !newTopic.trim()) return;
    
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      topic: newTopic,
      track: selectedTrack,
      creatorId: user.id,
      creatorName: user.username,
      creatorRating: user.rating,
      status: 'WAITING'
    };
    
    const updated = [...rooms, newRoom];
    saveRooms(updated);
    setActiveRoom(newRoom);
    setView('ROOM');
    setShowCreateModal(false);
    setNewTopic('');
  };

  const joinRoom = (room: Room) => {
    if (!user) return;
    const updated = rooms.map(r => 
      r.id === room.id 
        ? { ...r, status: 'ACTIVE' as const, participantId: user.id, participantName: user.username } 
        : r
    );
    saveRooms(updated);
    setActiveRoom(updated.find(r => r.id === room.id) || null);
    setView('ROOM');
  };

  const leaveRoom = () => {
    if (!activeRoom || !user) return;
    // If creator leaves, shut down room
    if (activeRoom.creatorId === user.id) {
      const filtered = rooms.filter(r => r.id !== activeRoom.id);
      saveRooms(filtered);
    }
    setActiveRoom(null);
    setView('ARENA');
  };

  const finishDebate = () => {
    if (!activeRoom || !user) return;
    
    // Mock win/loss result
    const result = Math.random() > 0.5 ? 'WIN' : 'LOSS';
    const ratingChange = result === 'WIN' ? 25 : -15;
    
    const newHistoryItem: DebateHistory = {
      id: Math.random().toString(36).substr(2, 9),
      topic: activeRoom.topic,
      track: activeRoom.track,
      opponent: user.id === activeRoom.creatorId ? (activeRoom.participantName || "Unknown") : activeRoom.creatorName,
      result,
      date: new Date().toLocaleDateString()
    };

    const updatedUser = {
      ...user,
      rating: Math.max(0, user.rating + ratingChange),
      history: [newHistoryItem, ...user.history]
    };

    setUser(updatedUser);
    sessionStorage.setItem('arguenet_user', JSON.stringify(updatedUser));
    
    // Close room in global state
    const filtered = rooms.filter(r => r.id !== activeRoom.id);
    saveRooms(filtered);
    
    setActiveRoom(null);
    setView('DASHBOARD');
    alert(`Debate Concluded! You ${result}. Rating: ${updatedUser.rating} (${ratingChange > 0 ? '+' : ''}${ratingChange})`);
  };

  // Views
  if (view === 'AUTH') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        <Background />
        <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_0_50px_rgba(191,0,255,0.2)] animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-futuristic font-black text-white uppercase tracking-tighter mb-2 shadow-[0_0_20px_rgba(191,0,255,0.5)]">
              Arguenet
            </h1>
            <p className="text-[#00CCFF] font-futuristic text-xs tracking-[0.3em] uppercase">Elite Debate Arena</p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-futuristic text-white/50 uppercase tracking-widest ml-1">Codename</label>
              <input
                type="text"
                required
                value={authData.username}
                onChange={e => setAuthData({...authData, username: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#BF00FF] focus:ring-1 focus:ring-[#BF00FF] transition-all font-mono"
                placeholder="User-01"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-futuristic text-white/50 uppercase tracking-widest ml-1">Access Key</label>
              <input
                type="password"
                required
                value={authData.password}
                onChange={e => setAuthData({...authData, password: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#BF00FF] focus:ring-1 focus:ring-[#BF00FF] transition-all font-mono"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#BF00FF] to-[#00CCFF] text-white py-5 rounded-xl font-futuristic font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(191,0,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Initialize Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      <Background />
      <LiveTicker />
      
      {/* Main Navigation */}
      <nav className="pt-16 pb-6 px-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setView('DASHBOARD')}>
          <h1 className="text-3xl font-futuristic font-black tracking-tighter shadow-text-neon text-white uppercase">Arguenet</h1>
          <div className="h-4 w-[1px] bg-white/20"></div>
          <span className="text-[10px] font-mono text-[#00CCFF] uppercase tracking-[0.2em]">{view}</span>
        </div>
        
        <div className="flex items-center gap-8">
           <button onClick={() => setView('ARENA')} className={`font-futuristic text-sm uppercase tracking-widest hover:text-[#BF00FF] transition-colors ${view === 'ARENA' ? 'text-[#BF00FF]' : 'text-white/60'}`}>Arena</button>
           <button onClick={() => setView('DASHBOARD')} className={`font-futuristic text-sm uppercase tracking-widest hover:text-[#BF00FF] transition-colors ${view === 'DASHBOARD' ? 'text-[#BF00FF]' : 'text-white/60'}`}>Dashboard</button>
           <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-5 pr-2 py-1.5 backdrop-blur-md">
             <div className="text-right">
                <div className="text-[10px] font-futuristic text-white/40 uppercase leading-none mb-1">Combatant</div>
                <div className="text-xs font-bold uppercase">{user?.username}</div>
             </div>
             <div className="bg-[#BF00FF] text-white text-sm font-mono font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(191,0,255,0.5)]">
               {user?.rating}
             </div>
           </div>
        </div>
      </nav>

      {/* Views Routing */}
      <main className="px-8 pb-12">
        {view === 'DASHBOARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Left Column: Profile & Stats */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                 <h2 className="text-xl font-futuristic font-black uppercase mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-[#00CCFF] mr-3"></span>
                    Combat Log
                 </h2>
                 <div className="space-y-4">
                    {user?.history.length === 0 ? (
                      <div className="text-center py-12 text-white/20 font-futuristic uppercase italic text-sm">No battle records found</div>
                    ) : (
                      user?.history.map(h => (
                        <div key={h.id} className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                           <div>
                              <div className="text-xs font-futuristic text-[#00CCFF] mb-1">{h.track}</div>
                              <div className="text-sm font-bold truncate max-w-[150px]">{h.topic}</div>
                              <div className="text-[10px] text-white/40 uppercase">vs {h.opponent}</div>
                           </div>
                           <div className={`font-mono font-bold ${h.result === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>
                             {h.result}
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
              <button 
                onClick={() => setView('ARENA')}
                className="w-full bg-[#BF00FF] py-6 rounded-2xl font-futuristic font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(191,0,255,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-4"
              >
                Enter Battle Arena
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Middle & Right: Leaderboard and Friends */}
            <div className="lg:col-span-2 space-y-8">
              <Leaderboard users={[...(user ? [user] : []), { id: 'm1', username: 'ZERO_DAY', rating: 1450, history: [], friends: [] }, { id: 'm2', username: 'PANTHEON', rating: 1200, history: [], friends: [] }]} />
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-xl font-futuristic font-black uppercase mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-white/20 mr-3"></span>
                    Command Center
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 p-6 rounded-xl border border-white/5 hover:border-[#00CCFF]/30 transition-colors cursor-pointer group">
                    <div className="text-[#00CCFF] mb-2 font-mono group-hover:scale-110 transition-transform">04</div>
                    <div className="text-sm font-futuristic text-white/60 uppercase">Active Arenas</div>
                  </div>
                  <div className="bg-black/30 p-6 rounded-xl border border-white/5 hover:border-[#BF00FF]/30 transition-colors cursor-pointer group">
                    <div className="text-[#BF00FF] mb-2 font-mono group-hover:scale-110 transition-transform">128</div>
                    <div className="text-sm font-futuristic text-white/60 uppercase">Elite Debaters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'ARENA' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-futuristic font-black uppercase tracking-tighter mb-2">Debate Arena</h2>
                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Select your specialization track</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {(Object.keys(TRACK_CONFIG) as Array<keyof typeof TRACK_CONFIG>).map((t) => (
                 <button
                  key={t}
                  onClick={() => { setSelectedTrack(t); setShowCreateModal(false); }}
                  className={`relative group h-64 rounded-2xl overflow-hidden border transition-all duration-500 flex flex-col items-center justify-center p-8 ${
                    selectedTrack === t 
                    ? 'border-[#BF00FF] bg-white/10 scale-[1.02] shadow-[0_0_30px_rgba(191,0,255,0.2)]' 
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                 >
                    <div className={`absolute inset-0 bg-gradient-to-br ${TRACK_CONFIG[t].gradient} opacity-40`}></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                       <div className="mb-4 text-[#00CCFF] group-hover:scale-125 transition-transform duration-500">
                         {TRACK_CONFIG[t].icon}
                       </div>
                       <div className="font-futuristic font-black text-2xl uppercase tracking-tighter mb-1">{TRACK_CONFIG[t].label}</div>
                       <div className="text-[10px] font-mono text-white/40 tracking-widest uppercase">Select Track</div>
                    </div>
                    {selectedTrack === t && (
                      <div className="absolute bottom-4 animate-bounce">
                        <div className="w-1.5 h-1.5 bg-[#BF00FF] rounded-full"></div>
                      </div>
                    )}
                 </button>
               ))}
            </div>

            {selectedTrack && (
              <div className="mt-12 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-futuristic font-black uppercase tracking-tighter flex items-center">
                    <span className="w-1.5 h-6 bg-[#BF00FF] mr-3"></span>
                    Available Arenas: {selectedTrack}
                  </h3>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#00CCFF] text-black px-6 py-3 rounded-lg font-futuristic font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,204,255,0.4)]"
                  >
                    Establish Room
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {rooms.filter(r => r.track === selectedTrack && r.status === 'WAITING').length === 0 ? (
                     <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                        <div className="text-white/20 font-futuristic uppercase text-lg mb-2">No active broadcast signals</div>
                        <button onClick={() => setShowCreateModal(true)} className="text-[#00CCFF] font-futuristic text-xs uppercase tracking-widest underline underline-offset-4">Create the first arena</button>
                     </div>
                   ) : (
                     rooms.filter(r => r.track === selectedTrack && r.status === 'WAITING').map(room => (
                       <div key={room.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                          <div>
                            <div className="text-sm font-bold uppercase mb-1">{room.topic}</div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-[#00CCFF] uppercase">By {room.creatorName}</span>
                              <span className="text-[10px] font-mono text-white/30 uppercase">ELO {room.creatorRating}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => joinRoom(room)}
                            className="bg-white/10 hover:bg-[#BF00FF] text-white px-6 py-2 rounded-lg font-futuristic text-xs uppercase tracking-widest transition-all"
                          >
                            Engage
                          </button>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'ROOM' && activeRoom && user && (
          <DebateRoom 
            room={activeRoom} 
            currentUser={user} 
            onLeave={leaveRoom} 
            onFinish={finishDebate}
          />
        )}
      </main>

      {/* Modal for Creating Room */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0c0032] border border-[#BF00FF]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(191,0,255,0.2)]">
            <h2 className="text-2xl font-futuristic font-black uppercase tracking-tighter mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-[#BF00FF] mr-3"></span>
              Initialize Arena
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-futuristic text-white/50 uppercase tracking-widest ml-1">Debate Proposition</label>
                <textarea
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#BF00FF] transition-all font-mono min-h-[100px]"
                  placeholder="The centralization of AI leads to systemic bias..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 py-4 rounded-xl font-futuristic text-xs uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newTopic.trim()}
                  className="flex-1 bg-[#BF00FF] text-white py-4 rounded-xl font-futuristic font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(191,0,255,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Confirm Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
