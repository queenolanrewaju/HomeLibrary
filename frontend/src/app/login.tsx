import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const theme = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      // On success the user becomes non-null, and the Stack.Protected guard moves us to the tabs.
      if (isRegister) await register(name, email, password);
      else await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
          <ThemedText type="title">{isRegister ? 'Create account' : 'Log in'}</ThemedText>

          {isRegister && (
            <TextInput style={inputStyle} placeholder="Name" placeholderTextColor={theme.textSecondary} value={name} onChangeText={setName} />
          )}
          <TextInput
            style={inputStyle}
            placeholder="Email"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={inputStyle}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={submit}
          />

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}

          <Pressable style={[styles.button, { backgroundColor: theme.text }]} onPress={submit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <ThemedText style={{ color: theme.background }}>{isRegister ? 'Sign up' : 'Log in'}</ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => { setMode(isRegister ? 'login' : 'register'); setError(null); }}>
            <ThemedText type="link">{isRegister ? 'Already have an account? Log in' : 'No account? Sign up'}</ThemedText>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: 400, justifyContent: 'center', paddingHorizontal: Spacing.four },
  form: { gap: Spacing.three },
  input: { padding: Spacing.three, borderRadius: Spacing.two, fontSize: 16 },
  button: { padding: Spacing.three, borderRadius: Spacing.two, alignItems: 'center' },
  error: { color: '#d93025' },
});
