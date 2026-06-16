import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
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

  const sections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Appearance',
      items: [{
        icon: 'moon', title: 'Dark Mode',
        subtitle: isDark ? 'Currently dark' : 'Currently light',
        type: 'toggle', value: isDark, onToggle: () => toggleTheme(),
      }],
    },
    {
      title: 'About',
      items: [
        { icon: 'document-text', title: 'Terms of Service', type: 'arrow' },
        { icon: 'shield-checkmark', title: 'Privacy Policy', type: 'arrow' },
        { icon: 'information-circle', title: 'App Version', subtitle: '1.0.0', type: 'info' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.row, iIdx < section.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
                  onPress={item.onPress}
                  disabled={item.type === 'toggle' || item.type === 'info'}
                  activeOpacity={0.6}
                >
                  <View style={styles.rowLeft}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name={item.icon as any} size={18} color={colors.textPrimary} />
                    </View>
                    <View>
                      <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                      {item.subtitle && <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.subtitle}</Text>}
                    </View>
                  </View>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.success }}
                      thumbColor={item.value ? '#fff' : colors.textSecondary}
                    />
                  )}
                  {item.type === 'arrow' && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
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
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.xl, fontWeight: '700' },
  content: { paddingHorizontal: Spacing.xxl, paddingBottom: 100 },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { fontSize: FontSize.bodyMd, fontWeight: '500' },
  rowSub: { fontSize: FontSize.sm, marginTop: 2 },
});
