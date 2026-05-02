import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, BookOpen } from 'lucide-react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { HomeActionCard } from '../components/cards/HomeActionCard';
import { COLORS, SPACING, LAYOUT } from '../theme/tokens';
import { useGita } from '../hooks/useGita';
import { useStreak } from '../hooks/useStreak';
import { AppNavigation } from '../types/navigation';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigation>();
  const { getRandomVerses } = useGita();
  const streak = useStreak();

  const handleShuffle = () => {
    const [verse] = getRandomVerses(1);
    if (verse) navigation.navigate('Reader', { verseId: verse.id, isShuffle: true });
  };

  const handleBrowse = () => navigation.navigate('Chapters');

  const krishnaImage = require('../../assets/shuffle_shlok.png');
  const chaptersImage = require('../../assets/browse_chapters.png');

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']}>
        <ScreenHeader title="Krishna Uvaach" showStreak streakCount={streak} />
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cards}>
          <HomeActionCard
            title="Shuffle Shlok"
            description="Discover a random verse from the Gita and find guidance for your current moment."
            icon={<Sparkles color={COLORS.surface} size={22} />}
            headerImage={krishnaImage}
            onPress={handleShuffle}
          />

          <HomeActionCard
            title="Browse Chapters"
            description="Read the Gita verse by verse through all 18 chapters of divine conversation."
            icon={<BookOpen color={COLORS.surface} size={22} />}
            headerImage={chaptersImage}
            onPress={handleBrowse}
          />
        </View>
      </ScrollView>

      <BottomTabBar active="Home" />
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: SPACING.xs,
    paddingBottom: LAYOUT.tabBarHeight + SPACING.xl,
  },
  cards: {
    paddingHorizontal: SPACING.md,
  },
});
