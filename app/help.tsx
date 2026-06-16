import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { useTheme } from '../src/context/ThemeContext';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const faqItems = [
    {
      q: 'What is Zesho?',
      a: 'Zesho is a free book reading app with thousands of books from Google Books, Gutendex, Open Library, and 2,138+ Urdu books from TheLibraryPK.',
    },
    {
      q: 'How do I add books to my library?',
      a: 'Tap on any book and use the "Want to Read" or "Reading" buttons. Your library syncs locally on your device.',
    },
    {
      q: 'Are all books free?',
      a: 'Yes! Zesho provides access to public domain books and free samples. No payment is required.',
    },
    {
      q: 'How do I switch dark mode?',
      a: 'Go to Profile → Settings → Dark Mode toggle.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Help Center</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.aboutCard, { backgroundColor: colors.surfaceElevated }]}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.logoText, { color: colors.onPrimary }]}>Z</Text>
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Zesho</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>FAQ</Text>
        {faqItems.map((item, i) => (
          <View key={i} style={[styles.faqCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{item.q}</Text>
            <Text style={[styles.faqA, { color: colors.textSecondary }]}>{item.a}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Contact</Text>
        <TouchableOpacity
          style={[styles.contactItem, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          onPress={() => Linking.openURL('mailto:zesho.support@gmail.com')}
          activeOpacity={0.7}
        >
          <Ionicons name="mail-outline" size={20} color={colors.primary} />
          <Text style={[styles.contactText, { color: colors.textPrimary }]}>zesho.support@gmail.com</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  aboutCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xxl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
  },
  appName: {
    fontSize: FontSize.heading4,
    fontWeight: '700',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: FontSize.bodySm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  faqCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  faqQ: {
    fontSize: FontSize.bodyMd,
    fontWeight: '600',
    marginBottom: 6,
  },
  faqA: {
    fontSize: FontSize.bodySm,
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  contactText: {
    fontSize: FontSize.bodyMd,
    fontWeight: '500',
  },
});
