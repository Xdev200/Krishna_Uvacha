import React, { useState, useEffect, useRef } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { AppText } from './AppText';
import { TYPOGRAPHY } from '../../theme/tokens';

interface TypewriterTextProps {
  text: string;
  isActive?: boolean;
  isPaused?: boolean;
  speed?: number; // ms per character
  delay?: number; // delay before typing starts in ms
  onComplete?: () => void;
  style?: StyleProp<TextStyle>;
  variant?: keyof typeof TYPOGRAPHY;
  color?: string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  centered?: boolean;
}

/**
 * TypewriterText reveals text character-by-character with smooth cadence.
 * When inactive (!isActive), it remains clean and empty (0 characters) so sequential
 * animations never prematurely flash or display text before their turn.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  isActive = true,
  isPaused = false,
  speed = 28,
  delay = 0,
  onComplete,
  style,
  variant = 'body',
  color,
  numberOfLines,
  adjustsFontSizeToFit,
  minimumFontScale,
  centered,
}) => {
  const [displayedCount, setDisplayedCount] = useState<number>(0);
  const countRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const delayDoneRef = useRef<boolean>(delay === 0);
  const completedRef = useRef<boolean>(false);

  // Reset when text changes or isActive changes
  useEffect(() => {
    if (!isActive) {
      setDisplayedCount(0);
      countRef.current = 0;
      completedRef.current = false;
      delayDoneRef.current = delay === 0;
      return;
    }

    // Active: initialize or restart typing
    countRef.current = 0;
    setDisplayedCount(0);
    completedRef.current = false;
    lastTimeRef.current = Date.now();
    delayDoneRef.current = delay === 0;

    let delayTimer: NodeJS.Timeout | null = null;
    if (delay > 0) {
      delayTimer = setTimeout(() => {
        delayDoneRef.current = true;
        lastTimeRef.current = Date.now();
      }, delay);
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [text, isActive, delay]);

  // Character increment loop
  useEffect(() => {
    if (!isActive || isPaused || completedRef.current) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const step = () => {
      if (!delayDoneRef.current) {
        animFrameRef.current = requestAnimationFrame(step);
        return;
      }

      const now = Date.now();
      const delta = now - lastTimeRef.current;

      if (delta >= speed) {
        const charsToAdd = Math.max(1, Math.floor(delta / speed));
        lastTimeRef.current = now;

        const nextCount = Math.min(text.length, countRef.current + charsToAdd);
        countRef.current = nextCount;
        setDisplayedCount(nextCount);

        if (nextCount >= text.length) {
          completedRef.current = true;
          if (onComplete) onComplete();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isActive, isPaused, speed, text.length, onComplete]);

  const displayedText = text.slice(0, displayedCount);

  // If inactive and not started, return clean text component (or empty)
  if (!isActive && displayedCount === 0) {
    return (
      <AppText
        variant={variant}
        color={color}
        style={style}
        numberOfLines={numberOfLines}
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        minimumFontScale={minimumFontScale}
        centered={centered}
      >
        {""}
      </AppText>
    );
  }

  return (
    <AppText
      variant={variant}
      color={color}
      style={style}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      centered={centered}
    >
      {displayedText}
    </AppText>
  );
};
