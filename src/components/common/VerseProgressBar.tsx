import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../../theme/tokens';

interface VerseProgressBarProps {
  duration: number; // Duration in milliseconds
  isPaused: boolean;
  isActive: boolean;
  isSpeaking?: boolean;
  onComplete: () => void;
}

/**
 * Animated progress bar indicating time remaining on current verse.
 * Displays like a video/story progress bar at the top of the feed viewport.
 * Non-draggable, reacts smoothly to pause/resume states.
 */
export const VerseProgressBar: React.FC<VerseProgressBarProps> = ({
  duration,
  isPaused,
  isActive,
  isSpeaking = false,
  onComplete,
}) => {
  const progress = useSharedValue(0);
  const startTime = useRef<number>(Date.now());
  const elapsedBeforePause = useRef<number>(0);
  const completedRef = useRef(false);

  useEffect(() => {
    completedRef.current = false;

    if (!isActive) {
      cancelAnimation(progress);
      progress.value = 0;
      elapsedBeforePause.current = 0;
      return;
    }

    if (isPaused) {
      // Pause: cancel animation and record elapsed time
      cancelAnimation(progress);
      const now = Date.now();
      elapsedBeforePause.current += now - startTime.current;
    } else {
      // Start or Resume
      startTime.current = Date.now();
      const remainingTime = Math.max(100, duration - elapsedBeforePause.current);
      const targetProgress = isSpeaking ? 0.98 : 1;

      progress.value = withTiming(
        targetProgress,
        {
          duration: remainingTime,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished && !isSpeaking && !completedRef.current) {
            completedRef.current = true;
            runOnJS(onComplete)();
          }
        }
      );
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [isActive, isPaused, duration, isSpeaking, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.min(100, Math.max(0, progress.value * 100))}%`,
    };
  });

  if (!isActive) return null;

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, animatedStyle, isPaused && styles.fillPaused]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 3.5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  fillPaused: {
    backgroundColor: COLORS.accentOrange,
    opacity: 0.8,
  },
});
