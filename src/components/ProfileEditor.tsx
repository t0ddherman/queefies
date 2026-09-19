import { useState, useRef } from 'react';
import { useQueefies } from '../hooks/useQueefies';
import type { UserStats, AlbumItem } from '../types';
import { Camera, Plus, X, Save } from 'lucide-react';

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'BBW', 'Butch', 'Femme'];
const ETHNICITIES = ['Asian', 'Black', 'Hispanic/Latina', 'Indigenous', 'Middle Eastern', 'Mixed', 'White', 'Other'];
const PRONOUNS_OPTIONS = ['she/her', 'they/them', 'she/they', 'any'];
const LOOKING_FOR_OPTIONS = ['Hookup', 'Dating', 'Friends', 'Relationship', 'Play Partner', 'Networking'];

export function ProfileEditor() {
  const { state, updateProfile } = useQueefies();
  const profile = state.myProfile;
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [intro, setIntro] = useState(profile?.intro || '');
  const [stats, setStats] = useState<UserStats>(profile?.stats || {
    age: null, height: '', bodyType: '', ethnicity: '', pronouns: '', lookingFor: [], tags: [],
  });
  const [primaryPhoto, setPrimaryPhoto] = useState<string | null>(profile?.primaryPhoto || null);
  const [albums, setAlbums] = useState<AlbumItem[]>(profile?.albums || []);
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  function toBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handlePrimaryPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setPrimaryPhoto(b64);
  }

  async function handleAlbumUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const items: AlbumItem[] = await Promise.all(
      files.map(async (f) => ({
        id: `${Date.now()}-${Math.random()}`,
        type: f.type.startsWith('video') ? 'video' : 'photo',
        url: await toBase64(f),
        caption: '',
      }))
    );
    setAlbums((prev) => [...prev, ...items]);
  }

  function toggleLookingFor(opt: string) {
    setStats((s) => ({
      ...s,
      lookingFor: s.lookingFor.includes(opt) ? s.lookingFor.filter((x) => x !== opt) : [...s.lookingFor, opt],
    }));
  }

  function addTag() {
    const t = newTag.trim();
    if (t && !stats.tags.includes(t)) {
      setStats((s) => ({ ...s, tags: [...s.tags, t] }));
    }
    setNewTag('');
  }

  function save() {
    updateProfile({ displayName, intro, primaryPhoto, albums, stats } as any);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px', color: '#fff' }}>
      <h2 style={{ color: '#e91e8c', marginBottom: 20 }}>My Profile</h2>

      {/* Primary photo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: '3px solid #e91e8c', cursor: 'pointer', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {primaryPhoto ? (
            <img src={primaryPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Primary" />
          ) : (
            <Camera size={40} color="#e91e8c" />
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePrimaryPhoto} />
        <span style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Tap to set primary photo</span>
      </div>

      {/* Basic info */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Display Name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} placeholder="Your name" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Intro</label>
        <textarea value={intro} onChange={(e) => setIntro(e.target.value)} style={{ ...inputStyle, height: 80, resize: 'vertical' }} placeholder="Tell people about yourself..." />
      </div>

      {/* Stats */}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Age</label>
        <input type="number" value={stats.age ?? ''} onChange={(e) => setStats((s) => ({ ...s, age: e.target.value ? Number(e.target.value) : null }))} style={inputStyle} placeholder="Age" />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Height</label>
        <input value={stats.height} onChange={(e) => setStats((s) => ({ ...s, height: e.target.value }))} style={inputStyle} placeholder="e.g. 5'6&quot;" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Body Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BODY_TYPES.map((bt) => (
            <ChipButton key={bt} label={bt} active={stats.bodyType === bt} onClick={() => setStats((s) => ({ ...s, bodyType: bt }))} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Ethnicity</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ETHNICITIES.map((e) => (
            <ChipButton key={e} label={e} active={stats.ethnicity === e} onClick={() => setStats((s) => ({ ...s, ethnicity: e }))} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Pronouns</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRONOUNS_OPTIONS.map((p) => (
            <ChipButton key={p} label={p} active={stats.pronouns === p} onClick={() => setStats((s) => ({ ...s, pronouns: p }))} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Looking For</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LOOKING_FOR_OPTIONS.map((lf) => (
            <ChipButton key={lf} label={lf} active={stats.lookingFor.includes(lf)} onClick={() => toggleLookingFor(lf)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tags</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag()} style={{ ...inputStyle, flex: 1 }} placeholder="Add a tag..." />
          <button onClick={addTag} style={smallBtnStyle}><Plus size={16} /></button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {stats.tags.map((tag) => (
            <span key={tag} style={{ background: '#333', color: '#fff', borderRadius: 12, padding: '4px 10px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              {tag}
              <X size={12} style={{ cursor: 'pointer' }} onClick={() => setStats((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) }))} />
            </span>
          ))}
        </div>
      </div>

      {/* Albums */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Photo / Video Albums</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {albums.map((item) => (
            <div key={item.id} style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '2px solid #333' }}>
              {item.type === 'photo' ? (
                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              ) : (
                <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button
                onClick={() => setAlbums((prev) => prev.filter((a) => a.id !== item.id))}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <div onClick={() => albumInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed #555', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={24} color="#555" />
          </div>
        </div>
        <input ref={albumInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleAlbumUpload} />
      </div>

      <button onClick={save} style={{ width: '100%', background: '#e91e8c', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Save size={18} /> {saved ? 'Saved! ✓' : 'Save Profile'}
      </button>
    </div>
  );
}

function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ background: active ? '#e91e8c' : '#333', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6, fontWeight: 600 };
const inputStyle: React.CSSProperties = { width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', fontSize: 15, boxSizing: 'border-box' };
const smallBtnStyle: React.CSSProperties = { background: '#e91e8c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
