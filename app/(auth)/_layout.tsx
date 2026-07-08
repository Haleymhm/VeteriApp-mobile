import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function AuthLayout() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
