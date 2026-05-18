import { useState, useEffect, useCallback } from 'react';

const PROJECT_ID    = 'roadintel-e9555';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/pothole_reports`;

// ── Mock ML (deterministic per doc ID) ───────────────────────────
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  return (Math.abs(hash) % 100000) / 100000;
}

function getUrgency(id) {
  const r = seededRandom(id + '_td');
  if (r > 0.65) return 'High';
  if (r > 0.30) return 'Medium';
  return 'Low';
}

// ── Parse Firestore REST document ────────────────────────────────
function parseDoc(doc) {
  const id = doc.name.split('/').pop();
  const f  = doc.fields ?? {};
  return {
    id,
    imageUrl:  f.imageUrl?.stringValue  ?? null,
    latitude:  f.latitude?.doubleValue  ?? null,
    longitude: f.longitude?.doubleValue ?? null,
    status:    f.status?.stringValue    ?? 'Reported',
    assignedTo: f.assignedTo?.stringValue ?? null,
    timestamp: f.timestamp?.timestampValue
      ? new Date(f.timestamp.timestampValue)
      : null,
    urgency: getUrgency(id),
  };
}

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const res  = await fetch(FIRESTORE_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const docs = (data.documents ?? []).map(parseDoc);
      // Sort: High first, then Medium, then Low
      const ORDER = { High: 0, Medium: 1, Low: 2 };
      docs.sort((a, b) => ORDER[a.urgency] - ORDER[b.urgency]);
      setReports(docs);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const id = setInterval(fetchReports, 15000);
    return () => clearInterval(id);
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}
