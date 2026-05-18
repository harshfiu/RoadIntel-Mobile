import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function AppHeader({ title, showBell = true, onMenuPress, onBellPress }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {/* Hamburger */}
        <TouchableOpacity style={styles.iconBtn} onPress={onMenuPress}>
          <Text style={styles.hamburger}>≡</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logo}>
          <View style={styles.shield}>
            <Text style={styles.shieldText}>R</Text>
          </View>
          <Text style={styles.title}>{title ?? 'RoadIntel'}</Text>
        </View>

        {/* Bell */}
        {showBell ? (
          <TouchableOpacity style={styles.iconBtn} onPress={onBellPress}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.badge} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: '#1a2236' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1a2236',
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  hamburger: { color: '#fff', fontSize: 22, fontWeight: '300' },
  bell: { fontSize: 18 },
  badge: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5, borderColor: '#1a2236',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shield: {
    width: 26, height: 26, borderRadius: 6,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  shieldText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
});
