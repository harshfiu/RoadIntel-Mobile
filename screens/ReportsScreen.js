import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Modal, Linking,
} from 'react-native';
import { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { useReports } from '../hooks/useReports';
import { useTheme } from '../context/ThemeContext';

function ReportDetailModal({ report, onClose, theme, urgencyStyle }) {
  if (!report) return null;
  const us = urgencyStyle[report.urgency] ?? urgencyStyle.Low;
  const dateStr = report.timestamp
    ? report.timestamp.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) +
      ' · ' + report.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <Modal visible={!!report} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.modalSheet, { backgroundColor: theme.modalBg }]}>
          <View style={[styles.handleBar, { backgroundColor: theme.borderStrong }]} />

          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Report Details</Text>
            <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn, { backgroundColor: theme.tableHeaderBg }]}>
              <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {report.imageUrl && (
            <Image source={{ uri: report.imageUrl }} style={styles.modalImage} resizeMode="cover" />
          )}

          <View style={styles.modalBody}>
            {[
              { label: 'Date',     value: dateStr },
              { label: 'Location', value: `${report.latitude?.toFixed(5)}, ${report.longitude?.toFixed(5)}` },
            ].map(row => (
              <View key={row.label} style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalLabel, { color: theme.textMuted }]}>{row.label}</Text>
                <Text style={[styles.modalValue, { color: theme.textPrimary }]}>{row.value}</Text>
              </View>
            ))}

            <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Priority</Text>
              <View style={[styles.badge, { backgroundColor: us.bg }]}>
                <View style={[styles.dot, { backgroundColor: us.dot }]} />
                <Text style={[styles.badgeText, { color: us.text }]}>{report.urgency}</Text>
              </View>
            </View>

            <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Status</Text>
              <Text style={[styles.modalValue, { color: theme.textPrimary }]}>{report.status}</Text>
            </View>

            {report.assignedTo && (
              <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Assigned To</Text>
                <Text style={[styles.modalValue, { color: theme.textPrimary }]}>{report.assignedTo}</Text>
              </View>
            )}
          </View>

          {report.latitude && report.longitude && (
            <TouchableOpacity
              style={[styles.mapsBtn, { backgroundColor: theme.accent }]}
              onPress={() => Linking.openURL(`https://maps.google.com/?q=${report.latitude},${report.longitude}`)}
              activeOpacity={0.85}
            >
              <Text style={styles.mapsBtnText}>📍  Open in Maps</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ReportItem({ report, onPress, theme, urgencyStyle }) {
  const us = urgencyStyle[report.urgency] ?? urgencyStyle.Low;
  const dateStr = report.timestamp
    ? report.timestamp.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ', ' + report.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <TouchableOpacity style={styles.reportItem} activeOpacity={0.7} onPress={onPress}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        {report.imageUrl ? (
          <Image source={{ uri: report.imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: theme.surfaceElev }]}>
            <Text style={{ fontSize: 18 }}>🛣️</Text>
          </View>
        )}
        <View style={[styles.pinDot, { backgroundColor: us.dot, borderColor: theme.surface }]}>
          <Text style={styles.pinText}>📍</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.reportInfo}>
        <Text style={[styles.reportDate, { color: theme.textPrimary }]}>{dateStr}</Text>
        <Text style={[styles.reportCoords, { color: theme.textMuted }]} numberOfLines={1}>
          {report.latitude?.toFixed(5)}, {report.longitude?.toFixed(5)}
        </Text>
        <View style={[styles.badge, { backgroundColor: us.bg }]}>
          <View style={[styles.dot, { backgroundColor: us.dot }]} />
          <Text style={[styles.badgeText, { color: us.text }]}>{report.urgency}</Text>
        </View>
      </View>

      <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

function PrioritySection({ urgency, reports, expanded, onToggle, isNew, onSelectReport, theme, urgencyStyle }) {
  const us = urgencyStyle[urgency];
  return (
    <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <TouchableOpacity
        style={[styles.sectionHeader, { backgroundColor: us.headerBg, borderColor: us.bg }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionLabel, { color: us.text }]}>{urgency} Priority</Text>
        <View style={styles.sectionRight}>
          {isNew && (
            <View style={[styles.newBadge, { backgroundColor: us.bg }]}>
              <Text style={[styles.newBadgeText, { color: us.text }]}>{reports.length} New</Text>
            </View>
          )}
          <Text style={[styles.expandIcon, { color: us.text }]}>
            {expanded ? '▾' : '›'}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionBody}>
          {reports.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No {urgency.toLowerCase()} priority reports
            </Text>
          ) : (
            reports.map((r, i) => (
              <View key={r.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <ReportItem
                  report={r}
                  onPress={() => onSelectReport(r)}
                  theme={theme}
                  urgencyStyle={urgencyStyle}
                />
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function ReportsScreen({ onMenuPress, onBellPress, focusSection }) {
  const { reports, loading } = useReports();
  const { theme, urgencyStyle } = useTheme();
  const [expanded, setExpanded] = useState({ High: true, Medium: false, Low: false });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (focusSection) {
      setExpanded({ High: false, Medium: false, Low: false, [focusSection]: true });
    }
  }, [focusSection]);

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const grouped = {
    High:   reports.filter(r => r.urgency === 'High'),
    Medium: reports.filter(r => r.urgency === 'Medium'),
    Low:    reports.filter(r => r.urgency === 'Low'),
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <AppHeader title="Reports" onMenuPress={onMenuPress} onBellPress={onBellPress} />

      <View style={styles.filterRow}>
        <Text style={[styles.filterTitle, { color: theme.textPrimary }]}>Reports</Text>
      </View>

      {/* Priority filter chips */}
      <View style={styles.chips}>
        {['High', 'Medium', 'Low'].map(u => {
          const us = urgencyStyle[u];
          const count = grouped[u].length;
          return (
            <TouchableOpacity
              key={u}
              style={[styles.chip, { backgroundColor: us.bg, borderColor: us.dot }]}
              onPress={() => setExpanded({ High: false, Medium: false, Low: false, [u]: true })}
            >
              <Text style={[styles.chipText, { color: us.text }]}>
                {u} Priority {count > 0 && <Text style={styles.chipCount}>{count}</Text>}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading reports…</Text>
        ) : (
          ['High', 'Medium', 'Low'].map(u => (
            <PrioritySection
              key={u}
              urgency={u}
              reports={grouped[u]}
              expanded={expanded[u]}
              onToggle={() => toggle(u)}
              isNew={grouped[u].length > 0}
              onSelectReport={setSelectedReport}
              theme={theme}
              urgencyStyle={urgencyStyle}
            />
          ))
        )}
      </ScrollView>

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        theme={theme}
        urgencyStyle={urgencyStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  filterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  filterTitle: { fontSize: 22, fontWeight: '800' },

  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 14 },
  chip:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:  { fontSize: 12, fontWeight: '700' },
  chipCount: { fontWeight: '800' },

  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  loadingText: { textAlign: 'center', padding: 24 },

  section: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  newBadgeText: { fontSize: 11, fontWeight: '700' },
  expandIcon: { fontSize: 18, fontWeight: '300' },
  sectionBody: {},

  reportItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 64, height: 50, borderRadius: 10, overflow: 'hidden' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  pinDot: {
    position: 'absolute', bottom: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  pinText: { fontSize: 9 },

  reportInfo: { flex: 1, gap: 4 },
  reportDate:   { fontSize: 12, fontWeight: '600' },
  reportCoords: { fontSize: 11, fontFamily: 'monospace' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  dot:       { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chevron:   { fontSize: 20 },
  divider:   { height: 1, marginHorizontal: 14 },
  emptyText: { padding: 16, fontSize: 13, textAlign: 'center' },

  // ── Detail Modal ────────────────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 24,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '800' },
  modalCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 13, fontWeight: '700' },
  modalImage: { width: '100%', height: 200 },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, gap: 14 },
  modalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 12, borderBottomWidth: 1,
  },
  modalLabel: { fontSize: 13, fontWeight: '600' },
  modalValue: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right', marginLeft: 16 },
  mapsBtn: {
    marginHorizontal: 20, marginTop: 20,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  mapsBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
