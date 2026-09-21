import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useAppFonts } from './src/hooks/useAppFonts';
import { HomeScreen } from './src/screens/HomeScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { ChapterBrowserScreen } from './src/screens/ChapterBrowserScreen';
import { BookmarksScreen } from './src/screens/BookmarksScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { COLORS } from './src/theme/tokens';
import { RootStackParamList } from './src/types/navigation';
import { notificationService } from './src/services/notificationService';
import { dbService } from './src/services/dbService';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const fontsLoaded = useAppFonts();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  useEffect(() => {
    notificationService.init();

    // Check whether user has completed onboarding / set goal
    dbService.hasCompletedOnboarding().then(completed => {
      setShowOnboarding(!completed);
      setIsCheckingOnboarding(false);
    });

    // Listen for notification taps
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.verseId && navigationRef.isReady()) {
        navigationRef.navigate('Reader', { verseId: data.verseId as string });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigationRef]);

  if (!fontsLoaded || isCheckingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <Stack.Navigator id="root" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Journey" component={JourneyScreen} />
        <Stack.Screen name="Chapters" component={ChapterBrowserScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
