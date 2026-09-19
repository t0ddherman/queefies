import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

interface UserProfile {
  fingerprint: string;
  socketId: string;
  displayName: string;
  intro: string;
  primaryPhoto: string | null;
  albums: AlbumItem[];
  stats: UserStats;
  location: { lat: number; lng: number } | null;
  favorites: string[];
  lastSeen: number;
}

interface AlbumItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
}

interface UserStats {
  age: number | null;
  height: string;
  bodyType: string;
  ethnicity: string;
  pronouns: string;
  lookingFor: string[];
  tags: string[];
}

// In-memory store
const users = new Map<string, UserProfile>();
const fingerToSocket = new Map<string, string>();

function getPublicProfile(u: UserProfile) {
  return {
    fingerprint: u.fingerprint,
    displayName: u.displayName,
    intro: u.intro,
    primaryPhoto: u.primaryPhoto,
    stats: u.stats,
    location: u.location,
    lastSeen: u.lastSeen,
  };
}

io.on('connection', (socket) => {
  let myFingerprint: string | null = null;

  socket.on('register', (data: { fingerprint: string; profile?: Partial<UserProfile> }) => {
    myFingerprint = data.fingerprint;

    const existing = users.get(myFingerprint);
    const profile: UserProfile = existing
      ? { ...existing, socketId: socket.id, lastSeen: Date.now() }
      : {
          fingerprint: myFingerprint,
          socketId: socket.id,
          displayName: data.profile?.displayName || `Queefer_${myFingerprint.slice(0, 6)}`,
          intro: data.profile?.intro || '',
          primaryPhoto: data.profile?.primaryPhoto || null,
          albums: data.profile?.albums || [],
          stats: data.profile?.stats || {
            age: null,
            height: '',
            bodyType: '',
            ethnicity: '',
            pronouns: '',
            lookingFor: [],
            tags: [],
          },
          location: null,
          favorites: data.profile?.favorites || [],
          lastSeen: Date.now(),
        };

    users.set(myFingerprint, profile);
    fingerToSocket.set(myFingerprint, socket.id);

    socket.emit('registered', { profile });

    // Send current map of all users with locations
    const onlineUsers = Array.from(users.values())
      .filter((u) => u.location && u.fingerprint !== myFingerprint)
      .map(getPublicProfile);
    socket.emit('users_snapshot', onlineUsers);
  });

  socket.on('update_location', (location: { lat: number; lng: number }) => {
    if (!myFingerprint) return;
    const user = users.get(myFingerprint);
    if (!user) return;
    user.location = location;
    user.lastSeen = Date.now();

    // Broadcast to all others
    socket.broadcast.emit('user_location_update', {
      fingerprint: myFingerprint,
      location,
      primaryPhoto: user.primaryPhoto,
      displayName: user.displayName,
    });

    // Check proximity with others
    for (const [fp, other] of users) {
      if (fp === myFingerprint || !other.location) continue;
      const dist = haversineMeters(location.lat, location.lng, other.location.lat, other.location.lng);
      if (dist < 100) {
        // Notify both
        socket.emit('nearby_user', { fingerprint: fp, distance: Math.round(dist), profile: getPublicProfile(other) });
        const otherSocket = fingerToSocket.get(fp);
        if (otherSocket) {
          io.to(otherSocket).emit('nearby_user', {
            fingerprint: myFingerprint,
            distance: Math.round(dist),
            profile: getPublicProfile(user),
          });
        }
      }
    }
  });

  socket.on('update_profile', (data: Partial<UserProfile>) => {
    if (!myFingerprint) return;
    const user = users.get(myFingerprint);
    if (!user) return;
    if (data.displayName !== undefined) user.displayName = data.displayName;
    if (data.intro !== undefined) user.intro = data.intro;
    if (data.primaryPhoto !== undefined) user.primaryPhoto = data.primaryPhoto;
    if (data.albums !== undefined) user.albums = data.albums;
    if (data.stats !== undefined) user.stats = { ...user.stats, ...data.stats };
    socket.emit('profile_updated', { profile: user });
  });

  socket.on('send_bang_request', (data: { toFingerprint: string }) => {
    if (!myFingerprint) return;
    const sender = users.get(myFingerprint);
    if (!sender) return;
    const targetSocket = fingerToSocket.get(data.toFingerprint);
    if (targetSocket) {
      const chatId = [myFingerprint, data.toFingerprint].sort().join('_');
      io.to(targetSocket).emit('bang_request', {
        from: myFingerprint,
        chatId,
        profile: getPublicProfile(sender),
      });
      socket.emit('bang_request_sent', { chatId, toFingerprint: data.toFingerprint });
    }
  });

  socket.on('accept_bang', (data: { chatId: string; fromFingerprint: string }) => {
    if (!myFingerprint) return;
    const fromSocket = fingerToSocket.get(data.fromFingerprint);
    if (fromSocket) {
      io.to(fromSocket).emit('bang_accepted', { chatId: data.chatId, byFingerprint: myFingerprint });
    }
    socket.emit('bang_accepted', { chatId: data.chatId, byFingerprint: myFingerprint });
    // Both join the chat room
    socket.join(data.chatId);
    if (fromSocket) {
      io.sockets.sockets.get(fromSocket)?.join(data.chatId);
    }
  });

  socket.on('send_message', (data: { chatId: string; text: string }) => {
    if (!myFingerprint) return;
    const user = users.get(myFingerprint);
    io.to(data.chatId).emit('new_message', {
      chatId: data.chatId,
      from: myFingerprint,
      displayName: user?.displayName || 'Queefer',
      text: data.text,
      timestamp: Date.now(),
    });
  });

  socket.on('add_favorite', (data: { targetFingerprint: string }) => {
    if (!myFingerprint) return;
    const user = users.get(myFingerprint);
    if (!user) return;
    if (!user.favorites.includes(data.targetFingerprint)) {
      user.favorites.push(data.targetFingerprint);
    }
    socket.emit('favorites_updated', { favorites: user.favorites });
  });

  socket.on('remove_favorite', (data: { targetFingerprint: string }) => {
    if (!myFingerprint) return;
    const user = users.get(myFingerprint);
    if (!user) return;
    user.favorites = user.favorites.filter((f) => f !== data.targetFingerprint);
    socket.emit('favorites_updated', { favorites: user.favorites });
  });

  socket.on('search_users', (filters: {
    bodyType?: string;
    ethnicity?: string;
    pronouns?: string;
    lookingFor?: string;
    tag?: string;
    maxDistanceKm?: number;
    myLocation?: { lat: number; lng: number };
  }) => {
    if (!myFingerprint) return;
    let results = Array.from(users.values()).filter((u) => u.fingerprint !== myFingerprint && u.location);

    if (filters.bodyType) results = results.filter((u) => u.stats.bodyType === filters.bodyType);
    if (filters.ethnicity) results = results.filter((u) => u.stats.ethnicity === filters.ethnicity);
    if (filters.pronouns) results = results.filter((u) => u.stats.pronouns === filters.pronouns);
    if (filters.lookingFor) results = results.filter((u) => u.stats.lookingFor.includes(filters.lookingFor!));
    if (filters.tag) results = results.filter((u) => u.stats.tags.includes(filters.tag!));
    if (filters.maxDistanceKm && filters.myLocation) {
      results = results.filter((u) => {
        if (!u.location) return false;
        return haversineMeters(filters.myLocation!.lat, filters.myLocation!.lng, u.location.lat, u.location.lng) / 1000 <= filters.maxDistanceKm!;
      });
    }
    socket.emit('search_results', results.map(getPublicProfile));
  });

  socket.on('get_profile', (data: { fingerprint: string }) => {
    const user = users.get(data.fingerprint);
    if (user) {
      socket.emit('profile_data', {
        ...getPublicProfile(user),
        albums: user.albums,
      });
    }
  });

  socket.on('disconnect', () => {
    if (myFingerprint) {
      const user = users.get(myFingerprint);
      if (user) {
        user.location = null;
        socket.broadcast.emit('user_offline', { fingerprint: myFingerprint });
      }
      fingerToSocket.delete(myFingerprint);
    }
  });
});

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Queefies server running on port ${PORT}`);
});
