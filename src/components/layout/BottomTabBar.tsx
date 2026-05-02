import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../common/AppText';
import { COLORS, SPACING, ROUNDNESS, SHADOWS } from '../../theme/tokens';
import { Home, BookOpen, Bookmark } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export type TabName = 'Home' | 'Feed' | 'Saved';

interface TabConfig {
  name: TabName;
  label: string;
  screen: string;
  params?: any;
  Icon: React.ComponentType<{ color: string; size: number }>;
}

const TABS: TabConfig[] = [
  { name: 'Home',  label: 'HOME',  screen: 'Home',      Icon: Home },
  { name: 'Feed',  label: 'FEED',  screen: 'Reader',    Icon: BookOpen, params: { isShuffle: true } },
  { name: 'Saved', label: 'SAVED', screen: 'Bookmarks', Icon: Bookmark },
];

interface BottomTabBarProps {
  active: TabName;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ active }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.bar}>
      {TABS.map(({ name, label, screen, params, Icon }) => {
        const isActive = name === active;
        const color = isActive ? COLORS.primary : COLORS.textMuted;
        return (
          <TouchableOpacity
            key={name}
            style={styles.tab}
            onPress={() => navigation.navigate(screen, params)}
            activeOpacity={0.7}
          >
            <Icon color={color} size={24} />
            <AppText variant="caption" color={color} style={styles.label}>
              {label}
            </AppText>
            {isActive && <View style={styles.dot} />}
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
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    paddingBottom: 25,
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
