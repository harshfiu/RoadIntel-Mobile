import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator,
} from 'react-native';
import AppHeader from '../components/AppHeader';
import { useReports } from '../hooks/useReports';
import { useTheme } from '../context/ThemeContext';

function StatCard({ label, value, icon, bg, textColor, isDark }) {
  return (
    <View style={[
      styles.statCard,
      { backgroundColor: bg },
      isDark && {
        shadowColor: textColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      },
    ]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor, opacity: 0.75 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DetectionRow({ report, onPress, theme, urgencyStyle }) {
  const us = urgencyStyle[report.urgency] ?? urgencyStyle.Low;
  const dateStr = report.timestamp
    ? report.timestamp.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + report.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <TouchableOpacity style={styles.detectionRow} activeOpacity={0.7} onPress={onPress}>
      {/* Thumbnail */}
      <View style={styles.thumbBox}>
        {report.imageUrl ? (
          <Image source={{ uri: report.imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, { backgroundColor: theme.surfaceElev, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 20 }}>🛣️</Text>
          </View>
        )}
      </View>

      {/* Severity badge */}
      <View style={styles.detectionMid}>
        <View style={[styles.badge, { backgroundColor: us.bg }]}>
          <View style={[styles.dot, { backgroundColor: us.dot }]} />
          <Text style={[styles.badgeText, { color: us.text }]}>{report.urgency}</Text>
        </View>
      </View>

      <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateStr}</Text>
      <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ onUpload, onMenuPress, onBellPress, onViewReport }) {
  const { reports, loading } = useReports();
  const { theme, isDark, urgencyStyle } = useTheme();

  const total  = reports.length;
  const high   = reports.filter(r => r.urgency === 'High').length;
  const medium = reports.filter(r => r.urgency === 'Medium').length;
  const low    = reports.filter(r => r.urgency === 'Low').length;
  const recent = reports.slice(0, 3);

  const statCards = isDark ? [
    { label: 'Total Potholes', value: total,  icon: '☁️', bg: theme.accentSoft,        textColor: theme.accentText },
    { label: 'High Priority',  value: high,   icon: '🔺', bg: urgencyStyle.High.bg,     textColor: urgencyStyle.High.text },
    { label: 'Med. Priority',  value: medium, icon: '⚠️', bg: urgencyStyle.Medium.bg,   textColor: urgencyStyle.Medium.text },
    { label: 'Low Priority',   value: low,    icon: '✅', bg: urgencyStyle.Low.bg,      textColor: urgencyStyle.Low.text },
  ] : [
    { label: 'Total Potholes', value: total,  icon: '☁️', bg: '#EFF6FF', textColor: '#1D4ED8' },
    { label: 'High Priority',  value: high,   icon: '🔺', bg: '#FEF2F2', textColor: '#DC2626' },
    { label: 'Med. Priority',  value: medium, icon: '⚠️', bg: '#FFFBEB', textColor: '#D97706' },
    { label: 'Low Priority',   value: low,    icon: '✅', bg: '#F0FDF4', textColor: '#15803D' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <AppHeader onMenuPress={onMenuPress} onBellPress={onBellPress} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={[styles.welcome, { color: theme.textPrimary }]}>Welcome Back!</Text>

        {/* Stat cards 2×2 */}
        <View style={styles.statsGrid}>
          {statCards.map(c => (
            <StatCard key={c.label} {...c} isDark={isDark} />
          ))}
        </View>

        {/* Recent Detections */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Detections</Text>
          <TouchableOpacity onPress={() => onViewReport({ urgency: 'High' })}>
            <Text style={[styles.viewAll, { color: theme.accentText }]}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Table header */}
          <View style={[styles.tableHeader, { backgroundColor: theme.tableHeaderBg, borderBottomColor: theme.border }]}>
            <Text style={[styles.colHead, { flex: 1.2, color: theme.textMuted }]}>Image</Text>
            <Text style={[styles.colHead, { flex: 1.2, color: theme.textMuted }]}>Severity</Text>
            <Text style={[styles.colHead, { flex: 2, color: theme.textMuted }]}>Date</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.accent} style={{ paddingVertical: 24 }} />
          ) : recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No reports yet. Submit one from your camera!
              </Text>
            </View>
          ) : (
            recent.map((r, i) => (
              <View key={r.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <DetectionRow
                  report={r}
                  onPress={() => onViewReport(r)}
                  theme={theme}
                  urgencyStyle={urgencyStyle}
                />
              </View>
            ))
          )}
        </View>

        {/* Upload section */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Upload Image or Video</Text>
        <TouchableOpacity
          style={[styles.uploadBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
          onPress={onUpload}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadBtnText}>📷  Upload Image or Video</Text>
        </TouchableOpacity>
        <Text style={[styles.uploadHint, { color: theme.textMuted }]}>
          Upload a road image or video to detect potholes and rank severity.
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },

  welcome: { fontSize: 22, fontWeight: '800', marginBottom: 16, marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard:  { width: '47%', borderRadius: 14, padding: 16, alignItems: 'flex-start', gap: 4 },
  statIcon:  { fontSize: 24, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  viewAll:       { fontSize: 13, fontWeight: '600' },

  card: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 24 },
  tableHeader: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1,
  },
  colHead: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  detectionRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  thumbBox: { flex: 1.2 },
  thumb:    { width: 52, height: 40, borderRadius: 8, overflow: 'hidden' },
  detectionMid: { flex: 1.2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start',
  },
  dot:       { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  dateText:  { flex: 2, fontSize: 11, lineHeight: 16 },
  chevron:   { fontSize: 20, fontWeight: '300' },
  divider:   { height: 1, marginHorizontal: 14 },

  emptyState: { padding: 24, alignItems: 'center' },
  emptyText:  { fontSize: 13, textAlign: 'center' },

  uploadBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 10,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  uploadHint:    { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
