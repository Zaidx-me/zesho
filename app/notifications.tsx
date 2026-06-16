import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';
import { getDismissedNotifications, dismissNotification } from '../src/services/localDb';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: string;
}

const ALL_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Welcome to Zesho', message: 'Discover thousands of free books from world-class libraries.', time: '2 min ago', icon: 'book-outline' },
  { id: '2', title: 'New Urdu Collection', message: '2,138+ Urdu books just added. Explore classics, poetry, and more.', time: '1 hour ago', icon: 'language-outline' },
  { id: '3', title: 'Reading Reminder', message: 'Continue where you left off. Your books are waiting!', time: '3 hours ago', icon: 'time-outline' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_THRESHOLD = -SCREEN_W * 0.3;

function SwipeableNotif({ notif, onDismiss, colors }: { notif: Notification; onDismiss: () => void; colors: any }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => { if (g.dx < 0) translateX.setValue(g.dx); },
      onPanResponderRelease: (_, g) => {
        if (g.dx < SWIPE_THRESHOLD) {
          Animated.parallel([
            Animated.timing(translateX, { toValue: -SCREEN_W, duration: 250, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]).start(() => onDismiss());
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.notifAnimated, { opacity, transform: [{ translateX }] }]}>
      <View style={[styles.deleteBg, { backgroundColor: colors.surfaceElevated }]}>
        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
        <Text style={[styles.deleteText, { color: colors.textSecondary }]}>Dismiss</Text>
      </View>
      <Animated.View {...panResponder.panHandlers} style={[styles.notifCard, {
        backgroundColor: colors.surfaceElevated,
        borderLeftColor: colors.border,
      }]}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={notif.icon as any} size={20} color={colors.textPrimary} />
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>{notif.title}</Text>
          <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>{notif.message}</Text>
          <Text style={[styles.notifTime, { color: colors.textMuted }]}>{notif.time}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const dismissed = await getDismissedNotifications();
    setNotifications(ALL_NOTIFICATIONS.filter(n => !dismissed.includes(n.id)));
  };

  const dismissNotif = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await dismissNotification(id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={async () => {
            for (const n of notifications) await dismissNotification(n.id);
            setNotifications([]);
          }}>
            <Text style={[styles.clearAll, { color: colors.textSecondary }]}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All caught up!</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>No new notifications</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((notif) => (
            <SwipeableNotif key={notif.id} notif={notif} onDismiss={() => dismissNotif(notif.id)} colors={colors} />
          ))}
          <Text style={[styles.swipeHint, { color: colors.textMuted }]}>Swipe left to dismiss</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  clearAll: { fontSize: FontSize.bodySm, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  notifAnimated: { marginBottom: Spacing.sm },
  deleteBg: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '100%', borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: Spacing.xl, gap: Spacing.sm },
  deleteText: { fontWeight: '600', fontSize: FontSize.bodySm },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', padding: Spacing.md, borderRadius: BorderRadius.md, borderLeftWidth: 3 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.sm },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: FontSize.bodyMd, fontWeight: '600', marginBottom: 2 },
  notifMessage: { fontSize: FontSize.bodySm, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: FontSize.xs },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '600', marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.md, marginTop: Spacing.sm },
  swipeHint: { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.lg },
});
