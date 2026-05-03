import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { ChapterCard } from '../components/cards/ChapterCard';
import { VerseListItem } from '../components/cards/VerseListItem';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { useGita } from '../hooks/useGita';
import { AppNavigation } from '../types/navigation';

const CHAPTERS = Array.from({ length: 18 }, (_, i) => i + 1);

export const ChapterBrowserScreen: React.FC = () => {
  const { searchVerses } = useGita();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<AppNavigation>();

  const searchResults = useMemo(() => {
    if (searchQuery.length > 2) return searchVerses(searchQuery);
    return [];
  }, [searchQuery, searchVerses]);

  return (
    <ScreenWrapper style={styles.safeArea}>
      <ScreenHeader title="Krishna Uvacha" />

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search color={COLORS.tertiary} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search verses (e.g. Yoga, Karma)"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {searchQuery.length > 2 ? (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <VerseListItem
              verse={item}
              onPress={() => navigation.navigate('Reader', { verseId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <AppText variant="label" color={COLORS.textMuted} style={styles.resultsLabel}>
              {searchResults.length} results for "{searchQuery}"
            </AppText>
          )}
        />
      ) : (
        <FlatList
          data={CHAPTERS}
          keyExtractor={item => item.toString()}
          renderItem={({ item }) => (
            <ChapterCard
              number={item}
              onPress={() => navigation.navigate('Reader', { chapter: item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              <AppText variant="body" color={COLORS.textMuted}>
                Explore the 18 chapters of divine conversation between Lord Krishna and Arjuna.
              </AppText>
            </View>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
  },
  listHeader: {
    marginBottom: SPACING.xl,
  },
  searchBarContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderRadius: ROUNDNESS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: COLORS.text,
  },
  resultsLabel: {
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
});
