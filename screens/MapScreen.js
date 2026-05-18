import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import AppHeader from '../components/AppHeader';
import { useReports } from '../hooks/useReports';
import { useTheme } from '../context/ThemeContext';

// Builds a full HTML page with Leaflet loaded from CDN
function buildMapHtml(reports) {
  const lat  = reports[0]?.latitude  ?? 20.5937;
  const lon  = reports[0]?.longitude ?? 78.9629;
  const zoom = reports.length > 0 ? 13 : 5;

  const COLOR_MAP = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };

  const markers = reports
    .filter(r => r.latitude && r.longitude)
    .map(r => {
      const color = COLOR_MAP[r.urgency] ?? '#10B981';
      const popup = `<b>${r.urgency} Priority</b><br>${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}<br>Status: ${r.status}`;
      return `
        L.circleMarker([${r.latitude}, ${r.longitude}], {
          radius: 12, fillColor: '${color}', color: '#fff',
          weight: 2.5, opacity: 1, fillOpacity: 0.9
        }).addTo(map).bindPopup(\`${popup}\`);
      `;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], ${zoom});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    ${markers}
  </script>
</body>
</html>`;
}

export default function MapScreen({ onMenuPress, onBellPress }) {
  const { reports, loading } = useReports();
  const { theme, urgencyStyle } = useTheme();

  const openMap = (lat, lon) => Linking.openURL(`https://maps.google.com/?q=${lat},${lon}`);

  const counts = { High: 0, Medium: 0, Low: 0 };
  reports.forEach(r => { if (counts[r.urgency] !== undefined) counts[r.urgency]++; });

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <AppHeader title="Map" onMenuPress={onMenuPress} onBellPress={onBellPress} />

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search location..."
          placeholderTextColor={theme.placeholder}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chips}>
        {['High', 'Medium', 'Low'].map(u => {
          const us = urgencyStyle[u];
          return (
            <View key={u} style={[styles.chip, { backgroundColor: us.bg, borderColor: us.chip }]}>
              <View style={[styles.chipDot, { backgroundColor: us.dot }]} />
              <Text style={[styles.chipText, { color: us.text }]}>{counts[u]} {u}</Text>
            </View>
          );
        })}
      </View>

      {/* Leaflet map in WebView */}
      <View style={[styles.mapContainer, { borderColor: theme.border }]}>
        {loading ? (
          <View style={[styles.mapLoading, { backgroundColor: theme.surface }]}>
            <Text style={[styles.mapLoadingText, { color: theme.textMuted }]}>Loading map…</Text>
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: buildMapHtml(reports) }}
            style={styles.map}
            javaScriptEnabled
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Report list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Report Locations</Text>
        {reports.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No reports yet.</Text>
        ) : (
          reports.map((r, index) => {
            const us = urgencyStyle[r.urgency] ?? urgencyStyle.Low;
            const dateStr = r.timestamp
              ? r.timestamp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Unknown date';
            return (
              <TouchableOpacity
                key={r.id}
                style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => openMap(r.latitude, r.longitude)}
                activeOpacity={0.7}
              >
                <View style={[styles.locationDot, { backgroundColor: us.dot }]} />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationTitle, { color: theme.textPrimary }]}>
                    Pothole Report #{index + 1}
                  </Text>
                  <Text style={[styles.locationDate, { color: theme.textMuted }]}>{dateStr}</Text>
                  <View style={[styles.badge, { backgroundColor: us.bg }]}>
                    <Text style={[styles.badgeText, { color: us.text }]}>{r.urgency} Priority</Text>
                  </View>
                </View>
                <View style={styles.locationRight}>
                  <Text style={[styles.locationStatus, { color: theme.textMuted }]}>{r.status}</Text>
                  <Text style={[styles.viewMapLink, { color: theme.accentText }]}>Maps ›</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 14, marginBottom: 10,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },

  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  chipDot:  { width: 8, height: 8, borderRadius: 4 },
  chipText: { fontSize: 12, fontWeight: '700' },

  mapContainer: {
    height: 240, marginHorizontal: 16, borderRadius: 16,
    overflow: 'hidden', marginBottom: 12, borderWidth: 1,
  },
  map: { flex: 1 },
  mapLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapLoadingText: { fontSize: 14 },

  scroll: { paddingHorizontal: 16, paddingBottom: 30 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  emptyText:    { textAlign: 'center', padding: 20 },

  locationCard: {
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 10, borderWidth: 1,
  },
  locationDot:   { width: 12, height: 12, borderRadius: 6 },
  locationInfo:  { flex: 1, gap: 5 },
  locationTitle: { fontSize: 13, fontWeight: '700' },
  locationDate:  { fontSize: 11, marginBottom: 2 },
  badge:         { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  locationRight: { alignItems: 'flex-end', gap: 4 },
  locationStatus: { fontSize: 11 },
  viewMapLink:    { fontSize: 12, fontWeight: '600' },
});
