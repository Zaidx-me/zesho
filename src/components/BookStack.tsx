import React, { useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, Animated,
  PanResponder, Dimensions, TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const SWIPE_THRESHOLD = 120;
const CARD_WIDTH = Dimensions.get('window').width - Spacing.xxl * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.72;
const VISIBLE_STACK = 3;

interface BookStackProps {
  books: Book[];
  title?: string;
}

export function BookStack({ books, title }: BookStackProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const stack = useMemo(() => books.slice(0, 10), [books]);

  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const currentIdx = useRef(0);
  const [, forceUpdate] = React.useState(0);

  const nextCard = useCallback(() => {
    if (currentIdx.current < stack.length - 1) {
      currentIdx.current += 1;
      pan.setValue({ x: 0, y: 0 });
      scale.setValue(1);
      forceUpdate(n => n + 1);
    }
  }, [stack.length, pan, scale]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        pan.setValue({ x: g.dx, y: 0 });
        const s = Math.max(0.92, 1 - Math.abs(g.dx) / (CARD_WIDTH * 2));
        scale.setValue(s);
      },
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) {
          const dir = g.dx > 0 ? 1 : -1;
          Animated.timing(pan, {
            toValue: { x: dir * CARD_WIDTH * 1.5, y: 0 },
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            scale.setValue(1);
            nextCard();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 7,
            useNativeDriver: true,
          }).start();
          Animated.spring(scale, {
            toValue: 1,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const cardPress = useCallback((book: Book) => {
    router.push(`/book/${book.id}`);
  }, [router]);

  if (stack.length === 0) return null;

  const visibleCards = stack.slice(currentIdx.current, currentIdx.current + VISIBLE_STACK);

  return (
    <View style={styles.wrapper}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <View style={styles.dots}>
            {stack.slice(0, Math.min(6, stack.length)).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === 0 ? colors.textPrimary : colors.textMuted,
                    width: i === 0 ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.stackContainer}>
        {visibleCards.map((book, i) => {
          const isTop = i === 0;
          const offsetY = i * 8;
          const offsetScale = 1 - i * 0.04;

          if (isTop) {
            return (
              <Animated.View
                key={book.id + currentIdx.current}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    zIndex: visibleCards.length - i,
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: Animated.multiply(scale, offsetScale) },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => cardPress(book)}
                  style={styles.cardInner}
                >
                  <Image source={{ uri: book.thumbnail }} style={styles.cover} />
                  <View style={[styles.cardBody, { borderLeftColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    {book.authors?.length > 0 && (
                      <Text style={[styles.cardAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
                        {book.authors.join(', ')}
                      </Text>
                    )}
                    {book.description && (
                      <Text style={[styles.cardDesc, { color: colors.textMuted }]} numberOfLines={3}>
                        {book.description.replace(/<[^>]*>/g, '')}
                      </Text>
                    )}
                    <View style={styles.cardFooter}>
                      {book.averageRating > 0 && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={13} color="#f5a623" />
                          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                            {book.averageRating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                      {book.pageCount > 0 && (
                        <Text style={[styles.pages, { color: colors.textMuted }]}>{book.pageCount} pages</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }

          return (
            <View
              key={book.id}
              style={[
                styles.card,
                styles.cardBack,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                  top: offsetY,
                  transform: [{ scale: offsetScale }],
                  zIndex: visibleCards.length - i,
                  opacity: 0.5 - i * 0.12,
                },
              ]}
            >
              <View style={styles.cardInner}>
                <View style={[styles.cover, { backgroundColor: colors.surfaceElevated }]} />
                <View style={styles.cardBody} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="chevron-back" size={14} color={colors.textMuted} />
        <Text style={[styles.hintText, { color: colors.textMuted }]}>Swipe to explore</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.heading4, fontWeight: '700', letterSpacing: -0.3,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { height: 6, borderRadius: 3 },

  stackContainer: {
    height: CARD_HEIGHT + 30,
    marginBottom: Spacing.sm,
  },

  card: {
    position: 'absolute',
    left: 0, right: 0,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  cardBack: {
    shadowOpacity: 0,
    elevation: 0,
  },
  cardInner: {
    flexDirection: 'row',
    flex: 1,
  },
  cover: {
    width: CARD_WIDTH * 0.38,
    height: '100%',
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
    borderLeftWidth: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: FontSize.bodyMdMedium,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  cardDesc: {
    fontSize: FontSize.caption,
    lineHeight: 18,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.sm, fontWeight: '500' },
  pages: { fontSize: FontSize.xs },

  hintRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.xs,
  },
  hintText: { fontSize: FontSize.xs },
});
