import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme';

export default function RootNavigator() {
  const { token, isReady, loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashTitle}>Acro-In</Text>
        <Text style={styles.splashSubtitle}>Acropolis Institute</Text>
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  splashSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
});
