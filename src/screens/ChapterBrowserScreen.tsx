import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '../components/common/AppText';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { ChapterCard } from '../components/cards/ChapterCard';
import { useGita } from '../hooks/useGita';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeader } from '../components/layout/ScreenHeader';

export const ChapterBrowserScreen: React.FC = () => {
  const { searchVerses } = useGita();
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<any>();
  
  const chapters = Array.from({ length: 18 }, (_, i) => i + 1);

  const searchResults = useMemo(() => {
    if (searchQuery.length > 2) {
      return searchVerses(searchQuery);
    }
    return [];
  }, [searchQuery, searchVerses]);

  return (
    <ScreenWrapper style={styles.safeArea}>
      <ScreenHeader title="Krishna Uvaach" />

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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Reader', { verseId: item.id })}
              style={styles.resultItem}
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
          ListHeaderComponent={() => (
            <AppText variant="label" color={COLORS.textMuted} style={styles.resultsLabel}>
              {searchResults.length} results found for "{searchQuery}"
            </AppText>
          )}
        />
      ) : (
        <FlatList
          data={chapters}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <ChapterCard 
              number={item} 
              onPress={() => {
                navigation.navigate('Reader', { chapter: item });
              }}
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
  resultItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: ROUNDNESS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  preview: {
    marginTop: SPACING.xs,
    fontSize: 14,
    lineHeight: 20,
  },
  resultsLabel: {
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
  },
});
