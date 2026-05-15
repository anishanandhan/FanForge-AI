export interface Prediction {
  id: string;
  matchId: string;
  type: 'standard' | 'flash';
  title: string;
  options: string[];
  predictedOption: string | null;
  status: 'pending' | 'active' | 'resolved';
  reward: number;
  timeRemaining?: string;
  aiReasoning?: {
    confidence: number;
    risk: 'Low' | 'Medium' | 'High';
    volatility: 'Low' | 'Medium' | 'High';
    factors: string[];
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  type: 'recovery' | 'challenge' | 'clan';
}

export interface Rival {
  name: string;
  scoreDiff: number;
  avatar: string;
  status: 'online' | 'offline';
}

export interface AgentAction {
  id: string;
  agent: string;
  action: string;
  timestamp: string;
  type?: 'routine' | 'alert' | 'urgent';
}

export interface FanProfile {
  archetype: string;
  riskAppetite: string;
  loyaltyIndex: number;
  predictionAccuracy: number;
  behaviorPattern: string;
}

export interface ClanWar {
  clanId: string;
  clanName: string;
  opponentName: string;
  territoryControl: number;
}

export interface Notification {
  id: string;
  agent: string;
  message: string;
  time: string;
}

export interface UserStats {
  score: number;
  streak: number;
  badges: string[];
  level: number;
  xp: number;
  nextLevelXp: number;
  fanType: string;
  profile: FanProfile;
}

