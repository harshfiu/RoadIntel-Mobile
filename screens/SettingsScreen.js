import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import AppHeader from '../components/AppHeader';
import { useTheme } from '../context/ThemeContext';
import { useReports } from '../hooks/useReports';

const MENU_ITEMS = [
  { icon: '🔔', label: 'Notifications',      key: 'notifications' },
  { icon: '🛡️', label: 'Privacy & Security', key: 'privacy' },
  { icon: '❓', label: 'Help & Support',     key: 'help' },
  { icon: 'ℹ️', label: 'About RoadIntel',   key: 'about' },
];

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Shared bottom-sheet wrapper ──────────────────────────────────
function PanelModal({ visible, title, onClose, theme, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.panelSheet, { backgroundColor: theme.surface }]}>
          <View style={styles.handleBar} />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn, { backgroundColor: theme.border }]}>
              <Text style={{ color: theme.textMuted, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.panelDivider, { backgroundColor: theme.border }]} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

// ── Static info block ────────────────────────────────────────────
function InfoBlock({ heading, body, theme }) {
  return (
    <View style={styles.infoBlock}>
      {heading ? (
        <Text style={[styles.infoHeading, { color: theme.textPrimary }]}>{heading}</Text>
      ) : null}
      <Text style={[styles.infoBody, { color: theme.textSecondary }]}>{body}</Text>
    </View>
  );
}

// ── Notifications panel ──────────────────────────────────────────
const LIGHT_ICON_BG = { '#10B981': '#D1FAE5', '#F59E0B': '#FEF3C7', '#2563EB': '#EFF6FF' };

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

function NotifRow({ notif, isRead, onPress, theme, isDark }) {
  const iconBg = isRead
    ? theme.tableHeaderBg
    : isDark
      ? notif.dot + '26'
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

function NotificationsPanel({ visible, onClose, theme, isDark }) {
  const { reports, loading } = useReports();
  const notifications = buildNotifications(reports);
  const [readIds, setReadIds] = useState(new Set());
  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;
  const markRead = id => setReadIds(prev => new Set([...prev, id]));

  return (
    <PanelModal visible={visible} title="Notifications" onClose={onClose} theme={theme}>
      {!loading && (
        <Text style={[styles.notifSubtitle, { color: theme.textMuted }]}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </Text>
      )}
      {loading ? (
        <View style={styles.panelCenter}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.panelCenter}>
          <Text style={{ fontSize: 32 }}>🔕</Text>
          <Text style={[styles.infoBody, { color: theme.textMuted, textAlign: 'center' }]}>
            No notifications yet
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {notifications.map((n, i) => (
            <View key={n.id}>
              <NotifRow
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
    </PanelModal>
  );
}

// ── Privacy & Security panel ─────────────────────────────────────
function PrivacyPanel({ visible, onClose, theme }) {
  return (
    <PanelModal visible={visible} title="Privacy & Security" onClose={onClose} theme={theme}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelScroll}>
        <InfoBlock theme={theme} heading="Data We Collect"
          body="RoadIntel collects your GPS location, road images, and basic account information (name, email, phone number, city) to report and track road damage in your area." />
        <InfoBlock theme={theme} heading="Image Storage"
          body="Submitted images are stored securely in our database and are accessible only to authorized municipal administrators. Images are not shared with third parties." />
        <InfoBlock theme={theme} heading="Location Data"
          body="Your location is captured only at the moment of report submission. RoadIntel does not track or record your location continuously or in the background." />
        <InfoBlock theme={theme} heading="Account Security"
          body="Your account is protected by Firebase Authentication. Passwords are never stored in plain text. We recommend using a strong, unique password for your account." />
        <InfoBlock theme={theme} heading="Data Retention"
          body="Reports remain in the system until resolved by local authorities. You may request deletion of your personal data at any time by contacting our support team." />
        <InfoBlock theme={theme} heading="Third-Party Services"
          body="RoadIntel uses Google Firebase (Cloud Firestore) for data storage and authentication. Data processed through these services is subject to Google's Privacy Policy." />
        <InfoBlock theme={theme} heading="Your Rights"
          body="You have the right to access, correct, or delete your personal data. To submit a data request, contact support@roadintel.app and we will respond within 48 hours." />
      </ScrollView>
    </PanelModal>
  );
}

// ── Help & Support panel ─────────────────────────────────────────
function HelpPanel({ visible, onClose, theme }) {
  return (
    <PanelModal visible={visible} title="Help & Support" onClose={onClose} theme={theme}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelScroll}>
        <InfoBlock theme={theme} heading="How to Report a Pothole"
          body="Tap the upload button on the Dashboard, capture or select an image of the road damage, confirm your GPS location, and tap Submit. Your report will be registered and reviewed by local authorities." />
        <InfoBlock theme={theme} heading="Tracking Your Reports"
          body={'Reports move through three statuses:\n• Reported — received and pending review\n• In Progress — assigned to a repair team\n• Resolved — repair completed'} />
        <InfoBlock theme={theme} heading="Notifications"
          body="Tap the bell icon in the top-right corner to see real-time updates on your reports, including assignment and resolution alerts." />
        <InfoBlock theme={theme} heading="Map View"
          body="The Map tab shows all reported potholes geo-tagged on a live map. Markers are color-coded by severity: red for High, orange for Medium, and green for Low priority." />
        <InfoBlock theme={theme} heading="Frequently Asked Questions"
          body={'Q: How long does it take to fix a pothole?\nA: Response times depend on local authorities. High-priority reports are typically addressed within 7–14 days.\n\nQ: Can I edit a submitted report?\nA: Reports cannot be edited after submission. Submit a new report if needed.\n\nQ: Does the app work offline?\nA: An active internet connection is required to submit reports and view updates.'} />
        <InfoBlock theme={theme} heading="Contact Support"
          body={'Email: support@roadintel.app\nResponse time: 24–48 hours\n\nFor bug reports or feedback, use the in-app report feature or email us directly. We value every submission.'} />
      </ScrollView>
    </PanelModal>
  );
}

// ── About RoadIntel panel ────────────────────────────────────────
function AboutPanel({ visible, onClose, theme }) {
  return (
    <PanelModal visible={visible} title="About RoadIntel" onClose={onClose} theme={theme}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelScroll}>
        <View style={styles.aboutLogoWrap}>
          <View style={[styles.aboutLogo, { backgroundColor: '#1a2236' }]}>
            <Text style={styles.aboutLogoText}>R</Text>
          </View>
          <Text style={[styles.aboutAppName, { color: theme.textPrimary }]}>RoadIntel</Text>
          <Text style={[styles.aboutVersion, { color: theme.textMuted }]}>Version 1.0.0</Text>
        </View>
        <InfoBlock theme={theme} heading="What is RoadIntel?"
          body="RoadIntel is an AI-assisted pothole detection and road damage management platform. Citizens report road damage through the mobile app, and municipal authorities manage repairs through the web admin portal." />
        <InfoBlock theme={theme} heading="How It Works"
          body="When you submit a photo, the system analyzes road damage severity using computer vision and assigns a priority score — High, Medium, or Low. Reports are geo-tagged and surfaced to local authorities for action." />
        <InfoBlock theme={theme} heading="Priority Scoring"
          body="Each report receives an urgency score based on detected damage area, road width context, and time since reporting. High-priority reports are shown first to authorities for faster response." />
        <InfoBlock theme={theme} heading="Technology"
          body={'Mobile App: React Native (Expo)\nAdmin Portal: React + Vite\nBackend: Google Firebase (Firestore + Auth)\nMaps: Leaflet / React-Leaflet'} />
        <InfoBlock theme={theme} heading="Mission"
          body="To make road damage reporting accessible, fast, and data-driven — helping cities prioritize repairs and improve road safety for everyone." />
        <InfoBlock theme={theme} heading="Contact"
          body={'General: contact@roadintel.app\nSupport: support@roadintel.app\nGitHub: github.com/harshfiu/RoadIntel-Mobile'} />
      </ScrollView>
    </PanelModal>
  );
}

// ── Edit Profile Modal ───────────────────────────────────────────
function EditProfileModal({ visible, user, onClose, onSave }) {
  const { theme } = useTheme();
  const [name,  setName]  = useState(user?.name  ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [city,  setCity]  = useState(user?.city  ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your full name.'); return; }
    setSaving(true);
    const ok = await onSave({ name: name.trim(), phone: phone.trim(), city: city.trim() });
    setSaving(false);
    if (ok) onClose();
    else Alert.alert('Error', 'Could not save changes. Please try again.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
          <View style={styles.handleBar} />

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn, { backgroundColor: theme.border }]}>
              <Text style={{ color: theme.textMuted, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: 'Full Name',    value: name,  set: setName,  placeholder: 'Your name',         cap: 'words' },
            { label: 'Phone Number', value: phone, set: setPhone, placeholder: '+91 98765 43210',   cap: 'none',  kb: 'phone-pad' },
            { label: 'City / Area',  value: city,  set: setCity,  placeholder: 'e.g. Chennai',      cap: 'words' },
          ].map(f => (
            <View key={f.label} style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: theme.textMuted }]}>{f.label}</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.textPrimary }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={theme.textMuted}
                autoCapitalize={f.cap ?? 'sentences'}
                keyboardType={f.kb ?? 'default'}
              />
            </View>
          ))}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: theme.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCancelText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.modalSaveText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ──────────────────────────────────────────────────
export default function SettingsScreen({ onMenuPress, onBellPress, onSignOut, user, onUpdateProfile }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [editVisible, setEditVisible] = useState(false);
  const [openPanel, setOpenPanel] = useState(null);

  const displayName  = user?.name  || 'User';
  const displayEmail = user?.email || '';
  const displayPhone = user?.phone || '';
  const displayCity  = user?.city  || '';
  const avatarText   = initials(user?.name);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: onSignOut },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <AppHeader title="Settings" onMenuPress={onMenuPress} onBellPress={onBellPress} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: '#2563EB' }]}>
            <Text style={styles.avatarText}>{avatarText}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{displayEmail}</Text>
            {displayPhone ? <Text style={[styles.profileMeta, { color: theme.textMuted }]}>{displayPhone}</Text> : null}
            {displayCity  ? <Text style={[styles.profileMeta, { color: theme.textMuted }]}>{displayCity}</Text>  : null}
          </View>
          <TouchableOpacity style={styles.editIcon} onPress={() => setEditVisible(true)} activeOpacity={0.7}>
            <Text style={{ fontSize: 18 }}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile button */}
        <TouchableOpacity
          style={[styles.editProfileBtn, { backgroundColor: theme.accent }]}
          activeOpacity={0.85}
          onPress={() => setEditVisible(true)}
        >
          <Text style={styles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌙</Text>
            <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* General */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>GENERAL</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {MENU_ITEMS.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => setOpenPanel(item.key)}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.menuChevron, { color: theme.textMuted }]}>›</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={[styles.logoutBtn, {
            backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FFF5F5',
            borderColor:     isDark ? 'rgba(239,68,68,0.25)' : '#FECACA',
          }]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>⏻  Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        user={user}
        onClose={() => setEditVisible(false)}
        onSave={onUpdateProfile}
      />

      <NotificationsPanel
        visible={openPanel === 'notifications'}
        onClose={() => setOpenPanel(null)}
        theme={theme}
        isDark={isDark}
      />
      <PrivacyPanel
        visible={openPanel === 'privacy'}
        onClose={() => setOpenPanel(null)}
        theme={theme}
      />
      <HelpPanel
        visible={openPanel === 'help'}
        onClose={() => setOpenPanel(null)}
        theme={theme}
      />
      <AboutPanel
        visible={openPanel === 'about'}
        onClose={() => setOpenPanel(null)}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { padding: 20, paddingBottom: 48 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
  },

  profileCard: {
    borderRadius: 16, padding: 18, flexDirection: 'row',
    alignItems: 'center', gap: 14, borderWidth: 1, marginBottom: 12,
  },
  avatar:       { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { color: '#fff', fontWeight: '800', fontSize: 22 },
  profileInfo:  { flex: 1, gap: 2 },
  profileName:  { fontSize: 16, fontWeight: '700' },
  profileEmail: { fontSize: 13, marginTop: 1 },
  profileMeta:  { fontSize: 12, marginTop: 1 },
  editIcon:     { padding: 6 },

  editProfileBtn:     { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 24 },
  editProfileBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  menuCard:    { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 24 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16 },
  menuIcon:    { fontSize: 18, width: 24, textAlign: 'center' },
  menuLabel:   { flex: 1, fontSize: 15, fontWeight: '500' },
  menuChevron: { fontSize: 20, fontWeight: '300' },
  menuDivider: { height: 1, marginHorizontal: 18 },

  logoutBtn:  { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1 },
  logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },

  // Shared modal chrome
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  handleBar: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 20 },
  modalTitle:     { fontSize: 17, fontWeight: '800' },
  modalCloseBtn:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  panelDivider:   { height: 1 },

  // Panel sheet (taller than edit modal, for content)
  panelSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '85%',
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 24,
  },
  panelScroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  panelCenter: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },

  // Edit profile modal sheet
  modalSheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 40, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 24,
  },
  modalField:     { marginBottom: 14, paddingHorizontal: 0 },
  modalLabel:     { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14,
  },
  modalActions:     { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn:   { flex: 1, borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalCancelText:  { fontWeight: '600', fontSize: 14 },
  modalSaveBtn:     { flex: 2, backgroundColor: '#2563EB', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalSaveText:    { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Info blocks (Privacy, Help, About)
  infoBlock:   { marginBottom: 20 },
  infoHeading: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  infoBody:    { fontSize: 13, lineHeight: 20 },

  // About logo
  aboutLogoWrap: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  aboutLogo:     { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  aboutLogoText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  aboutAppName:  { fontSize: 20, fontWeight: '800' },
  aboutVersion:  { fontSize: 13 },

  // Notifications panel
  notifSubtitle: { fontSize: 12, fontWeight: '500', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 14, gap: 12,
  },
  notifIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  notifIconText: { fontSize: 18 },
  notifBody:     { flex: 1, gap: 4 },
  notifTopRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  notifTitle:    { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  notifTime:     { fontSize: 11, flexShrink: 0 },
  notifText:     { fontSize: 12, lineHeight: 17 },
  notifDot:      { width: 8, height: 8, borderRadius: 4, marginTop: 6, flexShrink: 0 },
  itemDivider:   { height: 1, marginHorizontal: 20 },
});
