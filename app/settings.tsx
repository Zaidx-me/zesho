import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'arrow' | 'info';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors, toggleTheme } = useTheme();

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon',
          title: 'Dark Mode',
          subtitle: isDark ? 'Currently using dark theme' : 'Currently using light theme',
          type: 'toggle',
          value: isDark,
          onToggle: () => toggleTheme(),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Get notified about new releases',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      title: 'Data & Sync',
      items: [
        {
          icon: 'sync',
          title: 'Auto Sync',
          subtitle: 'Sync library across devices',
          type: 'toggle',
          value: true,
        },
        {
          icon: 'cloud-download',
          title: 'Download Quality',
          subtitle: 'High',
          type: 'arrow',
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'document-text',
          title: 'Terms of Service',
          type: 'arrow',
        },
        {
          icon: 'shield-checkmark',
          title: 'Privacy Policy',
          type: 'arrow',
        },
        {
          icon: 'information-circle',
          title: 'App Version',
          subtitle: '1.0.0',
          type: 'info',
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && [styles.settingItemBorder, { borderBottomColor: colors.border }],
                  ]}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle' || item.type === 'info'}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                      {item.subtitle && (
                        <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                      )}
                    </View>
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.surfaceElevated, true: colors.primarySoft }}
                      thumbColor={item.value ? colors.primary : colors.textSecondary}
                    />
                  )}
                  {item.type === 'arrow' && (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.huge,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
});
