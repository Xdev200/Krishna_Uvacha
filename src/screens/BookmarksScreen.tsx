import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Trash2 } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { BookmarksBackground } from '../components/common/AnimatedBackground';
import { VerseListItem } from '../components/cards/VerseListItem';
import { COLORS, SPACING, LAYOUT, ROUNDNESS } from '../theme/tokens';
import { dbService } from '../services/dbService';
import { gitaService, Verse } from '../services/gitaService';
import { AppNavigation } from '../types/navigation';

export const BookmarksScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigation>();
  const [bookmarks, setBookmarks] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const bookmarkIds = await dbService.getBookmarks();
    const allVerses = gitaService.getAllVerses();
    setBookmarks(allVerses.filter(v => bookmarkIds.includes(v.id)));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
      return () => {
        setIsSelecting(false);
        setSelectedIds(new Set());
      };
    }, [loadBookmarks])
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedIds(new Set([id]));
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === bookmarks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(bookmarks.map(b => b.id)));
    }
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  };

  const batchRemove = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const idsToRemove = Array.from(selectedIds);

    // Optimistically update UI
    setBookmarks(prev => prev.filter(v => !selectedIds.has(v.id)));
    setIsSelecting(false);
    setSelectedIds(new Set());

    // Persist to database
    await Promise.all(idsToRemove.map(id => dbService.removeBookmark(id)));
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Bookmarks',
      'Are you sure you want to remove all saved verses?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            const ids = await dbService.getBookmarks();
            await Promise.all(ids.map(id => dbService.removeBookmark(id)));
            setBookmarks([]);
            setIsSelecting(false);
            setSelectedIds(new Set());
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <BookmarksBackground />
      <SafeAreaView edges={['top']} style={styles.headerArea}>
        <ScreenHeader
          title={isSelecting ? `${selectedIds.size} Selected` : 'Bookmarks'}
          onBack={isSelecting ? cancelSelection : () => navigation.goBack()}
          right={
            isSelecting ? (
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={toggleSelectAll} style={styles.actionPill}>
                  <AppText variant="caption" color={COLORS.primary}>
                    {selectedIds.size === bookmarks.length ? 'DESELECT' : 'ALL'}
                  </AppText>
                </TouchableOpacity>

                {selectedIds.size > 0 && (
                  <TouchableOpacity
                    onPress={batchRemove}
                    style={[styles.actionPill, styles.deletePill]}
                  >
                    <Trash2 size={14} color={COLORS.error} />
                    <AppText variant="caption" color={COLORS.error}>
                      REMOVE ({selectedIds.size})
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            ) : bookmarks.length > 0 ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsSelecting(true)}
                  style={styles.actionPill}
                >
                  <AppText variant="label" color={COLORS.primary}>
                    SELECT
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAll} style={styles.actionPill}>
                  <AppText variant="label" color={COLORS.error}>
                    CLEAR ALL
                  </AppText>
                </TouchableOpacity>
              </View>
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
          extraData={{ isSelecting, selectedIds }}
          renderItem={({ item }) => (
            <VerseListItem
              verse={item}
              isSelectable={isSelecting}
              isSelected={selectedIds.has(item.id)}
              onPress={() => {
                if (isSelecting) {
                  toggleSelect(item.id);
                } else {
                  navigation.navigate('Reader', { verseId: item.id });
                }
              }}
              onLongPress={() => handleLongPress(item.id)}
              onSelect={() => toggleSelect(item.id)}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: ROUNDNESS.full,
  },
  deletePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
