import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <Ionicons name="book-outline" size={120} color={Colors.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Discover Your Next Read</Text>
          <Text style={styles.description}>
            Browse thousands of books, track your reading progress, and share your thoughts with notes.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Search & discover books</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="library" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Build your library</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="pencil" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Write notes & reviews</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  illustration: {
    marginBottom: Spacing.huge,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    width: '100%',
    gap: Spacing.lg,
    marginBottom: Spacing.huge,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  featureText: {
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    width: '100%',
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
