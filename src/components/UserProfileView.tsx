
import { useQueefies } from '../hooks/useQueefies';

import { Heart, MessageCircle, X } from 'lucide-react';

export function UserProfileView() {
  const { state, dispatch, sendBangRequest, addFavorite, removeFavorite } = useQueefies();
  const profile = state.viewedProfile;

  if (!profile) return null;

  const isFav = state.favorites.includes(profile.fingerprint);


  function close() {
    dispatch({ type: 'SET_VIEWED_PROFILE', payload: null });
    dispatch({ type: 'SET_VIEW', payload: 'map' });
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: '#e91e8c', margin: 0 }}>{profile.displayName}</h2>
        <button onClick={close} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}><X size={24} /></button>
      </div>

      {/* Primary photo */}
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: '#1a1a1a' }}>
        {profile.primaryPhoto ? (
          <img src={profile.primaryPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={profile.displayName} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🥩</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => { sendBangRequest(profile.fingerprint); dispatch({ type: 'SET_VIEW', payload: 'map' }); }}
          style={{ flex: 1, background: '#e91e8c', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <MessageCircle size={18} /> Bang 💥
        </button>
        <button
          onClick={() => isFav ? removeFavorite(profile.fingerprint) : addFavorite(profile.fingerprint)}
          style={{ flex: 1, background: isFav ? '#c0392b' : '#333', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <Heart size={18} fill={isFav ? '#fff' : 'none'} /> {isFav ? 'Unfavorite' : 'Favorite'}
        </button>
      </div>

      {/* Intro */}
      {profile.intro && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 15 }}>
          {profile.intro}
        </div>
      )}

      {/* Stats */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <h4 style={{ color: '#e91e8c', margin: '0 0 10px' }}>Stats</h4>
        <StatRow label="Age" value={profile.stats.age?.toString() || '-'} />
        <StatRow label="Height" value={profile.stats.height || '-'} />
        <StatRow label="Body Type" value={profile.stats.bodyType || '-'} />
        <StatRow label="Ethnicity" value={profile.stats.ethnicity || '-'} />
        <StatRow label="Pronouns" value={profile.stats.pronouns || '-'} />
        {profile.stats.lookingFor.length > 0 && (
          <StatRow label="Looking For" value={profile.stats.lookingFor.join(', ')} />
        )}
      </div>

      {/* Tags */}
      {profile.stats.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {profile.stats.tags.map((tag) => (
            <span key={tag} style={{ background: '#333', color: '#fff', borderRadius: 12, padding: '4px 12px', fontSize: 13 }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Albums */}
      {(profile as any).albums?.length > 0 && (
        <div>
          <h4 style={{ color: '#e91e8c', marginBottom: 10 }}>Albums</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {(profile as any).albums.map((item: any) => (
              <div key={item.id} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: '#1a1a1a' }}>
                {item.type === 'photo' ? (
                  <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                ) : (
                  <video src={item.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #2a2a2a' }}>
      <span style={{ color: '#aaa', fontSize: 14 }}>{label}</span>
      <span style={{ color: '#fff', fontSize: 14 }}>{value}</span>
    </div>
  );
}
