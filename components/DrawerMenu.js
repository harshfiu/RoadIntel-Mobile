import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';

const DOT_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };

export default function DrawerMenu({ visible, onClose, onNavigate }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Tap outside to close */}
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        {/* Drawer panel */}
        <View style={styles.drawer}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logo}>
                <View style={styles.shield}>
                  <Text style={styles.shieldText}>R</Text>
                </View>
                <Text style={styles.logoText}>RoadIntel</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Dashboard */}
            <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('dashboard')} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>⊞</Text>
              <Text style={styles.menuLabel}>Dashboard</Text>
            </TouchableOpacity>

            {/* Map */}
            <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('map')} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>📍</Text>
              <Text style={styles.menuLabel}>Map</Text>
            </TouchableOpacity>

            {/* Reports */}
            <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('reports')} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>⚠️</Text>
              <Text style={styles.menuLabel}>Reports</Text>
            </TouchableOpacity>
            {['High', 'Medium', 'Low'].map(level => (
              <TouchableOpacity
                key={`reports-${level}`}
                style={styles.subItem}
                onPress={() => onNavigate('reports', level)}
                activeOpacity={0.7}
              >
                <View style={[styles.subDot, { backgroundColor: DOT_COLOR[level] }]} />
                <Text style={styles.subLabel}>{level} Priority</Text>
              </TouchableOpacity>
            ))}

            {/* Settings */}
            <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('settings')} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuLabel}>Settings</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#1a2236',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shield: {
    width: 30, height: 30, borderRadius: 7,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
  },
  shieldText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 17, letterSpacing: 0.3 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIcon:  { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel: { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },

  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 9,
    paddingLeft: 58,
  },
  subDot:  { width: 8, height: 8, borderRadius: 4 },
  subLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
});
