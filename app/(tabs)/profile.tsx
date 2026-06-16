import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';
import { clearUserLibrary } from '../../src/services/localDb';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();

  const menuSections: { title: string; items: MenuItem[] }[] = user ? [
    {
      title: 'Library',
      items: [
        { icon: 'heart-outline', label: 'Favorites', route: '/favorites' },
        { icon: 'time-outline', label: 'Reading History', route: '/history' },
        { icon: 'bookmark-outline', label: 'Bookmarks', route: '/(tabs)/notes' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { icon: 'settings-outline', label: 'Settings', route: '/settings' },
        { icon: 'help-circle-outline', label: 'Help Center', route: '/help' },
      ],
    },
  ] : [];

  const handleClearHistory = () => {
    if (!user) return;
    Alert.alert('Clear History', 'Remove all reading history? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearUserLibrary(user.uid) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>

        {user ? (
          <>
            <View style={[styles.userCard, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
                  {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {user.displayName || user.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                  {user.email || ''}
                </Text>
              </View>
            </View>

            {menuSections.map((section, sIdx) => (
              <View key={sIdx} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
                <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
                  {section.items.map((item, iIdx) => (
                    <TouchableOpacity
                      key={iIdx}
                      style={[styles.menuItem, iIdx < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                      onPress={() => { if (item.route) router.push(item.route as any); }}
                      activeOpacity={0.6}
                    >
                      <View style={styles.menuLeft}>
                        <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                        <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surfaceElevated, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.lg, marginBottom: Spacing.md }]}
              onPress={handleClearHistory}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>Clear Reading History</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: signOut },
              ])}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.guestWrap}>
            <View style={[styles.guestAvatar, { backgroundColor: colors.surfaceElevated }]}>
              <Ionicons name="person-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={[styles.guestTitle, { color: colors.textPrimary }]}>Guest Mode</Text>
            <Text style={[styles.guestSub, { color: colors.textSecondary }]}>Sign in to save books and track progress</Text>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: colors.buttonPrimary }]}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginBtnText, { color: colors.buttonPrimaryText }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  headerTitle: { fontSize: FontSize.heading4, fontWeight: '700', letterSpacing: -0.3, paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  userCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.xl, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.xxl, gap: Spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.heading5, fontWeight: '600' },
  userEmail: { fontSize: FontSize.bodySm, marginTop: 2 },
  section: { marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm },
  sectionCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  menuLabel: { fontSize: FontSize.bodyMd, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.xl, marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.sm, borderWidth: 1 },
  logoutText: { fontSize: FontSize.bodyMd, fontWeight: '600' },
  guestWrap: { alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: Spacing.xxxl },
  guestAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  guestTitle: { fontSize: FontSize.heading3, fontWeight: '700', marginBottom: Spacing.xs },
  guestSub: { fontSize: FontSize.bodyMd, textAlign: 'center', marginBottom: Spacing.xxl },
  loginBtn: { paddingVertical: Spacing.md + 4, paddingHorizontal: Spacing.xxxl, borderRadius: BorderRadius.lg },
  loginBtnText: { fontSize: FontSize.bodyMd, fontWeight: '700' },
});
