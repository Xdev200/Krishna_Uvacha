import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../components/common/AppText';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { dbService } from '../services/dbService';
import { gitaService, Verse } from '../services/gitaService';
import { ChevronLeft, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

interface BookmarksScreenProps {
  navigation: any;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    const bookmarkIds = await dbService.getBookmarks();
    const allVerses = gitaService.getAllVerses();
    const filtered = allVerses.filter(v => bookmarkIds.includes(v.id));
    setBookmarks(filtered);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [loadBookmarks])
  );

  const clearAll = async () => {
    // Logic to clear all bookmarks could go here
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft color={COLORS.primary} size={24} />
        </TouchableOpacity>
        <AppText variant="headline" color={COLORS.primary}>
          Bookmarks
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      {bookmarks.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <AppText variant="body" color={COLORS.textMuted} centered>
            You haven't bookmarked any verses yet.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Reader', { verseId: item.id })}
              style={styles.bookmarkItem}
            >
              <AppText variant="label" color={COLORS.tertiary}>
                CH {item.chapter} • VERSE {item.verse}
              </AppText>
              <AppText variant="body" numberOfLines={2} style={styles.preview}>
                {item.english_translation}
              </AppText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    padding: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
  },
  bookmarkItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDNESS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  preview: {
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
});
