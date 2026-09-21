import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
  Share,
  FlatList,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Sparkles, Flame, Play, Pause } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { VerseHeroCard } from '../components/common/VerseHeroCard';
import { VerticalActions } from '../components/common/VerticalActions';
import { VerseProgressBar } from '../components/common/VerseProgressBar';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { DailyReminderModal } from '../components/common/DailyReminderModal';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { useGita } from '../hooks/useGita';
import { useStreak } from '../hooks/useStreak';
import { dbService } from '../services/dbService';
import { speechService } from '../services/speechService';
import { notificationService } from '../services/notificationService';
import { Verse } from '../services/gitaService';
import { AppNavigation, ReaderRouteProp } from '../types/navigation';
import { AnimatedBackground } from '../components/common/AnimatedBackground';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

interface ReaderScreenProps {
  route: ReaderRouteProp;
}

type Lang = 'en' | 'hi';

/**
 * Calculates dynamic verse duration concurrent with audio.
 */
const getVerseDuration = (verse?: Verse, lang: Lang = 'en', isMuted: boolean = false): number => {
  if (!verse) return 15000;
  const translation = (lang === 'en' ? verse.english_translation : verse.hindi_translation) || '';
  if (!isMuted) {
    return speechService.estimateVerseAudioDuration(verse.sanskrit, translation, lang);
  }
  return Math.max(12000, translation.length * 75 + 5000);
};

const VerseItem = ({
  verse,
  lang,
  isBookmarked,
  isSpeaking,
  isAutoScroll,
  isActive,
  isPaused,
  onToggleBookmark,
  onShare,
  onToggleSpeech,
  onToggleAutoScroll,
  onTogglePause,
  itemHeight,
}: {
  verse: Verse;
  lang: Lang;
  isBookmarked: boolean;
  isSpeaking: boolean;
  isAutoScroll: boolean;
  isActive: boolean;
  isPaused: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onToggleSpeech: () => void;
  onToggleAutoScroll: () => void;
  onTogglePause: () => void;
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
          <Pressable onPress={onTogglePause} style={styles.versePressable}>
            {/* Top Sanskrit Card without dark borders */}
            <VerseHeroCard
              sanskrit={verse.sanskrit}
              chapter={verse.chapter}
              verse={verse.verse}
              isActive={isActive}
              isPaused={isPaused}
            />

            {/* Bottom Interpretation Card — borderless, transparent/soft background */}
            <View style={styles.body}>
              <View style={styles.interpretationHeader}>
                <View style={styles.interpretationTitle}>
                  <Sparkles color={COLORS.primary} size={18} />
                  <AppText variant="headline" color={COLORS.primary} style={styles.interpretationHeading}>
                    Interpretation
                  </AppText>
                </View>
                <AppText variant="caption" color={COLORS.textMuted}>
                  {lang === 'en' ? 'English' : 'Hindi'}
                </AppText>
              </View>

              <View style={styles.quoteBlock}>
                <AppText variant="body" style={styles.translationText}>
                  "{translation}"
                </AppText>
              </View>
            </View>
          </Pressable>
        </ScrollView>

        <VerticalActions
          isBookmarked={isBookmarked}
          isSpeaking={isSpeaking}
          isAutoScroll={isAutoScroll}
          onToggleBookmark={onToggleBookmark}
          onShare={onShare}
          onToggleSpeech={onToggleSpeech}
          onToggleAutoScroll={onToggleAutoScroll}
        />
      </View>
    </View>
  );
};

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ route }) => {
  const { verseId, chapter } = route.params ?? {};
  const navigation = useNavigation<AppNavigation>();
  const { getAllVerses, getVersesByChapter, getChapterName } = useGita();
  const streak = useStreak();
  const [lang, setLang] = useState<Lang>('en');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [listHeight, setListHeight] = useState(WINDOW_HEIGHT - 200);

  // Daily reminder smart popup state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const hasPromptedInSessionRef = useRef(false);
  const pendingExitActionRef = useRef<(() => void) | null>(null);

  const flatListRef = useRef<FlatList<Verse>>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reanimated values for tap-to-pause feedback overlay
  const feedbackOpacity = useSharedValue(0);
  const feedbackScale = useSharedValue(0.85);

  const itemHeight = listHeight;
  const chapterName = chapter ? getChapterName(chapter) : undefined;
  const currentVerse = verses[currentIndex];
  const verseDuration = getVerseDuration(currentVerse, lang, isMuted);
  const handleVerseCompleteRef = useRef<() => void>(() => {});

  useEffect(() => {
    const loadVerses = async () => {
      let initialVerses: Verse[] = [];

      if (chapter) {
        initialVerses = getVersesByChapter(chapter);
      } else if (verseId) {
        const all = getAllVerses();
        const foundIndex = all.findIndex(v => v.id === verseId);
        if (foundIndex !== -1) {
          initialVerses = all.slice(foundIndex);
        } else {
          initialVerses = all;
        }
      } else {
        const progress = await dbService.getProgress();
        const all = getAllVerses();
        if (progress) {
          const progressVerseId = `${progress.chapter}.${progress.verse}`;
          const foundIndex = all.findIndex(v => v.id === progressVerseId);
          if (foundIndex !== -1) {
            initialVerses = all.slice(foundIndex);
          } else {
            initialVerses = all;
          }
        } else {
          initialVerses = all;
        }
      }

      setVerses(initialVerses);
      setCurrentIndex(0);
      setIsPaused(false);
    };

    loadVerses();

    dbService.getBookmarks().then(ids => {
      setBookmarks(Object.fromEntries(ids.map(id => [id, true])));
    });
  }, [verseId, chapter]);

  // Initial autoplay for the first verse
  useEffect(() => {
    if (verses.length > 0 && !isMuted && !speakingId && !isPaused) {
      startSpeech(verses[0], lang);
    }
  }, [verses, isMuted]);

  // Stop speech when screen is blurred (navigating away) or on unmount
  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      speechService.stop();
      setSpeakingId(null);
    });

    return () => {
      unsubscribeBlur();
      speechService.stop();
      setSpeakingId(null);
    };
  }, [navigation]);

  // Screen focus: ensure default state is play and cleanup on blur
  useFocusEffect(
    useCallback(() => {
      setIsPaused(false);
      return () => {
        speechService.stop();
        setSpeakingId(null);
      };
    }, [])
  );

  // Stop speech when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState.match(/inactive|background/)) {
        speechService.stop();
        setSpeakingId(null);
      }
    });

    return () => {
      subscription.remove();
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Intercept back actions to prompt reminder if not allowed and user has read at least 1 verse
  const handleBackOrExit = useCallback(async (exitAction: () => void) => {
    speechService.stop();
    setSpeakingId(null);
    const allowed = await dbService.isReminderAllowed();
    const stats = await dbService.getProgressStats();
    if (!allowed && stats.versesRead >= 1 && notificationService.canPromptReminderInSession()) {
      pendingExitActionRef.current = exitAction;
      notificationService.recordReminderPromptShown();
      setReminderModalVisible(true);
    } else {
      exitAction();
    }
  }, []);

  // Handle hardware back press on Android
  useEffect(() => {
    const onBackPress = () => {
      handleBackOrExit(() => navigation.goBack());
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation, handleBackOrExit]);

  const triggerFeedback = useCallback((paused: boolean) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setShowFeedback(true);
    feedbackOpacity.value = 1;
    feedbackScale.value = 0.85;

    feedbackOpacity.value = withTiming(0, { duration: 750, easing: Easing.out(Easing.quad) });
    feedbackScale.value = withTiming(1.15, { duration: 750, easing: Easing.out(Easing.quad) });

    feedbackTimerRef.current = setTimeout(() => {
      setShowFeedback(false);
    }, 750);
  }, [feedbackOpacity, feedbackScale]);

  const feedbackAnimatedStyle = useAnimatedStyle(() => ({
    opacity: feedbackOpacity.value,
    transform: [{ scale: feedbackScale.value }],
  }));

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const nextPaused = !prev;
      triggerFeedback(nextPaused);

      if (nextPaused) {
        speechService.stop();
        setSpeakingId(null);
      } else {
        const curVerse = verses[currentIndex];
        if (curVerse && !isMuted) {
          startSpeech(curVerse, lang);
        }
      }

      return nextPaused;
    });
  }, [triggerFeedback, verses, currentIndex, isMuted, lang]);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScroll(prev => {
      const next = !prev;
      if (next) {
        setIsPaused(false);
      }
      return next;
    });
  }, []);

  const startSpeech = useCallback(async (verse: Verse, currentLang: Lang = lang) => {
    setSpeakingId(verse.id);
    const translation = currentLang === 'en' ? verse.english_translation : verse.hindi_translation;
    await speechService.speakVerse(
      verse.sanskrit,
      translation,
      currentLang,
      () => {
        // Interpretation audio completed!
        setSpeakingId(null);
        if (isAutoScroll && !isPaused) {
          handleVerseCompleteRef.current();
        }
      }
    );
  }, [lang, isAutoScroll, isPaused]);

  const handleVerseComplete = useCallback(async () => {
    if (!isAutoScroll || isPaused) return;

    // Check reminder prompt after completing a verse if not allowed yet (max 2 per session)
    if (!hasPromptedInSessionRef.current && notificationService.canPromptReminderInSession()) {
      const allowed = await dbService.isReminderAllowed();
      if (!allowed) {
        hasPromptedInSessionRef.current = true;
        notificationService.recordReminderPromptShown();
        setReminderModalVisible(true);
      }
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < verses.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
      setIsPaused(false); // Default state for any feed screen is play!

      const nextVerse = verses[nextIndex];
      if (nextVerse) {
        await dbService.addToHistory(nextVerse.id);
        await dbService.saveProgress(nextVerse.chapter, nextVerse.verse);

        speechService.stop();
        setSpeakingId(null);

        if (!isMuted) {
          startSpeech(nextVerse, lang);
        }
      }
    } else {
      setIsPaused(true);
    }
  }, [isAutoScroll, isPaused, currentIndex, verses, isMuted, lang, startSpeech]);

  useEffect(() => {
    handleVerseCompleteRef.current = handleVerseComplete;
  }, [handleVerseComplete]);

  const handleLanguageChange = (newL: Lang) => {
    if (newL === lang) return;
    setLang(newL);
    speechService.stop();
    setSpeakingId(null);
    const curVerse = verses[currentIndex];
    if (curVerse && !isMuted && !isPaused) {
      startSpeech(curVerse, newL);
    }
  };

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
      const translation = lang === 'en' ? verse.english_translation : verse.hindi_translation;
      await Share.share({
        message: `🙏 Read what Krishna says:\n\n"${verse.sanskrit}"\n\n— Bhagavad Gita ${verse.chapter}.${verse.verse}\n\n"${translation}"\n\nDownload Krishna Uvacha: https://play.google.com/store/apps/details?id=com.krishnauvacha`,
      });
    } catch {}
  };

  const toggleSpeech = async (verse: Verse) => {
    if (!isMuted) {
      await speechService.stop();
      setSpeakingId(null);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      await startSpeech(verse, lang);
    }
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    if (index >= 0 && index < verses.length && index !== currentIndex) {
      setCurrentIndex(index);
      setIsPaused(false); // Default state for any feed screen is play!
      const curVerse = verses[index];
      if (curVerse) {
        dbService.addToHistory(curVerse.id);
        dbService.saveProgress(curVerse.chapter, curVerse.verse);
        
        speechService.stop();
        setSpeakingId(null);
        
        if (!isMuted) {
          startSpeech(curVerse, lang);
        }
      }
    }
  };

  const handleReminderModalDismiss = () => {
    setReminderModalVisible(false);
    if (pendingExitActionRef.current) {
      const action = pendingExitActionRef.current;
      pendingExitActionRef.current = null;
      action();
    }
  };

  return (
    <View style={styles.safe}>
      <AnimatedBackground />
      <SafeAreaView edges={['top']} style={styles.headerContainer}>
        <ScreenHeader
          title={chapter ? `Chapter ${chapter}` : 'Krishna Uvacha'}
          subtitle={chapterName}
          onBack={() => handleBackOrExit(() => navigation.goBack())}
          right={
            <View style={styles.headerRight}>
              <View style={styles.langToggle}>
                {(['en', 'hi'] as Lang[]).map(l => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => handleLanguageChange(l)}
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

        {/* Video-style Progress Bar at top of feed: synchronized dynamically with audio */}
        {isAutoScroll && (
          <VerseProgressBar
            key={`${currentVerse?.id || 'verse-progress'}-${lang}-${currentIndex}`}
            duration={verseDuration}
            isPaused={isPaused}
            isActive={isAutoScroll}
            isSpeaking={!isMuted && speakingId === currentVerse?.id}
            onComplete={handleVerseComplete}
          />
        )}
      </SafeAreaView>

      <View style={styles.listContainer} onLayout={e => setListHeight(e.nativeEvent.layout.height)}>
        <FlatList
          ref={flatListRef}
          data={verses}
          extraData={{ currentIndex, isPaused, lang, isAutoScroll, bookmarks, speakingId }}
          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollToIndexFailed={info => {
            flatListRef.current?.scrollToOffset({
              offset: info.index * itemHeight,
              animated: true,
            });
          }}
          removeClippedSubviews
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          renderItem={({ item, index }) => (
            <VerseItem
              verse={item}
              lang={lang}
              isBookmarked={!!bookmarks[item.id]}
              isSpeaking={!isMuted && speakingId === item.id}
              isAutoScroll={isAutoScroll}
              isActive={index === currentIndex}
              isPaused={isPaused}
              onToggleBookmark={() => toggleBookmark(item)}
              onShare={() => onShare(item)}
              onToggleSpeech={() => toggleSpeech(item)}
              onToggleAutoScroll={toggleAutoScroll}
              onTogglePause={togglePause}
              itemHeight={itemHeight}
            />
          )}
        />

        {/* Floating Tap-to-Pause / Resume Feedback Overlay */}
        {showFeedback && (
          <Animated.View style={[styles.feedbackOverlay, feedbackAnimatedStyle]} pointerEvents="none">
            <View style={styles.feedbackCircle}>
              {isPaused ? (
                <Pause color="#FFFFFF" size={30} />
              ) : (
                <Play color="#FFFFFF" size={30} fill="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </View>
            <AppText variant="caption" color="#FFFFFF" style={styles.feedbackText}>
              {isPaused ? 'Paused' : 'Playing'}
            </AppText>
          </Animated.View>
        )}
      </View>

      {/* Daily Reminder Prompt Modal */}
      <DailyReminderModal
        visible={reminderModalVisible}
        onDismiss={handleReminderModalDismiss}
        nextVerseId={currentVerse?.id || '1.1'}
      />

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
    borderWidth: 0,
    borderColor: 'transparent',
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
    alignItems: 'stretch',
  },
  verseScroll: {
    flex: 1,
  },
  versePressable: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  verseItemContent: {
    flexGrow: 1,
    justifyContent: 'space-evenly',
    paddingVertical: SPACING.sm,
  },
  body: {
    marginHorizontal: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: ROUNDNESS.xl,
    padding: SPACING.lg,
    borderWidth: 0,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  interpretationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  interpretationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  interpretationHeading: {
    fontSize: 17,
  },
  quoteBlock: {
    borderLeftWidth: 3.5,
    borderLeftColor: COLORS.primary,
    paddingLeft: SPACING.md,
    marginVertical: SPACING.xs,
  },
  translationText: {
    fontSize: 17,
    lineHeight: 27,
    color: COLORS.text,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  feedbackCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  feedbackText: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: ROUNDNESS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
