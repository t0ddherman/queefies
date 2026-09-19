import { useQueefies } from '../hooks/useQueefies';
import { Heart, X } from 'lucide-react';

export function FavoritesView() {
  const { state, viewProfile, removeFavorite } = useQueefies();


  return (
    <div style={{ padding: 16, color: '#fff' }}>
      <h2 style={{ color: '#e91e8c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Heart size={22} fill="#e91e8c" color="#e91e8c" /> Favorites
      </h2>

      {state.favorites.length === 0 && (
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No favorites yet.<br/>Heart a Queefer to add them here!</p>
      )}

      {state.favorites.map((fp) => {
        const user = state.onlineUsers.get(fp);
        const isOnline = !!user?.location;
        return (
          <div key={fp} style={{ display: 'flex', gap: 12, background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => viewProfile(fp)}>
            <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e91e8c' }}>
                {user?.primaryPhoto ? <img src={user.primaryPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🥩</div>}
              </div>
              {isOnline && <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, background: '#4caf50', borderRadius: '50%', border: '2px solid #111' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{user?.displayName || `Queefer_${fp.slice(0, 6)}`}</div>
              <div style={{ color: '#aaa', fontSize: 13 }}>{isOnline ? '🟢 Online' : '⚫ Offline'}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); removeFavorite(fp); }}
              style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
