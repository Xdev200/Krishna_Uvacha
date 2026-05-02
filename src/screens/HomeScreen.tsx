import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, BookOpen } from 'lucide-react-native';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { HomeActionCard } from '../components/cards/HomeActionCard';
import { GradientView } from '../components/common/GradientView';
import { COLORS, SPACING, ROUNDNESS } from '../theme/tokens';
import { useGita } from '../hooks/useGita';

const BROWSE_WATERMARK =
  'धर्मक्षेत्रे कुरुक्षेत्रे\nसमवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव\nकिमकुर्वत सञ्जय';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { getRandomVerses } = useGita();

  const handleShuffle = () => {
    const [verse] = getRandomVerses(1);
    if (verse) navigation.navigate('Reader', { verseId: verse.id, isShuffle: true });
  };

  const handleBrowse = () => navigation.navigate('Chapters');

  // Load hero images
  const krishnaImage = require('../../assets/krishna.png');
  const chaptersImage = require('../../assets/chapters.png');

  return (
    <View style={styles.safe}>
      <SafeAreaView edges={['top']}>
        <ScreenHeader title="Krishna Uvaach" showStreak streakCount={7} />
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
    paddingBottom: 100, // Account for bottom tab bar
  },
  cards: {
    paddingHorizontal: SPACING.md,
  },
});
