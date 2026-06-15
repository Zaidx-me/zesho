import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Book } from '../types';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  size?: number;
}

export function BookCard({ book, onPress, size = 140 }: BookCardProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/book/${book.id}`);
    }
  };

  const imageHeight = size * 1.45;

  return (
    <TouchableOpacity style={[styles.card, { width: size }]} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.imageContainer, { width: size, height: imageHeight, backgroundColor: colors.surface }]}>
        {book.thumbnail ? (
          <Image source={{ uri: book.thumbnail }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.placeholderText, { color: colors.primary }]}>{book.title.charAt(0)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>{book.title}</Text>
      <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>{book.authors[0]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  author: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
});
