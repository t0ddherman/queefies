import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, ChatMessage, BangRequest, ChatSession } from '../types';

interface AppState {
  fingerprint: string | null;
  myProfile: UserProfile | null;
  onlineUsers: Map<string, UserProfile>;
  favorites: string[];
  bangRequests: BangRequest[];
  chats: Map<string, ChatSession>;
  activeChatId: string | null;
  searchResults: UserProfile[];
  currentView: 'map' | 'profile' | 'search' | 'favorites' | 'chat';
  viewedProfile: UserProfile | null;
  isConnected: boolean;
}

type Action =
  | { type: 'SET_FINGERPRINT'; payload: string }
  | { type: 'SET_MY_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_MY_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UPSERT_ONLINE_USER'; payload: UserProfile }
  | { type: 'UPDATE_USER_LOCATION'; payload: { fingerprint: string; location: { lat: number; lng: number }; primaryPhoto?: string | null; displayName?: string } }
  | { type: 'REMOVE_ONLINE_USER'; payload: string }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'ADD_BANG_REQUEST'; payload: BangRequest }
  | { type: 'REMOVE_BANG_REQUEST'; payload: string }
  | { type: 'OPEN_CHAT'; payload: { chatId: string; withFingerprint: string; withDisplayName: string } }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_ACTIVE_CHAT'; payload: string | null }
  | { type: 'SET_SEARCH_RESULTS'; payload: UserProfile[] }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'SET_VIEWED_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_CONNECTED'; payload: boolean };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FINGERPRINT':
      return { ...state, fingerprint: action.payload };
    case 'SET_MY_PROFILE':
      return { ...state, myProfile: action.payload };
    case 'UPDATE_MY_PROFILE':
      return { ...state, myProfile: state.myProfile ? { ...state.myProfile, ...action.payload } : state.myProfile };
    case 'UPSERT_ONLINE_USER': {
      const next = new Map(state.onlineUsers);
      next.set(action.payload.fingerprint, action.payload);
      return { ...state, onlineUsers: next };
    }
    case 'UPDATE_USER_LOCATION': {
      const next = new Map(state.onlineUsers);
      const existing = next.get(action.payload.fingerprint);
      if (existing) {
        next.set(action.payload.fingerprint, { ...existing, location: action.payload.location, primaryPhoto: action.payload.primaryPhoto ?? existing.primaryPhoto, displayName: action.payload.displayName ?? existing.displayName });
      } else {
        next.set(action.payload.fingerprint, {
          fingerprint: action.payload.fingerprint,
          displayName: action.payload.displayName || 'Queefer',
          intro: '',
          primaryPhoto: action.payload.primaryPhoto ?? null,
          stats: { age: null, height: '', bodyType: '', ethnicity: '', pronouns: '', lookingFor: [], tags: [] },
          location: action.payload.location,
        });
      }
      return { ...state, onlineUsers: next };
    }
    case 'REMOVE_ONLINE_USER': {
      const next = new Map(state.onlineUsers);
      next.delete(action.payload);
      return { ...state, onlineUsers: next };
    }
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_BANG_REQUEST':
      return { ...state, bangRequests: [...state.bangRequests.filter(r => r.from !== action.payload.from), action.payload] };
    case 'REMOVE_BANG_REQUEST':
      return { ...state, bangRequests: state.bangRequests.filter(r => r.from !== action.payload) };
    case 'OPEN_CHAT': {
      const next = new Map(state.chats);
      if (!next.has(action.payload.chatId)) {
        next.set(action.payload.chatId, { chatId: action.payload.chatId, withFingerprint: action.payload.withFingerprint, withDisplayName: action.payload.withDisplayName, messages: [] });
      }
      return { ...state, chats: next, activeChatId: action.payload.chatId };
    }
    case 'ADD_MESSAGE': {
      const next = new Map(state.chats);
      const session = next.get(action.payload.chatId);
      if (session) {
        next.set(action.payload.chatId, { ...session, messages: [...session.messages, action.payload] });
      }
      return { ...state, chats: next };
    }
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChatId: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_VIEWED_PROFILE':
      return { ...state, viewedProfile: action.payload };
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    default:
      return state;
  }
}

const initialState: AppState = {
  fingerprint: null,
  myProfile: null,
  onlineUsers: new Map(),
  favorites: [],
  bangRequests: [],
  chats: new Map(),
  activeChatId: null,
  searchResults: [],
  currentView: 'map',
  viewedProfile: null,
  isConnected: false,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
