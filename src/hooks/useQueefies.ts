import { useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { getFingerprint } from '../utils/fingerprint';
import { watchPosition, vibrate } from '../utils/geo';
import { useAppStore } from '../store/AppContext';
import type { UserProfile, ChatMessage, BangRequest } from '../types';

export function useQueefies() {
  const { state, dispatch } = useAppStore();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const socket = getSocket();

    async function init() {
      const fingerprint = await getFingerprint();
      dispatch({ type: 'SET_FINGERPRINT', payload: fingerprint });

      const savedProfile = localStorage.getItem('qf_profile');
      const profileData = savedProfile ? JSON.parse(savedProfile) : undefined;

      socket.emit('register', { fingerprint, profile: profileData });
    }

    socket.on('connect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: true });
      init();
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    socket.on('registered', (data: { profile: UserProfile }) => {
      dispatch({ type: 'SET_MY_PROFILE', payload: data.profile });
      dispatch({ type: 'SET_FAVORITES', payload: (data.profile as any).favorites || [] });
      localStorage.setItem('qf_profile', JSON.stringify(data.profile));
      startLocationWatch();
    });

    socket.on('profile_updated', (data: { profile: UserProfile }) => {
      dispatch({ type: 'SET_MY_PROFILE', payload: data.profile });
      localStorage.setItem('qf_profile', JSON.stringify(data.profile));
    });

    socket.on('users_snapshot', (users: UserProfile[]) => {
      users.forEach((u) => dispatch({ type: 'UPSERT_ONLINE_USER', payload: u }));
    });

    socket.on('user_location_update', (data: { fingerprint: string; location: { lat: number; lng: number }; primaryPhoto?: string | null; displayName?: string }) => {
      dispatch({ type: 'UPDATE_USER_LOCATION', payload: data });
    });

    socket.on('user_offline', (data: { fingerprint: string }) => {
      dispatch({ type: 'REMOVE_ONLINE_USER', payload: data.fingerprint });
    });

    socket.on('nearby_user', (data: { fingerprint: string; distance: number; profile: UserProfile }) => {
      vibrate([200, 100, 200]);
      dispatch({ type: 'UPSERT_ONLINE_USER', payload: data.profile });
    });

    socket.on('bang_request', (data: BangRequest) => {
      vibrate([300, 150, 300, 150, 300]);
      dispatch({ type: 'ADD_BANG_REQUEST', payload: data });
    });

    socket.on('bang_accepted', (data: { chatId: string; byFingerprint: string }) => {
      const user = state.onlineUsers.get(data.byFingerprint);
      dispatch({
        type: 'OPEN_CHAT',
        payload: { chatId: data.chatId, withFingerprint: data.byFingerprint, withDisplayName: user?.displayName || 'Queefer' },
      });
      dispatch({ type: 'SET_VIEW', payload: 'chat' });
    });

    socket.on('bang_request_sent', (_data: { chatId: string; toFingerprint: string }) => {
      // Optimistically open chat
    });

    socket.on('new_message', (msg: ChatMessage) => {
      dispatch({ type: 'ADD_MESSAGE', payload: msg });
    });

    socket.on('search_results', (results: UserProfile[]) => {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    });

    socket.on('profile_data', (profile: UserProfile) => {
      dispatch({ type: 'SET_VIEWED_PROFILE', payload: profile });
      dispatch({ type: 'SET_VIEW', payload: 'profile' });
    });

    socket.on('favorites_updated', (data: { favorites: string[] }) => {
      dispatch({ type: 'SET_FAVORITES', payload: data.favorites });
    });

    if (socket.connected) {
      init();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startLocationWatch() {
    if (watchIdRef.current !== null) return;
    watchIdRef.current = watchPosition(
      (pos) => {
        const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        dispatch({ type: 'UPDATE_MY_PROFILE', payload: { location } });
        getSocket().emit('update_location', location);
      },
      (err) => {
        console.warn('Geolocation error:', err);
      }
    );
  }

  function updateProfile(data: Partial<UserProfile['stats'] & Pick<UserProfile, 'displayName' | 'intro' | 'primaryPhoto' | 'albums'>>) {
    getSocket().emit('update_profile', data);
  }

  function sendBangRequest(toFingerprint: string) {
    getSocket().emit('send_bang_request', { toFingerprint });
  }

  function acceptBang(chatId: string, fromFingerprint: string) {
    getSocket().emit('accept_bang', { chatId, fromFingerprint });
    const user = state.onlineUsers.get(fromFingerprint);
    dispatch({
      type: 'OPEN_CHAT',
      payload: { chatId, withFingerprint: fromFingerprint, withDisplayName: user?.displayName || 'Queefer' },
    });
    dispatch({ type: 'REMOVE_BANG_REQUEST', payload: fromFingerprint });
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
  }

  function declineBang(fromFingerprint: string) {
    dispatch({ type: 'REMOVE_BANG_REQUEST', payload: fromFingerprint });
  }

  function sendMessage(chatId: string, text: string) {
    getSocket().emit('send_message', { chatId, text });
  }

  function addFavorite(targetFingerprint: string) {
    getSocket().emit('add_favorite', { targetFingerprint });
  }

  function removeFavorite(targetFingerprint: string) {
    getSocket().emit('remove_favorite', { targetFingerprint });
  }

  function searchUsers(filters: object) {
    const location = state.myProfile?.location;
    getSocket().emit('search_users', { ...filters, myLocation: location });
  }

  function viewProfile(fingerprint: string) {
    getSocket().emit('get_profile', { fingerprint });
  }

  function openChat(chatId: string, withFingerprint: string, withDisplayName: string) {
    dispatch({ type: 'OPEN_CHAT', payload: { chatId, withFingerprint, withDisplayName } });
    dispatch({ type: 'SET_VIEW', payload: 'chat' });
  }

  return {
    state,
    dispatch,
    updateProfile,
    sendBangRequest,
    acceptBang,
    declineBang,
    sendMessage,
    addFavorite,
    removeFavorite,
    searchUsers,
    viewProfile,
    openChat,
  };
}
