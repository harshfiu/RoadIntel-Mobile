import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useState } from 'react';

// ── Reusable field ───────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoCapitalize, right, error }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        <TextInput
          style={[styles.input, right && { paddingRight: 44 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#4B5563"
          keyboardType={keyboardType ?? 'default'}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          autoCorrect={false}
        />
        {right}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ── Sign In form ─────────────────────────────────────────────────
function SignInForm({ onSignIn, loading, error, onClearError }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);

  const submit = () => {
    if (!email.trim() || !password) return;
    onSignIn(email.trim(), password);
  };

  return (
    <View style={styles.formBody}>
      {error ? <ErrorBox message={error} /> : null}

      <Field
        label="Email"
        value={email}
        onChangeText={t => { setEmail(t); onClearError(); }}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={t => { setPassword(t); onClearError(); }}
        placeholder="••••••••"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        right={
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
            <Text style={styles.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={submit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnText}>Sign In</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ── Sign Up form ─────────────────────────────────────────────────
function SignUpForm({ onSignUp, loading, error, onClearError }) {
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [city,     setCity]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim())              errs.name     = 'Full name is required.';
    if (!phone.trim())             errs.phone    = 'Phone number is required.';
    else if (!/^\+?\d{7,15}$/.test(phone.replace(/\s/g, '')))
                                   errs.phone    = 'Enter a valid phone number.';
    if (!city.trim())              errs.city     = 'City is required.';
    if (!email.trim())             errs.email    = 'Email is required.';
    if (!password)                 errs.password = 'Password is required.';
    else if (password.length < 6)  errs.password = 'Min. 6 characters.';
    if (password !== confirm)      errs.confirm  = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    onClearError();
    if (!validate()) return;
    onSignUp(email.trim(), password, {
      name:  name.trim(),
      phone: phone.trim(),
      city:  city.trim(),
    });
  };

  const clear = (field, setter) => t => {
    setter(t);
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: null }));
    onClearError();
  };

  return (
    <View style={styles.formBody}>
      {error ? <ErrorBox message={error} /> : null}

      <Field
        label="Full Name"
        value={name}
        onChangeText={clear('name', setName)}
        placeholder="John Doe"
        error={fieldErrors.name}
      />
      <Field
        label="Phone Number"
        value={phone}
        onChangeText={clear('phone', setPhone)}
        placeholder="+91 98765 43210"
        keyboardType="phone-pad"
        autoCapitalize="none"
        error={fieldErrors.phone}
      />
      <Field
        label="City / Area"
        value={city}
        onChangeText={clear('city', setCity)}
        placeholder="e.g. Chennai"
        error={fieldErrors.city}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={clear('email', setEmail)}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={fieldErrors.email}
      />
      <Field
        label="Password"
        value={password}
        onChangeText={clear('password', setPassword)}
        placeholder="Min. 6 characters"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        error={fieldErrors.password}
        right={
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
            <Text style={styles.eyeIcon}>{showPw ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        }
      />
      <Field
        label="Confirm Password"
        value={confirm}
        onChangeText={clear('confirm', setConfirm)}
        placeholder="Re-enter password"
        secureTextEntry={!showPw}
        autoCapitalize="none"
        error={fieldErrors.confirm}
      />

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={submit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>
    </View>
  );
}

function ErrorBox({ message }) {
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────
export default function LoginScreen({ onSignIn, onSignUp, loading, error, onClearError }) {
  const [mode, setMode] = useState('signin');

  const switchMode = (next) => {
    setMode(next);
    onClearError();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.shield}>
            <Text style={styles.shieldText}>R</Text>
          </View>
          <Text style={styles.appName}>RoadIntel</Text>
          <Text style={styles.appSub}>Pothole Reporting & Management</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.tabActive]}
              onPress={() => switchMode('signin')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => switchMode('signup')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'signin' ? (
            <SignInForm
              onSignIn={onSignIn}
              loading={loading}
              error={error}
              onClearError={onClearError}
            />
          ) : (
            <SignUpForm
              onSignUp={onSignUp}
              loading={loading}
              error={error}
              onClearError={onClearError}
            />
          )}
        </View>

        <Text style={styles.footer}>
          {mode === 'signin' ? "New here? " : 'Already have an account? '}
          <Text
            style={styles.footerLink}
            onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0D1117' },
  scroll: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 48,
  },

  logoWrap: { alignItems: 'center', marginBottom: 32 },
  shield: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 20, elevation: 12,
  },
  shieldText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  appName:    { color: '#F1F5F9', fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  appSub:     { color: '#4B5563', fontSize: 13, marginTop: 4 },

  card: {
    width: '100%',
    backgroundColor: '#161B27',
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },

  tabs: {
    flexDirection: 'row', backgroundColor: '#0D1117',
    borderRadius: 10, padding: 4, marginBottom: 20,
  },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabActive:     { backgroundColor: '#2563EB' },
  tabText:       { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  formBody: { gap: 2 },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: { color: '#F87171', fontSize: 13 },

  field:          { marginBottom: 12 },
  label:          { color: '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  inputWrap:      { position: 'relative' },
  inputWrapError: { },
  input: {
    backgroundColor: '#0D1117',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: '#F1F5F9', fontSize: 14,
  },
  fieldError: { color: '#F87171', fontSize: 11, marginTop: 4, marginLeft: 2 },

  eyeBtn:  { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  eyeIcon: { fontSize: 16 },

  btn:         { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },

  footer:     { color: '#4B5563', fontSize: 13, marginTop: 24, textAlign: 'center' },
  footerLink: { color: '#3B82F6', fontWeight: '600' },
});
