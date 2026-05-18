import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>RoadIntel</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🛣️</Text>
          </View>
          <Text style={styles.title}>RoadIntel</Text>
          <Text style={styles.subtitle}>
            Help your city fix roads faster. Photograph a pothole and our AI will
            automatically analyse severity and alert repair teams.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Capture')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>📷  Report a Pothole</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>HOW IT WORKS</Text>
          {[
            ['1', 'Take or select a photo of the pothole'],
            ['2', 'GPS location is captured automatically'],
            ['3', 'Report is sent to authorities in real-time'],
            ['4', 'AI ranks severity so urgent repairs happen first'],
          ].map(([n, text]) => (
            <View key={n} style={styles.step}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{n}</Text>
              </View>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  container: { padding: 24, paddingBottom: 40, gap: 20 },

  hero: { alignItems: 'center', paddingVertical: 24 },
  logoCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  logoEmoji: { fontSize: 46 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E3A5F', marginBottom: 10 },
  subtitle: {
    fontSize: 15, color: '#64748B', textAlign: 'center',
    lineHeight: 23, paddingHorizontal: 8,
  },

  primaryBtn: {
    backgroundColor: '#2563EB', borderRadius: 16, padding: 18, alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 14,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  stepBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  stepBadgeText: { color: '#2563EB', fontWeight: '700', fontSize: 12 },
  stepText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
});
