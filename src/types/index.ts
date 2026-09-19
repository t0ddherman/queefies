export interface AlbumItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
}

export interface UserStats {
  age: number | null;
  height: string;
  bodyType: string;
  ethnicity: string;
  pronouns: string;
  lookingFor: string[];
  tags: string[];
}

export interface UserProfile {
  fingerprint: string;
  displayName: string;
  intro: string;
  primaryPhoto: string | null;
  albums?: AlbumItem[];
  stats: UserStats;
  location: { lat: number; lng: number } | null;
  lastSeen?: number;
}

export interface ChatMessage {
  chatId: string;
  from: string;
  displayName: string;
  text: string;
  timestamp: number;
}

export interface BangRequest {
  from: string;
  chatId: string;
  profile: UserProfile;
}

export interface ChatSession {
  chatId: string;
  withFingerprint: string;
  withDisplayName: string;
  messages: ChatMessage[];
}

export interface SearchFilters {
  bodyType?: string;
  ethnicity?: string;
  pronouns?: string;
  lookingFor?: string;
  tag?: string;
  maxDistanceKm?: number;
}
