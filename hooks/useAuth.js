import { useState } from 'react';

const API_KEY    = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const AUTH_URL   = 'https://identitytoolkit.googleapis.com/v1/accounts';
const FIRESTORE  = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function parseError(msg = '') {
  const map = {
    'EMAIL_NOT_FOUND':           'No account found with this email.',
    'INVALID_PASSWORD':          'Incorrect password.',
    'INVALID_LOGIN_CREDENTIALS': 'Invalid email or password.',
    'USER_DISABLED':             'This account has been disabled.',
    'EMAIL_EXISTS':              'An account with this email already exists.',
    'WEAK_PASSWORD':             'Password must be at least 6 characters.',
    'TOO_MANY_ATTEMPTS_TRY_LATER': 'Too many attempts. Try again later.',
    'MISSING_EMAIL':             'Please enter your email.',
    'INVALID_EMAIL':             'Invalid email address.',
  };
  const key = msg.split(' :')[0].trim();
  return map[key] ?? 'Something went wrong. Please try again.';
}

async function authRequest(endpoint, email, password) {
  const res = await fetch(`${AUTH_URL}:${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Auth failed');
  return data;
}

async function fetchProfile(uid) {
  try {
    const res = await fetch(`${FIRESTORE}/users/${uid}`);
    if (!res.ok) return {};
    const data = await res.json();
    const f = data.fields ?? {};
    return {
      name:  f.name?.stringValue  ?? '',
      phone: f.phone?.stringValue ?? '',
      city:  f.city?.stringValue  ?? '',
    };
  } catch {
    return {};
  }
}

async function saveProfile(uid, idToken, profile) {
  // Update display name in Firebase Auth
  await fetch(`${AUTH_URL}:update?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, displayName: profile.name, returnSecureToken: false }),
  });
  // Save to Firestore
  await fetch(`${FIRESTORE}/users/${uid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        name:      { stringValue: profile.name  ?? '' },
        phone:     { stringValue: profile.phone ?? '' },
        city:      { stringValue: profile.city  ?? '' },
        email:     { stringValue: profile.email ?? '' },
        createdAt: { timestampValue: profile.createdAt ?? new Date().toISOString() },
      },
    }),
  });
}

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data    = await authRequest('signInWithPassword', email, password);
      const profile = await fetchProfile(data.localId);
      setUser({
        email:   data.email,
        uid:     data.localId,
        idToken: data.idToken,
        name:    profile.name  || data.displayName || '',
        phone:   profile.phone || '',
        city:    profile.city  || '',
      });
      return true;
    } catch (e) {
      setError(parseError(e.message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, profile = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authRequest('signUp', email, password);
      await saveProfile(data.localId, data.idToken, { ...profile, email });
      setUser({
        email:   data.email,
        uid:     data.localId,
        idToken: data.idToken,
        name:    profile.name  ?? '',
        phone:   profile.phone ?? '',
        city:    profile.city  ?? '',
      });
      return true;
    } catch (e) {
      setError(parseError(e.message));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return false;
    try {
      await saveProfile(user.uid, user.idToken, { ...user, ...updates });
      setUser(prev => ({ ...prev, ...updates }));
      return true;
    } catch {
      return false;
    }
  };

  const signOut   = () => { setUser(null); setError(null); };
  const clearError = () => setError(null);

  return { user, loading, error, signIn, signUp, signOut, updateProfile, clearError };
}
