import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useTheme } from '../context/ThemeContext';

function timeAgo(date) {
  if (!date) return 'Just now';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Map dot color → light-mode icon background
const LIGHT_ICON_BG = { '#10B981': '#D1FAE5', '#F59E0B': '#FEF3C7', '#2563EB': '#EFF6FF' };

function buildNotifications(reports) {
  return reports.map(r => {
    const time = timeAgo(r.timestamp);
    if (r.status === 'Resolved') {
      return {
        id: r.id, icon: '✅', title: 'Pothole Fixed',
        body: `A ${r.urgency.toLowerCase()} priority pothole near ${r.latitude?.toFixed(4)}, ${r.longitude?.toFixed(4)} has been resolved.`,
        time, dot: '#10B981',
      };
    }
    if (r.status === 'In Progress' || r.status === 'Assigned') {
      return {
        id: r.id, icon: '🔧', title: 'Report Assigned',
        body: `Your ${r.urgency.toLowerCase()} priority report has been assigned${r.assignedTo ? ` to Team ${r.assignedTo}` : ' to a repair team'}.`,
        time, dot: '#F59E0B',
      };
    }
    return {
      id: r.id, icon: '📍', title: 'Report Registered',
      body: `Your ${r.urgency.toLowerCase()} priority pothole report has been successfully registered.`,
      time, dot: '#2563EB',
    };
  });
}

function NotifItem({ notif, isRead, onPress, theme, isDark }) {
  const iconBg = isRead
    ? theme.tableHeaderBg
    : isDark
      ? notif.dot + '26'                          // hex color + 15% alpha
      : (LIGHT_ICON_BG[notif.dot] ?? '#EFF6FF');

  return (
    <TouchableOpacity
      style={[styles.notifItem, isRead && { backgroundColor: theme.readItemBg }]}
      activeOpacity={0.6}
      onPress={onPress}
    >
      <View style={[styles.notifIcon, { backgroundColor: iconBg }]}>
        <Text style={[styles.notifIconText, isRead && { opacity: 0.4 }]}>{notif.icon}</Text>
      </View>
      <View style={styles.notifBody}>
        <View style={styles.notifTopRow}>
          <Text style={[styles.notifTitle, { color: isRead ? theme.textMuted : theme.textPrimary }]}>
            {notif.title}
          </Text>
          <Text style={[styles.notifTime, { color: theme.textMuted }]}>{notif.time}</Text>
        </View>
        <Text style={[styles.notifText, { color: isRead ? theme.textMuted : theme.textSecondary }]}>
          {notif.body}
        </Text>
      </View>
      {!isRead && <View style={[styles.notifDot, { backgroundColor: notif.dot }]} />}
    </TouchableOpacity>
  );
}

export default function NotificationsDrawer({ visible, onClose }) {
  const { theme, isDark } = useTheme();
  const { reports, loading } = useReports();
  const notifications = buildNotifications(reports);
  const [readIds, setReadIds] = useState(new Set());

  const markRead = (id) => setReadIds(prev => new Set([...prev, id]));
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={[styles.panel, { backgroundColor: theme.notifPanelBg, borderLeftColor: theme.border }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.panelHeader}>
              <View>
                <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>Notifications</Text>
                {!loading && (
                  <Text style={[styles.panelSubtitle, { color: theme.textMuted }]}>
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: theme.tableHeaderBg }]}
              >
                <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading…</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>🔕</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No notifications yet</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {notifications.map((n, i) => (
                  <View key={n.id}>
                    <NotifItem
                      notif={n}
                      isRead={readIds.has(n.id)}
                      onPress={() => markRead(n.id)}
                      theme={theme}
                      isDark={isDark}
                    />
                    {i < notifications.length - 1 && (
                      <View style={[styles.itemDivider, { backgroundColor: theme.border }]} />
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: 300,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14,
  },
  panelTitle:    { fontSize: 18, fontWeight: '800' },
  panelSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1 },
  scroll: { paddingVertical: 8 },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  notifIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifIconText: { fontSize: 18 },
  notifBody: { flex: 1, gap: 4 },
  notifTopRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8,
  },
  notifTitle: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  notifTime:  { fontSize: 11, flexShrink: 0 },
  notifText:  { fontSize: 12, lineHeight: 17 },
  notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  itemDivider: { height: 1, marginHorizontal: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, fontWeight: '500' },
});
