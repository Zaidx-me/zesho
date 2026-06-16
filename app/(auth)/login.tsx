import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { signInWithEmail, signUpWithEmail } from '../../src/services/auth';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSkipped } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const goToTabs = () => {
    setNavigating(true);
    setSkipped(false);
    setTimeout(() => router.replace('/(tabs)'), 500);
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
      if (user) goToTabs();
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.xxxl, paddingBottom: insets.bottom + Spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + Brand */}
        <View style={styles.brandSection}>
          <View style={[styles.logoCircle, { backgroundColor: colors.buttonPrimary }]}>
            <Text style={[styles.logoLetter, { color: colors.buttonPrimaryText }]}>Z</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Zesho</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {isSignUp && (
            <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.buttonPrimary }]}
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.buttonPrimaryText} />
            ) : (
              <Text style={[styles.submitText, { color: colors.buttonPrimaryText }]}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Toggle */}
        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsSignUp(!isSignUp)} activeOpacity={0.7}>
          <Text style={{ color: colors.textSecondary, fontSize: FontSize.bodyMd }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <Text style={{ color: colors.buttonPrimary, fontWeight: '700', fontSize: FontSize.bodyMd }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity style={styles.skipRow} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip for now</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.terms, { color: colors.textMuted }]}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </ScrollView>

      {(loading || navigating) && (
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.xxl },
  brandSection: { alignItems: 'center', marginBottom: Spacing.xxxl + 20 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  logoLetter: { fontSize: 32, fontWeight: '800' },
  appName: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: Spacing.xs },
  tagline: { fontSize: FontSize.bodyMd },
  formSection: { gap: Spacing.md, marginBottom: Spacing.xl },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, gap: Spacing.sm, borderWidth: 1, height: 50 },
  input: { flex: 1, fontSize: FontSize.bodyMd, height: '100%' },
  submitBtn: { paddingVertical: Spacing.md + 4, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.sm },
  submitText: { fontSize: FontSize.bodyMd, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  skipRow: { alignItems: 'center', marginTop: Spacing.md },
  skipText: { fontSize: FontSize.bodySm, fontWeight: '500' },
  terms: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.xl, lineHeight: 18 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
});
