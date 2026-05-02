import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { TYPOGRAPHY, COLORS } from '../../theme/tokens';

interface AppTextProps extends TextProps {
  variant?: keyof typeof TYPOGRAPHY;
  color?: string;
  centered?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = COLORS.text,
  centered = false,
  style,
  children,
  ...props
}) => {
  const typography = TYPOGRAPHY[variant];
  
  return (
    <Text
      style={[
        {
          ...typography,
          color: color,
          textAlign: centered ? 'center' : 'left',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
