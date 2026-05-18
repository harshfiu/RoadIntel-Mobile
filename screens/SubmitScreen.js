import { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../context/ThemeContext';

const PROJECT_ID    = 'roadintel-e9555';
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/pothole_reports`;

export default function SubmitScreen({ imageUri, onDone, onBack }) {
  const [location,   setLocation]   = useState(null);
  const [locError,   setLocError]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => { fetchLocation(); }, []);

  const fetchLocation = async () => {
    setLocError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocError('Location permission denied. Enable in Settings → RoadIntel.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(pos.coords);
    } catch {
      setLocError('Could not get GPS fix. Make sure Location Services are on.');
    }
  };

  const handleSubmit = async () => {
    if (!location) { Alert.alert('GPS Needed', 'Wait for GPS fix or tap Retry.'); return; }
    setSubmitting(true);
    try {
      const base64   = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
      const imageUrl = `data:image/jpeg;base64,${base64}`;

      const res = await fetch(FIRESTORE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            imageUrl:  { stringValue: imageUrl },
            latitude:  { doubleValue: location.latitude },
            longitude: { doubleValue: location.longitude },
            accuracy:  { doubleValue: location.accuracy },
            timestamp: { timestampValue: new Date().toISOString() },
            status:    { stringValue: 'Reported' },
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDone(true);
    } catch (e) {
      console.error(e);
      Alert.alert('Submission Failed', 'Check your internet connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={[styles.successSafe, { backgroundColor: theme.bg }]}>
        <View style={styles.successContent}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheckmark}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: isDark ? '#34D399' : '#15803D' }]}>
            Report Submitted!
          </Text>
          <Text style={[styles.successBody, { color: theme.textSecondary }]}>
            Your report has been sent to the authorities. Our AI will analyse
            severity and assign a repair team based on priority.
          </Text>
          <TouchableOpacity style={[styles.homeBtn, { backgroundColor: theme.accent }]} onPress={onDone}>
            <Text style={styles.homeBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>

      {/* Header — always dark navy */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Submit</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={[styles.label, { color: theme.textMuted }]}>PHOTO PREVIEW</Text>
        <Image
          source={{ uri: imageUri }}
          style={[styles.preview, { backgroundColor: theme.surface }]}
          resizeMode="cover"
        />

        <Text style={[styles.label, { color: theme.textMuted }]}>GPS LOCATION</Text>
        <View style={[styles.locCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {location ? (
            <>
              <View style={styles.locRow}>
                <Text style={styles.locPin}>📍</Text>
                <View>
                  <Text style={[styles.locCoords, { color: theme.textPrimary }]}>
                    {location.latitude.toFixed(6)},{'\n'}{location.longitude.toFixed(6)}
                  </Text>
                  <Text style={[styles.locAccuracy, { color: theme.textMuted }]}>
                    Accuracy: ±{Math.round(location.accuracy)} m
                  </Text>
                </View>
              </View>
              <View style={[
                styles.locBadge,
                { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#DCFCE7' },
              ]}>
                <Text style={[styles.locBadgeText, { color: isDark ? '#34D399' : '#16A34A' }]}>
                  ✓  Location Captured
                </Text>
              </View>
            </>
          ) : locError ? (
            <View>
              <Text style={[styles.locError, { color: isDark ? '#FF6B6B' : '#DC2626' }]}>{locError}</Text>
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: theme.accentSoft }]}
                onPress={fetchLocation}
              >
                <Text style={[styles.retryBtnText, { color: theme.accentText }]}>Retry GPS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locLoading}>
              <ActivityIndicator color={theme.accent} />
              <Text style={[styles.locLoadingText, { color: theme.textSecondary }]}>
                Acquiring GPS signal…
              </Text>
            </View>
          )}
        </View>

        <View style={[
          styles.note,
          {
            backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
            borderColor:     isDark ? 'rgba(245,158,11,0.25)' : '#FDE68A',
          },
        ]}>
          <Text style={[styles.noteText, { color: isDark ? '#FBBF24' : '#92400E' }]}>
            ℹ️  After submission the AI system will classify severity and add this report
            to the authority dashboard for prioritised dispatch.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: theme.accent, shadowColor: theme.accent },
            (!location || submitting) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!location || submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Report</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    backgroundColor: '#1a2236', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { width: 60 },
  backText:    { color: '#fff', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  scroll: { padding: 24, paddingBottom: 48, gap: 12 },
  label:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginTop: 12 },
  preview: { width: '100%', height: 220, borderRadius: 16 },

  locCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  locRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locPin:  { fontSize: 26 },
  locCoords:    { fontSize: 13, fontWeight: '600' },
  locAccuracy:  { fontSize: 12, marginTop: 2 },
  locBadge: {
    marginTop: 10, borderRadius: 8,
    paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start',
  },
  locBadgeText:   { fontSize: 12, fontWeight: '600' },
  locLoading:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locLoadingText: { fontSize: 14 },
  locError:       { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  retryBtn:     { borderRadius: 8, padding: 10, alignItems: 'center' },
  retryBtnText: { fontWeight: '600', fontSize: 14 },

  note: { borderRadius: 12, padding: 14, borderWidth: 1, marginTop: 4 },
  noteText: { fontSize: 13, lineHeight: 19 },

  submitBtn: {
    borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 12,
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },
  submitBtnText:     { color: '#fff', fontSize: 18, fontWeight: '700' },

  successSafe:    { flex: 1 },
  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  successCheckmark: { color: '#fff', fontSize: 48, fontWeight: '800', lineHeight: 56 },
  successTitle: { fontSize: 26, fontWeight: '800', marginBottom: 12 },
  successBody:  { fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 32 },
  homeBtn:      { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40 },
  homeBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
