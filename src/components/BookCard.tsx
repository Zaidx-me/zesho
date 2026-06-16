import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Book } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { BookCoverPlaceholder, BookSkeleton } from './BookCoverPlaceholder';

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  size?: number;
  loading?: boolean;
}

export const BookCard = React.memo(function BookCard({ book, onPress, size = 140, loading }: BookCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  const imageHeight = size * 1.35;

  if (loading) {
    return (
      <View style={[styles.card, { width: size }]}>
        <BookSkeleton width={size} height={imageHeight} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { width: size }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { width: size, height: imageHeight }]}>
        {book.thumbnail ? (
          <Image
            source={{ uri: book.thumbnail }}
            style={styles.image}
          />
        ) : (
          <BookCoverPlaceholder title={book.title} width={size} height={imageHeight} />
        )}
      </View>
      <Text
        style={[styles.title, { color: colors.textPrimary }]}
        numberOfLines={2}
      >
        {book.title}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: FontSize.bodySm,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.1,
  },

});
