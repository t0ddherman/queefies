import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserProfile } from '../types';
import { useQueefies } from '../hooks/useQueefies';

// Roast beef SVG icon for users without a photo
const ROAST_BEEF_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="48" height="48">
  <ellipse cx="32" cy="36" rx="28" ry="18" fill="#c0392b"/>
  <ellipse cx="32" cy="30" rx="24" ry="14" fill="#e74c3c"/>
  <ellipse cx="32" cy="28" rx="20" ry="10" fill="#c0392b"/>
  <path d="M12 28 Q32 20 52 28" stroke="#a93226" stroke-width="2" fill="none"/>
  <path d="M14 32 Q32 24 50 32" stroke="#a93226" stroke-width="2" fill="none"/>
  <ellipse cx="32" cy="42" rx="28" ry="10" fill="#922b21" opacity="0.6"/>
</svg>`;

function makeIcon(primaryPhoto: string | null, displayName: string): L.DivIcon {
  if (primaryPhoto) {
    return L.divIcon({
      html: `<div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:3px solid #e91e8c;box-shadow:0 2px 8px rgba(0,0,0,0.4)">
        <img src="${primaryPhoto}" style="width:100%;height:100%;object-fit:cover" alt="${displayName}"/>
      </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      className: '',
    });
  }
  return L.divIcon({
    html: `<div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:3px solid #e91e8c;box-shadow:0 2px 8px rgba(0,0,0,0.4);background:#1a1a1a;display:flex;align-items:center;justify-content:center">
      ${ROAST_BEEF_SVG}
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    className: '',
  });
}

export function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const myMarkerRef = useRef<L.Marker | null>(null);
  const { state, sendBangRequest, viewProfile } = useQueefies();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [39.8283, -98.5795],
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update own marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !state.myProfile?.location) return;
    const { lat, lng } = state.myProfile.location;
    const icon = makeIcon(state.myProfile.primaryPhoto, state.myProfile.displayName);
    if (myMarkerRef.current) {
      myMarkerRef.current.setLatLng([lat, lng]).setIcon(icon);
    } else {
      myMarkerRef.current = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup('<b>You</b>');
      map.setView([lat, lng], 15);
    }
  }, [state.myProfile?.location, state.myProfile?.primaryPhoto]);

  // Update other users' markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const currentFingerprints = new Set<string>();

    state.onlineUsers.forEach((user: UserProfile) => {
      if (!user.location) return;
      currentFingerprints.add(user.fingerprint);
      const icon = makeIcon(user.primaryPhoto, user.displayName);
      const existing = markersRef.current.get(user.fingerprint);
      if (existing) {
        existing.setLatLng([user.location.lat, user.location.lng]).setIcon(icon);
      } else {
        const marker = L.marker([user.location.lat, user.location.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="text-align:center;min-width:120px">
            <b>${user.displayName}</b>
            <br/>
            <button id="bang-${user.fingerprint}" style="margin:4px;padding:4px 10px;background:#e91e8c;color:#fff;border:none;border-radius:12px;cursor:pointer">💥 Bang</button>
            <button id="view-${user.fingerprint}" style="margin:4px;padding:4px 10px;background:#333;color:#fff;border:none;border-radius:12px;cursor:pointer">👤 Profile</button>
          </div>
        `);
        marker.on('popupopen', () => {
          setTimeout(() => {
            document.getElementById(`bang-${user.fingerprint}`)?.addEventListener('click', () => {
              sendBangRequest(user.fingerprint);
              marker.closePopup();
            });
            document.getElementById(`view-${user.fingerprint}`)?.addEventListener('click', () => {
              viewProfile(user.fingerprint);
              marker.closePopup();
            });
          }, 100);
        });
        markersRef.current.set(user.fingerprint, marker);
      }
    });

    // Remove stale markers
    markersRef.current.forEach((marker, fp) => {
      if (!currentFingerprints.has(fp)) {
        marker.remove();
        markersRef.current.delete(fp);
      }
    });
  }, [state.onlineUsers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {!state.isConnected && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: '#e91e8c', color: '#fff', padding: '6px 16px', borderRadius: 20, zIndex: 1000, fontSize: 13 }}>
          Connecting...
        </div>
      )}
      {state.myProfile && !state.myProfile.location && (
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '8px 16px', borderRadius: 20, zIndex: 1000, fontSize: 13 }}>
          📍 Enable location to appear on the map
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '6px 12px', borderRadius: 12, zIndex: 1000, fontSize: 13 }}>
        {state.onlineUsers.size} Queefers nearby
      </div>
    </div>
  );
}
