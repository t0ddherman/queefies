import { useQueefies } from '../hooks/useQueefies';
import type { BangRequest } from '../types';

export function BangRequestOverlay() {
  const { state, acceptBang, declineBang } = useQueefies();

  if (state.bangRequests.length === 0) return null;

  const req: BangRequest = state.bangRequests[0];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', borderRadius: 20, padding: 28, maxWidth: 340, width: '90%', textAlign: 'center', border: '2px solid #e91e8c' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💥</div>
        <h2 style={{ color: '#e91e8c', marginBottom: 8 }}>Bang Request!</h2>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid #e91e8c', margin: '0 auto 12px' }}>
          {req.profile.primaryPhoto ? (
            <img src={req.profile.primaryPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🥩</div>
          )}
        </div>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{req.profile.displayName}</p>
        <p style={{ color: '#aaa', fontSize: 14, marginBottom: 24 }}>wants to chat with you!</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => declineBang(req.from)}
            style={{ flex: 1, background: '#333', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, cursor: 'pointer' }}
          >
            Ignore
          </button>
          <button
            onClick={() => acceptBang(req.chatId, req.from)}
            style={{ flex: 1, background: '#e91e8c', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
          >
            Accept 💬
          </button>
        </div>
      </div>
    </div>
  );
}
