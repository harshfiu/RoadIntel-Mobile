import { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import BottomTabBar        from './components/BottomTabBar';
import DrawerMenu          from './components/DrawerMenu';
import NotificationsDrawer from './components/NotificationsDrawer';
import LoginScreen    from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import MapScreen       from './screens/MapScreen';
import ReportsScreen   from './screens/ReportsScreen';
import SettingsScreen  from './screens/SettingsScreen';
import CaptureScreen   from './screens/CaptureScreen';
import SubmitScreen    from './screens/SubmitScreen';

function AppShell({ user, signOut, updateProfile }) {
  const { theme } = useTheme();
  const [tab,  setTab]  = useState('dashboard');
  const [flow, setFlow] = useState(null);
  const [capturedUri, setCapturedUri] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [focusSection, setFocusSection] = useState(null);

  const startCapture    = ()    => setFlow('capture');
  const onImageCaptured = (uri) => { setCapturedUri(uri); setFlow('submit'); };
  const onFlowDone      = ()    => { setFlow(null); setCapturedUri(null); };

  const openMenu  = () => setDrawerOpen(true);
  const openNotif = () => setNotifOpen(true);

  const onDrawerNavigate = (targetTab, section = null) => {
    setTab(targetTab);
    setFocusSection(section);
    setDrawerOpen(false);
  };

  const onViewReport = (report) => {
    setFocusSection(report.urgency);
    setTab('reports');
  };

  if (flow === 'capture') {
    return <CaptureScreen onImageCaptured={onImageCaptured} onBack={onFlowDone} />;
  }
  if (flow === 'submit') {
    return <SubmitScreen imageUri={capturedUri} onDone={onFlowDone} onBack={() => setFlow('capture')} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" backgroundColor="#1a2236" />
      {tab === 'dashboard' && (
        <DashboardScreen onUpload={startCapture} onMenuPress={openMenu} onBellPress={openNotif} onViewReport={onViewReport} />
      )}
      {tab === 'map'      && <MapScreen onMenuPress={openMenu} onBellPress={openNotif} />}
      {tab === 'reports'  && (
        <ReportsScreen onMenuPress={openMenu} onBellPress={openNotif} focusSection={focusSection} />
      )}
      {tab === 'settings' && (
        <SettingsScreen
          onMenuPress={openMenu}
          onBellPress={openNotif}
          onSignOut={signOut}
          user={user}
          onUpdateProfile={updateProfile}
        />
      )}
      <BottomTabBar activeTab={tab} onTabChange={(t) => { setTab(t); setFocusSection(null); }} />
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} onNavigate={onDrawerNavigate} />
      <NotificationsDrawer visible={notifOpen} onClose={() => setNotifOpen(false)} />
    </View>
  );
}

function AuthGate() {
  const { user, loading, error, signIn, signUp, signOut, updateProfile, clearError } = useAuth();

  if (!user) {
    return (
      <>
        <StatusBar style="light" backgroundColor="#0D1117" />
        <LoginScreen
          onSignIn={signIn}
          onSignUp={signUp}
          loading={loading}
          error={error}
          onClearError={clearError}
        />
      </>
    );
  }

  return <AppShell user={user} signOut={signOut} updateProfile={updateProfile} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthGate />
    </ThemeProvider>
  );
}
