import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Animated } from 'react-native';
import { Flower } from 'lucide-react-native';
import { AppText } from '../components/common/AppText';
import { COLORS, SPACING } from '../theme/tokens';

const { height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);

    const spinLoop = Animated.loop(
      Animated.timing(spinValue, { toValue: 1, duration: 1500, useNativeDriver: true })
    );
    spinLoop.start();

    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(logoScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(1500),
      Animated.timing(footerOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    return () => {
      clearTimeout(timer);
      spinLoop.stop();
    };
  }, [onFinish]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }, { rotate: spin }] },
        ]}
      >
        <Flower color={COLORS.primary} size={80} strokeWidth={1} />
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          { opacity: textOpacity, transform: [{ translateY: textTranslateY }] },
        ]}
      >
        <AppText variant="headline" color={COLORS.primary} centered style={styles.title}>
          Krishna Uvaach
        </AppText>
        <AppText variant="label" color={COLORS.tertiary} centered style={styles.subtitle}>
          SACRED CLARITY
        </AppText>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <AppText variant="label" color={COLORS.textMuted} centered>
          Bhagavad Gita • Offline Wisdom
        </AppText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    letterSpacing: 6,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: height * 0.1,
  },
});
