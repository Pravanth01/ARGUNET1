
export type Track = 'POLITICAL' | 'SOCIAL' | 'AI_ETHICS';

export interface User {
  id: string;
  username: string;
  rating: number;
  history: DebateHistory[];
  friends: string[];
}

export interface DebateHistory {
  id: string;
  topic: string;
  track: Track;
  opponent: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  date: string;
}

export interface Room {
  id: string;
  topic: string;
  track: Track;
  creatorId: string;
  creatorName: string;
  creatorRating: number;
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  participantId?: string;
  participantName?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
