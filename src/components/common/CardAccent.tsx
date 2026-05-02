import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/tokens';

export const CardAccent: React.FC = () => <View style={styles.line} />;

const styles = StyleSheet.create({
  line: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 12,
  },
});
