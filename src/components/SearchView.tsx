import { useState } from 'react';
import { useQueefies } from '../hooks/useQueefies';
import { Search as SearchIcon } from 'lucide-react';
import type { UserProfile } from '../types';

const BODY_TYPES = ['', 'Slim', 'Athletic', 'Average', 'Curvy', 'BBW', 'Butch', 'Femme'];
const ETHNICITIES = ['', 'Asian', 'Black', 'Hispanic/Latina', 'Indigenous', 'Middle Eastern', 'Mixed', 'White', 'Other'];
const PRONOUNS_OPTIONS = ['', 'she/her', 'they/them', 'she/they', 'any'];
const LOOKING_FOR_OPTIONS = ['', 'Hookup', 'Dating', 'Friends', 'Relationship', 'Play Partner', 'Networking'];

export function SearchView() {
  const { state, searchUsers, viewProfile, addFavorite, removeFavorite } = useQueefies();
  const [filters, setFilters] = useState({ bodyType: '', ethnicity: '', pronouns: '', lookingFor: '', tag: '', maxDistanceKm: '' });

  function doSearch() {
    const cleaned: Record<string, string | number> = {};
    if (filters.bodyType) cleaned.bodyType = filters.bodyType;
    if (filters.ethnicity) cleaned.ethnicity = filters.ethnicity;
    if (filters.pronouns) cleaned.pronouns = filters.pronouns;
    if (filters.lookingFor) cleaned.lookingFor = filters.lookingFor;
    if (filters.tag) cleaned.tag = filters.tag;
    if (filters.maxDistanceKm) cleaned.maxDistanceKm = Number(filters.maxDistanceKm);
    searchUsers(cleaned);
  }

  return (
    <div style={{ padding: 16, color: '#fff' }}>
      <h2 style={{ color: '#e91e8c', marginBottom: 16 }}>Find Queefers</h2>

      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <FilterSelect label="Body Type" value={filters.bodyType} options={BODY_TYPES} onChange={(v) => setFilters((f) => ({ ...f, bodyType: v }))} />
        <FilterSelect label="Ethnicity" value={filters.ethnicity} options={ETHNICITIES} onChange={(v) => setFilters((f) => ({ ...f, ethnicity: v }))} />
        <FilterSelect label="Pronouns" value={filters.pronouns} options={PRONOUNS_OPTIONS} onChange={(v) => setFilters((f) => ({ ...f, pronouns: v }))} />
        <FilterSelect label="Looking For" value={filters.lookingFor} options={LOOKING_FOR_OPTIONS} onChange={(v) => setFilters((f) => ({ ...f, lookingFor: v }))} />
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 4 }}>Tag</label>
          <input value={filters.tag} onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))} style={inputStyle} placeholder="e.g. vegan, outdoor" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 4 }}>Max Distance (km)</label>
          <input type="number" value={filters.maxDistanceKm} onChange={(e) => setFilters((f) => ({ ...f, maxDistanceKm: e.target.value }))} style={inputStyle} placeholder="e.g. 10" />
        </div>
        <button onClick={doSearch} style={{ width: '100%', background: '#e91e8c', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <SearchIcon size={16} /> Search
        </button>
      </div>

      {state.searchResults.length === 0 && (
        <p style={{ color: '#aaa', textAlign: 'center' }}>No results. Try different filters!</p>
      )}

      {state.searchResults.map((user: UserProfile) => {
        const isFav = state.favorites.includes(user.fingerprint);
        return (
          <div key={user.fingerprint} style={{ display: 'flex', gap: 12, background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center', cursor: 'pointer' }} onClick={() => viewProfile(user.fingerprint)}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid #e91e8c', flexShrink: 0 }}>
              {user.primaryPhoto ? <img src={user.primaryPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🥩</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{user.displayName}</div>
              <div style={{ color: '#aaa', fontSize: 13 }}>
                {[user.stats.bodyType, user.stats.pronouns, user.stats.lookingFor.join('/')].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); isFav ? removeFavorite(user.fingerprint) : addFavorite(user.fingerprint); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
        {options.map((o) => <option key={o} value={o}>{o || `Any ${label}`}</option>)}
      </select>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' };
