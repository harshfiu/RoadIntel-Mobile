import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

export default function CaptureScreen({ onImageCaptured, onBack }) {
  const [permissionGranted, setPermissionGranted] = useState(null);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    (async () => {
      const cam   = await ImagePicker.requestCameraPermissionsAsync();
      const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissionGranted(cam.status === 'granted' && media.status === 'granted');
    })();
  }, []);

  const handleCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images', allowsEditing: true, aspect: [4, 3], quality: 0.75,
      });
      if (!result.canceled && result.assets?.[0]) onImageCaptured(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'Could not open camera. Please try again.');
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', allowsEditing: true, aspect: [4, 3], quality: 0.75,
      });
      if (!result.canceled && result.assets?.[0]) onImageCaptured(result.assets[0].uri);
    } catch {
      Alert.alert('Error', 'Could not open gallery. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>

      {/* Header — always dark navy */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Capture Pothole</Text>
        <View style={{ width: 60 }} />
      </View>

      {permissionGranted === null && (
        <View style={styles.centered}>
          <Text style={[styles.mutedText, { color: theme.textMuted }]}>Requesting permissions…</Text>
        </View>
      )}

      {permissionGranted === false && (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Permissions Required</Text>
          <Text style={[styles.errorBody, { color: theme.textSecondary }]}>
            Enable Camera & Photo Library access in Settings → RoadIntel.
          </Text>
        </View>
      )}

      {permissionGranted === true && (
        <View style={styles.container}>
          <View style={[
            styles.tipsCard,
            {
              backgroundColor: theme.accentSoft,
              borderColor: isDark ? 'rgba(59,130,246,0.28)' : '#BFDBFE',
            },
          ]}>
            <Text style={[styles.tipsTitle, { color: theme.accentText }]}>📸  Tips for a good photo</Text>
            <Text style={[styles.tipItem, { color: theme.accentText }]}>• Position the camera directly above the pothole</Text>
            <Text style={[styles.tipItem, { color: theme.accentText }]}>• Ensure the full pothole is in frame</Text>
            <Text style={[styles.tipItem, { color: theme.accentText }]}>• Good lighting improves AI accuracy</Text>
          </View>

          <TouchableOpacity
            style={[styles.cameraBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
            onPress={handleCamera}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}>📷</Text>
            <Text style={styles.btnLabel}>Take Photo</Text>
            <Text style={[styles.btnSub, { color: 'rgba(255,255,255,0.7)' }]}>Open device camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.galleryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleGallery}
            activeOpacity={0.85}
          >
            <Text style={styles.btnIcon}>🖼️</Text>
            <Text style={[styles.btnLabelAlt, { color: theme.textPrimary }]}>Choose from Gallery</Text>
            <Text style={[styles.btnSubAlt, { color: theme.textMuted }]}>Select an existing photo</Text>
          </TouchableOpacity>
        </View>
      )}

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

  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  mutedText:  { fontSize: 15 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#DC2626', marginBottom: 10 },
  errorBody:  { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  tipsCard: { borderRadius: 14, padding: 18, borderWidth: 1 },
  tipsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  tipItem:   { fontSize: 13, lineHeight: 22 },

  cameraBtn: {
    borderRadius: 18, padding: 24, alignItems: 'center',
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  galleryBtn: { borderRadius: 18, padding: 24, alignItems: 'center', borderWidth: 1 },

  btnIcon:    { fontSize: 44, marginBottom: 8 },
  btnLabel:   { color: '#fff', fontSize: 18, fontWeight: '700' },
  btnLabelAlt: { fontSize: 18, fontWeight: '700' },
  btnSub:     { fontSize: 13, marginTop: 4 },
  btnSubAlt:  { fontSize: 13, marginTop: 4 },
});
