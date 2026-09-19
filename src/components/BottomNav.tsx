import { useQueefies } from '../hooks/useQueefies';
import { Map, User, Search, Heart, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ViewName = 'map' | 'profile' | 'search' | 'favorites' | 'chat';

interface Tab {
  id: ViewName;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function BottomNav() {
  const { state, dispatch } = useQueefies();
  const unreadChats = Array.from(state.chats.values()).filter((c) => c.messages.length > 0).length;

  const tabs: Tab[] = [
    { id: 'map', label: 'Map', icon: Map },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'favorites', label: 'Faves', icon: Heart },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: unreadChats || undefined },
    { id: 'profile', label: 'Me', icon: User },
  ];

  return (
    <nav style={{ display: 'flex', background: '#111', borderTop: '1px solid #222', height: 64, flexShrink: 0 }}>
      {tabs.map(({ id, label, icon: Icon, badge }) => {
        const active = state.currentView === id;
        return (
          <button
            key={id}
            onClick={() => dispatch({ type: 'SET_VIEW', payload: id })}
            style={{ flex: 1, background: 'none', border: 'none', color: active ? '#e91e8c' : '#666', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} />
              {badge ? (
                <span style={{ position: 'absolute', top: -6, right: -6, background: '#e91e8c', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge}
                </span>
              ) : null}
            </div>
            <span style={{ fontSize: 10 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
