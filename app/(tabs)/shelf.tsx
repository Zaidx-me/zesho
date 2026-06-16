import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BookRow } from '../../src/components/BookRow';
import { SkeletonRow } from '../../src/components/SkeletonLoader';
import { RequestBookModal } from '../../src/components/RequestBookModal';
import { Book } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import { getCachedBooks, preloadBooks } from '../../src/services/bookCache';
import { getUrduBooksByMainCategory, getUrduMainCategories } from '../../src/services/urduBooks';
import { getPdfBooksByMainCategory, getPdfTopCategories } from '../../src/services/pdfBooksFree';
import { Spacing, FontSize, BorderRadius } from '../../src/constants/theme';

type Tab = 'urdu' | 'pdf';

interface RowDef {
  title: string;
  key: string;
  query: string;
  shelfKey: string;
}

export default function CollectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const scrollRef = useRef<FlatList>(null);
  const [activeTab, setActiveTab] = useState<Tab>('urdu');
  const [rowData, setRowData] = useState<Record<string, Book[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const nav = useNavigation();
  const lastTapRef = useRef(0);

  useEffect(() => {
    const unsub = (nav as any).addListener('tabPress', () => {
      const now = Date.now();
      if (now - lastTapRef.current < 400) {
        scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    });
    return unsub;
  }, [nav]);

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'urdu', label: 'Urdu Books', icon: 'book' },
    { key: 'pdf', label: 'PDF Books', icon: 'document-text' },
  ];

  const ROWS = useMemo<Record<Tab, RowDef[]>>(() => ({
    urdu: getUrduMainCategories().map(c => ({
      title: c.name, key: `urdu_${c.name}`, query: c.name,
      shelfKey: `urdu_${c.name.toLowerCase().replace(/\s+/g, '_')}`,
    })),
    pdf: getPdfTopCategories(8).map(c => ({
      title: c.name, key: `pdf_${c.name}`, query: c.name,
      shelfKey: `pdf_${c.name.toLowerCase().replace(/\s+/g, '_')}`,
    })),
  }), []);

  const currentRows = ROWS[activeTab];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        currentRows.map(row =>
          activeTab === 'urdu'
            ? Promise.resolve(getUrduBooksByMainCategory(row.query, 20))
            : activeTab === 'pdf'
            ? Promise.resolve(getPdfBooksByMainCategory(row.query, 20))
            : getCachedBooks(row.key, row.query, 20)
        )
      );
      const data: Record<string, Book[]> = {};
      currentRows.forEach((row, i) => {
        if (results[i].status === 'fulfilled') {
          data[row.key] = results[i].value.filter((b: Book) => b.thumbnail);
        } else {
          data[row.key] = [];
        }
      });
      setRowData(data);
    } catch {}
    setLoading(false);
  }, [activeTab, currentRows]);

  useEffect(() => {
    preloadBooks();
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleSeeAll = useCallback((row: RowDef) => {
    router.push({
      pathname: '/shelf/[category]',
      params: { category: row.shelfKey, title: row.title, query: row.query },
    });
  }, [router]);

  const renderItem = useCallback<ListRenderItem<RowDef>>(({ item }) => (
    <BookRow
      title={item.title}
      books={rowData[item.key] || []}
      bookSize={130}
      onSeeAll={() => handleSeeAll(item)}
    />
  ), [rowData, handleSeeAll]);

  const headerComponent = useMemo(() => (
    <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: Spacing.lg }}>
      <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Collections</Text>

      <View style={styles.tabRow}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                isActive && { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
              ]}
              onPress={() => { setActiveTab(tab.key); setRowData({}); }}
              activeOpacity={0.7}
            >
              <Ionicons name={tab.icon as any} size={16} color={isActive ? colors.background : colors.textSecondary} />
              <Text style={[styles.tabLabel, { color: isActive ? colors.background : colors.textSecondary }, isActive && { fontWeight: '700' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.requestBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        onPress={() => setShowRequest(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />
        <Text style={[styles.requestBtnText, { color: colors.textSecondary }]}>Can't find a book? Request it</Text>
      </TouchableOpacity>
    </View>
  ), [colors, activeTab]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ paddingTop: insets.top + Spacing.md }}>
          {headerComponent}
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={scrollRef}
        data={currentRows}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.md }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} />}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={4}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
      />
      <RequestBookModal visible={showRequest} onClose={() => setShowRequest(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  pageTitle: { fontSize: FontSize.heading3, fontWeight: '800', letterSpacing: -0.5, marginBottom: Spacing.md },
  tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  tabLabel: { fontSize: FontSize.sm, fontWeight: '500' },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg,
  },
  requestBtnText: { fontSize: FontSize.sm, fontWeight: '500' },
});
