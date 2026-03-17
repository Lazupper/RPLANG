export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  xp: number;
  hearts: number;
  streak: number;
  lastActive: string;
  completedLessons: string[];
  level: number;
}

export type ChallengeType = 'multiple_choice' | 'fill_in_blank' | 'code_fix';

export interface Challenge {
  id: string;
  language: string;
  title: string;
  type: ChallengeType;
  question: string;
  code?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Module {
  id: string;
  language: string;
  title: string;
  concept: string;
  difficulty: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
}
