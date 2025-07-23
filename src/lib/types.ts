export enum CareLogType {
  FEED = 'FEED',
  WALK = 'WALK',
  NAP = 'NAP',
  MEDS = 'MEDS',
  GROOMING = 'GROOMING',
  TRAINING = 'TRAINING'
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareLog {
  id: string;
  type: CareLogType;
  description?: string;
  timestamp: Date;
  caregiver: string;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  weight?: number;
  photoUrl?: string;
  achievedAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCareLogData {
  type: CareLogType;
  description?: string;
  timestamp?: Date;
  caregiver: string;
  notes?: string;
}

export interface CreateMilestoneData {
  title: string;
  description?: string;
  weight?: number;
  photoUrl?: string;
  achievedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export const CARE_LOG_TYPES = {
  FEED: 'Feed',
  WALK: 'Walk',
  NAP: 'Nap',
  MEDS: 'Medication',
  GROOMING: 'Grooming',
  TRAINING: 'Training',
} as const; 