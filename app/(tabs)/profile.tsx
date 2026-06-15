import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { logOut } from '../../src/services/auth';
import { getUserBooks, getAllUserNotes } from '../../src/services/books';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useTheme } from '../../src/context/ThemeContext';

export default function ProfileScreen() {
  const { user, skipped } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [stats, setStats] = useState({ total: 0, reading: 0, finished: 0, notes: 0 });

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    if (!user) return;
    try {
      const [books, notes] = await Promise.all([
        getUserBooks(user.uid),
        getAllUserNotes(user.uid),
      ]);
      setStats({
        total: books.length,
        reading: books.filter(b => b.status === 'reading').length,
        finished: books.filter(b => b.status === 'finished').length,
        notes: notes.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (skipped || !user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={[styles.guestScroll, { paddingTop: insets.top + Spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>

          {/* Guest Card */}
          <View style={[styles.guestCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <View style={styles.guestAvatar}>
              <Ionicons name="person" size={48} color={colors.textSecondary} />
            </View>
            <Text style={[styles.guestName, { color: colors.textPrimary }]}>Guest User</Text>
            <Text style={[styles.guestSubtext, { color: colors.textSecondary }]}>Sign in to track your reading progress</Text>
            <TouchableOpacity style={[styles.signInButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/(auth)/login')}>
              <Ionicons name="log-in" size={18} color={colors.white} />
              <Text style={[styles.signInText, { color: colors.white }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Menu */}
          <View style={[styles.menuSection, { backgroundColor: colors.surfaceElevated }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/settings')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/upload')}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(90, 200, 250, 0.15)' }]}>
                  <Ionicons name="cloud-upload-outline" size={20} color="#5AC8FA" />
                </View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Upload Book</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.success} />
                </View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 159, 10, 0.15)' }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
                </View>
                <Text style={[styles.menuText, { color: colors.textPrimary }]}>About Zesho</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.displayName || 'Reader'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="book" size={28} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Books</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="book-outline" size={28} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.finished}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Finished</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="time" size={28} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.reading}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reading</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surfaceElevated }]}>
            <Ionicons name="pencil" size={28} color="#a29bfe" />
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.notes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Notes</Text>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.surfaceElevated }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/settings')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <Ionicons name="settings-outline" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/upload')}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(90, 200, 250, 0.15)' }]}>
                <Ionicons name="cloud-upload-outline" size={20} color="#5AC8FA" />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>Upload Book</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                <Ionicons name="help-circle-outline" size={20} color={colors.success} />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 159, 10, 0.15)' }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.menuText, { color: colors.textPrimary }]}>About Zesho</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.hero,
    fontWeight: '700',
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  email: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  statCard: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSize.sm,
  },
  menuSection: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: FontSize.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderRadius: BorderRadius.lg,
  },
  logoutText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },

  // Guest styles
  guestScroll: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
  guestCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
  },
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  guestName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  guestSubtext: {
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  signInText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
