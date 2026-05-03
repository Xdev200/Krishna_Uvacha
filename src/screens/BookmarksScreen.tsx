import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppText } from '../components/common/AppText';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { BookmarksBackground } from '../components/common/AnimatedBackground';
import { VerseListItem } from '../components/cards/VerseListItem';
import { COLORS, SPACING, LAYOUT } from '../theme/tokens';
import { dbService } from '../services/dbService';
import { gitaService, Verse } from '../services/gitaService';
import { AppNavigation } from '../types/navigation';

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigation>();
  const [bookmarks, setBookmarks] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const bookmarkIds = await dbService.getBookmarks();
    const allVerses = gitaService.getAllVerses();
    setBookmarks(allVerses.filter(v => bookmarkIds.includes(v.id)));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadBookmarks(); }, [loadBookmarks]));

  const clearAll = async () => {
    const ids = await dbService.getBookmarks();
    await Promise.all(ids.map(id => dbService.removeBookmark(id)));
    setBookmarks([]);
  };

  return (
    <View style={styles.container}>
      <BookmarksBackground />
      <SafeAreaView edges={['top']} style={styles.headerArea}>
        <ScreenHeader
          title="Bookmarks"
          onBack={() => navigation.goBack()}
          right={
            bookmarks.length > 0 ? (
              <TouchableOpacity onPress={clearAll}>
                <AppText variant="label" color={COLORS.error}>CLEAR ALL</AppText>
              </TouchableOpacity>
            ) : undefined
          }
        />
      </SafeAreaView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : bookmarks.length === 0 ? (
        <View style={styles.centered}>
          <AppText variant="body" color={COLORS.textMuted} centered>
            You haven't bookmarked any verses yet.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <VerseListItem
              verse={item}
              onPress={() => navigation.navigate('Reader', { verseId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <BottomTabBar active="Saved" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.md,
  },
});
