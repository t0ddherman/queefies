import { useQueefies } from './hooks/useQueefies';
import { AppProvider } from './store/AppContext';
import { MapView } from './components/MapView';
import { ProfileEditor } from './components/ProfileEditor';
import { UserProfileView } from './components/UserProfileView';
import { ChatView } from './components/ChatView';
import { SearchView } from './components/SearchView';
import { FavoritesView } from './components/FavoritesView';
import { BangRequestOverlay } from './components/BangRequestOverlay';
import { BottomNav } from './components/BottomNav';

function AppInner() {
  const { state } = useQueefies();

  const renderView = () => {
    if (state.viewedProfile) return <UserProfileView />;
    switch (state.currentView) {
      case 'map': return <MapView />;
      case 'profile': return <ProfileEditor />;
      case 'search': return <SearchView />;
      case 'favorites': return <FavoritesView />;
      case 'chat': return <ChatView />;
      default: return <MapView />;
    }
  };

  const isMapView = state.currentView === 'map' && !state.viewedProfile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0a0a0a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#111', borderBottom: '1px solid #222', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🌸</span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#e91e8c', letterSpacing: -0.5 }}>Queefies</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {state.bangRequests.length > 0 && (
            <span style={{ background: '#e91e8c', color: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 700, animation: 'pulse 1s infinite' }}>
              💥 {state.bangRequests.length} bang{state.bangRequests.length > 1 ? 's' : ''}
            </span>
          )}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: state.isConnected ? '#4caf50' : '#f44336' }} title={state.isConnected ? 'Connected' : 'Disconnected'} />
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: isMapView ? 'hidden' : 'auto', position: 'relative' }}>
        {renderView()}
      </main>

      {/* Bottom nav */}
      <BottomNav />

      {/* Bang request overlay */}
      <BangRequestOverlay />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
