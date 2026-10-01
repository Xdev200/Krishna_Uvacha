import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Compass, BookOpen, Bookmark } from 'lucide-react-native';
import { AppText } from '../common/AppText';
import { COLORS, SHADOWS } from '../../theme/tokens';
import { AppNavigation, RootStackParamList } from '../../types/navigation';

export type TabName = 'Home' | 'Journey' | 'Feed' | 'Saved';

interface TabConfig {
  name: TabName;
  label: string;
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
  Icon: React.ComponentType<{ color: string; size: number }>;
}

const TABS: TabConfig[] = [
  { name: 'Home',    label: 'HOME',    screen: 'Home',      Icon: Home },
  { name: 'Journey', label: 'JOURNEY', screen: 'Journey',   Icon: Compass },
  { name: 'Feed',    label: 'FEED',    screen: 'Reader',    Icon: BookOpen },
  { name: 'Saved',   label: 'SAVED',   screen: 'Bookmarks', Icon: Bookmark },
];

interface BottomTabBarProps {
  active: TabName;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ active }) => {
  const navigation = useNavigation<AppNavigation>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 20), height: 75 + insets.bottom }]}>
      {TABS.map(({ name, label, screen, params, Icon }) => {
        const isActive = name === active;
        const color = isActive ? COLORS.primary : COLORS.textMuted;
        return (
          <TouchableOpacity
            key={name}
            style={styles.tab}
            onPress={() => navigation.navigate(screen as any, params as any)}
            activeOpacity={0.7}
          >
            <Icon color={color} size={24} />
            <AppText variant="caption" color={color} style={styles.label}>
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    paddingTop: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...SHADOWS.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: -8,
  },
  label: {
    marginTop: 4,
  },
});
