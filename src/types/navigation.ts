import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Journey: undefined;
  Chapters: undefined;
  Bookmarks: undefined;
  Reader: { verseId?: string; chapter?: number };
};

export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
export type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;
