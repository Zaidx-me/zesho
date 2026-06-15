import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useGoogleAuth, signInWithGoogleIdToken, signInWithEmail, signUpWithEmail } from '../../src/services/auth';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSkipped } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'choice' | 'email'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      const { idToken } = response.authentication;
      if (idToken) handleGoogleSignIn(idToken);
    } else if (response?.type === 'error') {
      Alert.alert('Sign In Error', 'Google sign-in failed. Try email sign-in instead.');
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    setLoading(true);
    try {
      const user = await signInWithGoogleIdToken(idToken);
      setLoading(false);
      if (user) router.replace('/(tabs)');
      else Alert.alert('Error', 'Failed to sign in with Google.');
    } catch {
      setLoading(false);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert('Unavailable', 'Google sign-in is not configured. Use email sign-in instead.');
      return;
    }
    try { await promptAsync(); } catch { Alert.alert('Error', 'Failed to open Google sign-in'); }
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      let user;
      if (isSignUp) {
        user = await signUpWithEmail(email.trim(), password, name.trim() || undefined);
      } else {
        user = await signInWithEmail(email.trim(), password);
      }
      setLoading(false);
      if (user) router.replace('/(tabs)');
    } catch (e: any) {
      setLoading(false);
      let msg = 'Something went wrong';
      if (e?.code === 'auth/user-not-found') msg = 'No account found with this email';
      else if (e?.code === 'auth/wrong-password') msg = 'Incorrect password';
      else if (e?.code === 'auth/email-already-in-use') msg = 'An account with this email already exists';
      else if (e?.code === 'auth/invalid-email') msg = 'Invalid email address';
      else if (e?.code === 'auth/weak-password') msg = 'Password is too weak';
      else if (e?.code === 'auth/invalid-credential') msg = 'Invalid email or password';
      Alert.alert('Error', msg);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoIconWrap, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="book" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Zesho</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your personal reading companion</Text>
        </View>

        {mode === 'choice' ? (
          <>
            {/* Auth Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#4285F4' }]}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.emailButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => setMode('email')}
              >
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <Text style={[styles.emailButtonText, { color: colors.textPrimary }]}>Continue with Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading}>
                <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Email Form */}
            <View style={styles.formContainer}>
              <TouchableOpacity style={styles.backToChoice} onPress={() => setMode('choice')}>
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
                <Text style={[styles.backText, { color: colors.primary }]}>All sign-in options</Text>
              </TouchableOpacity>

              <Text style={[styles.formTitle, { color: colors.textPrimary }]}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
              <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>{isSignUp ? 'Sign up to start reading' : 'Sign in to your account'}</Text>

              {isSignUp && (
                <View style={[styles.inputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Full name"
                    placeholderTextColor={colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={[styles.inputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Email address"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.authButton, { backgroundColor: colors.primary }]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={[styles.authButtonText, { color: colors.white }]}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.toggleMode}>
                <Text style={{ color: colors.textSecondary }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.link, { color: colors.primary }]}>Terms of Service</Text> and{' '}
            <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xxl, justifyContent: 'space-between' },
  logoContainer: { alignItems: 'center', marginTop: Spacing.huge },
  logoIconWrap: { width: 100, height: 100, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  appName: { fontSize: FontSize.hero, fontWeight: '800', marginTop: Spacing.lg },
  tagline: { fontSize: FontSize.lg, marginTop: Spacing.sm },
  buttonContainer: { gap: Spacing.md, marginTop: Spacing.xxxl },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md },
  socialButtonText: { fontSize: FontSize.lg, fontWeight: '600', color: '#FFFFFF' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.sm },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: FontSize.sm, fontWeight: '600' },
  emailButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, gap: Spacing.md, borderWidth: 1 },
  emailButtonText: { fontSize: FontSize.lg, fontWeight: '600' },
  skipButton: { alignItems: 'center', paddingVertical: Spacing.lg },
  skipText: { fontSize: FontSize.md, fontWeight: '500' },
  formContainer: { gap: Spacing.md, marginTop: Spacing.xl },
  backToChoice: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  backText: { fontSize: FontSize.md, fontWeight: '500' },
  formTitle: { fontSize: FontSize.xxl, fontWeight: '800' },
  formSubtitle: { fontSize: FontSize.md, marginBottom: Spacing.md },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, gap: Spacing.sm, borderWidth: 1, height: 52 },
  input: { flex: 1, fontSize: FontSize.lg, height: '100%' },
  authButton: { paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.sm },
  authButtonText: { fontSize: FontSize.lg, fontWeight: '700' },
  toggleMode: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.md },
  footer: { marginTop: Spacing.xxl },
  footerText: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
  link: { fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
});
