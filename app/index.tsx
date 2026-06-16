import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const { user, loading, skipped } = useAuth();
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              backgroundColor: colors.buttonPrimary,
              opacity: opacityAnim,
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <Text style={[styles.logoText, { color: colors.buttonPrimaryText }]}>Z</Text>
        </Animated.View>
        <Animated.Text
          style={[styles.appName, { color: colors.textPrimary, opacity: opacityAnim }]}
        >
          Zesho
        </Animated.Text>
      </View>
    );
  }

  if (user || skipped) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 44,
    fontWeight: '800',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
