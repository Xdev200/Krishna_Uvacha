import React, { ReactNode, useMemo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { COLORS } from '../../theme/tokens';

let _id = 0;

interface GradientViewProps {
  style?: ViewStyle;
  children?: ReactNode;
  startColor?: string;
  endColor?: string;
  /** 'diagonal' (default) | 'vertical' | 'horizontal' */
  direction?: 'diagonal' | 'vertical' | 'horizontal';
}

const COORDS = {
  diagonal:   { x1: '0', y1: '0', x2: '1', y2: '1' },
  vertical:   { x1: '0', y1: '0', x2: '0', y2: '1' },
  horizontal: { x1: '0', y1: '0', x2: '1', y2: '0' },
};

export const GradientView: React.FC<GradientViewProps> = ({
  style,
  children,
  startColor = COLORS.gradientWarm,
  endColor = COLORS.gradientCool,
  direction = 'diagonal',
}) => {
  const id = useMemo(() => `gv_${_id++}`, []);

  return (
    <View style={[styles.root, style]}>
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
  },
});
