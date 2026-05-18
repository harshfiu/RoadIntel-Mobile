import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'map',       label: 'Map',       icon: '📍' },
  { id: 'reports',   label: 'Reports',   icon: '⚠️' },
  { id: 'settings',  label: 'Settings',  icon: '⚙️' },
];

export default function BottomTabBar({ activeTab, onTabChange }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: theme.tabBg, borderTopColor: theme.tabBorder }]}>
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            {active && <View style={[styles.indicator, { backgroundColor: theme.tabActive }]} />}
            <Text style={[styles.icon, { opacity: active ? 1 : 0.38 }]}>{tab.icon}</Text>
            <Text style={[
              styles.label,
              { color: active ? theme.tabActive : theme.tabInactive, fontWeight: active ? '700' : '500' },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 4, position: 'relative', paddingTop: 4,
  },
  indicator: {
    position: 'absolute',
    top: -12,
    width: 28,
    height: 3,
    borderRadius: 1.5,
  },
  icon:  { fontSize: 20 },
  label: { fontSize: 10 },
});
