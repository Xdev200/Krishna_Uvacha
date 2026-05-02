import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Share,
  FlatList,
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Share2, Bookmark, Sparkles, Flame } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { VerseHeroCard } from '../components/common/VerseHeroCard';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { COLORS, SPACING, ROUNDNESS, FONTS, SHADOWS } from '../theme/tokens';
import { useGita, useVerse } from '../hooks/useGita';
import { dbService } from '../services/dbService';
import { Verse } from '../services/gitaService';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 60;
const TAB_BAR_HEIGHT = 80;

interface ReaderScreenProps {
  route: {
    params: {
      verseId?: string;
      isShuffle?: boolean;
      chapter?: number;
    };
  };
}

type Lang = 'en' | 'hi';

const VerseItem = ({ 
  verse, 
  lang, 
  isBookmarked, 
  onToggleBookmark, 
  onShare,
  itemHeight
}: { 
  verse: Verse; 
  lang: Lang; 
  isBookmarked: boolean; 
  onToggleBookmark: () => void; 
  onShare: () => void;
  itemHeight: number;
}) => {
  const translation = lang === 'en' ? verse.english_translation : verse.hindi_translation;
  
  return (
    <View style={[styles.verseItem, { height: itemHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.verseItemContent}>
        {/* Verse hero card */}
        <VerseHeroCard
          sanskrit={verse.sanskrit}
          // transliteration={verse.transliteration}
          chapter={verse.chapter}
          verse={verse.verse}
        />

        {/* Interpretation section */}
        <View style={styles.body}>
          <View style={styles.interpretationHeader}>
            <View style={styles.interpretationTitle}>
              <Sparkles color={COLORS.sanskrit} size={20} />
              <AppText variant="headline" color={COLORS.primary} style={styles.interpretationLabel}>
                Interpretation
              </AppText>
            </View>
            <View style={styles.bodyActions}>
              <TouchableOpacity onPress={onToggleBookmark} style={styles.actionBtn}>
                <Bookmark
                  color={isBookmarked ? COLORS.primary : COLORS.textMuted}
                  fill={isBookmarked ? COLORS.primary : 'none'}
                  size={24}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
                <Share2 color={COLORS.textMuted} size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quote block */}
          <View style={styles.quoteBlock}>
            <AppText variant="body" style={styles.quoteText}>
              "{translation}"
            </AppText>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ route }) => {
  const { verseId, isShuffle, chapter } = route.params;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { getAllVerses, getRandomVerses, getVersesByChapter, getChapterName } = useGita();
  const [lang, setLang] = useState<Lang>('en');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  
  const [listHeight, setListHeight] = useState(WINDOW_HEIGHT - 200); // Fallback
  
  const itemHeight = listHeight;

  const headerTitle = chapter ? getChapterName(chapter) : "Krishna Uvaach";

  React.useEffect(() => {
    let initialVerses: Verse[] = [];
    if (chapter) {
      initialVerses = getVersesByChapter(chapter);
    } else if (isShuffle) {
      const random = getRandomVerses(100);
      if (verseId) {
        const firstVerse = getAllVerses().find(v => v.id === verseId);
        if (firstVerse) {
          initialVerses = [firstVerse, ...random.filter(v => v.id !== verseId)];
        } else {
          initialVerses = random;
        }
      } else {
        initialVerses = random;
      }
    } else if (verseId) {
      const all = getAllVerses();
      const startIndex = all.findIndex(v => v.id === verseId);
      if (startIndex !== -1) {
        initialVerses = all.slice(startIndex);
      }
    } else {
      initialVerses = getAllVerses();
    }
    setVerses(initialVerses);

    // Initial bookmarks
    initialVerses.forEach(async (v) => {
      const bookmarked = await dbService.isBookmarked(v.id);
      setBookmarks(prev => ({ ...prev, [v.id]: bookmarked }));
    });
  }, [verseId, isShuffle, chapter]);

  const toggleBookmark = async (verse: Verse) => {
    const isBookmarked = bookmarks[verse.id];
    if (isBookmarked) {
      await dbService.removeBookmark(verse.id);
    } else {
      await dbService.addBookmark(verse.id);
    }
    setBookmarks(prev => ({ ...prev, [verse.id]: !isBookmarked }));
  };

  const onShare = async (verse: Verse) => {
    try {
      await Share.share({
        message: `${verse.sanskrit}\n\n— Bhagavad Gita ${verse.chapter}.${verse.verse}`,
      });
    } catch {}
  };

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    if (verses[index]) {
      dbService.addToHistory(verses[index].id);
    }
  };

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <ScreenHeader
          title={chapter ? `Chapter ${chapter}` : "Krishna Uvaach"}
          subtitle={chapter ? getChapterName(chapter) : undefined}
          onBack={() => navigation.goBack()}
          right={
            <View style={styles.headerRight}>
              <View style={styles.langToggle}>
                {(['en', 'hi'] as Lang[]).map(l => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setLang(l)}
                    style={[styles.langPill, lang === l && styles.langPillActive]}
                  >
                    <AppText
                      variant="caption"
                      color={lang === l ? COLORS.surface : COLORS.primary}
                      style={styles.langLabel}
                    >
                      {l.toUpperCase()}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.streakContainer}>
                <AppText variant="caption" color={COLORS.primary} style={styles.streakText}>
                  7
                </AppText>
                <Flame color={COLORS.primary} size={16} fill={COLORS.primary} />
              </View>
            </View>
          }
        />
      </SafeAreaView>

      <View style={{ flex: 1 }} onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}>
        <FlatList
          data={verses}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          removeClippedSubviews={true}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          renderItem={({ item }) => (
            <VerseItem
              verse={item}
              lang={lang}
              isBookmarked={!!bookmarks[item.id]}
              onToggleBookmark={() => toggleBookmark(item)}
              onShare={() => onShare(item)}
              itemHeight={itemHeight}
            />
          )}
        />
      </View>

      <BottomTabBar active="Feed" />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  backBtn: {
    marginRight: SPACING.xs,
  },
  headerTitle: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: ROUNDNESS.full,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: ROUNDNESS.full,
  },
  langPillActive: {
    backgroundColor: COLORS.primary,
  },
  langLabel: {
    // Basic styles handled by 'caption' variant
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    // Basic styles handled by 'caption' variant
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Account for bottom tab bar
  },
  verseItem: {
    width: '100%',
  },
  verseItemContent: {
    paddingBottom: SPACING.xl,
  },
  body: {
    padding: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  interpretationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  interpretationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  interpretationLabel: {
    // Basic styles handled by 'headline' variant
  },
  bodyActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    padding: 4,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  quoteText: {
    // Basic styles handled by 'body' variant
  },
});
