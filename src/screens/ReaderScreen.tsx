import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Share,
  FlatList,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Bookmark, Share2, Sparkles, Flame } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { VerseHeroCard } from '../components/common/VerseHeroCard';
import { VerticalActions } from '../components/common/VerticalActions';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { useGita } from '../hooks/useGita';
import { useStreak } from '../hooks/useStreak';
import { dbService } from '../services/dbService';
import { speechService } from '../services/speechService';
import { Verse } from '../services/gitaService';
import { AppNavigation, ReaderRouteProp } from '../types/navigation';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface ReaderScreenProps {
  route: ReaderRouteProp;
}

type Lang = 'en' | 'hi';

const VerseItem = ({
  verse,
  lang,
  isBookmarked,
  isSpeaking,
  onToggleBookmark,
  onShare,
  onToggleSpeech,
  itemHeight,
}: {
  verse: Verse;
  lang: Lang;
  isBookmarked: boolean;
  isSpeaking: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onToggleSpeech: () => void;
  itemHeight: number;
}) => {
  const translation = lang === 'en' ? verse.english_translation : verse.hindi_translation;

  return (
    <View style={[styles.verseItem, { height: itemHeight }]}>
      <View style={styles.verseRow}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.verseItemContent}
          style={styles.verseScroll}
        >
          <VerseHeroCard
            sanskrit={verse.sanskrit}
            // transliteration={verse.transliteration}
            chapter={verse.chapter}
            verse={verse.verse}
          />

          <View style={styles.body}>
            <View style={styles.interpretationHeader}>
              <View style={styles.interpretationTitle}>
                <Sparkles color={COLORS.sanskrit} size={20} />
                <AppText variant="headline" color={COLORS.primary}>
                  Interpretation
                </AppText>
              </View>
            </View>

            <View style={styles.quoteBlock}>
              <AppText variant="body">"{translation}"</AppText>
            </View>
          </View>
        </ScrollView>

        <VerticalActions
          isBookmarked={isBookmarked}
          isSpeaking={isSpeaking}
          onToggleBookmark={onToggleBookmark}
          onShare={onShare}
          onToggleSpeech={onToggleSpeech}
        />
      </View>
    </View>
  );
};

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ route }) => {
  const { verseId, isShuffle, chapter } = route.params ?? {};
  const navigation = useNavigation<AppNavigation>();
  const { getAllVerses, getRandomVerses, getVersesByChapter, getChapterName } = useGita();
  const streak = useStreak();
  const [lang, setLang] = useState<Lang>('en');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false); // New state for autoplay control
  const [listHeight, setListHeight] = useState(WINDOW_HEIGHT - 200);

  const itemHeight = listHeight;
  const chapterName = chapter ? getChapterName(chapter) : undefined;

  React.useEffect(() => {
    let initialVerses: Verse[] = [];
    if (chapter) {
      initialVerses = getVersesByChapter(chapter);
    } else if (isShuffle) {
      const random = getRandomVerses(100);
      if (verseId) {
        const firstVerse = getAllVerses().find(v => v.id === verseId);
        initialVerses = firstVerse
          ? [firstVerse, ...random.filter(v => v.id !== verseId)]
          : random;
      } else {
        initialVerses = random;
      }
    } else if (verseId) {
      const all = getAllVerses();
      const startIndex = all.findIndex(v => v.id === verseId);
      if (startIndex !== -1) initialVerses = all.slice(startIndex);
    } else {
      initialVerses = getAllVerses();
    }
    setVerses(initialVerses);

    dbService.getBookmarks().then(ids => {
      setBookmarks(Object.fromEntries(ids.map(id => [id, true])));
    });
  }, [verseId, isShuffle, chapter]);

  // Initial autoplay for the first verse
  React.useEffect(() => {
    if (verses.length > 0 && !isMuted && !speakingId) {
      startSpeech(verses[0]);
    }
  }, [verses, isMuted]);

  // Stop speech when screen is blurred (navigating away)
  useFocusEffect(
    useCallback(() => {
      return () => {
        speechService.stop();
        setSpeakingId(null);
      };
    }, [])
  );

  // Stop speech when app goes to background
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        speechService.stop();
        setSpeakingId(null);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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

  const startSpeech = async (verse: Verse) => {
    setSpeakingId(verse.id);
    const translation = lang === 'en' ? verse.english_translation : verse.hindi_translation;
    await speechService.speakVerse(
      verse.sanskrit,
      translation,
      lang,
      () => setSpeakingId(null)
    );
  };

  const toggleSpeech = async (verse: Verse) => {
    if (!isMuted) {
      // Mute
      await speechService.stop();
      setSpeakingId(null);
      setIsMuted(true);
    } else {
      // Unmute and start current verse
      setIsMuted(false);
      await startSpeech(verse);
    }
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    const currentVerse = verses[index];
    if (currentVerse) {
      dbService.addToHistory(currentVerse.id);
      
      // Handle speech autoplay
      if (speakingId && speakingId !== currentVerse.id) {
        speechService.stop();
        setSpeakingId(null);
      }
      
      if (!isMuted) {
        startSpeech(currentVerse);
      }
    }
  };

  return (
    <View style={styles.safe}>
      <AnimatedBackground />
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <ScreenHeader
          title={chapter ? `Chapter ${chapter}` : 'Krishna Uvacha'}
          subtitle={chapterName}
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
                    >
                      {l.toUpperCase()}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.streakContainer}>
                <AppText variant="caption" color={COLORS.primary}>
                  {streak}
                </AppText>
                <Flame color={COLORS.primary} size={16} fill={COLORS.primary} />
              </View>
            </View>
          }
        />
      </SafeAreaView>

      <View style={styles.listContainer} onLayout={e => setListHeight(e.nativeEvent.layout.height)}>
        <FlatList
          data={verses}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          removeClippedSubviews
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
              isSpeaking={!isMuted} // Reflect global mute state
              onToggleBookmark={() => toggleBookmark(item)}
              onShare={() => onShare(item)}
              onToggleSpeech={() => toggleSpeech(item)}
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
  },
  headerContainer: {
  },
  listContainer: {
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verseItem: {
    width: '100%',
  },
  verseRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch', // Allow sidebar to fill height for centering
  },
  verseScroll: {
    flex: 1,
  },
  verseItemContent: {
    paddingBottom: SPACING.xl,
  },
  body: {
    padding: SPACING.lg,
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
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  wordMeanings: {
    lineHeight: 18,
    opacity: 0.7,
  },
});
