import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  Easing,
  interpolate
} from 'react-native-reanimated';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../theme/tokens';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

/**
 * A subtle, elegant peacock feather SVG component.
 * Symbol of Krishna.
 */
const PeacockFeather = ({ delay = 0, style }: { delay?: number; style?: any }) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-30, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(10, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.45, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingProp, animatedStyle, style]}>
      <Svg width="120" height="180" viewBox="0 0 120 180">
        <Path
          d="M60 180C60 180 55 120 60 80C65 40 100 20 60 0C20 20 55 40 60 80C65 120 60 180 60 180Z"
          fill={COLORS.secondary}
          opacity="0.4"
        />
        <Path
          d="M60 70C75 70 85 55 85 40C85 25 75 10 60 10C45 10 35 25 35 40C35 55 45 70 60 70Z"
          fill={COLORS.primary}
          opacity="0.6"
        />
        <Path
          d="M60 60C68 60 75 50 75 40C75 30 68 20 60 20C52 20 45 30 45 40C45 50 52 60 60 60Z"
          fill={COLORS.gold}
          opacity="0.8"
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * A subtle lotus petal SVG component.
 */
const LotusPetal = ({ delay = 0, style }: { delay?: number; style?: any }) => {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(40, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(-15, { duration: 7000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingProp, animatedStyle, style]}>
      <Svg width="60" height="80" viewBox="0 0 60 80">
        <Path
          d="M30 80C30 80 0 50 0 30C0 10 15 0 30 0C45 0 60 10 60 30C60 50 30 80 30 80Z"
          fill={COLORS.primary}
          opacity="0.3"
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * A subtle flute SVG component.
 */
const Flute = ({ delay = 0, style }: { delay?: number; style?: any }) => {
  const rotate = useSharedValue(-15);
  const translateY = useSharedValue(0);

  useEffect(() => {
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-20, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { translateY: translateY.value }
    ],
    opacity: 0.35,
  }));

  return (
    <Animated.View style={[styles.floatingProp, animatedStyle, style]}>
      <Svg width="200" height="40" viewBox="0 0 200 40">
        <Path
          d="M10 20 L190 20"
          stroke={COLORS.primary}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {[30, 50, 70, 90, 110, 130].map(x => (
          <Path
            key={x}
            d={`M${x} 15 L${x} 25`}
            stroke={COLORS.sanskrit}
            strokeWidth="2"
          />
        ))}
      </Svg>
    </Animated.View>
  );
};

/**
 * A subtle Om symbol SVG component.
 */
const OmSymbol = ({ delay = 0, style }: { delay?: number; style?: any }) => {
  const opacity = useSharedValue(0.12);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0.25, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.floatingProp, animatedStyle, style]}>
      <Svg width="150" height="150" viewBox="0 0 100 100">
        <Path
          d="M50 10C35 10 25 20 25 35C25 50 40 60 50 75C60 60 75 50 75 35C75 20 65 10 50 10Z"
          fill={COLORS.gold}
          opacity="0.3"
        />
        <Path
          d="M50 35C55 35 60 30 60 25C60 20 55 15 50 15C45 15 40 20 40 25C40 30 45 35 50 35Z"
          fill={COLORS.gold}
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * Light Animated Background for the Reader Screen.
 */
export const AnimatedBackground: React.FC = () => {
  const bgScale = useSharedValue(1.1);
  const bgTranslateX = useSharedValue(0);
  const bgTranslateY = useSharedValue(0);

  useEffect(() => {
    bgScale.value = withRepeat(
      withTiming(1.2, { duration: 20000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    bgTranslateX.value = withRepeat(
      withTiming(20, { duration: 25000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    bgTranslateY.value = withRepeat(
      withTiming(20, { duration: 30000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bgScale.value },
      { translateX: bgTranslateX.value },
      { translateY: bgTranslateY.value },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Premium Background Image */}
      <Animated.Image
        source={require('../../../assets/reader_bg.png')}
        style={[StyleSheet.absoluteFill, bgAnimatedStyle]}
        resizeMode="cover"
      />

      {/* Subtle Overlay Gradient to ensure text readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.background, opacity: 0.55 }]} />

      {/* Floating Elements (Overlays) */}
      <PeacockFeather 
        delay={0} 
        style={{ top: '10%', left: '-5%', transform: [{ scale: 0.8 }] }} 
      />
      <PeacockFeather 
        delay={4000} 
        style={{ bottom: '15%', right: '-10%', transform: [{ scale: 1.0 }, { rotate: '160deg' }] }} 
      />
      
      <LotusPetal 
        delay={1000} 
        style={{ top: '8%', right: '12%', transform: [{ scale: 0.7 }] }} 
      />
      <LotusPetal 
        delay={5000} 
        style={{ top: '60%', left: '8%', transform: [{ scale: 0.5 }] }} 
      />
      <LotusPetal 
        delay={2500} 
        style={{ bottom: '35%', right: '15%', transform: [{ scale: 0.6 }] }} 
      />

      <Flute 
        delay={1500} 
        style={{ top: '40%', right: '-15%' }} 
      />

      <Flute 
        delay={4500} 
        style={{ bottom: '45%', left: '-10%', transform: [{ rotate: '45deg' }] }} 
      />

      <OmSymbol 
        delay={2000} 
        style={{ top: '30%', left: '30%' }} 
      />

      {/* Decorative Aura Rays (Subtle) */}
      <View style={styles.auraContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 400 400">
           <Path
             d="M200 200 L400 0 M200 200 L400 400 M200 200 L0 400 M200 200 L0 0"
             stroke={COLORS.gold}
             strokeWidth="0.5"
             opacity="0.25"
           />
        </Svg>
      </View>
    </View>
  );
};

/**
 * Light parchment background for the Bookmarks screen.
 * Uses lotus and Om motifs — quieter than the Reader background.
 */
export const BookmarksBackground: React.FC = () => {
  const bgScale = useSharedValue(1.05);
  const bgTranslateX = useSharedValue(0);

  useEffect(() => {
    bgScale.value = withRepeat(
      withTiming(1.12, { duration: 25000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    bgTranslateX.value = withRepeat(
      withTiming(15, { duration: 30000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bgScale.value },
      { translateX: bgTranslateX.value },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Image
        source={require('../../../assets/bookmarks_bg.png')}
        style={[StyleSheet.absoluteFill, bgAnimatedStyle]}
        resizeMode="cover"
      />

      {/* Very light wash to maintain contrast with list items */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.background, opacity: 0.5 }]} />

      <LotusPetal
        delay={0}
        style={{ top: '10%', left: '-5%', transform: [{ scale: 0.8 }] }}
      />
      <LotusPetal
        delay={4000}
        style={{ bottom: '25%', right: '-10%', transform: [{ scale: 0.6 }, { rotate: '45deg' }] }}
      />

      <OmSymbol
        delay={2000}
        style={{ top: '35%', left: '30%' }}
      />

      {/* Subtle decorative aura */}
      <View style={styles.auraContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 400 400">
           <Path
             d="M200 200 L400 0 M200 200 L400 400 M200 200 L0 400 M200 200 L0 0"
             stroke={COLORS.gold}
             strokeWidth="0.4"
             opacity="0.15"
           />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    zIndex: -1,
  },
  floatingProp: {
    position: 'absolute',
  },
  auraContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
  }
});
